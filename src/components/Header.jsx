import React from 'react';

const Header = () => {
  return (
    <header className="frame">
      <div className="frame__title-wrap">
        <h1 className="frame__title">repeating image transition</h1>
      </div>
      <div className="frame__links-wrap">
      <nav className="frame__links">
          <a className="line" href="#">more info,</a>
          <a className="line" href="#">code,</a>
          <a className="line" href="#">all demos</a>
      </nav>
      </div>
      <div className="frame__tags-wrap">
      <nav className="frame__tags">
          <a className="line" href="#">page-transition,</a>
          <a className="line" href="#">repetition,</a>
          <a className="line" href="#">grid</a>
      </nav>
      </div>
    </header>
  );
};

export default Header; 