import React, { useState, useEffect } from 'react';

const useCursor = () => {
  useEffect(() => {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    if (!cursor || !follower) return;

    let mx = -100, my = -100, fx = -100, fy = -100;
    let cursorVisible = false;

    const onMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = `${mx - 6}px`;
      cursor.style.top = `${my - 6}px`;
      
      if (!cursorVisible) {
        cursorVisible = true;
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    };

    const onMouseEnter = () => {
      if (cursorVisible) {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let rafId;
    const animateFollower = () => {
      fx += (mx - fx - 18) * 0.1;
      fy += (my - fy - 18) * 0.1;
      follower.style.left = `${fx}px`;
      follower.style.top = `${fy}px`;
      rafId = requestAnimationFrame(animateFollower);
    };
    animateFollower();

    const handleMouseEnter = () => {
      cursor.style.transform = 'scale(2.5)';
      follower.style.transform = 'scale(1.4)';
      follower.style.opacity = '0.4';
    };

    const handleMouseLeaveLink = () => {
      cursor.style.transform = 'scale(1)';
      follower.style.transform = 'scale(1)';
      follower.style.opacity = '1';
    };

    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeaveLink);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeaveLink);
      });
      cancelAnimationFrame(rafId);
    };
  }, []);
};

export default useCursor;
