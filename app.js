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

    // Correct OTP
    boxes.forEach(b => {
      b.style.borderColor = 'var(--crazy-green)';
      b.style.background = 'rgba(16,185,129,0.1)';
    });
    state.loggedIn = true;
    showToast(' OTP Verified! Welcome back!');
    setTimeout(() => navigateTo('home'), 800);
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
  const { score, correct, questions } = state.quiz;
  const earned = score;

  // Add coins
  state.user.zinoCoins += earned;
  updateAllZinos();

  // Calculate rank (mock)
  const rankPct = Math.max(1, Math.floor(Math.random() * 30) + 1);

  // Set result screen
  const resultIcons = { 10: '', 8: '', 6: 'S', 4: 'a', 0: '"' };
  const correctCount = correct;
  const icon = correctCount >= 9 ? '' : correctCount >= 7 ? '' : correctCount >= 5 ? 'S' : '"';
  const title = correctCount >= 9 ? 'You Crushed It!' : correctCount >= 7 ? 'Great Job!' : correctCount >= 5 ? 'Keep Going!' : 'Try Again!';

  document.getElementById('result-icon').textContent = icon;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-coins-won').textContent = `+${earned}`;
  document.getElementById('result-score').textContent = score;
  document.getElementById('result-rank').textContent = `Top ${rankPct}%`;
  document.getElementById('result-correct').textContent = `${correct}/${questions.length}`;

  state.user.challengeAttempts++;
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
