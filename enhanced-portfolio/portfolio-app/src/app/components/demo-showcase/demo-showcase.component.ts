import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import { PortfolioService } from '../../services/portfolio-data.service';
import { FeaturedShowcase, ShowcaseMedia } from '../../models/portfolio.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-demo-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ScrollAnimateDirective
  ],
  templateUrl: './demo-showcase.component.html',
  styleUrl: './demo-showcase.component.css'
})
export class DemoShowcaseComponent implements OnInit, OnDestroy {
  @Input() showcaseData?: FeaturedShowcase;

  @ViewChild('videoContainer') videoContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('videoElement') videoElementRef?: ElementRef<HTMLVideoElement>;

  showcase?: FeaturedShowcase;
  private showcaseSubscription?: Subscription;

  activeTab: 'video' | 'gallery' | 'features' = 'video';

  // Video State (single video source to prevent dual voice / multiple streams)
  videoSrc = '';
  videoPoster = '';
  isPlaying = false;
  isMuted = false;
  volume = 0.85;
  currentTime = 0;
  duration = 0;
  progressPercent = 0;
  playbackSpeed = 1;
  availableSpeeds = [0.75, 1, 1.25, 1.5, 2];
  showSpeedMenu = false;
  videoHasError = false;

  // Unified Fullscreen State
  isFullscreen = false;
  isFullscreenFallback = false;

  // Gallery / Lightbox State
  selectedImageIndex = 0;
  isImageModalOpen = false;
  galleryImages: ShowcaseMedia[] = [];

  constructor(
    private portfolioService: PortfolioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.showcaseData) {
      this.initShowcase(this.showcaseData);
    } else {
      this.showcaseSubscription = this.portfolioService.getFeaturedShowcase().subscribe({
        next: (data) => {
          if (data) {
            this.initShowcase(data);
          }
        },
        error: (err) => console.error('Error loading featured showcase:', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.pauseVideo();
    this.showcaseSubscription?.unsubscribe();
  }

  private initShowcase(data: FeaturedShowcase): void {
    this.showcase = data;
    this.videoSrc = data.video?.src || '';
    this.videoPoster = data.video?.poster || '';
    this.galleryImages = [...(data.gallery || [])];
    this.cdr.detectChanges();
  }

  setTab(tab: 'video' | 'gallery' | 'features'): void {
    this.activeTab = tab;
    if (tab !== 'video') {
      this.pauseVideo();
    }
  }

  togglePlay(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().then(() => {
        this.isPlaying = true;
        this.videoHasError = false;
        this.cdr.detectChanges();
      }).catch(err => {
        console.warn('Video playback prevented or file pending:', err);
        this.isPlaying = false;
        this.cdr.detectChanges();
      });
    } else {
      video.pause();
      this.isPlaying = false;
      this.cdr.detectChanges();
    }
  }

  pauseVideo(): void {
    if (this.videoElementRef?.nativeElement) {
      this.videoElementRef.nativeElement.pause();
    }
    this.isPlaying = false;
  }

  onTimeUpdate(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    this.currentTime = video.currentTime;
    this.duration = video.duration || 0;
    this.progressPercent = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  onLoadedMetadata(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    this.duration = video.duration;
    this.videoHasError = false;
    this.cdr.detectChanges();
  }

  onVideoEnded(): void {
    this.isPlaying = false;
    this.progressPercent = 100;
    this.cdr.detectChanges();
  }

  onVideoError(event?: Event): void {
    this.videoHasError = true;
    this.isPlaying = false;
    this.cdr.detectChanges();
  }

  seekVideo(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    const video = this.videoElementRef?.nativeElement;
    if (!video || !this.duration) return;

    const newTime = (value / 100) * this.duration;
    video.currentTime = newTime;
    this.currentTime = newTime;
    this.progressPercent = value;
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.videoElementRef?.nativeElement) {
      this.videoElementRef.nativeElement.muted = this.isMuted;
    }
  }

  setVolume(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.volume = parseFloat(target.value);
    this.isMuted = this.volume === 0;

    if (this.videoElementRef?.nativeElement) {
      this.videoElementRef.nativeElement.volume = this.volume;
      this.videoElementRef.nativeElement.muted = this.isMuted;
    }
  }

  changePlaybackSpeed(speed: number): void {
    this.playbackSpeed = speed;
    this.showSpeedMenu = false;
    if (this.videoElementRef?.nativeElement) {
      this.videoElementRef.nativeElement.playbackRate = speed;
    }
  }

  toggleSpeedMenu(): void {
    this.showSpeedMenu = !this.showSpeedMenu;
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Unified single Fullscreen Toggle
  toggleFullscreen(): void {
    const container = this.videoContainerRef?.nativeElement;
    const video = this.videoElementRef?.nativeElement;
    if (!container) return;

    const doc: any = document;
    const isCurrentlyFullscreen = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      this.isFullscreenFallback
    );

    if (!isCurrentlyFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          this.activateFallbackFullscreen();
        });
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      } else if (video && (video as any).webkitEnterFullscreen) {
        (video as any).webkitEnterFullscreen();
      } else {
        this.activateFallbackFullscreen();
      }
    } else {
      if (this.isFullscreenFallback) {
        this.isFullscreenFallback = false;
        this.isFullscreen = false;
        document.body.classList.remove('overflow-hidden');
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        }
      }
      this.cdr.detectChanges();
    }
  }

  private activateFallbackFullscreen(): void {
    this.isFullscreenFallback = true;
    this.isFullscreen = true;
    document.body.classList.add('overflow-hidden');
    this.cdr.detectChanges();
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  onFullscreenChange(): void {
    const doc: any = document;
    const isNativeFullscreen = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
    this.isFullscreen = isNativeFullscreen || this.isFullscreenFallback;
    if (!isNativeFullscreen && !this.isFullscreenFallback) {
      document.body.classList.remove('overflow-hidden');
    }
    this.cdr.detectChanges();
  }

  openImageModal(index: number): void {
    this.selectedImageIndex = index;
    this.isImageModalOpen = true;
  }

  closeImageModal(): void {
    this.isImageModalOpen = false;
  }

  nextImage(): void {
    if (this.galleryImages.length === 0) return;
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.galleryImages.length;
  }

  prevImage(): void {
    if (this.galleryImages.length === 0) return;
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const targetTag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    const isTyping = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

    if (this.isImageModalOpen) {
      if (event.key === 'Escape') {
        this.closeImageModal();
      } else if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'ArrowLeft') {
        this.prevImage();
      }
      return;
    }

    if (this.isFullscreenFallback && event.key === 'Escape') {
      this.toggleFullscreen();
      return;
    }

    if (!isTyping && this.activeTab === 'video') {
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        this.toggleFullscreen();
      } else if (event.key === ' ' || event.key === 'k' || event.key === 'K') {
        event.preventDefault();
        this.togglePlay();
      } else if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        this.toggleMute();
      }
    }
  }
}
