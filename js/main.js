// SCROLL REVEAL
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ACTIVE NAV
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === page || (page === '' && href === 'index.html')) link.classList.add('active');
});

// RESUME TABS
const tabs = document.querySelectorAll('.rtab');
const panes = document.querySelectorAll('.resume-pane');
if (tabs.length) {
  panes[0]?.classList.add('active');
  tabs[0]?.classList.add('active');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target)?.classList.add('active');
    });
  });
}

// MODAL SYSTEM
const overlay = document.getElementById('modal-overlay');
const modalEl = document.getElementById('modal-content');

function openModal(id) {
  const data = modalData[id];
  if (!data || !overlay || !modalEl) return;
  overlay.style.setProperty('--modal-color', data.color || 'var(--sage-mist)');
  modalEl.style.setProperty('--modal-color', data.color || 'var(--sage-mist)');
  modalEl.innerHTML = buildModal(data);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalEl.querySelector('.modal-close')?.addEventListener('click', closeModal);
}

function closeModal() {
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
}

overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

document.querySelectorAll('[data-modal]').forEach(el => {
  el.addEventListener('click', () => openModal(el.dataset.modal));
});

function buildModal(d) {
  const tags = d.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const bullets = d.bullets.map(b => `<li>${b}</li>`).join('');
  const extra = d.extra ? d.extra.map(b =>
    b.trim().startsWith('<') ? b : `<li>${b}</li>`
  ).join('') : '';
  const media = d.video
    ? `<iframe class="modal-video" src="${d.video}" allowfullscreen></iframe>`
    : d.mediaPlaceholder
      ? `<div class="modal-media-placeholder">${d.mediaPlaceholder}</div>`
      : '';

  return `
    <div class="modal-bar"></div>
    <div class="modal-header">
      <div class="modal-title-wrap">
        <div class="modal-num">${d.num}</div>
        <div class="modal-title">${d.title}</div>
        <div class="modal-subtitle">${d.subtitle}</div>
      </div>
      <button class="modal-close" aria-label="Close">✕</button>
    </div>
    <div class="modal-body">
      <div class="modal-tags">${tags}</div>
      <p class="modal-section-label">overview</p>
      <p class="modal-text">${d.overview}</p>
      ${media}
      <p class="modal-section-label">what I built</p>
      <ul class="modal-bullets">${bullets}</ul>
      ${extra ? `<hr class="modal-divider"><p class="modal-section-label">more detail</p><ul class="modal-bullets">${extra}</ul>` : ''}
    </div>
  `;
}

// MODAL DATA
const modalData = {
  malware: {
    num: '01', color: 'var(--blush-deep)',
    title: 'Malware Reverse Engineering Lab',
    subtitle: 'Static binary analysis · Ongoing',
    tags: ['IDA Pro','OllyDbg','x86 Assembly','Python','Static Binary Analysis','Reverse Engineering'],
    overview: 'A deep-dive into real-world malware samples using IDA Pro and OllyDbg, annotating x86 assembly line by line to figure out what each virus is actually doing, how it spreads, and how it hides. No source code, no documentation, just disassembly and inference.',
    bullets: [
      'Reverse engineered 6 malware samples (SQLSlammer, Michelangelo, DOS7, Lucius, Nyadrop, Harulf) with over 2,000 lines of annotated comments across worms, boot sector viruses, droppers, and network attack vectors',
      'Analyzed techniques spanning stack-based buffer overflows, UDP worm propagation, null-free shellcode construction, self-modifying code, debugger detection, and runtime API resolution',
      'Unpacked and dissected an encrypted multi-payload Windows PE infector (Harulf) with polymorphic and anti-debugging tricks, documenting how it injects into executables and spreads through removable drives and P2P file sharing',
      'Used OllyDbg for dynamic analysis on Lucius to trace runtime behavior alongside static IDA Pro annotation',
    ],
  },
  basil: {
    num: '02', color: 'var(--dusty-teal)',
    title: 'basil',
    subtitle: 'Grocery Tracking and Recipe Generating Website · Hackathon',
    tags: ['Python','Flask','SQLite','SQLAlchemy','React','AWS Cognito','OpenAI API'],
    overview: 'Built at a 24-hour hackathon with my roommates. The idea: a smart pantry app that keeps track of what you have and generates recipes that use up what is about to expire. I built the backend.',
    bullets: [
      'Parsed 8,000+ USDA food database entries from raw CSV into a queryable SQLite/SQLAlchemy schema and built 10+ REST API endpoints connecting to the React frontend',
      'Built a JSON prompt pipeline with Mosaic/OpenAI API to generate inventory-aware recipes with accurate nutritional macros',
      'Implemented Amazon Cognito authentication with refresh token handling and session expiry edge cases, learned at an AWS workshop earlier that same day',
      'Collaborated on the React frontend for inventory and recipe management',
    ],
  },
  ninelives: {
    num: '03', color: 'var(--butter-deep)',
    title: 'Nine Lives',
    subtitle: 'ARM Mbed Embedded Video Game · Nov 2025',
    tags: ['C','C++','ARM Mbed','Embedded Systems','Hash Tables','LCD'],
    overview: 'A real-time 2D cave exploration game running on a bare-metal ARM Mbed microcontroller with an LCD display. No operating system, everything runs in a fixed-timestep game loop.',
    bullets: [
      'Built across 3 game states with debounced NAV-switch and pushbutton input within a deterministic game loop',
      'Implemented a tile-based map system backed by a custom hash table for O(1) coordinate lookups, supporting 20+ item and entity types',
      'Designed custom cat-themed pixel sprites and integrated procedural item spawning, state-machine-driven enemy AI, and score progression',
    ],
  },
  shiftscape: {
    num: '04', color: 'var(--lavender-mid)',
    title: 'ShiftScape',
    subtitle: 'Unity Puzzle Game · VGDev · Fall 2024',
    tags: ['C#','Unity','Component-Based Architecture','Game Design'],
    overview: 'A team-built Unity puzzle game made with VGDev over Fall 2024. The gimmick is that the board itself shifts and transforms as you move around it, so the puzzle is constantly changing under your feet.',
    bullets: [
      'Implemented 5+ tile types with distinct behavioral logic using Unity\'s component system, including trigger tiles, environmental tiles that alter movement, and transformation tiles that restructure the board',
      'Collaborated with designers and artists to integrate gameplay mechanics with visual and audio assets',
    ],
  },
  moodtracker: {
    num: '05', color: 'var(--sage-mid)',
    title: 'Mood Tracker',
    subtitle: 'Personal Wellness Web App · Jan to Mar 2024',
    tags: ['Python','Flask','HTML/CSS','SQLite','Session Auth','Data Visualization'],
    overview: 'A solo full-stack mood tracking web app where daily prompts adapt to the user\'s specific hobbies rather than being generic. Built and self-hosted on a live server.',
    bullets: [
      'Built a heatmap visualization to surface mood patterns over time, a hobby-integrated daily logging system, and a journaling feature',
      'Implemented session-based user authentication with persistent data storage',
      'Self-hosted on a live server',
    ],
  },
  moodphysical: {
    num: '06', color: 'var(--blush)',
    title: 'Mood Tracker (physical)',
    subtitle: 'Arduino Hardware Project · 2026',
    tags: ['Arduino','C++','LCD','Circuit Design','LiquidCrystal'],
    overview: 'With finals season approaching and my roommates all running on different levels of stress, I wanted a low-effort way to do a quick daily check-in. The concept was simple: put something by the doorway, press a button on your way out, and at the end of the day you have a rough sense of how everyone is feeling. I found a reference project online and adapted it to build my own version with an Arduino Uno, a breadboard, an LCD screen, and three buttons with hand-drawn happy, okay, and sad faces, since I did not have time to 3D print a custom enclosure.',
    video: 'https://www.youtube.com/embed/4kXyPQ4djqM',
    bullets: [
      'Wired three pushbuttons to an Arduino Uno R3 on a breadboard, each connected to a digital input pin with a pull-down resistor, routed to the LCD display module via jumper wires',
      'Programmed the Arduino sketch in C++ to poll each button state on every loop iteration, increment the corresponding counter on a HIGH signal, and apply a 1-second debounce delay to prevent double-counting',
      'Used the LiquidCrystal library to manage the 16x2 LCD display, setting cursor positions to format mood tallies across two lines',
      'Drew happy, okay, and sad faces directly on the physical buttons as a workaround for not having a 3D printer available',
    ],
    extra: [
      'The breadboard wiring took significantly longer than expected. I had not worked with a breadboard or arduino before without a clear tutorial so it took a lot of trial and error before everything finally worked. I think I\'m a lot more confident handling Arduinos and prototyping things now. I\'m excited to do more uesful and complex projects in the future!',
      `<figure style="margin:0.75rem 0 1rem;">
        <img src="images/moodtracker_wip.jpg" style="width:100%;border-radius:12px;display:block;" alt="breadboard mid-build">
        <figcaption style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-muted);margin-top:0.5rem;text-align:center;">Mid-build — before I figured out how a breadboard actually works.</figcaption>
       </figure>`,
      'The project is intentionally simple and has no persistent storage, so it resets when unplugged. For a quick daily check-in that lives by the door, that is enough. This was also for a casual class project, so there was no pressure for it to be perfect.',
    ],
  },
  celebi: {
    num: '07', color: 'var(--sage-dark)',
    title: 'Celebi',
    subtitle: 'RoboJackets Robowrestling 500g SumoBot · 3rd Place',
    tags: ['C++','PCB Design','CAD/SolidWorks','Embedded Firmware','Circuit Analysis'],
    overview: 'A 500g competition sumobot built from scratch for Georgia Tech\'s RoboJackets Robowrestling team. Every part of it, firmware, hardware, PCB, and competition strategy, was designed and refined through 100+ live matches, eventually placing 3rd at Maker Faire Orlando.',
    bullets: [
      'Designed and programmed sub-millisecond sensor-driven control loops with custom PCB integrating motors, IR sensors, and the main controller',
      'Created 30+ CAD models and fabricated parts from scratch',
      'Iteratively refined hardware and strategy across 100+ live matches to place 3rd at Maker Faire Orlando',
    ],
  },
};
