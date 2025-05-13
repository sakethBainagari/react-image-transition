import React from 'react';

const Header = () => {
  return (
    <header className="frame flex justify-between pointer-events-none text-[18px] font-medium">
      <h1 className="frame__title m-0 font-medium text-inherit pointer-events-auto">Repeating Image Transition</h1>
      <nav className="frame__links flex gap-2 items-start pointer-events-auto">
        <a className="line" href="https://tympanus.net/codrops/?p=92571">More info,</a>
        <a className="line" href="https://github.com/codrops/RepeatingImageTransition/">Code,</a>
        <a className="line" href="https://tympanus.net/codrops/demos/">All demos</a>
      </nav>
      <nav className="frame__tags flex gap-2 items-start pointer-events-auto">
        <a className="line" href="https://tympanus.net/codrops/demos/?tag=page-transition">page-transition,</a>
        <a className="line" href="https://tympanus.net/codrops/demos/?tag=repetition">repetition,</a>
        <a className="line" href="https://tympanus.net/codrops/demos/?tag=grid">grid</a>
      </nav>
    </header>
  );
};

export default Header; 