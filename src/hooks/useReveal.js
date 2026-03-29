import { useEffect } from 'react';

const useReveal = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0, 
      rootMargin: "0px 0px -60px 0px" 
    });

    reveals.forEach(el => observer.observe(el));

    // Initial check for elements already in view
    setTimeout(() => {
      reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
    }, 100);

    return () => observer.disconnect();
  }, []);
};

export default useReveal;
