import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import '../../catalogo/views/catalogo_screen.dart';

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
  bool _isLoading = false;
  String? _errorMessage;

  // ===========================================================================
  // CASO DE USO: CU02 - Registrar Cliente (Auto-registro de Clientes)
  // ===========================================================================
  Future<void> _procesarRegistro() async {
    // Paso 1: El cliente ingresa sus datos personales y contraseña en IRegistroBoundary
    final nombres = _nombresController.text.trim();
    final apellidos = _apellidosController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final telefono = _telefonoController.text.trim();

    if (nombres.isEmpty || apellidos.isEmpty || email.isEmpty || password.length < 8) {
      setState(() => _errorMessage = "Complete todos los campos. Clave mínima de 8 caracteres.");
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // Paso 1.1: Envío del payload a POST /api/v1/auth/registro
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.registro),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "nombres": nombres,
          "apellidos": apellidos,
          "email": email,
          "password": password,
          "telefono": telefono.isNotEmpty ? telefono : null,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // Paso 1.2: Registro persistido en PostgreSQL con rol CLIENTE y Bcrypt
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Cuenta creada exitosamente. ¡Bienvenido a FashionStore!")),
        );

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const CatalogoScreen()),
        );
      } else {
        setState(() {
          _errorMessage = data["detail"] ?? "No se pudo completar el registro.";
        });
      }
    } catch (e) {
      setState(() => _errorMessage = "Error de conexión.");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Crear Cuenta de Cliente")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red),
                  ),
                  child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                ),

              TextField(
                controller: _nombresController,
                decoration: const InputDecoration(labelText: "Nombres", border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _apellidosController,
                decoration: const InputDecoration(labelText: "Apellidos", border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: "Correo Electrónico", border: OutlineInputBorder()),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _telefonoController,
                decoration: const InputDecoration(labelText: "Teléfono Móvil", border: OutlineInputBorder()),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: "Contraseña (min. 8 caracteres)", border: OutlineInputBorder()),
                obscureText: true,
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: _isLoading ? null : _procesarRegistro,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Registrarme", style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
