import React, { useRef } from 'react';

const GridItem = ({ item, onClick }) => {
  const itemRef = useRef(null);
  
  // Create an object with only the non-empty data attributes
  const dataAttributes = {};
  
  if (item.config.steps) dataAttributes['data-steps'] = item.config.steps;
  if (item.config.rotationRange) dataAttributes['data-rotation-range'] = item.config.rotationRange;
  if (item.config.stepInterval) dataAttributes['data-step-interval'] = item.config.stepInterval;
  if (item.config.moverPauseBeforeExit) dataAttributes['data-mover-pause-before-exit'] = item.config.moverPauseBeforeExit;
  if (item.config.moverEnterEase) dataAttributes['data-mover-enter-ease'] = item.config.moverEnterEase;
  if (item.config.moverExitEase) dataAttributes['data-mover-exit-ease'] = item.config.moverExitEase;
  if (item.config.panelRevealEase) dataAttributes['data-panel-reveal-ease'] = item.config.panelRevealEase;
  if (item.config.clipPathDirection) dataAttributes['data-clip-path-direction'] = item.config.clipPathDirection;
  if (item.config.moverBlendMode) dataAttributes['data-mover-blend-mode'] = item.config.moverBlendMode;
  if (item.config.pathMotion) dataAttributes['data-path-motion'] = item.config.pathMotion;
  if (item.config.sineAmplitude) dataAttributes['data-sine-amplitude'] = item.config.sineAmplitude;
  if (item.config.sineFrequency) dataAttributes['data-sine-frequency'] = item.config.sineFrequency;
  if (item.config.stepDuration) dataAttributes['data-step-duration'] = item.config.stepDuration;
  if (item.config.panelRevealDurationFactor) dataAttributes['data-panel-reveal-duration-factor'] = item.config.panelRevealDurationFactor;
  if (item.config.clickedItemDurationFactor) dataAttributes['data-clicked-item-duration-factor'] = item.config.clickedItemDurationFactor;
  if (item.config.gridItemStaggerFactor) dataAttributes['data-grid-item-stagger-factor'] = item.config.gridItemStaggerFactor;
  if (item.config.wobbleStrength) dataAttributes['data-wobble-strength'] = item.config.wobbleStrength;
  
  return (
    <figure 
      className="grid__item" 
      role="img" 
      aria-labelledby={`caption-${item.id}`}
      ref={itemRef}
      onClick={() => onClick(item)}
      {...dataAttributes}
    >
      <div 
        className="grid__item-image" 
        style={{ backgroundImage: `url(${item.image})` }}
      ></div>
      <figcaption className="grid__item-caption" id={`caption-${item.id}`}>
        <h3>{item.title}</h3>
      </figcaption>
    </figure>
  );
};

export default GridItem; 