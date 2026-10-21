/**
 * Interactive Birthday Website for Abiasoyy
 * Fullscreen celebration with direct maximal photo, Jamrud audio,
 * Fullscreen Mode Toggle, and Interactive Candle Altar.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==============================================================
  // 1. FLOATING HEARTS BACKGROUND GENERATOR
  // ==============================================================
  const heartsContainer = document.getElementById('floatingHeartsContainer');
  const HEART_ICONS = ['🤍', '💜', '🌸', '✨', '💖', '🌿'];

  function createFloatingHeart() {
    if (!heartsContainer) return;
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = HEART_ICONS[Math.floor(Math.random() * HEART_ICONS.length)];
    heart.style.left = Math.random() * 96 + '%';
    heart.style.fontSize = (Math.random() * 0.7 + 0.9) + 'rem';
    heart.style.animationDuration = (Math.random() * 3 + 5.5) + 's';
    heart.style.animationDelay = (Math.random() * 1.5) + 's';

    heartsContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 9000);
  }

  setInterval(createFloatingHeart, 650);
  for (let i = 0; i < 7; i++) {
    createFloatingHeart();
  }

  // ==============================================================
  // 2. FITUR LAYAR PENUH (FULLSCREEN API)
  // ==============================================================
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const fullscreenText = document.getElementById('fullscreenText');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  function toggleFullscreen(e) {
    if (e) e.stopPropagation();
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

    if (!isFullscreen) {
      const docEl = document.documentElement;
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (req) {
        const p = req.call(docEl);
        if (p && p.catch) {
          p.catch((err) => {
            console.warn('Fullscreen request failed:', err);
          });
        }
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exit) {
        const p = exit.call(document);
        if (p && p.catch) {
          p.catch((err) => {
            console.warn('Exit fullscreen failed:', err);
          });
        }
      }
    }
  }

  function updateFullscreenUI() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (fullscreenBtn && fullscreenText) {
      if (isFullscreen) {
        const iconEl = fullscreenBtn.querySelector('.btn-icon');
        if (iconEl) iconEl.textContent = '⤓';
        fullscreenText.textContent = 'Layar Mengecil';
        fullscreenBtn.setAttribute('aria-label', 'Kecilkan layar');
        if (soundToggleBtn) {
          soundToggleBtn.style.display = 'none';
        }
      } else {
        const iconEl = fullscreenBtn.querySelector('.btn-icon');
        if (iconEl) iconEl.textContent = '⛶';
        fullscreenText.textContent = 'Layar Penuh';
        fullscreenBtn.setAttribute('aria-label', 'Beralih ke mode layar penuh');
        if (soundToggleBtn) {
          soundToggleBtn.style.display = 'inline-flex';
        }
      }
    }
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  document.addEventListener('fullscreenchange', updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
  document.addEventListener('mozfullscreenchange', updateFullscreenUI);
  document.addEventListener('MSFullscreenChange', updateFullscreenUI);

  // ==============================================================
  // 3. JAMRUD - "SELAMAT ULANG TAHUN" AUDIO ENGINE
  // ==============================================================
  const birthdayAudio = document.getElementById('birthdayAudio');
  const soundStatusText = document.getElementById('soundStatusText');

  let isAudioPlaying = false;
  let audioContext = null;
  let synthLoopTimeout = null;
  let useFallbackSynth = false;

  birthdayAudio.volume = 0.65;

  birthdayAudio.addEventListener('error', () => {
    console.info('Audio file assets/birthday-song.mp3 error or missing. Web Audio synthesizer fallback activated.');
    useFallbackSynth = true;
  });

  const JAMRUD_NOTES = [
    { note: 'C4', dur: 0.35 }, { note: 'E4', dur: 0.35 }, { note: 'G4', dur: 0.45 },
    { note: 'G4', dur: 0.35 }, { note: 'A4', dur: 0.35 }, { note: 'G4', dur: 0.7 },
    { note: 'F4', dur: 0.35 }, { note: 'E4', dur: 0.35 }, { note: 'D4', dur: 0.45 },
    { note: 'D4', dur: 0.35 }, { note: 'E4', dur: 0.35 }, { note: 'F4', dur: 0.7 },
    { note: 'E4', dur: 0.35 }, { note: 'D4', dur: 0.35 }, { note: 'C4', dur: 0.8 },
    { note: 'REST', dur: 0.4 }
  ];

  const FREQS = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
    'REST': 0
  };

  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playTone(freq, dur, startTime) {
    if (!audioContext || freq === 0) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(startTime);
    osc.stop(startTime + dur);
  }

  function startSynthMelodyLoop() {
    if (!audioContext || !isAudioPlaying) return;
    let t = audioContext.currentTime + 0.1;

    JAMRUD_NOTES.forEach(item => {
      const freq = FREQS[item.note] || 0;
      if (freq > 0) playTone(freq, item.dur, t);
      t += item.dur;
    });

    const totalDur = t - audioContext.currentTime;
    synthLoopTimeout = setTimeout(() => {
      if (isAudioPlaying) startSynthMelodyLoop();
    }, totalDur * 1000);
  }

  function stopSynthMelody() {
    if (synthLoopTimeout) {
      clearTimeout(synthLoopTimeout);
      synthLoopTimeout = null;
    }
  }

  const REFF_START_SECOND = 12;

  function setAudioToReff() {
    try {
      if (birthdayAudio.currentTime < REFF_START_SECOND) {
        birthdayAudio.currentTime = REFF_START_SECOND;
      }
    } catch (e) {
      // metadata not yet loaded
    }
  }

  birthdayAudio.addEventListener('loadedmetadata', setAudioToReff);
  birthdayAudio.addEventListener('canplay', setAudioToReff);

  // When song ends, loop back directly to second 7 (reff)
  birthdayAudio.addEventListener('ended', () => {
    birthdayAudio.currentTime = REFF_START_SECOND;
    birthdayAudio.play().catch(() => {});
  });

  function playAudio() {
    initAudioContext();
    isAudioPlaying = true;
    soundToggleBtn.classList.add('is-playing');
    soundStatusText.textContent = 'Jamrud: Memutar ♪';

    if (!useFallbackSynth) {
      setAudioToReff();
      const p = birthdayAudio.play();
      if (p !== undefined) {
        p.then(() => {
          setAudioToReff();
        }).catch(() => {
          useFallbackSynth = true;
          startSynthMelodyLoop();
        });
      }
    } else {
      startSynthMelodyLoop();
    }
  }

  function pauseAudio() {
    isAudioPlaying = false;
    soundToggleBtn.classList.remove('is-playing');
    soundStatusText.textContent = 'Jamrud: Jeda';

    if (!useFallbackSynth) {
      birthdayAudio.pause();
    } else {
      stopSynthMelody();
    }
  }

  soundToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isAudioPlaying) pauseAudio();
    else playAudio();
  });

  // ==============================================================
  // 3.5. KOTAK KADO INTERACTION (HANYA KADO SAJA)
  // ==============================================================
  const giftIntroStage = document.getElementById('giftIntroStage');
  const celebrationStage = document.getElementById('celebrationStage');
  const giftBoxWrapper = document.getElementById('giftBoxWrapper');
  const giftBox = document.getElementById('giftBox');

  let isGiftOpened = false;

  function triggerOpenGift() {
    if (isGiftOpened) return;
    isGiftOpened = true;

    // 1. Shake gift box
    if (giftBox) giftBox.classList.add('shaking');

    // 2. Play Jamrud MP3 immediately on interaction!
    playAudio();

    setTimeout(() => {
      // 3. Open lid & burst light
      if (giftBox) {
        giftBox.classList.remove('shaking');
        giftBox.classList.add('opened');
      }

      // 4. Smooth transition to full screen celebration
      setTimeout(() => {
        if (giftIntroStage) giftIntroStage.classList.remove('active');

        if (celebrationStage) {
          celebrationStage.classList.add('active');
          celebrationStage.removeAttribute('aria-hidden');

          // Trigger staggered animation on all floating photos on 3 sides!
          const floatingCards = celebrationStage.querySelectorAll('.floating-photo-card, .hanging-photobooth-strip, .floating-balloon-badge, .floating-polaroid-top');
          floatingCards.forEach(card => {
            card.style.animation = 'none';
            void card.offsetWidth; // Force reflow
            card.style.animation = '';
          });

          // Gentle celebratory heart shower
          for (let i = 0; i < 24; i++) {
            setTimeout(createFloatingHeart, i * 35);
          }
        }

      }, 850);

    }, 500);
  }

  if (giftBoxWrapper) {
    giftBoxWrapper.addEventListener('click', triggerOpenGift);
    giftBoxWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerOpenGift();
      }
    });
  }

  // ==============================================================
  // 4. HERO MAXIMAL PHOTO & THUMBNAIL SWITCHER
  // ==============================================================
  const mainDisplayImg = document.getElementById('mainDisplayImg');
  const heroPhotoWrap = document.getElementById('heroPhotoWrap');
  const thumbNavButtons = document.querySelectorAll('.thumb-nav-btn');
  const photoMainTag = document.getElementById('photoMainTag');

  const photoList = [
    'assets/photo3.jpg',
    'assets/photo1.jpg',
    'assets/photo2.jpg'
  ];

  const photoCaptions = {
    'assets/photo3.jpg': 'Best Memory ✦ Abiasoyy 🤍',
    'assets/photo1.jpg': 'Abiasoyy Sang Legenda ✨',
    'assets/photo2.jpg': 'Santai Dulu Ga Sih ☕'
  };

  let currentPhotoIdx = 0;

  function switchMainPhoto(targetSrc, clickedBtn) {
    if (!mainDisplayImg || !targetSrc) return;
    
    thumbNavButtons.forEach(b => b.classList.remove('active'));
    if (clickedBtn) {
      clickedBtn.classList.add('active');
    } else {
      thumbNavButtons.forEach(b => {
        if (b.getAttribute('data-src') === targetSrc) b.classList.add('active');
      });
    }

    mainDisplayImg.style.opacity = '0.2';
    mainDisplayImg.style.transform = 'scale(0.98)';

    setTimeout(() => {
      mainDisplayImg.src = targetSrc;
      mainDisplayImg.style.opacity = '1';
      mainDisplayImg.style.transform = 'scale(1)';
    }, 150);

    if (photoMainTag && photoCaptions[targetSrc]) {
      photoMainTag.textContent = photoCaptions[targetSrc];
    }
  }

  thumbNavButtons.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentPhotoIdx = idx;
      const targetSrc = btn.getAttribute('data-src');
      switchMainPhoto(targetSrc, btn);
    });
  });

  // Clicking main photo frame advances to next photo automatically!
  if (heroPhotoWrap) {
    heroPhotoWrap.addEventListener('click', () => {
      currentPhotoIdx = (currentPhotoIdx + 1) % photoList.length;
      const nextSrc = photoList[currentPhotoIdx];
      switchMainPhoto(nextSrc);
    });
  }

  // ==============================================================
  // 5. INTERACTIVE CANDLES ALTAR (Blow Candles Out & In)
  // ==============================================================
  const candlesCluster = document.getElementById('candlesCluster');
  const candleFlames = [
    document.getElementById('flame1'),
    document.getElementById('flame2'),
    document.getElementById('flame3'),
    document.getElementById('flame4'),
    document.getElementById('flame5')
  ];
  const candlesGuideText = document.getElementById('candlesGuideText');
  let areFlamesBlown = false;

  if (candlesCluster) {
    candlesCluster.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!areFlamesBlown) {
        areFlamesBlown = true;
        candleFlames.forEach(f => {
          if (f) f.classList.add('flame-extinguished');
        });
        if (candlesGuideText) {
          candlesGuideText.textContent = '✨ Yeay! Lilin berhasil ditiup, semoga semua harapan Abiasoyy terkabul! 🤍';
          candlesGuideText.style.color = '#DB2777';
        }

        // Shower of love hearts
        for (let i = 0; i < 24; i++) {
          setTimeout(createFloatingHeart, i * 30);
        }
      } else {
        areFlamesBlown = false;
        candleFlames.forEach(f => {
          if (f) f.classList.remove('flame-extinguished');
        });
        if (candlesGuideText) {
          candlesGuideText.textContent = '🕯️ Lilin menyala lagi! Klik untuk tiup & buat harapanmu! 🤍';
          candlesGuideText.style.color = '#7E22CE';
        }
      }
    });
  }

});
