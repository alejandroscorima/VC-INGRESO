import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Misma imagen institucional que el login (`src/assets/BG-INGRESO-VC5.png`). */
  readonly condoBackgroundUrl = 'assets/BG-INGRESO-VC5.png';

  readonly logoUrl = 'assets/logo_VC5.png';

  menuOpen = false;
  impactWord = 'SEGURIDAD';

  private lastScrollTop = 0;
  private wordTimer: ReturnType<typeof setInterval> | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  private readonly impactWords = [
    'SEGURIDAD',
    'ORDEN',
    'TRAZABILIDAD',
    'CONTROL',
    'AUTONOMÍA',
    'TRANQUILIDAD',
  ];
  private wordIndex = 0;

  private get prefersReducedMotion(): boolean {
    return this.doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')
      ?.matches ?? false;
  }

  ngOnInit(): void {
    if (this.prefersReducedMotion) {
      return;
    }
    this.wordTimer = setInterval(() => {
      this.wordIndex = (this.wordIndex + 1) % this.impactWords.length;
      this.impactWord = this.impactWords[this.wordIndex];
    }, 2200);
  }

  ngAfterViewInit(): void {
    if (this.prefersReducedMotion) {
      this.host.nativeElement.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('vl-revealed');
      });
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vl-revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.host.nativeElement.querySelectorAll('[data-reveal]').forEach((el) => {
      this.intersectionObserver?.observe(el);
    });
  }

  ngOnDestroy(): void {
    if (this.wordTimer) {
      clearInterval(this.wordTimer);
      this.wordTimer = null;
    }
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.doc.body.removeAttribute('scroll-direction');
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const st = this.doc.documentElement.scrollTop || this.doc.body.scrollTop;
    const direction = st > this.lastScrollTop ? 'down' : 'up';
    if (Math.abs(st - this.lastScrollTop) > 8) {
      this.doc.body.setAttribute('scroll-direction', direction);
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }

  openMenu(): void {
    this.menuOpen = true;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  scrollToSection(event: Event, elementId: string): void {
    event.preventDefault();
    this.closeMenu();
    const el = this.doc.getElementById(elementId);
    el?.scrollIntoView({ behavior: this.prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen) {
      this.closeMenu();
    }
  }
}
