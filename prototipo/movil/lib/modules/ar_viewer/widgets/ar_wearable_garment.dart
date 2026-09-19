import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/models/catalogo_item.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';

class ArWearableGarment extends StatelessWidget {
  final PrendaCatalogo prenda;
  final PrendaColor colorSeleccionado;
  final String tallaSeleccionada;
  final bool escaneando;

  const ArWearableGarment({
    Key? key,
    required this.prenda,
    required this.colorSeleccionado,
    required this.tallaSeleccionada,
    this.escaneando = false,
  }) : super(key: key);

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

  String _obtenerAssetModeloWearable() {
    final nombreLower = prenda.nombre.toLowerCase();

    // Priorizar camisa de lino o camisas en general
    if (nombreLower.contains('camisa') ||
        nombreLower.contains('shirt') ||
        nombreLower.contains('lino') ||
        (prenda.nombreCategoria?.toLowerCase().contains('camisa') ?? false)) {
      return 'assets/ar_models/camisa_lino_wearable.png';
    }

    // Trajes, blazers, smokings
    if (nombreLower.contains('traje') ||
        nombreLower.contains('blazer') ||
        nombreLower.contains('smoking') ||
        nombreLower.contains('saco') ||
        (prenda.nombreCategoria?.toLowerCase().contains('traje') ?? false)) {
      return 'assets/ar_models/traje_ejecutivo_wearable.png';
    }

    return 'assets/ar_models/camisa_lino_wearable.png';
  }

  @override
  Widget build(BuildContext context) {
    final tintColor = _parseHex(colorSeleccionado.codigoHex);
    final assetPath = _obtenerAssetModeloWearable();

    return SizedBox(
      width: 290,
      height: 380,
      child: Stack(
        alignment: Alignment.topCenter,
        clipBehavior: Clip.none,
        children: [
          // Resplandor ambiental de tela (Aura de colorimetría)
          Positioned.fill(
            child: Container(
              margin: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(40),
                boxShadow: [
                  BoxShadow(
                    color: tintColor.withOpacity(0.28),
                    blurRadius: 40,
                    spreadRadius: 4,
                  ),
                ],
              ),
            ),
          ),

          // Prenda Wearable Desdoblada con Textura y Transparencia
          Image.asset(
            assetPath,
            width: 290,
            height: 380,
            fit: BoxFit.contain,
            // Aplicar tinte inteligente que respeta luces y sombras de los dobleces
            color: colorSeleccionado.nombre.toLowerCase() == 'original' ||
                    colorSeleccionado.nombre.toLowerCase() == 'blanco' ||
                    colorSeleccionado.nombre.toLowerCase() == 'crudo'
                ? null
                : tintColor.withOpacity(0.42),
            colorBlendMode: BlendMode.color,
            errorBuilder: (context, error, stackTrace) {
              // Fallback sastrero vectorial de alta costura
              return CustomPaint(
                size: const Size(290, 380),
                painter: _SartorialFallbackPainter(color: tintColor),
              );
            },
          ),

          // Malla de calibración si está en proceso de escaneo biométrico
          if (escaneando)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.goldColor.withOpacity(0.8), width: 1.8),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Center(
                  child: Text(
                    'CALIBRANDO MALLA DE TELA...',
                    style: TextStyle(
                      color: AppTheme.goldColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ),
              ),
            ),

          // Etiqueta sutil de Talla Calibrada
          Positioned(
            bottom: 6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.goldColor.withOpacity(0.4), width: 0.8),
              ),
              child: Text(
                'Talla $tallaSeleccionada • ${colorSeleccionado.nombre}',
                style: const TextStyle(
                  color: AppTheme.goldColor,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SartorialFallbackPainter extends CustomPainter {
  final Color color;
  _SartorialFallbackPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.85)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = AppTheme.goldColor.withOpacity(0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // Silueta de camisa/chaqueta sastrera
    final path = Path();
    path.moveTo(size.width * 0.38, 0); // Cuello izquierdo
    path.lineTo(size.width * 0.15, size.height * 0.15); // Hombro izquierdo
    path.lineTo(0, size.height * 0.35); // Manga izquierda
    path.lineTo(size.width * 0.12, size.height * 0.42);
    path.lineTo(size.width * 0.22, size.height * 0.32); // Axila izquierda
    path.lineTo(size.width * 0.24, size.height * 0.90); // Cintura izquierda
    path.lineTo(size.width * 0.76, size.height * 0.90); // Cintura derecha
    path.lineTo(size.width * 0.78, size.height * 0.32); // Axila derecha
    path.lineTo(size.width * 0.88, size.height * 0.42);
    path.lineTo(size.width, size.height * 0.35); // Manga derecha
    path.lineTo(size.width * 0.85, size.height * 0.15); // Hombro derecho
    path.lineTo(size.width * 0.62, 0); // Cuello derecho
    path.close();

    canvas.drawPath(path, paint);
    canvas.drawPath(path, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
