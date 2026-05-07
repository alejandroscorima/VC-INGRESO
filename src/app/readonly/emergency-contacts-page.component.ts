import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

interface EmergencyContact {
  label: string;
  phone: string;
  detail?: string;
}

@Component({
  selector: 'app-emergency-contacts-page',
  templateUrl: './emergency-contacts-page.component.html',
  styleUrls: ['./emergency-contacts-page.component.css']
})
export class EmergencyContactsPageComponent {
  contacts: EmergencyContact[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    // No fallback: si el backend no trae emergencias, la pantalla queda vacía.
    this.api.get<{ emergency_contacts: EmergencyContact[] }>('api/v1/readonly/content').subscribe({
      next: (res) => {
        const contacts = res?.data?.emergency_contacts;
        this.contacts = Array.isArray(contacts) ? contacts : [];
      },
      error: () => {
        this.contacts = [];
      }
    });
  }

  telHref(phone: string): string {
    const digits = String(phone ?? '').replace(/\s+/g, '').trim();
    if (!digits) {
      return '';
    }
    return `tel:${digits}`;
  }

  hasDialablePhone(phone: string): boolean {
    return this.telHref(phone).length > 0;
  }
}
