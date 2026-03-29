import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ranasami0909@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <section id="contact">
      <div className="section-tag reveal">Get in Touch</div>
      <h2 className="section-title reveal">Let's Work<br />Together</h2>
      <p className="section-sub reveal">Open to internships, junior developer roles, and freelance collaborations. Let's build something great.</p>

      <div className="contact-wrap">
        <div className="contact-info reveal">
          <a href="mailto:ranasami0909@gmail.com" className="contact-item">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <div>
              <div className="contact-label">Email</div>
              <div className="contact-val">ranasami0909@gmail.com</div>
            </div>
          </a>
          <a href="tel:+923215594873" className="contact-item">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.12 1.18 2 2 0 012.12 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
            </div>
            <div>
              <div className="contact-label">Phone</div>
              <div className="contact-val">+92-321-5594873</div>
            </div>
          </a>
          <a href="https://www.linkedin.com/in/ranasamiafzal/" target="_blank" rel="noopener noreferrer" className="contact-item">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </div>
            <div>
              <div className="contact-label">LinkedIn</div>
              <div className="contact-val">ranasamiafzal</div>
            </div>
          </a>
          <div className="contact-item" style={{ cursor: 'default' }}>
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div>
              <div className="contact-label">Location</div>
              <div className="contact-val">Lahore, Pakistan</div>
            </div>
          </div>
        </div>

        <form className="contact-form reveal" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="john@company.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input 
              type="text" 
              name="subject"
              className="form-input" 
              placeholder="Internship Opportunity / Project Collab" 
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea 
              name="message"
              className="form-textarea" 
              placeholder="Tell me about the role or project..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="form-submit">Send Message →</button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
