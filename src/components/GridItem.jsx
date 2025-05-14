import React, { useRef } from 'react';

const GridItem = ({ item, onClick }) => {
  const itemRef = useRef(null);
  
  return (
    <figure 
      className="grid__item"
      role="img" 
      aria-labelledby={`caption-${item.id}`}
      ref={itemRef}
      onClick={() => onClick(item)}
    >
      <div 
        className="grid__item-image"
        style={{ 
          backgroundImage: `url(${item.image})`,
          backgroundSize: '100%',
          backgroundPosition: '50% 50%'
        }}
      ></div>
      <figcaption className="grid__item-caption" id={`caption-${item.id}`}>
        <h3>{item.title}</h3>
        {item.description && (
          <p>{item.description}</p>
        )}
      </figcaption>
    </figure>
  );
};

export default GridItem; 