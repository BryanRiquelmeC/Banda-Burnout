/* ============================================
   BURNOUT CHILE — Reproductor de Música
   Usa Web Audio API + síntesis para demo.
   Cuando tengas los archivos .mp3, reemplaza
   TRACKS[i].src con la ruta real.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Datos de pistas ---- */
  const TRACKS = [
    { title: 'Intro',                album: 'Enajenado (2025)', src: 'audio/01Intro02.mp3', dur: '1:12' },
    { title: 'Bastardo',             album: 'Enajenado (2025)', src: 'audio/02Bastardo02.mp3', dur: '3:45' },
    { title: 'Perdido en la sociedad', album: 'Enajenado (2025)', src: 'audio/03Perdido en la sociedad02.mp3', dur: '4:10' },
    { title: 'Iluso',                album: 'Enajenado (2025)', src: 'audio/04Iluso02.mp3', dur: '3:58' },
    { title: 'Golpe letal',          album: 'Enajenado (2025)', src: 'audio/05Golpe letal02.mp3', dur: '4:22' },
    { title: 'Fuckvecinos',          album: 'Enajenado (2025)', src: 'audio/06Fuckvecinos03.mp3', dur: '3:37' },
  ];

  /* ---- Estado ---- */
  let currentIdx = -1;
  let isPlaying  = false;
  let duration   = 0;
  let elapsed    = 0;
  let ticker     = null;
  let audio      = null;   // HTMLAudioElement cuando haya src real
  let volume     = 0.8;

  /* ---- Referencias DOM ---- */
  const trackNameEl  = document.getElementById('playerTrackName');
  const trackAlbumEl = document.getElementById('playerTrackAlbum');
  const progressFill = document.getElementById('progressFill');
  const timeElapsed  = document.getElementById('timeElapsed');
  const timeDuration = document.getElementById('timeDuration');
  const playBtn      = document.getElementById('playBtn');
  const playIcon     = document.getElementById('playIcon');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const shuffleBtn   = document.getElementById('shuffleBtn');
  const repeatBtn    = document.getElementById('repeatBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const progressBar  = document.getElementById('progressBar');
  const trackListEl  = document.getElementById('trackList');

  let shuffleOn = false;
  let repeatOn  = false;

  /* ---- Helpers ---- */
  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function updateUI() {
    if (currentIdx < 0) return;
    const t = TRACKS[currentIdx];
    trackNameEl.textContent  = t.title;
    trackAlbumEl.textContent = t.album;

    // Resaltar en lista
    trackListEl.querySelectorAll('li').forEach((li, i) => {
      li.classList.toggle('active', i === currentIdx);
    });

    timeDuration.textContent = audio ? fmt(audio.duration) : t.dur;
  }

  function setPlayIcon(playing) {
    playIcon.textContent = playing ? '⏸' : '▶';
  }

  function startTicker() {
    clearInterval(ticker);
    ticker = setInterval(() => {
      if (!isPlaying) return;
      if (audio) {
        elapsed  = audio.currentTime;
        duration = audio.duration || 0;
      } else {
        // Simulación visual cuando no hay audio real
        elapsed += 0.5;
        if (elapsed > duration) {
          if (repeatOn) elapsed = 0;
          else { elapsed = 0; handleTrackEnd(); return; }
        }
      }
      const pct = duration > 0 ? (elapsed / duration) * 100 : 0;
      progressFill.style.width = pct + '%';
      timeElapsed.textContent  = fmt(elapsed);
      timeDuration.textContent = fmt(duration) || TRACKS[currentIdx]?.dur;
    }, 500);
  }

  function handleTrackEnd() {
    if (repeatOn) {
      playTrack(currentIdx);
    } else if (shuffleOn) {
      let rand;
      do { rand = Math.floor(Math.random() * TRACKS.length); }
      while (rand === currentIdx && TRACKS.length > 1);
      playTrack(rand);
    } else {
      playTrack((currentIdx + 1) % TRACKS.length);
    }
  }

  /* ---- Reproducción ---- */
  function playTrack(idx) {
    // Detener audio anterior
    stopCurrent();

    currentIdx = idx;
    const t    = TRACKS[idx];
    elapsed    = 0;
    isPlaying  = true;

    if (t.src) {
      // Audio real
      audio = new Audio(t.src);
      audio.volume = volume;
      audio.addEventListener('ended', handleTrackEnd);
      audio.play().catch(console.error);
    } else {
      // Sin archivo: simular duración parseable del string dur
      const parts   = t.dur.split(':');
      duration = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      audio = null;
      // Pequeño feedback visual / beep usando Web Audio API
      simulateBeep();
    }

    updateUI();
    setPlayIcon(true);
    startTicker();
    progressFill.style.width = '0%';
    timeElapsed.textContent  = '0:00';
  }

  function togglePlay() {
    if (currentIdx < 0) { playTrack(0); return; }

    if (audio) {
      if (isPlaying) { audio.pause(); isPlaying = false; }
      else           { audio.play(); isPlaying = true; }
    } else {
      isPlaying = !isPlaying;
    }
    setPlayIcon(isPlaying);
  }

  function stopCurrent() {
    clearInterval(ticker);
    if (audio) { audio.pause(); audio = null; }
    isPlaying = false;
    elapsed   = 0;
    duration  = 0;
  }

  /* ---- Beep de demo (Web Audio API) ---- */
  let audioCtx = null;
  function simulateBeep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (_) { /* sin soporte */ }
  }

  /* ---- Eventos ---- */
  playBtn?.addEventListener('click', togglePlay);

  prevBtn?.addEventListener('click', () => {
    const prev = (currentIdx <= 0 ? TRACKS.length : currentIdx) - 1;
    playTrack(prev);
  });

  nextBtn?.addEventListener('click', () => {
    if (shuffleOn) {
      let rand;
      do { rand = Math.floor(Math.random() * TRACKS.length); }
      while (rand === currentIdx && TRACKS.length > 1);
      playTrack(rand);
    } else {
      playTrack((currentIdx + 1) % TRACKS.length);
    }
  });

  shuffleBtn?.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    shuffleBtn.classList.toggle('active', shuffleOn);
  });

  repeatBtn?.addEventListener('click', () => {
    repeatOn = !repeatOn;
    repeatBtn.classList.toggle('active', repeatOn);
  });

  volumeSlider?.addEventListener('input', (e) => {
    volume = parseFloat(e.target.value);
    if (audio) audio.volume = volume;
  });

  progressBar?.addEventListener('click', (e) => {
    if (currentIdx < 0 || !duration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    elapsed = pct * duration;
    if (audio) audio.currentTime = elapsed;
    progressFill.style.width   = (pct * 100) + '%';
    timeElapsed.textContent    = fmt(elapsed);
  });

  /* ---- Construir lista de pistas ---- */
  if (trackListEl) {
    TRACKS.forEach((t, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
        <span>${t.title}</span>
        <span class="track-dur">${t.dur}</span>
        <span class="playing-anim"><span></span><span></span><span></span></span>
      `;
      li.addEventListener('click', () => playTrack(i));
      trackListEl.appendChild(li);
    });
  }

  /* ---- Exponer función global para agregar src real ---- */
  window.BurnoutPlayer = {
    setTrackSrc(idx, src) {
      if (TRACKS[idx]) TRACKS[idx].src = src;
    },
    play: playTrack,
  };

});
