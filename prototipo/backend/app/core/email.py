# -*- coding: utf-8 -*-
"""
Servicio de Envio de Correos Electrónicos vía SMTP (Gmail)
Implementa el Caso de Uso CU03: Recuperación de Contraseña vía Token OTP de 6 Dígitos.
"""
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def _construir_mensaje_otp(destinatario: str, codigo_otp: str, nombre_usuario: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"FashionStore - Código de Verificación OTP: {codigo_otp}"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"SIGEPSI <{settings.EMAIL_HOST_USER}>"
    msg["To"] = destinatario

    # Versión Texto Plano
    texto_plano = f"""
Hola {nombre_usuario},

Has solicitado recuperar tu contraseña en FashionStore.
Tu código de verificación OTP es:

    {codigo_otp}

Este código es de un solo uso y vencerá en {settings.OTP_EXPIRE_MINUTES} minutos.
Si no has solicitado este cambio, puedes ignorar este mensaje de forma segura.

Atentamente,
Equipo FashionStore / SIGEPSI
"""

    # Versión HTML con diseño moderno
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 20px; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header {{ background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 1px; }}
    .header p {{ margin: 5px 0 0; color: #bfdbfe; font-size: 13px; }}
    .content {{ padding: 30px 24px; }}
    .greeting {{ font-size: 16px; margin-bottom: 16px; color: #e5e7eb; }}
    .otp-box {{ background: rgba(59, 130, 246, 0.1); border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #60a5fa; font-family: monospace; }}
    .otp-timer {{ font-size: 13px; color: #9ca3af; margin-top: 8px; }}
    .notice {{ font-size: 13px; color: #9ca3af; line-height: 1.5; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }}
    .footer {{ background: #0c121e; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👔 FashionStore</h1>
      <p>Sistema Inteligente de Comercio Omnicanal</p>
    </div>
    <div class="content">
      <div class="greeting">Hola <strong>{nombre_usuario}</strong>,</div>
      <p style="color: #d1d5db; line-height: 1.5;">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
        Usa el siguiente código de un solo uso (OTP) para continuar con el proceso:
      </p>
      
      <div class="otp-box">
        <div class="otp-code">{codigo_otp}</div>
        <div class="otp-timer">⏱ Válido por los próximos {settings.OTP_EXPIRE_MINUTES} minutos</div>
      </div>

      <div class="notice">
        ⚠️ <strong>Importante:</strong> Por motivos de seguridad, nunca compartas este código con nadie. El personal de FashionStore nunca te solicitará este token. Si no solicitaste este cambio, puedes desestimar este correo.
      </div>
    </div>
    <div class="footer">
      © 2026 FashionStore — Sistemas de Información II (SI2) | Docente: MSc. Ing. Angélica Garzón Cuéllar
    </div>
  </div>
</body>
</html>
"""

    part1 = MIMEText(texto_plano, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)

    return msg

def enviar_correo_otp(destinatario: str, codigo_otp: str, nombre_usuario: str = "Usuario", async_send: bool = True) -> bool:
    """
    Envía el correo con el código OTP usando la configuración SMTP de Gmail.
    Si async_send=True, lo despacha en un hilo secundario para no demorar la respuesta HTTP.
    """
    def _tarea_envio():
        try:
            if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
                print(f" [SMTP] Advertencia: EMAIL_HOST_USER o PASSWORD no configurados. OTP simulado: {codigo_otp}")
                return False

            msg = _construir_mensaje_otp(destinatario, codigo_otp, nombre_usuario)

            # Conexión SMTP
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=15)
            if settings.EMAIL_USE_TLS:
                server.starttls()
            
            # Autenticación con contraseña de aplicación
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            
            # Enviar
            server.sendmail(settings.EMAIL_HOST_USER, [destinatario], msg.as_string())
            server.quit()
            print(f" [SMTP SUCCESS] Correo OTP enviado exitosamente a {destinatario} vía {settings.EMAIL_HOST}")
            return True
        except Exception as e:
            print(f" [SMTP ERROR] Error enviando correo OTP a {destinatario}: {e}")
            return False

    if async_send:
        hilo = threading.Thread(target=_tarea_envio, daemon=True)
        hilo.start()
        return True
    else:
        return _tarea_envio()
