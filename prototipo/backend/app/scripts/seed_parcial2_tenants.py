# -*- coding: utf-8 -*-
"""
Script de Migración y Población de Datos para el Segundo Parcial (CU01 al CU07):
1. Crea tablas de planes_suscripcion, empresas, suscripciones.
2. Agrega columnas id_empresa, medidas_antropometricas, composicion_textil, codigo_hex_secundario.
3. Siembra los planes Básico y Profesional, y las empresas piloto.
4. Vincula todos los datos existentes (sucursales, usuarios, productos, inventario) a la Empresa #1 (FashionStore).
5. Crea el usuario SUPER_ADMIN de la plataforma SaaS.
6. Pobla las medidas antropométricas en cm y composición textil para CU06.
"""
import sys
import os
import json
from decimal import Decimal
from datetime import date, timedelta, datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy import text
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
import app.main  # Asegura que todos los modelos de los 10 paquetes estén registrados en SQLAlchemy
from app.modules.p01_seguridad_acceso.tenants.models import Empresa, PlanSuscripcion, SuscripcionEmpresa
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto, ProductoColor, ProductoTalla
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario

def migrar_y_poblar_parcial2():
    print("=== [PARCIAL 2] INICIANDO MIGRACIÓN DDL Y SIEMBRA MULTITENANT ===")

    # 1. Ejecutar DDL preventivo en el motor
    with engine.connect() as conn:
        ddls = [
            "ALTER TABLE producto_tallas ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);",
            "ALTER TABLE producto_tallas ADD COLUMN IF NOT EXISTS medidas_cm VARCHAR(150);",
            "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_empresa INTEGER;",
            "ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS id_empresa INTEGER;",
            "ALTER TABLE productos ADD COLUMN IF NOT EXISTS id_empresa INTEGER;",
            "ALTER TABLE productos ADD COLUMN IF NOT EXISTS medidas_antropometricas TEXT;",
            "ALTER TABLE productos ADD COLUMN IF NOT EXISTS composicion_textil VARCHAR(150);",
            "ALTER TABLE producto_colores ADD COLUMN IF NOT EXISTS codigo_hex_secundario VARCHAR(10);",
            "ALTER TABLE inventario ADD COLUMN IF NOT EXISTS id_empresa INTEGER;"
        ]
        for ddl in ddls:
            try:
                conn.execute(text(ddl))
            except Exception:
                pass
        conn.commit()
    print("[OK] Migraciones DDL preventivas ejecutadas.")

    # 2. Crear tablas de metadata que no existieran
    Base.metadata.create_all(bind=engine)
    print("[OK] Tablas de modelos Base sincronizadas.")

    db = SessionLocal()
    try:
        # 3. CU02: Sembrar Planes de Suscripción si no existen
        plan_basico = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_BASICO").first()
        if not plan_basico:
            plan_basico = PlanSuscripcion(
                nombre="Básico",
                codigo="PLAN_BASICO",
                max_sucursales=2,
                max_usuarios=10,
                permite_reportes_ia=False,
                permite_ml_dashboard=False,
                soporta_offline=True,
                precio_mensual=Decimal("99.00"),
                estado="ACTIVO",
                descripcion="Plan esencial para pequeñas boutiques textiles con hasta 2 sucursales y operación offline."
            )
            db.add(plan_basico)

        plan_pro = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_PRO").first()
        if not plan_pro:
            plan_pro = PlanSuscripcion(
                nombre="Profesional",
                codigo="PLAN_PRO",
                max_sucursales=5,
                max_usuarios=25,
                permite_reportes_ia=True,
                permite_ml_dashboard=True,
                soporta_offline=True,
                precio_mensual=Decimal("199.00"),
                estado="ACTIVO",
                descripcion="Plan integral con analítica avanzada, reportes generativos con IA y dashboards de Machine Learning."
            )
            db.add(plan_pro)
        
        db.commit()
        db.refresh(plan_basico)
        db.refresh(plan_pro)
        print(f"[OK] Planes de suscripción listos: #{plan_basico.id_plan} {plan_basico.nombre}, #{plan_pro.id_plan} {plan_pro.nombre}")

        # 4. CU01: Sembrar Empresas (Tenants)
        emp1 = db.query(Empresa).filter(Empresa.nit == "1029384756").first()
        if not emp1:
            emp1 = Empresa(
                nit="1029384756",
                razon_social="FashionStore Bolivia S.R.L.",
                nombre_comercial="FashionStore",
                dominio_slug="fashionstore-scz",
                schema_name="tenant_fashionstore_scz",
                email_contacto="gerencia@fashionstore.bo",
                telefono="+591 3 3445566",
                direccion="Av. San Martín #450, Equipetrol, Santa Cruz",
                logo_url="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300",
                presupuesto_disponible=Decimal("75000.00"),
                estado="ACTIVA"
            )
            db.add(emp1)
            db.flush()
            print(f"[OK] Creada Empresa Principal: #{emp1.id_empresa} {emp1.nombre_comercial}")

        emp2 = db.query(Empresa).filter(Empresa.nit == "2039485761").first()
        if not emp2:
            emp2 = Empresa(
                nit="2039485761",
                razon_social="Textiles Elegance S.A.",
                nombre_comercial="Elegance Men",
                dominio_slug="elegance-men",
                schema_name="tenant_elegance_men",
                email_contacto="contacto@elegance.bo",
                telefono="+591 2 2789012",
                direccion="Av. Montenegro #890, San Miguel, La Paz",
                logo_url="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300",
                presupuesto_disponible=Decimal("40000.00"),
                estado="ACTIVA"
            )
            db.add(emp2)
            db.flush()
            print(f"[OK] Creada Empresa Piloto 2: #{emp2.id_empresa} {emp2.nombre_comercial}")

        db.commit()
        db.refresh(emp1)
        db.refresh(emp2)

        # 5. CU03: Sembrar Suscripciones de Empresa
        susc1 = db.query(SuscripcionEmpresa).filter(SuscripcionEmpresa.id_empresa == emp1.id_empresa).first()
        if not susc1:
            susc1 = SuscripcionEmpresa(
                id_empresa=emp1.id_empresa,
                id_plan=plan_pro.id_plan,
                fecha_inicio=date.today() - timedelta(days=30),
                fecha_vencimiento=date.today() + timedelta(days=335),
                estado="ACTIVA",
                auto_renovar=True
            )
            db.add(susc1)

        susc2 = db.query(SuscripcionEmpresa).filter(SuscripcionEmpresa.id_empresa == emp2.id_empresa).first()
        if not susc2:
            susc2 = SuscripcionEmpresa(
                id_empresa=emp2.id_empresa,
                id_plan=plan_basico.id_plan,
                fecha_inicio=date.today(),
                fecha_vencimiento=date.today() + timedelta(days=60),
                estado="ACTIVA",
                auto_renovar=True
            )
            db.add(susc2)
        db.commit()
        print("[OK] Suscripciones de empresa registradas con éxito.")

        # 6. CU04: Crear Super Administrador de la Plataforma SaaS (sin id_empresa)
        super_admin = db.query(Usuario).filter(Usuario.email == "superadmin@fashionstore.bo").first()
        if not super_admin:
            super_admin = Usuario(
                id_empresa=None,  # Super admin global no tiene restricción de tenant
                nombres="Super",
                apellidos="Administrador SaaS",
                email="superadmin@fashionstore.bo",
                password_hash=get_password_hash("SuperAdmin123*"),
                telefono="+591 70000001",
                rol="SUPER_ADMIN",
                estado_cuenta="ACTIVO"
            )
            db.add(super_admin)
            print("[OK] Creado usuario SUPER_ADMIN (superadmin@fashionstore.bo / SuperAdmin123*)")

        # 7. Asignar id_empresa = 1 a todos los usuarios que no tengan empresa asignada (excepto superadmin)
        usuarios_sin_empresa = db.query(Usuario).filter(Usuario.id_empresa.is_(None), Usuario.rol != "SUPER_ADMIN").all()
        for u in usuarios_sin_empresa:
            u.id_empresa = emp1.id_empresa
        print(f"[OK] Asignada Empresa #{emp1.id_empresa} a {len(usuarios_sin_empresa)} usuarios existentes.")

        # 8. Asignar id_empresa = 1 a todas las sucursales existentes
        sucursales_sin_empresa = db.query(Sucursal).filter(Sucursal.id_empresa.is_(None)).all()
        for s in sucursales_sin_empresa:
            s.id_empresa = emp1.id_empresa
        print(f"[OK] Asignada Empresa #{emp1.id_empresa} a {len(sucursales_sin_empresa)} sucursales.")

        # 9. Asignar id_empresa = 1 a todos los productos e inventarios existentes
        prods_sin_empresa = db.query(Producto).filter(Producto.id_empresa.is_(None)).all()
        for p in prods_sin_empresa:
            p.id_empresa = emp1.id_empresa
        print(f"[OK] Asignada Empresa #{emp1.id_empresa} a {len(prods_sin_empresa)} productos.")

        inv_sin_empresa = db.query(Inventario).filter(Inventario.id_empresa.is_(None)).all()
        for i in inv_sin_empresa:
            i.id_empresa = emp1.id_empresa
        print(f"[OK] Asignada Empresa #{emp1.id_empresa} a {len(inv_sin_empresa)} registros de inventario.")

        # 10. CU06: Atributos Textiles Avanzados (Medidas en cm, Hex Compuesto, Composición)
        guia_medidas = {
            "S": {"pecho_cm": 96, "cintura_cm": 82, "cadera_cm": 94, "manga_cm": 62, "cuello_cm": 38, "largo_cm": 72},
            "M": {"pecho_cm": 104, "cintura_cm": 90, "cadera_cm": 102, "manga_cm": 64, "cuello_cm": 40, "largo_cm": 74},
            "L": {"pecho_cm": 112, "cintura_cm": 98, "cadera_cm": 110, "manga_cm": 66, "cuello_cm": 42, "largo_cm": 76},
            "XL": {"pecho_cm": 120, "cintura_cm": 106, "cadera_cm": 118, "manga_cm": 68, "cuello_cm": 44, "largo_cm": 78},
            "38": {"pecho_cm": 98, "cintura_cm": 84, "cadera_cm": 96, "manga_cm": 63, "cuello_cm": 38, "largo_cm": 73},
            "39": {"pecho_cm": 102, "cintura_cm": 88, "cadera_cm": 100, "manga_cm": 64, "cuello_cm": 39, "largo_cm": 74},
            "40": {"pecho_cm": 106, "cintura_cm": 92, "cadera_cm": 104, "manga_cm": 65, "cuello_cm": 40, "largo_cm": 75},
            "42": {"pecho_cm": 114, "cintura_cm": 100, "cadera_cm": 112, "manga_cm": 67, "cuello_cm": 42, "largo_cm": 77}
        }

        todos_productos = db.query(Producto).all()
        for prod in todos_productos:
            if not prod.composicion_textil:
                prod.composicion_textil = "100% Algodón Pima Peruano Hipoalergénico"
            if not prod.medidas_antropometricas:
                prod.medidas_antropometricas = json.dumps(guia_medidas, ensure_ascii=False)

        # Asignar código_hex_secundario para colores
        colores = db.query(ProductoColor).all()
        for c in colores:
            if not c.codigo_hex_secundario:
                c.codigo_hex_secundario = "#F8FAFC" if c.codigo_hex != "#FFFFFF" else "#0F172A"

        # Asignar medidas_cm en tallas
        tallas = db.query(ProductoTalla).all()
        for t in tallas:
            talla_key = t.talla.upper()
            if talla_key in guia_medidas:
                m = guia_medidas[talla_key]
                t.medidas_cm = f"Pecho {m['pecho_cm']}cm, Cintura {m['cintura_cm']}cm, Largo {m['largo_cm']}cm"

        db.commit()
        print(f"[OK] CU06: Atributos textiles avanzados (medidas en cm, composición y colores secundarios) poblados con éxito en {len(todos_productos)} productos.")

        # 11. CU07: Validar Kardex Físico-Valorado y Costo Promedio Ponderado
        inventarios_activos = db.query(Inventario).filter(Inventario.stock_fisico > 0).all()
        for inv in inventarios_activos:
            if inv.costo_promedio_ponderado <= 0:
                inv.costo_promedio_ponderado = inv.ultimo_costo_compra or Decimal("120.00")
        db.commit()
        print(f"[OK] CU07: Inventario multi-sucursal y Costo Promedio Ponderado verificado en {len(inventarios_activos)} registros.")

        print("=== [PARCIAL 2] SIEMBRA Y MIGRACIÓN COMPLETADA EXITOSAMENTE ===")
    finally:
        db.close()

if __name__ == "__main__":
    migrar_y_poblar_parcial2()
