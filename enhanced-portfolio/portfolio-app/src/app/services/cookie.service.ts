import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  /**
   * Get a cookie value by name
   */
  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  /**
   * Check if a cookie with a specific key pattern exists
   * (useful for checking if key contains a certain string like "mode")
   */
  checkCookieKeyExists(keyPattern: string): boolean {
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => {
      const cookieKey = cookie.trim().split('=')[0];
      return cookieKey.includes(keyPattern);
    });
  }

  /**
   * Check if cookie with specific key has a specific value
   */
  checkCookieValue(cookieName: string, expectedValue: string): boolean {
    const value = this.getCookie(cookieName);
    return value === expectedValue;
  }

  /**
   * Set a cookie with name, value, and optional expiration days
   */
  setCookie(name: string, value: string, days: number = 7): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
  }

  /**
   * Delete a cookie
   */
  deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }
}
