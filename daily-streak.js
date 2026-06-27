/* ============================================================
   DAILY STREAK SYSTEM — JAVASCRIPT
   daily-streak.js
   CRAZiNOS — Kidzinos App
   ============================================================ */

// ── 1. STREAK STATE & STORAGE ─────────────────────────────

const STREAK_KEY = 'kidzinos_streak_v2';

let streakState = {
  streak: 5,         // Current day streak count
  treeDay: 5,        // Tree growth day (never resets)
  lastCompleted: null, // ISO date string YYYY-MM-DD
  todayDone: false,
  todayActivity: null,
  mathPersonalBest: 0,
  wordPersonalBest: 0,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStreakState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    if (saved.streak !== undefined)         streakState.streak = saved.streak;
    if (saved.treeDay !== undefined)        streakState.treeDay = saved.treeDay;
    if (saved.lastCompleted)               streakState.lastCompleted = saved.lastCompleted;
    if (saved.mathPersonalBest !== undefined) streakState.mathPersonalBest = saved.mathPersonalBest;
    if (saved.wordPersonalBest !== undefined) streakState.wordPersonalBest = saved.wordPersonalBest;
  } catch(e) {}
}

function saveStreakState() {
  localStorage.setItem(STREAK_KEY, JSON.stringify({
    streak: streakState.streak,
    treeDay: streakState.treeDay,
    lastCompleted: streakState.lastCompleted,
    mathPersonalBest: streakState.mathPersonalBest,
    wordPersonalBest: streakState.wordPersonalBest,
  }));
}

// ── 2. INITIALIZATION ─────────────────────────────────────

function initStreakSystem() {
  loadStreakState();

  const today = todayStr();
  const yesterday = yesterdayStr();

  // Check if streak should reset (missed a day)
  if (streakState.lastCompleted && streakState.lastCompleted !== today && streakState.lastCompleted !== yesterday) {
    streakState.streak = 0; // Missed at least one day
    saveStreakState();
  }

  // Check if today is already done
  streakState.todayDone = (streakState.lastCompleted === today);

  // Sync into app state for rest of app
  if (typeof state !== 'undefined') {
    state.user.streak = streakState.streak;
  }

  renderStreakCard();
  updateHomeStreakBadge();
}

// ── 3. MARK STREAK COMPLETE ───────────────────────────────

function markStreakComplete(activity, coinsEarned) {
  const today = todayStr();
  if (streakState.lastCompleted === today) return; // Already done today

  const yesterday = yesterdayStr();
  // Increment streak if yesterday was completed OR if it's first time
  if (streakState.lastCompleted === yesterday || !streakState.lastCompleted) {
    streakState.streak += 1;
  } else {
    // Gap — start from 1
    streakState.streak = 1;
  }

  streakState.treeDay += 1;
  streakState.lastCompleted = today;
  streakState.todayDone = true;
  streakState.todayActivity = activity;

  // Sync to main state
  if (typeof state !== 'undefined') {
    state.user.streak = streakState.streak;
    const bonus = streakState.streak >= 7 ? 25 : streakState.streak >= 5 ? 15 : streakState.streak >= 3 ? 10 : 5;
    state.user.zinoCoins += bonus + (coinsEarned || 0);
    if (typeof saveGameState === 'function') saveGameState();
    if (typeof updateAllZinos === 'function') updateAllZinos();
  }

  saveStreakState();

  // Update old streak system too (compatibility)
  localStorage.setItem('kidzinos_last_streak_claim', new Date().toDateString());

  renderStreakCard();
  updateHomeStreakBadge();
  updateProfileStreak();

  // Fire completion overlay
  showStreakCompleteOverlay(activity, coinsEarned || 0);
}

// ── 4. RENDER HOME STREAK CARD ────────────────────────────

function renderStreakCard() {
  const card = document.getElementById('daily-streak-card');
  if (!card) return;

  const greeting = getGreeting();

  const headerHtml = streakState.todayDone ? `
      <div class="dsc-header">
        <div class="dsc-greeting" style="color:#22c55e">✅ Streak Completed!</div>
        <div class="dsc-subtext">You've done your streak today, but you can keep playing for fun!</div>
      </div>
  ` : `
      <div class="dsc-header">
        <div class="dsc-greeting">${greeting}</div>
        <div class="dsc-subtext">Complete ONE activity to keep your streak alive 🔥</div>
      </div>
  `;

  card.className = streakState.todayDone ? 'home-sub-card daily-streak-card dsc-completed' : 'home-sub-card daily-streak-card';
  card.innerHTML = `
      ${headerHtml}
      <div class="dsc-activities-grid">
        <button class="dsc-activity-btn dsc-btn-tree" id="dsc-btn-tree" onclick="launchStreakActivity('tree')">
          <span class="btn-emoji">🌳</span>
          <span class="btn-label">Water Tree</span>
          <span class="btn-time">30 seconds</span>
        </button>
        <button class="dsc-activity-btn dsc-btn-math" id="dsc-btn-math" onclick="launchStreakActivity('math')">
          <span class="btn-emoji">➕</span>
          <span class="btn-label">Math Sprint</span>
          <span class="btn-time">1 minute</span>
        </button>
        <button class="dsc-activity-btn dsc-btn-word" id="dsc-btn-word" onclick="launchStreakActivity('word')">
          <span class="btn-emoji">🔤</span>
          <span class="btn-label">Word Sprint</span>
          <span class="btn-time">1 minute</span>
        </button>
        <button class="dsc-activity-btn dsc-btn-challenge" id="dsc-btn-challenge" onclick="navigateTo('play')">
          <span class="btn-emoji">🏆</span>
          <span class="btn-label">Daily Challenge</span>
          <span class="btn-time">Auto-completes</span>
        </button>
      </div>
      <div class="dsc-streak-footer">
        <div class="dsc-streak-info">
          <span class="dsc-fire-icon">🔥</span>
          <div>
            <div class="dsc-streak-label">Current Streak</div>
            <div class="dsc-streak-num">${streakState.streak} Days</div>
          </div>
        </div>
        <button class="dsc-tree-link" onclick="navigateTo('my-tree')">
          🌳 My Tree
        </button>
      </div>
  `;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning! 👋';
  if (h < 17) return 'Good Afternoon! ☀️';
  return 'Good Evening! 🌙';
}

function updateHomeStreakBadge() {
  // Update header streak badge
  const badgeEl = document.getElementById('home-streak-count');
  if (badgeEl) badgeEl.textContent = streakState.streak;

  // Update old streak card elements for compatibility
  const shhCount = document.getElementById('shh-streak-count');
  if (shhCount) shhCount.textContent = streakState.streak;
  const shhDscNum = document.getElementById('dsc-streak-num');
  if (shhDscNum) shhDscNum.textContent = streakState.streak;

  // Update home-streak-calendar in old card
  const cal = document.getElementById('home-streak-calendar');
  if (cal) {
    cal.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
      const d = document.createElement('div');
      d.style.cssText = `width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;
        background:${i <= streakState.streak ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.05)'};
        border:1.5px solid ${i <= streakState.streak ? '#ff6b00' : 'rgba(255,255,255,0.08)'};
        color:${i <= streakState.streak ? '#ff6b00' : 'rgba(255,255,255,0.3)'}`;
      d.textContent = i <= streakState.streak ? '🔥' : i;
      cal.appendChild(d);
    }
  }
}

function updateProfileStreak() {
  const profStreak = document.querySelector('#profile-av-badge, .prof-avatar-badge');
  if (profStreak) profStreak.innerHTML = `<i class="fa-solid fa-fire"></i> ${streakState.streak}`;
  // Update the stat card
  const statCards = document.querySelectorAll('.prof-stat-card');
  statCards.forEach(card => {
    const lbl = card.querySelector('.prof-stat-lbl');
    const val = card.querySelector('.prof-stat-val');
    if (lbl && lbl.textContent.includes('Streak') && val) {
      val.textContent = streakState.streak;
    }
  });
}

// ── 5. ACTIVITY LAUNCHER ──────────────────────────────────

function launchStreakActivity(type) {
  switch (type) {
    case 'tree': openWaterTreeModal(); break;
    case 'math': openMathSprintModal(); break;
    case 'word': openWordSprintModal(); break;
    case 'contest': markStreakComplete('contest', 0); break;
  }
}

// Called from quiz completion in app.js
function notifyStreakFromContest() {
  if (!streakState.todayDone) {
    markStreakComplete('contest', 0);
  }
}

// ── 6. WATER THE TREE ─────────────────────────────────────

let waterTreeState = {
  holding: false,
  elapsed: 0,
  interval: null,
  particleInterval: null,
  required: 30,
};

function openWaterTreeModal() {
  const modal = document.getElementById('modal-water-tree');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Reset
  waterTreeState.holding = false;
  waterTreeState.elapsed = 0;
  clearInterval(waterTreeState.interval);
  clearInterval(waterTreeState.particleInterval);

  updateTreeVisual();
  updateWaterRing(0);
  const timerText = document.getElementById('water-timer-text');
  if (timerText) timerText.textContent = 'Hold the button for 30 seconds!';
}

function closeWaterTreeModal() {
  const modal = document.getElementById('modal-water-tree');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  clearInterval(waterTreeState.interval);
  clearInterval(waterTreeState.particleInterval);
  waterTreeState.holding = false;
  stopWaterParticles();
}

function startHoldWater() {
  if (waterTreeState.elapsed >= waterTreeState.required) return;
  waterTreeState.holding = true;
  const btn = document.getElementById('water-hold-btn');
  if (btn) btn.classList.add('holding');

  const treeEl = document.querySelector('.tree-container');
  if (treeEl) treeEl.classList.add('tree-watering');

  startWaterParticles();

  waterTreeState.interval = setInterval(() => {
    waterTreeState.elapsed += 0.25;
    const pct = Math.min(waterTreeState.elapsed / waterTreeState.required, 1);
    updateWaterRing(pct);

    const sec = Math.ceil(waterTreeState.required - waterTreeState.elapsed);
    const timerText = document.getElementById('water-timer-text');
    if (timerText) timerText.textContent = sec > 0 ? `Keep watering... ${sec}s to go! 💧` : 'Almost done!';

    if (waterTreeState.elapsed >= waterTreeState.required) {
      clearInterval(waterTreeState.interval);
      clearInterval(waterTreeState.particleInterval);
      stopWaterParticles();
      onWaterTreeComplete();
    }
  }, 250);
}

function stopHoldWater() {
  if (!waterTreeState.holding) return;
  waterTreeState.holding = false;
  clearInterval(waterTreeState.interval);
  clearInterval(waterTreeState.particleInterval);
  stopWaterParticles();

  const btn = document.getElementById('water-hold-btn');
  if (btn) btn.classList.remove('holding');
  const treeEl = document.querySelector('.tree-container');
  if (treeEl) treeEl.classList.remove('tree-watering');

  const timerText = document.getElementById('water-timer-text');
  if (timerText && waterTreeState.elapsed < waterTreeState.required) {
    timerText.textContent = `Hold again to continue! (${Math.floor(waterTreeState.elapsed)}s / 30s)`;
  }
}

function updateWaterRing(pct) {
  const ring = document.getElementById('water-ring-progress');
  if (!ring) return;
  const circumference = 264;
  ring.style.strokeDashoffset = circumference - (pct * circumference);
}

function startWaterParticles() {
  const container = document.querySelector('.water-particles-container');
  if (!container) return;
  waterTreeState.particleInterval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      const drop = document.createElement('div');
      drop.className = 'water-drop';
      drop.style.left = (35 + Math.random() * 30) + '%';
      drop.style.top = (20 + Math.random() * 10) + '%';
      drop.style.animationDuration = (0.6 + Math.random() * 0.4) + 's';
      drop.style.animationDelay = (Math.random() * 0.2) + 's';
      drop.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;
      container.appendChild(drop);
      setTimeout(() => drop.remove(), 1000);
    }
  }, 120);
}

function stopWaterParticles() {
  clearInterval(waterTreeState.particleInterval);
}

function updateTreeVisual() {
  const container = document.querySelector('#modal-water-tree .tree-container');
  if (!container) return;
  const stage = getTreeStage(streakState.treeDay);
  container.className = `tree-container tree-stage-${stage}`;

  // Update tree info
  const { height, label } = getTreeHeightInfo(streakState.treeDay);
  const dayEl = document.getElementById('tree-info-day');
  const heightEl = document.getElementById('tree-info-height');
  const stageEl = document.getElementById('tree-info-stage');
  if (dayEl) dayEl.textContent = `Day ${streakState.treeDay || 1}`;
  if (heightEl) heightEl.textContent = height;
  if (stageEl) stageEl.textContent = label;
}

function onWaterTreeComplete() {
  const btn = document.getElementById('water-hold-btn');
  if (btn) {
    btn.innerHTML = '✅';
    btn.classList.remove('holding');
  }
  const treeEl = document.querySelector('.tree-container');
  if (treeEl) treeEl.classList.remove('tree-watering');
  
  const today = todayStr();
  const alreadyDone = (streakState.lastCompleted === today);
  
  const timerText = document.getElementById('water-timer-text');
  const heightEl = document.getElementById('tree-info-height');

  if (alreadyDone) {
    if (timerText) {
      timerText.innerHTML = `🌳 Tree watered! (Already grown today)`;
    }
  } else {
    const newDay = streakState.treeDay + 1; // It will be incremented by markStreakComplete
    const newInfo = getTreeHeightInfo(newDay);
    
    if (timerText) {
      timerText.innerHTML = `🌳 Tree watered! <span style="color:#4ade80;font-weight:bold;">+5cm</span><br>Net Height: <b>${newInfo.height}</b>`;
    }
    if (heightEl) {
      heightEl.textContent = newInfo.height;
      heightEl.classList.add('height-increase-anim');
    }
  }

  setTimeout(() => {
    closeWaterTreeModal();
    if (heightEl) heightEl.classList.remove('height-increase-anim');
    markStreakComplete('tree', 0);
  }, 2500);
}

// ── 7. TREE GROWTH HELPERS ────────────────────────────────

function getTreeStage(day) {
  if (day <= 3)  return 1;
  if (day <= 7)  return 2;
  if (day <= 20) return 3;
  if (day <= 50) return 4;
  return 5;
}

function getTreeHeightInfo(day) {
  const totalCm = 12 + ((day - 1) * 5);
  let heightStr = totalCm < 100 ? totalCm + ' cm' : (totalCm / 100).toFixed(2) + ' m';
  
  if (day <= 3)  return { height: heightStr,  label: '🌱 Seedling' };
  if (day <= 7)  return { height: heightStr,  label: '🌿 Sapling' };
  if (day <= 20) return { height: heightStr,  label: '🌲 Young Tree' };
  if (day <= 50) return { height: heightStr,  label: '🌳 Tall Tree' };
  return { height: heightStr, label: '🌴 Mighty Palm' };
}

// ── 8. MATH SPRINT ────────────────────────────────────────

let mathState = {
  running: false,
  timeLeft: 60,
  score: 0,
  combo: 0,
  maxCombo: 0,
  interval: null,
  currentQuestion: null,
  answers: [],
};

const mathQuestions = {
  easy: [
    { q: '3 + 4', a: 7 }, { q: '8 + 6', a: 14 }, { q: '5 + 9', a: 14 },
    { q: '12 + 7', a: 19 }, { q: '15 + 8', a: 23 }, { q: '6 + 11', a: 17 },
    { q: '9 - 3', a: 6 }, { q: '15 - 7', a: 8 }, { q: '20 - 6', a: 14 },
    { q: '18 - 9', a: 9 }, { q: '14 - 5', a: 9 }, { q: '25 - 8', a: 17 },
    { q: '4 × 3', a: 12 }, { q: '5 × 4', a: 20 }, { q: '3 × 7', a: 21 },
    { q: '6 × 4', a: 24 }, { q: '2 × 9', a: 18 }, { q: '7 × 3', a: 21 },
    { q: '8 ÷ 2', a: 4 }, { q: '12 ÷ 3', a: 4 }, { q: '15 ÷ 5', a: 3 },
    { q: '16 ÷ 4', a: 4 }, { q: '20 ÷ 5', a: 4 }, { q: '18 ÷ 6', a: 3 },
  ],
  medium: [
    { q: '13 + 19', a: 32 }, { q: '27 + 15', a: 42 }, { q: '38 + 14', a: 52 },
    { q: '45 - 17', a: 28 }, { q: '63 - 28', a: 35 }, { q: '52 - 19', a: 33 },
    { q: '8 × 6', a: 48 }, { q: '7 × 7', a: 49 }, { q: '9 × 6', a: 54 },
    { q: '24 ÷ 6', a: 4 }, { q: '36 ÷ 9', a: 4 }, { q: '42 ÷ 7', a: 6 },
  ]
};

function generateMathQuestion() {
  const pool = streakState.mathPersonalBest > 10 ? [...mathQuestions.easy, ...mathQuestions.medium] : mathQuestions.easy;
  const q = pool[Math.floor(Math.random() * pool.length)];
  const correct = q.a;
  // Generate 3 wrong answers
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * 8) + 1;
    const w = Math.random() < 0.5 ? correct + offset : Math.abs(correct - offset);
    if (w !== correct) wrongs.add(w);
  }
  const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5);
  return { question: q.q, correct, opts };
}

function openMathSprintModal() {
  const modal = document.getElementById('modal-math-sprint');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showMathStart();
}

function closeMathSprintModal() {
  const modal = document.getElementById('modal-math-sprint');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  clearInterval(mathState.interval);
  mathState.running = false;
}

function showMathStart() {
  const body = document.getElementById('math-sprint-body');
  if (!body) return;
  body.innerHTML = `
    <div class="ms-start-screen">
      <div class="ms-icon-big">➕</div>
      <div class="ms-start-title">Math Sprint!</div>
      <div class="ms-start-desc">Answer as many easy maths questions as you can in <strong>60 seconds</strong>. +1 Zino Coin per correct answer!</div>
      ${streakState.mathPersonalBest > 0 ? `<div class="ms-pb-badge">🏆 Personal Best: ${streakState.mathPersonalBest}</div>` : ''}
      <button class="ms-start-btn" onclick="startMathSprint()">Let's Go! 🚀</button>
    </div>
  `;
}

function startMathSprint() {
  mathState.running = true;
  mathState.timeLeft = 60;
  mathState.score = 0;
  mathState.combo = 0;

  const body = document.getElementById('math-sprint-body');
  if (!body) return;
  body.innerHTML = `
    <div class="ms-timer-row">
      <div class="ms-timer-ring">
        <svg viewBox="0 0 72 72">
          <circle class="ms-ring-bg" cx="36" cy="36" r="31.5"/>
          <circle class="ms-ring-progress" id="ms-ring" cx="36" cy="36" r="31.5"/>
        </svg>
        <div class="ms-timer-inner" id="ms-timer-inner">60</div>
      </div>
      <div class="ms-score-info">
        <div class="ms-score-label">Correct</div>
        <div class="ms-score-current" id="ms-score-display">0</div>
        ${streakState.mathPersonalBest > 0 ? `<div class="ms-pb-badge">PB: ${streakState.mathPersonalBest}</div>` : ''}
      </div>
    </div>
    <div class="ms-question-area" id="ms-question-area">
      <div class="ms-correct-flash" id="ms-correct-flash"></div>
      <div class="ms-question-text" id="ms-question-text">Loading...</div>
    </div>
    <div class="ms-answers-grid" id="ms-answers-grid"></div>
    <div class="ms-combo-banner" id="ms-combo-banner">🔥 <span id="ms-combo-text">5 in a Row!</span></div>
  `;

  nextMathQuestion();

  // Timer countdown
  mathState.interval = setInterval(() => {
    mathState.timeLeft--;
    const timerEl = document.getElementById('ms-timer-inner');
    if (timerEl) timerEl.textContent = mathState.timeLeft;

    // Ring update
    const ring = document.getElementById('ms-ring');
    if (ring) {
      const pct = mathState.timeLeft / 60;
      const dashOffset = 198 * (1 - pct);
      ring.style.strokeDashoffset = dashOffset;
      if (mathState.timeLeft <= 10) ring.classList.add('urgent');
    }

    if (mathState.timeLeft <= 0) {
      clearInterval(mathState.interval);
      mathState.running = false;
      endMathSprint();
    }
  }, 1000);
}

function nextMathQuestion() {
  mathState.currentQuestion = generateMathQuestion();
  const qEl = document.getElementById('ms-question-text');
  const grid = document.getElementById('ms-answers-grid');
  if (!qEl || !grid) return;

  qEl.classList.add('flash-out');
  setTimeout(() => {
    qEl.textContent = mathState.currentQuestion.question + ' = ?';
    qEl.classList.remove('flash-out');
    qEl.classList.add('flash-in');
    setTimeout(() => qEl.classList.remove('flash-in'), 300);
  }, 120);

  grid.innerHTML = mathState.currentQuestion.opts.map((opt, i) =>
    `<button class="ms-answer-btn" id="ms-ans-${i}" onclick="checkMathAnswer(${opt}, ${i})">${opt}</button>`
  ).join('');
}

function checkMathAnswer(val, btnIdx) {
  if (!mathState.running || !mathState.currentQuestion) return;

  const isCorrect = val === mathState.currentQuestion.correct;
  const btns = document.querySelectorAll('.ms-answer-btn');
  btns.forEach(b => b.onclick = null); // Disable all buttons briefly

  if (isCorrect) {
    document.getElementById(`ms-ans-${btnIdx}`)?.classList.add('correct');
    const flash = document.getElementById('ms-correct-flash');
    if (flash) { flash.classList.add('active'); setTimeout(() => flash.classList.remove('active'), 400); }

    mathState.score++;
    mathState.combo++;

    const scoreEl = document.getElementById('ms-score-display');
    if (scoreEl) scoreEl.textContent = mathState.score;

    // Combo display
    if (mathState.combo >= 3) {
      const comboBanner = document.getElementById('ms-combo-banner');
      const comboText = document.getElementById('ms-combo-text');
      if (comboBanner && comboText) {
        comboText.textContent = `${mathState.combo} in a Row! 🔥`;
        comboBanner.className = 'ms-combo-banner visible';
      }
    }

    // Award zino coin
    if (typeof state !== 'undefined') {
      state.user.zinoCoins += 1;
      if (typeof updateAllZinos === 'function') updateAllZinos();
    }

    setTimeout(() => nextMathQuestion(), 350);
  } else {
    document.getElementById(`ms-ans-${btnIdx}`)?.classList.add('wrong');
    mathState.combo = 0;
    const comboBanner = document.getElementById('ms-combo-banner');
    if (comboBanner) comboBanner.className = 'ms-combo-banner';
    setTimeout(() => {
      btns.forEach(b => b.onclick = b.onclick); // Re-enable
      nextMathQuestion();
    }, 500);
  }
}

function endMathSprint() {
  if (mathState.score > streakState.mathPersonalBest) {
    streakState.mathPersonalBest = mathState.score;
    saveStreakState();
  }
  const body = document.getElementById('math-sprint-body');
  if (!body) return;
  const isPB = mathState.score >= streakState.mathPersonalBest;

  body.innerHTML = `
    <div class="ms-result-screen">
      <div class="ms-icon-big">🎉</div>
      <div class="ms-result-score">${mathState.score}</div>
      <div class="ms-result-label">Correct Answers</div>
      ${isPB ? `<div class="ms-result-pb">🏆 New Personal Best!</div>` : `<div class="ms-result-pb">Best: ${streakState.mathPersonalBest}</div>`}
      <div style="font-size:0.85rem;color:rgba(255,255,255,0.5);margin-top:4px">+${mathState.score} Zino Coins earned!</div>
      <button class="ms-start-btn" onclick="closeMathSprintModal()" style="margin-top:8px">
        🔥 Streak Complete!
      </button>
    </div>
  `;

  markStreakComplete('math', 0); // Coins already awarded per-question
}

// ── 9. WORD SPRINT ────────────────────────────────────────

// Pre-built 4×4 grid with valid words hidden inside
const WORD_GRID_SETS = [
  {
    letters: ['C','A','T','S','R','O','P','E','B','I','R','D','F','I','S','H'],
    validWords: ['CAT','CATS','RAP','ROB','ARC','CAP','ROPE','BIRD','FISH','IRE','ORB','BIO','RIP','BIT']
  },
  {
    letters: ['P','L','A','Y','R','U','N','S','J','O','Y','K','F','U','N','T'],
    validWords: ['PLAY','RUN','RUNS','JOY','FUN','YOLK','LAP','PAN','ANT','RAP','NAP','JOT']
  },
  {
    letters: ['S','T','A','R','M','O','O','N','S','U','N','K','W','I','N','D'],
    validWords: ['STAR','STARS','MOON','SUN','WIN','WIND','OON','MOO','NOW','OWN','RUN','RUIN']
  }
];

let wordState = {
  running: false,
  timeLeft: 60,
  score: 0,
  interval: null,
  selectedIdx: [],
  currentWord: '',
  foundWords: new Set(),
  gridSet: null,
};

function openWordSprintModal() {
  const modal = document.getElementById('modal-word-sprint');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showWordStart();
}

function closeWordSprintModal() {
  const modal = document.getElementById('modal-word-sprint');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  clearInterval(wordState.interval);
  wordState.running = false;
}

function showWordStart() {
  const body = document.getElementById('word-sprint-body');
  if (!body) return;
  body.innerHTML = `
    <div class="ws-start-screen">
      <div class="ms-icon-big">🔤</div>
      <div class="ms-start-title">Word Sprint!</div>
      <div class="ms-start-desc">Find as many words as possible in the letter grid in <strong>60 seconds</strong>. +1 Zino Coin per word!</div>
      ${streakState.wordPersonalBest > 0 ? `<div class="ms-pb-badge">🏆 Personal Best: ${streakState.wordPersonalBest} words</div>` : ''}
      <button class="ms-start-btn" onclick="startWordSprint()">Let's Go! 🚀</button>
    </div>
  `;
}

function startWordSprint() {
  wordState.running = true;
  wordState.timeLeft = 60;
  wordState.score = 0;
  wordState.selectedIdx = [];
  wordState.currentWord = '';
  wordState.foundWords = new Set();
  wordState.gridSet = WORD_GRID_SETS[Math.floor(Math.random() * WORD_GRID_SETS.length)];

  const body = document.getElementById('word-sprint-body');
  if (!body) return;

  body.innerHTML = `
    <div class="ws-header-row">
      <div class="ws-timer-display" id="ws-timer">60</div>
      <div class="ws-score-box">
        <div class="ws-score-val" id="ws-score">0</div>
        <div class="ws-score-lbl">Words</div>
      </div>
    </div>
    <div class="ws-current-word" id="ws-current-word">Tap letters to spell a word...</div>
    <div class="ws-letter-grid" id="ws-letter-grid"></div>
    <div class="ws-actions-row">
      <button class="ws-submit-btn" onclick="submitWord()">✓ Submit</button>
      <button class="ws-clear-btn" onclick="clearWordSelection()">✕ Clear</button>
    </div>
    <div class="ws-found-words" id="ws-found-words"></div>
  `;

  renderWordGrid();

  wordState.interval = setInterval(() => {
    wordState.timeLeft--;
    const timerEl = document.getElementById('ws-timer');
    if (timerEl) {
      timerEl.textContent = wordState.timeLeft;
      if (wordState.timeLeft <= 10) timerEl.classList.add('urgent');
    }
    if (wordState.timeLeft <= 0) {
      clearInterval(wordState.interval);
      wordState.running = false;
      endWordSprint();
    }
  }, 1000);
}

function renderWordGrid() {
  const grid = document.getElementById('ws-letter-grid');
  if (!grid || !wordState.gridSet) return;
  grid.innerHTML = wordState.gridSet.letters.map((letter, i) =>
    `<button class="ws-letter-btn" id="ws-l-${i}" onclick="selectLetter(${i},'${letter}')">${letter}</button>`
  ).join('');
}

function selectLetter(idx, letter) {
  if (!wordState.running) return;
  const alreadySelected = wordState.selectedIdx.includes(idx);
  if (alreadySelected) {
    // Remove from selection
    wordState.selectedIdx = wordState.selectedIdx.filter(i => i !== idx);
    document.getElementById(`ws-l-${idx}`)?.classList.remove('selected');
    wordState.currentWord = wordState.selectedIdx.map(i => wordState.gridSet.letters[i]).join('');
  } else {
    wordState.selectedIdx.push(idx);
    document.getElementById(`ws-l-${idx}`)?.classList.add('selected');
    wordState.currentWord += letter;
  }

  const wordEl = document.getElementById('ws-current-word');
  if (wordEl) {
    wordEl.textContent = wordState.currentWord || 'Tap letters to spell a word...';
    wordEl.className = 'ws-current-word';
  }
}

function submitWord() {
  if (!wordState.running || !wordState.currentWord) return;
  const word = wordState.currentWord.toUpperCase();

  const isValid = wordState.gridSet.validWords.includes(word) && !wordState.foundWords.has(word);

  if (isValid) {
    wordState.foundWords.add(word);
    wordState.score++;

    const wordEl = document.getElementById('ws-current-word');
    if (wordEl) { wordEl.className = 'ws-current-word word-correct'; wordEl.textContent = word + ' ✓'; }

    const scoreEl = document.getElementById('ws-score');
    if (scoreEl) scoreEl.textContent = wordState.score;

    // Add chip
    const foundEl = document.getElementById('ws-found-words');
    if (foundEl) {
      const chip = document.createElement('div');
      chip.className = 'ws-found-chip';
      chip.textContent = word;
      foundEl.appendChild(chip);
    }

    // Award coin
    if (typeof state !== 'undefined') {
      state.user.zinoCoins += 1;
      if (typeof updateAllZinos === 'function') updateAllZinos();
    }

    setTimeout(() => {
      clearWordSelection();
      const wordEl = document.getElementById('ws-current-word');
      if (wordEl) wordEl.className = 'ws-current-word';
    }, 600);
  } else {
    const wordEl = document.getElementById('ws-current-word');
    if (wordEl) {
      if (wordState.foundWords.has(word)) {
        wordEl.className = 'ws-current-word word-wrong';
        wordEl.textContent = word + ' (already found!)';
      } else {
        wordEl.className = 'ws-current-word word-wrong';
        wordEl.textContent = word + ' ✗';
      }
      setTimeout(() => { clearWordSelection(); }, 600);
    }
  }
}

function clearWordSelection() {
  wordState.selectedIdx = [];
  wordState.currentWord = '';
  document.querySelectorAll('.ws-letter-btn').forEach(b => b.classList.remove('selected'));
  const wordEl = document.getElementById('ws-current-word');
  if (wordEl) { wordEl.textContent = 'Tap letters to spell a word...'; wordEl.className = 'ws-current-word'; }
}

function endWordSprint() {
  if (wordState.score > streakState.wordPersonalBest) {
    streakState.wordPersonalBest = wordState.score;
    saveStreakState();
  }
  const body = document.getElementById('word-sprint-body');
  if (!body) return;
  const isPB = wordState.score >= streakState.wordPersonalBest;

  body.innerHTML = `
    <div class="ws-result-screen">
      <div class="ms-icon-big">🎉</div>
      <div class="ms-result-score">${wordState.score}</div>
      <div class="ms-result-label">Words Found</div>
      ${isPB ? `<div class="ms-result-pb">🏆 New Personal Best!</div>` : `<div class="ms-result-pb">Best: ${streakState.wordPersonalBest} words</div>`}
      <div style="font-size:0.85rem;color:rgba(255,255,255,0.5);margin-top:4px">+${wordState.score} Zino Coins earned!</div>
      <button class="ms-start-btn" onclick="closeWordSprintModal()" style="margin-top:8px">
        🔥 Streak Complete!
      </button>
    </div>
  `;

  markStreakComplete('word', 0);
}

// ── 10. STREAK COMPLETE OVERLAY ───────────────────────────

function showStreakCompleteOverlay(activity, extraCoins) {
  const modal = document.getElementById('modal-streak-complete');
  if (!modal) return;
  modal.classList.remove('hidden');

  const activityLabels = {
    tree: '🌳 Tree Watered!',
    math: '➕ Math Sprint Done!',
    word: '🔤 Word Sprint Done!',
    contest: '🏆 Challenge Complete!',
  };

  const bonusCoins = streakState.streak >= 7 ? 25 : streakState.streak >= 5 ? 15 : streakState.streak >= 3 ? 10 : 5;

  document.getElementById('sc-activity-label').textContent = activityLabels[activity] || '✅ Activity Done!';
  document.getElementById('sc-day-badge-text').textContent = `🔥 Day ${streakState.streak}`;
  document.getElementById('sc-coins-text').textContent = `+${bonusCoins} Bonus Zino Coins!`;

  fireConfetti();
}

function closeStreakCompleteOverlay() {
  const modal = document.getElementById('modal-streak-complete');
  if (modal) modal.classList.add('hidden');
}

// ── 11. CONFETTI ──────────────────────────────────────────

function fireConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#ff2e4c','#ffd700','#22c55e','#60b8f0','#a855f7','#ff6b00','#fff'];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: 6 + Math.random() * 8,
      height: 3 + Math.random() * 5,
      angle: Math.random() * Math.PI * 2,
      angularVel: (Math.random() - 0.5) * 0.15,
      opacity: 1,
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      if (p.y < canvas.height + 20) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.angle += p.angularVel;
        p.opacity = Math.max(0, 1 - (p.y / canvas.height));
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
        ctx.restore();
      }
    });
    frame++;
    if (active && frame < 200) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  animate();
}

// ── 12. MY TREE SCREEN ────────────────────────────────────

function initMyTreeScreen() {
  const stage = getTreeStage(streakState.treeDay);
  const { height, label } = getTreeHeightInfo(streakState.treeDay);

  // Update tree container
  const treeEl = document.getElementById('my-tree-display');
  if (treeEl) treeEl.className = `tree-container tree-stage-${stage}`;

  // Stats
  const dayEl = document.getElementById('mts-day');
  const heightEl = document.getElementById('mts-height');
  const stageEl = document.getElementById('mts-stage');
  if (dayEl) dayEl.textContent = streakState.treeDay || 0;
  if (heightEl) heightEl.textContent = height;
  if (stageEl) stageEl.textContent = label;

  // Milestones
  const milestones = [
    { days: 3,  emoji: '🌱', name: 'Seedling',   label: 'Day 1–3' },
    { days: 7,  emoji: '🌿', name: 'Sapling',    label: 'Day 4–7' },
    { days: 20, emoji: '🌲', name: 'Young Tree',  label: 'Day 8–20' },
    { days: 50, emoji: '🌳', name: 'Tall Tree',   label: 'Day 21–50' },
    { days: 51, emoji: '🌴', name: 'Mighty Palm', label: 'Day 51+' },
  ];

  const listEl = document.getElementById('mtm-list');
  if (listEl) {
    listEl.innerHTML = milestones.map(m => {
      const achieved = streakState.treeDay >= m.days;
      return `
        <div class="mtm-row ${achieved ? 'achieved' : ''}">
          <div class="mtm-emoji">${m.emoji}</div>
          <div class="mtm-info">
            <div class="mtm-name">${m.name}</div>
            <div class="mtm-days">${m.label}</div>
          </div>
          ${achieved ? '<div class="mtm-check">✅</div>' : '<div class="mtm-check" style="color:rgba(255,255,255,0.2)">🔒</div>'}
        </div>
      `;
    }).join('');
  }
}

function shareMyTree() {
  const { label } = getTreeHeightInfo(streakState.treeDay);
  const text = `My CRAZiNOS tree is a ${label} on Day ${streakState.treeDay}! 🌳🔥 Can you beat my streak? #Kidzinos #CrazyXYZ`;
  if (navigator.share) {
    navigator.share({ title: 'My CRAZiNOS Tree', text }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast('🌳 Tree stats copied to clipboard!');
    });
  }
}
