import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getElementCenter } from '../utils';

// Default animation configuration - matching sample_code exactly
const defaultConfig = {
  clipPathDirection: 'top-bottom',
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

// Create a deep copy of the initial config, just like sample_code
const originalConfig = { ...defaultConfig };

// Linear interpolation helper - identical to sample_code
const lerp = (a, b, t) => a + (b - a) * t;

// Helper function to get appropriate clip-paths based on direction
// Identical to sample_code implementation
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

// Helper function to compute stagger delays based on distance
// Identical to sample_code implementation
const computeStaggerDelays = (clickedItem, items) => {
  if (!clickedItem) return Array(items.length).fill(0);
  
  const baseCenter = getElementCenter(clickedItem);
  const distances = items.map((el) => {
    if (el === clickedItem) return 0;
    
    const center = getElementCenter(el);
    return Math.hypot(center.x - baseCenter.x, center.y - baseCenter.y);
  });
  
  // Normalize to max distance like in sample_code
  const max = Math.max(...distances);
  return distances.map((d) => (d / max) * defaultConfig.gridItemStaggerFactor);
};

// Create mover style exactly like sample_code's createMoverStyle function
const createMoverStyle = (step, index, imgURL, clipPathDirection, rotationRange, moverBlendMode) => {
  const style = {
    backgroundImage: imgURL,
    position: 'fixed',
    left: step.left + 'px',
    top: step.top + 'px',
    width: step.width + 'px',
    height: step.height + 'px',
    clipPath: getClipPathsForDirection(clipPathDirection).from,
    zIndex: 1000 + index,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    rotationZ: gsap.utils.random(-rotationRange, rotationRange),
  };
  
  if (moverBlendMode) {
    style.mixBlendMode = moverBlendMode;
  }
  
  return style;
};

// Generate motion path between start and end elements
// Identical to sample_code implementation
const generateMotionPath = (startRect, endRect, steps, config) => {
  const path = [];
  const fullSteps = steps + 2;
  const startCenter = {
    x: startRect.left + startRect.width / 2,
    y: startRect.top + startRect.height / 2,
  };
  const endCenter = {
    x: endRect.left + endRect.width / 2,
    y: endRect.top + endRect.height / 2,
  };

  for (let i = 0; i < fullSteps; i++) {
    const t = i / (fullSteps - 1);
    const width = lerp(startRect.width, endRect.width, t);
    const height = lerp(startRect.height, endRect.height, t);
    const centerX = lerp(startCenter.x, endCenter.x, t);
    const centerY = lerp(startCenter.y, endCenter.y, t);

    // Apply sine motion if configured
    const sineOffset =
      config.pathMotion === 'sine'
        ? Math.sin(t * config.sineFrequency) * config.sineAmplitude
        : 0;

    // Add random wobble
    const wobbleX = (Math.random() - 0.5) * config.wobbleStrength;
    const wobbleY = (Math.random() - 0.5) * config.wobbleStrength;

    path.push({
      left: centerX - width / 2 + wobbleX,
      top: centerY - height / 2 + sineOffset + wobbleY,
      width,
      height,
    });
  }

  return path.slice(1, -1);
};

const Panel = ({ isOpen, item, onClose }) => {
  const panelRef = useRef(null);
  const panelImgRef = useRef(null);
  const panelContentRef = useRef(null);
  const moverContainerRef = useRef(null);
  const [isRight, setIsRight] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [config, setConfig] = useState(defaultConfig);

  // Update animation config when a new item is selected
  useEffect(() => {
    if (item && item.config) {
      // Merge item config with default - exactly like sample_code
      setConfig({
        ...defaultConfig,
        ...item.config
      });
    } else {
      setConfig(defaultConfig);
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
    const panel = panelRef.current;
    const panelImg = panelImgRef.current;
    const panelContent = panelContentRef.current;
    const moverContainer = moverContainerRef.current;
    
    // Position panel based on which side the item was clicked
    const centerX = getElementCenter(clickedItemEl).x;
    const windowHalf = window.innerWidth / 2;
    const isLeftSide = centerX < windowHalf;
    setIsRight(!isLeftSide);
    
    // Auto-adjust clip path direction - exactly like sample_code
    let configClone = { ...config };
    if (configClone.autoAdjustHorizontalClipPath) {
      if (
        configClone.clipPathDirection === 'left-right' ||
        configClone.clipPathDirection === 'right-left'
      ) {
        configClone.clipPathDirection = isLeftSide ? 'left-right' : 'right-left';
      }
    }
    
    if (isOpen) {
      setIsAnimating(true);
      
      // 1. HIDE FRAME - exactly like hideFrame() in sample_code
      gsap.to(['.frame', '.heading'], {
        opacity: 0,
        duration: 0.5,
        ease: 'sine.inOut',
        pointerEvents: 'none',
      });
      
      // 2. ANIMATE GRID ITEMS - exactly like sample_code's animateGridItems()
      const gridItems = document.querySelectorAll('.grid__item');
      const delays = computeStaggerDelays(clickedItemEl, Array.from(gridItems));
      const clipPaths = getClipPathsForDirection(configClone.clipPathDirection);
      
      gsap.to(gridItems, {
        opacity: (i, el) => (el === clickedItemEl ? 1 : 0),
        scale: (i, el) => (el === clickedItemEl ? 1 : 0.8),
        duration: (i, el) =>
          el === clickedItemEl
            ? configClone.stepDuration * configClone.clickedItemDurationFactor
            : 0.3,
        ease: configClone.gridItemEase,
        clipPath: (i, el) => (el === clickedItemEl ? clipPaths.from : 'none'),
        delay: (i) => delays[i],
      });
      
      // 3. ANIMATE TRANSITION - exactly like sample_code's animateTransition()
      
      // Generate path between clicked item and panel
      const path = generateMotionPath(
        clickedItemImage.getBoundingClientRect(),
        panelImg.getBoundingClientRect(),
        configClone.steps,
        configClone
      );
      
      // Clean existing movers first - important for proper cleanup
      while (moverContainer.firstChild) {
        moverContainer.removeChild(moverContainer.firstChild);
      }
      
      // Create document fragment for batch insertion - exactly like sample_code
      const fragment = document.createDocumentFragment();
      
      // Create and animate movers - identical to sample_code
      path.forEach((step, index) => {
        const mover = document.createElement('div');
        mover.className = 'mover';
        
        // Set initial mover style using gsap.set exactly like sample_code
        gsap.set(mover, createMoverStyle(
          step, 
          index, 
          `url(${item.image})`,
          configClone.clipPathDirection,
          configClone.rotationRange,
          configClone.moverBlendMode
        ));
        
        fragment.appendChild(mover);
        
        // Animate mover - identical to sample_code
        const delay = index * configClone.stepInterval;
        gsap
          .timeline({ delay })
          .fromTo(
            mover,
            { opacity: 0.4, clipPath: clipPaths.hide },
            {
              opacity: 1,
              clipPath: clipPaths.reveal,
              duration: configClone.stepDuration,
              ease: configClone.moverEnterEase,
            }
          )
          .to(
            mover,
            {
              clipPath: clipPaths.from,
              duration: configClone.stepDuration,
              ease: configClone.moverExitEase,
            },
            `+=${configClone.moverPauseBeforeExit}`
          );
      });
      
      // Add all movers to the DOM at once - exactly like sample_code
      moverContainer.appendChild(fragment);
      
      // Schedule mover cleanup - exactly like sample_code's scheduleCleanup()
      const cleanupDelay =
        configClone.steps * configClone.stepInterval +
        configClone.stepDuration * 2 +
        configClone.moverPauseBeforeExit;
        
      gsap.delayedCall(cleanupDelay, () => {
        const movers = moverContainer.querySelectorAll('.mover');
        movers.forEach(m => m.remove());
      });
      
      // 4. REVEAL PANEL - exactly like sample_code's revealPanel()
      gsap.set(panelContent, { opacity: 0 });
      gsap.set(panel, { opacity: 1, pointerEvents: 'auto' });
      
      gsap
        .timeline({
          defaults: {
            duration: configClone.stepDuration * configClone.panelRevealDurationFactor,
            ease: configClone.panelRevealEase,
          },
          onComplete: () => {
            setIsAnimating(false);
          }
        })
        .fromTo(
          panelImg,
          { clipPath: clipPaths.hide },
          {
            clipPath: clipPaths.reveal,
            pointerEvents: 'auto',
            delay: configClone.steps * configClone.stepInterval,
          }
        )
        .fromTo(
          panelContent,
          { y: 25 },
          {
            duration: 1,
            ease: 'expo',
            opacity: 1,
            y: 0,
          },
          '<-=.2'
        );
        
    } else if (panel) {
      // RESET VIEW - exactly like resetView() in sample_code
      setIsAnimating(true);
      
      const gridItems = document.querySelectorAll('.grid__item');
      const delays = computeStaggerDelays(clickedItemEl, Array.from(gridItems));
      
      gsap
        .timeline({
          defaults: { duration: configClone.stepDuration, ease: 'expo' },
          onComplete: () => {
            setIsAnimating(false);
          },
        })
        .to(panel, { opacity: 0 })
        .add(() => {
          // Show frame - identical to showFrame() in sample_code
          gsap.to(['.frame', '.heading'], {
            opacity: 1,
            duration: 0.5,
            ease: 'sine.inOut',
            pointerEvents: 'auto',
          });
        }, 0)
        .set(panel, { opacity: 0, pointerEvents: 'none' })
        .set(panelImg, {
          clipPath: 'inset(0% 0% 100% 0%)',
        })
        .set(gridItems, { clipPath: 'none', opacity: 0, scale: 0.8 }, 0)
        .to(
          gridItems,
          {
            opacity: 1,
            scale: 1,
            delay: (i) => delays[i],
          },
          '>'
        );
        
      // Clean up any remaining movers
      const movers = moverContainer.querySelectorAll('.mover');
      movers.forEach(m => m.remove());
      
      // Reset config - identical to sample_code
      Object.assign(config, originalConfig);
    }
  }, [isOpen, item, config]);

  if (!item) return null;

  return (
    <>
      <div ref={moverContainerRef} className="movers-container"></div>
      <div 
        ref={panelRef} 
        className={`panel ${isRight ? 'panel--right' : ''}`}
        style={{ opacity: 0 }}
      >
        <div 
          ref={panelImgRef} 
          className="panel__img"
          style={{ backgroundImage: `url(${item.image})` }}
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

export default Panel; 