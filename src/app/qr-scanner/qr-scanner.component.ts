import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="qr-scanner-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>qr_code_scanner</mat-icon>
            Escáner QR/Barcode
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="scanner-viewport" #scannerViewport>
            <video #videoElement autoplay playsinline></video>
            <canvas #scanCanvas hidden></canvas>
            <div class="scan-overlay" *ngIf="isScanning">
              <div class="scan-line"></div>
            </div>
          </div>

          <div class="scanner-controls">
            <button mat-raised-button color="primary" 
                    (click)="startScanning()" 
                    *ngIf="!isScanning"
                    [disabled]="!isSupported">
              <mat-icon>play_arrow</mat-icon>
              Iniciar Escáner
            </button>
            
            <button mat-raised-button color="warn" 
                    (click)="stopScanning()" 
                    *ngIf="isScanning">
              <mat-icon>stop</mat-icon>
              Detener
            </button>

            <button mat-raised-button (click)="toggleFlash()" 
                    *ngIf="isScanning && hasFlash">
              <mat-icon>{{ hasFlashOn ? 'flash_off' : 'flash_on' }}</mat-icon>
              {{ hasFlashOn ? 'Apagar Flash' : 'Encender Flash' }}
            </button>
          </div>

          <div class="result-area" *ngIf="scannedResult">
            <mat-icon>check_circle</mat-icon>
            <div class="result-content">
              <strong>Código Detectado:</strong>
              <pre>{{ scannedResult }}</pre>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>

          <div class="manual-input">
            <mat-form-field appearance="outline">
              <mat-label>Entrada Manual</mat-label>
              <input matInput [(ngModel)]="manualCode" 
                     (keyup.enter)="submitManualCode()"
                     placeholder="Ingrese código manualmente">
              <button mat-icon-button matSuffix (click)="submitManualCode()">
                <mat-icon>send</mat-icon>
              </button>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .qr-scanner-container {
      max-width: 500px;
      margin: 0 auto;
    }
    mat-card-header {
      justify-content: center;
      padding: 16px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .scanner-viewport {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
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
      0% { transform: translateY(-100px); }
      100% { transform: translateY(100px); }
    }
    .scanner-controls {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin: 16px 0;
    }
    .result-area {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #e8f5e9;
      border-radius: 8px;
      margin-top: 16px;
    }
    .result-area mat-icon {
      color: #4caf50;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .result-content {
      flex: 1;
    }
    .result-content pre {
      margin: 8px 0 0;
      background: #fff;
      padding: 8px;
      border-radius: 4px;
      word-break: break-all;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      padding: 12px;
      background: #ffebee;
      border-radius: 8px;
      margin-top: 16px;
    }
    .manual-input {
      margin-top: 16px;
    }
    .manual-input mat-form-field {
      width: 100%;
    }
  `]
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('scannerViewport') scannerViewport!: ElementRef;
  @Output() codeScanned = new EventEmitter<string>();

  isScanning = false;
  isSupported = false;
  hasFlash = false;
  hasFlashOn = false;
  scannedResult: string | null = null;
  errorMessage: string | null = null;
  manualCode = '';

  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private barcodeDetector: any = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.checkBarcodeSupport();
  }

  ngOnDestroy(): void {
    this.stopScanning();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkBarcodeSupport(): void {
    // Verificar si BarcodeDetector está disponible
    if ('BarcodeDetector' in window) {
      this.isSupported = true;
      this.initBarcodeDetector();
    } else {
      this.isSupported = false;
      this.errorMessage = 'BarcodeDetector no está soportado en este navegador. Use Chrome 88+ o Edge 88+.';
    }
  }

  private async initBarcodeDetector(): Promise<void> {
    try {
      // @ts-ignore
      const formats = await BarcodeDetector.getSupportedFormats();
      // @ts-ignore
      this.barcodeDetector = new BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39']
      });
    } catch (e) {
      console.warn('BarcodeDetector initialization failed:', e);
      this.isSupported = false;
      this.errorMessage = 'No se pudo inicializar BarcodeDetector';
    }
  }

  async startScanning(): Promise<void> {
    try {
      this.errorMessage = null;
      this.scannedResult = null;
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      this.videoElement.nativeElement.srcObject = this.mediaStream;
      this.isScanning = true;

      // Verificar si tiene flash
      const track = this.mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      this.hasFlash = capabilities?.torch || false;

      // Iniciar detección
      this.detectBarcode();
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      this.errorMessage = 'No se pudo acceder a la cámara. Verifique los permisos.';
      this.isScanning = false;
    }
  }

  stopScanning(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isScanning = false;
    this.hasFlashOn = false;
  }

  private async detectBarcode(): Promise<void> {
    if (!this.isScanning || !this.videoElement?.nativeElement) return;

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

    // Continuar escaneando
    this.animationFrameId = requestAnimationFrame(() => this.detectBarcode());
  }

  private onCodeDetected(code: string): void {
    this.scannedResult = code;
    this.codeScanned.emit(code);
    this.stopScanning();
  }

  async toggleFlash(): Promise<void> {
    if (!this.mediaStream) return;

    try {
      const track = this.mediaStream.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !this.hasFlashOn } as any]
      });
      this.hasFlashOn = !this.hasFlashOn;
    } catch (error) {
      console.error('Flash toggle error:', error);
    }
  }

  submitManualCode(): void {
    if (this.manualCode.trim()) {
      this.onCodeDetected(this.manualCode.trim());
      this.manualCode = '';
    }
  }
}
