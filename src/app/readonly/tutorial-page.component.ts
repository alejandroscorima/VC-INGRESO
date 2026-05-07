import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

interface TutorialVideo {
  title: string;
  youtubeId: string;
}

interface TutorialTopic {
  title: string;
  description?: string;
  videos: TutorialVideo[];
}

@Component({
  selector: 'app-tutorial-page',
  templateUrl: './tutorial-page.component.html',
  styleUrls: ['./tutorial-page.component.css']
})
export class TutorialPageComponent {
  topics: TutorialTopic[] = [];

  loading = false;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    // No fallback: si el backend no tiene temas, la pantalla queda vacía.
    this.loading = true;
    this.api.get<{ tutorial_topics: TutorialTopic[] }>('api/v1/readonly/content').subscribe({
      next: (res) => {
        const topics = res?.data?.tutorial_topics;
        this.topics = Array.isArray(topics) ? topics : [];
        this.loading = false;
      },
      error: () => {
        this.topics = [];
        this.loading = false;
      }
    });
  }

  embedUrl(youtubeId: string): SafeResourceUrl {
    const id = String(youtubeId ?? '').trim();
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${encodeURIComponent(id)}`);
  }
}
