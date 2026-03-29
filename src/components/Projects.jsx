import React from 'react';

const Projects = () => {
  const projects = [
    {
      id: "01",
      name: "BrandIN — AI Brand-Influencer Platform",
      desc: "A full-stack platform that seamlessly connects brands with influencers through AI-powered matching algorithms. BrandIN analyzes influencer metrics, audience demographics, and brand requirements to surface the most compatible partnerships — eliminating manual research and guesswork. Built with a focus on scalability, real-time notifications, and a clean dashboard experience for both brands and creators.",
      stack: ["React.js", "Node.js", "MongoDB", "Express.js", "AI Matching", "REST API"],
      links: { github: "https://github.com/RanaSamiafzal", live: "#" },
      featured: true
    },
    {
      id: "02",
      name: "Real-Time Chat Application",
      desc: "A fully functional real-time messaging app built with React and Firebase. Features live message sync, user authentication, and a clean conversational UI.",
      stack: ["React.js", "Firebase", "Firestore", "Auth"],
      links: { github: "https://github.com/RanaSamiafzal", live: "CHAT_LIVE_URL" }
    },
    {
      id: "03",
      name: "Modern Cinematic Portfolio",
      desc: "A premium, immersive personal portfolio built with a focus on rich aesthetics, smooth animations, and mobile-first design. Features a custom grain overlay, dynamic cursor, and scroll-reveal effects.",
      stack: ["HTML5", "Tailwind CSS", "JavaScript", "Cinematic UI"],
      links: { github: "https://github.com/RanaSamiafzal/my-portfolio", live: "https://my-portfolio-peach-three-14.vercel.app/" }
    },
    {
      id: "04",
      name: "Product Registration Form",
      desc: "A full-stack form with client-side and server-side validation. Demonstrates understanding of data flow, form handling, and backend integration.",
      stack: ["Node.js", "Express", "MongoDB", "Validation"],
      links: { github: "https://github.com/RanaSamiafzal", live: "REGISTRATION_LIVE_URL" }
    },
    {
      id: "05",
      name: "Rock-Paper-Scissors & Tic-Tac-Toe",
      desc: "Logic-based browser games built in pure JavaScript. A showcase of clean game-state management, DOM manipulation, and interactive UX thinking.",
      stack: ["JavaScript", "HTML5", "CSS3", "Game Logic"],
      links: { github: "https://github.com/RanaSamiafzal", live: "GAMES_LIVE_URL" }
    },
    {
      id: "06",
      name: "SpendWise — Finance Dashboard",
      desc: "A modern personal finance dashboard to track income & expenses, set budgets, and gain AI-powered insights into spending habits. Features interactive charts, transaction management, and responsive design.",
      stack: ["React.js", "Genkit AI", "Firebase", "Charts", "Budget Tracking"],
      links: { github: "https://github.com/RanaSamiafzal", live: "SPENDWISE_LIVE_URL" }
    }
  ];

  return (
    <section id="projects">
      <div className="section-tag reveal">What I've Built</div>
      <h2 className="section-title reveal">Projects</h2>
      <p className="section-sub reveal">From AI-powered platforms to real-time apps — each project is a problem solved with clean code and intention.</p>
      
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div className={`project-card ${project.featured ? 'featured' : ''} reveal`} key={index}>
            <div className="project-content">
              {project.featured && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <div className="featured-badge">Final Year Project (Current)</div>
                    <div className="project-num">{project.id} ——————</div>
                    <h3 className="project-name">{project.name}</h3>
                    <p className="project-desc">{project.desc}</p>
                    <div className="project-stack">
                      {project.stack.map((item, iIndex) => (
                        <span className="project-tag" key={iIndex}>{item}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="project-link">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                        View on GitHub
                      </a>
                      <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="project-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                        Live Demo (Soon)
                      </a>
                    </div>
                  </div>
                  <div className="featured-code-snippet" style={{ background: 'rgba(255,107,43,0.05)', border: '1px solid rgba(255,107,43,0.15)', borderRadius: '12px', padding: '28px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: '1.8', color: 'var(--muted2)', flex: '1', minWidth: '300px' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>// BrandIN Architecture</div>
                    <div><span style={{ color: '#6272a4' }}>const</span> <span style={{ color: 'var(--text)' }}>BrandIN</span> = {'{'}</div>
                    <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--accent2)' }}>matching</span>: <span style={{ color: '#98c379' }}>"AI Algorithm"</span>,</div>
                    <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--accent2)' }}>frontend</span>: <span style={{ color: '#98c379' }}>"React + Redux"</span>,</div>
                    <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--accent2)' }}>backend</span>: <span style={{ color: '#98c379' }}>"Node + Express"</span>,</div>
                    <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--accent2)' }}>database</span>: <span style={{ color: '#98c379' }}>"MongoDB"</span>,</div>
                    <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--accent2)' }}>status</span>: <span style={{ color: '#e5c07b' }}>"In Progress"</span></div>
                    <div>{'}'};</div>
                    <br />
                    <div><span style={{ color: '#6272a4' }}>// Connecting brands to</span></div>
                    <div><span style={{ color: '#6272a4' }}>// the right voice 🚀</span></div>
                  </div>
                </div>
              )}
              
              {!project.featured && (
                <>
                  <div className="project-num">{project.id} ——</div>
                  <h3 className="project-name">{project.name}</h3>
                  <p className="project-desc">{project.desc}</p>
                  <div className="project-stack">
                    {project.stack.map((item, iIndex) => (
                      <span className="project-tag" key={iIndex}>{item}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                      GitHub
                    </a>
                    <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="project-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                      Live Demo
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
