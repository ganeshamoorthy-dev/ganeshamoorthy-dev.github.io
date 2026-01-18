import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs';
import { PortfolioService } from '../../services/portfolio-data.service';
import { ThemeService } from '../../services/theme.service';
import { CookieService } from '../../services/cookie.service';
import { PersonalInfo } from '../../models/portfolio.model';
import { COOKIE_CONSTANTS } from '../../constants/cookie.constants';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  personalInfo: PersonalInfo | null = null;
  typedRoles = ['Full Stack Developer', 'Angular Expert', 'Java Developer', 'Frontend Specialist', 'Tech Enthusiast'];
  currentRoleIndex = 0;
  currentRole = '';
  isDarkTheme$: Observable<boolean>;
  showResume = false;
  private typingInterval: any;
  private roleInterval: any;

  constructor(
    private portfolioService: PortfolioService,
    private themeService: ThemeService,
    private cookieService: CookieService
  ) {
    this.isDarkTheme$ = this.themeService.isDarkTheme();
  }

  ngOnInit(): void {
    this.portfolioService.getPortfolio().subscribe(portfolio => {
      this.personalInfo = portfolio.personalInfo;
    });
    
    // Check if resume should be visible based on cookie
    this.checkResumeVisibility();
    
    this.startTypingAnimation();
  }

  /**
   * Check if resume should be visible based on cookie header
   * Checks if a cookie key contains 'mode' or similar pattern
   */
  private checkResumeVisibility(): void {
    this.showResume = this.cookieService.checkCookieKeyExists(COOKIE_CONSTANTS.RESUME_MODE_KEY);
  }

  ngOnDestroy(): void {
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.roleInterval) clearInterval(this.roleInterval);
  }

  private startTypingAnimation(): void {
    const typeRole = () => {
      const role = this.typedRoles[this.currentRoleIndex];
      let charIndex = 0;
      
      this.typingInterval = setInterval(() => {
        if (charIndex < role.length) {
          this.currentRole = role.substring(0, charIndex + 1);
          charIndex++;
        } else {
          clearInterval(this.typingInterval);
          
          // Wait before erasing
          setTimeout(() => {
            const eraseInterval = setInterval(() => {
              if (this.currentRole.length > 0) {
                this.currentRole = this.currentRole.substring(0, this.currentRole.length - 1);
              } else {
                clearInterval(eraseInterval);
                this.currentRoleIndex = (this.currentRoleIndex + 1) % this.typedRoles.length;
                setTimeout(typeRole, 500);
              }
            }, 50);
          }, 2000);
        }
      }, 100);
    };
    
    typeRole();
  }

  downloadResume(): void {
    if (this.personalInfo?.resumeUrl) {
      const link = document.createElement('a');
      link.href = this.personalInfo.resumeUrl;
      link.download = 'ganeshamoorthy-software-engineer.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
