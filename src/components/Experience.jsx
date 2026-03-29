import React from 'react';

const Experience = () => {
  return (
    <section id="experience">
      <div className="section-tag reveal">Work History</div>
      <h2 className="section-title reveal">Experience</h2>
      <p className="section-sub reveal">Professional work that shaped my discipline, creativity, and ability to deliver under real-world pressure.</p>

      <div className="exp-card reveal">
        <div className="exp-header">
          <div>
            <div className="exp-role">Video Editor</div>
            <div className="exp-company">The Wedding Poets · Lahore, Pakistan</div>
          </div>
          <div className="exp-badge">2022 – Present</div>
        </div>
        <ul className="exp-points">
          <li>Edited full cinematic wedding films using Adobe Premiere Pro, After Effects, and Audition — developing a sharp eye for pacing, color grading, and visual narrative.</li>
          <li>Managed end-to-end project timelines handling client briefs, revision cycles, and final delivery for premium wedding clients.</li>
          <li>Collaborated with the creative team on branding, visual storytelling, and social media content strategy, sharpening design instincts applicable to UI/UX.</li>
          <li>Built strong professional habits — deadline discipline, client communication, and iterative feedback loops — directly transferable to software development workflows.</li>
        </ul>
      </div>
    </section>
  );
};

export default Experience;
