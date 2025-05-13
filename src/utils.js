// Image preloader - uses imagesLoaded library
export const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    // Check if the imagesLoaded library is available globally
    if (typeof imagesLoaded === 'function' || (typeof window !== 'undefined' && window.imagesLoaded)) {
      const imgLoad = window.imagesLoaded || imagesLoaded;
      imgLoad(document.querySelectorAll(selector), { background: true }, resolve);
    } else {
      console.warn('imagesLoaded library not found. Images might not be fully loaded.');
      // Fallback - just resolve after a small delay
      setTimeout(resolve, 500);
    }
  });
};

// Linear interpolation
export const lerp = (a, b, t) => a + (b - a) * t;

// Get element center coordinates
export const getElementCenter = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

// Clamp a value between min and max
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Generate a random number between min and max
export const random = (min, max) => Math.random() * (max - min) + min;

// Check if device is touch enabled
export const isTouchDevice = () => {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
};

// Wait for a specified duration
export const wait = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 