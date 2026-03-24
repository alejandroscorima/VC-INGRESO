import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appModalUppercase]'
})
export class ModalUppercaseDirective {

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    if ((event as any).__uppercasedByDirective) {
      return;
    }
    this.transformEventTarget(event.target, 'input');
  }

  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    if ((event as any).__uppercasedByDirective) {
      return;
    }
    this.transformEventTarget(event.target, 'change');
  }

  private transformEventTarget(target: EventTarget | null, retriggerType: 'input' | 'change'): void {
    const isInput = target instanceof HTMLInputElement;
    const isTextArea = target instanceof HTMLTextAreaElement;

    if (!isInput && !isTextArea) {
      return;
    }

    if (isInput) {
      const inputType = (target.type || '').toLowerCase();
      const excludedTypes = new Set([
        'email',
        'password',
        'number',
        'date',
        'datetime-local',
        'time',
        'month',
        'week',
        'checkbox',
        'radio',
        'file'
      ]);
      if (excludedTypes.has(inputType)) {
        return;
      }
      if (target.readOnly || target.disabled) {
        return;
      }
    }

    if (isTextArea && target.disabled) {
      return;
    }

    const currentValue = (target as HTMLInputElement | HTMLTextAreaElement).value ?? '';
    if (!currentValue) {
      return;
    }

    const upperValue = currentValue.toUpperCase();
    if (upperValue === currentValue) {
      return;
    }

    (target as HTMLInputElement | HTMLTextAreaElement).value = upperValue;

    const syncEvent = new Event(retriggerType, { bubbles: true });
    (syncEvent as any).__uppercasedByDirective = true;
    target.dispatchEvent(syncEvent);
  }
}
