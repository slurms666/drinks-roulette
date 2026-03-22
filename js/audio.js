(function () {
  const root = window.Pebbs3310 || (window.Pebbs3310 = {});

  function createAudioEngine(storageKey) {
    let context = null;
    let muted = readStoredMute(storageKey);

    function readStoredMute(key) {
      try {
        return window.localStorage.getItem(key) === "muted";
      } catch (error) {
        return false;
      }
    }

    function storeMute(key, value) {
      try {
        window.localStorage.setItem(key, value ? "muted" : "on");
      } catch (error) {
        // Ignore storage failures in local file mode.
      }
    }

    function ensureContext() {
      if (!context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          context = new AudioContextClass();
        }
      }

      if (context && context.state === "suspended") {
        context.resume();
      }

      return context;
    }

    function playTone(frequency, duration, options) {
      if (muted) {
        return;
      }

      const audioContext = ensureContext();
      if (!audioContext) {
        return;
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime + (options.delay || 0);
      const end = start + duration;
      const gainValue = options.volume || 0.045;

      oscillator.type = options.wave || "square";
      oscillator.frequency.setValueAtTime(frequency, start);

      if (options.slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(options.slideTo, end);
      }

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(gainValue, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }

    function playPattern(notes) {
      notes.forEach((note) => {
        playTone(note.frequency, note.duration, note);
      });
    }

    const effects = {
      move() {
        playTone(360, 0.06, { wave: "square", volume: 0.03 });
      },
      select() {
        playPattern([
          { frequency: 420, duration: 0.06, delay: 0, wave: "square", volume: 0.04 },
          { frequency: 620, duration: 0.08, delay: 0.05, wave: "square", volume: 0.05 },
        ]);
      },
      back() {
        playTone(280, 0.08, { wave: "triangle", slideTo: 180, volume: 0.04 });
      },
      error() {
        playPattern([
          { frequency: 180, duration: 0.08, delay: 0, wave: "sawtooth", volume: 0.04 },
          { frequency: 150, duration: 0.08, delay: 0.05, wave: "sawtooth", volume: 0.03 },
        ]);
      },
      success() {
        playPattern([
          { frequency: 420, duration: 0.06, delay: 0, wave: "triangle", volume: 0.04 },
          { frequency: 560, duration: 0.07, delay: 0.05, wave: "triangle", volume: 0.04 },
          { frequency: 720, duration: 0.1, delay: 0.1, wave: "triangle", volume: 0.05 },
        ]);
      },
      hit() {
        playTone(240, 0.06, { wave: "square", volume: 0.05 });
      },
      launch() {
        playTone(510, 0.08, { wave: "square", slideTo: 810, volume: 0.05 });
      },
      loseLife() {
        playTone(220, 0.12, { wave: "triangle", slideTo: 120, volume: 0.05 });
      },
      break() {
        playTone(460, 0.05, { wave: "square", volume: 0.03 });
      },
    };

    return {
      unlock() {
        ensureContext();
      },
      play(name) {
        if (effects[name]) {
          effects[name]();
        }
      },
      tone(frequency, duration, options) {
        playTone(frequency, duration, options || {});
      },
      toggleMute() {
        muted = !muted;
        storeMute(storageKey, muted);
        return muted;
      },
      setMuted(value) {
        muted = Boolean(value);
        storeMute(storageKey, muted);
      },
      isMuted() {
        return muted;
      },
    };
  }

  root.createAudioEngine = createAudioEngine;
})();
