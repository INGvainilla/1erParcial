import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';

/// Anclajes normalizados en el espacio de textura del PNG de la prenda [0.0, 1.0]
class GarmentAnchors {
  // Pose de reposo estándar para prendas superiores masculinas (camisas, sacos)
  final Offset shoulderLeft;
  final Offset shoulderRight;
  final Offset neckCenter;
  final Offset hemCenter;
  final Offset hemLeft;
  final Offset hemRight;

  // Anclajes de brazos para mangas (Etapa 3)
  final Offset elbowLeft;
  final Offset elbowRight;
  final Offset wristLeft;
  final Offset wristRight;

  const GarmentAnchors({
    this.shoulderLeft = const Offset(0.28, 0.14),
    this.shoulderRight = const Offset(0.72, 0.14),
    this.neckCenter = const Offset(0.50, 0.08),
    this.hemCenter = const Offset(0.50, 0.92),
    this.hemLeft = const Offset(0.30, 0.92),
    this.hemRight = const Offset(0.70, 0.92),
    this.elbowLeft = const Offset(0.16, 0.48),
    this.elbowRight = const Offset(0.84, 0.48),
    this.wristLeft = const Offset(0.12, 0.82),
    this.wristRight = const Offset(0.88, 0.82),
  });

  /// Proporción torso / ancho de hombros en reposo
  double get restTorsoRatio {
    final sDist = (shoulderRight - shoulderLeft).distance;
    final sCenter = (shoulderLeft + shoulderRight) / 2;
    final hDist = (hemCenter - sCenter).distance;
    return sDist > 0 ? hDist / sDist : 1.38;
  }
}

/// Estado cinemático actual de la prenda en pantalla
class GarmentPoseState {
  final Offset shoulderLeft;
  final Offset shoulderRight;
  final Offset hemCenter;
  final Offset? elbowLeft;
  final Offset? elbowRight;
  final Offset? wristLeft;
  final Offset? wristRight;
  final bool hasTracking;
  final double opacity;
  final double sizeScale;

  const GarmentPoseState({
    required this.shoulderLeft,
    required this.shoulderRight,
    required this.hemCenter,
    this.elbowLeft,
    this.elbowRight,
    this.wristLeft,
    this.wristRight,
    this.hasTracking = false,
    this.opacity = 1.0,
    this.sizeScale = 1.0,
  });

  factory GarmentPoseState.initial(Size screenSize) {
    final cx = screenSize.width / 2;
    final cy = screenSize.height * 0.38;
    final halfW = screenSize.width * 0.28;
    final torsoH = halfW * 2 * 1.35;

    return GarmentPoseState(
      shoulderLeft: Offset(cx - halfW, cy),
      shoulderRight: Offset(cx + halfW, cy),
      hemCenter: Offset(cx, cy + torsoH),
      hasTracking: false,
      opacity: 0.95,
      sizeScale: 1.0,
    );
  }

  /// Interpola suavemente (LERP) hacia una postura objetivo
  GarmentPoseState lerpTo(GarmentPoseState target, double t) {
    return GarmentPoseState(
      shoulderLeft: Offset.lerp(shoulderLeft, target.shoulderLeft, t)!,
      shoulderRight: Offset.lerp(shoulderRight, target.shoulderRight, t)!,
      hemCenter: Offset.lerp(hemCenter, target.hemCenter, t)!,
      elbowLeft: Offset.lerp(elbowLeft, target.elbowLeft, t),
      elbowRight: Offset.lerp(elbowRight, target.elbowRight, t),
      wristLeft: Offset.lerp(wristLeft, target.wristLeft, t),
      wristRight: Offset.lerp(wristRight, target.wristRight, t),
      hasTracking: target.hasTracking,
      opacity: ui.lerpDouble(opacity, target.opacity, t) ?? target.opacity,
      sizeScale: ui.lerpDouble(sizeScale, target.sizeScale, t) ?? target.sizeScale,
    );
  }

  /// Centro de los hombros en pantalla
  Offset get shoulderCenter => (shoulderLeft + shoulderRight) / 2;

  /// Distancia euclidiana entre hombros (en píxeles de pantalla)
  double get shoulderWidth => (shoulderRight - shoulderLeft).distance;

  /// Ángulo de inclinación de hombros en radianes
  double get shoulderAngle => math.atan2(
        shoulderRight.dy - shoulderLeft.dy,
        shoulderRight.dx - shoulderLeft.dx,
      );

  /// Vector normal del torso hacia abajo
  Offset get torsoDownNormal {
    final angle = shoulderAngle;
    // Rotar 90 grados en sentido horario en pantalla (+Y hacia abajo)
    return Offset(-math.sin(angle), math.cos(angle));
  }

  /// Resuelve la matriz afín 2D euclidiana para mapear el PNG de la prenda
  /// hacia las coordenadas de hombros y torso en pantalla.
  /// Preserva la proporción sastrera original de la prenda sin distorsión ni cizallamiento.
  Matrix4 computeAffineTransform(Size imageSize, GarmentAnchors anchors) {
    // Puntos fuente en coordenadas del PNG (píxeles de textura)
    final sLeft = Offset(
      anchors.shoulderLeft.dx * imageSize.width,
      anchors.shoulderLeft.dy * imageSize.height,
    );
    final sRight = Offset(
      anchors.shoulderRight.dx * imageSize.width,
      anchors.shoulderRight.dy * imageSize.height,
    );
    final sCenter = (sLeft + sRight) / 2;
    final sWidth = (sRight - sLeft).distance;

    // Puntos destino en pantalla
    final dLeft = shoulderLeft;
    final dRight = shoulderRight;
    final dCenter = (dLeft + dRight) / 2;
    final dWidth = (dRight - dLeft).distance;

    if (sWidth <= 0 || dWidth <= 0) {
      return Matrix4.identity();
    }

    // Escala uniforme proporcional basada en la envergadura de hombros y la talla
    final scale = (dWidth / sWidth) * sizeScale;

    // Ángulo de inclinación del torso respecto a la horizontal
    final angle = math.atan2(dRight.dy - dLeft.dy, dRight.dx - dLeft.dx);

    // Matriz de transformación 2D euclidiana (rotación + escala uniforme + traslación)
    // Se ancla el punto medio clavicular del PNG al centro de los hombros en pantalla
    return Matrix4.identity()
      ..translate(dCenter.dx, dCenter.dy)
      ..rotateZ(angle)
      ..scale(scale, scale)
      ..translate(-sCenter.dx, -sCenter.dy);
  }
}

