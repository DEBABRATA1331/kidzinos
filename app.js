/* ========================================
   KIDZINOS APP - JAVASCRIPT
   All interactions, routing, quiz logic
======================================== */

// ===== APP STATE =====
const state = {
  user: {
    name: 'Jay',
    email: 'jay@email.com',
    city: 'Mumbai',
    dob: '2011-05-12',
    mobile: '9876543210',
    zinoCoins: 250,
    csiScore: 7840,
    challengeAttempts: 37,
    streak: 5,
  },
  currentScreen: 'splash',
  quiz: {
    mode: 'daily',
    questions: [],
    current: 0,
    score: 0,
    correct: 0,
    startTime: null,
    timerInterval: null,
    timeLeft: 30,
    streak: 0,
  },
  watchProgress: {},
  pendingProduct: null,
  bannerInterval: null,
  bannerIndex: 0,
  loggedIn: false,
};

// ===== QUESTION BANK =====
const questionBank = {
  daily: [
    { q: "Which planet is known as the Red Planet?", cat: "Science", opts: ["Earth", "Mars", "Venus", "Jupiter"], ans: 1 },
    { q: "What is the chemical symbol for Water?", cat: "Chemistry", opts: ["H2O", "CO2", "NaCl", "O2"], ans: 0 },
    { q: "Who invented the telephone?", cat: "History", opts: ["Edison", "Tesla", "Bell", "Marconi"], ans: 2 },
    { q: "What is 15  8?", cat: "Mathematics", opts: ["100", "115", "120", "130"], ans: 2 },
    { q: "Which is the largest ocean?", cat: "Geography", opts: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: 3 },
    { q: "How many bones are in the human body?", cat: "Biology", opts: ["196", "206", "216", "226"], ans: 1 },
    { q: "What does DNA stand for?", cat: "Biology", opts: ["Deoxyribonucleic Acid", "Dynamic New Atom", "Double Neural Acid", "None"], ans: 0 },
    { q: "Who wrote 'Romeo and Juliet'?", cat: "Literature", opts: ["Dickens", "Austen", "Shakespeare", "Twain"], ans: 2 },
    { q: "What is the capital of India?", cat: "Geography", opts: ["Mumbai", "Delhi", "Kolkata", "Chennai"], ans: 1 },
    { q: "Which gas do plants absorb?", cat: "Science", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], ans: 2 },
  ],
  war: [
    { q: "What is Newton's First Law of Motion about?", cat: "Physics", opts: ["Gravity", "Inertia", "Energy", "Force"], ans: 1 },
    { q: "The Mahabharata was written by whom?", cat: "Culture", opts: ["Valmiki", "Tulsidas", "Vyasa", "Kalidasa"], ans: 2 },
    { q: "Which country has the most natural lakes?", cat: "Geography", opts: ["USA", "Russia", "Canada", "Brazil"], ans: 2 },
    { q: "What is the speed of light?", cat: "Physics", opts: ["310 m/s", "310 m/s", "310 m/s", "310 m/s"], ans: 0 },
    { q: "Which element has atomic number 1?", cat: "Chemistry", opts: ["Helium", "Hydrogen", "Lithium", "Carbon"], ans: 1 },
    { q: "Who was the first person in space?", cat: "Science", opts: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"], ans: 2 },
    { q: "How many sides does a hexagon have?", cat: "Mathematics", opts: ["5", "6", "7", "8"], ans: 1 },
  ],
};

// ===== SCREEN NAVIGATION =====
function navigateTo(screenId) {
  const noNav = ['splash','login','register','quiz','result'];
  const noStrip = ['splash','login','register','quiz','result'];

  const currentEl = document.getElementById(`screen-${state.currentScreen}`);
  const nextEl = document.getElementById(`screen-${screenId}`);
  if (!nextEl) return;

  // Animate out
  if (currentEl) {
    currentEl.classList.add('slide-out');
    setTimeout(() => {
      currentEl.classList.remove('active','slide-out');
      currentEl.style.display = 'none';
    }, 350);
  }

  // Animate in
  setTimeout(() => {
    nextEl.style.display = 'flex';
    requestAnimationFrame(() => {
      nextEl.classList.add('active');
    });
  }, 50);

  state.currentScreen = screenId;

  // Global brand strip
  const strip = document.getElementById('global-brand-strip');
  if (noStrip.includes(screenId)) {
    strip.classList.add('hidden');
    document.body.classList.remove('strip-visible');
  } else {
    strip.classList.remove('hidden');
    document.body.classList.add('strip-visible');
  }

  // Nav bar visibility
  const nav = document.getElementById('bottom-nav');
  if (noNav.includes(screenId)) {
    nav.classList.remove('visible');
  } else {
    nav.classList.add('visible');
    updateNavActive(screenId);
  }

  // Screen-specific init
  onScreenEnter(screenId);
}

function updateNavActive(screenId) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active-nav'));
  const navMap = { home: 'nav-home', play: 'nav-play', watch: 'nav-watch', store: 'nav-store', profile: 'nav-profile' };
  if (navMap[screenId]) {
    document.getElementById(navMap[screenId])?.classList.add('active-nav');
  }
}

function onScreenEnter(screenId) {
  switch (screenId) {
    case 'home':
      updateHomeZinos();
      startBannerSlider();
      updateHomeUserName();
      break;
    case 'store':
      document.getElementById('store-zino').textContent = state.user.zinoCoins;
      break;
    case 'profile':
      updateProfileScreen();
      break;
    case 'play':
      document.getElementById('play-zino').textContent = state.user.zinoCoins;
      break;
    case 'watch':
      const wz = document.getElementById('watch-zino-count');
      if (wz) wz.textContent = state.user.zinoCoins;
      break;
    case 'csi':
      document.getElementById('csi-score-number')?.setAttribute('data-target', state.user.csiScore);
      break;
  }
}

// ===== HOME =====
function updateHomeZinos() {
  document.getElementById('zino-count').textContent = state.user.zinoCoins;
}
function updateHomeUserName() {
  const nameEl = document.getElementById('home-username');
  if (nameEl) nameEl.textContent = state.user.name + '!';
}

// ===== BANNER SLIDER =====
function startBannerSlider() {
  if (state.bannerInterval) clearInterval(state.bannerInterval);
  state.bannerIndex = 0;
  state.bannerInterval = setInterval(() => {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.b-dot');
    slides.forEach(s => s.classList.remove('active-slide'));
    dots.forEach(d => d.classList.remove('active'));
    state.bannerIndex = (state.bannerIndex + 1) % slides.length;
    slides[state.bannerIndex].classList.add('active-slide');
    dots[state.bannerIndex].classList.add('active');
  }, 3500);
}

// ===== ONBOARDING / AUTH =====
// HARDCODED OTP FOR DEMO: always 1234
const HARDCODED_OTP = '1234';

function handleLogin() {
  const mobileGroup = document.getElementById('mobile-group');
  const otpGroup = document.getElementById('otp-group');
  const btn = document.getElementById('login-btn');
  const mobileInput = document.getElementById('mobile-input');

  if (!otpGroup.classList.contains('hidden')) {
    // ---- VERIFY OTP (hardcoded = 1234) ----
    const boxes = document.querySelectorAll('.otp-box');
    const otp = Array.from(boxes).map(b => b.value).join('');

    if (otp.length < 4) {
      shakeElement(btn);
      showToast(' Enter the 4-digit OTP');
      return;
    }

    if (otp !== HARDCODED_OTP) {
      shakeElement(btn);
      // Flash all boxes red
      boxes.forEach(b => {
        b.style.borderColor = 'var(--crazy-red)';
        b.style.background = 'rgba(239,68,68,0.1)';
        setTimeout(() => {
          b.style.borderColor = '';
          b.style.background = '';
        }, 800);
      });
      showToast(' Wrong OTP! Hint: 1234');
      return;
    }

    setTimeout(() => {
      state.loggedIn = true;
      showToast('✅ OTP Verified! Welcome back!');
      setTimeout(() => {
        navigateTo('home');
        setTimeout(() => showStreakPopup(), 1500);
      }, 800);
    }, 0);
    return;
  }

  // ---- STEP 1: Validate mobile number ----
  const mobile = mobileInput.value.trim();
  if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
    shakeElement(mobileInput);
    showToast('S Enter a valid 10-digit number');
    return;
  }

  state.user.mobile = mobile;

  // ---- Show OTP screen ----
  document.getElementById('otp-mobile-display').textContent = mobile;
  mobileGroup.classList.add('hidden');
  otpGroup.classList.remove('hidden');
  btn.querySelector('span').textContent = 'Verify OTP';
  showToast(' Demo OTP: 1 2 3 4');

  setupOtpBoxes();

  // Auto-fill hint after a tiny delay so boxes are visible
  setTimeout(() => {
    document.querySelectorAll('.otp-box')[0]?.focus();
  }, 120);
}

function setupOtpBoxes() {
  const boxes = document.querySelectorAll('.otp-box');
  // Remove old listeners by cloning
  boxes.forEach((box, i) => {
    const fresh = box.cloneNode(true);
    box.parentNode.replaceChild(fresh, box);
  });
  // Re-query after replace
  const freshBoxes = document.querySelectorAll('.otp-box');
  freshBoxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      // Only allow digits
      box.value = box.value.replace(/\D/g, '').slice(0, 1);
      if (box.value && i < freshBoxes.length - 1) freshBoxes[i + 1].focus();
      // Auto-verify when all 4 filled
      const otp = Array.from(freshBoxes).map(b => b.value).join('');
      if (otp.length === 4) setTimeout(handleLogin, 200);
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) freshBoxes[i - 1].focus();
    });
  });
}

function resendOtp() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach(b => { b.value = ''; b.style.borderColor = ''; b.style.background = ''; });
  boxes[0].focus();
  showToast(' Resent! Demo OTP is still: 1 2 3 4');
}

function goToRegister() {
  navigateTo('register');
}

function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const dob = document.getElementById('reg-dob').value;
  const city = document.getElementById('reg-city').value.trim();

  if (!name || !email || !dob || !city) {
    showToast(' Please fill all fields!');
    return;
  }

  state.user.name = name;
  state.user.email = email;
  state.user.dob = dob;
  state.user.city = city;
  state.loggedIn = true;

  showToast(' Profile created! Welcome to Kidzinos!');
  setTimeout(() => navigateTo('home'), 800);
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    state.loggedIn = false;
    state.user.name = 'Jay';
    navigateTo('login');
    document.getElementById('mobile-group').classList.remove('hidden');
    document.getElementById('otp-group').classList.add('hidden');
    document.getElementById('mobile-input').value = '';
    document.getElementById('login-btn').querySelector('span').textContent = 'Get OTP';
    document.querySelectorAll('.otp-box').forEach(b => b.value = '');
  }
}

// ===== QUIZ =====
// ===== PLAY TABS =====
function switchPlayTab(tab) {
  const tabs = ['drill', 'clash', 'war'];
  tabs.forEach(t => {
    const btn = document.getElementById(`ptab-${t}`);
    const content = document.getElementById(`ptab-content-${t}`);
    if (t === tab) {
      btn?.classList.add('active-ptab');
      content?.classList.remove('hidden');
    } else {
      btn?.classList.remove('active-ptab');
      content?.classList.add('hidden');
    }
  });
}

// Challenge detail data
const challengeData = {
  'war1': { name: 'WAH WAH CHALLENGE', prize1: 'a50,000', prize2: 'a20,000', prize3: 'a10,000', day: 2, total: 7, ends: '29 Apr' },
  'war2': { name: 'SCIENCE SHOWDOWN',  prize1: 'a25,000', prize2: 'a10,000', prize3: 'a5,000',  day: 1, total: 7, ends: '29 Apr' },
  'war3': { name: 'HISTORY HUNTERS',   prize1: 'a10,000', prize2: 'a5,000',  prize3: 'a2,000',  day: 1, total: 7, ends: '30 Apr' },
  'clash': { name: 'WEEK 12  DAY 3',  prize1: 'a2,000',  prize2: 'a1,000',  prize3: 'a500',    day: 3, total: 7, ends: '5 May'  },
};

function showChallengeDetail(id) {
  const d = challengeData[id] || challengeData['war1'];
  // Update content
  document.getElementById('chd-name').textContent = d.name;
  // Update rewards
  const rw = document.querySelectorAll('.chd-reward-row strong');
  if (rw[0]) rw[0].textContent = d.prize1 + ' cash';
  if (rw[1]) rw[1].textContent = d.prize2 + ' cash';
  if (rw[2]) rw[2].textContent = d.prize3 + ' cash';
  // Update stat
  const stvals = document.querySelectorAll('.chd-stat-val');
  if (stvals[0]) stvals[0].innerHTML = `<i class="fa-solid fa-fire"></i> Day ${d.day}`;
  if (stvals[1]) stvals[1].innerHTML = `<i class="fa-solid fa-layer-group"></i> ${d.total}`;
  if (stvals[2]) stvals[2].innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${d.ends}`;

  navigateTo('challenge');
}

function openDailyDrill() {
  startQuiz('daily');
}
function openWeeklyStash() {
  if (!checkSubscription('Weekly STASH')) return;
  startQuiz('war');
}
function openCrazyWar() {
  if (!checkSubscription('Crazy War')) return;
  startQuiz('war');
}

function checkSubscription(feature) {
  // For demo, free users can play everything
  showToast(` Loading ${feature}...`);
  return true;
}

function startQuiz(mode) {
  const questions = [...questionBank[mode] || questionBank.daily];
  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  state.quiz.mode = mode;
  state.quiz.questions = questions.slice(0, 10);
  state.quiz.current = 0;
  state.quiz.score = 0;
  state.quiz.correct = 0;
  state.quiz.streak = 0;
  state.quiz.startTime = Date.now();

  navigateTo('quiz');

  const modeNames = { daily: ' Daily Drill', war: ' Crazy War', stash: '" Weekly Stash' };
  document.getElementById('quiz-mode-name').textContent = modeNames[mode] || 'Daily Drill';

  loadQuestion();
}

function loadQuestion() {
  const { questions, current } = state.quiz;
  if (current >= questions.length) {
    endQuiz();
    return;
  }

  const q = questions[current];
  const total = questions.length;

  // Update header
  document.getElementById('quiz-qno-label').textContent = `${current + 1}/${total}`;
  const pct = ((current) / total) * 100;
  document.getElementById('quiz-prog-fill').style.width = pct + '%';

  // Streak banner
  const streakBanner = document.getElementById('quiz-streak-banner');
  if (state.quiz.streak >= 2) {
    streakBanner.style.display = 'block';
    document.getElementById('streak-num').textContent = state.quiz.streak;
  } else {
    streakBanner.style.display = 'none';
  }

  // Question
  document.getElementById('q-category').textContent = q.cat;
  document.getElementById('q-text').textContent = q.q;

  // Options
  const optContainer = document.getElementById('quiz-options');
  optContainer.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="opt-letter">${letters[i]}</span>${opt}`;
    btn.onclick = () => selectAnswer(i, q.ans, btn, optContainer);
    optContainer.appendChild(btn);
  });

  // Timer
  startTimer();
}

function startTimer() {
  clearInterval(state.quiz.timerInterval);
  state.quiz.timeLeft = 30;
  const timerEl = document.getElementById('quiz-timer');
  timerEl.textContent = 30;
  timerEl.style.borderColor = 'var(--crazy-orange)';
  timerEl.style.color = 'var(--crazy-orange)';

  state.quiz.timerInterval = setInterval(() => {
    state.quiz.timeLeft--;
    timerEl.textContent = state.quiz.timeLeft;

    if (state.quiz.timeLeft <= 10) {
      timerEl.style.borderColor = 'var(--crazy-red)';
      timerEl.style.color = 'var(--crazy-red)';
      timerEl.style.animation = 'pulseDot 0.8s ease-in-out infinite';
    }

    if (state.quiz.timeLeft <= 0) {
      clearInterval(state.quiz.timerInterval);
      // Time out
      state.quiz.streak = 0;
      state.quiz.current++;
      setTimeout(loadQuestion, 600);
    }
  }, 1000);
}

function selectAnswer(chosen, correct, btn, container) {
  clearInterval(state.quiz.timerInterval);

  // Disable all options
  const allOpts = container.querySelectorAll('.quiz-option');
  allOpts.forEach(o => o.style.pointerEvents = 'none');

  const isCorrect = chosen === correct;
  const timeBonus = state.quiz.timeLeft > 20 ? 5 : state.quiz.timeLeft > 10 ? 2 : 0;

  if (isCorrect) {
    btn.classList.add('option-correct');
    state.quiz.correct++;
    state.quiz.streak++;
    const streakMult = state.quiz.streak >= 3 ? 2 : 1;
    const pts = (10 + timeBonus) * streakMult;
    state.quiz.score += pts;
    showFloatingText(btn, `+${pts} pts!`);
  } else {
    btn.classList.add('option-wrong');
    allOpts[correct].classList.add('option-correct');
    state.quiz.streak = 0;
  }

  state.quiz.current++;
  setTimeout(loadQuestion, 1200);
}

function showFloatingText(el, text) {
  const floater = document.createElement('div');
  floater.textContent = text;
  floater.style.cssText = `
    position:fixed; color: var(--crazy-yellow); font-weight:900; font-size:1.2rem;
    pointer-events:none; z-index:999; animation:floatUp 0.8s ease forwards;
    left: 50%; transform: translateX(-50%); top: 40%;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  `;
  document.body.appendChild(floater);
  setTimeout(() => floater.remove(), 800);

  // Add CSS for float up animation
  if (!document.getElementById('float-style')) {
    const style = document.createElement('style');
    style.id = 'float-style';
    style.textContent = '@keyframes floatUp { from{opacity:1;transform:translateX(-50%) translateY(0);} to{opacity:0;transform:translateX(-50%) translateY(-60px);} }';
    document.head.appendChild(style);
  }
}

function endQuiz() {
  const { score, correct, questions, mode, streak } = state.quiz;
  const earned = score;
  state.user.zinoCoins += earned;
  state.user.csiScore += Math.floor(earned * 0.5);
  updateAllZinos();

  const rankPct = Math.max(1, Math.floor(Math.random() * 25) + 1);
  const participants = Math.floor(Math.random() * 8000) + 8000;
  const correctCount = correct;
  const icon = correctCount >= 9 ? '🏆' : correctCount >= 7 ? '🔥' : correctCount >= 5 ? '💪' : '😅';
  const title = correctCount >= 9 ? 'You Crushed It!' : correctCount >= 7 ? 'Great Job!' : correctCount >= 5 ? 'Keep Going!' : 'Try Again!';

  const dailyBanners = [
    '"Amit ke saath judega toh aasman chhuyega!" 🚀',
    '"Har sawaal ek step hai — top tak pahunchega tu!" ⚡',
    '"Crazy XYZ ka fan hai? Toh topper bhi ban!" 🔥',
  ];
  const weeklyBanners = [
    '"Main tumme ek future star dekhta hoon!" ⭐',
    '"Ye results sirf start hain — asli game abhi baaki hai!" 🎯',
    '"Weekly top mein aao — Crazy XYZ video mein feature ho!" 📹',
  ];
  const banners = (mode === 'daily') ? dailyBanners : weeklyBanners;
  const banner = banners[Math.floor(Math.random() * banners.length)];

  document.getElementById('result-icon').textContent = icon;
  document.getElementById('result-title').textContent = title;
  const hinglishEl = document.getElementById('result-hinglish-text');
  if (hinglishEl) hinglishEl.textContent = banner;
  document.getElementById('result-coins-won').textContent = `+${earned}`;
  const totalEl = document.getElementById('result-total-zinos');
  if (totalEl) totalEl.textContent = `Total: ${state.user.zinoCoins} 🎈`;
  const pctEl = document.getElementById('result-percentile');
  if (pctEl) pctEl.textContent = `Top ${rankPct}%`;
  const rankEl = document.getElementById('result-rank');
  if (rankEl) rankEl.textContent = `Top ${rankPct}%`;
  const partEl = document.getElementById('result-participants');
  if (partEl) partEl.textContent = `Out of ${participants.toLocaleString()} participants today`;
  document.getElementById('result-score').textContent = score;
  document.getElementById('result-correct').textContent = `${correct}/${questions.length}`;
  const strkEl = document.getElementById('result-streak-show');
  if (strkEl) strkEl.textContent = `🔥${state.quiz.streak}`;

  // XP/Level
  const xp = state.user.csiScore;
  const levels = [0,500,1200,2200,3500,5200,7200,9500,12500,16000,20000];
  let lvl = 1;
  for (let i = 0; i < levels.length; i++) { if (xp >= levels[i]) lvl = i + 1; }
  const levelNames = ['Rookie','Newcomer','Challenger','Fighter','Warrior','Beast','Legend','Crazy Star','Unstoppable','GOD MODE'];
  const lvlName = levelNames[Math.min(lvl - 1, levelNames.length - 1)];
  const nextXP = levels[Math.min(lvl, levels.length - 1)] || xp + 5000;
  const prevXP = levels[lvl - 1] || 0;
  const xpPct = Math.min(100, Math.round(((xp - prevXP) / (nextXP - prevXP)) * 100));
  const xpLvlEl = document.getElementById('result-xp-level');
  const xpValEl = document.getElementById('result-xp-val');
  if (xpLvlEl) xpLvlEl.textContent = `Lv.${lvl} ${lvlName}`;
  if (xpValEl) xpValEl.textContent = `${xp.toLocaleString()} / ${nextXP.toLocaleString()} XP`;
  setTimeout(() => { const f = document.getElementById('result-xp-fill'); if (f) f.style.width = xpPct + '%'; }, 300);

  state.user.challengeAttempts++;
  completeMission(0);
  navigateTo('result');
}

function goBackFromQuiz() {
  clearInterval(state.quiz.timerInterval);
  navigateTo('play');
}

// ===== WATCH & EARN S REELS =====
const reelState = {}; // { [id]: { playing, progress, interval } }

function toggleReelPlay(id) {
  if (!reelState[id]) reelState[id] = { playing: false, progress: 0 };
  const s = reelState[id];
  s.playing = !s.playing;

  const pi = document.getElementById(`reel-pi-${id}`);
  if (pi) {
    pi.classList.remove('hidden');
    pi.innerHTML = s.playing
      ? '<i class="fa-solid fa-pause"></i>'
      : '<i class="fa-solid fa-play"></i>';
    // Remove and re-add to restart animation
    pi.style.animation = 'none';
    requestAnimationFrame(() => { pi.style.animation = ''; });
  }

  if (s.playing) {
    const earned = document.getElementById(`reel-${id}`)?.dataset.earned === 'true';
    s.interval = setInterval(() => {
      s.progress = Math.min(100, s.progress + 1.5);
      const fill = document.getElementById(`reel-fill-${id}`);
      const hint = document.getElementById(`reel-hint-${id}`);
      if (fill) fill.style.width = s.progress + '%';

      // Earn at 80%
      if (s.progress >= 80 && !s.earned && !earned) {
        s.earned = true;
        state.user.zinoCoins += 1;
        updateAllZinos();
        const earnedBadge = document.getElementById(`reel-earned-${id}`);
        if (earnedBadge) {
          earnedBadge.classList.remove('hidden');
          setTimeout(() => earnedBadge.classList.add('hidden'), 2500);
        }
        if (hint) {
          hint.innerHTML = '<i class="fa-solid fa-check" style="color:var(--crazy-green)"></i> Zino Earned!';
          hint.style.color = 'var(--crazy-green)';
        }
        showToast(' +1 Zino Balloon Earned!');
        document.getElementById(`watch-zino-count`).textContent = state.user.zinoCoins;
      }
      if (s.progress >= 100) {
        clearInterval(s.interval);
        s.playing = false;
      }
    }, 150);
  } else {
    clearInterval(s.interval);
  }
}

function reelEarn(id, btn) {
  const reel = document.getElementById(`reel-${id}`);
  if (reel?.dataset.earned === 'true' || reelState[id]?.earned) {
    showToast(' Already earned from this video!');
    return;
  }
  // Prompt to watch
  showToast(' Play the video to earn your Zino!');
  toggleReelPlay(id);
}

function reelLike(btn) {
  const icon = btn.querySelector('.ra-icon');
  const label = btn.querySelector('.ra-label');
  if (btn.classList.contains('liked')) {
    btn.classList.remove('liked');
    const n = parseInt(label.textContent) - 1;
    label.textContent = n >= 1000 ? (n/1000).toFixed(1) + 'K' : n;
  } else {
    btn.classList.add('liked');
    const current = label.textContent;
    const n = parseFloat(current) * (current.includes('K') ? 1000 : 1) + 1;
    label.textContent = n >= 1000 ? (n/1000).toFixed(1) + 'K' : n;
    showToast(' Liked!');
  }
}

function reelShare() {
  const text = 'Check out this crazy video from Crazy XYZ!  #CrazyXYZ #Kidzinos';
  if (navigator.share) {
    navigator.share({ title: 'Crazy XYZ', text, url: 'https://youtube.com/@crazyxyz' }).catch(() => {});
  } else {
    showToast(' Link copied!');
    navigator.clipboard?.writeText('https://youtube.com/@crazyxyz');
  }
}

// Legacy video player (kept for compatibility)
let videoTimerInterval = null;

function playVideo(videoId, title, alreadyEarned) {
  const overlay = document.getElementById('video-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('player-video-title').textContent = title;
  document.getElementById('yt-link').href = `https://www.youtube.com/@crazyxyz`;
  document.getElementById('player-prog-fill').style.width = '0%';
  document.getElementById('prog-pct').textContent = '0%';
  document.getElementById('player-status').textContent = 'Watch 80% to earn Zino Balloon';

  let progress = 0;
  let earned = false;

  clearInterval(videoTimerInterval);
  videoTimerInterval = setInterval(() => {
    if (progress < 100) {
      progress += 2;
      document.getElementById('player-prog-fill').style.width = progress + '%';
      document.getElementById('prog-pct').textContent = progress + '%';

      if (progress >= 80 && !earned && !alreadyEarned) {
        earned = true;
        state.user.zinoCoins += 1;
        updateAllZinos();
        document.getElementById('player-status').textContent = ' Zino Balloon Earned! Keep watching!';
        document.getElementById('player-prog-fill').style.background = 'var(--crazy-green)';
        showToast(' +1 Zino Balloon Earned!');
      }

      if (progress >= 100) {
        clearInterval(videoTimerInterval);
        document.getElementById('player-status').textContent = ' Video Complete! Great job!';
      }
    }
  }, 150);
}

function closeVideo() {
  document.getElementById('video-overlay').classList.add('hidden');
  clearInterval(videoTimerInterval);
}

// ===== STORE & PRODUCT REQUESTS =====
let pendingProductData = null;

function requestProduct(name, coins) {
  const emojis = { 'Crazy XYZ Cap': '', 'Crazy T-Shirt': '', 'XYZ Hoodie': '', 'Sticker Pack': '', 'XYZ Water Bottle': '', 'Notebook': 'SS' };
  const emoji = emojis[name] || '';

  document.getElementById('modal-prod-emoji').textContent = emoji;
  document.getElementById('modal-prod-name').textContent = name;
  document.getElementById('modal-coin-val').textContent = coins;
  document.getElementById('modal-balance').textContent = state.user.zinoCoins;

  const confirmBtn = document.getElementById('modal-confirm-btn');
  if (state.user.zinoCoins < coins) {
    confirmBtn.style.opacity = '0.5';
    confirmBtn.onclick = () => showToast(' Not enough Zino Balloons!');
  } else {
    confirmBtn.style.opacity = '1';
    confirmBtn.onclick = () => confirmRequest(name, coins);
  }

  pendingProductData = { name, coins, emoji };
  document.getElementById('product-modal').classList.remove('hidden');
}

function confirmRequest(name, coins) {
  if (!pendingProductData) return;
  if (state.user.zinoCoins < pendingProductData.coins) {
    showToast(' Not enough Zino Balloons!');
    closeModal();
    return;
  }

  state.user.zinoCoins -= pendingProductData.coins;
  updateAllZinos();
  closeModal();
  showToast(` Request sent for ${pendingProductData.name}! Processing soon.`);
  pendingProductData = null;
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

function openShopify() {
  window.open('https://youtube.com/@crazyxyz', '_blank');
  showToast('" Opening Crazy XYZ Store...');
}

// ===== PROFILE =====
function updateProfileScreen() {
  const u = state.user;
  const nameEl = document.getElementById('profile-display-name');
  const cityEl = document.getElementById('profile-display-city');
  const avEl = document.getElementById('profile-av-letter');
  const zinoEl = document.getElementById('profile-zino-display');
  const nameValEl = document.getElementById('prof-name-val');
  const emailValEl = document.getElementById('prof-email-val');
  const ageEl = document.getElementById('prof-age-val');

  if (nameEl) nameEl.textContent = u.name || 'Jay Kumar';
  if (cityEl) cityEl.textContent = 'S ' + (u.city || 'Mumbai');
  if (avEl) avEl.textContent = (u.name || 'J')[0].toUpperCase();
  if (zinoEl) zinoEl.textContent = u.zinoCoins;
  if (nameValEl) nameValEl.textContent = u.name || 'Jay Kumar';
  if (emailValEl) emailValEl.textContent = u.email || 'jay@email.com';

  // Age calc
  if (ageEl && u.dob) {
    const today = new Date();
    const birth = new Date(u.dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    ageEl.textContent = age > 0 ? `${age} years` : '';
  }

  // Avatar letter on home
  const homeAv = document.querySelector('.avatar-circle');
  if (homeAv) homeAv.textContent = (u.name || 'J')[0].toUpperCase();
}

// ===== SUBSCRIPTION =====
function showPlan(type) {
  const monthly = document.getElementById('plan-monthly');
  const annual = document.getElementById('plan-annual');
  const toggleM = document.getElementById('toggle-monthly');
  const toggleA = document.getElementById('toggle-annual');

  if (type === 'monthly') {
    monthly.classList.remove('hidden');
    annual.classList.add('hidden');
    toggleM.classList.add('active-toggle');
    toggleA.classList.remove('active-toggle');
  } else {
    annual.classList.remove('hidden');
    monthly.classList.add('hidden');
    toggleA.classList.add('active-toggle');
    toggleM.classList.remove('active-toggle');
  }
}

function subscribePlan(type, price) {
  showToast(`" Redirecting to payment for Crazy ${type === 'monthly' ? 'Monthly' : 'Annual'} Pass...`);
  setTimeout(() => {
    showToast(' Payment gateway coming soon!');
  }, 1500);
}

// ===== RESULT ACTIONS =====
function shareResult() {
  const { score, correct, questions } = state.quiz;
  const text = `I scored ${score} pts on Kidzinos!  ${correct}/${questions?.length || 10} correct! Can you beat me? " #Kidzinos #CrazyXYZ`;
  if (navigator.share) {
    navigator.share({ title: 'My Kidzinos Score!', text, url: 'https://kidzinos.com' }).catch(() => {});
  } else {
    showToast('S Score copied!');
    navigator.clipboard?.writeText(text);
  }
}

function challengeFriend() {
  const text = `Hey! I just scored on Kidzinos powered by Crazy XYZ!  Can you beat my score? Download now!`;
  if (navigator.share) {
    navigator.share({ title: 'Challenge on Kidzinos!', text, url: 'https://kidzinos.com' }).catch(() => {});
  } else {
    showToast('" Challenge link copied!');
  }
}

// ===== UTILITIES =====
function updateAllZinos() {
  const zinoEls = document.querySelectorAll('#zino-count, #play-zino, #store-zino, .profile-zino-count');
  zinoEls.forEach(el => el && (el.textContent = state.user.zinoCoins));
  // Also sync Zino Loop widget
  const zlBall = document.getElementById('zl-balloon-count');
  if (zlBall) zlBall.textContent = state.user.zinoCoins;
  const zlStreak = document.getElementById('zl-streak-count');
  if (zlStreak) zlStreak.textContent = state.user.streak || 0;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.add('hidden'), 3000);
}

function shakeElement(el) {
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });

  if (!document.getElementById('shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }';
    document.head.appendChild(style);
  }
}

// ===== TOUCH SWIPE FOR BANNER =====
let touchStartX = 0;
function setupBannerSwipe() {
  const banner = document.querySelector('.banner-slider');
  if (!banner) return;
  banner.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  banner.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      const slides = document.querySelectorAll('.banner-slide');
      const dots = document.querySelectorAll('.b-dot');
      slides.forEach(s => s.classList.remove('active-slide'));
      dots.forEach(d => d.classList.remove('active'));
      if (dx < 0) state.bannerIndex = (state.bannerIndex + 1) % slides.length;
      else state.bannerIndex = (state.bannerIndex - 1 + slides.length) % slides.length;
      slides[state.bannerIndex].classList.add('active-slide');
      dots[state.bannerIndex].classList.add('active');
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Start with splash
  const splash = document.getElementById('screen-splash');
  splash.style.display = 'flex';
  splash.classList.add('active');

  // After loader animation, go to login
  setTimeout(() => {
    navigateTo('login');
    setupBannerSwipe();
    initMissionsTimer();
    setTimeout(() => showStreakPopup(), 1000);
  }, 2800);

  // Demo: auto-login after splash for testing
  // Uncomment below to skip login:
  // setTimeout(() => { state.loggedIn = true; navigateTo('home'); }, 2800);

  // Handle keyboard show/hide on mobile
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const nav = document.getElementById('bottom-nav');
      if (window.visualViewport.height < window.innerHeight * 0.8) {
        nav.style.display = 'none';
      } else {
        if (!['splash','login','register','quiz','result'].includes(state.currentScreen)) {
          nav.classList.add('visible');
        }
      }
    });
  }
});

// Prevent default scroll bounce on iOS
document.addEventListener('touchmove', function (e) {
  const target = e.target.closest('.home-scroll, .quiz-body, .reg-bg, .onboard-bg');
  if (!target) e.preventDefault();
}, { passive: false });

// ===== STREAK SYSTEM =====
function showStreakPopup() {
  if (!state.loggedIn) return;
  const s = state.user.streak || 5;
  const el = document.getElementById('streak-popup');
  if (!el) return;
  document.getElementById('streak-popup-day').textContent = `Day ${s} Streak`;
  const titles = ['Pehla Kadam!','Aur Aage Badh!','Teen Din Ka Toofan!','Char Din Ka Cheetah!','5 Din Ka King!','6 Din Ka Legend!','7 Din Ka God!'];
  document.getElementById('streak-popup-title').textContent = titles[Math.min(s-1, titles.length-1)];
  const bonus = s >= 7 ? 25 : s >= 5 ? 15 : s >= 3 ? 10 : 5;
  document.getElementById('streak-bonus-text').textContent = `+${bonus} Bonus Zino Balloons!`;
  const cal = document.getElementById('streak-calendar');
  if (cal) {
    cal.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
      const d = document.createElement('div');
      d.className = 'sc-day' + (i < s ? ' done' : i === s ? ' today' : '');
      d.textContent = i <= s ? '🔥' : i;
      cal.appendChild(d);
    }
  }
  el.classList.remove('hidden');
}
function closeStreakPopup() {
  const el = document.getElementById('streak-popup');
  if (el) el.classList.add('hidden');
  const bonus = state.user.streak >= 7 ? 25 : state.user.streak >= 5 ? 15 : state.user.streak >= 3 ? 10 : 5;
  state.user.zinoCoins += bonus;
  updateAllZinos();
  showToast(`🔥 +${bonus} Streak Bonus Balloons!`);
  updateHomeStreakStrip();
}
function updateHomeStreakStrip() {
  const s = state.user.streak || 5;
  const el = document.getElementById('hss-title');
  const titles = ['Pehla Kadam! 🌱','Aur Aage Badh! ⚡','Teen Din Ka Toofan! 🌪️','Char Din Ka Cheetah! 🐆','5 Din Ka King! 👑','6 Din Ka Legend! 🔥','7 Din Ka God! 🏆'];
  if (el) el.textContent = titles[Math.min(s-1, titles.length-1)];
  const lbl = document.getElementById('home-streak-label');
  if (lbl) lbl.textContent = `🔥 ${s} Day Streak!`;
  const dots = document.getElementById('hss-dots');
  if (dots) {
    dots.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
      const d = document.createElement('div');
      d.className = 'hss-dot' + (i <= s ? ' active' : '');
      d.textContent = i <= s ? '🔥' : i;
      dots.appendChild(d);
    }
  }
}

// ===== MISSIONS SYSTEM =====
const missions = [
  { target: 1, progress: 0, done: false },
  { target: 2, progress: 0, done: false },
  { target: 1, progress: 0, done: false },
];
function completeMission(idx) {
  if (missions[idx].done) return;
  missions[idx].progress = Math.min(missions[idx].target, missions[idx].progress + 1);
  const pct = (missions[idx].progress / missions[idx].target) * 100;
  const barEl = document.getElementById(`mbar-${idx}`);
  const metaEl = document.getElementById(`mmeta-${idx}`);
  const checkEl = document.getElementById(`mcheck-${idx}`);
  const cardEl = document.getElementById(`mission-${idx}`);
  if (barEl) barEl.style.width = pct + '%';
  if (missions[idx].progress >= missions[idx].target) {
    missions[idx].done = true;
    if (checkEl) checkEl.classList.remove('hidden');
    if (cardEl) cardEl.classList.add('mission-done');
    const rewards = [15, 10, 10];
    state.user.zinoCoins += rewards[idx];
    updateAllZinos();
    showToast(`✅ Mission done! +${rewards[idx]} Zino Balloons!`);
    if (metaEl) metaEl.textContent = '✅ Completed!';
    checkAllMissions();
  } else {
    const labels = ['/ 1 done','/ 2 watched','/ 1 played'];
    if (metaEl) metaEl.textContent = `${missions[idx].progress} ${labels[idx]}`;
    if (barEl) barEl.style.width = pct + '%';
  }
}
function checkAllMissions() {
  if (missions.every(m => m.done)) {
    const combo = document.getElementById('combo-banner');
    if (combo) combo.classList.remove('hidden');
    state.user.zinoCoins += 25;
    updateAllZinos();
    showToast('⚡ DAILY CRAZY COMBO! +25 Bonus Balloons!');
  }
}
function initMissionsTimer() {
  function updateTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const el = document.getElementById('missions-timer');
    if (el) el.textContent = `Resets in ${h}h ${m}m`;
  }
  updateTimer();
  setInterval(updateTimer, 60000);
}

// ===== MINI GAMES =====
let mgState = { type: '', score: 0, timer: null, timeLeft: 30, running: false };

function launchGame(type) {
  const overlay = document.getElementById('mg-overlay');
  const gameArea = document.getElementById('mg-game-area');
  if (!overlay || !gameArea) return;
  mgState = { type, score: 0, timer: null, timeLeft: 30, running: true };
  overlay.classList.remove('hidden');
  document.getElementById('mg-score').textContent = 'Score: 0';
  document.getElementById('mg-timer').textContent = '⏱ 30s';
  const titles = { balloon: '🎈 Balloon Pop', math: '🧮 Crazy Maths', memory: '🃏 Memory Match', reflex: '⚡ Reflex Rush' };
  document.getElementById('mg-title').textContent = titles[type] || 'Mini Game';
  if (type === 'balloon') buildBalloonGame(gameArea);
  else if (type === 'math') buildMathGame(gameArea);
  else if (type === 'memory') buildMemoryGame(gameArea);
  else if (type === 'reflex') buildReflexGame(gameArea);
  startMgTimer();
}
function closeMiniGame() {
  clearInterval(mgState.timer);
  mgState.running = false;
  const overlay = document.getElementById('mg-overlay');
  if (overlay) overlay.classList.add('hidden');
}
function startMgTimer() {
  clearInterval(mgState.timer);
  mgState.timer = setInterval(() => {
    mgState.timeLeft--;
    const el = document.getElementById('mg-timer');
    if (el) el.textContent = `⏱ ${mgState.timeLeft}s`;
    if (el && mgState.timeLeft <= 10) el.style.color = 'var(--brand-red)';
    if (mgState.timeLeft <= 0) { clearInterval(mgState.timer); endMiniGame(); }
  }, 1000);
}
function addMgScore(pts) {
  mgState.score += pts;
  const el = document.getElementById('mg-score');
  if (el) el.textContent = `Score: ${mgState.score}`;
  showFloatingText(null, `+${pts}`);
}
function endMiniGame() {
  mgState.running = false;
  const rewards = { balloon: 5, math: 8, memory: 6, reflex: 10 };
  const earned = rewards[mgState.type] || 5;
  state.user.zinoCoins += earned;
  updateAllZinos();
  completeMission(2);
  const gameArea = document.getElementById('mg-game-area');
  if (!gameArea) return;
  gameArea.innerHTML = `
    <div class="game-result-popup">
      <div class="grp-emoji">🎉</div>
      <div class="grp-title">Game Over!</div>
      <div class="grp-score">Score: ${mgState.score} points</div>
      <div class="grp-reward"><img src="zino-balloon.png" style="width:24px;" /> +${earned} Zino Balloons Earned!</div>
      <button class="grp-btn" onclick="closeMiniGame()">Back to Games 🎮</button>
    </div>`;
}

// BALLOON POP
function buildBalloonGame(area) {
  const emojis = ['🎈','🎈','🎈','🎈','💣','💣','🎈','🎈','🎈','🎈','💣','🎈','🎈','💣','🎈','🎈'];
  area.innerHTML = '<div class="balloon-grid" id="bgrid"></div><div style="margin-top:16px;font-size:0.85rem;color:var(--text-muted);font-weight:700;">Tap 🎈 to pop! Avoid 💣</div>';
  const grid = document.getElementById('bgrid');
  const shuffled = [...emojis].sort(() => Math.random() - 0.5);
  shuffled.forEach((e, i) => {
    const cell = document.createElement('div');
    cell.className = 'balloon-cell';
    cell.textContent = e;
    cell.onclick = () => {
      if (!mgState.running || cell.classList.contains('popped') || cell.classList.contains('wrong')) return;
      if (e === '🎈') { cell.classList.add('popped'); cell.textContent = '✅'; addMgScore(10); }
      else { cell.classList.add('wrong'); cell.textContent = '💥'; addMgScore(-5); }
    };
    grid.appendChild(cell);
  });
}

// CRAZY MATH
let mathQ = {};
function buildMathGame(area) {
  area.innerHTML = '<div id="math-q" class="math-question"></div><div class="math-options" id="math-opts"></div>';
  nextMathQ();
}
function nextMathQ() {
  if (!mgState.running) return;
  const ops = ['+','-','×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 15) + 1;
  let b = Math.floor(Math.random() * 10) + 1;
  let ans = op === '+' ? a+b : op === '-' ? a-b : a*b;
  mathQ = { question: `${a} ${op} ${b} = ?`, answer: ans };
  const wrong1 = ans + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*5)+1);
  const wrong2 = ans + (Math.random() > 0.5 ? 2 : -2) * (Math.floor(Math.random()*4)+1);
  const wrong3 = ans * (Math.random() > 0.5 ? 2 : -1);
  let opts = [ans, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
  const qEl = document.getElementById('math-q');
  const optsEl = document.getElementById('math-opts');
  if (!qEl || !optsEl) return;
  qEl.textContent = mathQ.question;
  optsEl.innerHTML = '';
  opts.forEach(o => {
    const btn = document.createElement('button');
    btn.className = 'math-opt-btn';
    btn.textContent = o;
    btn.onclick = () => {
      if (!mgState.running) return;
      const allBtns = optsEl.querySelectorAll('.math-opt-btn');
      allBtns.forEach(b => b.style.pointerEvents = 'none');
      if (o === mathQ.answer) { btn.classList.add('math-opt-correct'); addMgScore(15); }
      else { btn.classList.add('math-opt-wrong'); addMgScore(-5); }
      setTimeout(nextMathQ, 800);
    };
    optsEl.appendChild(btn);
  });
}

// MEMORY MATCH
let memFlipped = [], memMatched = 0;
function buildMemoryGame(area) {
  const symbols = ['🎈','⚡','🔥','🎯','🏆','🎮','💎','🌟'];
  const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  memFlipped = []; memMatched = 0;
  area.innerHTML = '<div class="memory-grid" id="memgrid"></div><div style="margin-top:12px;font-size:0.82rem;color:var(--text-muted);font-weight:700;">Match the pairs! 🃏</div>';
  const grid = document.getElementById('memgrid');
  cards.forEach((sym, i) => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.sym = sym;
    card.dataset.idx = i;
    card.textContent = '❓';
    card.onclick = () => flipMemCard(card, sym, i);
    grid.appendChild(card);
  });
}
function flipMemCard(card, sym, idx) {
  if (!mgState.running) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (memFlipped.length >= 2) return;
  card.classList.add('flipped');
  card.textContent = sym;
  memFlipped.push({ card, sym, idx });
  if (memFlipped.length === 2) {
    if (memFlipped[0].sym === memFlipped[1].sym) {
      memFlipped.forEach(f => { f.card.classList.add('matched'); f.card.classList.remove('flipped'); });
      memMatched++;
      addMgScore(20);
      memFlipped = [];
      if (memMatched >= 8) { clearInterval(mgState.timer); endMiniGame(); }
    } else {
      setTimeout(() => {
        memFlipped.forEach(f => { f.card.classList.remove('flipped'); f.card.textContent = '❓'; });
        memFlipped = [];
      }, 700);
    }
  }
}

// REFLEX RUSH
let reflexCount = 0, reflexTarget = null;
const reflexEmojis = ['🎈','⚡','🔥','🎯','🌟','💎','🎮'];
function buildReflexGame(area) {
  reflexCount = 0;
  area.innerHTML = `
    <div style="font-size:0.82rem;color:var(--text-muted);font-weight:700;margin-bottom:8px;">Tap the glowing circle as fast as you can!</div>
    <div class="reflex-area" id="reflex-btn" onclick="reflexTap()">
      <div class="reflex-ring"></div>
      <div class="reflex-inner" id="reflex-inner">
        <div class="reflex-emoji" id="reflex-emoji">⚡</div>
        <div>TAP!</div>
      </div>
    </div>
    <div style="font-size:0.85rem;font-weight:900;color:var(--crazy-yellow);margin-top:8px;">Taps: <span id="reflex-count">0</span></div>`;
  const btn = document.getElementById('reflex-btn');
  if (btn) btn.style.background = 'rgba(255,107,0,0.15)';
  nextReflex();
}
function nextReflex() {
  const inner = document.getElementById('reflex-inner');
  const emojiEl = document.getElementById('reflex-emoji');
  const btn = document.getElementById('reflex-btn');
  if (!inner || !emojiEl) return;
  const colors = ['rgba(255,107,0,0.2)','rgba(124,58,237,0.2)','rgba(34,197,94,0.2)','rgba(96,200,255,0.2)'];
  if (btn) btn.style.background = colors[Math.floor(Math.random() * colors.length)];
  emojiEl.textContent = reflexEmojis[Math.floor(Math.random() * reflexEmojis.length)];
}
function reflexTap() {
  if (!mgState.running) return;
  reflexCount++;
  addMgScore(5);
  const c = document.getElementById('reflex-count');
  if (c) c.textContent = reflexCount;
  nextReflex();
}

// Show Games FAB on home/play screens
const _origNavigateTo = navigateTo;

// FAB visibility based on screen
const origOnScreenEnter = onScreenEnter;
function onScreenEnter(screenId) {
  origOnScreenEnter(screenId);
  const fab = document.getElementById('games-fab');
  const showFabOn = ['home','play','store','profile','csi'];
  if (fab) {
    if (showFabOn.includes(screenId)) fab.classList.add('show');
    else fab.classList.remove('show');
  }
  if (screenId === 'home') {
    updateHomeStreakStrip();
  }
}

// Hook watch videos to mission 1 (watch 2 videos)
let videosWatchedCount = 0;
const _origToggleReelPlay = toggleReelPlay;
function toggleReelPlay(id) {
  _origToggleReelPlay(id);
  if (reelState[id] && reelState[id].playing) {
    // count watch start towards mission
  }
}

// Override reelState earned to also track mission
const _origUpdateZinos = updateAllZinos;
function updateAllZinos() {
  _origUpdateZinos();
  // track watch mission
  if (state.currentScreen === 'watch') {
    videosWatchedCount++;
    if (videosWatchedCount <= 2) completeMission(1);
  }
}

/* ========================================
   ZINO LOOP — HOME ROUTINE LAYER
   Daily gamified routine builder
======================================== */

// ── Activity Master List ──
const activityMaster = [
  { id: 'school',   icon: '🎒', name: 'School'     },
  { id: 'homework', icon: '📚', name: 'Homework'   },
  { id: 'study',    icon: '📖', name: 'Study'      },
  { id: 'exercise', icon: '🏃', name: 'Exercise'   },
  { id: 'reading',  icon: '📕', name: 'Reading'    },
  { id: 'gaming',   icon: '🎮', name: 'Gaming'     },
  { id: 'art',      icon: '🎨', name: 'Art'        },
  { id: 'music',    icon: '🎵', name: 'Music'      },
  { id: 'cricket',  icon: '🏏', name: 'Cricket'    },
  { id: 'cooking',  icon: '🍳', name: 'Cooking'    },
  { id: 'friends',  icon: '👫', name: 'Hangout'    },
  { id: 'youtube',  icon: '📺', name: 'YouTube'    },
  { id: 'sleep',    icon: '😴', name: 'Sleep'      },
  { id: 'prayer',   icon: '🙏', name: 'Prayer'     },
];

// ── Zino Loop State (extends main state) ──
state.zinoLoop = {
  dailyPlan: {           // today's plan keyed by date
    date: '',
    activities: [],      // { id, icon, name, completed, order, isCustom }
  },
};

// ── localStorage helpers ──
const ZL_KEY = 'kidzinos_zl_v1';

function zlSave() {
  try {
    const payload = {
      streak: state.user.streak,
      zinoCoins: state.user.zinoCoins,
      lastActiveDate: state.user.lastActiveDate || '',
      dailyPlan: state.zinoLoop.dailyPlan,
    };
    localStorage.setItem(ZL_KEY, JSON.stringify(payload));
  } catch(e) {}
}

function zlLoad() {
  try {
    const raw = localStorage.getItem(ZL_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.streak !== undefined) state.user.streak = d.streak;
    if (d.zinoCoins !== undefined) state.user.zinoCoins = d.zinoCoins;
    if (d.lastActiveDate) state.user.lastActiveDate = d.lastActiveDate;
    if (d.dailyPlan) state.zinoLoop.dailyPlan = d.dailyPlan;
  } catch(e) {}
}

// ── Date helper ──
function zlTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

// ── INIT ── called every time home screen is entered ──
function initZinoLoop() {
  zlLoad();
  const today = zlTodayStr();
  const plan = state.zinoLoop.dailyPlan;

  if (plan.date !== today) {
    // Date has rolled over — handle streak
    const yesterday = (() => {
      const d = new Date(); d.setDate(d.getDate()-1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    })();
    const lastActive = state.user.lastActiveDate || '';

    if (lastActive === yesterday) {
      // User was active yesterday — check if they completed ≥1 task
      const prevCompleted = plan.activities.filter(a => a.completed).length;
      if (prevCompleted >= 1) {
        state.user.streak = (state.user.streak || 0) + 1;
        checkStreakMilestone();
      }
      // else: soft reset (no punishment — PRD says warning not punishment)
    } else if (lastActive && lastActive !== yesterday && lastActive !== today) {
      // Missed a day
      showToast('🔥 Streak paused! Aaj ek bhi complete kar — wapas aa jao!');
    }

    // New day — fresh plan
    state.zinoLoop.dailyPlan = { date: today, activities: [] };
    state.user.lastActiveDate = today;
    zlSave();
  }

  zlRenderWidget();
  updateAllZinos();
}

// ── Check streak milestones ──
function checkStreakMilestone() {
  const s = state.user.streak;
  const milestones = [3, 7, 14, 30];
  if (milestones.includes(s)) {
    state.user.zinoCoins += 20;
    updateAllZinos();
    zlSave();
    showToast(`🔥 ${s} Day Streak! +20 Bonus Balloons! OP consistency 😎`);
  }
}

// ── Render the home widget ──
function zlRenderWidget() {
  // Streak
  const streakEl = document.getElementById('zl-streak-count');
  if (streakEl) streakEl.textContent = state.user.streak || 0;
  // Balloons
  const ballEl = document.getElementById('zl-balloon-count');
  if (ballEl) ballEl.textContent = state.user.zinoCoins || 0;

  const activities = state.zinoLoop.dailyPlan.activities;
  const scroll = document.getElementById('zl-activity-scroll');
  const hint = document.getElementById('zl-empty-hint');

  if (activities.length === 0) {
    scroll && scroll.classList.add('hidden');
    hint && hint.classList.remove('hidden');
    return;
  }

  hint && hint.classList.add('hidden');
  scroll && scroll.classList.remove('hidden');

  // Render mini home cards
  scroll.innerHTML = '';
  activities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'zl-home-card' + (act.completed ? ' done' : '');
    card.id = `zl-home-card-${act.id}`;
    card.innerHTML = `
      <div class="zl-hc-icon">${act.icon}</div>
      <div class="zl-hc-name">${act.name}</div>
    `;
    card.onclick = () => zlToggleComplete(act.id, card);
    scroll.appendChild(card);
  });

  // Progress bar
  zlRenderProgressBar();
}

// ── Progress bar in widget ──
function zlRenderProgressBar() {
  const acts = state.zinoLoop.dailyPlan.activities;
  if (!acts.length) return;
  let row = document.getElementById('zl-progress-row');
  if (!row) {
    row = document.createElement('div');
    row.id = 'zl-progress-row';
    row.className = 'zl-progress-row';
    row.innerHTML = `
      <div class="zl-progress-bar"><div class="zl-progress-fill" id="zl-progress-fill" style="width:0%"></div></div>
      <div class="zl-progress-label" id="zl-progress-label">0/${acts.length}</div>
    `;
    document.getElementById('zino-loop-widget').appendChild(row);
  }
  const done = acts.filter(a => a.completed).length;
  const pct = Math.round((done / acts.length) * 100);
  const fill = document.getElementById('zl-progress-fill');
  const lbl = document.getElementById('zl-progress-label');
  if (fill) fill.style.width = pct + '%';
  if (lbl) lbl.textContent = `${done}/${acts.length}`;
}

// ── Tap to toggle complete (home card) ──
function zlToggleComplete(actId, cardEl) {
  const acts = state.zinoLoop.dailyPlan.activities;
  const act = acts.find(a => a.id === actId);
  if (!act) return;

  if (act.completed) return; // Already done — no undo

  act.completed = true;
  cardEl.classList.add('done');

  // +5 Balloons
  state.user.zinoCoins += 5;
  updateAllZinos();
  zlSave();

  // Coin burst animation
  const burst = document.createElement('div');
  burst.className = 'zl-coin-burst';
  burst.textContent = '+5 🎈';
  cardEl.appendChild(burst);
  setTimeout(() => burst.remove(), 750);

  // Update progress
  zlRenderProgressBar();

  // Check if all done
  const allDone = acts.every(a => a.completed);
  if (allDone) {
    setTimeout(() => {
      state.user.zinoCoins += 10;
      updateAllZinos();
      zlSave();
      state.user.lastActiveDate = zlTodayStr();
      showToast('⚡ SABHI done! +10 Bonus Balloons! OP consistency 😎');
      setTimeout(() => showShareCard(), 1400);
    }, 600);
  } else {
    showToast('✅ +5 Zino Balloons! Level bana le 🔥');
  }
}

// ── OPEN BOTTOM SHEET ──
function openLoopBuilder() {
  const backdrop = document.getElementById('zl-backdrop');
  const sheet = document.getElementById('zl-sheet');
  backdrop.classList.remove('hidden');
  sheet.classList.remove('hidden');
  zlRenderSheet();
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// ── CLOSE BOTTOM SHEET ──
function closeLoopBuilder() {
  const backdrop = document.getElementById('zl-backdrop');
  const sheet = document.getElementById('zl-sheet');
  backdrop.classList.add('hidden');
  sheet.classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Render sheet contents ──
function zlRenderSheet() {
  zlRenderSheetList();
  zlRenderPredefinedGrid();
  zlUpdateCountLabel();
}

function zlUpdateCountLabel() {
  const count = state.zinoLoop.dailyPlan.activities.length;
  const el = document.getElementById('zl-activity-count-label');
  if (el) {
    if (count === 0) el.textContent = 'Koi nahi abhi — add kar!';
    else el.textContent = `${count} activit${count === 1 ? 'y' : 'ies'} planned`;
  }
}

// ── Render draggable activity list inside sheet ──
function zlRenderSheetList() {
  const list = document.getElementById('zl-activity-list');
  if (!list) return;
  const acts = state.zinoLoop.dailyPlan.activities;
  list.innerHTML = '';

  if (acts.length === 0) {
    list.innerHTML = `<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:0.85rem;font-weight:700;padding:12px 0;">Bas itna? Aur add kare? 😏</div>`;
    return;
  }

  acts.forEach((act, idx) => {
    const item = document.createElement('div');
    item.className = 'zl-list-item';
    item.dataset.id = act.id;
    item.draggable = true;
    item.innerHTML = `
      <span class="zl-item-icon">${act.icon}</span>
      <span class="zl-item-name">${act.name}</span>
      <span class="zl-item-drag"><i class="fa-solid fa-grip-lines"></i></span>
      <button class="zl-item-remove" onclick="zlRemoveActivity('${act.id}')" title="Remove">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    // Drag events
    item.addEventListener('dragstart', zlDragStart);
    item.addEventListener('dragover', zlDragOver);
    item.addEventListener('drop', zlDrop);
    item.addEventListener('dragend', zlDragEnd);
    // Touch drag (mobile)
    item.addEventListener('touchstart', zlTouchStart, { passive: true });
    item.addEventListener('touchmove', zlTouchMove, { passive: false });
    item.addEventListener('touchend', zlTouchEnd, { passive: true });
    list.appendChild(item);
  });
}

// ── Drag-and-drop reorder ──
let zlDragIdx = null;
let zlDragEl = null;
let zlTouchY = 0;
let zlTouchDragEl = null;

function zlDragStart(e) {
  const list = document.getElementById('zl-activity-list');
  zlDragEl = e.currentTarget;
  zlDragIdx = Array.from(list.children).indexOf(zlDragEl);
  setTimeout(() => zlDragEl.classList.add('dragging'), 0);
}
function zlDragOver(e) {
  e.preventDefault();
  const list = document.getElementById('zl-activity-list');
  const overEl = e.currentTarget;
  const overIdx = Array.from(list.children).indexOf(overEl);
  if (overIdx !== zlDragIdx) {
    const acts = state.zinoLoop.dailyPlan.activities;
    const [moved] = acts.splice(zlDragIdx, 1);
    acts.splice(overIdx, 0, moved);
    zlDragIdx = overIdx;
    zlRenderSheetList();
  }
}
function zlDrop(e) { e.preventDefault(); }
function zlDragEnd() {
  if (zlDragEl) zlDragEl.classList.remove('dragging');
  zlDragEl = null; zlDragIdx = null;
}

// Touch drag
function zlTouchStart(e) {
  zlTouchY = e.touches[0].clientY;
  zlTouchDragEl = e.currentTarget;
}
function zlTouchMove(e) {
  if (!zlTouchDragEl) return;
  e.preventDefault();
  const dy = e.touches[0].clientY - zlTouchY;
  zlTouchDragEl.style.transform = `translateY(${dy}px)`;
  zlTouchDragEl.style.zIndex = '999';
  zlTouchDragEl.style.opacity = '0.8';
}
function zlTouchEnd(e) {
  if (!zlTouchDragEl) return;
  zlTouchDragEl.style.transform = '';
  zlTouchDragEl.style.zIndex = '';
  zlTouchDragEl.style.opacity = '';
  // Simple reorder by final touch position
  const list = document.getElementById('zl-activity-list');
  const items = Array.from(list.querySelectorAll('.zl-list-item'));
  const fromIdx = items.indexOf(zlTouchDragEl);
  const endY = e.changedTouches[0].clientY;
  let toIdx = fromIdx;
  items.forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    if (endY > rect.top && endY < rect.bottom) toIdx = i;
  });
  if (toIdx !== fromIdx) {
    const acts = state.zinoLoop.dailyPlan.activities;
    const [moved] = acts.splice(fromIdx, 1);
    acts.splice(toIdx, 0, moved);
    zlRenderSheetList();
  }
  zlTouchDragEl = null;
}

// ── Render predefined activity pills ──
function zlRenderPredefinedGrid() {
  const grid = document.getElementById('zl-predefined-grid');
  if (!grid) return;
  const addedIds = state.zinoLoop.dailyPlan.activities.map(a => a.id);
  grid.innerHTML = '';
  activityMaster.forEach(act => {
    const pill = document.createElement('button');
    const isAdded = addedIds.includes(act.id);
    pill.className = 'zl-pill' + (isAdded ? ' added' : '');
    pill.id = `zl-pill-${act.id}`;
    pill.innerHTML = `<span class="zl-pill-icon">${act.icon}</span>${act.name}`;
    pill.onclick = () => zlAddActivity(act);
    grid.appendChild(pill);
  });
}

// ── Add predefined activity ──
function zlAddActivity(act) {
  const acts = state.zinoLoop.dailyPlan.activities;
  if (acts.find(a => a.id === act.id)) {
    showToast(`${act.icon} Already added!`);
    return;
  }
  if (acts.length >= 6) {
    showToast('😎 Max 6! Bas itna enough hai.');
    return;
  }
  acts.push({ id: act.id, icon: act.icon, name: act.name, completed: false, order: acts.length, isCustom: false });
  zlRenderSheet();
}

// ── Add custom activity ──
function addCustomActivity() {
  const input = document.getElementById('zl-custom-input');
  if (!input) return;
  const name = input.value.trim();
  if (!name) {
    shakeElement(input);
    showToast('🖊️ Kuch naam toh likho!');
    return;
  }
  const acts = state.zinoLoop.dailyPlan.activities;
  if (acts.length >= 6) {
    showToast('😎 Max 6 activities — bas itna karo pehle!');
    return;
  }
  const id = 'custom_' + Date.now();
  const icons = ['⭐','🔆','🎯','💫','🌟','🚀','🎪','🎭'];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  acts.push({ id, icon, name, completed: false, order: acts.length, isCustom: true });
  input.value = '';
  zlRenderSheetList();
  zlUpdateCountLabel();
  showToast(`${icon} "${name}" added!`);
}

// ── Remove activity from sheet ──
function zlRemoveActivity(actId) {
  const acts = state.zinoLoop.dailyPlan.activities;
  const idx = acts.findIndex(a => a.id === actId);
  if (idx !== -1) acts.splice(idx, 1);
  zlRenderSheet();
}

// ── Save plan & close sheet ──
function saveLoopPlan() {
  const acts = state.zinoLoop.dailyPlan.activities;
  state.user.lastActiveDate = zlTodayStr();
  zlSave();
  closeLoopBuilder();
  zlRenderWidget();
  const count = acts.length;
  if (count === 0) {
    showToast('📝 Plan khali hai — add some activities!');
  } else {
    showToast(`✅ ${count} activit${count===1?'y':'ies'} locked in! Level bana le 🔥`);
  }
}

// ── SHARE CARD ──
function showShareCard() {
  const s = state.user.streak || 0;
  const b = state.user.zinoCoins || 0;

  // Determine level
  const levels = [
    { min: 0,    label: 'Beginner',          emoji: '🌱' },
    { min: 3,    label: 'Challenger',         emoji: '⚡' },
    { min: 7,    label: 'Consistent Player',  emoji: '🔥' },
    { min: 14,   label: 'Beast Mode',         emoji: '💥' },
    { min: 30,   label: 'Crazy Legend',       emoji: '👑' },
  ];
  let lvl = levels[0];
  levels.forEach(l => { if (s >= l.min) lvl = l; });

  document.getElementById('zl-sc-streak').textContent = s;
  document.getElementById('zl-sc-balloons').textContent = b;
  document.getElementById('zl-sc-level').textContent = lvl.label;
  document.getElementById('zl-sc-level-emoji').textContent = lvl.emoji;
  document.getElementById('zl-sc-label').textContent = lvl.label;

  document.getElementById('zl-share-modal').classList.remove('hidden');
}

function closeShareCard() {
  document.getElementById('zl-share-modal').classList.add('hidden');
}

function downloadShareCard() {
  showToast('💾 Card saving… (screenshot mode!)');
  // For mobile demo: just prompt screenshot
  closeShareCard();
}

function shareZinoCard() {
  const s = state.user.streak || 0;
  const b = state.user.zinoCoins || 0;
  const text = `🔥 ${s} Day Streak on Kidzinos!\n🎈 ${b} Zino Balloons earned!\n\nLevel bana le 🚀 #Kidzinos #CrazyXYZ`;
  if (navigator.share) {
    navigator.share({ title: 'Mera Zino Loop Card! 🔥', text, url: 'https://kidzinos.com' }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(text);
    showToast('📋 Card details copied!');
  }
  closeShareCard();
}

// ── Hook initZinoLoop into home screen enter ──
// (We extend the existing onScreenEnter override at bottom of file)
const _zlOrigOnScreenEnter = onScreenEnter;
function onScreenEnter(screenId) {
  _zlOrigOnScreenEnter(screenId);
  if (screenId === 'home') {
    initZinoLoop();
  }
}
