import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/modules/p03_catalogo_estilismo_ia/ar_viewer/models/garment_anchor_model.dart';

/// Vértice de la malla con pesos de Linear Blend Skinning (LBS)
class MeshVertex {
  final Offset restUV; // Coordenada normalizada en el PNG [0.0, 1.0]
  final double weightTorso;
  final double weightUpperArmLeft;
  final double weightForearmLeft;
  final double weightUpperArmRight;
  final double weightForearmRight;

  const MeshVertex({
    required this.restUV,
    this.weightTorso = 1.0,
    this.weightUpperArmLeft = 0.0,
    this.weightForearmLeft = 0.0,
    this.weightUpperArmRight = 0.0,
    this.weightForearmRight = 0.0,
  });
}

/// Generador y evaluador cinemático de malla textil 2D (Skinning Lineal)
class GarmentMeshBuilder {
  final GarmentAnchors anchors;
  final List<MeshVertex> vertices = [];
  final List<int> indices = [];

  GarmentMeshBuilder({this.anchors = const GarmentAnchors()}) {
    _buildTopology();
  }

  /// Construye la topología de la prenda (torso + manga izquierda + manga derecha)
  void _buildTopology() {
    vertices.clear();
    indices.clear();

    // 1. TORSO: Grilla de 6x7 subdivisiones
    const torsoCols = 6;
    const torsoRows = 7;
    final torsoStartIdx = vertices.length;

    for (int r = 0; r <= torsoRows; r++) {
      final v = r / torsoRows;
      final y = 0.08 + v * (0.92 - 0.08); // De cuello a dobladillo

      for (int c = 0; c <= torsoCols; c++) {
        final u = c / torsoCols;
        final x = 0.28 + u * (0.72 - 0.28); // De hombro izq a hombro der

        // Pesos sutiles en la sisa para fusionar con mangas
        double wTorso = 1.0;
        double wUal = 0.0;
        double wUar = 0.0;

        if (c == 0 && r <= 3) {
          // Borde sisa izquierda
          wTorso = 0.60;
          wUal = 0.40;
        } else if (c == torsoCols && r <= 3) {
          // Borde sisa derecha
          wTorso = 0.60;
          wUar = 0.40;
        }

        vertices.add(MeshVertex(
          restUV: Offset(x, y),
          weightTorso: wTorso,
          weightUpperArmLeft: wUal,
          weightUpperArmRight: wUar,
        ));
      }
    }

    // Triangulación del torso
    for (int r = 0; r < torsoRows; r++) {
      for (int c = 0; c < torsoCols; c++) {
        final i0 = torsoStartIdx + r * (torsoCols + 1) + c;
        final i1 = i0 + 1;
        final i2 = torsoStartIdx + (r + 1) * (torsoCols + 1) + c;
        final i3 = i2 + 1;

        indices.addAll([i0, i2, i1]);
        indices.addAll([i1, i2, i3]);
      }
    }

    // 2. MANGA IZQUIERDA: Grilla de 4x8 subdivisiones
    const armCols = 3;
    const armRows = 8;
    final leftArmStartIdx = vertices.length;

    for (int r = 0; r <= armRows; r++) {
      final t = r / armRows; // 0.0 = hombro, ~0.45 = codo, 1.0 = puño
      final y = 0.14 + t * (0.84 - 0.14);

      // Pesos LBS a lo largo del brazo
      double wTorso = 0.0;
      double wUpper = 0.0;
      double wFore = 0.0;

      if (t < 0.25) {
        // Cerca del hombro: fusión Torso - Brazo Superior
        final blend = t / 0.25;
        wTorso = (1.0 - blend) * 0.50;
        wUpper = 1.0 - wTorso;
      } else if (t < 0.55) {
        // Brazo superior
        final blend = (t - 0.25) / 0.30;
        wUpper = 1.0 - (blend * 0.40);
        wFore = blend * 0.40;
      } else {
        // Antebrazo y puño
        final blend = ((t - 0.55) / 0.45).clamp(0.0, 1.0);
        wUpper = (1.0 - blend) * 0.60;
        wFore = 1.0 - wUpper;
      }

      for (int c = 0; c <= armCols; c++) {
        final u = c / armCols;
        // La manga se angosta ligeramente del hombro al puño
        final xLeft = 0.08 + t * 0.04;
        final xRight = 0.28 - t * 0.08;
        final x = xLeft + u * (xRight - xLeft);

        vertices.add(MeshVertex(
          restUV: Offset(x, y),
          weightTorso: wTorso,
          weightUpperArmLeft: wUpper,
          weightForearmLeft: wFore,
        ));
      }
    }

    // Triangulación de manga izquierda
    for (int r = 0; r < armRows; r++) {
      for (int c = 0; c < armCols; c++) {
        final i0 = leftArmStartIdx + r * (armCols + 1) + c;
        final i1 = i0 + 1;
        final i2 = leftArmStartIdx + (r + 1) * (armCols + 1) + c;
        final i3 = i2 + 1;

        indices.addAll([i0, i2, i1]);
        indices.addAll([i1, i2, i3]);
      }
    }

    // 3. MANGA DERECHA: Grilla de 4x8 subdivisiones
    final rightArmStartIdx = vertices.length;

    for (int r = 0; r <= armRows; r++) {
      final t = r / armRows;
      final y = 0.14 + t * (0.84 - 0.14);

      double wTorso = 0.0;
      double wUpper = 0.0;
      double wFore = 0.0;

      if (t < 0.25) {
        final blend = t / 0.25;
        wTorso = (1.0 - blend) * 0.50;
        wUpper = 1.0 - wTorso;
      } else if (t < 0.55) {
        final blend = (t - 0.25) / 0.30;
        wUpper = 1.0 - (blend * 0.40);
        wFore = blend * 0.40;
      } else {
        final blend = ((t - 0.55) / 0.45).clamp(0.0, 1.0);
        wUpper = (1.0 - blend) * 0.60;
        wFore = 1.0 - wUpper;
      }

      for (int c = 0; c <= armCols; c++) {
        final u = c / armCols;
        final xLeft = 0.72 + t * 0.08;
        final xRight = 0.92 - t * 0.04;
        final x = xLeft + u * (xRight - xLeft);

        vertices.add(MeshVertex(
          restUV: Offset(x, y),
          weightTorso: wTorso,
          weightUpperArmRight: wUpper,
          weightForearmRight: wFore,
        ));
      }
    }

    // Triangulación de manga derecha
    for (int r = 0; r < armRows; r++) {
      for (int c = 0; c < armCols; c++) {
        final i0 = rightArmStartIdx + r * (armCols + 1) + c;
        final i1 = i0 + 1;
        final i2 = rightArmStartIdx + (r + 1) * (armCols + 1) + c;
        final i3 = i2 + 1;

        indices.addAll([i0, i2, i1]);
        indices.addAll([i1, i2, i3]);
      }
    }
  }

  /// Evalúa la deformación cinemática 2D de la malla para el frame actual
  ui.Vertices evaluateSkinning({
    required Size imageSize,
    required GarmentPoseState pose,
    required Matrix4 torsoMatrix,
  }) {
    final imgW = imageSize.width;
    final imgH = imageSize.height;

    // 1. Extraer o estimar anclajes de huesos en pantalla
    final sLeft = pose.shoulderLeft;
    final sRight = pose.shoulderRight;
    final shoulderDist = (sRight - sLeft).distance;
    final normalDown = pose.torsoDownNormal;

    // Huesos de brazo izquierdo
    final eLeft = pose.elbowLeft ?? (sLeft + normalDown * (shoulderDist * 0.68) + Offset(-shoulderDist * 0.15, 0));
    final wLeft = pose.wristLeft ?? (eLeft + normalDown * (shoulderDist * 0.62) + Offset(-shoulderDist * 0.08, 0));

    // Huesos de brazo derecho
    final eRight = pose.elbowRight ?? (sRight + normalDown * (shoulderDist * 0.68) + Offset(shoulderDist * 0.15, 0));
    final wRight = pose.wristRight ?? (eRight + normalDown * (shoulderDist * 0.62) + Offset(shoulderDist * 0.08, 0));

    // Anclajes en reposo en píxeles de imagen
    final rSLeft = Offset(anchors.shoulderLeft.dx * imgW, anchors.shoulderLeft.dy * imgH);
    final rSRight = Offset(anchors.shoulderRight.dx * imgW, anchors.shoulderRight.dy * imgH);
    final rELeft = Offset(anchors.elbowLeft.dx * imgW, anchors.elbowLeft.dy * imgH);
    final rERight = Offset(anchors.elbowRight.dx * imgW, anchors.elbowRight.dy * imgH);
    final rWLeft = Offset(anchors.wristLeft.dx * imgW, anchors.wristLeft.dy * imgH);
    final rWRight = Offset(anchors.wristRight.dx * imgW, anchors.wristRight.dy * imgH);

    // Escala transversal para preservar volumen de mangas
    final sTrans = (shoulderDist / (rSRight - rSLeft).distance).clamp(0.6, 2.2);

    final positions = List<Offset>.filled(vertices.length, Offset.zero);
    final textureCoords = List<Offset>.filled(vertices.length, Offset.zero);

    for (int i = 0; i < vertices.length; i++) {
      final v = vertices[i];
      final px = v.restUV.dx * imgW;
      final py = v.restUV.dy * imgH;
      final pRest = Offset(px, py);

      textureCoords[i] = pRest;

      Offset pTorso = Offset.zero;
      if (v.weightTorso > 0.0) {
        // Transformar con la matriz afín del torso
        pTorso = _transformPoint(torsoMatrix, pRest);
      }

      Offset pUal = Offset.zero;
      if (v.weightUpperArmLeft > 0.0) {
        pUal = _transformBonePoint(rSLeft, rELeft, sLeft, eLeft, pRest, sTrans);
      }

      Offset pFal = Offset.zero;
      if (v.weightForearmLeft > 0.0) {
        pFal = _transformBonePoint(rELeft, rWLeft, eLeft, wLeft, pRest, sTrans);
      }

      Offset pUar = Offset.zero;
      if (v.weightUpperArmRight > 0.0) {
        pUar = _transformBonePoint(rSRight, rERight, sRight, eRight, pRest, sTrans);
      }

      Offset pFar = Offset.zero;
      if (v.weightForearmRight > 0.0) {
        pFar = _transformBonePoint(rERight, rWRight, eRight, wRight, pRest, sTrans);
      }

      // Linear Blend Skinning
      final xScreen = pTorso.dx * v.weightTorso +
          pUal.dx * v.weightUpperArmLeft +
          pFal.dx * v.weightForearmLeft +
          pUar.dx * v.weightUpperArmRight +
          pFar.dx * v.weightForearmRight;

      final yScreen = pTorso.dy * v.weightTorso +
          pUal.dy * v.weightUpperArmLeft +
          pFal.dy * v.weightForearmLeft +
          pUar.dy * v.weightUpperArmRight +
          pFar.dy * v.weightForearmRight;

      positions[i] = Offset(xScreen, yScreen);
    }

    return ui.Vertices(
      ui.VertexMode.triangles,
      positions,
      textureCoordinates: textureCoords,
      indices: indices,
    );
  }

  /// Aplica matriz 4x4 a un punto 2D
  Offset _transformPoint(Matrix4 m, Offset p) {
    final s = m.storage;
    final x = s[0] * p.dx + s[4] * p.dy + s[12];
    final y = s[1] * p.dx + s[5] * p.dy + s[13];
    return Offset(x, y);
  }

  /// Transforma un punto textil según la cinemática de un hueso específico (origen -> destino)
  Offset _transformBonePoint(
    Offset rStart,
    Offset rEnd,
    Offset cStart,
    Offset cEnd,
    Offset p,
    double sTransverse,
  ) {
    final vRest = rEnd - rStart;
    final lenRest = vRest.distance;
    if (lenRest < 1e-5) return cStart;

    final uRest = vRest / lenRest; // Vector director hueso en reposo
    final vRestPerp = Offset(-uRest.dy, uRest.dx); // Vector normal

    final vCurr = cEnd - cStart;
    final lenCurr = vCurr.distance;
    final uCurr = lenCurr > 1e-5 ? vCurr / lenCurr : uRest;
    final vCurrPerp = Offset(-uCurr.dy, uCurr.dx);

    final diff = p - rStart;
    final xLong = diff.dx * uRest.dx + diff.dy * uRest.dy;
    final yTrans = diff.dx * vRestPerp.dx + diff.dy * vRestPerp.dy;

    // Escala longitudinal y transversal
    final sLong = (lenCurr / lenRest).clamp(0.5, 2.0);

    return cStart + uCurr * (xLong * sLong) + vCurrPerp * (yTrans * sTransverse);
  }
}
