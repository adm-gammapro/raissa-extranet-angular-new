import {FormGroup} from '@angular/forms';

export class ValidationUtil {
  static isInvalid(form: FormGroup, ctrl: string, submitted = false): boolean {
    const c = form.get(ctrl);
    return !!c && c.invalid && (c.dirty || c.touched|| submitted);
  }

  static errors(
    form: FormGroup,
    ctrl: string,
    messages: Record<string, string>,
    submitted = false
  ): string[] {
    if (!this.isInvalid(form, ctrl, submitted)) return [];
    const c = form.get(ctrl);
    if (!c?.errors) return [];
    return Object.keys(c.errors).map(key => messages[key] ?? 'Campo inválido');
  }
}
