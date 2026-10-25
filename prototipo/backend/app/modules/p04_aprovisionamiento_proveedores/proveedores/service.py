# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Gestión de Proveedores Textiles (CU08)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.p04_aprovisionamiento_proveedores.proveedores.models import Proveedor
from app.modules.p04_aprovisionamiento_proveedores.proveedores.schemas import (
    ProveedorCreate, ProveedorUpdate, ProveedorResponse
)

class ProveedorControl:
    """
    Controlador de Gestión de Proveedores Textiles (ProveedorControl - CU08)
    Supervisa el directorio de confeccionistas, validación de NIT tributario y condiciones comerciales.
    """

    @staticmethod
    def listar_proveedores(db: Session, estado: Optional[str] = None) -> List[ProveedorResponse]:
        # CU08: Gestionar Proveedores Textiles, Paso 1: Consultar directorio de empresas proveedoras en ProveedorEntity
        query = db.query(Proveedor)
        if estado:
            query = query.filter(Proveedor.estado == estado.upper())
        proveedores = query.order_by(Proveedor.razon_social.asc()).all()
        return [ProveedorResponse.from_orm(p) for p in proveedores]

    @staticmethod
    def obtener_proveedor(db: Session, id_proveedor: int) -> ProveedorResponse:
        # CU08: Gestionar Proveedores Textiles, Paso 1.2: Obtener ficha técnica de proveedor en ProveedorEntity
        p = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Proveedor {id_proveedor} no encontrado.")
        return ProveedorResponse.from_orm(p)

    @staticmethod
    def registrar_proveedor(db: Session, request: ProveedorCreate) -> ProveedorResponse:
        # CU08: Gestionar Proveedores Textiles, Paso 2: Personal de Logística envía datos del proveedor (NIT, razón social, contacto)
        # CU08: Gestionar Proveedores Textiles, Paso 2.1: IProveedorBoundary invoca registrar_proveedor(datosProv) en ProveedorControl
        nit_limpio = request.nit_identificacion.strip()

        # CU08: Gestionar Proveedores Textiles, Paso 2.2: ProveedorControl verifica unicidad de NIT en ProveedorEntity
        existente = db.query(Proveedor).filter(Proveedor.nit_identificacion == nit_limpio).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El NIT '{nit_limpio}' ya está registrado a nombre de '{existente.razon_social}'."
            )

        # Validar términos de pago válidos
        terminos_validos = {"CONTADO", "CREDITO_30_DIAS", "CREDITO_60_DIAS", "CONSIGNACION"}
        termino_norm = request.terminos_pago.upper()
        if termino_norm not in terminos_validos:
            termino_norm = "CONTADO"

        # CU08: Gestionar Proveedores Textiles, Paso 2.3: Crear registro de la empresa proveedora en ProveedorEntity
        nuevo_prov = Proveedor(
            nit_identificacion=nit_limpio,
            razon_social=request.razon_social.strip(),
            contacto_nombre=request.contacto_nombre.strip() if request.contacto_nombre else None,
            telefono=request.telefono.strip() if request.telefono else None,
            email=request.email.strip().lower() if request.email else None,
            terminos_pago=termino_norm,
            estado=request.estado.upper()
        )
        db.add(nuevo_prov)
        db.commit()
        db.refresh(nuevo_prov)

        # CU08: Gestionar Proveedores Textiles, Paso 2.4: Confirmar alta de proveedor y retornar ProveedorResponse
        return ProveedorResponse.from_orm(nuevo_prov)

    @staticmethod
    def modificar_proveedor(db: Session, id_proveedor: int, request: ProveedorUpdate) -> ProveedorResponse:
        # CU08: Gestionar Proveedores Textiles, Paso 3: Administrador actualiza información de contacto o términos comerciales
        # CU08: Gestionar Proveedores Textiles, Paso 3.1: Recuperar proveedor en ProveedorEntity
        p = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Proveedor {id_proveedor} no encontrado.")

        if request.razon_social:
            p.razon_social = request.razon_social.strip()
        if request.contacto_nombre is not None:
            p.contacto_nombre = request.contacto_nombre.strip() if request.contacto_nombre else None
        if request.telefono is not None:
            p.telefono = request.telefono.strip() if request.telefono else None
        if request.email is not None:
            p.email = request.email.strip().lower() if request.email else None
        if request.terminos_pago:
            p.terminos_pago = request.terminos_pago.upper()
        if request.estado:
            p.estado = request.estado.upper()

        # CU08: Gestionar Proveedores Textiles, Paso 3.2: Persistir cambios en base de datos y retornar DTO
        db.commit()
        db.refresh(p)
        return ProveedorResponse.from_orm(p)
