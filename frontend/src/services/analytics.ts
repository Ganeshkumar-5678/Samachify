/**
 * Google Analytics 4 (GA4) Integration for SAMACHIFY
 * Deployed URL: https://stirring-sunshine-7eb4ee.netlify.app/
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-RZFYJ2FPTL';

export function initGA() {
  // Global gtag is already injected in index.html for G-RZFYJ2FPTL
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: window.location.href,
      page_title: document.title,
    });
    console.info(`[Analytics] Google Analytics 4 initialized for ${GA_MEASUREMENT_ID}`);
  }
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackPageView(pagePath: string) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (typeof window.gtag === 'function' && measurementId) {
    window.gtag('config', measurementId, {
      page_path: pagePath,
    });
  }
}
