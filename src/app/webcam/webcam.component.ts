import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css']
})
export class WebcamComponent implements OnInit, OnDestroy {
  @Output() photoCaptured = new EventEmitter<{ imageBase64: string; imageBlob: Blob }>();
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  videoStream: MediaStream | null = null;
  isStreaming = false;
  errorMessage = '';
  facingMode = 'user';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.initCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async initCamera(): Promise<void> {
    try {
      this.errorMessage = '';
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.videoStream;
        this.videoElement.nativeElement.play();
        this.isStreaming = true;
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      this.errorMessage = this.getErrorMessage(error);
    }
  }

  capturePhoto(): void {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    
    // Convertir a Blob
    fetch(imageBase64)
      .then(res => res.blob())
      .then(blob => {
        this.photoCaptured.emit({ imageBase64, imageBlob: blob });
      });
  }

  switchCamera(): void {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.stopCamera();
    this.initCamera();
  }

  stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
      this.isStreaming = false;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError') {
      return 'No se permitió el acceso a la cámara. Por favor, otorgue permisos.';
    } else if (error.name === 'NotFoundError') {
      return 'No se encontró ninguna cámara en el dispositivo.';
    } else if (error.name === 'NotReadableError') {
      return 'La cámara está siendo usada por otra aplicación.';
    } else {
      return 'Error al acceder a la cámara: ' + error.message;
    }
  }
}
