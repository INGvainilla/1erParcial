# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import cast, Date
from fastapi import HTTPException, status
import qrcode
import base64
from io import BytesIO
import uuid
from datetime import date

from app.modules.reservas.models import Reserva, ReservaDetalle
from app.modules.reservas.schemas import ReservaCreate
from app.modules.inventario.models import Inventario, KardexMovimiento

def crear_reserva(db: Session, reserva_in: ReservaCreate, id_usuario: int) -> Reserva:
    # 1. Validar Stock y apartar
    for det in reserva_in.detalles:
        inv = db.query(Inventario).filter(
            Inventario.id_sucursal == reserva_in.id_sucursal,
            Inventario.id_producto == det.id_producto,
            Inventario.talla == det.talla,
            Inventario.color == det.color
        ).with_for_update().first() # Pesimista
        
        if not inv or inv.stock_disponible < det.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para el producto {det.id_producto} en talla {det.talla} y color {det.color}"
            )
        
        # Descontar stock disponible y sumar al reservado
        inv.stock_disponible -= det.cantidad
        inv.stock_reservado += det.cantidad
        
        # Opcional: Registrar en Kardex como RESERVA_APARTADA
        kardex = KardexMovimiento(
            id_inventario=inv.id_inventario,
            tipo_movimiento="RESERVA_APARTADA",
            cantidad=det.cantidad,
            costo_unitario_movimiento=inv.costo_promedio_ponderado,
            saldo_cantidad_resultante=inv.stock_disponible,
            saldo_cpp_resultante=inv.costo_promedio_ponderado,
            referencia_documento="Reserva Web"
        )
        db.add(kardex)

    # 2. Generar QR Code
    qr_data = f"RES-{uuid.uuid4()}-{id_usuario}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    qr_code_str = f"data:image/png;base64,{qr_base64}"

    # 3. Guardar en Base de Datos
    db_reserva = Reserva(
        id_usuario=id_usuario,
        id_sucursal=reserva_in.id_sucursal,
        codigo_qr=qr_code_str,
        qr_texto=qr_data,  # CU12: Guardar texto legible para escaneo
        fecha_visita=reserva_in.fecha_visita,
        estado="PENDIENTE"
    )
    db.add(db_reserva)
    db.flush()

    for det in reserva_in.detalles:
        db_detalle = ReservaDetalle(
            id_reserva=db_reserva.id_reserva,
            id_producto=det.id_producto,
            talla=det.talla,
            color=det.color,
            cantidad=det.cantidad
        )
        db.add(db_detalle)
    
    db.commit()
    db.refresh(db_reserva)
    return db_reserva


# ==========================================
# CU12: PREPARAR Y ATENDER RESERVA PRESENCIAL
# ==========================================

def listar_reservas_sucursal_hoy(db: Session, id_sucursal: int):
    """
    Lista las reservas de una sucursal para el día de hoy,
    ordenadas por hora de visita.
    """
    hoy = date.today()
    reservas = db.query(Reserva).options(
        joinedload(Reserva.detalles),
        joinedload(Reserva.usuario)
    ).filter(
        Reserva.id_sucursal == id_sucursal
    ).all()
    
    # Filtrar por fecha del día (comparar solo la parte date)
    reservas_hoy = [
        r for r in reservas
        if r.fecha_visita and r.fecha_visita.date() == hoy
    ]
    
    # Ordenar por hora de visita
    reservas_hoy.sort(key=lambda r: r.fecha_visita)
    return reservas_hoy


def actualizar_estado_reserva(db: Session, id_reserva: int, nuevo_estado: str, id_sucursal: Optional[int] = None, es_admin: bool = False) -> Reserva:
    """
    Actualiza el estado de una reserva (ej. PENDIENTE -> PREPARADA).
    Verifica que la reserva pertenezca a la sucursal del encargado (a menos que sea admin).
    """
    reserva = db.query(Reserva).filter(Reserva.id_reserva == id_reserva).first()
    
    if not reserva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada."
        )
    
    if not es_admin and id_sucursal and reserva.id_sucursal != id_sucursal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta reserva pertenece a otra sucursal."
        )
    
    # Validar transiciones de estado válidas
    transiciones_validas = {
        "PENDIENTE": ["PREPARADA", "CANCELADA"],
        "PREPARADA": ["ATENDIDA", "CANCELADA"],
    }
    
    estados_permitidos = transiciones_validas.get(reserva.estado, [])
    if nuevo_estado not in estados_permitidos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cambiar de '{reserva.estado}' a '{nuevo_estado}'. Transiciones permitidas: {estados_permitidos}"
        )
    
    reserva.estado = nuevo_estado
    db.commit()
    db.refresh(reserva)
    return reserva


def validar_y_atender_qr(db: Session, codigo_qr: str, id_sucursal: Optional[int] = None, es_admin: bool = False) -> Reserva:
    """
    Busca una reserva por el texto del QR escaneado, ID o Data URI, valida la sucursal
    (a menos que sea admin) y la marca como ATENDIDA.
    """
    from sqlalchemy import or_
    codigo_clean = codigo_qr.strip()
    if codigo_clean.startswith("#"):
        codigo_clean = codigo_clean[1:].strip()

    conds = [
        Reserva.qr_texto == codigo_clean,
        Reserva.codigo_qr == codigo_clean
    ]
    if codigo_clean.isdigit():
        conds.append(Reserva.id_reserva == int(codigo_clean))

    reserva = db.query(Reserva).options(
        joinedload(Reserva.detalles),
        joinedload(Reserva.usuario)
    ).filter(or_(*conds)).first()
    
    if not reserva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código QR inválido. No se encontró ninguna reserva asociada."
        )
    
    if not es_admin and id_sucursal and reserva.id_sucursal != id_sucursal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El código pertenece a otra sucursal."
        )
    
    if reserva.estado == "ATENDIDA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta reserva ya fue atendida previamente."
        )
    
    if reserva.estado == "CANCELADA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta reserva fue cancelada."
        )
    
    reserva.estado = "ATENDIDA"
    db.commit()
    db.refresh(reserva)
    return reserva
