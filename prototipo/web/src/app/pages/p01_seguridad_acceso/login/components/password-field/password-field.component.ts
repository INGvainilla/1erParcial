import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { evaluatePassword, PasswordEvaluation } from '../../auth-validators';

@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="password-field-group">
      <div class="field-header">
        <label [attr.for]="id" class="field-label">
          <i [class]="icon" aria-hidden="true"></i>
          <span>{{ label }}</span>
        </label>

        <!-- Indicador de Bloq Mayús -->
        <span *ngIf="capsLockOn" class="caps-lock-badge" role="status">
          <i class="fas fa-arrow-up-from-bracket"></i> Bloq Mayús activado
        </span>
      </div>

      <div
        class="input-wrapper"
        [class.is-invalid]="isInvalid"
        [class.is-valid]="isValid"
      >
        <i [class]="icon + ' input-leading-icon'" aria-hidden="true"></i>

        <input
          [id]="id"
          [type]="showPassword ? 'text' : 'password'"
          [formControl]="formControl"
          [placeholder]="placeholder"
          [autocomplete]="autocomplete"
          [attr.aria-invalid]="isInvalid"
          [attr.aria-describedby]="isInvalid ? id + '-error' : null"
          class="field-input"
          (blur)="handleBlur()"
          (focus)="handleFocus()"
          (keydown)="checkCapsLock($event)"
          (keyup)="checkCapsLock($event)"
        />

        <!-- Botón Mostrar/Ocultar Contraseña -->
        <button
          type="button"
          class="toggle-pwd-btn"
          (click)="toggleShowPassword()"
          [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
          [attr.aria-pressed]="showPassword"
          tabindex="-1"
        >
          <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </button>
      </div>

      <!-- Mensaje de Error en Línea -->
      <div
        [id]="id + '-error'"
        class="field-error-container"
        [class.visible]="isInvalid"
        role="alert"
        aria-live="polite"
      >
        <span *ngIf="isInvalid" class="field-error-msg">
          <i class="fas fa-circle-exclamation"></i> {{ errorMessage }}
        </span>
      </div>

      <!-- Mensaje de Coincidencia (solo para campo Confirmar) -->
      <div *ngIf="isConfirmField && control?.value && !isInvalid" class="field-match-container">
        <span class="field-match-msg">
          <i class="fas fa-circle-check"></i> Las contraseñas coinciden
        </span>
      </div>

      <!-- Checklist de Seguridad en Vivo y Medidor de Fortaleza -->
      <div
        *ngIf="showChecklist"
        class="checklist-container"
        [class.expanded]="isFocused || !!control?.value"
      >
        <!-- Medidor de Fortaleza (4 segmentos) -->
        <div class="meter-wrapper">
          <div class="meter-header">
            <span class="meter-title">Fortaleza de contraseña:</span>
            <span class="meter-badge" [ngClass]="evaluation.strengthClass">
              {{ evaluation.strengthLabel }}
            </span>
          </div>

          <div class="strength-bars" [attr.aria-label]="'Fortaleza: ' + evaluation.strengthLabel">
            <div
              class="bar-segment"
              [class.active]="evaluation.score >= 1"
              [ngClass]="evaluation.strengthClass"
            ></div>
            <div
              class="bar-segment"
              [class.active]="evaluation.score >= 3"
              [ngClass]="evaluation.strengthClass"
            ></div>
            <div
              class="bar-segment"
              [class.active]="evaluation.score >= 5"
              [ngClass]="evaluation.strengthClass"
            ></div>
            <div
              class="bar-segment"
              [class.active]="evaluation.score >= 6"
              [ngClass]="evaluation.strengthClass"
            ></div>
          </div>
        </div>

        <!-- Lista de Reglas con Checkmarks -->
        <ul class="rules-list">
          <li
            *ngFor="let rule of evaluation.rules"
            class="rule-item"
            [class.passed]="rule.passed"
          >
            <i
              [class]="rule.passed ? 'fas fa-check-circle rule-icon pass' : 'far fa-circle rule-icon pending'"
              aria-hidden="true"
            ></i>
            <span class="rule-label">{{ rule.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .password-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      position: relative;
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary, #94a3b8);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .field-label i {
      font-size: 0.82rem;
      color: var(--text-muted, #64748b);
    }

    .caps-lock-badge {
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: var(--radius-sm, 6px);
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fde68a;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      animation: fadeIn 0.15s ease-out;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-md, 10px);
      transition: all var(--transition-smooth, 0.25s ease);
      height: 48px;
    }

    .input-wrapper:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(15, 23, 42, 0.85);
    }

    .input-wrapper:focus-within {
      border-color: var(--accent-primary, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
      background: rgba(15, 23, 42, 0.95);
    }

    .input-leading-icon {
      position: absolute;
      left: 14px;
      color: var(--text-muted, #64748b);
      font-size: 0.9rem;
      pointer-events: none;
      transition: color var(--transition-fast, 0.15s ease);
    }

    .input-wrapper:focus-within .input-leading-icon {
      color: var(--accent-primary, #6366f1);
    }

    .field-input {
      width: 100%;
      height: 100%;
      padding: 0 44px 0 40px;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary, #f8fafc);
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.95rem;
    }

    .field-input::placeholder {
      color: var(--text-muted, #64748b);
      font-size: 0.9rem;
    }

    .toggle-pwd-btn {
      position: absolute;
      right: 8px;
      height: 34px;
      width: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--text-muted, #64748b);
      cursor: pointer;
      transition: all var(--transition-fast, 0.15s ease);
    }

    .toggle-pwd-btn:hover {
      color: var(--text-primary, #f8fafc);
      background: rgba(255, 255, 255, 0.08);
    }

    /* Estados de Validación */
    .input-wrapper.is-invalid {
      border-color: var(--color-danger, #ef4444);
      background: rgba(239, 68, 68, 0.05);
    }

    .input-wrapper.is-invalid:focus-within {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
    }

    .input-wrapper.is-invalid .input-leading-icon {
      color: var(--color-danger, #ef4444);
    }

    .input-wrapper.is-valid {
      border-color: rgba(16, 185, 129, 0.5);
    }

    .field-error-container {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
    }

    .field-error-container.visible {
      max-height: 48px;
      opacity: 1;
      margin-top: 2px;
    }

    .field-error-msg {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #fca5a5;
      font-size: 0.78rem;
      font-weight: 500;
    }

    .field-match-container {
      margin-top: 2px;
      animation: fadeIn 0.2s ease-out;
    }

    .field-match-msg {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #6ee7b7;
      font-size: 0.78rem;
      font-weight: 500;
    }

    /* Checklist y Medidor */
    .checklist-container {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-md, 10px);
      padding: 0 14px;
      transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, padding 0.25s ease;
      margin-top: 4px;
    }

    .checklist-container.expanded {
      max-height: 380px;
      opacity: 1;
      padding: 14px;
    }

    .meter-wrapper {
      margin-bottom: 12px;
    }

    .meter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .meter-title {
      font-size: 0.78rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 500;
    }

    .meter-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .meter-badge.weak {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.15);
    }

    .meter-badge.fair {
      color: #fde68a;
      background: rgba(245, 158, 11, 0.15);
    }

    .meter-badge.strong {
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.15);
    }

    .meter-badge.very-strong {
      color: #6ee7b7;
      background: rgba(16, 185, 129, 0.15);
    }

    .strength-bars {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      height: 6px;
    }

    .bar-segment {
      height: 100%;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.1);
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .bar-segment.active.weak {
      background: #ef4444;
    }

    .bar-segment.active.fair {
      background: #f59e0b;
    }

    .bar-segment.active.strong {
      background: #6366f1;
    }

    .bar-segment.active.very-strong {
      background: #10b981;
    }

    .rules-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .rule-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.76rem;
      color: var(--text-muted, #64748b);
      transition: color 0.15s ease;
    }

    .rule-item.passed {
      color: #cbd5e1;
    }

    .rule-icon.pending {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
    }

    .rule-icon.pass {
      font-size: 0.8rem;
      color: var(--color-success, #10b981);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-2px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .input-wrapper, .field-error-container, .checklist-container, .bar-segment {
        transition: none !important;
        animation: none !important;
      }
    }
  `]
})
export class PasswordFieldComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) label!: string;
  @Input() icon = 'fas fa-lock';
  @Input() placeholder = '••••••••';
  @Input() autocomplete = 'current-password';
  @Input() disabled = false;
  @Input() control?: AbstractControl | null;
  @Input() showChecklist = false;
  @Input() isConfirmField = false;
  @Input() userContext?: { email?: string; nombres?: string; apellidos?: string };

  @Output() blurEvent = new EventEmitter<void>();

  showPassword = false;
  capsLockOn = false;
  isFocused = false;

  private cdr = inject(ChangeDetectorRef);
  private fallbackControl = new FormControl('');
  private sub?: Subscription;

  get formControl(): FormControl {
    return (this.control as FormControl) || this.fallbackControl;
  }

  evaluation: PasswordEvaluation = evaluatePassword('', undefined);

  ngOnInit(): void {
    if (this.control) {
      this.sub = this.control.valueChanges.subscribe(() => {
        this.updateEvaluation();
        this.cdr.markForCheck();
      });
      this.updateEvaluation();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userContext'] || changes['control']) {
      this.updateEvaluation();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isInvalid(): boolean {
    return !!(this.control && this.control.invalid && (this.control.touched || this.control.dirty));
  }

  get isValid(): boolean {
    return !!(this.control && this.control.valid && (this.control.touched || this.control.dirty) && this.control.value);
  }

  get errorMessage(): string {
    if (!this.control || !this.control.errors) return '';
    const errors = this.control.errors;

    if (errors['required']) return 'La contraseña es obligatoria';
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    if (errors['minlength']) return 'La contraseña debe tener al menos 8 caracteres';
    if (errors['securePassword']) return 'Cumple con todas las reglas de seguridad';

    return 'Contraseña no válida';
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  checkCapsLock(event: KeyboardEvent): void {
    if (event.getModifierState) {
      this.capsLockOn = event.getModifierState('CapsLock');
      this.cdr.markForCheck();
    }
  }

  handleFocus(): void {
    this.isFocused = true;
    this.updateEvaluation();
    this.cdr.markForCheck();
  }

  handleBlur(): void {
    this.isFocused = false;
    this.capsLockOn = false;
    if (this.control) {
      this.control.markAsTouched();
    }
    this.cdr.markForCheck();
    this.blurEvent.emit();
  }

  private updateEvaluation(): void {
    const pwd = this.control?.value || '';
    this.evaluation = evaluatePassword(pwd, this.userContext);
  }
}
