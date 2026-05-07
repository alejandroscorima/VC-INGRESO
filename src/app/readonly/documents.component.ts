import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

export interface DocumentLink {
  title: string;
  url: string;
  description?: string;
  date?: string;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: DocumentLink[] = [];
  authorizationUrl = '';

  loading = false;
  saving = false;
  authEditorOpen = false;
  addUrlOpen = false;
  uploadOpen = false;

  draftTitle = '';
  draftUrl = '';
  draftDescription = '';
  draftDate = '';
  draftAuthorizationUrl = '';

  // Upload desde el equipo (solo admin). Los archivos subidos NO se borran del servidor;
  // únicamente se quita la URL del listado.
  uploadFile: File | null = null;
  uploadingFile = false;
  uploadTitle = '';
  uploadDescription = '';
  uploadDate = '';

  constructor(
    public readonly auth: AuthService,
    private readonly api: ApiService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  get showAuthorization(): boolean {
    return this.authorizationUrl.length > 0;
  }

  get showDocuments(): boolean {
    return this.documents.length > 0;
  }

  get showEmpty(): boolean {
    return !this.showAuthorization && !this.showDocuments;
  }

  private loadDocuments(): void {
    this.loading = true;
    this.api.get<{ documents: DocumentLink[]; authorization_url?: string }>('api/v1/readonly/content').subscribe({
      next: (res) => {
        const docs = res?.data?.documents;
        const authUrl = String(res?.data?.authorization_url ?? '').trim();

        this.documents = Array.isArray(docs) ? docs : [];
        this.authorizationUrl = authUrl;
        this.draftAuthorizationUrl = this.authorizationUrl;

        this.loading = false;
      },
      error: () => {
        this.documents = [];
        this.authorizationUrl = '';
        this.draftAuthorizationUrl = '';
        this.loading = false;
      }
    });
  }

  addUrlDocument(): void {
    const title = this.draftTitle.trim();
    const url = this.draftUrl.trim();
    const description = this.draftDescription.trim();
    const date = this.normalizeDate(this.draftDate);
    if (!title || !url) {
      this.toastr.warning('Ingrese Título y URL.');
      return;
    }
    this.documents = [
      ...this.documents,
      { title, url, description: description || undefined, date }
    ];
    this.draftTitle = '';
    this.draftUrl = '';
    this.draftDescription = '';
    this.draftDate = '';
    this.persistDocuments('URL agregada.');
  }

  onUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] ?? null;
    this.uploadFile = file;
  }

  uploadSelectedFile(): void {
    if (!this.uploadFile) {
      this.toastr.warning('Seleccione un archivo.');
      return;
    }
    this.uploadingFile = true;

    this.api.uploadReadonlyDocument(this.uploadFile).subscribe({
      next: (res) => {
        const url = String(res?.data?.url ?? '').trim();
        const customTitle = String(this.uploadTitle ?? '').trim();
        const backendTitle = String(res?.data?.title ?? '').trim();
        const fileNameTitle = String(this.uploadFile?.name ?? 'Documento').trim();
        const title = customTitle || backendTitle || fileNameTitle;
        if (!url) {
          this.uploadingFile = false;
          this.toastr.error('No se recibió URL del archivo.');
          return;
        }

        this.documents = [
          ...this.documents,
          {
            title,
            url,
            description: this.uploadDescription.trim() || undefined,
            date: this.normalizeDate(this.uploadDate)
          }
        ];

        this.uploadFile = null;
        this.uploadingFile = false;
        this.uploadTitle = '';
        this.uploadDescription = '';
        this.uploadDate = '';
        this.persistDocuments('Archivo agregado al listado.');
      },
      error: (e) => {
        this.uploadingFile = false;
        this.toastr.error(e?.message || 'No se pudo subir el archivo.');
      }
    });
  }

  removeDoc(i: number): void {
    this.documents = this.documents.filter((_, idx) => idx !== i);
    this.persistDocuments('URL quitada del listado.');
  }

  saveAuthorizationUrl(): void {
    this.persistDocuments('URL de autorización actualizada.');
  }

  toggleAuthEditor(): void {
    this.authEditorOpen = !this.authEditorOpen;
  }

  toggleAddUrl(): void {
    this.addUrlOpen = !this.addUrlOpen;
  }

  toggleUpload(): void {
    this.uploadOpen = !this.uploadOpen;
  }

  private persistDocuments(successMessage?: string): void {
    if (!this.auth.isAdministratorRole()) {
      return;
    }
    this.saving = true;
    const authorization_url = String(this.draftAuthorizationUrl ?? '').trim();
    this.api.put('api/v1/readonly/content/documents', { documents: this.documents, authorization_url }).subscribe({
      next: (res) => {
        const docs = res?.data?.documents;
        if (Array.isArray(docs)) {
          this.documents = docs;
        }
        const authUrl = String(res?.data?.authorization_url ?? '').trim();
        this.authorizationUrl = authUrl;
        this.draftAuthorizationUrl = authUrl;
        this.saving = false;
        if (successMessage) {
          this.toastr.success(successMessage);
        }
      },
      error: (e) => {
        this.saving = false;
        this.toastr.error(e?.message || 'No se pudo guardar.');
        this.loadDocuments();
      }
    });
  }

  private normalizeDate(value: string): string {
    const date = String(value ?? '').trim();
    if (date) return date;
    return new Date().toISOString().slice(0, 10);
  }

  getUrlIcon(url: string): string {
    const u = String(url ?? '').trim().toLowerCase();
    const clean = u.split('#')[0].split('?')[0];
    const ext = clean.includes('.') ? clean.split('.').pop() || '' : '';

    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'description';
    if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return 'grid_on';
    if (['ppt', 'pptx', 'odp'].includes(ext)) return 'slideshow';
    if (['txt', 'md', 'log'].includes(ext)) return 'article';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'folder_zip';
    if (u.startsWith('http://') || u.startsWith('https://')) return 'link';
    return 'insert_drive_file';
  }

  isImageUrl(url: string): boolean {
    const u = String(url ?? '').trim().toLowerCase();
    const clean = u.split('#')[0].split('?')[0];
    return /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(clean);
  }
}
