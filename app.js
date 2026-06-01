// =============================================
//  AetherGrid Portfolio — app.js
// =============================================

// ----- PAGE LOADER -----
document.body.classList.add('loading');

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader && !loader.classList.contains('fade-out')) {
    loader.classList.add('fade-out');
    document.body.classList.remove('loading');
  }
}

// Hide on page load
window.addEventListener('load', () => {
  setTimeout(hideLoader, 1000); // 1s delay for a premium feel
});

// Safety Timeout: Hide loader anyway after 4 seconds even if load event fails
setTimeout(hideLoader, 4000);

// ----- NAVBAR & BACK TO TOP -----
const navbar = document.getElementById('navbar');
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Back to top visibility
  if (scrollTop > 400) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }

  // Navbar scroll state
  if (scrollTop > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ----- MOBILE MENU -----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  // Animate hamburger into X
  const spans = hamburger.querySelectorAll('span');
  const isOpen = mobileMenu.classList.contains('open');
  spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
  spans[1].style.opacity   = isOpen ? '0' : '1';
  spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '1';
    spans[2].style.transform = '';
  });
});

// ----- SCROLL REVEAL -----
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
          
          // If this is the about stats container, trigger the count-up
          if (entry.target.classList.contains('about-grid')) {
            startCounters();
          }
        }, parseInt(delay));
      } else {
        // Remove visible class when scrolling away to allow re-animation
        entry.target.classList.remove('visible');
        
        // Reset counters if it's the about section
        if (entry.target.classList.contains('about-grid')) {
          resetCounters();
        }
      }
    });
  },
  { threshold: 0.05 }
);

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

// ----- COUNT UP ANIMATION -----
let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;

  const counters = document.querySelectorAll('.stat-num[data-target]');
  
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const duration = 1000; // 1 second
    const increment = target / (duration / 16);
    
    let currentCount = 0;
    
    const updateCount = () => {
      if (!countersStarted) return;
      
      currentCount += increment;
      if (currentCount < target) {
        counter.innerText = Math.ceil(currentCount);
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = target;
      }
    };
    
    updateCount();
  });
}

function resetCounters() {
  countersStarted = false;
  const counters = document.querySelectorAll('.stat-num[data-target]');
  counters.forEach(counter => {
    counter.innerText = '0';
  });
}

// ----- CONTACT FORM -----
const contactForm = document.getElementById('contact-form');
const sendBtn = document.getElementById('send-btn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const msg   = document.getElementById('f-msg').value.trim();

  if (!name || !email || !msg) return;

  // Get Turnstile token
  const turnstileResponse = turnstile.getResponse();
  if (!turnstileResponse) {
    alert('Please complete the CAPTCHA to prove you are human.');
    return;
  }

  // Sending state
  sendBtn.textContent = 'Sending…';
  sendBtn.disabled = true;
  sendBtn.style.opacity = '0.7';

  // REPLACE THIS URL with your actual Cloudflare Worker URL
  const WORKER_URL = 'https://portfolio-contact-handler.pranavsagarxd.workers.dev/';

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        email, 
        message: msg,
        'cf-turnstile-response': turnstileResponse 
      })
    });

    if (response.ok) {
      sendBtn.textContent = '✓ Message Sent!';
      sendBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      sendBtn.style.boxShadow  = '0 0 30px rgba(34,197,94,0.3)';
      contactForm.reset();
      // Reset Turnstile widget for next submission
      turnstile.reset();
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    sendBtn.textContent = '✕ Error Sending';
    sendBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    console.error('Contact error:', error);
  } finally {
    setTimeout(() => {
      sendBtn.textContent = 'Send Message →';
      sendBtn.disabled = false;
      sendBtn.style.opacity   = '1';
      sendBtn.style.background = '';
      sendBtn.style.boxShadow  = '';
    }, 3500);
  }
});

// =============================================
//  MUSIC PLAYER LOGIC
// =============================================
const playlist = ['bgm/1.mp3', 'bgm/2.mp3', 'bgm/3.mp3', 'bgm/4.mp3'];
let currentTrackIdx = 0;
let isPlaying = false;
let firstInteraction = true;

const audio = new Audio(playlist[currentTrackIdx]);
audio.volume = 0.7;

// DOM Elements
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const trackNameDisp = document.getElementById('track-name');
const trackStatusDisp = document.getElementById('track-status');
const visualizer = document.getElementById('visualizer');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const currTimeDisp = document.getElementById('curr-time');
const totalTimeDisp = document.getElementById('total-time');
const volumeSlider = document.getElementById('volume-slider');

// Update UI for Track
function loadTrack(idx) {
  audio.src = playlist[idx];
  trackNameDisp.textContent = `Vibe Track 0${idx + 1}`;
  trackStatusDisp.textContent = isPlaying ? 'Playing' : 'Paused';
  resetProgress();
}

function resetProgress() {
  progressBar.value = 0;
  progressFill.style.width = '0%';
  currTimeDisp.textContent = '0:00';
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    trackStatusDisp.textContent = 'Paused';
    visualizer.classList.remove('active');
  } else {
    forcePlay();
  }
}

function forcePlay() {
  audio.play().catch(e => console.log("Play blocked:", e));
  isPlaying = true;
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
  trackStatusDisp.textContent = 'Playing';
  visualizer.classList.add('active');
}

// First Interaction Playback
document.addEventListener('click', () => {
  if (firstInteraction) {
    firstInteraction = false;
    togglePlay();
  }
}, { once: true });

playBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent document click listener
  togglePlay();
});

nextBtn.addEventListener('click', () => {
  currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
  loadTrack(currentTrackIdx);
  if (isPlaying) audio.play();
});

prevBtn.addEventListener('click', () => {
  currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIdx);
  if (isPlaying) audio.play();
});

// Auto-advance
audio.addEventListener('ended', () => {
  nextBtn.click();
});

// Progress Bar Updates
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.value = percent;
  progressFill.style.width = `${percent}%`;
  currTimeDisp.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  totalTimeDisp.textContent = formatTime(audio.duration);
});

progressBar.addEventListener('input', () => {
  const time = (progressBar.value / 100) * audio.duration;
  audio.currentTime = time;
  progressFill.style.width = `${progressBar.value}%`;
});

// Volume Control
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
  mobileVolSlider.value = volumeSlider.value; // Sync mobile slider
});

// MOBILE VOLUME TOGGLE LOGIC
const mobileVolBtn = document.getElementById('mobile-vol-btn');
const mobileVolSlider = document.getElementById('mobile-volume-slider');
const volPopover = document.getElementById('vol-popover');

mobileVolBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  volPopover.classList.toggle('show');
  mobileVolBtn.classList.toggle('active');
});

mobileVolSlider.addEventListener('input', () => {
  audio.volume = mobileVolSlider.value;
  volumeSlider.value = mobileVolSlider.value; // Sync desktop slider
});

// Close popover when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!volPopover.contains(e.target) && e.target !== mobileVolBtn) {
    volPopover.classList.remove('show');
    mobileVolBtn.classList.remove('active');
  }
});

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// HERO WORD CYCLER
const words = ['fun.', 'vibes.', 'impact.', 'code.', 'logic.', 'you.'];
let wordIdx = 0;
const cycleWord = document.getElementById('cycle-word');

function cycleWords() {
  if (!cycleWord) return;
  
  // Fade out and move down
  cycleWord.style.opacity = 0;
  cycleWord.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    wordIdx = (wordIdx + 1) % words.length;
    cycleWord.textContent = words[wordIdx];
    
    // Fade in and move to original position
    cycleWord.style.opacity = 1;
    cycleWord.style.transform = 'translateY(0)';
  }, 400); // Wait for fade out to complete
}

setInterval(cycleWords, 3000);

// PROJECT PREVIEW INTERACTION
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--x', `${x}%`);
    card.style.setProperty('--y', `${y}%`);

    // 3D TILT CALCULATION (Ultra-Subtle)
    if (window.innerWidth >= 1024) {
      const tiltX = (rect.height / 2 - (e.clientY - rect.top)) / 80;
      const tiltY = ((e.clientX - rect.left) - rect.width / 2) / 80;
      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0) translateY(0)';
  });
});

// CURSOR PET (KITTEN) LOGIC
const pet = document.getElementById('vibe-pet');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let petX = mouseX;
let petY = mouseY;
const speed = 0.012; // Slow walking pace

if (window.innerWidth >= 1024) {
  // Initialize Position on "See My Work" button
  const startBtn = document.querySelector('.btn-primary');
  if (startBtn) {
    const rect = startBtn.getBoundingClientRect();
    petX = rect.left + rect.width / 2;
    petY = rect.top + rect.height / 2;
    mouseX = petX;
    mouseY = petY;
    pet.style.left = `${petX}px`;
    pet.style.top = `${petY}px`;
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animatePet() {
    const dx = mouseX - petX;
    const dy = mouseY - petY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // BUBBLE LOGIC: Show bubble when reasonably near (150px)
    if (distance < 150) {
      pet.classList.add('near');
    } else {
      pet.classList.remove('near');
    }

    // MOVEMENT LOGIC
    if (distance > 30) {
      petX += dx * speed;
      petY += dy * speed;
      pet.style.left = `${petX}px`;
      pet.style.top = `${petY}px`;
      
      pet.classList.add('walking');
      pet.classList.remove('sitting');
      
      if (dx > 0) pet.classList.remove('flip');
      else pet.classList.add('flip');
      
    } else {
      pet.classList.remove('walking');
      pet.classList.add('sitting');
    }

    requestAnimationFrame(animatePet);
  }

  animatePet();

  // KITTEN INTERACTION (CLICK)
  const catMessages = [
    'Meow!', 'Purrfect!', 'Vibe Check!', 'Stay cool!', 'Nice code!', 
    'Love it!', 'Keep going!', 'You rock!', 'Coffee time?', 'Pixels!',
    'Vibe coder.', 'So sleek!', 'Modern.', 'Fun!', 'High five!', 
    '🐾', '✨', 'Chill...', 'Hydrate!', 'Focus mode.', 'Magic!'
  ];

  pet.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // 1. Trigger Jump Animation
    pet.classList.add('jumping');
    setTimeout(() => pet.classList.remove('jumping'), 500);

    const bubble = pet.querySelector('.pet-bubble');
    const currentText = bubble ? bubble.textContent : '';

    // 2. Music Logic
    if (!isPlaying) {
      // If stopped/paused, start it
      forcePlay();
    } else if (currentText === 'Next track!') {
      // If already playing AND bubble says next track, SKIP it
      if (typeof nextBtn !== 'undefined') {
        nextBtn.click();
        forcePlay(); // Ensure it keeps playing after the click
      }
    }

    // 3. Update Bubble Text for NEXT click
    if (bubble) {
      // 15% chance to show "Next track!", otherwise pick random vibe
      const isNextTrackChance = Math.random() < 0.15;
      if (isNextTrackChance && isPlaying) {
        bubble.textContent = 'Next track!';
      } else {
        const randomMsg = catMessages[Math.floor(Math.random() * catMessages.length)];
        bubble.textContent = randomMsg;
      }
    }
  });
}

// MAGNETIC BUTTONS LOGIC
if (window.innerWidth >= 1024) {
  const magneticElements = document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta, .back-to-top, .mobile-vol-btn');

  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

// DYNAMIC SCROLLBAR GLOW
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  scrollVelocity = Math.min(Math.abs(currentScrollY - lastScrollY) / 50, 0.8);
  document.documentElement.style.setProperty('--scroll-glow', scrollVelocity);
  lastScrollY = currentScrollY;
  
  // Fade out the glow after scrolling stops
  clearTimeout(window.scrollGlowTimeout);
  window.scrollGlowTimeout = setTimeout(() => {
    document.documentElement.style.setProperty('--scroll-glow', 0);
  }, 150);
});

// AETHER GRID LOGIC (DESKTOP)
if (window.innerWidth >= 1024) {
  const canvas = document.getElementById('aether-grid');
  const ctx = canvas.getContext('2d');
  let width, height;

  // Lerp targets for smooth movement
  let lerpMouseX = mouseX;
  let lerpMouseY = mouseY;
  let lerpPetX = petX;
  let lerpPetY = petY;
  let gridPulse = 1;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    
    // Audio Pulse Logic
    if (isPlaying) {
      gridPulse = 1 + Math.sin(Date.now() / 200) * 0.15; // Syncs with visualizer speed
    } else {
      gridPulse = 1;
    }

    // Smoothly interpolate positions (0.08 = smoothness factor)
    lerpMouseX += (mouseX - lerpMouseX) * 0.08;
    lerpMouseY += (mouseY - lerpMouseY) * 0.08;
    lerpPetX += (petX - lerpPetX) * 0.08;
    lerpPetY += (petY - lerpPetY) * 0.08;

    const gridSize = 55;
    
    for (let x = 0; x <= width; x += gridSize) {
      for (let y = 0; y <= height; y += gridSize) {
        // Calculate distance to smoothed positions
        const dMouse = Math.sqrt(Math.pow(x - lerpMouseX, 2) + Math.pow(y - lerpMouseY, 2));
        const dPet = Math.sqrt(Math.pow(x - lerpPetX, 2) + Math.pow(y - lerpPetY, 2));
        
        const dist = Math.min(dMouse, dPet);
        
        if (dist < 250) {
          const opacity = (1 - dist / 250) * 0.4 * gridPulse;
          ctx.fillStyle = `rgba(167, 139, 250, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, 2 * gridPulse, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.12 * gridPulse})`;
          ctx.fillRect(x - (1 * gridPulse) / 2, y - (1 * gridPulse) / 2, 1.5 * gridPulse, 1.5 * gridPulse);
        }
      }
    }
    
    requestAnimationFrame(drawGrid);
  }

  drawGrid();
}

