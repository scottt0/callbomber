/**
 * CallBlast Client Engine (2026)
 * Pure Client-Side Interactive Prank Console & Telemetry Dashboard
 * 100% Compatible with GitHub Pages & Custom Domains
 */

(function () {
  'use strict';

  // Where every CTA (START / Download) sends the visitor. Tool is view-only.
  const OFFICIAL_URL = 'https://callbombers.com.in/';

  // --- Sound Synthesis via Web Audio API ---
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.08) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playLaunchSound() {
    if (!soundEnabled) return;
    playTone(340, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(580, 0.2, 'sine', 0.12), 120);
    setTimeout(() => playTone(880, 0.35, 'triangle', 0.15), 260);
  }

  function playPingSound() {
    if (!soundEnabled) return;
    playTone(920, 0.08, 'sine', 0.06);
  }

  function playVictorySound() {
    if (!soundEnabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.12), i * 140);
    });
  }

  // --- Theme Manager ---
  function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const saved = localStorage.getItem('cb_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('cb_theme', next);
        playTone(600, 0.05, 'sine', 0.05);
      });
    }
  }

  // --- Mobile Navigation ---
  function initNav() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen);
      });
    }
  }

  // --- FAQ Accordions ---
  function initFaqs() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      if (q) {
        q.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          faqItems.forEach(other => other.classList.remove('open'));
          if (!isOpen) item.classList.add('open');
          playTone(480, 0.04, 'sine', 0.03);
        });
      }
    });
  }

  // --- Waveform Canvas Visualizer ---
  let canvasAnimId = null;
  function initWaveCanvas() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 90);
    let step = 0;

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 90;
      }
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const isBlasting = window.isBlastingActive || false;
      const bars = Math.floor(width / 14);

      for (let i = 0; i < bars; i++) {
        const x = i * 14 + 6;
        let h = 4;
        if (isBlasting) {
          const freq = Math.sin(step * 0.12 + i * 0.4) * Math.cos(step * 0.08 - i * 0.2);
          h = Math.max(6, Math.abs(freq) * (height * 0.75));
        } else {
          h = 4 + Math.sin(step * 0.03 + i * 0.2) * 3;
        }

        const y = (height - h) / 2;
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, 6, h, 3);
        ctx.fill();
      }

      step++;
      canvasAnimId = requestAnimationFrame(draw);
    }

    draw();
  }

  // --- Dynamic Carrier Detection ---
  const carrierDatabase = {
    IN: [
      { prefix: ['98', '99', '97', '96'], name: 'Airtel / Jio 5G' },
      { prefix: ['93', '94', '95'], name: 'BSNL Mobile' },
      { prefix: ['90', '91', '92'], name: 'Vi (Vodafone Idea)' },
      { prefix: ['8', '7', '6'], name: 'Indian GSM Carrier' }
    ],
    PK: [
      { prefix: ['030', '30'], name: 'Jazz Telecom' },
      { prefix: ['031', '31'], name: 'Zong 4G' },
      { prefix: ['034', '34'], name: 'Telenor PK' },
      { prefix: ['032', '32'], name: 'Warid Telecom' },
      { prefix: ['033', '33'], name: 'Ufone PK' }
    ],
    US: [{ prefix: [''], name: 'Verizon / AT&T Wireless' }],
    GB: [{ prefix: [''], name: 'EE / Vodafone UK' }],
    BD: [{ prefix: ['017', '17', '013'], name: 'Grameenphone' }, { prefix: ['018', '18'], name: 'Robi Axiata' }, { prefix: ['019', '19'], name: 'Banglalink' }],
    AE: [{ prefix: ['050', '054'], name: 'Etisalat' }, { prefix: ['052', '055'], name: 'du Telecom' }]
  };

  function detectCarrier(country, num) {
    const clean = num.replace(/\D/g, '');
    const list = carrierDatabase[country] || carrierDatabase['IN'];
    for (const item of list) {
      if (item.prefix.some(p => clean.startsWith(p))) {
        return item.name;
      }
    }
    return 'VoIP Mobile Gateway';
  }

  // --- Tool Prank Engine ---
  function initToolEngine() {
    const form = document.getElementById('blastForm');
    if (!form) return;

    const countrySelect = document.getElementById('countrySelect');
    const phoneInput = document.getElementById('targetNumber');
    const carrierBadge = document.getElementById('carrierBadge');
    const termsCheck = document.getElementById('agreeTerms');
    const launchBtn = document.getElementById('launchBtn');
    const modeTabs = document.querySelectorAll('.mode-tab');
    const chipBtns = document.querySelectorAll('.chip-btn');
    const speedSelect = document.getElementById('speedInterval');
    const callerIdSelect = document.getElementById('callerIdMask');

    // HUD Elements
    const hud = document.getElementById('blastHud');
    const termLog = document.getElementById('terminalLog');
    const progressFill = document.getElementById('hudProgressFill');
    const statSent = document.getElementById('statSent');
    const statTotal = document.getElementById('statTotal');
    const statRate = document.getElementById('statRate');
    const statPing = document.getElementById('statPing');
    const statNodes = document.getElementById('statNodes');
    const pauseBtn = document.getElementById('hudPauseBtn');
    const abortBtn = document.getElementById('hudAbortBtn');
    const victoryCard = document.getElementById('victoryCard');
    const blastAgainBtn = document.getElementById('blastAgainBtn');
    const sharePrankBtn = document.getElementById('sharePrankBtn');

    let currentMode = 'call'; // 'call' | 'sms' | 'combo'
    let targetCount = 25;
    let sentCount = 0;
    let timerId = null;
    let isPaused = false;

    // Mode Switcher Tabs
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;
        playTone(520, 0.05, 'triangle', 0.05);

        const modeNames = { call: 'Call Blast', sms: 'SMS Storm', combo: 'Hyper Combo' };
        if (launchBtn) {
          launchBtn.innerHTML = `<span>START ${modeNames[currentMode].toUpperCase()} 🚀</span>`;
        }
      });
    });

    // Preset Intensity Chips
    chipBtns.forEach(chip => {
      chip.addEventListener('click', () => {
        chipBtns.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        targetCount = parseInt(chip.dataset.count, 10) || 25;
        playTone(400 + targetCount * 5, 0.06, 'sine', 0.06);
      });
    });

    // Country selection prefix
    function updateCountry() {
      const code = countrySelect ? countrySelect.value : 'IN';
      const flagMap = { IN: '+91', PK: '+92', US: '+1', GB: '+44', BD: '+880', AE: '+971', CA: '+1', SA: '+966' };
      const prefixSpan = document.getElementById('countryPrefix');
      if (prefixSpan) prefixSpan.textContent = flagMap[code] || '+91';
      updateValidation();
    }

    if (countrySelect) {
      countrySelect.addEventListener('change', updateCountry);
    }

    // Input Validation & Carrier Badge
    function updateValidation() {
      const num = phoneInput ? phoneInput.value.trim() : '';
      const validDigits = num.replace(/\D/g, '').length >= 7;
      const agreed = termsCheck ? termsCheck.checked : false;

      if (carrierBadge && phoneInput) {
        if (num.length >= 3) {
          const carrier = detectCarrier(countrySelect.value, num);
          carrierBadge.textContent = `Carrier: ${carrier}`;
          carrierBadge.style.display = 'inline-flex';
        } else {
          carrierBadge.style.display = 'none';
        }
      }

      if (launchBtn) {
        launchBtn.disabled = !(validDigits && agreed);
      }
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', updateValidation);
    }
    if (termsCheck) {
      termsCheck.addEventListener('change', updateValidation);
    }

    // Start -> redirect to official site. Tool itself is view-only (does nothing real).
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const num = phoneInput.value.trim();
      if (!num || (termsCheck && !termsCheck.checked)) return;
      playLaunchSound();
      window.location.href = OFFICIAL_URL;
    });

    function maskNumber(num) {
      if (num.length <= 4) return num;
      return num.slice(0, 2) + '••••' + num.slice(-3);
    }

    function addLog(text, cssClass = '') {
      if (!termLog) return;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = `<span class="t-time">[${timeStr}]</span> <span class="${cssClass}">${text}</span>`;
      termLog.appendChild(line);
      termLog.scrollTop = termLog.scrollHeight;
    }

    function runBlastStep(intervalMs, num) {
      if (timerId) clearTimeout(timerId);

      timerId = setTimeout(() => {
        if (isPaused) {
          runBlastStep(intervalMs, num);
          return;
        }

        sentCount++;
        const pct = Math.min(100, Math.round((sentCount / targetCount) * 100));

        if (statSent) statSent.textContent = sentCount;
        if (progressFill) progressFill.style.width = pct + '%';
        if (statPing) statPing.textContent = `${Math.floor(16 + Math.random() * 18)}ms`;
        if (statRate) statRate.textContent = `${(98.4 + Math.random() * 1.5).toFixed(1)}%`;

        playPingSound();

        const channel = currentMode === 'combo' ? (sentCount % 2 === 0 ? '📞 Voice Call' : '💬 SMS Wave') : currentMode === 'sms' ? '💬 SMS Wave' : '📞 Voice Call';
        const masked = maskNumber(num);
        const spoof = callerIdSelect ? callerIdSelect.value : 'Private';

        addLog(`${channel} #${sentCount}/${targetCount} dispatched [CID: ${spoof}] -> ${masked} (200 OK)`, 't-ok');

        if (sentCount >= targetCount) {
          finishBlast();
        } else {
          runBlastStep(intervalMs, num);
        }
      }, intervalMs);
    }

    function finishBlast() {
      window.isBlastingActive = false;
      playVictorySound();
      addLog(`[COMPLETE] All ${targetCount} dispatches successfully sent. Session completed.`, 't-ok');

      setTimeout(() => {
        if (hud) hud.style.display = 'none';
        if (victoryCard) victoryCard.style.display = 'block';
      }, 900);
    }

    // HUD Pause / Abort
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '▶ RESUME' : '⏸ PAUSE';
        addLog(isPaused ? '[STATUS] Prank paused by operator.' : '[STATUS] Resuming dispatch stream...', 't-warn');
        playTone(400, 0.05, 'sine', 0.05);
      });
    }

    if (abortBtn) {
      abortBtn.addEventListener('click', () => {
        clearTimeout(timerId);
        window.isBlastingActive = false;
        addLog('[ABORT] Emergency stop triggered. Session stopped.', 't-err');
        playTone(280, 0.2, 'sawtooth', 0.1);

        setTimeout(() => {
          if (hud) hud.style.display = 'none';
          form.style.display = 'block';
        }, 600);
      });
    }

    // Victory Actions
    if (blastAgainBtn) {
      blastAgainBtn.addEventListener('click', () => {
        if (victoryCard) victoryCard.style.display = 'none';
        form.style.display = 'block';
        playTone(600, 0.05, 'sine', 0.05);
      });
    }

    if (sharePrankBtn) {
      sharePrankBtn.addEventListener('click', () => {
        const text = `😂 I just pranked my buddy with ${targetCount} calls on CallBlast! Try it free: ${window.location.origin}${window.location.pathname}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            alert('Prank message copied to clipboard! Share it with your friends on WhatsApp or Telegram.');
          });
        } else {
          alert(text);
        }
      });
    }

    // Initial check
    updateCountry();
  }

  // --- APK Download Handler ---
  // Button is a real <a href> to the official site; just play a click tone and let it navigate.
  function initApkDownload() {
    const dlBtn = document.getElementById('apkDownloadBtn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => playTone(440, 0.1, 'sine', 0.08));
    }
  }

  // --- Run Initialization on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initFaqs();
    initWaveCanvas();
    initToolEngine();
    initApkDownload();
  });
})();
