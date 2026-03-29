import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isOpen ? 'hidden' : 'auto';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <nav style={{ 
      backdropFilter: scrolled || isOpen ? 'blur(20px)' : 'blur(0px)',
      borderBottom: scrolled || isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none'
    }}>
      <a href="#hero" className="nav-logo" onClick={closeMenu}>RS<span>.</span></a>
      <div className={`nav-links-container ${isOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li><a href="#about" onClick={closeMenu}>About</a></li>
          <li><a href="#skills" onClick={closeMenu}>Skills</a></li>
          <li><a href="#experience" onClick={closeMenu}>Experience</a></li>
          <li><a href="#projects" onClick={closeMenu}>Projects</a></li>
          <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
        </ul>
        <a href="mailto:ranasami0909@gmail.com" className="nav-cta mobile-only" onClick={closeMenu}>Hire Me</a>
      </div>

      <a href="mailto:ranasami0909@gmail.com" className="nav-cta desktop-only">Hire Me</a>

      <button className={`menu-toggle ${isOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};

export default Navbar;
