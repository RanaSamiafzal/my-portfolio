import { useState, useEffect } from 'react';

const useTypewriter = (words, loop = true, typeSpeed = 70, deleteSpeed = 40, delayTime = 2000) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleType = () => {
      const currentWord = words[index];
      if (isDeleting) {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
      } else {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
      }

      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), delayTime);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleType, isDeleting ? deleteSpeed : typeSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, words, typeSpeed, deleteSpeed, delayTime]);

  return displayText;
};

export default useTypewriter;
