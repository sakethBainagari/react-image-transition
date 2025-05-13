import { useState, useEffect } from 'react';
import { preloadImages } from './utils';
import imagesLoaded from 'imagesloaded';
import './styles.css';
import Header from './components/Header';
import Section from './components/Section';
import Panel from './components/Panel';
import gsap from 'gsap';

// Import the data
import { section1Data, section2Data } from './data';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Remove loading class once images are loaded
  useEffect(() => {
    // Make imagesLoaded globally available for our utils
    window.imagesLoaded = imagesLoaded;
    
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Preload all background images and regular images
    Promise.all([
      preloadImages('.grid__item-image'), // Grid images
      preloadImages('img')                // Any regular images
    ]).then(() => {
      // Remove loading class and update state
      document.body.classList.remove('loading');
      setLoading(false);
      
      // Add brief delay for a smoother initial reveal
      setTimeout(() => {
        document.querySelectorAll('.grid__item').forEach((item, index) => {
          // Stagger the initial appearance of grid items
          gsap.fromTo(item, 
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.6,
              delay: index * 0.05,
              ease: 'power1.out' 
            }
          );
        });
      }, 400);
    }).catch(error => {
      console.error('Error preloading images:', error);
      // Remove loading class even on error
      document.body.classList.remove('loading');
      setLoading(false);
    });
  }, []);

  const handleItemClick = (item) => {
    if (isPanelOpen || isAnimating) return;
    setCurrentItem(item);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    if (isAnimating) return; 
    setIsPanelOpen(false);
    // Add a small delay before clearing the current item
    // to allow for smooth animation
    setTimeout(() => {
    setCurrentItem(null);
    }, 500);
  };

  if (loading) {
    return null; // Show nothing while loading, body has loading indicators
  }

  return (
    <main>
      <Header />
      
      <Section 
        title="SHANE WEBER" 
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

      <Panel 
        isOpen={isPanelOpen} 
        item={currentItem} 
        onClose={handlePanelClose} 
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating} 
      />
    </main>
  );
}

export default App; 