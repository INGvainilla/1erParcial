import 'dart:ui' as ui;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p03_catalogo_estilismo_ia/ar_viewer/models/garment_anchor_model.dart';

/// Painter de alto rendimiento para renderizar la prenda en tiempo real
/// con transformación afín euclidiana acelerada por GPU a 60 FPS sin deformación.
class GarmentArPainter extends CustomPainter {
  final ValueListenable<GarmentPoseState> poseNotifier;
  final ui.Image? garmentImage;
  final GarmentAnchors anchors;
  final Color tintColor;
  final bool showDebugAnchors;

  GarmentArPainter({
    required this.poseNotifier,
    required this.garmentImage,
    this.anchors = const GarmentAnchors(),
    this.tintColor = Colors.transparent,
    this.showDebugAnchors = false,
  }) : super(repaint: poseNotifier);

  @override
  void paint(Canvas canvas, Size size) {
    final pose = poseNotifier.value;

    // Si la opacidad es casi nula, no consumir ciclos de GPU
    if (pose.opacity <= 0.01) return;

    if (garmentImage != null) {
      final imgW = garmentImage!.width.toDouble();
      final imgH = garmentImage!.height.toDouble();
      final imgSize = Size(imgW, imgH);

      // 1. Matriz de transformación afín uniforme acelerada por GPU
      final matrix = pose.computeAffineTransform(imgSize, anchors);

      canvas.save();
      canvas.transform(matrix.storage);

      final paint = Paint()
        ..filterQuality = FilterQuality.high
        ..isAntiAlias = true;

      // ColorFilter textil de alta gama:
      // Con BlendMode.srcATop, el tinte se proyecta ÚNICAMENTE sobre los píxeles
      // donde existe tejido textil (alfa > 0), garantizando que el fondo transparente
      // nunca reciba color ni genere recuadros.
      if (tintColor != Colors.transparent && tintColor.alpha > 0) {
        paint.colorFilter = ColorFilter.mode(
          tintColor.withOpacity(0.38),
          BlendMode.srcATop,
        );
      }

      // Modulación de transparencia suave sin generar recuadro rectangular
      if (pose.opacity < 0.98) {
        final alpha255 = (pose.opacity.clamp(0.0, 1.0) * 255).round();
        canvas.saveLayer(
          Rect.fromLTWH(0, 0, imgW, imgH),
          Paint()..color = Color.fromARGB(alpha255, 255, 255, 255),
        );
        canvas.drawImage(garmentImage!, Offset.zero, paint);
        canvas.restore();
      } else {
        canvas.drawImage(garmentImage!, Offset.zero, paint);
      }
      canvas.restore();
    } else {
      // Fallback sastrero vectorial mientras carga la imagen
      _paintVectorFallback(canvas, pose);
    }

    // 2. Modo Debug: dibujar esqueleto de anclaje sastrero y clavícula
    if (showDebugAnchors) {
      _paintDebugRigging(canvas, pose);
    }
  }

  void _paintVectorFallback(Canvas canvas, GarmentPoseState pose) {
    final ls = pose.shoulderLeft;
    final rs = pose.shoulderRight;
    final hem = pose.hemCenter;

    final path = Path()
      ..moveTo(ls.dx, ls.dy)
      ..lineTo(rs.dx, rs.dy)
      ..lineTo(hem.dx + (rs.dx - ls.dx) * 0.4, hem.dy)
      ..lineTo(hem.dx - (rs.dx - ls.dx) * 0.4, hem.dy)
      ..close();

    final fillPaint = Paint()
      ..color = AppTheme.goldColor.withOpacity(0.35 * pose.opacity)
      ..style = PaintingStyle.fill;

    final strokePaint = Paint()
      ..color = AppTheme.goldColor.withOpacity(0.85 * pose.opacity)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.drawPath(path, fillPaint);
    canvas.drawPath(path, strokePaint);
  }

  void _paintDebugRigging(Canvas canvas, GarmentPoseState pose) {
    final ls = pose.shoulderLeft;
    final rs = pose.shoulderRight;
    final hem = pose.hemCenter;
    final sc = pose.shoulderCenter;

    final bonePaint = Paint()
      ..color = Colors.cyanAccent.withOpacity(0.85)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    // Línea clavicular de anclaje de hombros
    canvas.drawLine(ls, rs, bonePaint);

    // Columna / Eje central del torso
    canvas.drawLine(
      sc,
      hem,
      Paint()
        ..color = Colors.amberAccent
        ..strokeWidth = 2.0,
    );

    // Dobladillo sastrero inferior
    final hemHalfW = (rs - ls).distance * 0.42;
    canvas.drawLine(
      Offset(hem.dx - hemHalfW, hem.dy),
      Offset(hem.dx + hemHalfW, hem.dy),
      Paint()
        ..color = Colors.cyanAccent.withOpacity(0.7)
        ..strokeWidth = 2.0,
    );

    // Nodos articulares de anclaje
    _drawControlNode(canvas, ls, 'H. Izq');
    _drawControlNode(canvas, rs, 'H. Der');
    _drawControlNode(canvas, sc, 'Cuello');
    _drawControlNode(canvas, hem, 'Dobladillo');
  }

  void _drawControlNode(Canvas canvas, Offset point, String label) {
    canvas.drawCircle(
      point,
      5.0,
      Paint()..color = Colors.cyanAccent..style = PaintingStyle.fill,
    );
    canvas.drawCircle(
      point,
      7.5,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2,
    );
  }

  @override
  bool shouldRepaint(covariant GarmentArPainter oldDelegate) {
    return oldDelegate.garmentImage != garmentImage ||
        oldDelegate.tintColor != tintColor ||
        oldDelegate.showDebugAnchors != showDebugAnchors;
  }
}

