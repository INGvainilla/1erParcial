import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fashionstore_mobile/core/providers/auth_provider.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({Key? key}) : super(key: key);

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _emailController = TextEditingController(text: 'rodrigo.cliente@gmail.com');
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();

  bool _otpEnviado = false;
  String? _infoMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }

  // CU03: Recuperar Contraseña (Token OTP de 6 Dígitos), Paso 1: Usuario ingresa correo y solicita recuperación
  Future<void> _solicitarOtp() async {
    // CU03: Recuperar Contraseña (Token OTP), Paso 1.1: IRecuperarBoundary captura el correo electrónico
    final email = _emailController.text.trim();
    if (email.isEmpty) return;

    // CU03: Recuperar Contraseña (Token OTP), Paso 1.2: Enviar solicitud de generación de OTP al servidor
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final msg = await auth.solicitarOtp(email);

    if (!mounted) return;
    if (msg != null) {
      // CU03: Recuperar Contraseña (Token OTP), Paso 1.3: Cambiar UI a formulario de validación OTP y nueva clave
      setState(() {
        _otpEnviado = true;
        _infoMessage = msg;
      });
    }
  }

  // CU03: Recuperar Contraseña (Token OTP de 6 Dígitos), Paso 2: Usuario ingresa OTP de 6 dígitos y nueva clave
  Future<void> _verificarOtpYReset() async {
    // CU03: Recuperar Contraseña (Token OTP), Paso 2.1: Captura de campos OTP, correo y nueva contraseña
    final email = _emailController.text.trim();
    final otp = _otpController.text.trim();
    final newPass = _newPasswordController.text;

    // CU03: Recuperar Contraseña (Token OTP), Paso 2.2: Validación de longitud y formato seguro
    if (otp.length != 6 || newPass.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ingrese el código de 6 dígitos y contraseña de al menos 8 caracteres.'),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    // CU03: Recuperar Contraseña (Token OTP), Paso 2.3: Invocar endpoint de verificación de OTP y actualización de contraseña
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final ok = await auth.resetPasswordOtp(
      email: email,
      codigoOtp: otp,
      nuevaPassword: newPass,
    );

    if (!mounted) return;
    // CU03: Recuperar Contraseña (Token OTP), Paso 2.4: Notificar éxito y redirigir a inicio de sesión
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recuperar Contraseña (OTP)'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_infoMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.success.withOpacity(0.3)),
                  ),
                  child: Text(_infoMessage!, style: const TextStyle(color: AppTheme.success, fontSize: 13)),
                ),

              if (auth.errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.danger.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.danger.withOpacity(0.4)),
                  ),
                  child: Text(auth.errorMessage!, style: const TextStyle(color: AppTheme.danger, fontSize: 13)),
                ),

              if (!_otpEnviado) ...[
                const Text(
                  'Ingresa tu correo electrónico para recibir un código criptográfico de 6 dígitos con 15 minutos de vigencia.',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Correo Electrónico',
                    prefixIcon: Icon(Icons.email_outlined, size: 20),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: auth.isLoading ? null : _solicitarOtp,
                  child: auth.isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: AppTheme.bgMain, strokeWidth: 2),
                        )
                      : const Text('Enviar Código OTP'),
                ),
              ] else ...[
                const Text(
                  'Ingresa el código OTP de 6 dígitos recibido en tu correo e introduce tu nueva contraseña.',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 22, letterSpacing: 6, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    labelText: 'Código OTP (6 dígitos)',
                    hintText: '123456',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _newPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Nueva Contraseña (min. 8 caracteres)',
                    prefixIcon: Icon(Icons.lock_outline, size: 20),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: auth.isLoading ? null : _verificarOtpYReset,
                  child: auth.isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: AppTheme.bgMain, strokeWidth: 2),
                        )
                      : const Text('Restablecer Contraseña'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
