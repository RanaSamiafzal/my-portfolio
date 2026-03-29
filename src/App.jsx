import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import useCursor from './hooks/useCursor';
import useReveal from './hooks/useReveal';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

const Grain = () => <div id="grain-overlay" style={{ pointerEvents: 'none' }}></div>;
const Cursor = () => (
  <>
    <div id="cursor"></div>
    <div id="cursor-follower"></div>
  </>
);

function App() {
  useCursor();
  useReveal();

  return (
    <div className="app-container">
      <Grain />
      <Cursor />
      <Navbar />
      
      <main>
        <Hero />
        <div className="divider"></div>
        <About />
        <div className="divider"></div>
        <Skills />
        <div className="divider"></div>
        <Experience />
        <div className="divider"></div>
        <Projects />
        <div className="divider"></div>
        <Contact />
      </main>

      <Footer />
      <SpeedInsights />
    </div>
  );
}

export default App;
