import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-field-group">
      <label [attr.for]="id" class="field-label">
        <i *ngIf="icon" [class]="icon" aria-hidden="true"></i>
        <span>{{ label }}</span>
      </label>

      <div class="input-wrapper" [class.is-invalid]="isInvalid" [class.is-valid]="isValid">
        <i *ngIf="icon" [class]="icon + ' input-leading-icon'" aria-hidden="true"></i>

        <input
          [id]="id"
          [type]="type"
          [formControl]="formControl"
          [placeholder]="placeholder"
          [autocomplete]="autocomplete"
          [attr.maxlength]="maxlength || null"
          [attr.aria-invalid]="isInvalid"
          [attr.aria-describedby]="isInvalid ? id + '-error' : null"
          class="field-input"
          (blur)="handleBlur()"
          (focus)="onFocus.emit()"
        />

        <span *ngIf="isValid && showValidCheck" class="input-trailing-icon valid-check" title="Válido">
          <i class="fas fa-check"></i>
        </span>
      </div>

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
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .form-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      position: relative;
    }

    .field-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary, #94a3b8);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color var(--transition-fast, 0.15s ease);
    }

    .field-label i {
      font-size: 0.82rem;
      color: var(--text-muted, #64748b);
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
      padding: 0 14px 0 40px;
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

    .field-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Estados de validación */
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

    .input-trailing-icon.valid-check {
      position: absolute;
      right: 14px;
      color: var(--color-success, #10b981);
      font-size: 0.85rem;
      animation: checkFade 0.2s ease-out;
    }

    /* Animación de error suave */
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

    @keyframes checkFade {
      from { opacity: 0; transform: scale(0.6); }
      to { opacity: 1; transform: scale(1); }
    }

    @media (prefers-reduced-motion: reduce) {
      .input-wrapper, .field-error-container, .input-trailing-icon.valid-check {
        transition: none !important;
        animation: none !important;
      }
    }
  `]
})
export class FormInputComponent implements OnInit, OnDestroy {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) label!: string;
  @Input() type = 'text';
  @Input() icon = '';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';
  @Input() maxlength?: number;
  @Input() disabled = false;
  @Input() control?: AbstractControl | null;
  @Input() customErrorMessage?: string;
  @Input() showValidCheck = true;

  @Output() blurEvent = new EventEmitter<void>();
  @Output() onFocus = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);
  private fallbackControl = new FormControl('');
  private sub?: Subscription;

  get formControl(): FormControl {
    return (this.control as FormControl) || this.fallbackControl;
  }

  ngOnInit(): void {
    if (this.control) {
      this.sub = this.control.valueChanges.subscribe(() => {
        this.cdr.markForCheck();
      });
      if (this.disabled) {
        this.control.disable({ emitEvent: false });
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isInvalid(): boolean {
    if (this.customErrorMessage) return true;
    return !!(this.control && this.control.invalid && (this.control.touched || this.control.dirty));
  }

  get isValid(): boolean {
    if (this.customErrorMessage) return false;
    return !!(this.control && this.control.valid && (this.control.touched || this.control.dirty) && this.control.value);
  }

  get errorMessage(): string {
    if (this.customErrorMessage) return this.customErrorMessage;
    if (!this.control || !this.control.errors) return '';

    const errors = this.control.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['emailInvalid'] || errors['email']) return errors['emailInvalid'] || 'Correo electrónico no válido';
    if (errors['emailLength']) return errors['emailLength'];
    if (errors['namePattern']) return errors['namePattern'];
    if (errors['nameLength']) return errors['nameLength'];
    if (errors['otpInvalid']) return errors['otpInvalid'];
    if (errors['serverError']) return errors['serverError'];

    return 'Valor ingresado no válido';
  }

  handleBlur(): void {
    if (this.control) {
      this.control.markAsTouched();
    }
    this.cdr.markForCheck();
    this.blurEvent.emit();
  }
}
