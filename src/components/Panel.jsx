import React, { useEffect, useRef, useState } from 'react';
import { getElementCenter } from '../utils';
import ExplosionTransition from './ExplosionTransition';

const Panel = ({ isOpen, item, onClose }) => {
  const panelRef = useRef(null);
  const panelImgRef = useRef(null);
  const panelContentRef = useRef(null);
  const [isRight, setIsRight] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [prevImage, setPrevImage] = useState(null);
  const [nextImage, setNextImage] = useState(null);
  const [centerPanel, setCenterPanel] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Reset states when panel is closed
  useEffect(() => {
    if (!isOpen) {
      const cleanup = () => {
        // Show all elements with staggered animation
        document.querySelectorAll('.frame, .heading').forEach(el => {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
        });

        document.querySelectorAll('.grid__item').forEach((el, index) => {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.pointerEvents = 'auto';
            el.style.transform = 'none';
          }, index * 50);
        });

        // Reset panel states
        setCenterPanel(false);
        setContentVisible(false);
        setIsAnimating(false);
      };

      cleanup();
    }
  }, [isOpen]);

  // Handle escape key to close the panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isAnimating) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isAnimating]);

  // Panel open/close logic with explosion transition
  useEffect(() => {
    if (!item) return;
    
    const clickedItemEl = document.querySelector(`[aria-labelledby="caption-${item.id}"]`);
    if (!clickedItemEl) return;
    
    const panel = panelRef.current;
    const panelContent = panelContentRef.current;
    
    // Position panel based on which side the item was clicked
    const centerX = window.innerWidth / 2;
    const itemRect = clickedItemEl.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const isLeftSide = itemCenterX < centerX;
    setIsRight(!isLeftSide);
    
    if (isOpen) {
      setIsAnimating(true);
      setCenterPanel(true);
      
      // Get current and next image URLs for the transition
      const gridItemImage = clickedItemEl.querySelector('.grid__item-image');
      const computedStyle = window.getComputedStyle(gridItemImage);
      const bgImage = computedStyle.backgroundImage;
      
      // Extract URL from background-image style
      const sourceUrl = bgImage.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || '';
      const targetUrl = item.image;
      
      setPrevImage(sourceUrl);
      setNextImage(targetUrl);
      
      // Hide other elements with smooth fade
      document.querySelectorAll('.frame, .heading').forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });
      
      // Hide grid items except clicked item
      document.querySelectorAll('.grid__item').forEach(el => {
        if (el !== clickedItemEl) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        } else {
          setTimeout(() => {
            el.style.opacity = '0';
          }, 100);
        }
      });
      
      setShowTransition(true);
      
    } else if (panel) {
      setIsAnimating(true);
      setContentVisible(false);
      
      if (panelContent) {
        panelContent.style.opacity = '0';
        panelContent.style.transform = 'translateY(20px)';
      }
      
      // Get the current panel image URL and the target grid item image URL
      const gridItemImage = document.querySelector(`[aria-labelledby="caption-${item.id}"] .grid__item-image`);
      if (gridItemImage) {
        const computedStyle = window.getComputedStyle(gridItemImage);
        const targetUrl = computedStyle.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || '';
        
        setPrevImage(item.image);
        setNextImage(targetUrl);
        setShowTransition(true);
      }
    }
  }, [isOpen, item]);

  // Handle completion of the explosion transition
  const handleTransitionComplete = () => {
    setShowTransition(false);
    
    if (isOpen) {
      if (panelRef.current) {
        panelRef.current.classList.add('panel--visible');
      }
      
      // Animate content after panel is visible
      setTimeout(() => {
        if (panelContentRef.current) {
          setContentVisible(true);
        }
        setIsAnimating(false);
      }, 300);
    } else {
      setIsAnimating(false);
    }
  };

  // Handle close button click
  const handleClose = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setContentVisible(false);
      
      if (panelRef.current) {
        panelRef.current.classList.remove('panel--visible');
      }
      
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  if (!item) return null;

  return (
    <>
      {showTransition && prevImage && nextImage && (
        <ExplosionTransition
          currentImage={prevImage}
          nextImage={nextImage}
          isVisible={showTransition}
          onComplete={handleTransitionComplete}
        />
      )}
      
      <div 
        ref={panelRef} 
        className={`panel ${isRight && !centerPanel ? 'panel--right' : ''} ${centerPanel ? 'panel--center' : ''}`}
      >
        <div 
          ref={panelImgRef} 
          className={`panel__img ${centerPanel ? 'panel__img--center' : ''}`}
          style={{ backgroundImage: `url(${item.image})` }}
        ></div>
        <div 
          ref={panelContentRef} 
          className={`panel__content ${centerPanel ? 'panel__content--below' : ''} ${contentVisible ? 'panel__content--visible' : ''}`}
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <button 
            className="panel__close line" 
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default Panel; 