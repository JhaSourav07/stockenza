'use client';
import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * useFocusTrap(containerRef, isActive)
 *
 * When `isActive` is true:
 *  - Focuses the first focusable element inside `containerRef.current` on mount.
 *  - Traps Tab / Shift+Tab focus within the container.
 *  - Restores focus to the previously-focused element on deactivation.
 */
export function useFocusTrap(containerRef, isActive) {
  const previousFocusRef = useRef(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
      (el) => !el.closest('[aria-hidden="true"]')
    );
  }, [containerRef]);

  // Save previously focused element and focus first item inside trap
  useEffect(() => {
    if (!isActive) return;
    previousFocusRef.current = document.activeElement;

    // Small rAF delay ensures the element is rendered/visible before focusing
    const raf = requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) focusable[0].focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      // Restore focus when trap deactivates
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, getFocusableElements]);

  // Tab / Shift+Tab cycle trap
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first element, wrap to last
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: if focus is on last element, wrap to first
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, getFocusableElements]);
}
