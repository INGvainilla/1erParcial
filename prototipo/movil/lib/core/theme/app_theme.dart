import 'package:flutter/material.dart';

class AppTheme {
  static const Color bgMain = Color(0xFF0B0F19);
  static const Color bgSurface = Color(0xFF111827);
  static const Color accentPrimary = Color(0xFF6366F1);
  static const Color accentSecondary = Color(0xFF8B5CF6);
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color success = Color(0xFF10B981);
  static const Color danger = Color(0xFFEF4444);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgMain,
      primaryColor: accentPrimary,
      cardColor: bgSurface,
      colorScheme: const ColorScheme.dark(
        primary: accentPrimary,
        secondary: accentSecondary,
        surface: bgSurface,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSurface,
        elevation: 0,
        centerTitle: true,
      ),
    );
  }
}
