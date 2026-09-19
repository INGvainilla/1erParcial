import 'dart:io';
import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:provider/provider.dart';
import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:fashionstore_mobile/core/models/catalogo_item.dart';
import 'package:fashionstore_mobile/core/providers/carrito_provider.dart';
import 'package:fashionstore_mobile/core/providers/gamificacion_provider.dart';
import 'package:fashionstore_mobile/core/services/pose_detector_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/ar_viewer/models/garment_anchor_model.dart';
import 'package:fashionstore_mobile/modules/ar_viewer/widgets/ar_wearable_garment.dart';
import 'package:fashionstore_mobile/modules/ar_viewer/widgets/garment_ar_painter.dart';
import 'package:fashionstore_mobile/modules/ar_viewer/widgets/pose_skeleton_painter.dart';

class VestidorArScreen extends StatefulWidget {
  final PrendaCatalogo prenda;
  final PrendaColor? initialColor;
  final PrendaTalla? initialTalla;

  const VestidorArScreen({
    Key? key,
    required this.prenda,
    this.initialColor,
    this.initialTalla,
  }) : super(key: key);

  @override
  State<VestidorArScreen> createState() => _VestidorArScreenState();
}

class _VestidorArScreenState extends State<VestidorArScreen>
    with TickerProviderStateMixin, WidgetsBindingObserver {
  // Servicio de detección y seguimiento esquelético en tiempo real (Google ML Kit en dispositivo)
  final PoseDetectorService _poseDetectorService = PoseDetectorService();
  DetectedSkeleton _skeleton = DetectedSkeleton.empty();
  bool _isStreamingFrames = false;
  bool _procesandoFrame = false;
  bool _showDebugSkeleton = true; // Por defecto activo para verificar tracking y anclajes afines
  bool _modoManualForzado = false;

  // ── Etapa 4: Gestión temporal de pérdida y recuperación de tracking ──
  DateTime? _lastTrackingTimestamp;
  bool _trackingLost = false;
  // Estados de tracking para el HUD:
  // 0 = ACTIVO, 1 = BUSCANDO (sin body, <1.5s), 2 = PERDIDO (>1.5s), 3 = RECONECTANDO (transición)
  int _trackingState = 1;

  // Notificadores y Ticker de alto rendimiento a 60 FPS (sin rebuild de widgets)
  late final ValueNotifier<GarmentPoseState> _garmentPoseNotifier;
  late final ValueNotifier<DetectedSkeleton> _skeletonNotifier;
  late final Ticker _renderTicker;
  Duration _lastTickElapsed = Duration.zero;

  // Estado cinemático interpolado y objetivo
  GarmentPoseState _currentPose = GarmentPoseState.initial(const Size(400, 800));
  GarmentPoseState _targetPose = GarmentPoseState.initial(const Size(400, 800));
  final GarmentAnchors _garmentAnchors = const GarmentAnchors();

  // Imagen cargada de la prenda en formato ui.Image para canvas acelerado
  ui.Image? _garmentUiImage;
  bool _cargandoImagen = false;
  double _manualBaseScale = 1.0;

  // Estado de la cámara física
  List<CameraDescription> _cameras = [];
  CameraController? _cameraController;
  bool _cameraIniciada = false;
  bool _cameraError = false;
  String _cameraErrorMsg = '';
  int _selectedCameraIndex = 0;

  // Ajustes de la prenda
  Offset _manualOffset = Offset.zero;
  double _manualScale = 1.0;
  int _modoIluminacion = 0; // 0: Boutique Cálida, 1: Luz Solar Natural, 2: Noche / Gala
  bool _bonoOtorgado = false;
  bool _capturandoFoto = false;

  late PrendaColor _colorSeleccionado;
  late String _tallaSeleccionada;

  final List<String> _iluminaciones = [
    'Boutique Cálida',
    'Luz Solar Natural',
    'Noche & Gala',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    // Bloquear orientación vertical estricta para visión por computadora estable
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

    _colorSeleccionado = widget.initialColor ??
        (widget.prenda.colores.isNotEmpty
            ? widget.prenda.colores.first
            : PrendaColor(idColor: 0, nombre: 'Original', codigoHex: '#1B2A47'));
    _tallaSeleccionada = widget.initialTalla?.talla ??
        (widget.prenda.tallas.isNotEmpty ? widget.prenda.tallas.first.talla : 'M');

    // Notificadores reactivos
    _garmentPoseNotifier = ValueNotifier<GarmentPoseState>(_currentPose);
    _skeletonNotifier = ValueNotifier<DetectedSkeleton>(_skeleton);

    // Iniciar loop cinemático a 60 FPS con interpolación suave
    _renderTicker = createTicker(_onRenderTick)..start();

    // Inicializar detector de poses ML Kit en modo stream
    _poseDetectorService.initialize();

    // Cargar imagen de la prenda en formato nativo ui.Image
    _cargarImagenWearable();

    // Inicializar cámara del móvil con formato NV21 (Android)
    _inicializarCamara();

    // Otorgar bono de gamificación (CU19 & CU21)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _otorgarBonoRa();
    });
  }

  Future<void> _inicializarCamara() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        if (mounted) {
          setState(() {
            _cameraError = true;
            _cameraErrorMsg = 'No se detectaron cámaras en el dispositivo.';
          });
        }
        return;
      }

      // Priorizar cámara frontal (Modo Espejo)
      int cameraIndex = _cameras.indexWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
      );
      if (cameraIndex == -1) cameraIndex = 0;
      _selectedCameraIndex = cameraIndex;

      final controller = CameraController(
        _cameras[_selectedCameraIndex],
        ResolutionPreset.medium, // ~640x480: Balance óptimo de FPS y precisión
        enableAudio: false,
        imageFormatGroup: Platform.isAndroid ? ImageFormatGroup.nv21 : ImageFormatGroup.bgra8888,
      );

      await controller.initialize();
      if (!mounted) return;

      setState(() {
        _cameraController = controller;
        _cameraIniciada = true;
        _cameraError = false;
      });

      _iniciarImageStream();
    } catch (e) {
      if (mounted) {
        setState(() {
          _cameraError = true;
          _cameraErrorMsg = 'Error al inicializar cámara: $e';
        });
      }
    }
  }

  void _iniciarImageStream() {
    final controller = _cameraController;
    if (controller == null || !controller.value.isInitialized || _isStreamingFrames) return;

    _isStreamingFrames = true;
    controller.startImageStream((CameraImage image) async {
      // Descartar frame si ya hay una inferencia de pose ejecutándose
      if (_procesandoFrame || !mounted) return;
      _procesandoFrame = true;

      final screenSize = MediaQuery.of(context).size;
      final orientation = MediaQuery.of(context).orientation == Orientation.portrait
          ? DeviceOrientation.portraitUp
          : DeviceOrientation.landscapeLeft;

      try {
        final skel = await _poseDetectorService.processFrame(
          image: image,
          camera: _cameras[_selectedCameraIndex],
          deviceOrientation: orientation,
          screenSize: screenSize,
        );

        if (mounted && skel != null) {
          _skeleton = skel;
          _skeletonNotifier.value = skel;
          _actualizarTargetPose(skel, screenSize);
        }
      } catch (_) {
        // Ignorar fallos transitorios de frame
      } finally {
        _procesandoFrame = false;
      }
    });
  }

  /// Ticker loop a 60 FPS: interpolación suave continua hacia la pose objetivo
  void _onRenderTick(Duration elapsed) {
    if (_lastTickElapsed == Duration.zero) {
      _lastTickElapsed = elapsed;
      return;
    }
    final dt = (elapsed - _lastTickElapsed).inMicroseconds / 1000000.0;
    _lastTickElapsed = elapsed;
    if (dt <= 0.0 || dt > 0.1) return;

    // LERP exponencial continuo a 60 FPS (lambda = 18.0)
    final alpha = (1.0 - math.exp(-18.0 * dt)).clamp(0.02, 1.0);
    _currentPose = _currentPose.lerpTo(_targetPose, alpha);
    _garmentPoseNotifier.value = _currentPose;
  }

  /// Carga asíncrona del modelo wearable con canal alfa en formato ui.Image
  Future<void> _cargarImagenWearable() async {
    if (_cargandoImagen) return;
    _cargandoImagen = true;
    try {
      final assetPath = _obtenerAssetModeloWearable();
      final byteData = await rootBundle.load(assetPath);
      final codec = await ui.instantiateImageCodec(byteData.buffer.asUint8List());
      final frame = await codec.getNextFrame();
      if (mounted) {
        setState(() {
          _garmentUiImage = frame.image;
        });
      }
    } catch (e) {
      debugPrint('Error precargando asset wearable ui.Image: $e');
    } finally {
      _cargandoImagen = false;
    }
  }

  String _obtenerAssetModeloWearable() {
    final nombreLower = widget.prenda.nombre.toLowerCase();

    if (nombreLower.contains('camisa') ||
        nombreLower.contains('shirt') ||
        nombreLower.contains('lino') ||
        (widget.prenda.nombreCategoria?.toLowerCase().contains('camisa') ?? false)) {
      return 'assets/ar_models/camisa_lino_wearable.png';
    }

    if (nombreLower.contains('traje') ||
        nombreLower.contains('blazer') ||
        nombreLower.contains('smoking') ||
        nombreLower.contains('saco') ||
        (widget.prenda.nombreCategoria?.toLowerCase().contains('traje') ?? false)) {
      return 'assets/ar_models/traje_ejecutivo_wearable.png';
    }

    return 'assets/ar_models/camisa_lino_wearable.png';
  }

  /// Cinemática de pose objetivo: hombros, torso, inclinación y largo estimado.
  /// Etapa 4: Gestión temporal de pérdida de tracking con fade-out progresivo
  /// y recuperación automática con fade-in.
  void _actualizarTargetPose(DetectedSkeleton skel, Size screenSize) {
    final sizeScale = _factorEscalaTalla(_tallaSeleccionada);

    if (_modoManualForzado) {
      final cx = (screenSize.width / 2) + _manualOffset.dx;
      final cy = (screenSize.height * 0.38) + _manualOffset.dy;
      final halfW = (screenSize.width * 0.28) * _manualScale;
      final torsoH = halfW * 2 * _garmentAnchors.restTorsoRatio;

      final ls = Offset(cx - halfW, cy);
      final rs = Offset(cx + halfW, cy);

      _targetPose = GarmentPoseState(
        shoulderLeft: ls,
        shoulderRight: rs,
        hemCenter: Offset(cx, cy + torsoH),
        elbowLeft: Offset(cx - halfW * 1.15, cy + torsoH * 0.45),
        wristLeft: Offset(cx - halfW * 1.10, cy + torsoH * 0.85),
        elbowRight: Offset(cx + halfW * 1.15, cy + torsoH * 0.45),
        wristRight: Offset(cx + halfW * 1.10, cy + torsoH * 0.85),
        hasTracking: false,
        opacity: 1.0,
        sizeScale: sizeScale * _manualScale,
      );
      _trackingState = 0; // Manual es como "activo"
      return;
    }

    if (skel.hasBody && skel.leftShoulder != null && skel.rightShoulder != null) {
      // ── CUERPO DETECTADO ──
      _lastTrackingTimestamp = DateTime.now();

      // Recuperación automática: si estábamos en tracking perdido, hacer fade-in
      if (_trackingLost) {
        _trackingLost = false;
        _trackingState = 3; // RECONECTANDO (se resolverá a 0 en el próximo frame con body)
        // Resetear filtros después de una pérdida prolongada para evitar saltos
        _poseDetectorService.resetFilters();
      } else {
        _trackingState = 0; // TRACKING ACTIVO
      }

      final ls = skel.leftShoulder!.screenPosition;
      final rs = skel.rightShoulder!.screenPosition;

      // Ordenar por eje X de la pantalla:
      // screenShoulderLeft siempre corresponde al lado izquierdo visible de la pantalla
      // screenShoulderRight siempre corresponde al lado derecho visible de la pantalla
      // Esto elimina el cruce en "X" provocado por el modo espejo de la cámara frontal
      final screenShoulderLeft = ls.dx < rs.dx ? ls : rs;
      final screenShoulderRight = ls.dx < rs.dx ? rs : ls;

      final shoulderDist = (screenShoulderRight - screenShoulderLeft).distance;
      final shoulderCenter = (screenShoulderLeft + screenShoulderRight) / 2;
      final angle = math.atan2(
        screenShoulderRight.dy - screenShoulderLeft.dy,
        screenShoulderRight.dx - screenShoulderLeft.dx,
      );
      // Vector normal hacia abajo en pantalla (+Y es abajo)
      final normalDown = Offset(-math.sin(angle), math.cos(angle));

      // Dobladillo sastrero elegante limitado anatómicamente a la cintura (nunca baja a las piernas)
      final estimatedTorsoLength = shoulderDist * _garmentAnchors.restTorsoRatio;
      Offset hemCenter;
      if (skel.leftHip != null && skel.rightHip != null) {
        final hipCenter = (skel.leftHip!.screenPosition + skel.rightHip!.screenPosition) / 2;
        final measuredTorsoDist = (hipCenter - shoulderCenter).distance;
        // El saco sastrero termina en el cinturón (~80% de la distancia hombros a cadera)
        final boundedLength = math.min(estimatedTorsoLength, measuredTorsoDist * 0.80);
        hemCenter = shoulderCenter + normalDown * boundedLength;
      } else {
        hemCenter = shoulderCenter + normalDown * estimatedTorsoLength;
      }

      _targetPose = GarmentPoseState(
        shoulderLeft: screenShoulderLeft,
        shoulderRight: screenShoulderRight,
        hemCenter: hemCenter,
        elbowLeft: skel.leftElbow?.screenPosition,
        elbowRight: skel.rightElbow?.screenPosition,
        wristLeft: skel.leftWrist?.screenPosition,
        wristRight: skel.rightWrist?.screenPosition,
        hasTracking: true,
        opacity: 1.0,
        sizeScale: sizeScale,
      );
    } else {
      // ── CUERPO NO DETECTADO: Gestión temporal de pérdida ──
      double fadeOpacity = 1.0;

      if (_lastTrackingTimestamp != null) {
        final elapsedMs = DateTime.now().difference(_lastTrackingTimestamp!).inMilliseconds;

        if (elapsedMs < 300) {
          // Persistencia temporal (micro-pérdida de 1-2 frames): mantener pose completa
          fadeOpacity = 1.0;
          _trackingState = 1; // BUSCANDO
        } else if (elapsedMs < 1500) {
          // Fade-out progresivo lineal: 300ms → 1500ms
          fadeOpacity = 1.0 - ((elapsedMs - 300) / 1200.0);
          fadeOpacity = fadeOpacity.clamp(0.0, 1.0);
          _trackingState = 1; // BUSCANDO
        } else {
          // Tracking perdido completamente
          fadeOpacity = 0.0;
          _trackingLost = true;
          _trackingState = 2; // PERDIDO
          // Resetear filtros después de pérdida prolongada
          _poseDetectorService.resetFilters();
        }
      } else {
        // Nunca hubo tracking
        fadeOpacity = 0.0;
        _trackingState = 1; // BUSCANDO
      }

      _targetPose = GarmentPoseState(
        shoulderLeft: _targetPose.shoulderLeft,
        shoulderRight: _targetPose.shoulderRight,
        hemCenter: _targetPose.hemCenter,
        elbowLeft: _targetPose.elbowLeft,
        elbowRight: _targetPose.elbowRight,
        wristLeft: _targetPose.wristLeft,
        wristRight: _targetPose.wristRight,
        hasTracking: false,
        opacity: fadeOpacity,
        sizeScale: sizeScale,
      );
    }
  }

  Future<void> _detenerImageStream() async {
    final controller = _cameraController;
    if (controller != null && controller.value.isInitialized && _isStreamingFrames) {
      _isStreamingFrames = false;
      try {
        await controller.stopImageStream();
      } catch (_) {}
    }
  }

  Future<void> _cambiarCamara() async {
    if (_cameras.length < 2) return;

    await _detenerImageStream();

    final nextIndex = (_selectedCameraIndex + 1) % _cameras.length;
    await _cameraController?.dispose();
    _cameraController = null;

    // Resetear filtros One Euro al cambiar de cámara (coordenadas cambian)
    _poseDetectorService.resetFilters();

    setState(() {
      _cameraIniciada = false;
      _selectedCameraIndex = nextIndex;
      _skeleton = DetectedSkeleton.empty();
      _trackingLost = false;
      _lastTrackingTimestamp = null;
      _trackingState = 1;
    });

    try {
      final controller = CameraController(
        _cameras[_selectedCameraIndex],
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: Platform.isAndroid ? ImageFormatGroup.nv21 : ImageFormatGroup.bgra8888,
      );
      await controller.initialize();
      if (mounted) {
        setState(() {
          _cameraController = controller;
          _cameraIniciada = true;
        });
        _iniciarImageStream();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _cameraError = true;
          _cameraErrorMsg = 'Error al cambiar de cámara: $e';
        });
      }
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final CameraController? cameraController = _cameraController;
    if (cameraController == null || !cameraController.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      _detenerImageStream();
      cameraController.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _inicializarCamara();
    }
  }

  void _otorgarBonoRa() {
    if (!_bonoOtorgado) {
      _bonoOtorgado = true;
      context.read<GamificacionProvider>().registrarBonoAccion('PROBAR_RA');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppTheme.cardColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppTheme.goldColor, width: 1),
          ),
          content: Row(
            children: const [
              Icon(Icons.view_in_ar, color: AppTheme.goldColor),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  '¡+25 Puntos ganados por probar el Vestidor Virtual con RA! Insignia "Visionario 3D" desbloqueada.',
                  style: TextStyle(color: AppTheme.textColor, fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    SystemChrome.setPreferredOrientations([]); // Liberar bloqueo de orientación
    _renderTicker.dispose();
    _garmentPoseNotifier.dispose();
    _skeletonNotifier.dispose();
    _detenerImageStream();
    _cameraController?.dispose();
    _poseDetectorService.dispose();
    super.dispose();
  }

  Color _parseHex(String hex) {
    try {
      final buffer = StringBuffer();
      if (hex.length == 6 || hex.length == 7) buffer.write('ff');
      buffer.write(hex.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (_) {
      return AppTheme.goldColor;
    }
  }

  double _factorEscalaTalla(String talla) {
    switch (talla.toUpperCase()) {
      case 'XS':
        return 0.88;
      case 'S':
        return 0.94;
      case 'M':
        return 1.00;
      case 'L':
        return 1.08;
      case 'XL':
        return 1.18;
      case 'XXL':
        return 1.28;
      default:
        return 1.00;
    }
  }

  void _simularEscaneoBiometrico() {
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppTheme.cardColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppTheme.goldColor),
            ),
            title: Row(
              children: const [
                Icon(Icons.verified, color: AppTheme.goldColor),
                SizedBox(width: 10),
                Text('Calibración Biométrica', style: TextStyle(color: Colors.white, fontSize: 18)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Prenda: ${widget.prenda.nombre}',
                  style: const TextStyle(color: AppTheme.goldColor, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                _itemMetrica(
                  'Visión Neuronal',
                  _skeleton.hasBody ? 'Activa (${_skeleton.fps.toStringAsFixed(1)} FPS)' : 'Buscando postura',
                ),
                _itemMetrica(
                  'Ancho de Hombros',
                  '${_skeleton.shoulderWidth.toInt()} px en pantalla',
                ),
                _itemMetrica('Ajuste de Talla', 'Ideal para Talla $_tallaSeleccionada'),
                _itemMetrica('Landmarks Activos', _skeleton.hasBody ? 'Hombros, Codos, Caderas' : 'Parciales'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('ENTENDIDO', style: TextStyle(color: AppTheme.goldColor)),
              ),
            ],
          ),
        );
      }
    });
  }

  Widget _itemMetrica(String label, String valor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 13)),
          Text(valor, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  Future<void> _capturarFotoLook() async {
    setState(() => _capturandoFoto = true);
    try {
      XFile? capturedFile;
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        await _detenerImageStream();
        capturedFile = await _cameraController!.takePicture();
        _iniciarImageStream();
      }

      if (mounted) {
        setState(() => _capturandoFoto = false);
        _mostrarModalFoto(capturedFile?.path);
      }
    } catch (_) {
      _iniciarImageStream();
      if (mounted) {
        setState(() => _capturandoFoto = false);
        _mostrarModalFoto(null);
      }
    }
  }

  void _mostrarModalFoto(String? filePath) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppTheme.goldColor),
        ),
        title: Row(
          children: const [
            Icon(Icons.camera_alt, color: AppTheme.goldColor),
            SizedBox(width: 10),
            Text('Look Capturado en RA', style: TextStyle(color: Colors.white, fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white24),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                alignment: Alignment.center,
                fit: StackFit.expand,
                children: [
                  if (filePath != null && File(filePath).existsSync())
                    Image.file(File(filePath), fit: BoxFit.cover)
                  else
                    ArWearableGarment(
                      prenda: widget.prenda,
                      colorSeleccionado: _colorSeleccionado,
                      tallaSeleccionada: _tallaSeleccionada,
                    ),
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Outfit #${DateTime.now().millisecondsSinceEpoch.toString().substring(7)} | Talla $_tallaSeleccionada',
                        style: const TextStyle(color: AppTheme.goldColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Text(
              '¡Excelente elección! La prueba de "${widget.prenda.nombre}" ha sido registrada en tu vestidor personal.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textColor, fontSize: 13),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('ACEPTAR', style: TextStyle(color: AppTheme.goldColor)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final sizeScale = _factorEscalaTalla(_tallaSeleccionada);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0C10),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. VISTA PREVIA DE CÁMARA EN VIVO
          _buildFondoCamara(),

          // Filtro de iluminación ambiental
          _buildFiltroIluminacion(),

          // Retícula sutil de Realidad Aumentada
          IgnorePointer(
            child: CustomPaint(
              size: Size.infinite,
              painter: _ArGridPainter(color: Colors.white.withOpacity(0.03)),
            ),
          ),

          // 2. ESQUELETO ANATÓMICO CON LANDMARKS, HUESOS Y FPS (ETAPA 1)
          if (_showDebugSkeleton)
            IgnorePointer(
              child: CustomPaint(
                size: Size.infinite,
                painter: PoseSkeletonPainter(
                  skeletonNotifier: _skeletonNotifier,
                  showDebugDetails: _showDebugSkeleton,
                ),
              ),
            ),

          // 3. PRENDA WEARABLE ANCLADA AL CUERPO (ETAPA 2: AFFINE 60 FPS)
          Positioned.fill(
            child: GestureDetector(
              onScaleStart: (details) {
                _manualBaseScale = _manualScale;
              },
              onScaleUpdate: (details) {
                setState(() {
                  _modoManualForzado = true;
                  _manualOffset += details.focalPointDelta;
                  if (details.scale != 1.0) {
                    _manualScale = (_manualBaseScale * details.scale).clamp(0.6, 2.2);
                  }
                });
                _actualizarTargetPose(_skeleton, screenSize);
              },
              child: CustomPaint(
                size: Size.infinite,
                painter: GarmentArPainter(
                  poseNotifier: _garmentPoseNotifier,
                  garmentImage: _garmentUiImage,
                  anchors: _garmentAnchors,
                  tintColor: _colorSeleccionado.nombre.toLowerCase() == 'original' ||
                          _colorSeleccionado.nombre.toLowerCase() == 'blanco' ||
                          _colorSeleccionado.nombre.toLowerCase() == 'crudo'
                      ? Colors.transparent
                      : _parseHex(_colorSeleccionado.codigoHex),
                  showDebugAnchors: _showDebugSkeleton,
                ),
              ),
            ),
          ),

          // 4. BARRA SUPERIOR: Header con retorno, título y botón debug
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppTheme.cardColor.withOpacity(0.85),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onLongPress: () {
                        setState(() => _showDebugSkeleton = !_showDebugSkeleton);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              _showDebugSkeleton
                                  ? 'Modo Debug Activo: Mostrando landmarks y anclajes afines'
                                  : 'Modo Debug Desactivado',
                            ),
                            duration: const Duration(milliseconds: 1000),
                            backgroundColor: AppTheme.cardColor,
                          ),
                        );
                      },
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ValueListenableBuilder<DetectedSkeleton>(
                            valueListenable: _skeletonNotifier,
                            builder: (context, skel, _) {
                              // Etapa 4: Estados de tracking enriquecidos
                              String textoEstado;
                              Color colorEstado;
                              IconData iconEstado;

                              if (_modoManualForzado) {
                                textoEstado = 'MODO AJUSTE MANUAL';
                                colorEstado = Colors.amber;
                                iconEstado = Icons.touch_app;
                              } else {
                                switch (_trackingState) {
                                  case 0: // TRACKING ACTIVO
                                    textoEstado = 'TRACKING ACTIVO (${skel.fps.toStringAsFixed(0)} FPS)';
                                    colorEstado = Colors.greenAccent;
                                    iconEstado = Icons.lens;
                                    break;
                                  case 1: // BUSCANDO
                                    textoEstado = 'BUSCANDO PERSONA...';
                                    colorEstado = Colors.amber;
                                    iconEstado = Icons.radio_button_unchecked;
                                    break;
                                  case 2: // PERDIDO
                                    textoEstado = 'TRACKING PERDIDO';
                                    colorEstado = Colors.redAccent;
                                    iconEstado = Icons.error_outline;
                                    break;
                                  case 3: // RECONECTANDO
                                    textoEstado = 'RECONECTANDO...';
                                    colorEstado = Colors.lightGreenAccent;
                                    iconEstado = Icons.sync;
                                    break;
                                  default:
                                    textoEstado = 'BUSCANDO PERSONA...';
                                    colorEstado = Colors.amber;
                                    iconEstado = Icons.radio_button_unchecked;
                                }
                              }

                              return Row(
                                children: [
                                  Icon(
                                    iconEstado,
                                    color: colorEstado,
                                    size: 12,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    textoEstado,
                                    style: TextStyle(
                                      color: colorEstado,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.1,
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                          Text(
                            widget.prenda.nombre,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Botón de reanclar automático
                  IconButton(
                    icon: Icon(
                      _modoManualForzado ? Icons.touch_app : Icons.auto_awesome,
                      color: _modoManualForzado ? Colors.amber : Colors.greenAccent,
                    ),
                    tooltip: _modoManualForzado ? 'Toca para reanclar a cuerpo' : 'Tracking automático',
                    onPressed: () {
                      setState(() {
                        _modoManualForzado = false;
                        _manualOffset = Offset.zero;
                        _manualScale = 1.0;
                      });
                      _actualizarTargetPose(_skeleton, screenSize);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Reanclando prenda a los hombros del usuario...'),
                          duration: Duration(milliseconds: 900),
                          backgroundColor: AppTheme.cardColor,
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),

          // 5. BARRA LATERAL DERECHA (Herramientas y toggles)
          Positioned(
            right: 16,
            top: 100,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
              decoration: BoxDecoration(
                color: AppTheme.cardColor.withOpacity(0.88),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                children: [
                  // Alternar cámara Frontal / Trasera
                  if (_cameras.length > 1)
                    IconButton(
                      icon: const Icon(Icons.flip_camera_ios, color: AppTheme.goldColor),
                      tooltip: 'Cambiar de Cámara',
                      onPressed: _cambiarCamara,
                    ),
                  // Alternar visualización del esqueleto debug
                  IconButton(
                    icon: Icon(
                      _showDebugSkeleton ? Icons.visibility : Icons.visibility_off,
                      color: _showDebugSkeleton ? Colors.greenAccent : Colors.white60,
                    ),
                    tooltip: 'Toggle Esqueleto Landmarks',
                    onPressed: () {
                      setState(() => _showDebugSkeleton = !_showDebugSkeleton);
                    },
                  ),
                  // Aumentar escala manual
                  IconButton(
                    icon: const Icon(Icons.zoom_in, color: Colors.white70),
                    tooltip: 'Aumentar escala',
                    onPressed: () {
                      setState(() {
                        _modoManualForzado = true;
                        _manualScale = (_manualScale + 0.1).clamp(0.6, 2.2);
                      });
                      _actualizarTargetPose(_skeleton, screenSize);
                    },
                  ),
                  // Reducir escala manual
                  IconButton(
                    icon: const Icon(Icons.zoom_out, color: Colors.white70),
                    tooltip: 'Reducir escala',
                    onPressed: () {
                      setState(() {
                        _modoManualForzado = true;
                        _manualScale = (_manualScale - 0.1).clamp(0.6, 2.2);
                      });
                      _actualizarTargetPose(_skeleton, screenSize);
                    },
                  ),
                  const Divider(color: Colors.white12, indent: 8, endIndent: 8),
                  // Cambiar Iluminación
                  IconButton(
                    icon: const Icon(Icons.wb_sunny_outlined, color: Colors.white70),
                    tooltip: 'Ambiente: ${_iluminaciones[_modoIluminacion]}',
                    onPressed: () {
                      setState(() {
                        _modoIluminacion = (_modoIluminacion + 1) % _iluminaciones.length;
                      });
                    },
                  ),
                  // Escanear Calce
                  IconButton(
                    icon: const Icon(Icons.document_scanner_outlined, color: AppTheme.goldColor),
                    tooltip: 'Calibración Biométrica',
                    onPressed: _simularEscaneoBiometrico,
                  ),
                  // Obturador
                  IconButton(
                    icon: _capturandoFoto
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: AppTheme.goldColor, strokeWidth: 2),
                          )
                        : const Icon(Icons.camera_alt, color: AppTheme.goldColor),
                    tooltip: 'Capturar Foto',
                    onPressed: _capturandoFoto ? null : _capturarFotoLook,
                  ),
                ],
              ),
            ),
          ),

          // Indicador HUD de Guía al Usuario (Etapa 4: con estados enriquecidos)
          Positioned(
            top: 85,
            left: 20,
            child: ValueListenableBuilder<DetectedSkeleton>(
              valueListenable: _skeletonNotifier,
              builder: (context, skel, _) {
                final hasBody = skel.hasBody;
                final isTooClose = hasBody && skel.shoulderWidth > screenSize.width * 0.70;

                String guideMsg;
                Color borderColor;
                Color dotColor;
                Color textColor;

                if (_trackingState == 2) {
                  // TRACKING PERDIDO
                  guideMsg = 'Colócate frente a la cámara para continuar';
                  borderColor = Colors.redAccent.withOpacity(0.6);
                  dotColor = Colors.redAccent;
                  textColor = Colors.redAccent.shade100;
                } else if (_trackingState == 3) {
                  // RECONECTANDO
                  guideMsg = '¡Detectado! Reanclando prenda automáticamente...';
                  borderColor = Colors.lightGreenAccent.withOpacity(0.6);
                  dotColor = Colors.lightGreenAccent;
                  textColor = Colors.white;
                } else if (!hasBody) {
                  guideMsg = 'Aléjate para que se vean tus hombros y cintura';
                  borderColor = Colors.amber.withOpacity(0.6);
                  dotColor = Colors.amber;
                  textColor = Colors.amberAccent;
                } else if (isTooClose) {
                  guideMsg = 'Estás muy cerca: da un paso atrás';
                  borderColor = Colors.amber.withOpacity(0.6);
                  dotColor = Colors.amber;
                  textColor = Colors.amberAccent;
                } else {
                  guideMsg = 'Hombros y torso calibrados (${skel.fps.toStringAsFixed(0)} FPS)';
                  borderColor = Colors.greenAccent.withOpacity(0.6);
                  dotColor = Colors.greenAccent;
                  textColor = Colors.white;
                }

                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.75),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: dotColor,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        guideMsg,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // 6. PANEL INFERIOR (Color, Talla, Precio, Añadir a la Bolsa)
          Positioned(
            left: 16,
            right: 16,
            bottom: 24,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardColor.withOpacity(0.95),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.65),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Paleta de colores
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'COLOR EN TIEMPO REAL',
                        style: TextStyle(
                          color: AppTheme.mutedTextColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                      Text(
                        _colorSeleccionado.nombre,
                        style: const TextStyle(
                          color: AppTheme.goldColor,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 44,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: widget.prenda.colores.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, idx) {
                        final c = widget.prenda.colores[idx];
                        final isSel = c.idColor == _colorSeleccionado.idColor;
                        return GestureDetector(
                          onTap: () => setState(() => _colorSeleccionado = c),
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _parseHex(c.codigoHex),
                              border: Border.all(
                                color: isSel ? AppTheme.goldColor : Colors.white30,
                                width: isSel ? 2.5 : 1,
                              ),
                            ),
                            child: isSel
                                ? const Icon(Icons.check, size: 18, color: Colors.white)
                                : null,
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Talla calibrada
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TALLA CALIBRADA',
                        style: TextStyle(
                          color: AppTheme.mutedTextColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                      Text(
                        'Escala: ${(sizeScale * 100).toInt()}% • Slim Fit',
                        style: const TextStyle(color: Colors.greenAccent, fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: widget.prenda.tallas.map((t) {
                      final isSel = t.talla == _tallaSeleccionada;
                      return ChoiceChip(
                        label: Text(t.talla),
                        selected: isSel,
                        selectedColor: AppTheme.goldColor,
                        backgroundColor: const Color(0xFF1E2430),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        labelStyle: TextStyle(
                          color: isSel ? Colors.black : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                        onSelected: (val) {
                          if (val) {
                            setState(() => _tallaSeleccionada = t.talla);
                            _actualizarTargetPose(_skeleton, screenSize);
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),

                  // Precio y Añadir a la Bolsa
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'PRECIO BOUTIQUE',
                            style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 10),
                          ),
                          Text(
                            'Bs. ${widget.prenda.precioFinal.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.goldColor,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          icon: const Icon(Icons.shopping_bag_outlined),
                          label: const Text(
                            'AÑADIR A LA BOLSA',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          onPressed: () {
                            context.read<CarritoProvider>().agregarItem(
                                  idProducto: widget.prenda.idProducto,
                                  talla: _tallaSeleccionada,
                                  color: _colorSeleccionado.nombre,
                                  cantidad: 1,
                                );
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  '¡Prenda añadida a tu bolsa! (${_colorSeleccionado.nombre} / $_tallaSeleccionada)',
                                ),
                                backgroundColor: AppTheme.cardColor,
                              ),
                            );
                            Navigator.pop(context);
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFondoCamara() {
    if (_cameraIniciada && _cameraController != null && _cameraController!.value.isInitialized) {
      return SizedBox.expand(
        child: FittedBox(
          fit: BoxFit.cover,
          child: SizedBox(
            width: _cameraController!.value.previewSize?.height ?? 1080,
            height: _cameraController!.value.previewSize?.width ?? 1920,
            child: CameraPreview(_cameraController!),
          ),
        ),
      );
    }

    if (_cameraError) {
      return Container(
        color: const Color(0xFF0F1218),
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.videocam_off_outlined, color: Colors.white38, size: 56),
              const SizedBox(height: 16),
              const Text(
                'Acceso a la Cámara',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                _cameraErrorMsg,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 13),
              ),
              const SizedBox(height: 18),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.goldColor,
                  foregroundColor: Colors.black,
                ),
                onPressed: _inicializarCamara,
                icon: const Icon(Icons.refresh),
                label: const Text('REINTENTAR ACTIVAR CÁMARA'),
              ),
            ],
          ),
        ),
      );
    }

    // Cargando cámara
    return Container(
      color: const Color(0xFF0A0C10),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            CircularProgressIndicator(color: AppTheme.goldColor),
            SizedBox(height: 16),
            Text(
              'Iniciando cámara y visión neuronal...',
              style: TextStyle(color: AppTheme.goldColor, fontSize: 13, letterSpacing: 1),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFiltroIluminacion() {
    Color ambientColor;
    switch (_modoIluminacion) {
      case 0: // Boutique Cálida
        ambientColor = Colors.amber.withOpacity(0.06);
        break;
      case 1: // Luz Solar Natural
        ambientColor = Colors.lightBlueAccent.withOpacity(0.04);
        break;
      case 2: // Noche & Gala
        ambientColor = Colors.deepPurpleAccent.withOpacity(0.08);
        break;
      default:
        ambientColor = Colors.transparent;
    }

    return IgnorePointer(
      child: Container(
        color: ambientColor,
      ),
    );
  }
}

class _ArGridPainter extends CustomPainter {
  final Color color;
  _ArGridPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.0;

    const step = 45.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
