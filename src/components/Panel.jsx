import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getElementCenter } from '../utils';

// Default animation configuration
const defaultConfig = {
  clipPathDirection: 'bottom-top',
  autoAdjustHorizontalClipPath: true,
  steps: 6,
  stepDuration: 0.35,
  stepInterval: 0.05,
  moverPauseBeforeExit: 0.14,
  rotationRange: 0,
  wobbleStrength: 0,
  panelRevealEase: 'sine.inOut',
  gridItemEase: 'sine',
  moverEnterEase: 'sine.in',
  moverExitEase: 'sine',
  panelRevealDurationFactor: 2,
  clickedItemDurationFactor: 2,
  gridItemStaggerFactor: 0.3,
  moverBlendMode: false,
  pathMotion: 'linear',
  sineAmplitude: 50,
  sineFrequency: Math.PI,
};

const Panel = ({ isOpen, item, onClose }) => {
  const panelRef = useRef(null);
  const panelImgRef = useRef(null);
  const panelContentRef = useRef(null);
  const moverContainerRef = useRef(null);
  const [isRight, setIsRight] = useState(false);
  const [animationConfig, setAnimationConfig] = useState(defaultConfig);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Update animation config when a new item is selected
  useEffect(() => {
    if (item) {
      setAnimationConfig({
        ...defaultConfig,
        ...item.config
      });
    }
  }, [item]);

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

  // Animation logic when panel opens/closes
  useEffect(() => {
    if (!item) return;
    
    const clickedItemEl = document.querySelector(`[aria-labelledby="caption-${item.id}"]`);
    if (!clickedItemEl) return;
    
    const clickedItemImage = clickedItemEl.querySelector('.grid__item-image');
    const panelImg = panelImgRef.current;
    const panelContent = panelContentRef.current;
    const moverContainer = moverContainerRef.current;
    
    // First, determine which side of the screen the item was clicked on
    const centerX = getElementCenter(clickedItemEl).x;
    const windowHalf = window.innerWidth / 2;
    const isRightSide = centerX < windowHalf;
    setIsRight(isRightSide);
    
    // Prepare animation settings
    let config = { ...animationConfig };
    
    // Adjust clip path direction based on which side the panel opens
    if (config.autoAdjustHorizontalClipPath) {
      if (
        config.clipPathDirection === 'left-right' ||
        config.clipPathDirection === 'right-left'
      ) {
        config.clipPathDirection = isRightSide ? 'left-right' : 'right-left';
      }
    }
    
    if (isOpen) {
      setIsAnimating(true);
      
      // Create animation timeline with proper callbacks
      const tl = gsap.timeline({
        onComplete: () => setIsAnimating(false)
      });
      
      // Get clip paths for animation
      const clipPaths = getClipPathsForDirection(config.clipPathDirection);
      
      // Animate the clicked item out
      tl.to(clickedItemImage, { 
        opacity: 0, 
        duration: 0.4 * config.clickedItemDurationFactor,
        ease: config.gridItemEase
      }, 0);
      
      // Create mover elements that move between the clicked item and panel
      const clickedRect = clickedItemEl.getBoundingClientRect();
      const panelImgRect = panelImg.getBoundingClientRect();
      
      // Generate path points
      const pathPoints = generateMotionPath(clickedRect, panelImgRect, config.steps, config);
      
      // Create and animate movers
      for (let i = 0; i < config.steps; i++) {
        // Create mover element
        const mover = document.createElement('div');
        mover.className = 'mover';
        mover.style.backgroundImage = `url(${item.image})`;
        mover.style.width = `${clickedRect.width}px`;
        mover.style.height = `${clickedRect.height}px`;
        mover.style.backgroundSize = 'cover';
        mover.style.clipPath = clipPaths.from; // Set initial clip path
        
        if (config.moverBlendMode) {
          mover.style.mixBlendMode = config.moverBlendMode;
        }
        
        // Apply random rotation if configured
        const randomRotation = config.rotationRange > 0 
          ? (Math.random() - 0.5) * config.rotationRange 
          : 0;
          
        mover.style.transform = `translate(${clickedRect.left}px, ${clickedRect.top}px) rotateZ(${randomRotation}deg)`;
        
        // Add mover to container
        moverContainer.appendChild(mover);
        
        // Animate mover - reveal
        tl.to(mover, {
          clipPath: clipPaths.reveal,
          duration: config.stepDuration,
          ease: config.moverEnterEase,
        }, i * config.stepInterval);
        
        // Move mover along path
        tl.to(mover, {
          transform: `translate(${pathPoints[i].x}px, ${pathPoints[i].y}px) rotateZ(${randomRotation}deg)`,
          duration: config.stepDuration,
          ease: 'none',
        }, i * config.stepInterval);
        
        // Pause before exit animation
        tl.to({}, { duration: config.moverPauseBeforeExit });
        
        // Exit animation for mover
        tl.to(mover, {
          clipPath: clipPaths.hide,
          duration: config.stepDuration,
          ease: config.moverExitEase,
          onComplete: () => {
            // Clean up movers after animation completes
            if (moverContainer.contains(mover)) {
              moverContainer.removeChild(mover);
            }
          }
        }, i * config.stepInterval + config.stepDuration + config.moverPauseBeforeExit);
      }
      
      // Reveal the panel
      tl.fromTo(panelImg, 
        { 
          clipPath: clipPaths.from,
          backgroundImage: `url(${item.image})` 
        },
        {
          clipPath: clipPaths.reveal,
          duration: config.stepDuration * config.panelRevealDurationFactor,
          ease: config.panelRevealEase
        }, 
        config.steps * config.stepInterval
      );
      
      // Animate panel content in
      tl.fromTo(panelContent,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        config.steps * config.stepInterval + 0.2
      );
      
      // Hide other grid items with staggered timing, exactly as in the original
      const gridItems = document.querySelectorAll('.grid__item');
      const staggerDelays = computeStaggerDelays(clickedItemEl, Array.from(gridItems));
      
      gridItems.forEach((gridItem, index) => {
        if (gridItem !== clickedItemEl) {
          tl.to(gridItem, { 
            opacity: 0, 
            y: 20, 
            duration: 0.4, 
            ease: 'power1.out' 
          }, staggerDelays[index]);
        }
      });
      
      // Hide header
      tl.to('.frame, .heading', { 
        opacity: 0, 
        duration: 0.5,
        ease: 'sine.inOut',
        pointerEvents: 'none'
      }, 0);
      
    } else if (panelRef.current) {
      setIsAnimating(true);
      
      // Reverse animation when closing
      const tl = gsap.timeline({
        onComplete: () => setIsAnimating(false)
      });
      
      // Get clip paths for animation
      const clipPaths = getClipPathsForDirection(config.clipPathDirection);
      
      // Hide panel content first
      tl.to(panelContent, {
        opacity: 0, 
        y: 30, 
        duration: 0.4, 
        ease: 'power2.in'
      }, 0);
      
      // Animate panel out
      tl.to(panelImg, {
        clipPath: clipPaths.hide,
        duration: config.stepDuration * config.panelRevealDurationFactor,
        ease: config.panelRevealEase
      }, 0.2);
      
      // Show grid items again with staggered timing
      const gridItems = document.querySelectorAll('.grid__item');
      
      gridItems.forEach((gridItem, index) => {
        const delay = 0.6 + Math.random() * config.gridItemStaggerFactor;
        tl.to(gridItem, { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power1.out' 
        }, delay);
      });
      
      // Show header again
      tl.to('.frame, .heading', { 
        opacity: 1, 
        duration: 0.5,
        ease: 'sine.inOut',
        pointerEvents: 'auto'
      }, 0.6);
      
      // Clean up any remaining movers
      tl.call(() => {
        while (moverContainer.firstChild) {
          moverContainer.removeChild(moverContainer.firstChild);
        }
      });
    }
  }, [isOpen, item, animationConfig]);

  if (!item) return null;

  return (
    <>
      <div ref={moverContainerRef} className="movers-container"></div>
      <div 
        ref={panelRef} 
        className={`panel ${isRight ? 'panel--right' : ''}`} 
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div 
          ref={panelImgRef} 
          className="panel__img" 
          style={{ backgroundImage: item ? `url(${item.image})` : 'none' }}
        ></div>
        <div ref={panelContentRef} className="panel__content">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <a href="#" className="panel__close line" onClick={(e) => { 
            e.preventDefault(); 
            if (!isAnimating) onClose(); 
          }}>
            Close
          </a>
        </div>
      </div>
    </>
  );
};

// Helper function to compute stagger delays based on distance from clicked item
const computeStaggerDelays = (clickedItem, items) => {
  const clickedCenter = getElementCenter(clickedItem);
  const maxDistance = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);
  
  return items.map(item => {
    if (item === clickedItem) return 0;
    
    const itemCenter = getElementCenter(item);
    const dx = itemCenter.x - clickedCenter.x;
    const dy = itemCenter.y - clickedCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize distance to 0-1 range and scale to a reasonable delay value
    return (distance / maxDistance) * 0.3; // Max 0.3s delay based on distance
  });
};

// Helper function to get appropriate clip-paths based on direction
const getClipPathsForDirection = (direction) => {
  switch (direction) {
    case 'bottom-top':
      return {
        from: 'inset(0% 0% 100% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(100% 0% 0% 0%)',
      };
    case 'left-right':
      return {
        from: 'inset(0% 100% 0% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 0% 0% 100%)',
      };
    case 'right-left':
      return {
        from: 'inset(0% 0% 0% 100%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 100% 0% 0%)',
      };
    case 'top-bottom':
    default:
      return {
        from: 'inset(100% 0% 0% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 0% 100% 0%)',
      };
  }
};

// Helper function to generate motion path points
const generateMotionPath = (startRect, endRect, steps, config) => {
  const points = [];
  
  for (let i = 0; i < steps; i++) {
    // Calculate progress (0 to 1)
    const progress = i / (steps - 1);
    
    // Calculate base position with linear interpolation
    let x = startRect.left + (endRect.left - startRect.left) * progress;
    let y = startRect.top + (endRect.top - startRect.top) * progress;
    
    // Add sine wave motion for non-linear path if configured
    if (config.pathMotion === 'sine') {
      const amplitude = config.sineAmplitude || 50;
      const frequency = config.sineFrequency || Math.PI;
      
      // Apply sine wave to y position
      y += Math.sin(progress * frequency) * amplitude;
    }
    
    // Add random "wobble" if configured
    if (config.wobbleStrength > 0) {
      x += (Math.random() - 0.5) * config.wobbleStrength;
      y += (Math.random() - 0.5) * config.wobbleStrength;
    }
    
    points.push({ x, y });
  }
  
  return points;
};

export default Panel; 