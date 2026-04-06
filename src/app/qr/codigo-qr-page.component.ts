import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { initFlowbite } from 'flowbite';
import * as QRCode from 'qrcode';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';
import { QrAccessService } from './qr-access.service';
import { QrScannerComponent } from './qr-scanner.component';

@Component({
  selector: 'app-codigo-qr-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, QrScannerComponent],
  template: `
    <div class="codigo-qr-page min-h-screen bg-gray-50 px-4 pb-8 pt-2 dark:bg-gray-900 sm:pt-3">
      <div class="mx-auto max-w-4xl">
        <ng-container *ngIf="auth.isStaff()">
          <app-qr-scanner />
        </ng-container>

        <div
          *ngIf="auth.canGenerateHouseAccessQr()"
          class="mt-4 rounded-xl border-2 border-dashed border-gray-200 bg-white p-4 shadow-lg dark:border-gray-600 dark:bg-gray-800 sm:mt-6 sm:p-6">
          <h2 class="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <mat-icon class="!h-6 !w-6 text-teal-600 dark:text-teal-400">qr_code_2</mat-icon>
            Mi código QR de ingreso
          </h2>
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Muéstrelo en garita o punto de acceso. Puede compartir el código generado desde
            <strong>Mi casa</strong> para familiares, visitas o vehículos.
          </p>
          <button
            type="button"
            (click)="openMyQr()"
            [disabled]="myQrLoading"
            class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/50 hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:shadow-teal-800/80 dark:focus:ring-teal-800">
            <mat-icon class="!h-5 !w-5">qr_code</mat-icon>
            {{ myQrLoading ? 'Generando…' : 'Mostrar mi QR' }}
          </button>
        </div>
      </div>

      <div
        *ngIf="showMyQrDialog"
        class="photo-view-overlay"
        (click)="closeMyQrDialog()">
        <div class="photo-view-modal neighbor-qr-modal" (click)="$event.stopPropagation()">
          <div class="photo-view-header">
            <h3>{{ myQrTitle }}</h3>
            <button
              type="button"
              (click)="closeMyQrDialog()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 px-2 mb-3">
            Válido unos 90 días. No lo publique en redes abiertas.
          </p>
          <img *ngIf="myQrDataUrl" [src]="myQrDataUrl" alt="QR de ingreso" class="photo-view-img mx-auto" />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .photo-view-overlay {
        position: fixed;
        inset: 0;
        z-index: 60;
        background: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .photo-view-modal {
        background: #fff;
        border-radius: 12px;
        max-width: 100%;
        width: 360px;
        padding: 1rem;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      }
      .dark .photo-view-modal {
        background: #1f2937;
        color: #f3f4f6;
      }
      .photo-view-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      .photo-view-header h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
      }
      .photo-view-img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
    `,
  ],
})
export class CodigoQrPageComponent {
  showMyQrDialog = false;
  myQrDataUrl: string | null = null;
  myQrLoading = false;
  myQrTitle = 'Mi QR de ingreso';

  constructor(
    public auth: AuthService,
    private qrAccess: QrAccessService,
    private toastr: ToastrService
  ) {}

  openMyQr(): void {
    const u = this.auth.getUser() as any;
    const pid = Number(u?.person_id ?? 0) || 0;
    if (pid <= 0) {
      this.toastr.error('No se encontró tu persona en sesión.');
      return;
    }
    this.myQrTitle = 'Mi QR de ingreso';
    this.generatePersonQrToModal(pid);
  }

  private generatePersonQrToModal(personId: number): void {
    this.myQrLoading = true;
    this.qrAccess.generatePersonQr(personId).subscribe({
      next: (res) => {
        QRCode.toDataURL(res.token, { width: 280, margin: 2, errorCorrectionLevel: 'M' })
          .then((url) => {
            this.myQrDataUrl = url;
            this.showMyQrDialog = true;
            this.myQrLoading = false;
            setTimeout(() => initFlowbite(), 0);
          })
          .catch(() => {
            this.myQrLoading = false;
            this.toastr.error('No se pudo generar la imagen del QR.');
          });
      },
      error: (e: Error) => {
        this.myQrLoading = false;
        this.toastr.error(e?.message || 'No se pudo generar el código.');
      },
    });
  }

  closeMyQrDialog(): void {
    this.showMyQrDialog = false;
    this.myQrDataUrl = null;
  }
}
