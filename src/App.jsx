import React, { useState, useEffect } from 'react';
import { preloadImages } from './utils';
import imagesLoaded from 'imagesloaded';
import './styles.css';
import Header from './components/Header';
import Section from './components/Section';
import Panel from './components/Panel';

// Import the data for all grid sections
import { section1Data, section2Data, section3Data } from './data';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-boundary">Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  // Initial loading sequence without animations
  useEffect(() => {
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Preload all images
    preloadImages('.grid__item-image, .panel__img')
      .then(() => {
        // Remove loading class and update state
        document.body.classList.remove('loading');
        setLoading(false);
        
        // Show all grid items immediately
        document.querySelectorAll('.grid__item').forEach(item => {
          item.style.opacity = 1;
          item.style.scale = 1;
        });
      })
      .catch(error => {
        console.error('Error preloading images:', error);
        setError('Failed to load images. Please refresh the page.');
        document.body.classList.remove('loading');
        setLoading(false);
      });

    // Cleanup function
    return () => {
      document.body.classList.remove('loading');
    };
  }, []);

  // Handle item click
  const handleItemClick = (item) => {
    if (isPanelOpen || isAnimating) return;
    setCurrentItem(item);
    setIsPanelOpen(true);
  };

  // Handle panel close with cleanup
  const handlePanelClose = () => {
    if (isAnimating) return;
    setIsPanelOpen(false);
    setCurrentItem(null);
  };

  // Show loading state
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Show error state
  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App; 