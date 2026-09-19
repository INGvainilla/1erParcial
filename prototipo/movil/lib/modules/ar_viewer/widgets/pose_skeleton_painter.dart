import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/services/pose_detector_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';

class PoseSkeletonPainter extends CustomPainter {
  final DetectedSkeleton? skeleton;
  final ValueListenable<DetectedSkeleton>? skeletonNotifier;
  final bool showDebugDetails;

  PoseSkeletonPainter({
    this.skeleton,
    this.skeletonNotifier,
    this.showDebugDetails = true,
  }) : super(repaint: skeletonNotifier);

  @override
  void paint(Canvas canvas, Size size) {
    final skel = skeletonNotifier?.value ?? skeleton ?? DetectedSkeleton.empty();
    if (!skel.hasBody) return;

    final bonePaint = Paint()
      ..color = Colors.greenAccent.withOpacity(0.85)
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    final jointPaint = Paint()
      ..color = AppTheme.goldColor
      ..style = PaintingStyle.fill;

    final jointRingPaint = Paint()
      ..color = Colors.greenAccent
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    void drawBone(SkeletonLandmark? a, SkeletonLandmark? b) {
      if (a != null && b != null) {
        canvas.drawLine(a.screenPosition, b.screenPosition, bonePaint);
      }
    }

    void drawJoint(SkeletonLandmark? lm) {
      if (lm != null) {
        canvas.drawCircle(lm.screenPosition, 5.0, jointPaint);
        canvas.drawCircle(lm.screenPosition, 10.0, jointRingPaint);
      }
    }

    // 1. Dibujar huesos anatómicos
    // Clavícula / Hombros
    drawBone(skel.leftShoulder, skel.rightShoulder);
    // Brazo y antebrazo izquierdo
    drawBone(skel.leftShoulder, skel.leftElbow);
    drawBone(skel.leftElbow, skel.leftWrist);
    // Brazo y antebrazo derecho
    drawBone(skel.rightShoulder, skel.rightElbow);
    drawBone(skel.rightElbow, skel.rightWrist);
    // Torso y caderas
    drawBone(skel.leftShoulder, skel.leftHip);
    drawBone(skel.rightShoulder, skel.rightHip);
    drawBone(skel.leftHip, skel.rightHip);

    // 2. Dibujar articulaciones / puntos clave
    drawJoint(skel.leftShoulder);
    drawJoint(skel.rightShoulder);
    drawJoint(skel.leftElbow);
    drawJoint(skel.rightElbow);
    drawJoint(skel.leftWrist);
    drawJoint(skel.rightWrist);
    drawJoint(skel.leftHip);
    drawJoint(skel.rightHip);

    // 3. Si debug está activo, mostrar métricas y FPS en pantalla
    if (showDebugDetails) {
      const textStyle = TextStyle(
        color: Colors.white,
        fontSize: 12,
        fontWeight: FontWeight.bold,
        backgroundColor: Colors.black54,
      );

      final textSpan = TextSpan(
        text: ' FPS: ${skel.fps.toStringAsFixed(1)} | ML Kit Stream (30 FPS) ',
        style: textStyle,
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();

      textPainter.paint(canvas, const Offset(16, 120));
    }
  }

  @override
  bool shouldRepaint(covariant PoseSkeletonPainter oldDelegate) {
    return oldDelegate.skeleton != skeleton ||
        oldDelegate.showDebugDetails != showDebugDetails;
  }
}
