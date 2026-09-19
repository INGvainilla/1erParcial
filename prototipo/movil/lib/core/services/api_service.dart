import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final _storage = const FlutterSecureStorage();
  static const _tokenKey = 'jwt_auth_token';

  String? _cachedToken;

  Future<void> saveToken(String token) async {
    _cachedToken = token;
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    if (_cachedToken != null) return _cachedToken;
    _cachedToken = await _storage.read(key: _tokenKey);
    return _cachedToken;
  }

  Future<void> clearToken() async {
    _cachedToken = null;
    await _storage.delete(key: _tokenKey);
  }

  Future<Map<String, String>> _headers({bool requiresAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (requiresAuth) {
      final token = await getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  dynamic _processResponse(http.Response res) {
    dynamic decoded;
    try {
      decoded = jsonDecode(utf8.decode(res.bodyBytes));
    } catch (_) {
      decoded = null;
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return decoded;
    }

    String errorMsg = 'Error en el servidor (${res.statusCode})';
    if (decoded is Map<String, dynamic> && decoded.containsKey('detail')) {
      final detail = decoded['detail'];
      if (detail is String) {
        errorMsg = detail;
      } else if (detail is List && detail.isNotEmpty) {
        // FastAPI Pydantic validation error format
        final first = detail.first;
        if (first is Map && first.containsKey('msg')) {
          errorMsg = first['msg'].toString();
        } else {
          errorMsg = detail.toString();
        }
      }
    }
    throw ApiException(res.statusCode, errorMsg);
  }

  Future<dynamic> get(String url, {bool requiresAuth = true}) async {
    try {
      final headers = await _headers(requiresAuth: requiresAuth);
      final res = await http.get(Uri.parse(url), headers: headers);
      return _processResponse(res);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(0, 'No se pudo conectar con el servidor: $e');
    }
  }

  Future<dynamic> post(String url, {Map<String, dynamic>? body, bool requiresAuth = true}) async {
    try {
      final headers = await _headers(requiresAuth: requiresAuth);
      final res = await http.post(
        Uri.parse(url),
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(res);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(0, 'No se pudo conectar con el servidor: $e');
    }
  }

  Future<dynamic> put(String url, {Map<String, dynamic>? body, bool requiresAuth = true}) async {
    try {
      final headers = await _headers(requiresAuth: requiresAuth);
      final res = await http.put(
        Uri.parse(url),
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(res);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(0, 'No se pudo conectar con el servidor: $e');
    }
  }

  Future<dynamic> patch(String url, {Map<String, dynamic>? body, bool requiresAuth = true}) async {
    try {
      final headers = await _headers(requiresAuth: requiresAuth);
      final res = await http.patch(
        Uri.parse(url),
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(res);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(0, 'No se pudo conectar con el servidor: $e');
    }
  }

  Future<dynamic> delete(String url, {bool requiresAuth = true}) async {
    try {
      final headers = await _headers(requiresAuth: requiresAuth);
      final res = await http.delete(Uri.parse(url), headers: headers);
      return _processResponse(res);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(0, 'No se pudo conectar con el servidor: $e');
    }
  }
}
