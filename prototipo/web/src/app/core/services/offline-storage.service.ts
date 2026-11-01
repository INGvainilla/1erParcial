import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from './auth.service';

export interface OperacionOffline {
  uuid_operacion: string;
  tipo_operacion: string;
  id_sucursal: number;
  payload: any;
  fecha_local: string;
  sincronizado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private dbName = 'FashionStoreOfflineDB';
  private dbVersion = 1;
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: any) => {
        const db: IDBDatabase = event.target.result;
        if (!db.objectStoreNames.contains('catalogo')) {
          db.createObjectStore('catalogo', { keyPath: 'id_producto' });
        }
        if (!db.objectStoreNames.contains('operaciones')) {
          db.createObjectStore('operaciones', { keyPath: 'uuid_operacion' });
        }
      };

      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async guardarCatalogo(prendas: any[]): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('catalogo', 'readwrite');
      const store = tx.objectStore('catalogo');
      store.clear();
      for (const p of prendas) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async obtenerCatalogoLocal(): Promise<any[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('catalogo', 'readonly');
      const store = tx.objectStore('catalogo');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async encolarOperacionOffline(tipo: string, payload: any, idSucursal: number): Promise<OperacionOffline> {
    const db = await this.dbPromise;
    const op: OperacionOffline = {
      uuid_operacion: this.generateUUID(),
      tipo_operacion: tipo,
      id_sucursal: idSucursal,
      payload,
      fecha_local: new Date().toISOString(),
      sincronizado: false
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('operaciones', 'readwrite');
      const store = tx.objectStore('operaciones');
      store.put(op);
      tx.oncomplete = () => resolve(op);
      tx.onerror = () => reject(tx.error);
    });
  }

  async obtenerOperacionesLocales(): Promise<OperacionOffline[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('operaciones', 'readonly');
      const store = tx.objectStore('operaciones');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async marcarOperacionSincronizada(uuid: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('operaciones', 'readwrite');
      const store = tx.objectStore('operaciones');
      const req = store.get(uuid);
      req.onsuccess = () => {
        const item = req.result;
        if (item) {
          item.sincronizado = true;
          store.put(item);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async sincronizarPendientes(): Promise<{ exitosas: number; fallidas: number; total: number }> {
    const operaciones = await this.obtenerOperacionesLocales();
    const pendientes = operaciones.filter(o => !o.sincronizado);
    let exitosas = 0;
    let fallidas = 0;

    for (const op of pendientes) {
      try {
        await firstValueFrom(
          this.http.post(`${API_BASE_URL}/sync/operacion`, {
            uuid_operacion: op.uuid_operacion,
            tipo_operacion: op.tipo_operacion,
            id_sucursal: op.id_sucursal,
            payload: op.payload,
            fecha_local: op.fecha_local
          }, {
            headers: {
              ...this.auth.getAuthHeaders(),
              'X-Idempotency-Key': op.uuid_operacion
            }
          })
        );
        await this.marcarOperacionSincronizada(op.uuid_operacion);
        exitosas++;
      } catch (err) {
        fallidas++;
      }
    }

    return { exitosas, fallidas, total: pendientes.length };
  }

  descargarCatalogoRemoto(idSucursal?: number): Observable<any> {
    const query = idSucursal ? `?id_sucursal=${idSucursal}` : '';
    return this.http.get<any>(`${API_BASE_URL}/sync/catalogo-offline${query}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}

