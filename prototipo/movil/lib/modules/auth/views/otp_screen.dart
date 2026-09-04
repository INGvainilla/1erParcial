import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({Key? key}) : super(key: key);

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _emailController = TextEditingController(text: "rodrigo.cliente@gmail.com");
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();

  bool _otpEnviado = false;
  bool _isLoading = false;
  String? _message;
  bool _isError = false;

  // ===========================================================================
  // CASO DE USO: CU03 - Recuperar Contraseña vía Token OTP de 6 Dígitos
  // ===========================================================================
  Future<void> _solicitarOtp() async {
    // Paso 1: El usuario solicita código OTP para su correo
    final email = _emailController.text.trim();
    if (email.isEmpty) return;

    setState(() {
      _isLoading = true;
      _message = null;
    });

    // Paso 1.1: IRecuperarClaveBoundary envía solicitarOtpRecuperacion a /api/v1/auth/recuperar-password/solicitar
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.solicitarOtp),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email}),
      );

      final data = jsonDecode(response.body);
      setState(() {
        _otpEnviado = true;
        _isError = false;
        _message = data["mensaje"] ?? "Código OTP de 6 dígitos enviado.";
      });
    } catch (e) {
      setState(() {
        _isError = true;
        _message = "Error al solicitar código OTP.";
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _verificarOtpYReset() async {
    // Paso 2: El usuario ingresa el código OTP y la nueva clave
    final email = _emailController.text.trim();
    final otp = _otpController.text.trim();
    final newPass = _newPasswordController.text;

    if (otp.length != 6 || newPass.length < 8) {
      setState(() {
        _isError = true;
        _message = "Ingrese el OTP de 6 dígitos y contraseña mínima de 8 caracteres.";
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _message = null;
    });

    // Paso 2.1: Validación de token OTP y actualización de contraseña en backend
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.verificarOtp),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "email": email,
          "codigo_otp": otp,
          "nueva_password": newPass,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data["mensaje"] ?? "Contraseña restablecida con éxito.")),
        );
        Navigator.pop(context);
      } else {
        setState(() {
          _isError = true;
          _message = data["detail"] ?? "Código OTP incorrecto o expirado.";
        });
      }
    } catch (e) {
      setState(() {
        _isError = true;
        _message = "Error al verificar código OTP.";
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Recuperar Contraseña (OTP)")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_message != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: _isError ? Colors.red.withOpacity(0.1) : Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _isError ? Colors.red : Colors.green),
                  ),
                  child: Text(_message!, style: TextStyle(color: _isError ? Colors.red : Colors.green)),
                ),

              if (!_otpEnviado) ...[
                const Text(
                  "Ingrese su correo electrónico para recibir un código criptográfico de 6 dígitos con 15 minutos de vigencia.",
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: "Correo Electrónico", border: OutlineInputBorder()),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _isLoading ? null : _solicitarOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text("Solicitar Código OTP"),
                ),
              ] else ...[
                const Text(
                  "Ingrese el código OTP recibido en su correo y defina su nueva contraseña.",
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _otpController,
                  decoration: const InputDecoration(
                    labelText: "Código OTP (6 dígitos)",
                    border: OutlineInputBorder(),
                    hintText: "123456",
                  ),
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 20, letterSpacing: 4),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _newPasswordController,
                  decoration: const InputDecoration(
                    labelText: "Nueva Contraseña (min. 8 caracteres)",
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _isLoading ? null : _verificarOtpYReset,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text("Restablecer Contraseña"),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
