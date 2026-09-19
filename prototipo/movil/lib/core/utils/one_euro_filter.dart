import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Filtro de paso bajo exponencial simple.
/// Forma la base del filtro 1€.
class LowPassFilter {
  double _y = 0.0;
  double _s = 0.0;
  bool _initialized = false;

  /// Aplica el filtro con un factor de suavizado [alpha] ∈ (0, 1].
  /// alpha → 0: suavizado agresivo (mucho lag).
  /// alpha → 1: sin suavizado (sin lag, pero sin filtrado).
  double filter(double value, double alpha) {
    if (!_initialized) {
      _initialized = true;
      _s = value;
      _y = value;
      return value;
    }
    _y = value;
    _s = alpha * value + (1.0 - alpha) * _s;
    return _s;
  }

  double get lastRawValue => _y;
  double get lastFilteredValue => _s;
  bool get isInitialized => _initialized;

  void reset() {
    _initialized = false;
    _y = 0.0;
    _s = 0.0;
  }
}

/// Implementación del Filtro 1€ (One Euro Filter) — Casiez et al., 2012.
///
/// Filtro de paso bajo adaptativo que ajusta dinámicamente su frecuencia
/// de corte según la velocidad de la señal:
/// - Velocidad baja (usuario quieto) → cutoff bajo → suavizado agresivo → elimina jitter.
/// - Velocidad alta (usuario moviéndose) → cutoff alto → respuesta rápida → sin lag.
///
/// Parámetros:
/// - [freq]: Frecuencia de muestreo en Hz (típicamente ~30 para ML Kit).
/// - [minCutoff]: Frecuencia de corte mínima en Hz (controla suavizado base).
/// - [beta]: Factor de reactividad a la velocidad de la señal.
/// - [dCutoff]: Frecuencia de corte para el filtro de la derivada.
class OneEuroFilter {
  double freq;
  double minCutoff;
  double beta;
  double dCutoff;

  final LowPassFilter _xFilter = LowPassFilter();
  final LowPassFilter _dxFilter = LowPassFilter();
  double _lastTime = -1.0;

  OneEuroFilter({
    this.freq = 30.0,
    this.minCutoff = 1.0,
    this.beta = 0.007,
    this.dCutoff = 1.0,
  });

  /// Calcula el factor de suavizado alpha a partir de la frecuencia de corte [cutoff].
  double _alpha(double cutoff) {
    final te = 1.0 / freq;
    final tau = 1.0 / (2.0 * math.pi * cutoff);
    return 1.0 / (1.0 + tau / te);
  }

  /// Filtra un valor escalar [value] en el instante [timestamp] (en segundos).
  /// Si [timestamp] es null, usa el reloj interno basado en [freq].
  double filter(double value, {double? timestamp}) {
    if (timestamp != null && _lastTime >= 0.0) {
      final dt = timestamp - _lastTime;
      if (dt > 0.0) {
        freq = 1.0 / dt;
      }
    }
    _lastTime = timestamp ?? (_lastTime + 1.0 / freq);

    // Estimar la derivada (velocidad) de la señal
    final double dValue = _xFilter.isInitialized
        ? (value - _xFilter.lastFilteredValue) * freq
        : 0.0;

    // Filtrar la derivada
    final edValue = _dxFilter.filter(dValue, _alpha(dCutoff));

    // Adaptar la frecuencia de corte según la velocidad
    final cutoff = minCutoff + beta * edValue.abs();

    // Filtrar el valor con la frecuencia de corte adaptada
    return _xFilter.filter(value, _alpha(cutoff));
  }

  void reset() {
    _xFilter.reset();
    _dxFilter.reset();
    _lastTime = -1.0;
  }
}

/// Filtro 1€ bidimensional para suavizar coordenadas `Offset` (x, y).
/// Aplica un filtro 1€ independiente a cada eje.
class OneEuroFilter2D {
  final OneEuroFilter _filterX;
  final OneEuroFilter _filterY;

  OneEuroFilter2D({
    double freq = 30.0,
    double minCutoff = 1.0,
    double beta = 0.007,
    double dCutoff = 1.0,
  })  : _filterX = OneEuroFilter(
          freq: freq,
          minCutoff: minCutoff,
          beta: beta,
          dCutoff: dCutoff,
        ),
        _filterY = OneEuroFilter(
          freq: freq,
          minCutoff: minCutoff,
          beta: beta,
          dCutoff: dCutoff,
        );

  /// Filtra un punto 2D [point] en el instante [timestamp] (en segundos).
  Offset filter(Offset point, {double? timestamp}) {
    return Offset(
      _filterX.filter(point.dx, timestamp: timestamp),
      _filterY.filter(point.dy, timestamp: timestamp),
    );
  }

  void reset() {
    _filterX.reset();
    _filterY.reset();
  }
}
