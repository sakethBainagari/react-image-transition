import React from 'react';
import GridItem from './GridItem';

const Section = ({ title, subtitle, items, onItemClick }) => {
  return (
    <>
      <div className="heading flex flex-wrap items-end justify-between gap-4 my-40">
        <h2 className="heading__title font-semibold uppercase m-0 text-[clamp(2rem,10vw,6rem)] leading-[0.77]">{title}</h2>
        <span className="heading__meta">
          {subtitle}
        </span>
      </div>
      
      <div className="grid py-4 grid-cols-[repeat(var(--column-count),minmax(var(--column),1fr))] gap-x-[var(--c-gap)] gap-y-20">
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