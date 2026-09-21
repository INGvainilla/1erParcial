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


def _construir_mensaje_bienvenida(destinatario: str, nombre_usuario: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "¡Bienvenido a FashionStore! Tu cuenta de cliente está lista"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"SIGEPSI <{settings.EMAIL_HOST_USER}>"
    msg["To"] = destinatario

    texto_plano = f"""
¡Hola {nombre_usuario}!

Te damos una cordial bienvenida a FashionStore, tu plataforma de moda y comercio omnicanal.
Tu cuenta de cliente ha sido registrada y activada exitosamente con el correo: {destinatario}.

Ya puedes acceder a todos nuestros servicios:
- Explorar el catálogo de prendas exclusivas (CU10).
- Probar outfits con nuestro Asistente de Estilo Inteligente (CU22/CU23).
- Comparar prendas y tallas interactivamente (CU20).
- Acumular puntos en el Club VIP & Puntos de Fidelización (CU21).
- Reservar prendas para probadores físicos con tu ticket QR (CU11).

Ingresa a la tienda digital: http://localhost:4200/#/catalogo

Atentamente,
El Equipo de FashionStore / SIGEPSI
Sistemas de Información II (SI2)
"""

    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 20px; }}
    .container {{ max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.5); }}
    .header {{ background: linear-gradient(135deg, #4338ca, #6366f1 50%, #ec4899); padding: 28px 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 0.5px; font-weight: 800; }}
    .header p {{ margin: 6px 0 0; color: #e0e7ff; font-size: 13px; }}
    .content {{ padding: 32px 26px; }}
    .greeting {{ font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #f8fafc; }}
    .card-box {{ background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 10px; padding: 20px; margin: 22px 0; }}
    .feature-list {{ list-style: none; padding: 0; margin: 12px 0 0; }}
    .feature-item {{ margin-bottom: 10px; font-size: 13.5px; color: #cbd5e1; line-height: 1.4; }}
    .btn-action {{ display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; margin: 18px 0; font-size: 14px; }}
    .footer {{ background: #0c121e; padding: 18px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid rgba(255,255,255,0.06); }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👑 FashionStore</h1>
      <p>Plataforma E-Commerce Omnicanal de Moda</p>
    </div>
    <div class="content">
      <div class="greeting">¡Bienvenido, {nombre_usuario}!</div>
      <p style="color: #cbd5e1; line-height: 1.5; font-size: 14px;">
        Tu cuenta de cliente ha sido creada y activada correctamente. Ahora eres parte de la experiencia omnicanal más moderna de moda en Bolivia.
      </p>

      <div class="card-box">
        <strong style="color: #a5b4fc; font-size: 14px;">✨ Beneficios de tu nueva cuenta:</strong>
        <div class="feature-list">
          <div class="feature-item">🛍️ <strong>Catálogo Digital:</strong> Consulta de prendas, colores y stock en tiempo real (CU10).</div>
          <div class="feature-item">🤖 <strong>Estilismo con IA:</strong> Recomendaciones personalizadas de outfits según ocasión y clima (CU22/CU23).</div>
          <div class="feature-item">🎟️ <strong>Reservas con QR:</strong> Aparta prendas para probadores físicos con tu ticket digital (CU11).</div>
          <div class="feature-item">💎 <strong>Club VIP:</strong> Acumulación de puntos y beneficios exclusivos (CU21).</div>
        </div>
      </div>

      <p style="color: #94a3b8; font-size: 13px;">
        Correo registrado: <strong style="color: #f1f5f9;">{destinatario}</strong>
      </p>

      <div style="text-align: center;">
        <a href="http://localhost:4200/#/catalogo" class="btn-action">Explorar Colección de Moda</a>
      </div>
    </div>
    <div class="footer">
      © 2026 FashionStore — Sistemas de Información II (SI2) | UMSA<br>
      Docente: MSc. Ing. Angélica Garzón Cuéllar | Proyecto Ciclo 1 & 2
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


def enviar_correo_bienvenida(destinatario: str, nombre_usuario: str = "Cliente", async_send: bool = True) -> bool:
    """
    Envía el correo de bienvenida al cliente registrado (CU02) vía SMTP Gmail.
    Si async_send=True, lo despacha en un hilo secundario para no bloquear el registro.
    """
    def _tarea_envio():
        try:
            if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
                print(f" [SMTP] Advertencia: EMAIL_HOST_USER o PASSWORD no configurados para bienvenida.")
                return False

            msg = _construir_mensaje_bienvenida(destinatario, nombre_usuario)

            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=15)
            if settings.EMAIL_USE_TLS:
                server.starttls()
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.sendmail(settings.EMAIL_HOST_USER, [destinatario], msg.as_string())
            server.quit()
            print(f" [SMTP SUCCESS] Correo de bienvenida enviado a {destinatario} vía {settings.EMAIL_HOST}")
            return True
        except Exception as e:
            print(f" [SMTP ERROR] Error enviando correo de bienvenida a {destinatario}: {e}")
            return False

    if async_send:
        hilo = threading.Thread(target=_tarea_envio, daemon=True)
        hilo.start()
        return True
    else:
        return _tarea_envio()


def _construir_mensaje_password_cambiada(destinatario: str, nombre_usuario: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Seguridad FashionStore - Tu contraseña ha sido actualizada"
    msg["From"] = settings.DEFAULT_FROM_EMAIL or f"SIGEPSI <{settings.EMAIL_HOST_USER}>"
    msg["To"] = destinatario

    texto_plano = f"""
Hola {nombre_usuario},

Te confirmamos que la contraseña de tu cuenta en FashionStore asociada a {destinatario} ha sido restablecida exitosamente mediante código de verificación OTP (CU03).

Ya puedes iniciar sesión con tus nuevas credenciales: http://localhost:4200/#/login

Si no fuiste tú quien realizó esta modificación, comunícate de inmediato con el soporte de FashionStore.

Atentamente,
Equipo de Seguridad FashionStore / SIGEPSI
"""

    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 20px; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header {{ background: linear-gradient(135deg, #059669, #10b981); padding: 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 0.5px; }}
    .header p {{ margin: 5px 0 0; color: #d1fae5; font-size: 13px; }}
    .content {{ padding: 28px 24px; }}
    .greeting {{ font-size: 16px; margin-bottom: 14px; color: #f8fafc; font-weight: 600; }}
    .status-badge {{ background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 14px; text-align: center; margin: 18px 0; color: #6ee7b7; font-weight: 600; }}
    .notice {{ font-size: 12.5px; color: #9ca3af; line-height: 1.5; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }}
    .footer {{ background: #0c121e; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 FashionStore Seguridad</h1>
      <p>Actualización de Credenciales de Acceso</p>
    </div>
    <div class="content">
      <div class="greeting">Hola <strong>{nombre_usuario}</strong>,</div>
      <p style="color: #d1d5db; line-height: 1.5; font-size: 14px;">
        Te informamos que la contraseña asociada a tu cuenta de correo <strong>{destinatario}</strong> ha sido restablecida exitosamente a través del proceso de validación OTP (CU03).
      </p>

      <div class="status-badge">
        ✓ Contraseña Actualizada Correctamente
      </div>

      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
        Ya puedes ingresar a la plataforma con tu nueva clave:
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="http://localhost:4200/#/login" style="display: inline-block; background: #6366f1; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Iniciar Sesión</a>
      </div>

      <div class="notice">
        ⚠️ <strong>Aviso de Seguridad:</strong> Si tú no realizaste este cambio, tu cuenta podría estar comprometida. Notifícalo de inmediato a la administración.
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


def enviar_correo_password_cambiada(destinatario: str, nombre_usuario: str = "Cliente", async_send: bool = True) -> bool:
    """
    Envía notificación de seguridad confirmando cambio de contraseña (CU03) vía SMTP Gmail.
    """
    def _tarea_envio():
        try:
            if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
                return False

            msg = _construir_mensaje_password_cambiada(destinatario, nombre_usuario)

            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=15)
            if settings.EMAIL_USE_TLS:
                server.starttls()
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.sendmail(settings.EMAIL_HOST_USER, [destinatario], msg.as_string())
            server.quit()
            print(f" [SMTP SUCCESS] Notificación de cambio de clave enviada a {destinatario} vía {settings.EMAIL_HOST}")
            return True
        except Exception as e:
            print(f" [SMTP ERROR] Error enviando notificación de cambio de clave a {destinatario}: {e}")
            return False

    if async_send:
        hilo = threading.Thread(target=_tarea_envio, daemon=True)
        hilo.start()
        return True
    else:
        return _tarea_envio()
