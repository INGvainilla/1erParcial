import 'dart:async';
import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import '../../../../core/theme/app_theme.dart';

class ModalBusquedaVozReal extends StatefulWidget {
  final Function(String) onTextoConfirmado;
  final String titulo;

  const ModalBusquedaVozReal({
    Key? key,
    required this.onTextoConfirmado,
    this.titulo = 'Búsqueda por Voz (CU23)',
  }) : super(key: key);

  @override
  State<ModalBusquedaVozReal> createState() => _ModalBusquedaVozRealState();
}

class _ModalBusquedaVozRealState extends State<ModalBusquedaVozReal>
    with SingleTickerProviderStateMixin {
  late stt.SpeechToText _speech;
  bool _speechDisponible = false;
  bool _escuchando = false;
  String _palabrasReconocidas = '';
  String _estadoMensaje = 'Iniciando micrófono...';
  late AnimationController _animController;
  late Animation<double> _pulseAnimation;
  final TextEditingController _textController = TextEditingController();

  final List<String> _frasesSugeridas = [
    'Traje ejecutivo formal',
    'Camisa fresca de lino para el calor',
    'Pantalón chino azul marino',
    'Zapatos formales oxford café',
    'Ropa ligera de verano',
    'Blazer moderno para una boda',
  ];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.28).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );

    _speech = stt.SpeechToText();
    _inicializarYEscuchar();
  }

  @override
  void dispose() {
    _animController.dispose();
    _textController.dispose();
    try {
      _speech.stop();
    } catch (_) {}
    super.dispose();
  }

  Future<void> _inicializarYEscuchar() async {
    try {
      final disponible = await _speech.initialize(
        onStatus: _onSpeechStatus,
        onError: _onSpeechError,
      );

      if (!mounted) return;

      setState(() {
        _speechDisponible = disponible;
      });

      if (disponible) {
        _comenzarEscucha();
      } else {
        setState(() {
          _estadoMensaje = 'Reconocimiento de voz no disponible. Puedes escribir o tocar una sugerencia.';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _speechDisponible = false;
        _estadoMensaje = 'No se pudo acceder al micrófono. Usa el teclado o las frases rápidas.';
      });
    }
  }

  void _onSpeechStatus(String status) {
    if (!mounted) return;
    if (status == 'listening') {
      setState(() {
        _escuchando = true;
        _estadoMensaje = 'Escuchando... ¡Habla ahora!';
      });
      _animController.repeat(reverse: true);
    } else if (status == 'notListening' || status == 'done') {
      setState(() {
        _escuchando = false;
        _estadoMensaje = _palabrasReconocidas.isNotEmpty
            ? '¡Audio reconocido! Pulsa Buscar o edita el texto.'
            : 'Toca el micrófono para hablar nuevamente.';
      });
      _animController.stop();
      _animController.reset();
    }
  }

  void _onSpeechError(SpeechRecognitionError error) {
    if (!mounted) return;
    setState(() {
      _escuchando = false;
      if (error.errorMsg == 'error_no_match') {
        _estadoMensaje = 'No se entendió el audio. Toca el micrófono para reintentar.';
      } else {
        _estadoMensaje = 'Micrófono en espera (${error.errorMsg}).';
      }
    });
    _animController.stop();
    _animController.reset();
  }

  Future<void> _comenzarEscucha() async {
    if (!_speechDisponible) {
      final reiniciado = await _speech.initialize(
        onStatus: _onSpeechStatus,
        onError: _onSpeechError,
      );
      if (!reiniciado) return;
      _speechDisponible = true;
    }

    setState(() {
      _escuchando = true;
      _estadoMensaje = 'Escuchando... Di lo que buscas:';
    });
    _animController.repeat(reverse: true);

    try {
      await _speech.listen(
        onResult: (SpeechRecognitionResult result) {
          if (!mounted) return;
          setState(() {
            _palabrasReconocidas = result.recognizedWords;
            _textController.text = _palabrasReconocidas;
          });

          // Si es el resultado final y detectó palabras, auto-preparar búsqueda
          if (result.finalResult && _palabrasReconocidas.trim().isNotEmpty) {
            setState(() {
              _escuchando = false;
              _estadoMensaje = 'Texto reconocido. Pulsa Buscar para continuar.';
            });
            _animController.stop();
            _animController.reset();
          }
        },
        listenFor: const Duration(seconds: 12),
        pauseFor: const Duration(seconds: 3),
        partialResults: true,
        localeId: 'es_BO',
        cancelOnError: true,
        listenMode: stt.ListenMode.search,
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _escuchando = false;
        _estadoMensaje = 'Error al activar escucha: $e';
      });
      _animController.stop();
      _animController.reset();
    }
  }

  void _detenerEscucha() async {
    try {
      await _speech.stop();
    } catch (_) {}
    if (!mounted) return;
    setState(() {
      _escuchando = false;
      _estadoMensaje = 'Escucha pausada.';
    });
    _animController.stop();
    _animController.reset();
  }

  void _confirmarBusqueda(String texto) {
    final query = texto.trim();
    if (query.isEmpty) return;
    _detenerEscucha();
    Navigator.pop(context);
    widget.onTextoConfirmado(query);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              widget.titulo,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Dicta tu estilo, color, prenda o clima en lenguaje natural',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 24),

            // Botón interactivo de Micrófono con Pulso Real
            GestureDetector(
              onTap: () {
                if (_escuchando) {
                  _detenerEscucha();
                } else {
                  _comenzarEscucha();
                }
              },
              child: AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  final scale = _escuchando ? _pulseAnimation.value : 1.0;
                  return Transform.scale(
                    scale: scale,
                    child: Container(
                      width: 86,
                      height: 86,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _escuchando
                            ? AppTheme.accentGold.withOpacity(0.28)
                            : AppTheme.bgCard,
                        border: Border.all(
                          color: _escuchando ? AppTheme.accentGold : Colors.white24,
                          width: _escuchando ? 2.5 : 1.5,
                        ),
                        boxShadow: _escuchando
                            ? [
                                BoxShadow(
                                  color: AppTheme.accentGold.withOpacity(0.4),
                                  blurRadius: 24,
                                  spreadRadius: 4,
                                ),
                              ]
                            : null,
                      ),
                      child: Icon(
                        _escuchando ? Icons.mic : Icons.mic_none,
                        size: 42,
                        color: _escuchando ? AppTheme.accentGold : Colors.white70,
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 14),

            // Estado de reconocimiento en vivo
            Text(
              _estadoMensaje,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: _escuchando ? AppTheme.accentGold : AppTheme.textSecondary,
                fontSize: 12,
                fontWeight: _escuchando ? FontWeight.w600 : FontWeight.normal,
              ),
            ),

            const SizedBox(height: 16),

            // Caja con el texto reconocido en tiempo real y edición manual
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _palabrasReconocidas.isNotEmpty
                      ? AppTheme.accentGold.withOpacity(0.6)
                      : Colors.white12,
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        hintText: 'Palabras reconocidas aparecerán aquí...',
                        hintStyle: TextStyle(color: Colors.white30, fontSize: 13),
                        isDense: true,
                      ),
                      onChanged: (val) {
                        setState(() => _palabrasReconocidas = val);
                      },
                    ),
                  ),
                  if (_textController.text.isNotEmpty)
                    IconButton(
                      icon: const Icon(Icons.clear, size: 18, color: Colors.white54),
                      onPressed: () {
                        setState(() {
                          _textController.clear();
                          _palabrasReconocidas = '';
                        });
                      },
                    ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Botón de Confirmación / Búsqueda
            if (_textController.text.trim().isNotEmpty)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accentGold,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.search, size: 18),
                  label: Text(
                    'Buscar: "${_textController.text.trim()}"',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  onPressed: () => _confirmarBusqueda(_textController.text),
                ),
              ),

            const SizedBox(height: 16),

            // Sugerencias rápidas por si no desea hablar
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Comandos y sugerencias frecuentes:',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 8),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _frasesSugeridas.map((frase) {
                return ActionChip(
                  backgroundColor: AppTheme.bgCard,
                  side: const BorderSide(color: Colors.white12),
                  label: Text(
                    frase,
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                  onPressed: () => _confirmarBusqueda(frase),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
