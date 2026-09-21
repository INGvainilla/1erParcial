# -*- coding: utf-8 -*-
"""
Cálculos Geodésicos y Tarifación de Despacho (CU18)
Implementación de la Fórmula de Haversine pura para cálculo de distancia en Km.
"""
import math
from decimal import Decimal

# Radio de la Tierra en kilómetros
RADIO_TIERRA_KM = 6371.0

# Tarifa base y adicional por kilómetro (en Bs.)
TARIFA_BASE_DELIVERY = 15.00  # Cubre hasta 3 km
KM_BASE_INCLUIDOS = 3.0
COSTO_KM_ADICIONAL = 2.50   # Por cada km extra

def calcular_distancia_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula la distancia geodésica entre dos puntos sobre la superficie terrestre (Lat/Lon)
    utilizando la Fórmula de Haversine.
    Retorna la distancia en kilómetros redondeada a 2 decimales.
    """
    # Convertir coordenadas de grados sexagesimales a radianes
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Fórmula del semiverseno
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    
    # Ángulo central en radianes (evitar posibles imprecisiones de float > 1.0)
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distancia = RADIO_TIERRA_KM * c
    return round(distancia, 2)


def calcular_tarifa_delivery(distancia_km: float) -> float:
    """
    Calcula el costo del despacho en función de la distancia geodésica.
    - Hasta 3 km: Tarifa base Bs. 15.00
    - A partir de 3 km: Bs. 15.00 + Bs. 2.50 por cada km adicional.
    """
    if distancia_km <= KM_BASE_INCLUIDOS:
        return TARIFA_BASE_DELIVERY
    
    km_extra = distancia_km - KM_BASE_INCLUIDOS
    total = TARIFA_BASE_DELIVERY + (km_extra * COSTO_KM_ADICIONAL)
    return round(total, 2)
