(function () {
  const WORK = 25 * 60;
  const BREAK = 5 * 60;

  const phaseEl = document.getElementById('study-phase');
  const timerEl = document.getElementById('study-timer');
  const startPauseBtn = document.getElementById('study-start-pause');
  const resetBtn = document.getElementById('study-reset');
  const skipBtn = document.getElementById('study-skip');

  if (!timerEl || !startPauseBtn) return;

  let phase = 'work';
  let remaining = WORK;
  let running = false;
  let tickId = null;

  function format(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function phaseLabel() {
    if (!running && remaining === WORK && phase === 'work') return 'Ready';
    return phase === 'work' ? 'Focus' : 'Short break';
  }

  function render() {
    timerEl.textContent = format(remaining);
    if (phaseEl) phaseEl.textContent = phaseLabel();
    startPauseBtn.textContent = running ? 'Pause' : 'Start';
  }

  function tick() {
    if (remaining <= 1) {
      phase = phase === 'work' ? 'break' : 'work';
      remaining = phase === 'work' ? WORK : BREAK;
      render();
      return;
    }
    remaining -= 1;
    render();
  }

  function startTimer() {
    if (tickId) return;
    tickId = setInterval(tick, 1000);
    running = true;
    render();
  }

  function stopTimer() {
    if (tickId) {
      clearInterval(tickId);
      tickId = null;
    }
    running = false;
    render();
  }

  startPauseBtn.addEventListener('click', () => {
    if (running) stopTimer();
    else startTimer();
  });

  resetBtn.addEventListener('click', () => {
    stopTimer();
    phase = 'work';
    remaining = WORK;
    render();
  });

  skipBtn.addEventListener('click', () => {
    const wasRunning = running;
    stopTimer();
    phase = phase === 'work' ? 'break' : 'work';
    remaining = phase === 'work' ? WORK : BREAK;
    render();
    if (wasRunning) startTimer();
  });

  render();

  /* ---- Ambience: three independent layers ---- */
  let audioCtx = null;

  function createBrownNoiseBuffer(ctx, seconds) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }

  function createWhiteNoiseBuffer(ctx, seconds) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function pushLoop(ctx, buffer, dest, filterSetup) {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    let node = src;
    if (typeof filterSetup === 'function') node = filterSetup(src);
    node.connect(dest);
    src.start(0);
    return src;
  }

  function gainFromSlider(el) {
    if (!el) return 0.12;
    const v = Math.max(0, Math.min(1, Number(el.value) / 100));
    return v * 0.14;
  }

  function startRain(ctx, master) {
    const loops = [];
    const rainBuf = createWhiteNoiseBuffer(ctx, 2);
    loops.push(
      pushLoop(ctx, rainBuf, master, (src) => {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2100;
        bp.Q.value = 0.4;
        src.connect(bp);
        const g = ctx.createGain();
        g.gain.value = 0.55;
        bp.connect(g);
        return g;
      })
    );
    return () => {
      loops.forEach((src) => {
        try {
          src.stop();
        } catch (_) {}
        try {
          src.disconnect();
        } catch (_) {}
      });
    };
  }

  function startFireplace(ctx, master) {
    const loops = [];
    const timers = [];
    const brownBuf = createBrownNoiseBuffer(ctx, 2);
    loops.push(
      pushLoop(ctx, brownBuf, master, (src) => {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 110;
        src.connect(lp);
        const g = ctx.createGain();
        g.gain.value = 0.55;
        lp.connect(g);
        return g;
      })
    );
    timers.push(
      window.setInterval(() => {
        if (Math.random() > 0.35) return;
        const t = ctx.currentTime;
        const dur = 0.018 + Math.random() * 0.05;
        const buf = createWhiteNoiseBuffer(ctx, dur);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 900;
        const g = ctx.createGain();
        g.gain.value = 0.04 + Math.random() * 0.22;
        src.connect(hp);
        hp.connect(g);
        g.connect(master);
        src.start(t);
        try {
          src.stop(t + dur + 0.02);
        } catch (_) {}
      }, 55 + Math.random() * 70)
    );
    return () => {
      timers.forEach((id) => clearInterval(id));
      loops.forEach((src) => {
        try {
          src.stop();
        } catch (_) {}
        try {
          src.disconnect();
        } catch (_) {}
      });
    };
  }

  function startCoffeeShop(ctx, master) {
    const loops = [];
    const oscs = [];
    const whiteBuf = createWhiteNoiseBuffer(ctx, 2);
    loops.push(
      pushLoop(ctx, whiteBuf, master, (src) => {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 950;
        bp.Q.value = 0.55;
        src.connect(bp);
        const g = ctx.createGain();
        g.gain.value = 0.28;
        bp.connect(g);
        return g;
      })
    );
    const brownBuf = createBrownNoiseBuffer(ctx, 2);
    loops.push(
      pushLoop(ctx, brownBuf, master, (src) => {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 400;
        src.connect(lp);
        const g = ctx.createGain();
        g.gain.value = 0.2;
        lp.connect(g);
        return g;
      })
    );
    const freqs = [133, 177, 211, 266, 311];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f + Math.random() * 8;
      const g = ctx.createGain();
      g.gain.value = 0.002 + Math.random() * 0.002;
      osc.connect(g);
      g.connect(master);
      osc.start();
      oscs.push(osc);
    });
    return () => {
      loops.forEach((src) => {
        try {
          src.stop();
        } catch (_) {}
        try {
          src.disconnect();
        } catch (_) {}
      });
      oscs.forEach((o) => {
        try {
          o.stop();
        } catch (_) {}
        try {
          o.disconnect();
        } catch (_) {}
      });
    };
  }

  const layerDefs = {
    rain: { start: startRain, label: 'Rain' },
    fireplace: { start: startFireplace, label: 'Fireplace' },
    coffee: { start: startCoffeeShop, label: 'Coffee shop' },
  };

  /** @type {Record<string, { master: GainNode, teardown: () => void, btn: HTMLButtonElement, vol: HTMLInputElement }>} */
  const active = {};

  function setPlayUi(btn, playing) {
    const key = btn.dataset.ambPlay;
    const lab = layerDefs[key]?.label || key;
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.textContent = playing ? '❚❚' : '▶';
    btn.setAttribute('aria-label', playing ? `Pause ${lab}` : `Play ${lab}`);
  }

  function stopLayer(key) {
    const s = active[key];
    if (!s) return;
    try {
      s.teardown();
    } catch (_) {}
    try {
      s.master.disconnect();
    } catch (_) {}
    delete active[key];
    if (s.btn) setPlayUi(s.btn, false);
  }

  function startLayer(key) {
    const ctx = ensureAudio();
    if (ctx.state === 'suspended') ctx.resume();

    stopLayer(key);

    const master = ctx.createGain();
    const volEl = document.querySelector(`[data-amb-vol="${key}"]`);
    master.gain.value = gainFromSlider(volEl);
    master.connect(ctx.destination);

    const def = layerDefs[key];
    const teardown = def.start(ctx, master);
    active[key] = { master, teardown, btn: document.querySelector(`[data-amb-play="${key}"]`), vol: volEl };
    if (active[key].btn) setPlayUi(active[key].btn, true);
  }

  document.querySelectorAll('[data-amb-play]').forEach((btn) => {
    const key = btn.dataset.ambPlay;
    if (!key || !layerDefs[key]) return;
    btn.addEventListener('click', () => {
      if (active[key]) stopLayer(key);
      else startLayer(key);
    });
  });

  document.querySelectorAll('[data-amb-vol]').forEach((range) => {
    const key = range.dataset.ambVol;
    range.addEventListener('input', () => {
      const s = active[key];
      if (s && audioCtx) {
        s.master.gain.setTargetAtTime(gainFromSlider(range), audioCtx.currentTime, 0.05);
      }
    });
  });

  /* ---- Todos + notes (localStorage, this browser only) ---- */
  const STORAGE_TODOS = 'studyTodos-v1';
  const STORAGE_NOTES = 'studyNotes-v1';
  const todoListEl = document.getElementById('study-todo-list');
  const todoInput = document.getElementById('study-todo-input');
  const todoAddBtn = document.getElementById('study-todo-add-btn');
  const notesEl = document.getElementById('study-notes');
  const notesClearBtn = document.getElementById('study-notes-clear');

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_TODOS);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function saveTodos(items) {
    localStorage.setItem(STORAGE_TODOS, JSON.stringify(items));
  }

  function uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function renderTodos(items) {
    if (!todoListEl) return;
    todoListEl.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'study-todo-item';
      li.dataset.id = item.id;

      const row = document.createElement('div');
      row.className = 'study-todo-row';
      if (item.done) row.classList.add('study-todo-done');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'study-todo-cb';
      cb.checked = !!item.done;
      cb.setAttribute('aria-label', 'Done');
      cb.addEventListener('change', () => {
        const list = loadTodos();
        const t = list.find((x) => x.id === item.id);
        if (t) t.done = cb.checked;
        saveTodos(list);
        row.classList.toggle('study-todo-done', cb.checked);
      });

      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'study-todo-text';
      inp.value = item.text || '';
      inp.placeholder = 'Task…';
      inp.addEventListener('change', () => {
        const list = loadTodos();
        const t = list.find((x) => x.id === item.id);
        if (t) t.text = inp.value.trim();
        saveTodos(list);
      });
      inp.addEventListener('blur', () => inp.dispatchEvent(new Event('change')));

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'study-todo-del';
      del.setAttribute('aria-label', 'Remove task');
      del.textContent = '×';
      del.addEventListener('click', () => {
        saveTodos(loadTodos().filter((x) => x.id !== item.id));
        renderTodos(loadTodos());
      });

      row.append(cb, inp, del);
      li.appendChild(row);
      todoListEl.appendChild(li);
    });
  }

  function addTodo() {
    if (!todoInput) return;
    const text = todoInput.value.trim();
    if (!text) return;
    const items = loadTodos();
    items.push({ id: uid(), text, done: false });
    saveTodos(items);
    todoInput.value = '';
    renderTodos(items);
    todoInput.focus();
  }

  if (todoListEl) {
    renderTodos(loadTodos());
    todoAddBtn?.addEventListener('click', addTodo);
    todoInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
      }
    });
  }

  let notesTimer = null;
  if (notesEl) {
    try {
      notesEl.value = localStorage.getItem(STORAGE_NOTES) || '';
    } catch (_) {}
    notesEl.addEventListener('input', () => {
      clearTimeout(notesTimer);
      notesTimer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_NOTES, notesEl.value);
        } catch (_) {}
      }, 350);
    });
  }

  notesClearBtn?.addEventListener('click', () => {
    if (
      !window.confirm(
        'Clear all notes? This cannot be undone.'
      )
    )
      return;
    if (notesEl) notesEl.value = '';
    try {
      localStorage.removeItem(STORAGE_NOTES);
    } catch (_) {}
  });

  window.addEventListener('beforeunload', () => {
    stopTimer();
    Object.keys(layerDefs).forEach(stopLayer);
    if (audioCtx) audioCtx.close();
  });
})();
