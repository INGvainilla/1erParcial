import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EncargadoService, ReservaEncargado } from '../../shared/services/encargado.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-escaner-qr',
  template: `
    <div class="scanner-container">
      <!-- Header -->
      <div class="scanner-header">
        <div class="header-left">
          <a routerLink="/encargado/reservas" class="btn-back">
            <i class="fas fa-arrow-left"></i>
          </a>
          <div>
            <h1 class="page-title">
              <i class="fas fa-qrcode"></i>
              Escáner de Reservas QR
            </h1>
            <p class="page-subtitle">CU12 — Escanee el QR del cliente para atender su reserva</p>
          </div>
        </div>
      </div>

      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button class="mode-tab" [class.active]="mode === 'camera'" (click)="mode = 'camera'">
          <i class="fas fa-camera"></i> Cámara Web
        </button>
        <button class="mode-tab" [class.active]="mode === 'manual'" (click)="mode = 'manual'">
          <i class="fas fa-keyboard"></i> Ingreso Manual
        </button>
      </div>

      <!-- Camera Mode -->
      <div class="scanner-body" *ngIf="mode === 'camera'">
        <div class="camera-container" *ngIf="!cameraError">
          <video #videoElement autoplay playsinline class="camera-feed"></video>
          <div class="scan-overlay">
            <div class="scan-frame">
              <div class="scan-corner tl"></div>
              <div class="scan-corner tr"></div>
              <div class="scan-corner bl"></div>
              <div class="scan-corner br"></div>
              <div class="scan-line"></div>
            </div>
            <p class="scan-instruction">Apunte la cámara al código QR del cliente</p>
          </div>
        </div>
        <div class="camera-error" *ngIf="cameraError">
          <div class="error-icon">
            <i class="fas fa-video-slash"></i>
          </div>
          <h3>Cámara no disponible</h3>
          <p>{{ cameraError }}</p>
          <button class="btn-manual-fallback" (click)="mode = 'manual'">
            <i class="fas fa-keyboard"></i> Usar ingreso manual
          </button>
        </div>
      </div>

      <!-- Manual Mode -->
      <div class="manual-body" *ngIf="mode === 'manual'">
        <div class="manual-card">
          <div class="manual-icon">
            <i class="fas fa-qrcode"></i>
          </div>
          <h3>Ingreso Manual del Código QR</h3>
          <p>Escriba o pegue el código de texto que aparece debajo del QR del cliente.</p>
          <div class="input-group">
            <input 
              type="text" 
              [(ngModel)]="codigoManual"
              placeholder="Ej: RES-a1b2c3d4-e5f6-7890..."
              class="qr-input"
              (keydown.enter)="procesarCodigoManual()"
              [disabled]="isProcessing"
            />
            <button class="btn-submit" (click)="procesarCodigoManual()" [disabled]="!codigoManual || isProcessing">
              <i class="fas fa-search" *ngIf="!isProcessing"></i>
              <i class="fas fa-spinner fa-spin" *ngIf="isProcessing"></i>
              {{ isProcessing ? 'Procesando...' : 'Validar QR' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Result Card -->
      <div class="result-section" *ngIf="lastResult">
        <div class="result-card" [class.result-success]="lastResult.type === 'success'" [class.result-error]="lastResult.type === 'error'">
          <div class="result-icon">
            <i [class]="lastResult.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          </div>
          <div class="result-content">
            <h3>{{ lastResult.title }}</h3>
            <p>{{ lastResult.message }}</p>
            
            <!-- Detalles de la reserva atendida -->
            <div class="result-details" *ngIf="lastResult.reserva">
              <div class="detail-row">
                <span class="detail-label">Reserva</span>
                <span class="detail-value">#{{ lastResult.reserva.id_reserva }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cliente</span>
                <span class="detail-value">{{ lastResult.reserva.nombre_cliente || 'Cliente #' + lastResult.reserva.id_usuario }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado</span>
                <span class="detail-value badge-atendida-result">{{ lastResult.reserva.estado }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Productos</span>
                <span class="detail-value">{{ lastResult.reserva.detalles.length }} artículo(s)</span>
              </div>
            </div>
          </div>
          <button class="btn-dismiss" (click)="lastResult = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scanner-container {
      padding: 1.5rem 2rem;
      max-width: 900px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .scanner-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-back {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-secondary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-back:hover { background: rgba(255,255,255,0.12); color: #ffffff; }
    .page-title {
      font-size: 1.4rem; font-weight: 800; color: #ffffff;
      display: flex; align-items: center; gap: 0.5rem; margin: 0;
    }
    .page-title i { color: #a78bfa; }
    .page-subtitle { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem; }

    /* Mode Tabs */
    .mode-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      padding: 0.35rem;
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .mode-tab {
      flex: 1;
      padding: 0.65rem 1rem;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .mode-tab:hover { color: var(--text-secondary); }
    .mode-tab.active {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }

    /* Camera */
    .camera-container {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      background: #0a0a0a;
      aspect-ratio: 4/3;
      max-height: 480px;
    }
    .camera-feed {
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .scan-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
    }
    .scan-frame {
      width: 240px; height: 240px;
      position: relative;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 12px;
    }
    .scan-corner {
      position: absolute;
      width: 28px; height: 28px;
      border: 3px solid #818cf8;
    }
    .scan-corner.tl { top: -2px; left: -2px; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
    .scan-corner.tr { top: -2px; right: -2px; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
    .scan-corner.bl { bottom: -2px; left: -2px; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
    .scan-corner.br { bottom: -2px; right: -2px; border-left: none; border-top: none; border-radius: 0 0 8px 0; }
    .scan-line {
      position: absolute;
      left: 10%; right: 10%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #818cf8, transparent);
      animation: scanMove 2s ease-in-out infinite;
    }
    @keyframes scanMove {
      0%, 100% { top: 15%; }
      50% { top: 80%; }
    }
    .scan-instruction {
      margin-top: 1.5rem;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.7);
      text-align: center;
    }

    /* Camera Error */
    .camera-error {
      text-align: center;
      padding: 3rem 2rem;
      background: rgba(255,255,255,0.03);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .error-icon {
      width: 70px; height: 70px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      background: rgba(239,68,68,0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .error-icon i { font-size: 1.8rem; color: #f87171; }
    .camera-error h3 { font-size: 1.1rem; font-weight: 700; color: #ffffff; margin-bottom: 0.4rem; }
    .camera-error p { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    .btn-manual-fallback {
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* Manual Input */
    .manual-body {
      margin-bottom: 1.5rem;
    }
    .manual-card {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(255,255,255,0.03);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .manual-icon {
      width: 70px; height: 70px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      background: rgba(139,92,246,0.12);
      display: flex; align-items: center; justify-content: center;
    }
    .manual-icon i { font-size: 1.8rem; color: #a78bfa; }
    .manual-card h3 { font-size: 1.1rem; font-weight: 700; color: #ffffff; margin-bottom: 0.4rem; }
    .manual-card p { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    .input-group {
      display: flex;
      gap: 0.5rem;
      max-width: 560px;
      margin: 0 auto;
    }
    .qr-input {
      flex: 1;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: #ffffff;
      font-size: 0.85rem;
      font-family: 'JetBrains Mono', monospace;
      outline: none;
      transition: all 0.2s;
    }
    .qr-input:focus {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
    }
    .qr-input::placeholder { color: var(--text-muted); }
    .btn-submit {
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(34,197,94,0.25);
      white-space: nowrap;
    }
    .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(34,197,94,0.35); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Result */
    .result-section {
      margin-top: 1.5rem;
    }
    .result-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-radius: 14px;
      position: relative;
      animation: slideUp 0.4s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .result-success {
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.25);
    }
    .result-error {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.25);
    }
    .result-icon {
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .result-success .result-icon { background: rgba(34,197,94,0.15); color: #22c55e; }
    .result-error .result-icon { background: rgba(239,68,68,0.15); color: #ef4444; }
    .result-content { flex: 1; }
    .result-content h3 { font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
    .result-content p { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
    .result-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem 1rem;
      padding: 0.75rem;
      background: rgba(255,255,255,0.04);
      border-radius: 8px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .detail-label { font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }
    .detail-value { font-size: 0.82rem; font-weight: 600; color: #ffffff; }
    .badge-atendida-result {
      background: rgba(34,197,94,0.2);
      color: #22c55e;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .btn-dismiss {
      position: absolute;
      top: 0.75rem; right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.3rem;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .btn-dismiss:hover { color: #ffffff; }

    @media (max-width: 600px) {
      .scanner-container { padding: 1rem; }
      .input-group { flex-direction: column; }
      .result-details { grid-template-columns: 1fr; }
    }
  `]
})
export class EscanerQrComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  mode: 'camera' | 'manual' = 'manual';
  codigoManual = '';
  isProcessing = false;
  cameraError: string | null = null;
  lastResult: { type: 'success' | 'error'; title: string; message: string; reserva?: ReservaEncargado } | null = null;

  private mediaStream: MediaStream | null = null;

  private encargadoService = inject(EncargadoService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    // Default to manual mode since camera may not be available
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    try {
      this.cameraError = null;
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      // Wait for the view to be ready
      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
        }
      }, 100);
    } catch (err: any) {
      this.cameraError = 'No se pudo acceder a la cámara. Verifique los permisos del navegador o use el ingreso manual.';
      console.error('Camera error:', err);
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  procesarCodigoManual(): void {
    const codigo = this.codigoManual.trim();
    if (!codigo) return;

    this.isProcessing = true;
    this.lastResult = null;

    this.encargadoService.escanearQr(codigo).subscribe({
      next: (reserva) => {
        this.isProcessing = false;
        this.codigoManual = '';
        this.lastResult = {
          type: 'success',
          title: '¡Reserva Atendida Exitosamente!',
          message: `La reserva #${reserva.id_reserva} ha sido marcada como ATENDIDA. El cliente puede recoger sus prendas.`,
          reserva
        };
        this.toast.success('¡Éxito!', `Reserva #${reserva.id_reserva} atendida correctamente.`);
      },
      error: (err) => {
        this.isProcessing = false;
        const detail = err.error?.detail || 'Error al procesar el código QR.';
        this.lastResult = {
          type: 'error',
          title: 'No se pudo procesar el QR',
          message: detail
        };
        this.toast.error('Error', detail);
      }
    });
  }

  procesarCodigoEscaneado(codigo: string): void {
    this.codigoManual = codigo;
    this.procesarCodigoManual();
  }
}
