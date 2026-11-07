import 'dart:io';

class NetworkService {
  static bool modoOfflineForzado = false;

  /// Verifica si el dispositivo cuenta con conexión real a Internet (Wi-Fi o Datos Móviles).
  /// Si el teléfono tiene Wi-Fi y Datos Móviles apagados, las consultas DNS externas fallarán
  /// incluso si el teléfono está conectado por cable USB con adb reverse.
  static Future<bool> tieneInternetReal() async {
    if (modoOfflineForzado) return false;

    try {
      final lookup = await InternetAddress.lookup('google.com')
          .timeout(const Duration(milliseconds: 1800));
      return lookup.isNotEmpty && lookup[0].rawAddress.isNotEmpty;
    } catch (_) {
      // Sin DNS o sin red externa (Modo Avión / Sin Datos / Sin Wi-Fi)
      return false;
    }
  }
}

