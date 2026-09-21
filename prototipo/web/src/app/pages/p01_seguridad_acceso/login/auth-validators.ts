import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordRuleStatus {
  id: string;
  label: string;
  passed: boolean;
}

export interface PasswordEvaluation {
  rules: PasswordRuleStatus[];
  score: number; // 0 to 6
  strengthLabel: 'Débil' | 'Aceptable' | 'Fuerte' | 'Muy fuerte';
  strengthClass: 'weak' | 'fair' | 'strong' | 'very-strong';
  allPassed: boolean;
}

const COMMON_PASSWORDS = [
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password123',
  'contraseña',
  'contrasena',
  'qwerty123',
  'admin123',
  'abc12345',
  'fashion123',
  'store123',
  'password1',
  '11111111',
  '00000000',
  'iloveyou',
  'secret123'
];

/**
 * Normaliza texto para comparaciones seguras (sin mayúsculas, sin tildes)
 */
export function normalizeText(val: string): string {
  if (!val) return '';
  return val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Capitaliza palabras recortando espacios redundantes
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Validador para nombres y apellidos:
 * 2-50 caracteres, solo letras (incluye acentos, ñ, ü), espacios, apóstrofo y guion.
 */
export function nameValidator(): ValidatorFn {
  const regex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'’-]*$/;
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const val = control.value.trim();
    if (val.length < 2 || val.length > 50) {
      return { nameLength: 'Debe tener entre 2 y 50 caracteres' };
    }
    if (!regex.test(val)) {
      return { namePattern: 'Solo se admiten letras, tildes, espacios, apóstrofos y guiones' };
    }
    return null;
  };
}

/**
 * Validador estricto para formato de correo y longitud máxima
 */
export function emailValidator(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const val = control.value.trim();
    if (val.length > 100) {
      return { emailLength: 'Máximo 100 caracteres permitidos' };
    }
    if (!emailRegex.test(val)) {
      return { emailInvalid: 'Formato de correo electrónico no válido' };
    }
    return null;
  };
}

/**
 * Validador de código OTP de 6 dígitos numéricos
 */
export function otpValidator(): ValidatorFn {
  const regex = /^\d{6}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const val = control.value.trim();
    if (!regex.test(val)) {
      return { otpInvalid: 'El código debe contener exactamente 6 dígitos numéricos' };
    }
    return null;
  };
}

/**
 * Evalúa las 8 reglas de complejidad de contraseña y calcula el medidor de fortaleza
 */
export function evaluatePassword(password: string, userContext?: { email?: string; nombres?: string; apellidos?: string }): PasswordEvaluation {
  const pwd = password || '';

  // 1. Longitud entre 8 y 64
  const hasValidLength = pwd.length >= 8 && pwd.length <= 64;

  // 2. Al menos una mayúscula
  const hasUpper = /[A-ZÁÉÍÓÚÜÑ]/.test(pwd);

  // 3. Al menos una minúscula
  const hasLower = /[a-záéíóúüñ]/.test(pwd);

  // 4. Al menos un número
  const hasNumber = /\d/.test(pwd);

  // 5. Al menos un carácter especial (! @ # $ % ^ & * _ - + = . , ?)
  const hasSpecial = /[!@#$%^&*_\-+=\.,?]/.test(pwd);

  // 6. Sin espacios
  const hasNoSpaces = pwd.length > 0 && !/\s/.test(pwd);

  // 7. No contiene correo ni nombres/apellidos
  let containsUserData = false;
  if (pwd.length > 0 && userContext) {
    const normPwd = normalizeText(pwd);

    if (userContext.email) {
      const emailPrefix = normalizeText(userContext.email.split('@')[0] || '');
      if (emailPrefix.length >= 3 && normPwd.includes(emailPrefix)) {
        containsUserData = true;
      }
    }

    const checkWords = (field?: string) => {
      if (!field) return;
      const words = normalizeText(field).split(/[\s'’-]+/);
      for (const w of words) {
        if (w.length >= 3 && normPwd.includes(w)) {
          containsUserData = true;
          break;
        }
      }
    };

    if (!containsUserData) checkWords(userContext.nombres);
    if (!containsUserData) checkWords(userContext.apellidos);
  }
  const noUserDataPassed = pwd.length > 0 && !containsUserData;

  // 8. No es una contraseña común
  const isCommon = COMMON_PASSWORDS.includes(normalizeText(pwd));
  const notCommonPassed = pwd.length > 0 && !isCommon;

  const rules: PasswordRuleStatus[] = [
    { id: 'length', label: 'Entre 8 y 64 caracteres', passed: hasValidLength },
    { id: 'upper', label: 'Al menos una mayúscula', passed: hasUpper },
    { id: 'lower', label: 'Al menos una minúscula', passed: hasLower },
    { id: 'number', label: 'Al menos un número', passed: hasNumber },
    { id: 'special', label: 'Al menos un carácter especial (!@#$%^&*_-+=.,?)', passed: hasSpecial },
    { id: 'no-spaces', label: 'Sin espacios en blanco', passed: hasNoSpaces },
    { id: 'no-user-data', label: 'No contiene tu correo ni nombres', passed: noUserDataPassed },
    { id: 'not-common', label: 'No es una contraseña común', passed: notCommonPassed }
  ];

  // Cálculo de puntaje (0 a 6):
  // 1 punto por cada regla de longitud (8+), mayúscula, minúscula, número y especial, +1 si tiene 12+ caracteres
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (hasUpper) score += 1;
  if (hasLower) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  if (pwd.length >= 12) score += 1;

  let strengthLabel: 'Débil' | 'Aceptable' | 'Fuerte' | 'Muy fuerte' = 'Débil';
  let strengthClass: 'weak' | 'fair' | 'strong' | 'very-strong' = 'weak';

  if (score <= 2) {
    strengthLabel = 'Débil';
    strengthClass = 'weak';
  } else if (score <= 4) {
    strengthLabel = 'Aceptable';
    strengthClass = 'fair';
  } else if (score === 5) {
    strengthLabel = 'Fuerte';
    strengthClass = 'strong';
  } else {
    strengthLabel = 'Muy fuerte';
    strengthClass = 'very-strong';
  }

  const allPassed = rules.every(r => r.passed);

  return {
    rules,
    score,
    strengthLabel,
    strengthClass,
    allPassed
  };
}

/**
 * Validador para formulario Reactivo que verifica el cumplimiento de las 8 reglas
 */
export function securePasswordValidator(getContextFn?: () => { email?: string; nombres?: string; apellidos?: string }): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const context = getContextFn ? getContextFn() : undefined;
    const evaluation = evaluatePassword(control.value, context);
    if (!evaluation.allPassed) {
      return {
        securePassword: {
          valid: false,
          evaluation
        }
      };
    }
    return null;
  };
}

/**
 * Validador de coincidencia de contraseñas entre dos campos del mismo FormGroup
 */
export function passwordMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;

    const confirmControl = group.get(confirmKey);
    if (!confirmControl) return null;

    if (!confirm) {
      // Si está vacío, solo el required se encarga o no hay match todavía
      return null;
    }

    if (password !== confirm) {
      const currentErrors = confirmControl.errors || {};
      confirmControl.setErrors({ ...currentErrors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmControl.errors) {
        const { passwordMismatch, ...remainingErrors } = confirmControl.errors;
        confirmControl.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
      }
      return null;
    }
  };
}
