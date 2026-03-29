import React from 'react';

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend Development",
      icon: "⚛️",
      skills: ["React.js", "Next.js", "JavaScript", "HTML5", "CSS3", "Redux Toolkit"]
    },
    {
      title: "Backend Development",
      icon: "🔧",
      skills: ["Node.js", "Express.js", "REST API", "Firebase", "MongoDB"]
    },
    {
      title: "Database & Cloud",
      icon: "🗄️",
      skills: ["MongoDB", "Firebase", "Google Stitch", "REST API"]
    },
    {
      title: "Creative & Design",
      icon: "🎨",
      skills: ["Adobe Premiere Pro", "After Effects", "Photoshop", "Audition", "Figma"]
    },
    {
      title: "Tools & Workflow",
      icon: "🛠️",
      skills: ["Git & GitHub", "VS Code", "Antigravity", "Figma"]
    }
  ];

  return (
    <section id="skills">
      <div className="section-tag reveal">What I Know</div>
      <h2 className="section-title reveal">Skills & Stack</h2>
      <p className="section-sub reveal">A full-stack toolkit forged through real projects, formal training, and an obsession with building things that work.</p>

      <div className="skills-grid">
        {skillCategories.map((category, index) => (
          <div className="skill-card reveal" key={index}>
            <div className="skill-card-icon">{category.icon}</div>
            <h3 className="skill-card-title">{category.title}</h3>
            <div className="skill-tags">
              {category.skills.map((skill, sIndex) => (
                <span className="skill-tag" key={sIndex}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
