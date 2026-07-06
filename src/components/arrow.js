export function initializeArrow() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const container = document.querySelector('.datamotion-container');
  const countDeals = document.getElementById('count-deals');
  const countVolume = document.getElementById('count-volume');
  if (!container || !countDeals || !countVolume) return;

  // Hilfsfunktion: Zählt Zahlen hoch
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing out für flüssigeres Stoppen
      const easeOut = 1 - Math.pow(1 - progress, 3);
      obj.innerHTML = Math.floor(easeOut * (end - start) + start);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Observer prüft, ob die Sektion im Sichtfeld ist
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // CSS Animationen starten
        container.classList.add('is-animated');
        
        // 1. Zähler links startet sofort
        animateValue(countDeals, 0, 2, 800);
        
        // 2. Zähler rechts startet verzögert (wenn der Pfeil ankommt)
        setTimeout(() => {
          animateValue(countVolume, 0, 17, 1200);
        }, 1200);

        // Observer beenden, damit es nur einmal abspielt
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 }); // Startet, wenn 60% des Containers sichtbar sind

  if (container) {
    observer.observe(container);
  }
}
