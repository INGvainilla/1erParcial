import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fashionstore_mobile/core/providers/auth_provider.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';

class RegistroScreen extends StatefulWidget {
  const RegistroScreen({Key? key}) : super(key: key);

  @override
  State<RegistroScreen> createState() => _RegistroScreenState();
}

class _RegistroScreenState extends State<RegistroScreen> {
  final _nombresController = TextEditingController();
  final _apellidosController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _telefonoController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _nombresController.dispose();
    _apellidosController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _telefonoController.dispose();
    super.dispose();
  }

  bool get _tiene8Caracteres => _passwordController.text.length >= 8;
  bool get _tieneMayuscula => RegExp(r'[A-Z]').hasMatch(_passwordController.text);
  bool get _tieneMinuscula => RegExp(r'[a-z]').hasMatch(_passwordController.text);
  bool get _tieneNumeroSimbolo => RegExp(r'[0-9!@#\$%^&*(),.?":{}|<>]').hasMatch(_passwordController.text);
  bool get _cumpleRequisitosPassword =>
      _tiene8Caracteres && _tieneMayuscula && _tieneMinuscula && _tieneNumeroSimbolo;

  Widget _buildRequisitoItem(String texto, bool cumplido) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        children: [
          Icon(
            cumplido ? Icons.check_circle : Icons.radio_button_unchecked,
            size: 16,
            color: cumplido ? AppTheme.success : AppTheme.textSecondary,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              texto,
              style: TextStyle(
                color: cumplido ? Colors.white : AppTheme.textSecondary,
                fontSize: 12,
                fontWeight: cumplido ? FontWeight.w500 : FontWeight.normal,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _procesarRegistro() async {
    final nombres = _nombresController.text.trim();
    final apellidos = _apellidosController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final telefono = _telefonoController.text.trim();

    if (nombres.isEmpty || apellidos.isEmpty || email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor completa todos los campos personales obligatorios.'),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    if (!_cumpleRequisitosPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('La contraseña debe cumplir con todos los requisitos de seguridad listados.'),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final ok = await auth.registro(
      nombres: nombres,
      apellidos: apellidos,
      email: email,
      password: password,
      telefono: telefono.isNotEmpty ? telefono : null,
    );

    if (!mounted) return;

    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('¡Bienvenido $nombres! Cuenta creada y sesión iniciada con éxito.'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Crear Cuenta de Cliente'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (auth.errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: AppTheme.danger.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.danger.withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppTheme.danger, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          auth.errorMessage!,
                          style: const TextStyle(color: AppTheme.danger, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),

              TextField(
                controller: _nombresController,
                decoration: const InputDecoration(
                  labelText: 'Nombres *',
                  prefixIcon: Icon(Icons.person_outline, size: 20),
                ),
              ),
              const SizedBox(height: 14),

              TextField(
                controller: _apellidosController,
                decoration: const InputDecoration(
                  labelText: 'Apellidos *',
                  prefixIcon: Icon(Icons.person_outline, size: 20),
                ),
              ),
              const SizedBox(height: 14),

              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Correo Electrónico *',
                  prefixIcon: Icon(Icons.email_outlined, size: 20),
                  hintText: 'ejemplo@correo.com',
                ),
              ),
              const SizedBox(height: 14),

              TextField(
                controller: _telefonoController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Teléfono Celular (opcional)',
                  prefixIcon: Icon(Icons.phone_outlined, size: 20),
                  hintText: '70012345',
                ),
              ),
              const SizedBox(height: 14),

              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Contraseña *',
                  hintText: 'Ej: Moda2026*',
                  prefixIcon: const Icon(Icons.lock_outline, size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 20,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Panel Informativo de Requisitos de Contraseña
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.bgCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _cumpleRequisitosPassword
                        ? AppTheme.success.withOpacity(0.4)
                        : Colors.white12,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _cumpleRequisitosPassword ? Icons.check_circle : Icons.shield_outlined,
                          size: 16,
                          color: _cumpleRequisitosPassword ? AppTheme.success : AppTheme.accentGold,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Requisitos de seguridad de contraseña:',
                          style: TextStyle(
                            color: AppTheme.accentGold,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    _buildRequisitoItem('Mínimo 8 caracteres', _tiene8Caracteres),
                    _buildRequisitoItem('Al menos una letra mayúscula (A-Z)', _tieneMayuscula),
                    _buildRequisitoItem('Al menos una letra minúscula (a-z)', _tieneMinuscula),
                    _buildRequisitoItem(
                      'Al menos un número (0-9) o símbolo (*, @, #, etc.)',
                      _tieneNumeroSimbolo,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: auth.isLoading ? null : _procesarRegistro,
                child: auth.isLoading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(color: AppTheme.bgMain, strokeWidth: 2),
                      )
                    : const Text('Registrarme como Cliente'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
