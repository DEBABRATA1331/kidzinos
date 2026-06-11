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
    { q: "What is 15 x 8?", cat: "Mathematics", opts: ["100", "115", "120", "130"], ans: 2 },
    { q: "Which is the largest ocean?", cat: "Geography", opts: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: 3 },
    { q: "How many bones are in the human body?", cat: "Biology", opts: ["196", "206", "216", "226"], ans: 1 },
    { q: "What does DNA stand for?", cat: "Biology", opts: ["Deoxyribonucleic Acid", "Dynamic New Atom", "Double Neural Acid", "None"], ans: 0 },
    { q: "Who wrote 'Romeo and Juliet'?", cat: "Literature", opts: ["Dickens", "Austen", "Shakespeare", "Twain"], ans: 2 },
    { q: "What is the capital of India?", cat: "Geography", opts: ["Mumbai", "Delhi", "Kolkata", "Chennai"], ans: 1 },
    { q: "Which gas do plants absorb?", cat: "Science", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], ans: 2 },
    { q: "What is the hardest natural substance on Earth?", cat: "Science", opts: ["Gold", "Iron", "Diamond", "Platinum"], ans: 2 },
    { q: "Who painted the Mona Lisa?", cat: "Art", opts: ["Van Gogh", "Da Vinci", "Picasso", "Michelangelo"], ans: 1 },
    { q: "Which programming language is known as the web language?", cat: "Technology", opts: ["Python", "Java", "C++", "JavaScript"], ans: 3 },
    { q: "What is the square root of 144?", cat: "Mathematics", opts: ["10", "12", "14", "16"], ans: 1 },
    { q: "Which gas makes up most of Earth's atmosphere?", cat: "Science", opts: ["Oxygen", "Carbon", "Nitrogen", "Argon"], ans: 2 }
  ],
  war: [
    { q: "What is Newton's First Law of Motion about?", cat: "Physics", opts: ["Gravity", "Inertia", "Energy", "Force"], ans: 1 },
    { q: "The Mahabharata was written by whom?", cat: "Culture", opts: ["Valmiki", "Tulsidas", "Vyasa", "Kalidasa"], ans: 2 },
    { q: "Which country has the most natural lakes?", cat: "Geography", opts: ["USA", "Russia", "Canada", "Brazil"], ans: 2 },
    { q: "What is the speed of light?", cat: "Physics", opts: ["3x10^8 m/s", "3x10^6 m/s", "3x10^5 m/s", "3x10^9 m/s"], ans: 0 },
    { q: "Which element has atomic number 1?", cat: "Chemistry", opts: ["Helium", "Hydrogen", "Lithium", "Carbon"], ans: 1 },
    { q: "Who was the first person in space?", cat: "Science", opts: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"], ans: 2 },
    { q: "How many sides does a hexagon have?", cat: "Mathematics", opts: ["5", "6", "7", "8"], ans: 1 },
    { q: "What does CPU stand for in computers?", cat: "Technology", opts: ["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Central Processor Unit"], ans: 2 },
    { q: "Which planet is closest to the Sun?", cat: "Astronomy", opts: ["Venus", "Earth", "Mars", "Mercury"], ans: 3 },
    { q: "What is the boiling point of water in Celsius?", cat: "Physics", opts: ["90", "100", "110", "120"], ans: 1 }
  ],
  stash: [
    { q: "Which is the tallest mountain in the world?", cat: "Geography", opts: ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"], ans: 1 },
    { q: "What is the largest mammal?", cat: "Biology", opts: ["Elephant", "Blue Whale", "Giraffe", "Shark"], ans: 1 },
    { q: "Who discovered Penicillin?", cat: "Science", opts: ["Marie Curie", "Alexander Fleming", "Isaac Newton", "Albert Einstein"], ans: 1 },
    { q: "Which is the smallest continent?", cat: "Geography", opts: ["Europe", "Australia", "Antarctica", "South America"], ans: 1 },
    { q: "What is 25% of 200?", cat: "Mathematics", opts: ["25", "50", "75", "100"], ans: 1 },
    { q: "In which year did the Titanic sink?", cat: "History", opts: ["1905", "1912", "1918", "1923"], ans: 1 }
  ]
};

// ===== SCREEN NAVIGATION =====
function navigateTo(screenId) {
  const noNav = ['splash','login','register','quiz','result','battle','unlimited-zone'];
  const noStrip = ['splash','login','register','quiz','result','battle'];

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
  const navMap = { home: 'nav-home', play: 'nav-play', watch: 'nav-watch', store: 'nav-store', games: 'nav-games' };
  if (navMap[screenId]) {
    document.getElementById(navMap[screenId])?.classList.add('active-nav');
  }
}

function onScreenEnter(screenId) {
  if (screenId === 'unlimited-zone' && typeof initUnlimitedZone === 'function') initUnlimitedZone();

  switch (screenId) {
    case 'home':
      updateHomeZinos();
      startBannerSlider();
      updateHomeUserName();
      if (typeof initCustomContests === 'function') initCustomContests();
      break;
    case 'store':
      document.getElementById('store-zino').textContent = state.user.zinoCoins;
      break;
    case 'profile':
      updateProfileScreen();
      break;
    case 'play':
      document.getElementById('play-zino').textContent = state.user.zinoCoins;
      if (typeof initCustomContests === 'function') initCustomContests();
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
  if (nameEl) nameEl.textContent = "Welcome back, " + state.user.name;
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
      // Restore saved profile/game state for returning user
      if (typeof loadGameState === 'function') loadGameState();
      state.loggedIn = true;
      localStorage.setItem('kidzinos_logged_in', 'true');
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
  localStorage.setItem('kidzinos_logged_in', 'true');
  // Persist profile so it survives refresh
  if (typeof saveGameState === 'function') saveGameState();

  showToast(' Profile created! Welcome to Kidzinos!');
  setTimeout(() => navigateTo('home'), 800);
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    state.loggedIn = false;
    localStorage.removeItem('kidzinos_logged_in');
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
  const tabs = ['drill', 'arcade', 'clash', 'war'];
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
  let d;
  if (id && id.toString().startsWith('custom_')) {
    const customContests = JSON.parse(localStorage.getItem('kidzinos_contests') || '[]');
    const contest = customContests.find(c => c.id === id);
    if (contest) {
      d = {
        name: contest.title,
        prize1: contest.prizes && contest.prizes[0] ? contest.prizes[0] : 'N/A',
        prize2: contest.prizes && contest.prizes[1] ? contest.prizes[1] : 'N/A',
        prize3: contest.prizes && contest.prizes[2] ? contest.prizes[2] : 'N/A',
        day: 1,
        total: 1,
        ends: contest.endDate ? new Date(contest.endDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : 'TBD',
        rules: contest.rules || '',
        type: contest.type || 'war'
      };
    }
  }

  if (!d) {
    d = challengeData[id] || challengeData['war1'];
  }

  // Update content
  document.getElementById('chd-name').textContent = d.name;

  // Update rewards
  const rw = document.querySelectorAll('.chd-reward-row strong');
  if (rw[0]) rw[0].textContent = d.prize1 + (d.prize1.includes('₹') || (d.prize1.includes('🎈') || d.prize1.includes('🪙')) || d.prize1.includes('cash') ? '' : ' cash');
  if (rw[1]) rw[1].textContent = d.prize2 + (d.prize2.includes('₹') || (d.prize2.includes('🎈') || d.prize2.includes('🪙')) || d.prize2.includes('cash') ? '' : ' cash');
  if (rw[2]) rw[2].textContent = d.prize3 + (d.prize3.includes('₹') || (d.prize3.includes('🎈') || d.prize3.includes('🪙')) || d.prize3.includes('cash') ? '' : ' cash');

  // Update stat
  const stvals = document.querySelectorAll('.chd-stat-val');
  if (stvals[0]) stvals[0].innerHTML = `<i class="fa-solid fa-fire"></i> ${d.type ? d.type.toUpperCase() : 'CONTEST'}`;
  if (stvals[1]) stvals[1].innerHTML = `<i class="fa-solid fa-layer-group"></i> ${d.total || 1} Day(s)`;
  if (stvals[2]) stvals[2].innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${d.ends}`;

  // Update rules for custom contest if custom rules present
  const rulesList = document.querySelector('.chd-rules-list');
  if (rulesList && d.rules) {
    rulesList.innerHTML = d.rules.split('\n').filter(r => r.trim()).map((rule, idx) => `
      <div class="chd-rule">
        <span class="chd-rule-num">${idx + 1}</span>
        <span>${rule}</span>
      </div>
    `).join('');
  } else if (rulesList) {
    rulesList.innerHTML = `
      <div class="chd-rule"><span class="chd-rule-num">1</span> <span>One Shot Only &ndash; Once you submit, that attempt is locked. No take-backs.</span></div>
      <div class="chd-rule"><span class="chd-rule-num">2</span> <span>Beat the Clock &ndash; Finish before time runs out, or the test ends automatically.</span></div>
      <div class="chd-rule"><span class="chd-rule-num">3</span> <span>Play Fair, Think Smart &ndash; No cheating, no outside help, no shortcuts.</span></div>
      <div class="chd-rule"><span class="chd-rule-num">4</span> <span>Stable Net, Stable Mind &ndash; Poor connection is your risk. Keep internet ready.</span></div>
      <div class="chd-rule"><span class="chd-rule-num">5</span> <span>Fast + Right Wins &ndash; Accuracy matters most, speed breaks ties.</span></div>
    `;
  }

  // Update the sticky CTA button to start the quiz
  const ctaBtn = document.querySelector('.chd-sticky-cta button');
  if (ctaBtn) {
    const modeMap = { Practice: 'daily', Contest: 'daily', Clash: 'stash', War: 'war' };
    const quizMode = modeMap[d.type] || 'daily';
    ctaBtn.setAttribute('onclick', `startQuiz('${quizMode}')`);
    ctaBtn.innerHTML = `<i class="fa-solid fa-lock-open"></i> Start Challenge Now`;
  }

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

function startQuiz(mode, isVs = false, oppName = 'Opponent') {
  if (typeof syncCustomQuestions === 'function') syncCustomQuestions();
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
  state.quiz.isVs = isVs;
  state.quiz.oppName = oppName;
  state.quiz.oppScore = 0;
  clearTimeout(state.quiz.oppTimeout);

  const vsOverlay = document.getElementById('vs-mode-overlay');
  if (vsOverlay) {
    if (isVs) {
      vsOverlay.classList.remove('hidden');
      document.getElementById('vs-opp-name').textContent = oppName;
      document.getElementById('vs-my-score').textContent = 0;
      document.getElementById('vs-opp-score').textContent = 0;
      document.getElementById('vs-prog-me').style.width = '0%';
      document.getElementById('vs-prog-opp').style.width = '0%';
    } else {
      vsOverlay.classList.add('hidden');
    }
  }

  navigateTo('quiz');

  const modeNames = { daily: ' Daily Drill', war: ' Crazy War', stash: ' Weekly Stash' };
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
  if(state.quiz.isVs) simulateOpponent();
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

  
  if(state.quiz.isVs) {
    document.getElementById('vs-my-score').textContent = state.quiz.score;
    const qCount = state.quiz.questions.length;
    document.getElementById('vs-prog-me').style.width = ((state.quiz.current + 1)/qCount)*100 + '%';
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
  if (totalEl) totalEl.textContent = `Total: ${state.user.zinoCoins} 🪙`;
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
  // WATCH & EARN logic has been moved to watch-features.js
  clearInterval(state.quiz.timerInterval);
  navigateTo('play');
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
  document.getElementById('player-status').textContent = 'Watch 80% to earn Zino Coin';

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
        document.getElementById('player-status').textContent = ' Zino Coin Earned! Keep watching!';
        document.getElementById('player-prog-fill').style.background = 'var(--crazy-green)';
        showToast(' +1 Zino Coin Earned!');
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
    confirmBtn.onclick = () => showToast(' Not enough Zino Coins!');
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
    showToast(' Not enough Zino Coins!');
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

  // After loader animation, check persistent login
  const isLoggedIn = localStorage.getItem('kidzinos_logged_in') === 'true';
  const splashDelay = isLoggedIn ? 900 : 2800; // Faster splash if already logged in

  setTimeout(() => {
    setupBannerSwipe();
    initMissionsTimer();
    if (isLoggedIn) {
      // Restore all state before going home
      if (typeof loadGameState === 'function') loadGameState();
      state.loggedIn = true;
      navigateTo('home');
      setTimeout(() => showStreakPopup(), 1200);
    } else {
      navigateTo('login');
    }
  }, splashDelay);

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
  const target = e.target.closest('.home-scroll, .stories-row, .quiz-body, .reg-bg, .onboard-bg');
  if (!target) e.preventDefault();
}, { passive: false });

// ===== STREAK SYSTEM =====
function claimDailyStreakRewardSilently() {
  if (!state.loggedIn) return;
  const s = state.user.streak || 5;
  const bonus = s >= 7 ? 25 : s >= 5 ? 15 : s >= 3 ? 10 : 5;
  
  const todayStr = new Date().toDateString();
  const lastClaim = localStorage.getItem('kidzinos_last_streak_claim');
  if (lastClaim === todayStr) {
    updateAllZinos();
    if (typeof updateHomeStats === 'function') updateHomeStats();
    updateHomeStreakStrip();
    return;
  }
  
  state.user.zinoCoins += bonus;
  localStorage.setItem('kidzinos_last_streak_claim', todayStr);
  if (typeof saveGameState === 'function') saveGameState();
  
  updateAllZinos();
  if (typeof updateHomeStats === 'function') updateHomeStats();
  updateHomeStreakStrip();
  showToast(`⚡ Daily Streak Maintained! +${bonus} Zino Coins added!`);
}
function showStreakPopup() {
  claimDailyStreakRewardSilently();
}
function closeStreakPopup() {
  // Legacy fallback
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
    showToast(`✅ Mission done! +${rewards[idx]} Zino Coins!`);
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
    showToast('⚡ DAILY CRAZY COMBO! +25 Bonus Coins!');
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
      <div class="grp-reward"><img src="zino-coin.png" style="width:24px;" /> +${earned} Zino Coins Earned!</div>
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
onScreenEnter = function(screenId) {
  origOnScreenEnter(screenId);
  const fab = document.getElementById('games-fab');
  const showFabOn = ['home','play','store','profile','csi','community'];
  if (fab) {
    if (showFabOn.includes(screenId)) fab.classList.add('show');
    else fab.classList.remove('show');
  }
  if (screenId === 'home') {
    updateHomeStreakStrip();
  }
};

// ===== FRIEND CHALLENGE =====
let friendChallengesLeft = 3;

function openFriendChallengeModal() {
  document.getElementById('fc-modal').classList.remove('hidden');
  document.getElementById('fc-modal-count').textContent = friendChallengesLeft;
  const drillLeftCount = document.getElementById('fc-left-count');
  if (drillLeftCount) drillLeftCount.textContent = friendChallengesLeft;
}

function closeFriendChallengeModal() {
  document.getElementById('fc-modal').classList.add('hidden');
}

function sendFriendChallenge(btn, friendName) {
  if (friendChallengesLeft <= 0) {
    showToast('❌ No challenges left for today!');
    return;
  }
  
  if (btn.classList.contains('invited')) return;

  friendChallengesLeft--;
  state.user.csiScore += 20; // Increase social point
  
  btn.classList.add('invited');
  btn.textContent = 'Invited!';
  
  document.getElementById('fc-modal-count').textContent = friendChallengesLeft;
  const drillLeftCount = document.getElementById('fc-left-count');
  if (drillLeftCount) drillLeftCount.textContent = friendChallengesLeft;
  
  showToast(`🔥 Challenged ${friendName}! +20 CSI Points!`);
  
  // Optionally update CSI visually if on CSI screen
  const csiEl = document.getElementById('csi-score-number');
  if (csiEl) csiEl.setAttribute('data-target', state.user.csiScore);

  closeFriendChallengeModal();
  startQuiz('daily', true, friendName);
}
// VS Mode opponent simulation
function simulateOpponent() {
  clearTimeout(state.quiz.oppTimeout);
  if(state.quiz.current >= state.quiz.questions.length) return;
  
  const delay = 1000 + Math.random() * 4000; // Opponent takes 1-5 seconds to answer
  state.quiz.oppTimeout = setTimeout(() => {
    // 70% chance to get it right
    if(Math.random() > 0.3) {
      state.quiz.oppScore += 10 + Math.floor(Math.random()*5);
      const oppScoreEl = document.getElementById('vs-opp-score');
      if (oppScoreEl) oppScoreEl.textContent = state.quiz.oppScore;
    }
    const qCount = state.quiz.questions.length;
    // Just loosely tie opponent progress to time passed so it feels alive
    const oppProgEl = document.getElementById('vs-prog-opp');
    if (oppProgEl) {
        let oppProg = parseFloat(oppProgEl.style.width) || 0;
        oppProg += (100 / qCount);
        oppProgEl.style.width = Math.min(100, oppProg) + '%';
    }
    
    // Sometimes opponent sends an emoji
    if(Math.random() > 0.7) {
      const emojis = ['🔥', '🥶', '💣'];
      const e = emojis[Math.floor(Math.random() * emojis.length)];
      showIncomingVsAttack(e);
    }
  }, delay);
}

function sendVsAttack(emoji) {
  showToast(`Sent ${emoji} to ${state.quiz.oppName}!`);
  // Small bonus
  state.quiz.score += 5; 
  if(state.quiz.isVs) {
      const myScoreEl = document.getElementById('vs-my-score');
      if(myScoreEl) myScoreEl.textContent = state.quiz.score;
  }
}

function showIncomingVsAttack(emoji) {
  const el = document.getElementById('vs-incoming-atk');
  if(!el) return;
  el.textContent = emoji;
  el.classList.remove('hidden');
  el.style.opacity = '1';
  el.style.transform = 'translate(-50%,-50%) scale(2)';
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%,-50%) scale(0)';
  }, 1500);
}

// ===== LOCALSTORAGE CUSTOM SYNC =====
const defaultQuestionBank = JSON.parse(JSON.stringify(questionBank));

function syncCustomQuestions() {
  for (const key in defaultQuestionBank) {
    questionBank[key] = [...defaultQuestionBank[key]];
  }

  const customQuestions = JSON.parse(localStorage.getItem('kidzinos_questions') || '[]');
  customQuestions.forEach(q => {
    const mode = q.mode || 'daily';
    if (questionBank[mode]) {
      questionBank[mode].push({
        q: q.q,
        opts: q.opts,
        ans: parseInt(q.ans),
        cat: q.cat || 'General'
      });
    }
  });
}

function initCustomContests() {
  const customContests = JSON.parse(localStorage.getItem('kidzinos_contests') || '[]');

  // 1. Render in Home Screen Hero Banner Slider
  const slider = document.querySelector('.banner-slider');
  const dotsContainer = document.querySelector('.banner-dots');

  if (slider && dotsContainer) {
    document.querySelectorAll('.custom-slide, .custom-dot').forEach(el => el.remove());

    customContests.forEach(contest => {
      const slide = document.createElement('div');
      slide.className = 'banner-slide custom-slide';

      let gradient = 'linear-gradient(135deg, #1e003a, #7c3aed)';
      if (contest.type === 'Clash') gradient = 'linear-gradient(135deg, #091830, #0050cc)';
      if (contest.type === 'War') gradient = 'linear-gradient(135deg, #1a0500, #ff4500)';

      slide.style.background = gradient;

      const topPrize = contest.prizes && contest.prizes[0] ? contest.prizes[0] : 'Rewards';
      const typeLabel = contest.type ? contest.type.toUpperCase() : 'CONTEST';
      const leagueLabel = contest.league && contest.league !== 'No League' ? ` • ${contest.league.toUpperCase()}` : '';

      slide.innerHTML = `
        <div class="banner-text">
          <div class="banner-label"><i class="fa-solid fa-trophy"></i> ${typeLabel}${leagueLabel}</div>
          <div class="banner-title">${contest.title}</div>
          <div class="banner-sub">Top Prize: ${topPrize} • Play to Win!</div>
          <button class="banner-cta" onclick="showChallengeDetail('${contest.id}')">Join Now</button>
        </div>
        <img src="${contest.imageUrl || 'char1.jpg'}" class="banner-char" alt="Crazy XYZ" onerror="this.src='char1.jpg'" />
      `;

      slider.insertBefore(slide, dotsContainer);

      const dot = document.createElement('span');
      dot.className = 'b-dot custom-dot';
      dotsContainer.appendChild(dot);
    });
  }

  // 2. Render in Play Zone Tabs
  const drillContainer = document.getElementById('custom-drill-container');
  const clashContainer = document.getElementById('custom-clash-container');
  const warContainer = document.getElementById('custom-war-container');

  if (drillContainer) drillContainer.innerHTML = '';
  if (clashContainer) clashContainer.innerHTML = '';
  if (warContainer) warContainer.innerHTML = '';

  customContests.forEach(contest => {
    let targetContainer = null;
    let cardClass = 'challenge-card-new';
    let actionBtnClass = 'drill-action';
    let actionIcon = 'fa-bolt';
    let actionText = 'Start Now';
    let rewardText = contest.prizes && contest.prizes[0] ? contest.prizes[0] : '+10 Zino Coins';

    if (contest.type === 'Practice' || contest.type === 'Contest') {
      targetContainer = drillContainer;
      cardClass = 'challenge-card-new';
      actionBtnClass = 'drill-action';
      actionIcon = 'fa-bolt';
      actionText = 'Start Now';
    } else if (contest.type === 'Clash') {
      targetContainer = clashContainer;
      cardClass = 'challenge-card-new';
      actionBtnClass = 'clash-action';
      actionIcon = 'fa-calendar-week';
      actionText = 'Enter Clash';
    } else if (contest.type === 'War') {
      targetContainer = warContainer;
      cardClass = 'challenge-card-new';
      actionBtnClass = 'war-action';
      actionIcon = 'fa-khanda';
      actionText = 'Enter War';
    }

    if (targetContainer) {
      const card = document.createElement('div');
      card.className = `${cardClass} custom-card`;
      card.setAttribute('onclick', `showChallengeDetail('${contest.id}')`);
      card.style.marginTop = '16px'; // Space out nicely from preceding items

      const endsText = contest.endDate ? new Date(contest.endDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : 'TBD';

      card.innerHTML = `
        <div class="chn-thumb" style="background: linear-gradient(135deg, #10062a, #3b0764)">
          <img src="${contest.imageUrl || 'char3.jpg'}" class="chn-bg-img" alt="" onerror="this.src='char3.jpg'" />
          <div class="chn-thumb-overlay"></div>
          <div class="chn-live-badge"><span class="live-dot"></span> LIVE</div>
        </div>
        <div class="chn-body">
          <div class="chn-title">${contest.title}</div>
          <div class="chn-meta-row">
            <span class="chn-meta-item gold-text"><i class="fa-solid fa-trophy"></i> ${rewardText}</span>
            <span class="chn-meta-item"><i class="fa-solid fa-list-ol"></i> ${contest.league || 'All Leagues'}</span>
          </div>
          <div class="chn-meta-row">
            <span class="chn-meta-item"><i class="fa-regular fa-clock"></i> Fee: ${contest.entryFee ? '₹' + contest.entryFee : 'Free'}</span>
            <span class="chn-meta-item red-text"><i class="fa-solid fa-circle-dot"></i> Ends ${endsText}</span>
          </div>
          <button class="chn-action-btn ${actionBtnClass}">
            <i class="fa-solid ${actionIcon}"></i> ${actionText}
          </button>
        </div>
      `;
      targetContainer.appendChild(card);
    }
  });
}


/* =========================================================================
   DAILY DOZE & CRAZY RANK LEADERBOARD
   ========================================================================= */

// 1. Leaderboard Modal Logic
function openLeaderboard() {
  document.getElementById('leaderboard-modal').classList.remove('hidden');
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;
  
  const tags = [
    { name: 'Legend', icon: 'fa-crown', color: '#FFD700', rank: '#1 - #10' },
    { name: 'Grand Master', icon: 'fa-gem', color: '#8B5CF6', rank: '#11 - #50' },
    { name: 'Master', icon: 'fa-star', color: '#EF4444', rank: '#51 - #200' },
    { name: 'Hero', icon: 'fa-bolt', color: '#F97316', rank: '#201 - #1000' },
    { name: 'Super Human', icon: 'fa-fire', color: '#EC4899', rank: '#1001 - #5000' },
    { name: 'Pro', icon: 'fa-shield-halved', color: '#3B82F6', rank: '#5001 - #20000' },
    { name: 'Learner', icon: 'fa-book', color: '#10B981', rank: '#20001+' }
  ];
  
  list.innerHTML = tags.map((tag, i) => `
    <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; color:${tag.color}; font-size:1.2rem; box-shadow:0 0 15px ${tag.color}40;">
          <i class="fa-solid ${tag.icon}"></i>
        </div>
        <div>
          <div style="font-size:1.1rem; font-weight:800; color:#fff; font-family:'Space Grotesk', sans-serif;">${tag.name}</div>
          <div style="font-size:0.75rem; color:var(--st-muted); margin-top:2px;">Aspirational Rank</div>
        </div>
      </div>
      <div style="font-weight:700; color:rgba(255,255,255,0.8); background:rgba(0,0,0,0.3); padding:4px 10px; border-radius:20px; font-size:0.8rem;">
        ${tag.rank}
      </div>
    </div>
  `).join('');
}

function closeLeaderboard() {
  document.getElementById('leaderboard-modal').classList.add('hidden');
}

// 2. Daily Doze Swipe Logic
let dozeFacts = [
  { id: 1, category: "SPACE", text: "A day on Venus is longer than a year on Venus." },
  { id: 2, category: "ANIMALS", text: "Octopuses have three hearts and blue blood." },
  { id: 3, category: "TECH", text: "The first computer mouse was made of wood." },
  { id: 4, category: "HISTORY", text: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid." }
];

let currentDozeIndex = 0;
let isDozeOpen = false;

function toggleDailyDoze() {
  const container = document.getElementById('daily-doze-container');
  const arrow = document.getElementById('daily-doze-arrow');
  isDozeOpen = !isDozeOpen;
  
  if (isDozeOpen) {
    container.style.display = 'block';
    arrow.style.transform = 'rotate(180deg)';
    renderDailyDozeStack();
  } else {
    container.style.display = 'none';
    arrow.style.transform = 'rotate(0deg)';
  }
}

function renderDailyDozeStack() {
  const stack = document.getElementById('dd-swipe-stack');
  const grid = document.getElementById('dd-grid-view');
  const actions = document.getElementById('dd-actions');
  
  if (currentDozeIndex >= dozeFacts.length) {
    stack.style.display = 'none';
    actions.style.display = 'none';
    grid.style.display = 'flex';
    renderDozeGrid();
    return;
  }
  
  stack.style.display = 'block';
  actions.style.display = 'flex';
  grid.style.display = 'none';
  
  stack.innerHTML = '';
  // Render remaining cards
  for (let i = dozeFacts.length - 1; i >= currentDozeIndex; i--) {
    const fact = dozeFacts[i];
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.id = `doze-card-${i}`;
    card.style.zIndex = dozeFacts.length - i;
    
    // Scale down cards behind
    const diff = i - currentDozeIndex;
    if (diff > 0) {
      card.style.transform = `scale(${1 - diff * 0.05}) translateY(${diff * -10}px)`;
      card.style.opacity = `${1 - diff * 0.2}`;
    }
    
    card.innerHTML = `
      <div class="swipe-card-category">${fact.category}</div>
      <div class="swipe-card-content">${fact.text}</div>
    `;
    stack.appendChild(card);
  }
}

function swipeDailyDoze(direction) {
  if (currentDozeIndex >= dozeFacts.length) return;
  
  const currentCard = document.getElementById(`doze-card-${currentDozeIndex}`);
  if (currentCard) {
    if (direction === 'right') {
      currentCard.style.animation = 'swipeOutRight 0.4s forwards';
    } else {
      currentCard.style.animation = 'swipeOutLeft 0.4s forwards';
    }
    
    setTimeout(() => {
      currentDozeIndex++;
      renderDailyDozeStack();
    }, 400);
  }
}

function renderDozeGrid() {
  const gridItems = document.getElementById('dd-grid-items');
  gridItems.innerHTML = '';
  dozeFacts.forEach(fact => {
    const item = document.createElement('div');
    item.style.background = 'rgba(255,255,255,0.05)';
    item.style.border = '1px solid rgba(255,255,255,0.1)';
    item.style.borderRadius = '12px';
    item.style.padding = '12px';
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.gap = '8px';
    
    item.innerHTML = `
      <div style="font-size:0.7rem; color:#00F2FE; font-weight:800; letter-spacing:1px;">${fact.category}</div>
      <div style="font-size:0.8rem; color:#fff;">${fact.text}</div>
    `;
    gridItems.appendChild(item);
  });
}

// Add swipeOutLeft animation to CSS dynamically since we forgot it in social-ui.css
if (!document.getElementById('doze-animations')) {
  const style = document.createElement('style');
  style.id = 'doze-animations';
  style.innerHTML = `
    @keyframes swipeOutLeft {
      0% { transform: translateX(0) rotate(0); opacity: 1; }
      100% { transform: translateX(-150%) rotate(-30deg); opacity: 0; }
    }
    }
  `;
  document.head.appendChild(style);
}
// ===== SECRET MISSIONS =====
const smCityCards = [
  { name: 'Hyderabad', fact: 'The City of Pearls — home to the world\'s largest film studio complex, Ramoji Film City!' },
  { name: 'Delhi', fact: 'India\'s capital has ruins from 7 different cities built on the same ground across 1,000 years!' },
  { name: 'Jaipur', fact: 'The Pink City was painted pink in 1876 to welcome the Prince of Wales — and it stayed that way!' },
  { name: 'Kolkata', fact: 'Kolkata is home to Asia\'s oldest operating tram network, running since 1880!' },
  { name: 'Chennai', fact: 'Marina Beach in Chennai is the world\'s second longest natural urban beach!' },
];

let smCompleted = JSON.parse(localStorage.getItem('sm_completed') || '[false,false,false,false,false]');
let smCardIndex = parseInt(localStorage.getItem('sm_card_index') || '0');

function initSecretMissions() {
  smCompleted.forEach((done, i) => {
    if (done) markMissionDone(i);
  });
  updateSmProgress();
}

function toggleSecretMissions() {
  const body = document.getElementById('sm-body');
  const chevron = document.getElementById('sm-chevron');
  if (!body) return;
  const isOpen = body.style.display === 'block';
  body.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
}

function toggleLandmarks() {
  const lb = document.getElementById('sm-landmark-body');
  const chev = document.getElementById('lm-chevron');
  if (!lb) return;
  const isOpen = lb.style.display === 'block';
  lb.style.display = isOpen ? 'none' : 'block';
  if (chev) chev.style.transform = isOpen ? '' : 'rotate(180deg)';
}

function markMissionDone(index) {
  const row = document.getElementById(`sm-mission-${index}`);
  const check = document.getElementById(`sm-check-${index}`);
  if (row) row.classList.add('completed');
  if (check) {
    check.classList.add('done');
    check.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  }
  const dot = document.getElementById(`sm-pdot-${index}`);
  if (dot) dot.classList.add('active');
}

function completeMission(index) {
  if (smCompleted[index]) return;
  smCompleted[index] = true;
  localStorage.setItem('sm_completed', JSON.stringify(smCompleted));
  markMissionDone(index);
  updateSmProgress();
}

function updateSmProgress() {
  const count = smCompleted.filter(Boolean).length;
  const pct = (count / 5) * 100;
  const bar = document.getElementById('sm-progress-bar');
  const badge = document.getElementById('missions-status-badge');

  if (bar) bar.style.width = pct + '%';
  if (badge) {
    badge.textContent = `${count}/5`;
    if (count === 5) badge.classList.add('complete');
    else badge.classList.remove('complete');
  }

  // Sync dots
  smCompleted.forEach((done, i) => {
    const dot = document.getElementById(`sm-pdot-${i}`);
    if (dot) dot.classList.toggle('active', done);
  });

  if (count === 5) revealCityCard();
}

function revealCityCard() {
  const preview = document.getElementById('sm-city-reward-preview');
  if (!preview) return;
  preview.style.display = 'block';

  const city = smCityCards[smCardIndex % smCityCards.length];
  const nameEl = document.getElementById('sm-city-name');
  const factEl = document.getElementById('sm-city-fact');
  if (nameEl) nameEl.textContent = city.name;
  if (factEl) factEl.textContent = city.fact;
}

function shareCityCard() {
  const city = smCityCards[smCardIndex % smCityCards.length];
  const text = `🎴 I just unlocked the ${city.name} City Card on Kidzinos!\n\n"${city.fact}"\n\nJoin me → kidzinos.com #Kidzinos #CrazyXYZ`;
  if (navigator.share) {
    navigator.share({ title: 'Kidzinos City Card', text });
  } else {
    navigator.clipboard.writeText(text).then(() => alert('City card text copied! Share it anywhere!'));
  }
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => { initSecretMissions(); });

// ===== STORY VIEWER =====
function openStory(name, avatarSrc, text) {
  const modal = document.getElementById('view-story-modal');
  if (!modal) return;

  // Set avatar
  const avatarEl = document.getElementById('story-view-avatar');
  if (avatarEl) {
    if (avatarSrc) {
      avatarEl.innerHTML = `<img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.textContent='${name.charAt(0)}'" />`;
    } else {
      avatarEl.textContent = name.charAt(0);
    }
  }

  // Set name
  const nameEl = document.getElementById('story-view-name');
  if (nameEl) nameEl.textContent = name;

  // Set content
  const contentEl = document.getElementById('story-view-content');
  if (contentEl) contentEl.textContent = text || '';

  modal.classList.remove('hidden');

  // Inject circle button (circle.js)
  if (typeof injectCircleIntoStory === 'function') {
    injectCircleIntoStory(name, avatarSrc);
  }
}

function closeViewStoryModal() {
  const modal = document.getElementById('view-story-modal');
  if (modal) modal.classList.add('hidden');
}

function openAddStoryModal() {
  showToast('📸 Story creation coming soon! Stay tuned.');
}

