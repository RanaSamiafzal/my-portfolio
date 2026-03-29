import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{ 
      backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none'
    }}>
      <a href="#hero" className="nav-logo">RS<span>.</span></a>
      <ul className="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="mailto:ranasami0909@gmail.com" className="nav-cta">Hire Me</a>
    </nav>
  );
};

export default Navbar;
