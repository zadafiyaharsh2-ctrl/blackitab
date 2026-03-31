/**
 * useLenis — Global Lenis smooth scroll initializer.
 *
 * Initializes a Lenis instance on mount, runs its RAF loop,
 * and tears it down on unmount. Integrates with framer-motion
 * via gsap-style ticker if available.
 */
import { useEffect } from 'react';
import Lenis from 'lenis';

let globalLenis = null;

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,              // Physics-based interpolation (0.05-0.1). Buttery smooth without predefined duration lag.
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,    // Slightly faster native wheel feel, highly responsive
      touchMultiplier: 2,      // Good speed on trackpads/mobile
      infinite: false,
    });

    globalLenis = lenis;

    let frameId;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      globalLenis = null;
    };
  }, []);
}

/** Call this to programmatically scroll to a target (element or selector) */
export function lenisScrollTo(target, options = {}) {
  globalLenis?.scrollTo(target, { duration: 1.2, ...options });
}

export function getLenis() {
  return globalLenis;
}
