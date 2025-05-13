import React from 'react';
import GridItem from './GridItem';

const Section = ({ title, subtitle, items, onItemClick }) => {
  return (
    <>
      <div className="heading">
        <h2 className="heading__title">{title}</h2>
        <span className="heading__meta">{subtitle}</span>
      </div>
      
      <div className="grid">
        {items.map(item => (
          <GridItem 
            key={item.id}
            item={item} 
            onClick={onItemClick}
          />
        ))}
      </div>
    </>
  );
};

export default Section; 