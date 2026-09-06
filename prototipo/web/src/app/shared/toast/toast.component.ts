import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let t of toastService.toasts()"
        class="toast-item"
        [ngClass]="'toast-' + t.tipo"
      >
        <div class="toast-icon">
          <i class="fas fa-check-circle" *ngIf="t.tipo === 'success'"></i>
          <i class="fas fa-exclamation-circle" *ngIf="t.tipo === 'error'"></i>
          <i class="fas fa-exclamation-triangle" *ngIf="t.tipo === 'warning'"></i>
          <i class="fas fa-info-circle" *ngIf="t.tipo === 'info'"></i>
        </div>
        <div class="toast-content">
          <span class="toast-title">{{ t.titulo }}</span>
          <span class="toast-desc">{{ t.mensaje }}</span>
        </div>
        <button class="toast-close" (click)="toastService.remove(t.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 9999;
      pointer-events: none;
      max-width: 420px;
      width: calc(100% - 3rem);
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(12px);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-icon {
      font-size: 1.2rem;
      margin-top: 0.1rem;
    }
    .toast-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
    }
    .toast-title {
      font-weight: 700;
      font-size: 0.9rem;
      color: #ffffff;
    }
    .toast-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.35;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
    }
    .toast-close:hover {
      color: #ffffff;
    }
    .toast-success { border-color: rgba(16, 185, 129, 0.5); }
    .toast-success .toast-icon { color: #10b981; }
    .toast-error { border-color: rgba(239, 68, 68, 0.5); }
    .toast-error .toast-icon { color: #ef4444; }
    .toast-warning { border-color: rgba(245, 158, 11, 0.5); }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info { border-color: rgba(14, 165, 233, 0.5); }
    .toast-info .toast-icon { color: #0ea5e9; }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
