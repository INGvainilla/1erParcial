# -*- coding: utf-8 -*-
"""
Servicio de Envio de Correos Electronicos via SMTP (Gmail) y Auditoria Local
Implementa:
- CU03: Recuperacion de Contrasena via Token OTP de 6 Digitos.
- CU02: Bienvenida al Cliente Registrado.
- CU14 / CU16 / CU17: Facturacion Electronica Oficial y Comprobantes de Pago Digital
  (Diseno 100% Estetico, Formal, Bien Organizado y Totalmente Adaptativo / Mobile Responsive).
- CU01 / CU03 / CU17: Facturacion Oficial de Suscripcion SaaS B2B.
"""
import os
import hashlib
import urllib.parse
import smtplib
import threading
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def _despachar_email_robusto(msg: MIMEMultipart, destinatarios: list, tipo_correo: str = "Notificacion") -> bool:
    """
    Despacha el correo via SMTP (Gmail) y registra SIEMPRE una copia integra
    en el archivo de auditoria local backend/emails_enviados_audit.log.
    """
    dest_limpios = list(set([d.strip().lower() for d in destinatarios if d and "@" in d]))

    # 1. Registrar SIEMPRE en archivo de auditoria local
    try:
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "emails_enviados_audit.log")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*75}\n")
            f.write(f"FECHA: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"TIPO: {tipo_correo}\n")
            f.write(f"DESTINATARIOS: {', '.join(dest_limpios)}\n")
            f.write(f"ASUNTO: {msg['Subject']}\n")
            f.write(f"{'-'*75}\n")
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    f.write(part.get_payload(decode=True).decode("utf-8", errors="ignore"))
                    break
            f.write(f"\n{'='*75}\n")
        print(f" [EMAIL AUDIT] Correo '{msg['Subject']}' respaldado en emails_enviados_audit.log")
    except Exception as ex_audit:
        print(f" [EMAIL AUDIT ERROR] No se pudo escribir log local: {ex_audit}")

    # 2. Despacho SMTP
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print(f" [SMTP SIMULADO] EMAIL_HOST_USER o PASSWORD no configurados en .env.")
        return True

    user = settings.EMAIL_HOST_USER
    pwd = settings.EMAIL_HOST_PASSWORD.replace(" ", "")

    # Intento 1: Puerto 587 con STARTTLS
    try:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=12)
        server.ehlo()
        if settings.EMAIL_USE_TLS:
            server.starttls()
            server.ehlo()
        server.login(user, pwd)
        server.sendmail(user, dest_limpios, msg.as_string())
        server.quit()
        print(f" [SMTP SUCCESS] Correo '{msg['Subject']}' enviado exitosamente a {dest_limpios} via {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        return True
    except Exception as e_587:
        print(f" [SMTP 587] Fallo intento en puerto 587 ({e_587}). Intentando puerto 465 SSL...")

    # Intento 2: Puerto 465 con SSL directo
    try:
        server_ssl = smtplib.SMTP_SSL(settings.EMAIL_HOST, 465, timeout=12)
        server_ssl.login(user, pwd)
        server_ssl.sendmail(user, dest_limpios, msg.as_string())
        server_ssl.quit()
        print(f" [SMTP SUCCESS] Correo '{msg['Subject']}' enviado exitosamente a {dest_limpios} via {settings.EMAIL_HOST}:465 SSL")
        return True
    except Exception as e_465:
        print(f"\n{'!'*75}")
        print(f" [SMTP ERROR GMAIL] Fallo conexion SMTP Gmail: {e_465}")
        print(f"{'!'*75}\n")
        return False


def _monto_a_literal(monto: float) -> str:
    """Convierte un importe numerico en formato literal boliviano fiscal oficial."""
    unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
    especiales = {10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE', 20: 'VEINTE'}
    decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
    centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

    def _resolver(n: int) -> str:
        if n == 0: return 'CERO'
        if n == 100: return 'CIEN'
        partes = []
        if n >= 1000:
            miles = n // 1000
            n %= 1000
            if miles == 1:
                partes.append('MIL')
            else:
                partes.append(_resolver(miles) + ' MIL')
        if n >= 100:
            c = n // 100
            n %= 100
            partes.append(centenas[c])
        if n in especiales:
            partes.append(especiales[n])
        elif 16 <= n <= 19:
            partes.append('DIECI' + unidades[n - 10])
        elif 21 <= n <= 29:
            partes.append('VEINTI' + unidades[n - 20])
        elif n >= 10:
            d = n // 10
            u = n % 10
            partes.append(decenas[d] if u == 0 else f"{decenas[d]} Y {unidades[u]}")
        elif n > 0:
            partes.append(unidades[n])
        return ' '.join(p for p in partes if p)

    try:
        entero = int(monto)
        centavos = int(round((monto - entero) * 100))
        texto = _resolver(entero)
        return f"SON: {texto} {centavos:02d}/100 BOLIVIANOS"
    except Exception:
        return f"SON: {monto:.2f} BOLIVIANOS"


# ==============================================================================
# CU03: CODIGO DE VERIFICACION OTP (ESTETICO Y RESPONSIVE)
# ==============================================================================
def _construir_mensaje_otp(destinatario: str, codigo_otp: str, nombre_usuario: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"FashionStore — Codigo de Verificacion de Seguridad: {codigo_otp}"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"FashionStore Seguridad <{settings.EMAIL_HOST_USER}>"
    msg["To"] = destinatario

    texto_plano = f"""
================================================================================
                    FASHIONSTORE — SEGURIDAD DE ACCESO
================================================================================
Estimado(a) {nombre_usuario},

Has solicitado restablecer tu contrasena de acceso en la plataforma FashionStore.
Tu codigo de verificacion oficial (OTP) es:

                             [ {codigo_otp} ]

- Tiempo de validez: {settings.OTP_EXPIRE_MINUTES} minutos a partir de la recepcion de este correo.
- Caracter: Unico e intransferible.

Si tu no has solicitado este restablecimiento de seguridad, puedes desestimar
este mensaje sin ninguna accion adicional.

Atentamente,
Departamento de Seguridad y Privacidad
FashionStore Bolivia S.R.L.
================================================================================
"""

    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Codigo de Verificacion OTP</title>
  <style type="text/css">
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ width: 100% !important; }}
      .email-card {{ border-radius: 0 !important; border-left: none !important; border-right: none !important; }}
      .content-padding {{ padding: 20px 16px !important; }}
      .otp-display {{ font-size: 30px !important; letter-spacing: 6px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">

  <center style="width: 100%; table-layout: fixed; background-color: #f1f5f9;">
    <!-- Contenedor Responsivo Principal -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin: 0 auto;" class="email-wrapper">
      <tr>
        <td align="center" style="padding: 0 12px;">

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" class="email-card">
            
            <!-- Encabezado Institucional -->
            <tr>
              <td style="background-color: #0f172a; padding: 24px 28px; text-align: center; border-bottom: 3px solid #2563eb;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                  SISTEMA DE SEGURIDAD Y ACCESO
                </div>
                <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
                  FASHIONSTORE BOLIVIA
                </div>
              </td>
            </tr>

            <!-- Cuerpo del Mensaje -->
            <tr>
              <td style="padding: 32px 28px 24px 28px;" class="content-padding">
                <p style="margin: 0 0 14px 0; font-size: 15px; color: #334155; line-height: 1.5;">
                  Estimado(a) <strong style="color: #0f172a;">{nombre_usuario}</strong>,
                </p>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  Hemos recibido una solicitud para restablecer la contrasena de tu cuenta asociada al correo <strong style="color: #0f172a;">{destinatario}</strong>. Ingresa el siguiente codigo de un solo uso en la aplicacion:
                </p>

                <!-- Tarjeta Destacada de Codigo OTP -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 22px 16px; text-align: center;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 8px;">
                        CODIGO DE AUTORIZACION (OTP)
                      </div>
                      <div class="otp-display" style="font-size: 36px; font-weight: 800; color: #1e3a8a; font-family: 'Courier New', Courier, monospace; letter-spacing: 8px;">
                        {codigo_otp}
                      </div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                        ⏱ Valido durante los proximos <strong>{settings.OTP_EXPIRE_MINUTES} minutos</strong>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Aviso de Privacidad y Seguridad -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 12px;">
                  <tr>
                    <td style="padding: 12px 14px; font-size: 12px; color: #991b1b; line-height: 1.5;">
                      <strong>Aviso de Seguridad:</strong> El personal de FashionStore jamas te solicitara este codigo por telefono, mensaje o correo. Si no reconoces esta accion, tu cuenta permanece segura y puedes ignorar esta notificacion.
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Pie de Pagina -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
                FashionStore Bolivia S.R.L. · Departamento de Seguridad de Informacion<br/>
                Av. San Martin #450, Barrio Equipetrol, Santa Cruz — Bolivia
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </center>

</body>
</html>"""

    part1 = MIMEText(texto_plano, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def enviar_correo_otp(destinatario: str, codigo_otp: str, nombre_usuario: str = "Usuario", async_send: bool = True) -> bool:
    print(f"\n{'='*75}\n [OTP GENERADO] Para: {destinatario} | Codigo: {codigo_otp}\n{'='*75}\n")
    def _tarea():
        try:
            msg = _construir_mensaje_otp(destinatario, codigo_otp, nombre_usuario)
            return _despachar_email_robusto(msg, [destinatario], tipo_correo=f"Recuperacion OTP ({codigo_otp})")
        except Exception as e:
            print(f" [SMTP ERROR] Error procesando OTP para {destinatario}: {e}")
            return False

    if async_send:
        threading.Thread(target=_tarea, daemon=True).start()
        return True
    return _tarea()


# ==============================================================================
# CU02: BIENVENIDA A CLIENTE (FORMAL, ELEGANTE Y RESPONSIVE)
# ==============================================================================
def _construir_mensaje_bienvenida(destinatario: str, nombre_usuario: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Bienvenido(a) a FashionStore Bolivia — Confirmacion de Cuenta"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"FashionStore Atencion al Cliente <{settings.EMAIL_HOST_USER}>"
    msg["To"] = destinatario

    texto_plano = f"""
================================================================================
                    FASHIONSTORE BOLIVIA S.R.L.
================================================================================
Estimado(a) {nombre_usuario},

Le damos la mas cordial bienvenida a FashionStore Bolivia.
Su cuenta de cliente ha sido registrada y activada exitosamente con el correo:
{destinatario}.

A traves de nuestra plataforma podra acceder a colecciones exclusivas, gestionar
sus pedidos en tiempo real, solicitar entregas a domicilio y consultar sus
facturas oficiales y puntos de fidelidad.

Acceso a la plataforma: http://localhost:8000/app/#/catalogo

Atentamente,
Equipo de Experiencia al Cliente
FashionStore Bolivia S.R.L.
================================================================================
"""
    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Bienvenida a FashionStore</title>
  <style type="text/css">
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ width: 100% !important; }}
      .email-card {{ border-radius: 0 !important; border-left: none !important; border-right: none !important; }}
      .content-padding {{ padding: 22px 16px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">

  <center style="width: 100%; table-layout: fixed; background-color: #f1f5f9;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto;" class="email-wrapper">
      <tr>
        <td align="center" style="padding: 0 12px;">

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" class="email-card">
            
            <tr>
              <td style="background-color: #0f172a; padding: 26px 28px; text-align: center; border-bottom: 3px solid #2563eb;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                  COMERCIO OMNICANAL & MODA EXCLUSIVA
                </div>
                <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
                  FASHIONSTORE BOLIVIA
                </div>
              </td>
            </tr>

            <tr>
              <td style="background-color: #ecfdf5; border-bottom: 1px solid #bbf7d0; padding: 10px 24px; text-align: center; color: #065f46; font-size: 12px; font-weight: 700;">
                ✓ CUENTA DE CLIENTE REGISTRADA Y ACTIVADA EXITOSAMENTE
              </td>
            </tr>

            <tr>
              <td style="padding: 30px 28px 24px 28px;" class="content-padding">
                <p style="margin: 0 0 14px 0; font-size: 15px; color: #334155; line-height: 1.5;">
                  Estimado(a) <strong style="color: #0f172a;">{nombre_usuario}</strong>,
                </p>
                <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  Es un placer darle la bienvenida a nuestra tienda digital y red de boutiques omnicanal. Su cuenta ha sido asociada satisfactoriamente a: <strong style="color: #0f172a;">{destinatario}</strong>.
                </p>

                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 18px 0;">
                  <tr>
                    <td style="padding: 16px 18px;">
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">BENEFICIOS DE SU CUENTA OFICIAL:</div>
                      <div style="font-size: 12px; color: #475569; line-height: 1.6;">
                        • Catalogo exclusivo con probador virtual y asesoramiento inteligente.<br/>
                        • Facturacion electronica oficial en linea y seguimiento logistico.<br/>
                        • Acumulacion de puntos canjeables en cada compra (Club FashionStore).
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 26px 0 12px 0;">
                  <a href="http://localhost:8000/app/#/catalogo" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px; letter-spacing: 0.3px;">
                    EXPLORAR CATALOGO DIGITAL
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
                © 2026 FashionStore Bolivia S.R.L. · NIT: 1028475029<br/>
                Santa Cruz de la Sierra — Bolivia
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </center>

</body>
</html>"""
    part1 = MIMEText(texto_plano, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def enviar_correo_bienvenida(destinatario: str, nombre_usuario: str = "Cliente", async_send: bool = True) -> bool:
    def _tarea():
        try:
            msg = _construir_mensaje_bienvenida(destinatario, nombre_usuario)
            return _despachar_email_robusto(msg, [destinatario], tipo_correo="Bienvenida Cliente")
        except Exception as e:
            print(f" [SMTP ERROR] Error procesando bienvenida para {destinatario}: {e}")
            return False

    if async_send:
        threading.Thread(target=_tarea, daemon=True).start()
        return True
    return _tarea()


# ==============================================================================
# CU03: CONFIRMACION DE CONTRASEÑA ACTUALIZADA
# ==============================================================================
def _construir_mensaje_password_cambiada(destinatario: str, nombre_usuario: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Aviso de Seguridad — Su contrasena ha sido actualizada"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"FashionStore Seguridad <{settings.EMAIL_HOST_USER}>"
    msg["To"] = destinatario

    texto_plano = f"""
================================================================================
                    FASHIONSTORE — AVISO DE SEGURIDAD
================================================================================
Estimado(a) {nombre_usuario},

Le notificamos que la contrasena de su cuenta ({destinatario}) ha sido actualizada
satisfactoriamente en nuestra plataforma.

Si usted realizo esta actualizacion, no requiere realizar ninguna accion adicional.
Puede iniciar sesion en: http://localhost:8000/app/#/login

Si usted NO solicito este cambio, comuniquese de forma inmediata con nuestro equipo
de soporte tecnico para el bloqueo preventivo de su cuenta.

Atentamente,
Departamento de Seguridad y Privacidad
FashionStore Bolivia S.R.L.
================================================================================
"""
    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Actualizacion de Contrasena</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">

  <center style="width: 100%; table-layout: fixed; background-color: #f1f5f9;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin: 0 auto;">
      <tr>
        <td align="center" style="padding: 0 12px;">

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="background-color: #0f172a; padding: 24px 28px; text-align: center; border-bottom: 3px solid #10b981;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                  SEGURIDAD DE LA CUENTA
                </div>
                <div style="font-size: 22px; font-weight: 800; color: #ffffff;">
                  FASHIONSTORE BOLIVIA
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 30px 28px 24px 28px;">
                <p style="margin: 0 0 14px 0; font-size: 15px; color: #334155; line-height: 1.5;">
                  Estimado(a) <strong style="color: #0f172a;">{nombre_usuario}</strong>,
                </p>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  Le confirmamos que la clave de acceso de su cuenta asociada a <strong style="color: #0f172a;">{destinatario}</strong> ha sido actualizada exitosamente.
                </p>

                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin: 18px 0;">
                  <tr>
                    <td style="padding: 14px 16px; font-size: 13px; color: #166534;">
                      ✓ La actualizacion fue procesada mediante validacion segura de token OTP.
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 26px 0 12px 0;">
                  <a href="http://localhost:8000/app/#/login" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                    INICIAR SESION EN MI CUENTA
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
                Si usted no realizo esta operacion, por favor contacte a soporte inmediatamente.<br/>
                FashionStore Bolivia S.R.L. — Todos los derechos reservados.
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </center>

</body>
</html>"""
    part1 = MIMEText(texto_plano, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def enviar_correo_password_cambiada(destinatario: str, nombre_usuario: str = "Cliente", async_send: bool = True) -> bool:
    def _tarea():
        try:
            msg = _construir_mensaje_password_cambiada(destinatario, nombre_usuario)
            return _despachar_email_robusto(msg, [destinatario], tipo_correo="Cambio de Contrasena")
        except Exception as e:
            print(f" [SMTP ERROR] Error notificando cambio de clave a {destinatario}: {e}")
            return False

    if async_send:
        threading.Thread(target=_tarea, daemon=True).start()
        return True
    return _tarea()


# ==============================================================================
# CU14 / CU16 / CU17: FACTURA ELECTRONICA OFICIAL Y COMPROBANTE DE PAGO
# (100% ESTETICO, FORMAL, BIEN ORGANIZADO Y MOBILE RESPONSIVE PARA CUALQUIER DISPOSITIVO)
# ==============================================================================
def _construir_mensaje_factura_digital(
    destinatario: str,
    nombre_cliente: str,
    orden_dict: dict,
    detalles: list,
    transaccion_dict: dict
) -> MIMEMultipart:
    """
    Construye la Factura Digital Oficial y Comprobante Fiscal Tributario (CU14 / CU16 / CU17)
    con diseño formal, estetico, estructurado y 100% adaptativo (Mobile Responsive)
    optimizada para Gmail (Android/iOS/Web), Apple Mail, Outlook y clientes de escritorio.
    """
    nro_factura = orden_dict.get("numero_factura", "FAC-2026-0001")
    fecha_emision = orden_dict.get("fecha_emision", datetime.now().strftime("%d/%m/%Y %H:%M"))
    nit_emisor = "1028475029"
    razon_emisor = "FASHIONSTORE BOLIVIA S.R.L."
    casa_matriz = "Av. San Martin #450, Barrio Equipetrol, Santa Cruz"
    telefono_emisor = "+591 3 3456789"

    id_orden = orden_dict.get("id_orden", 1)
    cuf_autorizacion = f"CUF-{id_orden:04d}-BO-FASHIONSTORE-{nro_factura[-6:]}"
    razon_social = orden_dict.get("razon_social_factura") or nombre_cliente
    nit_cliente = orden_dict.get("nit_factura") or "0"
    modalidad = orden_dict.get("modalidad_entrega", "DELIVERY")
    subtotal = float(orden_dict.get("subtotal", 0.0))
    costo_envio = float(orden_dict.get("costo_envio", 0.0))
    total = float(orden_dict.get("total", 0.0))
    literal_monto = _monto_a_literal(total)

    tx_id = transaccion_dict.get("payment_intent_id", "pi_stripe_succeeded")
    tarjeta_marca = str(transaccion_dict.get("marca_tarjeta", "Visa")).upper()
    ultimos4 = transaccion_dict.get("ultimos4", "4242")
    metodo_pago_desc = f"Tarjeta {tarjeta_marca} (**** {ultimos4})" if ultimos4 else "Pasarela Electronica Stripe"

    # Datos para QR segun estandar del Servicio de Impuestos Nacionales (SIN)
    qr_data = f"{nit_emisor}|{nro_factura}|{cuf_autorizacion}|{fecha_emision}|{total:.2f}|{total:.2f}|482915|{nit_cliente}|0|0|0|0"
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=120x120&data={qr_data}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Factura Oficial N° {nro_factura} — FashionStore Bolivia"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"FashionStore Facturacion <{settings.EMAIL_HOST_USER}>"
    msg["To"] = destinatario

    # Generar filas de prendas para texto plano y HTML
    filas_texto_plano = []
    filas_html = []
    for idx, item in enumerate(detalles, start=1):
        nom = item.get("nombre_producto", f"Prenda #{idx}")
        sku = item.get("codigo_sku_base", f"SKU-{idx}")
        talla = item.get("talla", "-")
        color = item.get("color", "-")
        cant = item.get("cantidad", 1)
        pu = float(item.get("precio_unitario", 0.0))
        sub = float(item.get("subtotal", pu * cant))

        filas_texto_plano.append(
            f"{idx:<2} | {nom:<32} | Talla: {talla:<4} | Color: {color:<10} | {cant:<3} | Bs. {pu:>7.2f} | Bs. {sub:>7.2f}"
        )

        bg_fila = "#ffffff" if idx % 2 != 0 else "#f8fafc"
        filas_html.append(f"""
        <tr style="background-color: {bg_fila}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; vertical-align: top; font-size: 13px; line-height: 1.4;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">{nom}</div>
            <div style="font-size: 11px; color: #475569; line-height: 1.4;">
              <span style="display: inline-block; background-color: #f1f5f9; border: 1px solid #e2e8f0; color: #334155; font-family: monospace; font-size: 10px; padding: 1px 5px; border-radius: 3px; font-weight: 600;">SKU: {sku}</span>
              &nbsp;·&nbsp; Talla: <strong style="color: #0f172a;">{talla}</strong>
              &nbsp;·&nbsp; Color: <strong style="color: #0f172a;">{color}</strong>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              P. Unitario: Bs. {pu:.2f}
            </div>
          </td>
          <td style="padding: 10px 8px; text-align: center; color: #0f172a; font-weight: 700; font-size: 13px; vertical-align: top; border-left: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9;">
            {cant}
          </td>
          <td style="padding: 10px 12px; text-align: right; color: #0f172a; font-weight: 700; font-family: monospace; font-size: 13px; vertical-align: top; white-space: nowrap;">
            Bs. {sub:.2f}
          </td>
        </tr>
        """)

    filas_html_str = "".join(filas_html)

    # Texto Plano Oficial
    texto_plano = f"""
================================================================================
           FASHIONSTORE BOLIVIA S.R.L. — FACTURA OFICIAL N° {nro_factura}
================================================================================
CASA MATRIZ: {casa_matriz}
NIT EMISOR: {nit_emisor} | TELEFONO: {telefono_emisor}
Santa Cruz de la Sierra — Bolivia

FACTURA ELECTRONICA EN LINEA (CON DERECHO A CREDITO FISCAL)
NRO. FACTURA: {nro_factura}
AUTORIZACION CUF: {cuf_autorizacion}
FECHA Y HORA DE EMISION: {fecha_emision}
ESTADO: FACTURA EMITIDA Y PAGO CONFIRMADO (CU14 / CU16 / CU17)

DATOS FISCALES DEL CLIENTE / RECEPTOR:
- Razon Social / Senor(es): {razon_social}
- NIT / CI / CEX: {nit_cliente}
- Correo Destino: {destinatario}
- Modalidad de Entrega: {modalidad}
- Medio de Pago: {metodo_pago_desc}
- ID Transaccion Stripe: {tx_id}

DETALLE DE PRENDAS COMPRADAS:
--------------------------------------------------------------------------------
N° | Prenda / Producto                | Talla/Color            | Cant | P. Unit.    | Subtotal
--------------------------------------------------------------------------------
{chr(10).join(filas_texto_plano)}
--------------------------------------------------------------------------------
SUBTOTAL PRENDAS:                                                  Bs. {subtotal:>7.2f}
COSTO DE ENVIO / LOGISTICA:                                        Bs. {costo_envio:>7.2f}
TOTAL A PAGAR:                                                     Bs. {total:>7.2f}
IMPORTE BASE CREDITO FISCAL:                                       Bs. {total:>7.2f}
--------------------------------------------------------------------------------
{literal_monto}
--------------------------------------------------------------------------------

CODIGO DE AUTORIZACION CUF:
{cuf_autorizacion}

"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAIS, EL USO ILICITO SERA SANCIONADO PENALMENTE DE ACUERDO A LEY"
Ley N° 453: El proveedor debe brindar atencion sin discriminacion, con trato digno y respetuoso.
Documento Fiscal Digital emitido conforme a la R.N.D. N° 102100000011 del Servicio de Impuestos Nacionales.
================================================================================
"""

    # HTML 100% Adaptativo, Estetico, Formal y Bien Organizado
    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Factura Oficial {nro_factura} — FashionStore Bolivia</title>
  <style type="text/css">
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ width: 100% !important; }}
      .email-card {{ border-radius: 0 !important; border-left: none !important; border-right: none !important; }}
      .header-padding {{ padding: 18px 14px !important; }}
      .content-padding {{ padding: 16px 14px !important; }}
      .col-stack {{ display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }}
      .col-stack-gap {{ margin-bottom: 12px !important; }}
      .table-responsive th, .table-responsive td {{ padding: 8px 6px !important; font-size: 11px !important; }}
      .total-amount {{ font-size: 18px !important; }}
      .header-title {{ font-size: 18px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">

  <center style="width: 100%; table-layout: fixed; background-color: #f1f5f9;">
    <!-- Contenedor Principal (100% en movil, max 600px en escritorio) -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-wrapper">
      <tr>
        <td align="center" style="padding: 0 10px;">

          <!-- Tarjeta Principal de Factura (Formal, Blanca, Bordes Nitidos) -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" class="email-card">
            
            <!-- 1. ENCABEZADO FORMAL INSTITUCIONAL -->
            <tr>
              <td style="background-color: #0f172a; padding: 22px 24px; border-bottom: 3px solid #2563eb;" class="header-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <!-- Badge Institucional -->
                      <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                        DOCUMENTO TRIBUTARIO DIGITAL
                      </div>
                      <div class="header-title" style="font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px; line-height: 1.25;">
                        FASHIONSTORE BOLIVIA S.R.L.
                      </div>
                      <div style="font-size: 11px; color: #cbd5e1; margin-top: 5px; line-height: 1.45;">
                        Casa Matriz: {casa_matriz}<br/>
                        NIT: <strong style="color: #ffffff;">{nit_emisor}</strong> &nbsp;·&nbsp; Tel: {telefono_emisor}<br/>
                        Santa Cruz de la Sierra — Bolivia
                      </div>
                    </td>
                  </tr>

                  <!-- Placa Oficial de Factura -->
                  <tr>
                    <td style="padding-top: 14px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1e293b; border: 1px solid #334155; border-radius: 6px;">
                        <tr>
                          <td style="padding: 10px 14px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td>
                                  <div style="font-size: 9px; font-weight: 800; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.8px;">
                                    FACTURA ELECTRONICA EN LINEA
                                  </div>
                                  <div style="font-size: 17px; font-weight: 900; color: #ffffff; font-family: 'Courier New', Courier, monospace; letter-spacing: 1px; margin: 2px 0;">
                                    N° {nro_factura}
                                  </div>
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                                  <span style="display: inline-block; background-color: #065f46; color: #a7f3d0; border: 1px solid #059669; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; letter-spacing: 0.5px;">
                                    CON DERECHO A CREDITO FISCAL
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- 2. BARRA DE ESTADO DE PAGO OFICIAL -->
            <tr>
              <td style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 10px 24px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="color: #166534; font-size: 12px; font-weight: 700; line-height: 1.3;">
                      ✓ PAGO CONFIRMADO & COMPROBANTE EMITIDO
                    </td>
                    <td style="color: #15803d; font-size: 11px; text-align: right; font-weight: 600; line-height: 1.3;">
                      Fecha: {fecha_emision}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 3. CUERPO DE LA FACTURA -->
            <tr>
              <td style="padding: 22px 24px 18px 24px;" class="content-padding">

                <!-- DATOS DEL CLIENTE Y TRANSACCION (ESTRUCTURA UNIFICADA Y 100% RESPONSIVA) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 18px; overflow: hidden;">
                  <tr>
                    <td colspan="2" style="padding: 9px 14px; background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 10px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.8px;">
                      DATOS FISCALES DEL RECEPTOR & CONDICIONES DE PAGO
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 14px 6px 14px; width: 50%; vertical-align: top;">
                      <div style="font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">Señor(es) / Razón Social:</div>
                      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; line-height: 1.3;">{razon_social}</div>
                    </td>
                    <td style="padding: 12px 14px 6px 14px; width: 50%; vertical-align: top;">
                      <div style="font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">NIT / CI / CEX:</div>
                      <div style="font-size: 13px; font-weight: 700; color: #1e3a8a; font-family: monospace; margin-top: 2px;">{nit_cliente}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 14px; vertical-align: top;">
                      <div style="font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">Modalidad de Entrega:</div>
                      <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 2px;">{modalidad}</div>
                    </td>
                    <td style="padding: 6px 14px; vertical-align: top;">
                      <div style="font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">Forma de Pago:</div>
                      <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-top: 2px;">{metodo_pago_desc}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 14px 12px 14px; vertical-align: top;">
                      <div style="font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">N° de Orden / Pedido:</div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px;">Orden #{id_orden:04d}</div>
                    </td>
                    <td style="padding: 6px 14px 12px 14px; vertical-align: top;">
                      <div style="font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">Transacción Electrónica:</div>
                      <div style="font-size: 10px; font-family: monospace; color: #64748b; margin-top: 2px; word-break: break-all;">{tx_id}</div>
                    </td>
                  </tr>
                </table>

                <!-- TABLA DETALLE DE PRENDAS COMPRADAS -->
                <div style="font-size: 11px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  DETALLE DE ARTICULOS FACTURADOS
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="table-responsive" style="border-collapse: collapse; margin-bottom: 18px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                      <th style="padding: 9px 12px; text-align: left; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800; letter-spacing: 0.5px;">
                        Prenda / Descripcion
                      </th>
                      <th style="padding: 9px 8px; text-align: center; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800; width: 45px; letter-spacing: 0.5px; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1;">
                        Cant.
                      </th>
                      <th style="padding: 9px 12px; text-align: right; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800; width: 90px; letter-spacing: 0.5px;">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas_html_str}
                  </tbody>
                </table>

                <!-- RECUADRO DE TOTALES FINANCIEROS -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 18px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 12px; color: #475569; padding-bottom: 4px;">Subtotal Prendas:</td>
                          <td style="font-size: 12px; color: #0f172a; text-align: right; font-family: monospace; font-weight: 600; padding-bottom: 4px;">Bs. {subtotal:.2f}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 12px; color: #475569; padding-bottom: 4px;">Costo de Despacho / Delivery:</td>
                          <td style="font-size: 12px; color: #166534; text-align: right; font-family: monospace; font-weight: 600; padding-bottom: 4px;">{f"Bs. {costo_envio:.2f}" if costo_envio > 0 else "Gratis (0.00)"}</td>
                        </tr>
                        <!-- Fila Total Destacada -->
                        <tr style="border-top: 2px solid #cbd5e1;">
                          <td style="padding-top: 10px; font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase;">TOTAL FACTURADO:</td>
                          <td class="total-amount" style="padding-top: 10px; font-size: 21px; font-weight: 900; color: #0f172a; text-align: right; font-family: monospace;">Bs. {total:.2f}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="font-size: 11px; color: #2563eb; padding-top: 4px; font-weight: 600;">
                            Importe Base Credito Fiscal: <span style="font-family: monospace; color: #0f172a;">Bs. {total:.2f}</span>
                          </td>
                        </tr>
                        <!-- Importe en Letras -->
                        <tr>
                          <td colspan="2" style="padding-top: 10px;">
                            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; padding: 6px 10px; border-radius: 4px; font-size: 11px; color: #334155; font-weight: 600;">
                              {literal_monto}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- SECCION FISCAL OFICIAL SIN (QR Y CUF) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <!-- QR Fiscal -->
                          <td class="col-stack" width="115" align="center" style="vertical-align: middle; padding-right: 14px;">
                            <div style="background-color: #ffffff; display: inline-block; padding: 3px; border: 1px solid #cbd5e1; border-radius: 6px;">
                              <img src="{qr_url}" alt="QR Fiscal SIN" width="105" height="105" style="display: block; margin: 0 auto; border: 0;" />
                            </div>
                          </td>
                          <!-- Informacion Fiscal y CUF -->
                          <td class="col-stack" style="vertical-align: middle;">
                            <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                              CODIGO UNICO DE FACTURACION (CUF)
                            </div>
                            <div style="background-color: #f8fafc; border: 1px dashed #94a3b8; border-radius: 4px; padding: 6px 8px; font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #0f172a; word-break: break-all; margin: 4px 0 6px 0; font-weight: 600;">
                              {cuf_autorizacion}
                            </div>
                            <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
                              Documento Fiscal Digital emitido conforme a la R.N.D. N° 102100000011 del Servicio de Impuestos Nacionales (SIN).
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- POLÍTICAS DE GARANTÍA, CAMBIOS Y RESERVAS -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0f172a; border-radius: 6px; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 12px 14px;">
                      <div style="font-size: 10px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
                        POLÍTICAS DE CAMBIOS, DEVOLUCIONES Y RESERVAS
                      </div>
                      <div style="font-size: 11px; color: #334155; line-height: 1.5; margin-bottom: 4px;">
                        • <strong>Cambios o Devoluciones de Prendas:</strong> Plazo máximo de <strong>24 horas</strong> posteriores a la entrega con presentación obligatoria de este comprobante oficial.
                      </div>
                      <div style="font-size: 11px; color: #334155; line-height: 1.5;">
                        • <strong>Permanencia de Reservas en Tienda:</strong> Las reservas presenciales tienen vigencia máxima de <strong>5 a 7 días calendario</strong>; tras este período sin retiro, se cancelan automáticamente.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- BOTON DE ACCESO DIRECTO -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <a href="http://localhost:8000/app/#/catalogo" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.5px;">
                        VER MI PEDIDO EN LA TIENDA FASHIONSTORE
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- 4. PIE DE PAGINA FISCAL OBLIGATORIO -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 20px; text-align: center; font-size: 10px; color: #475569; line-height: 1.5;">
                <strong>"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAIS, EL USO ILICITO SERA SANCIONADO PENALMENTE DE ACUERDO A LEY"</strong><br/>
                Ley N° 453: El proveedor debe brindar atencion sin discriminacion, con trato digno y respetuoso.<br/>
                <span style="color: #94a3b8; font-size: 9px; margin-top: 4px; display: inline-block;">© 2026 FashionStore Bolivia S.R.L. · Sistemas de Informacion II (SI2)</span>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </center>

</body>
</html>"""

    part1 = MIMEText(texto_plano, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def enviar_correo_factura_compra(
    destinatario: str,
    nombre_cliente: str,
    orden_dict: dict,
    detalles: list,
    transaccion_dict: dict,
    async_send: bool = True
) -> bool:
    def _tarea():
        try:
            msg = _construir_mensaje_factura_digital(
                destinatario=destinatario,
                nombre_cliente=nombre_cliente,
                orden_dict=orden_dict,
                detalles=detalles,
                transaccion_dict=transaccion_dict
            )
            return _despachar_email_robusto(msg, [destinatario], tipo_correo=f"Factura Compra {orden_dict.get('numero_factura')}")
        except Exception as e:
            print(f" [SMTP ERROR] Error procesando factura de compra para {destinatario}: {e}")
            return False

    if async_send:
        threading.Thread(target=_tarea, daemon=True).start()
        return True
    return _tarea()


# ==============================================================================
# CU01 / CU03 / CU17: FACTURA DE SUSCRIPCION SAAS B2B (FORMAL Y RESPONSIVE)
# ==============================================================================
def _construir_mensaje_factura_suscripcion_saas(
    destinatarios: list,
    nombre_admin: str,
    empresa_dict: dict,
    plan_dict: dict,
    transaccion_dict: dict
) -> MIMEMultipart:
    nro_factura = transaccion_dict.get("numero_factura", "FAC-SAAS-2026-0001")
    fecha_emision = transaccion_dict.get("fecha", datetime.now().strftime("%d/%m/%Y %H:%M"))
    nit_emisor = "1028475029"
    razon_emisor = "FASHIONSTORE BOLIVIA S.R.L."
    cuf_autorizacion = f"CUF-SAAS-{empresa_dict.get('id_empresa', 1):04d}-BO-{nro_factura[-4:]}"
    nombre_empresa = empresa_dict.get("nombre_comercial", "Boutique")
    razon_social_cliente = empresa_dict.get("razon_social") or nombre_empresa
    nit_cliente = empresa_dict.get("nit", "0")
    slug = empresa_dict.get("dominio_slug", "boutique")
    
    plan_nombre = plan_dict.get("nombre", "Profesional")
    plan_codigo = plan_dict.get("codigo", "PLAN_PRO")
    monto = float(transaccion_dict.get("monto", 199.00))
    metodo = transaccion_dict.get("metodo", "TARJETA").upper()
    tx_id = transaccion_dict.get("payment_intent_id", "pi_stripe_saas_demo")
    ultimos4 = transaccion_dict.get("ultimos4", "4242")
    literal_monto = _monto_a_literal(monto)

    # QR SIN
    qr_data = f"{nit_emisor}|{nro_factura}|{cuf_autorizacion}|{fecha_emision}|{monto:.2f}|{monto:.2f}|482915|{nit_cliente}|0|0|0|0"
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=115x115&data={qr_data}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Factura Oficial N° {nro_factura} — Alta y Suscripcion SaaS: {nombre_empresa}"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"FashionStore SaaS Corporativo <{settings.EMAIL_HOST_USER}>"
    msg["To"] = ", ".join(destinatarios)

    texto_plano = f"""
================================================================================
          FASHIONSTORE SAAS BOLIVIA — FACTURA CORPORATIVA N° {nro_factura}
================================================================================
EMISOR: {razon_emisor} | NIT: {nit_emisor}
AUTORIZACION CUF: {cuf_autorizacion}
FECHA DE EMISION: {fecha_emision}
ESTADO: FACTURA EMITIDA Y SUSCRIPCION CONFIRMADA (CU01 / CU03 / CU17)

DATOS DEL ARRENDATARIO / EMPRESA:
- Razon Social: {razon_social_cliente}
- Nombre Comercial: {nombre_empresa}
- NIT / CI: {nit_cliente}
- Entorno Tenant: https://{slug}.fashionstore.bo
- Administrador General: {nombre_admin} ({destinatarios[0]})

DETALLE DE SUSCRIPCION CONTRATADA:
--------------------------------------------------------------------------------
Cant. | Concepto                                       | P. Unit.  | Subtotal
--------------------------------------------------------------------------------
  1   | Suscripcion Mensual Plataforma Omnicanal SaaS    | Bs. {monto:.2f} | Bs. {monto:.2f}
      | Plan: {plan_nombre} ({plan_codigo})
      | Vigencia: 30 Dias con Renovacion Automatica
--------------------------------------------------------------------------------
TOTAL FACTURADO:                                                   Bs. {monto:.2f}
IMPORTE BASE CREDITO FISCAL:                                       Bs. {monto:.2f}
--------------------------------------------------------------------------------
{literal_monto}
--------------------------------------------------------------------------------
METODO DE COBRO: {metodo} (Stripe / QR - Transaccion: {tx_id})
TARJETA: **** **** **** {ultimos4}

ACCESO AL PANEL CORPORATIVO:
- Portal: http://localhost:8000/app/#/login
- Correo Administrador: {destinatarios[0]}
- Rol: ADMINISTRADOR GENERAL DE EMPRESA (RBAC)

"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAIS, EL USO ILICITO SERA SANCIONADO PENALMENTE DE ACUERDO A LEY"
Ley N° 453: Los servicios deben prestarse en condiciones de calidad y seguridad.
================================================================================
"""

    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Factura Oficial SaaS {nro_factura}</title>
  <style type="text/css">
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ width: 100% !important; }}
      .email-card {{ border-radius: 0 !important; border-left: none !important; border-right: none !important; }}
      .header-padding {{ padding: 18px 14px !important; }}
      .content-padding {{ padding: 16px 14px !important; }}
      .col-stack {{ display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }}
      .col-stack-gap {{ margin-bottom: 12px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">

  <center style="width: 100%; table-layout: fixed; background-color: #f1f5f9;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-wrapper">
      <tr>
        <td align="center" style="padding: 0 10px;">

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" class="email-card">
            
            <!-- Encabezado B2B -->
            <tr>
              <td style="background-color: #0f172a; padding: 22px 24px; border-bottom: 3px solid #2563eb;" class="header-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                        PLATAFORMA MULTITENANT SAAS & COMERCIO OMNICANAL
                      </div>
                      <div style="font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">
                        FASHIONSTORE BOLIVIA S.R.L.
                      </div>
                      <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
                        NIT: <strong style="color: #ffffff;">{nit_emisor}</strong> &nbsp;·&nbsp; Santa Cruz de la Sierra — Bolivia
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 14px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1e293b; border: 1px solid #334155; border-radius: 6px;">
                        <tr>
                          <td style="padding: 10px 14px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td>
                                  <div style="font-size: 9px; font-weight: 800; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.8px;">
                                    FACTURA DE SUSCRIPCION SAAS EN LINEA
                                  </div>
                                  <div style="font-size: 17px; font-weight: 900; color: #ffffff; font-family: monospace; letter-spacing: 1px; margin: 2px 0;">
                                    N° {nro_factura}
                                  </div>
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                                  <span style="display: inline-block; background-color: #065f46; color: #a7f3d0; border: 1px solid #059669; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 4px;">
                                    CON DERECHO A CREDITO FISCAL
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Barra de Confirmacion -->
            <tr>
              <td style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 10px 24px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="color: #166534; font-size: 12px; font-weight: 700;">
                      ✓ ALTA DE EMPRESA Y COBRO CONFIRMADO EXITOSAMENTE
                    </td>
                    <td style="color: #15803d; font-size: 11px; text-align: right; font-weight: 600;">
                      Fecha: {fecha_emision}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Cuerpo del Comprobante -->
            <tr>
              <td style="padding: 22px 24px 18px 24px;" class="content-padding">
                
                <!-- Datos de la Empresa y Tenant -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 18px;">
                  <tr>
                    <td class="col-stack col-stack-gap" width="50%" style="vertical-align: top; padding-right: 8px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <tr>
                          <td style="padding: 8px 12px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">
                            DATOS DEL ARRENDATARIO (TENANT)
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 12px;">
                            <div style="font-size: 10px; color: #64748b; font-weight: 600;">Razon Social:</div>
                            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">{razon_social_cliente}</div>

                            <div style="font-size: 10px; color: #64748b; font-weight: 600;">Nombre Comercial:</div>
                            <div style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px;">{nombre_empresa}</div>

                            <div style="font-size: 10px; color: #64748b; font-weight: 600;">NIT Arrendatario:</div>
                            <div style="font-size: 12px; font-weight: 700; color: #1e3a8a; font-family: monospace;">{nit_cliente}</div>
                          </td>
                        </tr>
                      </table>
                    </td>

                    <td class="col-stack" width="50%" style="vertical-align: top; padding-left: 8px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <tr>
                          <td style="padding: 8px 12px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">
                            ADMINISTRACION Y ACCESO
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 12px;">
                            <div style="font-size: 10px; color: #64748b; font-weight: 600;">Administrador General:</div>
                            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">{nombre_admin}</div>

                            <div style="font-size: 10px; color: #64748b; font-weight: 600;">Subdominio Asignado:</div>
                            <div style="font-size: 11px; font-family: monospace; color: #2563eb; margin-bottom: 6px;">https://{slug}.fashionstore.bo</div>

                            <div style="font-size: 10px; color: #64748b; font-weight: 600;">Metodo de Cobro:</div>
                            <div style="font-size: 11px; color: #334155;">{metodo} (**** {ultimos4})</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Detalle del Plan Contratado -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 18px;">
                  <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                      <th style="padding: 9px 12px; text-align: left; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800;">Concepto Contratado</th>
                      <th style="padding: 9px 8px; text-align: center; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800; width: 45px;">Cant.</th>
                      <th style="padding: 9px 12px; text-align: right; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800; width: 95px;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="background-color: #ffffff;">
                      <td style="padding: 12px; font-size: 13px;">
                        <div style="font-weight: 700; color: #0f172a;">Suscripcion Plataforma SaaS FashionStore</div>
                        <div style="font-size: 11px; color: #475569; margin-top: 3px;">
                          Plan: <strong style="color: #1e3a8a;">{plan_nombre} ({plan_codigo})</strong> · Vigencia 30 dias renovables
                        </div>
                      </td>
                      <td style="padding: 12px 8px; text-align: center; font-weight: 700; font-size: 13px; color: #0f172a;">1</td>
                      <td style="padding: 12px; text-align: right; font-weight: 700; font-family: monospace; font-size: 13px; color: #0f172a;">Bs. {monto:.2f}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Totales -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 18px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase;">TOTAL FACTURADO:</td>
                          <td style="font-size: 21px; font-weight: 900; color: #0f172a; text-align: right; font-family: monospace;">Bs. {monto:.2f}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="font-size: 11px; color: #2563eb; padding-top: 4px; font-weight: 600;">
                            Importe Base Credito Fiscal: <span style="font-family: monospace; color: #0f172a;">Bs. {monto:.2f}</span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 8px;">
                            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; padding: 6px 10px; border-radius: 4px; font-size: 11px; color: #334155; font-weight: 600;">
                              {literal_monto}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Bloque Fiscal QR y CUF -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="col-stack" width="115" align="center" style="vertical-align: middle; padding-right: 14px;">
                            <div style="background-color: #ffffff; display: inline-block; padding: 3px; border: 1px solid #cbd5e1; border-radius: 6px;">
                              <img src="{qr_url}" alt="QR Fiscal SIN" width="105" height="105" style="display: block; margin: 0 auto; border: 0;" />
                            </div>
                          </td>
                          <td class="col-stack" style="vertical-align: middle;">
                            <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">
                              CODIGO UNICO DE FACTURACION (CUF)
                            </div>
                            <div style="background-color: #f8fafc; border: 1px dashed #94a3b8; border-radius: 4px; padding: 6px 8px; font-family: monospace; font-size: 10px; color: #0f172a; word-break: break-all; margin: 4px 0 6px 0; font-weight: 600;">
                              {cuf_autorizacion}
                            </div>
                            <div style="font-size: 10px; color: #64748b;">
                              ID Transaccion Stripe: <span style="font-family: monospace; color: #0f172a;">{tx_id}</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 20px 0 6px 0;">
                  <a href="http://localhost:8000/app/#/login" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 26px; border-radius: 6px;">
                    ACCEDER AL PANEL DE ADMINISTRACION SAAS
                  </a>
                </div>

              </td>
            </tr>

            <!-- Pie de Pagina -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 20px; text-align: center; font-size: 10px; color: #475569; line-height: 1.5;">
                <strong>"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAIS, EL USO ILICITO SERA SANCIONADO PENALMENTE DE ACUERDO A LEY"</strong><br/>
                Ley N° 453: Los servicios deben prestarse en condiciones de calidad y seguridad.<br/>
                © 2026 FashionStore Bolivia S.R.L. — Plataforma Multitenant SaaS
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </center>

</body>
</html>"""

    part1 = MIMEText(texto_plano, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def enviar_correo_factura_suscripcion_saas(
    destinatarios: list,
    nombre_admin: str,
    empresa_dict: dict,
    plan_dict: dict,
    transaccion_dict: dict,
    async_send: bool = True
) -> bool:
    dest_limpios = list(set([d.strip().lower() for d in destinatarios if d and "@" in d]))
    def _tarea():
        try:
            msg = _construir_mensaje_factura_suscripcion_saas(
                destinatarios=dest_limpios,
                nombre_admin=nombre_admin,
                empresa_dict=empresa_dict,
                plan_dict=plan_dict,
                transaccion_dict=transaccion_dict
            )
            return _despachar_email_robusto(msg, dest_limpios, tipo_correo="Factura Suscripcion SaaS")
        except Exception as e:
            print(f" [SMTP ERROR] Error procesando factura SaaS para {dest_limpios}: {e}")
            return False

    if async_send:
        threading.Thread(target=_tarea, daemon=True).start()
        return True
    return _tarea()


# ==============================================================================
# 4. COMPROBANTE OFICIAL DE DEVOLUCION, INTERCAMBIO, VALE O REEMBOLSO (CU25)
# ==============================================================================

def _construir_mensaje_devolucion_intercambio(
    destinatarios: list,
    devolucion_dict: dict
) -> MIMEMultipart:
    """
    Construye un correo HTML + Texto Plano formal y responsivo para notificar al cliente
    sobre su Devolución, Intercambio de Variante (Talla/Color), Emisión de Vale de Crédito
    o Reembolso (Efectivo / Tarjeta Stripe).
    """
    nro_devolucion = devolucion_dict.get("nro_devolucion", "DEV-2026-0001")
    nro_ticket_original = devolucion_dict.get("nro_ticket_original", "POS-2026-0001")
    fecha_hora = devolucion_dict.get("fecha_hora", datetime.now().strftime("%d/%m/%Y %H:%M"))
    sucursal_nombre = devolucion_dict.get("sucursal_nombre", "Sucursal Central")
    cajero_nombre = devolucion_dict.get("cajero_nombre", "Atención al Cliente")
    cliente_nombre = devolucion_dict.get("cliente_nombre", "Cliente FashionStore")
    nit_cliente = devolucion_dict.get("nit_cliente", "0")
    motivo = devolucion_dict.get("motivo", "Solicitud de cambio / devolución")
    tipo_resolucion = devolucion_dict.get("tipo_resolucion", "CAMBIO_VARIANTE")
    total_devuelto = float(devolucion_dict.get("total_devuelto", 0.0))
    diferencia_cobrada = float(devolucion_dict.get("diferencia_cobrada", 0.0))
    codigo_vale = devolucion_dict.get("codigo_vale")
    items_devueltos = devolucion_dict.get("items_devueltos") or []
    item_nuevo = devolucion_dict.get("item_nuevo_entregado")

    # Determinar títulos, etiquetas y colores según tipo de resolución
    if tipo_resolucion == "CAMBIO_VARIANTE":
        titulo_principal = "COMPROBANTE DE INTERCAMBIO Y CAMBIO DE PRENDA"
        subtitulo_header = "Gestión de Cambio de Talla / Color • Kardex & Ajuste de Saldo"
        badge_estado = "INTERCAMBIO DE PRENDA CONFIRMADO"
        color_acento = "#2563eb"
        bg_acento = "#eff6ff"
        borde_acento = "#bfdbfe"
        asunto_correo = f"🔄 Comprobante de Intercambio #{nro_devolucion} (Factura {nro_ticket_original}) - FashionStore"
    elif tipo_resolucion == "VALE_CREDITO":
        titulo_principal = "NOTA DE CRÉDITO Y VALE OFICIAL POR DEVOLUCIÓN"
        subtitulo_header = "Devolución Autorizada • Saldo a Favor del Cliente"
        badge_estado = "VALE DE CRÉDITO EMITIDO"
        color_acento = "#7c3aed"
        bg_acento = "#f5f3ff"
        borde_acento = "#ddd6fe"
        asunto_correo = f"🎟️ Vale de Crédito #{codigo_vale or nro_devolucion} por Devolución - FashionStore"
    elif tipo_resolucion == "REEMBOLSO_STRIPE":
        titulo_principal = "COMPROBANTE DE DEVOLUCIÓN Y REEMBOLSO A TARJETA"
        subtitulo_header = "Reversión Electrónica Procesada vía Pasarela Stripe"
        badge_estado = "REEMBOLSO A TARJETA PROCESADO"
        color_acento = "#059669"
        bg_acento = "#ecfdf5"
        borde_acento = "#a7f3d0"
        asunto_correo = f"💳 Reembolso a Tarjeta Confirmado #{nro_devolucion} (Factura {nro_ticket_original}) - FashionStore"
    else:  # REEMBOLSO_EFECTIVO u otros
        titulo_principal = "COMPROBANTE DE DEVOLUCIÓN Y REEMBOLSO EN EFECTIVO"
        subtitulo_header = "Devolución Autorizada en Caja • Liquidación en Efectivo"
        badge_estado = "REEMBOLSO EN EFECTIVO COMPLETADO"
        color_acento = "#059669"
        bg_acento = "#ecfdf5"
        borde_acento = "#a7f3d0"
        asunto_correo = f"💵 Comprobante de Devolución y Reembolso #{nro_devolucion} - FashionStore"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = asunto_correo
    msg["From"] = f"FashionStore Atención al Cliente <{settings.EMAIL_HOST_USER}>"
    msg["To"] = ", ".join(destinatarios)

    # Generar código de autorización / hash verificador
    seed_str = f"DEV-{nro_devolucion}-{nro_ticket_original}-{total_devuelto}-{fecha_hora}"
    hash_aut = hashlib.sha256(seed_str.encode("utf-8")).hexdigest().upper()[:32]
    qr_data = f"https://siat.impuestos.gob.bo/consulta/QR?nit=1028495029&dev={nro_devolucion}&orig={nro_ticket_original}&monto={total_devuelto:.2f}"
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=6&data={urllib.parse.quote(qr_data)}"

    literal_devuelto = _monto_a_literal(total_devuelto)

    # Filas de prendas devueltas
    filas_devueltas_html = ""
    filas_devueltas_txt = ""
    for idx, it in enumerate(items_devueltos, start=1):
        nom = it.get("nombre_producto", f"Prenda #{it.get('id_producto', idx)}")
        talla = it.get("talla", "U")
        color = it.get("color", "Estándar")
        cant = int(it.get("cantidad", 1))
        p_unit = float(it.get("precio_unitario", 0.0))
        sub = float(it.get("subtotal_devuelto", p_unit * cant))
        est_fisico = it.get("estado_fisico", "APTO_VENTA")
        accion_inv = it.get("accion_inventario", "REINGRESO_STOCK_DISPONIBLE")

        filas_devueltas_txt += (
            f"  {idx}. [DEVUELTO] {nom} | Talla: {talla} | Color: {color} | "
            f"Cant: {cant} x Bs. {p_unit:.2f} = Bs. {sub:.2f} ({est_fisico})\n"
        )
        bg_row = "#ffffff" if idx % 2 == 1 else "#f8fafc"
        badge_fisico_color = "#166534" if est_fisico == "APTO_VENTA" else "#9a3412"
        badge_fisico_bg = "#dcfce7" if est_fisico == "APTO_VENTA" else "#ffedd5"

        filas_devueltas_html += f"""
        <tr style="background-color: {bg_row};">
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; text-align: center; font-weight: 700;">{cant}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a;">
            <div style="font-weight: 700; color: #0f172a;">{nom}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              Variante devuelta: <strong>Talla {talla}</strong> • Color: <strong>{color}</strong>
            </div>
            <div style="margin-top: 4px;">
              <span style="display: inline-block; background-color: {badge_fisico_bg}; color: {badge_fisico_color}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                {est_fisico} • {accion_inv}
              </span>
            </div>
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; text-align: right; font-family: monospace;">Bs. {p_unit:.2f}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #dc2626; text-align: right; font-weight: 700; font-family: monospace;">- Bs. {sub:.2f}</td>
        </tr>
        """

    # Bloque de nueva prenda entregada (si es CAMBIO_VARIANTE)
    bloque_nuevo_item_html = ""
    bloque_nuevo_item_txt = ""
    if item_nuevo:
        n_nom = item_nuevo.get("nombre_producto", "Prenda de Reemplazo")
        n_sku = item_nuevo.get("sku", "SKU")
        n_talla = item_nuevo.get("talla", "M")
        n_color = item_nuevo.get("color", "Negro")
        n_cant = int(item_nuevo.get("cantidad", 1))
        n_factor = float(item_nuevo.get("factor_talla", 1.0))
        n_punit = float(item_nuevo.get("precio_unitario", 0.0))
        n_total = float(item_nuevo.get("total_nuevo", n_punit * n_cant))
        n_dif = float(item_nuevo.get("diferencia", diferencia_cobrada))
        n_ajuste = item_nuevo.get("tipo_ajuste", "CAMBIO_COLOR_SIN_COSTO")

        if n_dif > 0:
            ajuste_desc = f"Abono diferencial por cambio a talla mayor/superior: + Bs. {n_dif:.2f}"
            ajuste_badge_bg = "#fef3c7"
            ajuste_badge_col = "#92400e"
        elif n_dif < 0:
            ajuste_desc = f"Saldo a favor del cliente (Vale de Crédito emitido): Bs. {abs(n_dif):.2f}"
            ajuste_badge_bg = "#f3e8ff"
            ajuste_badge_col = "#6b21a8"
        else:
            ajuste_desc = "Intercambio directo sin costo adicional (Bs. 0.00)"
            ajuste_badge_bg = "#dcfce7"
            ajuste_badge_col = "#166534"

        bloque_nuevo_item_txt = (
            f"\n------------------------------------------------------------\n"
            f"PRENDA NUEVA ENTREGADA EN INTERCAMBIO\n"
            f"------------------------------------------------------------\n"
            f"  * {n_nom} (SKU: {n_sku})\n"
            f"  * Nueva Talla: {n_talla} (Factor Escala: {n_factor:.2f}x) | Nuevo Color: {n_color}\n"
            f"  * Cantidad: {n_cant} x Bs. {n_punit:.2f} = Bs. {n_total:.2f}\n"
            f"  * Ajuste Financiero ({n_ajuste}): {ajuste_desc}\n"
        )

        bloque_nuevo_item_html = f"""
        <div style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">
          2. PRENDA NUEVA ENTREGADA EN INTERCAMBIO
        </div>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 14px 16px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 14px; font-weight: 800; color: #1e3a8a;">
                    {n_nom} <span style="font-size: 11px; font-weight: 600; color: #475569; font-family: monospace;">({n_sku})</span>
                  </td>
                  <td align="right" style="font-size: 14px; font-weight: 900; color: #1e3a8a; font-family: monospace;">
                    Bs. {n_total:.2f}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 6px; font-size: 12px; color: #1e293b;">
                    Nueva Variante Entregada: <strong>Talla {n_talla}</strong> (Factor {n_factor:.2f}x) • Color: <strong>{n_color}</strong> • Cantidad: <strong>{n_cant} ud(s)</strong> a Bs. {n_punit:.2f} c/u
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 8px;">
                    <span style="display: inline-block; background-color: {ajuste_badge_bg}; color: {ajuste_badge_col}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">
                      {ajuste_desc}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        """

    # Bloque de Vale de Crédito (si aplica en VALE_CREDITO o cambio a talla menor)
    bloque_vale_html = ""
    bloque_vale_txt = ""
    if codigo_vale:
        monto_vale = abs(diferencia_cobrada) if tipo_resolucion == "CAMBIO_VARIANTE" and diferencia_cobrada < 0 else total_devuelto
        bloque_vale_txt = (
            f"\n============================================================\n"
            f"VALE DE CREDITO OFICIAL A FAVOR DEL CLIENTE\n"
            f"  CODIGO DEL VALE : {codigo_vale}\n"
            f"  IMPORTE A FAVOR : Bs. {monto_vale:.2f}\n"
            f"  VIGENCIA        : 90 dias calendario en cualquier sucursal o tienda online\n"
            f"============================================================\n"
        )
        bloque_vale_html = f"""
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border: 2px dashed #7c3aed; border-radius: 8px; margin-bottom: 18px;">
          <tr>
            <td style="padding: 16px; text-align: center;">
              <div style="font-size: 11px; font-weight: 800; color: #6d28d9; text-transform: uppercase; letter-spacing: 1px;">
                🎟️ VALE DE CRÉDITO OFICIAL EMITIDO A SU FAVOR
              </div>
              <div style="font-size: 22px; font-weight: 900; color: #4c1d95; font-family: monospace; letter-spacing: 1.5px; margin: 8px 0;">
                {codigo_vale}
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #1e293b;">
                Saldo Disponible a Favor: <span style="color: #6d28d9; font-family: monospace;">Bs. {monto_vale:.2f}</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Presente este código en cualquier caja POS de FashionStore o ingréselo en su próxima compra web.
              </div>
            </td>
          </tr>
        </table>
        """

    # Resumen financiero según resolución
    if tipo_resolucion == "CAMBIO_VARIANTE":
        total_nuevo_val = float(item_nuevo.get("total_nuevo", total_devuelto + diferencia_cobrada)) if item_nuevo else (total_devuelto + diferencia_cobrada)
        if diferencia_cobrada > 0:
            etiqueta_balance = "SALDO DIFERENCIAL ABONADO POR EL CLIENTE:"
            valor_balance = f"Bs. {diferencia_cobrada:.2f}"
            color_balance = "#b45309"
        elif diferencia_cobrada < 0:
            etiqueta_balance = "SALDO A FAVOR DEL CLIENTE (VALE EMITIDO):"
            valor_balance = f"Bs. {abs(diferencia_cobrada):.2f}"
            color_balance = "#6d28d9"
        else:
            etiqueta_balance = "DIFERENCIA LIQUIDADA (CAMBIO SIN COSTO):"
            valor_balance = "Bs. 0.00"
            color_balance = "#15803d"

        filas_totales_html = f"""
        <tr>
          <td style="font-size: 12px; color: #475569; padding: 3px 0;">Valor Prenda(s) Devuelta(s) (Crédito Reconocido):</td>
          <td style="font-size: 12px; color: #0f172a; text-align: right; font-weight: 700; font-family: monospace;">Bs. {total_devuelto:.2f}</td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #475569; padding: 3px 0;">Valor Prenda Nueva Entregada:</td>
          <td style="font-size: 12px; color: #0f172a; text-align: right; font-weight: 700; font-family: monospace;">Bs. {total_nuevo_val:.2f}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top: 1px solid #cbd5e1; margin: 6px 0; padding-top: 6px;"></td>
        </tr>
        <tr>
          <td style="font-size: 13px; font-weight: 900; color: {color_balance};">{etiqueta_balance}</td>
          <td style="font-size: 18px; font-weight: 900; color: {color_balance}; text-align: right; font-family: monospace;">{valor_balance}</td>
        </tr>
        """
    elif tipo_resolucion == "VALE_CREDITO":
        filas_totales_html = f"""
        <tr>
          <td style="font-size: 12px; color: #475569; padding: 3px 0;">Importe Total de Prendas Devueltas:</td>
          <td style="font-size: 12px; color: #0f172a; text-align: right; font-weight: 700; font-family: monospace;">Bs. {total_devuelto:.2f}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top: 1px solid #cbd5e1; margin: 6px 0; padding-top: 6px;"></td>
        </tr>
        <tr>
          <td style="font-size: 13px; font-weight: 900; color: #6d28d9;">TOTAL ACREDITADO EN VALE OFICIAL:</td>
          <td style="font-size: 18px; font-weight: 900; color: #6d28d9; text-align: right; font-family: monospace;">Bs. {total_devuelto:.2f}</td>
        </tr>
        """
    elif tipo_resolucion == "REEMBOLSO_STRIPE":
        filas_totales_html = f"""
        <tr>
          <td style="font-size: 12px; color: #475569; padding: 3px 0;">Importe Total de Prendas Devueltas:</td>
          <td style="font-size: 12px; color: #0f172a; text-align: right; font-weight: 700; font-family: monospace;">Bs. {total_devuelto:.2f}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top: 1px solid #cbd5e1; margin: 6px 0; padding-top: 6px;"></td>
        </tr>
        <tr>
          <td style="font-size: 13px; font-weight: 900; color: #059669;">TOTAL REEMBOLSADO A TARJETA (STRIPE):</td>
          <td style="font-size: 18px; font-weight: 900; color: #059669; text-align: right; font-family: monospace;">Bs. {total_devuelto:.2f}</td>
        </tr>
        """
    else:
        filas_totales_html = f"""
        <tr>
          <td style="font-size: 12px; color: #475569; padding: 3px 0;">Importe Total de Prendas Devueltas:</td>
          <td style="font-size: 12px; color: #0f172a; text-align: right; font-weight: 700; font-family: monospace;">Bs. {total_devuelto:.2f}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top: 1px solid #cbd5e1; margin: 6px 0; padding-top: 6px;"></td>
        </tr>
        <tr>
          <td style="font-size: 13px; font-weight: 900; color: #059669;">TOTAL REEMBOLSADO EN EFECTIVO:</td>
          <td style="font-size: 18px; font-weight: 900; color: #059669; text-align: right; font-family: monospace;">Bs. {total_devuelto:.2f}</td>
        </tr>
        """

    texto_plano = (
        f"============================================================\n"
        f"FASHIONSTORE BOLIVIA S.R.L. - {titulo_principal}\n"
        f"============================================================\n"
        f"N° Comprobante    : {nro_devolucion}\n"
        f"Factura Original  : {nro_ticket_original}\n"
        f"Fecha y Hora      : {fecha_hora}\n"
        f"Sucursal          : {sucursal_nombre}\n"
        f"Atendido por      : {cajero_nombre}\n"
        f"Cliente           : {cliente_nombre} (NIT/CI: {nit_cliente})\n"
        f"Motivo Declarado  : {motivo}\n"
        f"Tipo Resolución   : {tipo_resolucion}\n"
        f"------------------------------------------------------------\n"
        f"PRENDAS DEVUELTAS\n"
        f"------------------------------------------------------------\n"
        f"{filas_devueltas_txt}"
        f"{bloque_nuevo_item_txt}"
        f"{bloque_vale_txt}"
        f"------------------------------------------------------------\n"
        f"Total Reconocido por Devolución : Bs. {total_devuelto:.2f}\n"
        f"Diferencia / Ajuste Aplicado    : Bs. {diferencia_cobrada:+.2f}\n"
        f"{literal_devuelto}\n"
        f"------------------------------------------------------------\n"
        f"Código Único de Verificación: {hash_aut}\n"
        f"============================================================\n"
    )

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titulo_principal} {nro_devolucion}</title>
  <style>
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }}
    body {{ margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }}
    @media screen and (max-width: 600px) {{
      .wrapper {{ width: 100% !important; padding: 8px !important; }}
      .card {{ border-radius: 8px !important; }}
      .col-stack {{ display: block !important; width: 100% !important; text-align: left !important; padding-bottom: 10px !important; }}
      .pad-mobile {{ padding: 16px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">

  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">
    {titulo_principal} #{nro_devolucion} correspondiente a la Factura {nro_ticket_original} por Bs. {total_devuelto:.2f}.
  </div>

  <center style="width: 100%; background-color: #f1f5f9; padding: 20px 0;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; margin: 0 auto;" class="wrapper">
      <tr>
        <td align="center" valign="top">

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);" class="card">

            <!-- Franja Superior -->
            <tr>
              <td style="background-color: {color_acento}; height: 6px; font-size: 1px; line-height: 1px;">&nbsp;</td>
            </tr>

            <!-- Cabecera -->
            <tr>
              <td style="background-color: #0f172a; padding: 22px 24px;" class="pad-mobile">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="col-stack" valign="top" style="width: 58%;">
                      <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.4px;">
                        FASHIONSTORE <span style="color: #60a5fa; font-weight: 400;">BOLIVIA S.R.L.</span>
                      </div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;">
                        {sucursal_nombre} — Santa Cruz de la Sierra, Bolivia<br/>
                        {subtitulo_header}
                      </div>
                    </td>
                    <td class="col-stack" valign="top" align="right" style="width: 42%;">
                      <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; display: inline-block; text-align: left; min-width: 195px;">
                        <div style="font-size: 10px; font-weight: 800; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px;">
                          NOTA DE DEVOLUCIÓN / CAMBIO
                        </div>
                        <div style="font-size: 12px; color: #ffffff; font-weight: 800; margin-top: 3px; font-family: monospace;">
                          N°: <span style="color: #38bdf8;">{nro_devolucion}</span>
                        </div>
                        <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px; font-family: monospace;">
                          Factura Orig.: <strong>{nro_ticket_original}</strong>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Barra de Estado -->
            <tr>
              <td style="background-color: {bg_acento}; border-bottom: 1px solid {borde_acento}; padding: 10px 24px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 12px; font-weight: 800; color: {color_acento};">
                      ✓ {badge_estado}
                    </td>
                    <td align="right" style="font-size: 11px; font-weight: 700; color: #334155; font-family: monospace;">
                      Fecha: {fecha_hora}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Cuerpo Principal -->
            <tr>
              <td style="padding: 22px 24px;" class="pad-mobile">

                <p style="margin: 0 0 14px 0; font-size: 13px; color: #334155; line-height: 1.5;">
                  Estimado(a) <strong>{cliente_nombre}</strong>, le enviamos el comprobante oficial correspondiente a la gestión de su solicitud de post-venta sobre la factura <strong>{nro_ticket_original}</strong>:
                </p>

                <!-- Datos de la Operación -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 18px;">
                  <tr>
                    <td style="padding: 12px 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="col-stack" width="50%" valign="top" style="padding-right: 8px;">
                            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Cliente / Razón Social</div>
                            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">{cliente_nombre}</div>
                            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 8px;">Motivo Registrado</div>
                            <div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">{motivo}</div>
                          </td>
                          <td class="col-stack" width="50%" valign="top">
                            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Modalidad de Resolución</div>
                            <div style="font-size: 12px; font-weight: 800; color: {color_acento}; margin-top: 2px;">{tipo_resolucion}</div>
                            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 8px;">Sucursal / Operador</div>
                            <div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">{sucursal_nombre} ({cajero_nombre})</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Tabla de Prendas Devueltas -->
                <div style="font-size: 11px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 2px solid #0f172a; padding-bottom: 4px;">
                  1. DETALLE DE PRENDAS DEVUELTAS / RECIBIDAS
                </div>

                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                  <thead>
                    <tr style="background-color: #0f172a;">
                      <th width="10%" style="padding: 8px; font-size: 10px; font-weight: 800; color: #ffffff; text-transform: uppercase; text-align: center;">Cant.</th>
                      <th width="50%" style="padding: 8px; font-size: 10px; font-weight: 800; color: #ffffff; text-transform: uppercase; text-align: left;">Prenda / Estado Físico</th>
                      <th width="20%" style="padding: 8px; font-size: 10px; font-weight: 800; color: #ffffff; text-transform: uppercase; text-align: right;">P. Unit.</th>
                      <th width="20%" style="padding: 8px; font-size: 10px; font-weight: 800; color: #ffffff; text-transform: uppercase; text-align: right;">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas_devueltas_html}
                  </tbody>
                </table>

                {bloque_nuevo_item_html}

                {bloque_vale_html}

                <!-- Resumen Financiero -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 18px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        {filas_totales_html}
                        <tr>
                          <td colspan="2" style="padding-top: 8px;">
                            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid {color_acento}; padding: 6px 10px; border-radius: 4px; font-size: 11px; color: #334155; font-weight: 600;">
                              {literal_devuelto}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Bloque QR y Trazabilidad Kardex -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="col-stack" width="115" align="center" style="vertical-align: middle; padding-right: 14px;">
                            <div style="background-color: #ffffff; display: inline-block; padding: 3px; border: 1px solid #cbd5e1; border-radius: 6px;">
                              <img src="{qr_url}" alt="QR Devolución" width="100" height="100" style="display: block; margin: 0 auto; border: 0;" />
                            </div>
                          </td>
                          <td class="col-stack" style="vertical-align: middle;">
                            <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase;">
                              CÓDIGO DE TRAZABILIDAD KARDEX & AUDITORÍA (CU25)
                            </div>
                            <div style="background-color: #f8fafc; border: 1px dashed #94a3b8; border-radius: 4px; padding: 6px 8px; font-family: monospace; font-size: 10px; color: #0f172a; word-break: break-all; margin: 4px 0 6px 0; font-weight: 600;">
                              {hash_aut}
                            </div>
                            <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
                              Movimiento asentado en Kardex al Costo Promedio Ponderado (CPP) histórico. Comprobante vinculado a la factura original <strong>{nro_ticket_original}</strong>.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Pie de Página -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 10px; color: #475569; line-height: 1.5;">
                <strong>FASHIONSTORE BOLIVIA S.R.L. — CENTRO DE ATENCIÓN POST-VENTA Y GARANTÍAS</strong><br/>
                Ley N° 453: El proveedor deberá garantizar el cambio o devolución en los plazos establecidos.<br/>
                © 2026 FashionStore Omnicanal • Comprobante Electrónico Automático
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </center>

</body>
</html>"""

    part1 = MIMEText(texto_plano, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def enviar_correo_devolucion_intercambio(
    destinatarios: list,
    devolucion_dict: dict,
    async_send: bool = True
) -> bool:
    """
    Envía el comprobante oficial de Devolución, Intercambio, Vale de Crédito o Reembolso
    a todos los destinatarios indicados (cliente + copia administrativa configurada).
    """
    dest_limpios = []
    for d in (destinatarios or []):
        if d and "@" in str(d):
            correo = str(d).strip().lower()
            if correo not in dest_limpios:
                dest_limpios.append(correo)

    if not dest_limpios and settings.EMAIL_HOST_USER:
        dest_limpios = [settings.EMAIL_HOST_USER.strip().lower()]

    def _tarea():
        try:
            msg = _construir_mensaje_devolucion_intercambio(
                destinatarios=dest_limpios,
                devolucion_dict=devolucion_dict
            )
            tipo_res = devolucion_dict.get("tipo_resolucion", "DEVOLUCION")
            nro_dev = devolucion_dict.get("nro_devolucion", "")
            return _despachar_email_robusto(
                msg,
                dest_limpios,
                tipo_correo=f"Comprobante Post-Venta ({tipo_res} {nro_dev})"
            )
        except Exception as e:
            print(f" [SMTP ERROR] Error procesando correo de devolución/intercambio para {dest_limpios}: {e}")
            return False

    if async_send:
        threading.Thread(target=_tarea, daemon=True).start()
        return True
    return _tarea()

