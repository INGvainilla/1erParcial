import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';

/// Convierte coordenadas de un punto de imagen a coordenadas de pantalla (canvasSize)
/// considerando la rotación del sensor, modo espejo (cámara frontal) y BoxFit.cover.
Offset translatePoint({
  required double x,
  required double y,
  required Size canvasSize,
  required Size imageSize,
  required InputImageRotation rotation,
  required bool isFrontCamera,
}) {
  // En orientaciones de 90 o 270 grados (típicas en teléfonos verticales),
  // el ancho y el alto de la imagen se intercambian respecto al marco orientado.
  final bool isRotated = rotation == InputImageRotation.rotation90deg ||
      rotation == InputImageRotation.rotation270deg;

  final double frameW = isRotated ? imageSize.height : imageSize.width;
  final double frameH = isRotated ? imageSize.width : imageSize.height;

  // Si la cámara es frontal, invertimos horizontalmente el punto en el marco de la imagen
  double pointX = x;
  double pointY = y;

  if (isFrontCamera) {
    pointX = frameW - pointX;
  }

  // Escalado con BoxFit.cover (llena toda la pantalla sin distorsión)
  final double scaleX = canvasSize.width / frameW;
  final double scaleY = canvasSize.height / frameH;
  final double coverScale = math.max(scaleX, scaleY);

  final double offsetX = (canvasSize.width - (frameW * coverScale)) / 2.0;
  final double offsetY = (canvasSize.height - (frameH * coverScale)) / 2.0;

  return Offset(
    (pointX * coverScale) + offsetX,
    (pointY * coverScale) + offsetY,
  );
}
