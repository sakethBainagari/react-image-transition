import { useState, useEffect } from 'react';
import { preloadImages } from './utils';
import imagesLoaded from 'imagesloaded';
import './styles.css';
import Header from './components/Header';
import Section from './components/Section';
import Panel from './components/Panel';
import gsap from 'gsap';

// Import the data for all grid sections
import { section1Data, section2Data, section3Data } from './data';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initial loading sequence - exactly like sample_code
  useEffect(() => {
    // Make imagesLoaded globally available
    window.imagesLoaded = imagesLoaded;
    
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Preload all images - exactly like sample_code preloadImages
    preloadImages('.grid__item-image, .panel__img').then(() => {
      // Remove loading class and update state
      document.body.classList.remove('loading');
      setLoading(false);
      
      // Init animation with delay - similar to sample_code init
      setTimeout(() => {
        const gridItems = document.querySelectorAll('.grid__item');
        
        // Reset all grid items before animating them in
        gsap.set(gridItems, { clipPath: 'none', opacity: 0, scale: 0.8 });
        
        // Animate them in one by one
        gridItems.forEach((item, index) => {
          gsap.to(item, {
            opacity: 1, 
            scale: 1,
            duration: 0.6,
            delay: index * 0.05,
            ease: 'power1.out'
          });
        });
      }, 400);
    }).catch(error => {
      console.error('Error preloading images:', error);
      document.body.classList.remove('loading');
      setLoading(false);
    });
  }, []);

  // Handle item click - similar to sample_code onGridItemClick
  const handleItemClick = (item) => {
    if (isPanelOpen || isAnimating) return;
    setCurrentItem(item);
    setIsPanelOpen(true);
  };

  // Handle panel close - similar to sample_code resetView
  const handlePanelClose = () => {
    if (isAnimating) return;
    setIsPanelOpen(false);
    setTimeout(() => {
      setCurrentItem(null);
    }, 500);
  };

  // Show nothing while loading - exactly like sample_code
  if (loading) {
    return null;
  }

  return (
    <main className="p-6">
      <Header />
      
      <Section 
        title="Shane Weber" 
        subtitle="effect 01: straight linear paths, smooth easing, clean timing, minimal rotation."
        items={section1Data}
        onItemClick={handleItemClick}
      />

      <Section 
        title="Manika Jorge" 
        subtitle="effect 02: Adjusts mover count, rotation, timing, and animation feel."
        items={section2Data}
        onItemClick={handleItemClick}
      />
      
      <Section 
        title="Desiree Telles" 
        subtitle="effect 03: Diagonal paths, bouncy easing, clip from side, blend modes."
        items={section3Data}
        onItemClick={handleItemClick}
      />

      <Panel 
        isOpen={isPanelOpen} 
        item={currentItem} 
        onClose={handlePanelClose} 
      />
      
      <footer className="frame frame--footer flex justify-between items-end min-h-[300px]">
        <span>
          Made by <a href="https://codrops.com/" className="line">@codrops</a>
        </span>
        <span>
          <a href="https://tympanus.net/codrops/demos/" className="line">All demos</a>
        </span>
      </footer>
    </main>
  );
}

export default App; 