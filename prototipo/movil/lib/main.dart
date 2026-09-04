import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'modules/auth/views/login_screen.dart';

void main() {
  runApp(const FashionStoreApp());
}

class FashionStoreApp extends StatelessWidget {
  const FashionStoreApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FashionStore Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const LoginScreen(),
    );
  }
}
