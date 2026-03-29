import React from 'react';
import useTypewriter from '../hooks/useTypewriter';
import profileImg from '../assets/p4.jpg';

const Hero = () => {
  const titles = [
    'Full Stack Developer & Creative Technologist',
    'MERN Stack Engineer',
    'AI Enthusiast & Builder',
    'Cinematic Developer',
  ];
  const typingText = useTypewriter(titles);

  return (
    <section id="hero">
      <div className="hero-bg-glow"></div>
      <div className="hero-bg-lines"></div>

      <div className="hero-left">
        <div className="hero-tag">Available for Opportunities</div>
        <h1 className="hero-name">
          Rana Muhammad <span className="accent">Sami.</span>
        </h1>
        <div className="hero-title">{typingText}</div>
        <p className="hero-desc">
          Building <strong>scalable web applications</strong> with the MERN stack while blending a cinematic eye from years of creative production. I turn complex problems into <span className="highlight">elegant digital experiences</span>.
        </p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            View My Work
          </a>
          <a href="#contact" className="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Get in Touch
          </a>
        </div>
        <div className="hero-stats reveal reveal-delay-2">
          <div className="stat-item">
            <span className="stat-num">8th</span>
            <span className="stat-label">Semester</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">4+</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">Fresher</span>
            <span className="stat-label">Experience</span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-img-wrap">
          <div className="hero-img-bg"></div>
          <div className="hero-img-card card-1">
            <div className="card-label">Status</div>
            <div className="card-val"><span className="card-dot"></span>Open to Work</div>
          </div>
          <div className="hero-img-card card-2">
            <div className="card-label">Stack</div>
            <div className="card-val">MERN &amp; Next.js</div>
          </div>
          <img src={profileImg} alt="Rana Muhammad Sami" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
