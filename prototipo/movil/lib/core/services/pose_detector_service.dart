import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:fashionstore_mobile/core/services/coordinates_translator.dart';
import 'package:fashionstore_mobile/core/utils/one_euro_filter.dart';

class SkeletonLandmark {
  final PoseLandmarkType type;
  final Offset screenPosition;
  final double likelihood;

  SkeletonLandmark({
    required this.type,
    required this.screenPosition,
    required this.likelihood,
  });
}

class DetectedSkeleton {
  final bool hasBody;
  final double fps;
  final SkeletonLandmark? leftShoulder;
  final SkeletonLandmark? rightShoulder;
  final SkeletonLandmark? leftElbow;
  final SkeletonLandmark? rightElbow;
  final SkeletonLandmark? leftWrist;
  final SkeletonLandmark? rightWrist;
  final SkeletonLandmark? leftHip;
  final SkeletonLandmark? rightHip;

  DetectedSkeleton({
    required this.hasBody,
    required this.fps,
    this.leftShoulder,
    this.rightShoulder,
    this.leftElbow,
    this.rightElbow,
    this.leftWrist,
    this.rightWrist,
    this.leftHip,
    this.rightHip,
  });

  factory DetectedSkeleton.empty({double fps = 0.0}) {
    return DetectedSkeleton(hasBody: false, fps: fps);
  }

  bool get bothShouldersVisible =>
      leftShoulder != null &&
      rightShoulder != null &&
      leftShoulder!.likelihood >= 0.5 &&
      rightShoulder!.likelihood >= 0.5;

  Offset? get chestCenter {
    if (!bothShouldersVisible) return null;
    return Offset(
      (leftShoulder!.screenPosition.dx + rightShoulder!.screenPosition.dx) / 2.0,
      (leftShoulder!.screenPosition.dy + rightShoulder!.screenPosition.dy) / 2.0 + (shoulderWidth * 0.15),
    );
  }

  double get shoulderWidth {
    if (!bothShouldersVisible) return 200.0;
    final dx = rightShoulder!.screenPosition.dx - leftShoulder!.screenPosition.dx;
    final dy = rightShoulder!.screenPosition.dy - leftShoulder!.screenPosition.dy;
    return (dx * dx + dy * dy) > 0 ? (dx.abs()) : 200.0;
  }
}

class PoseDetectorService {
  PoseDetector? _poseDetector;
  bool _isDetecting = false;

  // Contador de FPS de procesamiento de visión neuronal
  int _frameCount = 0;
  DateTime? _lastFpsUpdate;
  double _currentFps = 0.0;

  // ── Filtros One Euro (Etapa 4): suavizado adaptativo por landmark ──
  // Parámetros calibrados para tracking corporal en tiempo real:
  //   freq:      ~30 Hz (cadencia real de ML Kit en modo stream)
  //   minCutoff: 1.0 Hz (suavizado base — elimina jitter cuando el usuario está quieto)
  //   beta:      0.007  (reactividad a la velocidad — permite seguir movimientos rápidos sin lag)
  //   dCutoff:   1.0 Hz (filtro de la derivada de velocidad)
  static const double _filterFreq = 30.0;
  static const double _filterMinCutoff = 1.0;
  static const double _filterBeta = 0.007;
  static const double _filterDCutoff = 1.0;

  final OneEuroFilter2D _filterLeftShoulder = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );
  final OneEuroFilter2D _filterRightShoulder = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );
  final OneEuroFilter2D _filterLeftElbow = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );
  final OneEuroFilter2D _filterRightElbow = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );
  final OneEuroFilter2D _filterLeftWrist = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );
  final OneEuroFilter2D _filterRightWrist = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );
  final OneEuroFilter2D _filterLeftHip = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );
  final OneEuroFilter2D _filterRightHip = OneEuroFilter2D(
    freq: _filterFreq, minCutoff: _filterMinCutoff, beta: _filterBeta, dCutoff: _filterDCutoff,
  );

  static final Map<DeviceOrientation, int> _orientations = {
    DeviceOrientation.portraitUp: 0,
    DeviceOrientation.landscapeLeft: 90,
    DeviceOrientation.portraitDown: 180,
    DeviceOrientation.landscapeRight: 270,
  };

  void initialize() {
    _poseDetector = PoseDetector(
      options: PoseDetectorOptions(
        mode: PoseDetectionMode.stream,
        model: PoseDetectionModel.base, // Modelo base optimizado para tiempo real
      ),
    );
  }

  /// Resetea todos los filtros One Euro. Llamar al cambiar de cámara
  /// o después de una pérdida prolongada de tracking (>500ms).
  void resetFilters() {
    _filterLeftShoulder.reset();
    _filterRightShoulder.reset();
    _filterLeftElbow.reset();
    _filterRightElbow.reset();
    _filterLeftWrist.reset();
    _filterRightWrist.reset();
    _filterLeftHip.reset();
    _filterRightHip.reset();
  }

  void dispose() {
    _poseDetector?.close();
    _poseDetector = null;
  }

  InputImage? inputImageFromCameraImage({
    required CameraImage image,
    required CameraDescription camera,
    required DeviceOrientation deviceOrientation,
  }) {
    final sensorOrientation = camera.sensorOrientation;
    InputImageRotation? rotation;
    if (Platform.isAndroid) {
      var rotationCompensation = _orientations[deviceOrientation];
      if (rotationCompensation == null) return null;
      if (camera.lensDirection == CameraLensDirection.front) {
        rotationCompensation = (sensorOrientation + rotationCompensation) % 360;
      } else {
        rotationCompensation = (sensorOrientation - rotationCompensation + 360) % 360;
      }
      rotation = InputImageRotationValue.fromRawValue(rotationCompensation);
    } else {
      rotation = InputImageRotationValue.fromRawValue(sensorOrientation);
    }
    if (rotation == null) return null;

    final format = InputImageFormatValue.fromRawValue(image.format.raw) ??
        (Platform.isAndroid ? InputImageFormat.nv21 : InputImageFormat.bgra8888);

    // En Android nv21 o iOS bgra8888
    Uint8List bytes;
    if (image.planes.length == 1) {
      bytes = image.planes[0].bytes;
    } else {
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      bytes = allBytes.done().buffer.asUint8List();
    }

    return InputImage.fromBytes(
      bytes: bytes,
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: rotation,
        format: format,
        bytesPerRow: image.planes[0].bytesPerRow,
      ),
    );
  }

  Future<DetectedSkeleton?> processFrame({
    required CameraImage image,
    required CameraDescription camera,
    required DeviceOrientation deviceOrientation,
    required Size screenSize,
  }) async {
    if (_poseDetector == null || _isDetecting) return null;
    _isDetecting = true;

    try {
      final inputImage = inputImageFromCameraImage(
        image: image,
        camera: camera,
        deviceOrientation: deviceOrientation,
      );

      if (inputImage == null) {
        _isDetecting = false;
        return null;
      }

      final List<Pose> poses = await _poseDetector!.processImage(inputImage);
      _isDetecting = false;

      // Calcular FPS
      _frameCount++;
      final now = DateTime.now();
      if (_lastFpsUpdate == null) {
        _lastFpsUpdate = now;
      } else {
        final elapsedMs = now.difference(_lastFpsUpdate!).inMilliseconds;
        if (elapsedMs >= 1000) {
          _currentFps = (_frameCount * 1000.0) / elapsedMs;
          _frameCount = 0;
          _lastFpsUpdate = now;
        }
      }

      if (poses.isEmpty) {
        return DetectedSkeleton.empty(fps: _currentFps);
      }

      final pose = poses.first;
      final bool isFront = camera.lensDirection == CameraLensDirection.front;
      final imageSize = inputImage.metadata!.size;
      final rotation = inputImage.metadata!.rotation;

      // Timestamp actual en segundos para los filtros 1€
      final double timestamp = now.microsecondsSinceEpoch / 1000000.0;

      SkeletonLandmark? getFilteredLandmark(
        PoseLandmarkType type,
        OneEuroFilter2D filter,
      ) {
        final lm = pose.landmarks[type];
        if (lm == null || lm.likelihood < 0.5) return null;

        final screenPoint = translatePoint(
          x: lm.x,
          y: lm.y,
          canvasSize: screenSize,
          imageSize: imageSize,
          rotation: rotation,
          isFrontCamera: isFront,
        );

        // Aplicar filtro 1€ para eliminar jitter
        final filteredPoint = filter.filter(screenPoint, timestamp: timestamp);

        return SkeletonLandmark(
          type: type,
          screenPosition: filteredPoint,
          likelihood: lm.likelihood,
        );
      }

      final ls = getFilteredLandmark(PoseLandmarkType.leftShoulder, _filterLeftShoulder);
      final rs = getFilteredLandmark(PoseLandmarkType.rightShoulder, _filterRightShoulder);
      final le = getFilteredLandmark(PoseLandmarkType.leftElbow, _filterLeftElbow);
      final re = getFilteredLandmark(PoseLandmarkType.rightElbow, _filterRightElbow);
      final lw = getFilteredLandmark(PoseLandmarkType.leftWrist, _filterLeftWrist);
      final rw = getFilteredLandmark(PoseLandmarkType.rightWrist, _filterRightWrist);
      final lh = getFilteredLandmark(PoseLandmarkType.leftHip, _filterLeftHip);
      final rh = getFilteredLandmark(PoseLandmarkType.rightHip, _filterRightHip);

      final bool hasBody = ls != null && rs != null;

      return DetectedSkeleton(
        hasBody: hasBody,
        fps: _currentFps,
        leftShoulder: ls,
        rightShoulder: rs,
        leftElbow: le,
        rightElbow: re,
        leftWrist: lw,
        rightWrist: rw,
        leftHip: lh,
        rightHip: rh,
      );
    } catch (_) {
      _isDetecting = false;
      return null;
    }
  }
}
