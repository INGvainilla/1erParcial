import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import 'registro_screen.dart';
import 'otp_screen.dart';
import '../../catalogo/views/catalogo_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: "alberto.delgado@store.bo");
  final _passwordController = TextEditingController(text: "Admin123*");
  bool _isLoading = false;
  String? _errorMessage;

  // ===========================================================================
  // CASO DE USO: CU01 - Autenticar Usuario y Control de Acceso (RBAC)
  // ===========================================================================
  Future<void> _iniciarSesion() async {
    // Paso 1: El usuario ingresa credenciales (email y password) en la app móvil
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = "Complete todos los campos de acceso.");
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // Paso 1.1: ILoginBoundary invoca solicitarAutenticacion mediante POST a /api/v1/auth/login
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.login),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email, "password": password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Paso 1.2: Se recibe token JWT con rol asignado
        final token = data["access_token"];
        final rol = data["rol"];
        final nombre = data["nombre_completo"];

        // Paso 1.3: Redirección al catálogo móvil con sesión iniciada
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Bienvenido, $nombre ($rol)")),
        );

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const CatalogoScreen()),
        );
      } else {
        // Paso 1.4: Si la cuenta fue bloqueada por 5 intentos erróneos, mostrar feedback preventivo
        setState(() {
          _errorMessage = data["detail"] ?? "Error en autenticación.";
        });
      }
    } catch (e) {
      setState(() => _errorMessage = "Error de conexión con el servidor.");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              const Icon(Icons.checkroom, size: 64, color: Color(0xFF6366F1)),
              const SizedBox(height: 16),
              const Text(
                "FashionStore",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const Text(
                "Plataforma Omnicanal Masculina",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 40),

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
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: "Correo Electrónico",
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: "Contraseña",
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const OtpScreen()));
                  },
                  child: const Text("¿Olvidó su contraseña?"),
                ),
              ),
              const SizedBox(height: 16),

              ElevatedButton(
                onPressed: _isLoading ? null : _iniciarSesion,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Iniciar Sesión", style: TextStyle(fontSize: 16)),
              ),
              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("¿No tienes cuenta?"),
                  TextButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const RegistroScreen()));
                    },
                    child: const Text("Regístrate"),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
