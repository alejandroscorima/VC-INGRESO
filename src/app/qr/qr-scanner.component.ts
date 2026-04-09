import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { BrowserCodeReader, BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { QrAccessService, AccessQrScanResult } from './qr-access.service';

/** Preferencia opcional: último punto elegido (sin bloqueo). */
const ACCESS_POINT_STORAGE_KEY = 'vc_scanner_access_point_id';
const COOLDOWN_MS = 3000;

interface AccessPointOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div>
      <!-- PNG de estado (allowed/denied/etc.): pantalla completa mientras dura el cooldown -->
      <div
        *ngIf="cooldownActive && statusImageUrl"
        class="fixed inset-0 z-[10050] flex flex-col items-center justify-center gap-4 bg-black/90 p-6 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-label="Resultado del escaneo">
        <img
          [src]="statusImageUrl"
          alt=""
          class="h-auto max-h-[min(34vh,220px)] w-auto max-w-[min(72vw,240px)] object-contain drop-shadow-xl sm:max-h-[min(38vh,260px)] sm:max-w-[min(70vw,280px)]" />
        <p class="text-center text-sm text-white/80">Podrá escanear de nuevo en unos segundos…</p>
      </div>

    <div class="w-full px-0 py-2 sm:py-3">
      <div
        class="overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
        <div class="border-b border-gray-200 px-4 py-4 text-center dark:border-gray-700">
          <h2 class="m-0 flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <mat-icon class="!h-7 !w-7 text-teal-600 dark:text-teal-400">qr_code_scanner</mat-icon>
            Escáner QR / documento / placa
          </h2>
        </div>
        <div class="p-4">
          <p
            *ngIf="scanEngineHint"
            class="mb-3 rounded-lg border border-indigo-100 bg-indigo-50 p-2 text-xs text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
            {{ scanEngineHint }}
          </p>

          <div class="mb-3" *ngIf="accessPoints.length">
            <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Punto de acceso</label>
            <select
              [(ngModel)]="selectedAccessPointId"
              (ngModelChange)="onAccessPointChange($event)"
              [disabled]="loadingPoints"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-teal-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500">
              <option [ngValue]="null">— Seleccione —</option>
              <option *ngFor="let p of accessPoints" [ngValue]="p.id">{{ p.name }}</option>
            </select>
          </div>
          <p *ngIf="!accessPoints.length && !loadingPoints" class="mb-3 text-sm text-amber-700 dark:text-amber-400">
            No hay puntos de acceso configurados.
          </p>

          <div
            class="scanner-viewport w-full md:mx-auto md:max-w-[340px] lg:max-w-[380px]"
            #scannerViewport
            [class.dimmed]="cooldownActive">
            <video #videoElement autoplay playsinline muted></video>
            <canvas #scanCanvas hidden></canvas>
            <div class="scan-frame" *ngIf="isScanning && !cooldownActive" aria-hidden="true"></div>
            <div class="scan-overlay" *ngIf="isScanning && !cooldownActive">
              <div class="scan-line"></div>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              *ngIf="!isScanning"
              (click)="startScanning()"
              [disabled]="cooldownActive || !selectedAccessPointId"
              class="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/50 hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-teal-800/80 dark:focus:ring-teal-800">
              <mat-icon class="!h-5 !w-5">play_arrow</mat-icon>
              Iniciar escáner
            </button>

            <button
              type="button"
              *ngIf="isScanning"
              (click)="stopScanning()"
              class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
              <mat-icon class="!h-5 !w-5">stop</mat-icon>
              Detener
            </button>

            <button
              type="button"
              *ngIf="isScanning && hasFlash && !cooldownActive"
              (click)="toggleFlash()"
              class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
              <mat-icon class="!h-5 !w-5">{{ hasFlashOn ? 'flash_off' : 'flash_on' }}</mat-icon>
              {{ hasFlashOn ? 'Apagar flash' : 'Flash' }}
            </button>
          </div>

          <div
            class="result-area mt-4 rounded-lg border border-teal-100 bg-teal-50/80 p-4 dark:border-teal-900/40 dark:bg-teal-950/30"
            *ngIf="lastScanSummary">
            <div class="result-content text-center text-gray-900 dark:text-gray-100">
              <strong class="text-sm">{{ lastScanSummary }}</strong>
              <pre
                *ngIf="lastScanDetail"
                class="mt-2 whitespace-pre-wrap break-all rounded bg-white/90 p-2 text-left text-xs text-gray-800 dark:bg-gray-900/80 dark:text-gray-200">{{ lastScanDetail }}</pre>
            </div>
          </div>

          <div class="hero-image-wrap mt-4 text-center" *ngIf="heroImageUrl">
            <img [src]="heroImageUrl" alt="Foto" class="max-h-[280px] max-w-full rounded-lg object-contain shadow-md" />
          </div>

          <div
            *ngIf="errorMessage"
            class="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <mat-icon class="shrink-0 text-red-600">error</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="manual-input mt-4">
            <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Entrada manual: DNI, placa o doc. responsable (veh. externo)
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                [(ngModel)]="manualCode"
                (keyup.enter)="submitManualCode()"
                [disabled]="cooldownActive"
                placeholder="DNI, placa o doc. responsable"
                class="block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-teal-500 focus:ring-teal-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500" />
              <button
                type="button"
                (click)="submitManualCode()"
                [disabled]="cooldownActive || !manualCode.trim()"
                title="Enviar"
                class="inline-flex shrink-0 items-center justify-center rounded-lg border border-teal-800/30 !bg-teal-600 p-2.5 shadow-sm hover:!bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:!bg-teal-500 dark:hover:!bg-teal-600">
                <mat-icon class="!text-white">send</mat-icon>
              </button>
            </div>
          </div>

          <div
            *ngIf="cooldownActive && !statusImageUrl"
            class="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            <svg class="h-6 w-6 shrink-0 animate-spin text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>Esperando… no escanee de nuevo hasta finalizar.</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [
    `
      .scanner-viewport {
        position: relative;
        width: 100%;
        aspect-ratio: 4/3;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
      }
      .scanner-viewport.dimmed {
        opacity: 0.45;
        pointer-events: none;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .scan-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .scan-line {
        width: 80%;
        height: 2px;
        background: #4caf50;
        box-shadow: 0 0 10px #4caf50;
        animation: scan 2s linear infinite;
      }
      @keyframes scan {
        0% {
          transform: translateY(-100px);
        }
        100% {
          transform: translateY(100px);
        }
      }
      .scan-frame {
        position: absolute;
        inset: 12% 10%;
        border: 2px solid rgba(76, 175, 80, 0.85);
        border-radius: 12px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.35);
        pointer-events: none;
        z-index: 2;
      }
    `,
  ],
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('scannerViewport') scannerViewport!: ElementRef;
  @Output() codeScanned = new EventEmitter<string>();

  isScanning = false;
  hasFlash = false;
  hasFlashOn = false;
  scannedResult: string | null = null;
  errorMessage: string | null = null;
  manualCode = '';

  /** Texto informativo: BarcodeDetector vs ZXing. */
  scanEngineHint = '';

  accessPoints: AccessPointOption[] = [];
  selectedAccessPointId: number | null = null;
  loadingPoints = true;

  cooldownActive = false;
  lastScanSummary: string | null = null;
  lastScanDetail: string | null = null;
  lastScanOk = false;
  heroImageUrl: string | null = null;
  /** Imagen grande de estado (allowed / denied / observed / birthday). */
  statusImageUrl: string | null = null;

  private useNativeBarcode = false;
  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private barcodeDetector: any = null;
  private zxingReader: BrowserMultiFormatReader | null = null;
  private zxingControls: IScannerControls | null = null;
  private destroy$ = new Subject<void>();
  private cooldownTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private toastr: ToastrService,
    private api: ApiService,
    private qrAccess: QrAccessService
  ) {}

  ngOnInit(): void {
    this.checkBarcodeSupport();
    this.loadAccessPoints();
  }

  ngOnDestroy(): void {
    this.stopScanning();
    this.clearCooldownTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAccessPointChange(id: number | null): void {
    if (id != null && !isNaN(Number(id)) && Number(id) > 0) {
      sessionStorage.setItem(ACCESS_POINT_STORAGE_KEY, String(id));
    } else {
      sessionStorage.removeItem(ACCESS_POINT_STORAGE_KEY);
    }
  }

  private loadAccessPoints(): void {
    this.loadingPoints = true;
    this.api
      .get<AccessPointOption[]>('api/v1/access-logs/access-points')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loadingPoints = false;
          const rows = (res.data ?? []) as AccessPointOption[];
          this.accessPoints = rows.map((r: any) => ({
            id: Number(r.id),
            name: String(r.name ?? 'Punto'),
          }));
          const saved = sessionStorage.getItem(ACCESS_POINT_STORAGE_KEY);
          const savedId = saved ? parseInt(saved, 10) : NaN;
          if (this.accessPoints.some((p) => p.id === savedId)) {
            this.selectedAccessPointId = savedId;
          } else if (this.accessPoints.length === 1) {
            this.selectedAccessPointId = this.accessPoints[0].id;
            sessionStorage.setItem(ACCESS_POINT_STORAGE_KEY, String(this.selectedAccessPointId));
          } else {
            this.selectedAccessPointId = null;
          }
        },
        error: () => {
          this.loadingPoints = false;
          this.toastr.error('No se pudieron cargar los puntos de acceso');
        },
      });
  }

  private checkBarcodeSupport(): void {
    this.useNativeBarcode = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    if (this.useNativeBarcode) {
      void this.initBarcodeDetector();
      this.scanEngineHint =
        'Lector nativo del navegador.';
    } else {
      this.scanEngineHint =
        'Lector ZXing (compatible con Chrome y otros navegadores).';
    }
  }

  private async initBarcodeDetector(): Promise<void> {
    try {
      this.barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39'],
      });
    } catch (e) {
      console.warn('BarcodeDetector init failed:', e);
      this.barcodeDetector = null;
      this.useNativeBarcode = false;
      this.scanEngineHint =
        'Lector ZXing (compatible con Chrome y otros navegadores). También puede usar la entrada manual.';
    }
  }

  async startScanning(): Promise<void> {
    if (this.cooldownActive) {
      return;
    }
    if (!this.selectedAccessPointId) {
      this.toastr.warning('Seleccione un punto de acceso');
      return;
    }
    this.errorMessage = null;
    this.scannedResult = null;
    this.lastScanSummary = null;
    this.lastScanDetail = null;
    this.heroImageUrl = null;
    this.statusImageUrl = null;

    const videoEl = this.videoElement.nativeElement;
    const useNative = this.useNativeBarcode && this.barcodeDetector;

    try {
      if (useNative) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        videoEl.srcObject = this.mediaStream;
        this.isScanning = true;
        const track = this.mediaStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        this.hasFlash = !!capabilities?.torch;
        void this.detectBarcode();
      } else {
        this.isScanning = true;
        this.hasFlash = false;
        await this.startZxingScan(videoEl);
      }
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      this.errorMessage = 'No se pudo acceder a la cámara. Verifique los permisos o use entrada manual.';
      this.isScanning = false;
      this.stopZxing();
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
      }
    }
  }

  private async startZxingScan(videoEl: HTMLVideoElement): Promise<void> {
    this.stopZxing();
    const reader = new BrowserMultiFormatReader();
    this.zxingReader = reader;
    try {
      const controls = await reader.decodeFromVideoDevice(undefined, videoEl, (result, _, __) => {
        const text = result?.getText();
        if (text) {
          this.onCodeDetected(text);
        }
      });
      this.zxingControls = controls;
      const stream = videoEl.srcObject as MediaStream | null;
      if (stream && BrowserCodeReader.mediaStreamIsTorchCompatible(stream)) {
        this.hasFlash = true;
      }
    } catch (e) {
      console.error('ZXing scan failed:', e);
      this.isScanning = false;
      this.errorMessage = 'No se pudo iniciar el lector de códigos. Use la entrada manual.';
    }
  }

  private stopZxing(): void {
    if (this.zxingControls) {
      try {
        this.zxingControls.stop();
      } catch {
        /* ignore */
      }
      this.zxingControls = null;
    }
    this.zxingReader = null;
    const v = this.videoElement?.nativeElement;
    if (v?.srcObject) {
      const ms = v.srcObject as MediaStream;
      ms.getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
  }

  stopScanning(): void {
    this.stopZxing();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    const v = this.videoElement?.nativeElement;
    if (v) {
      v.srcObject = null;
    }
    this.isScanning = false;
    this.hasFlashOn = false;
  }

  private async detectBarcode(): Promise<void> {
    if (!this.isScanning || !this.videoElement?.nativeElement) {
      return;
    }

    try {
      if (this.barcodeDetector) {
        const barcodes = await this.barcodeDetector.detect(this.videoElement.nativeElement);
        if (barcodes.length > 0) {
          const result = barcodes[0].rawValue;
          this.onCodeDetected(result);
          return;
        }
      }
    } catch (error) {
      console.warn('Barcode detection error:', error);
    }

    this.animationFrameId = requestAnimationFrame(() => this.detectBarcode());
  }

  private onCodeDetected(code: string): void {
    this.scannedResult = code;
    this.codeScanned.emit(code);
    this.stopScanning();
    this.processInput(code);
  }

  submitManualCode(): void {
    const t = this.manualCode.trim();
    if (!t || this.cooldownActive) {
      return;
    }
    this.manualCode = '';
    this.processInput(t);
  }

  private processInput(raw: string): void {
    if (!this.selectedAccessPointId) {
      this.toastr.warning('Seleccione un punto de acceso');
      return;
    }
    if (this.cooldownActive) {
      return;
    }

    this.errorMessage = null;
    this.lastScanSummary = null;
    this.lastScanDetail = null;
    this.heroImageUrl = null;
    this.statusImageUrl = null;

    this.qrAccess.scan(raw).subscribe({
      next: (data) => {
        this.applyScanUi(data);
        this.postAccessLog(data);
        this.beginCooldown();
      },
      error: (err) => {
        const msg = err?.error?.error || err?.message || 'Error al procesar la lectura';
        this.errorMessage = msg;
        this.lastScanSummary = msg;
        this.lastScanDetail = null;
        this.statusImageUrl = 'assets/denied.png';
        this.toastr.error(msg);
        this.beginCooldown();
      },
    });
  }

  private applyScanUi(data: AccessQrScanResult): void {
    const lines: string[] = [];
    if (data.kind === 'person' && data.person) {
      const p = data.person;
      lines.push(
        [p.first_name, p.paternal_surname, p.maternal_surname].filter(Boolean).join(' ').trim() ||
          p.doc_number
      );
      lines.push(`DNI: ${p.doc_number}`);
      if (p.person_type) {
        lines.push(`Tipo: ${p.person_type}`);
      }
      const url = this.api.getPhotoUrl(p.photo_url ?? null);
      this.heroImageUrl = url || null;
    } else if (data.kind === 'vehicle' && data.vehicle) {
      const v = data.vehicle;
      lines.push(
        data.temp_visit_id ? `Visita externa ${v.license_plate}` : `Vehículo ${v.license_plate}`
      );
      if (v.brand || v.model) {
        lines.push([v.brand, v.model].filter(Boolean).join(' '));
      }
      if (data.doc_number) {
        lines.push(`Doc. responsable: ${data.doc_number}`);
      }
      const url = this.api.getPhotoUrl(v.photo_url ?? null);
      this.heroImageUrl = url || null;
    } else {
      lines.push(data.message || 'Sin coincidencia en el registro');
      if (data.doc_number) {
        lines.push(`Doc.: ${data.doc_number}`);
      }
      if (data.license_plate) {
        lines.push(`Placa: ${data.license_plate}`);
      }
      this.heroImageUrl = null;
    }

    this.statusImageUrl = this.pickStatusImage(data);
    this.lastScanOk = data.allow_entry;
    this.lastScanSummary = `${data.status_validated}${data.allow_entry ? ' — Ingreso registrado' : ' — Registro denegado / observado'}`;
    if (data.is_birthday) {
      this.lastScanSummary += ' — ¡Cumpleaños!';
    }
    this.lastScanDetail = lines.join('\n');

    const snack = data.allow_entry
      ? data.is_birthday
        ? 'Ingreso registrado. ¡Feliz cumpleaños!'
        : 'Ingreso registrado'
      : 'Acceso denegado u observado — evento registrado';
    if (data.allow_entry) {
      this.toastr.success(snack);
    } else {
      this.toastr.warning(snack);
    }
  }

  private pickStatusImage(data: AccessQrScanResult): string {
    const st = (data.status_validated || '').toUpperCase();
    if (!data.allow_entry || st === 'DENEGADO') {
      return 'assets/denied.png';
    }
    if (st === 'OBSERVADO' || st === 'RESTRINGIDO') {
      return 'assets/observed.png';
    }
    if (data.is_birthday) {
      return 'assets/birthday.png';
    }
    return 'assets/allowed.png';
  }

  private buildObservation(data: AccessQrScanResult): string {
    let o = data.status_validated;
    if (data.is_birthday) {
      o += ' | CUMPLEAÑOS';
    }
    if (data.source === 'qr') {
      o += ' | QR';
    } else {
      o += ' | MANUAL';
    }
    return o;
  }

  private postAccessLog(data: AccessQrScanResult): void {
    const apId = this.selectedAccessPointId;
    if (!apId) {
      return;
    }

    const body: Record<string, unknown> = {
      access_point_id: apId,
      type: 'INGRESO',
      observation: this.buildObservation(data),
    };

    if (data.kind === 'person') {
      body.person_id = data.person_id ?? null;
      body.doc_number = data.doc_number ?? data.person?.doc_number ?? null;
      body.vehicle_id = null;
    } else {
      const vid = data.vehicle_id != null && Number(data.vehicle_id) > 0 ? Number(data.vehicle_id) : null;
      body.vehicle_id = vid;
      body.person_id = null;
      body.doc_number = data.doc_number ?? null;
      if (!vid && data.license_plate) {
        body.observation = `${body.observation} | placa ${data.license_plate}`;
      }
      if (data.temp_visit_id) {
        body.observation = `${body.observation} | veh.ext #${data.temp_visit_id}`;
      }
    }

    this.api.post('api/v1/access-logs', body).subscribe({
      error: () => {
        this.toastr.error('No se pudo guardar el registro de acceso');
      },
    });
  }

  private beginCooldown(): void {
    this.clearCooldownTimer();
    this.cooldownActive = true;
    this.cooldownTimer = setTimeout(() => {
      this.cooldownActive = false;
      this.cooldownTimer = null;
    }, COOLDOWN_MS);
  }

  private clearCooldownTimer(): void {
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  async toggleFlash(): Promise<void> {
    const video = this.videoElement?.nativeElement;
    const stream = (this.mediaStream ?? (video?.srcObject as MediaStream | null)) ?? null;
    if (!stream) {
      return;
    }
    try {
      if (BrowserCodeReader.mediaStreamIsTorchCompatible(stream)) {
        const track = stream.getVideoTracks()[0];
        await BrowserCodeReader.mediaStreamSetTorch(track, !this.hasFlashOn);
        this.hasFlashOn = !this.hasFlashOn;
        return;
      }
      const track = stream.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !this.hasFlashOn } as any],
      });
      this.hasFlashOn = !this.hasFlashOn;
    } catch (error) {
      console.error('Flash toggle error:', error);
    }
  }
}
