/* ============================================================
   ARCADE GAMES — Crazy XYZ Edition
   Games: Dino Rush | IPL Smash | Street Rush
============================================================ */

let arcadeState = null;

function launchArcade(type) {
  closeArcade();
  const overlay = document.createElement('div');
  overlay.className = 'arcade-overlay';
  overlay.id = 'arcade-overlay';
  document.body.appendChild(overlay);

  const configs = {
    dino:    { title: '🦕 Crazy Dino Rush', emoji: '🦕', sub: 'Tap / Space to jump!\nAvoid obstacles & survive!', btnColor: '#22c55e', reward: 12 },
    cricket: { title: '🏏 IPL Smash',       emoji: '🏏', sub: 'Tap to smash the ball!\nTime it right for sixes!', btnColor: '#f59e0b', reward: 15 },
    street:  { title: '🏃 Street Rush',      emoji: '🏃', sub: 'Swipe Left / Right\nto dodge obstacles!',       btnColor: '#06b6d4', reward: 15 },
    snake:   { title: '🐍 Neon Snake',      emoji: '🐍', sub: 'Swipe to turn!\nEat apples to grow!',           btnColor: '#c026d3', reward: 10 },
    pong:    { title: '🏓 Space Pong',       emoji: '🏓', sub: 'Drag to move paddle!\nFirst to 5 wins!',          btnColor: '#ea580c', reward: 20 },
    flappy:  { title: '🎈 Flappy Balloon',   emoji: '🎈', sub: 'Tap to fly!\nAvoid the pipes!',                 btnColor: '#9333ea', reward: 10 },
    shooter: { title: '🚀 Space Shooter',    emoji: '🚀', sub: 'Drag to move & shoot!\nDestroy enemies!',       btnColor: '#4f46e5', reward: 15 },
    whack:   { title: '👾 Whack-a-Monster',  emoji: '👾', sub: 'Tap the monsters!\nAvoid the bombs!',           btnColor: '#e11d48', reward: 10 },
    brick:   { title: '🧱 Brick Breaker',    emoji: '🧱', sub: 'Drag paddle to break\nall the bricks!',         btnColor: '#2563eb', reward: 15 },
    doodle:  { title: '🦘 Doodle Jumper',    emoji: '🦘', sub: 'Tilt or drag to move!\nJump as high as you can!',btnColor: '#059669', reward: 15 },
    car:     { title: '🏎️ Car Dodger',        emoji: '🏎️', sub: 'Swipe to change lanes!\nAvoid the traffic!',    btnColor: '#ca8a04', reward: 10 },
    mathslice:{ title: '🔪 Math Slicer',     emoji: '🔪', sub: 'Slice the correct answer!\nDon\'t slice wrong ones!',btnColor: '#475569', reward: 15 },
    catch:   { title: '🧺 Catch Em All',     emoji: '🧺', sub: 'Drag to catch falling items!\nAvoid the bombs!',btnColor: '#4338ca', reward: 10 },
    simon:   { title: '🧠 Simon Pattern',    emoji: '🧠', sub: 'Watch the sequence!\nRepeat it correctly!',     btnColor: '#be185d', reward: 20 },
    ttt:     { title: '❌ Tic Tac Toe',       emoji: '❌', sub: 'Play against the AI!\nGet 3 in a row!',         btnColor: '#059669', reward: 10 },
    word:    { title: '📝 Word Guess',       emoji: '📝', sub: 'Guess the hidden word!\nUse keyboard to type!', btnColor: '#7c3aed', reward: 15 },
    colormatch:{ title: '🎨 Color Match',    emoji: '🎨', sub: 'Tap the matching color!\nBe fast!',             btnColor: '#c026d3', reward: 10 },
    gravity: { title: '🔄 Gravity Flip',     emoji: '🔄', sub: 'Tap to flip gravity!\nAvoid the spikes!',       btnColor: '#57534e', reward: 15 }
  };
  const cfg = configs[type];

  overlay.innerHTML = `
    <div class="arcade-hud">
      <div>
        <div class="arcade-hud-title">${cfg.title}</div>
        <div class="arcade-hud-score" id="arc-score">0</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:0.85rem;font-weight:900;color:rgba(255,255,255,0.6);">Best: <span id="arc-best" style="color:var(--crazy-yellow)">0</span></div>
        <button class="arcade-hud-close" onclick="closeArcade()">✕</button>
      </div>
    </div>
    <canvas class="arcade-canvas" id="arc-canvas"></canvas>
    <div class="arcade-start-screen" id="arc-start">
      <div class="arcade-start-emoji">${cfg.emoji}</div>
      <div class="arcade-start-title">${cfg.title}</div>
      <div class="arcade-start-sub">${cfg.sub.replace('\n','<br>')}</div>
      <button class="arcade-start-btn" style="background:linear-gradient(135deg,${cfg.btnColor},#fff200);" onclick="startArcade()">Let's Go! 🔥</button>
    </div>
    <div class="arcade-gameover hidden" id="arc-gameover">
      <div class="arcade-gameover-emoji">💀</div>
      <div class="arcade-gameover-title">Game Over!</div>
      <div class="arcade-gameover-score">Score: <span id="arc-final">0</span></div>
      <div class="arcade-gameover-best">Best: <span id="arc-best2">0</span></div>
      <div class="arcade-gameover-reward">🪙 +<span id="arc-earned">${cfg.reward}</span> Zino Coins!</div>
      <div class="arcade-btn-row">
        <button class="arcade-replay-btn" onclick="startArcade()">▶ Replay</button>
        <button class="arcade-quit-btn" onclick="closeArcade()">✕ Quit</button>
      </div>
    </div>`;

  arcadeState = { type, reward: cfg.reward, score: 0, best: 0, running: false, raf: null };
  resizeArcadeCanvas();
  window.addEventListener('resize', resizeArcadeCanvas);
}

function resizeArcadeCanvas() {
  const c = document.getElementById('arc-canvas');
  if (!c) return;
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
}

function startArcade() {
  document.getElementById('arc-start').classList.add('hidden');
  document.getElementById('arc-gameover').classList.add('hidden');
  const c = document.getElementById('arc-canvas');
  if (!c) return;
  arcadeState.score = 0;
  arcadeState.running = true;
  updateArcScore(0);
  if (arcadeState.raf) cancelAnimationFrame(arcadeState.raf);
  if (arcadeState.type === 'dino')    initDino(c);
  else if (arcadeState.type === 'cricket') initCricket(c);
  else if (arcadeState.type === 'street')  initStreet(c);
  else if (arcadeState.type === 'snake')   initSnake(c);
  else if (arcadeState.type === 'pong')    initPong(c);
  else if (arcadeState.type === 'flappy')  initFlappy(c);
  else if (arcadeState.type === 'shooter') initShooter(c);
  else if (arcadeState.type === 'whack')   initWhack(c);
  else if (arcadeState.type === 'brick')   initBrick(c);
  else if (arcadeState.type === 'doodle')  initDoodle(c);
  else if (arcadeState.type === 'car')     initCar(c);
  else if (arcadeState.type === 'mathslice') initMathSlice(c);
  else if (arcadeState.type === 'catch')   initCatch(c);
  else if (arcadeState.type === 'simon')   initSimon(c);
  else if (arcadeState.type === 'ttt')     initTTT(c);
  else if (arcadeState.type === 'word')    initWord(c);
  else if (arcadeState.type === 'colormatch') initColorMatch(c);
  else if (arcadeState.type === 'gravity') initGravity(c);
}

function arcadeGameOver() {
  if (!arcadeState) return;
  arcadeState.running = false;
  if (arcadeState.raf) cancelAnimationFrame(arcadeState.raf);
  if (arcadeState.score > arcadeState.best) arcadeState.best = arcadeState.score;
  document.getElementById('arc-final').textContent = arcadeState.score;
  document.getElementById('arc-best').textContent = arcadeState.best;
  document.getElementById('arc-best2').textContent = arcadeState.best;
  document.getElementById('arc-gameover').classList.remove('hidden');
  state.user.zinoCoins += arcadeState.reward;
  updateAllZinos();
  completeMission(2);
  showToast(`🎮 +${arcadeState.reward} Zino Coins!`);
}

function updateArcScore(n) {
  arcadeState.score = n;
  const el = document.getElementById('arc-score');
  if (el) el.textContent = n;
}

function closeArcade() {
  if (arcadeState && arcadeState.raf) cancelAnimationFrame(arcadeState.raf);
  arcadeState = null;
  window.removeEventListener('resize', resizeArcadeCanvas);
  const el = document.getElementById('arcade-overlay');
  if (el) el.remove();
  ['touchstart','keydown'].forEach(ev => {
    document.removeEventListener(ev, arcadeInput);
  });
}

// Generic input handler (replaced per game)
let arcadeInput = () => {};

// ═══════════════════════════════════════════
// GAME 1: CRAZY DINO RUSH
// ═══════════════════════════════════════════
function initDino(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.75;
  const GRAVITY = 0.6, JUMP = -14;

  const dino = { x: W * 0.12, y: groundY, w: 44, h: 52, vy: 0, onGround: true, frame: 0 };
  let obstacles = [], clouds = [], score = 0, speed = 5, frame = 0, spawnTimer = 60;
  let cloudTimer = 80;
  const DINO_CHAR = '🦕', OBS_CHARS = ['🌵','🪨','🌊','💣'];
  const CLOUD_CHAR = '☁️';

  function jump() {
    if (!arcadeState || !arcadeState.running) return;
    if (dino.onGround) { dino.vy = JUMP; dino.onGround = false; }
  }
  arcadeInput = jump;
  document.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') jump(); });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });
  canvas.addEventListener('click', jump);

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.clearRect(0, 0, W, H);

    // BG gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a1a2e'); bg.addColorStop(1, '#1a3a1a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = '#22c55e'; ctx.fillRect(0, groundY + dino.h, W, 4);
    ctx.fillStyle = 'rgba(34,197,94,0.15)'; ctx.fillRect(0, groundY + dino.h + 4, W, H);

    // Clouds
    cloudTimer--;
    if (cloudTimer <= 0) { clouds.push({ x: W + 30, y: H * 0.2 + Math.random() * H * 0.2, s: 0.8 + Math.random() * 0.6 }); cloudTimer = 100 + Math.random() * 80; }
    clouds.forEach(c => { ctx.font = `${32 * c.s}px serif`; ctx.globalAlpha = 0.35; ctx.fillText(CLOUD_CHAR, c.x, c.y); c.x -= speed * 0.3; });
    ctx.globalAlpha = 1;
    clouds = clouds.filter(c => c.x > -60);

    // Dino physics
    dino.vy += GRAVITY; dino.y += dino.vy;
    if (dino.y >= groundY) { dino.y = groundY; dino.vy = 0; dino.onGround = true; }

    // Draw dino
    frame++;
    dino.frame = Math.floor(frame / 8) % 2;
    ctx.font = '44px serif';
    ctx.save();
    if (dino.onGround && dino.frame === 1) ctx.translate(dino.x + dino.w / 2, dino.y + dino.h / 2);
    else ctx.translate(dino.x + dino.w / 2, dino.y + dino.h / 2);
    ctx.fillText(DINO_CHAR, -22, 10);
    ctx.restore();

    // Crazy XYZ tag
    ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = 'rgba(255,184,0,0.7)';
    ctx.fillText('CRAZY XYZ', dino.x - 4, dino.y - 6);

    // Obstacles
    spawnTimer--;
    if (spawnTimer <= 0) {
      const h = 28 + Math.random() * 24;
      obstacles.push({ x: W + 20, y: groundY + dino.h - h, w: 32, h, char: OBS_CHARS[Math.floor(Math.random() * OBS_CHARS.length)] });
      spawnTimer = Math.max(40, 90 - score * 0.3);
    }
    obstacles.forEach(o => {
      ctx.font = '32px serif'; ctx.fillText(o.char, o.x, o.y + o.h);
      o.x -= speed;
    });
    obstacles = obstacles.filter(o => o.x > -40);

    // Collision
    for (const o of obstacles) {
      if (dino.x + 8 < o.x + o.w - 8 && dino.x + dino.w - 8 > o.x + 8 && dino.y + 10 < o.y + o.h && dino.y + dino.h - 4 > o.y) {
        arcadeGameOver(); return;
      }
    }

    // Score + speed
    score = Math.floor(frame / 6);
    speed = 5 + score * 0.01;
    updateArcScore(score);

    // Score HUD
    ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('TAP / SPACE to jump', W / 2 - 64, groundY + dino.h + 26);

    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 2: IPL SMASH — Cricket
// ═══════════════════════════════════════════
function initCricket(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let ball = null, score = 0, wickets = 3, ballsLeft = 10, state2 = 'bowling';
  let resultAnim = null, pitchLine = H * 0.62;
  const BAT_X = W / 2, BAT_Y = H * 0.78;
  const ZONES = [
    { label: '6️⃣ SIX!',   runs: 6, color: '#ffd700', yRange: [0, 0.3] },
    { label: '4️⃣ FOUR!',  runs: 4, color: '#22c55e', yRange: [0.3, 0.55] },
    { label: '2️⃣ TWO',    runs: 2, color: '#60c8ff', yRange: [0.55, 0.72] },
    { label: '1️⃣ ONE',    runs: 1, color: '#a855f7', yRange: [0.72, 0.82] },
    { label: '💀 OUT!',   runs: -1, color: '#ef4444', yRange: [0.82, 1.0] },
  ];

  function bowlBall() {
    if (ballsLeft <= 0) return;
    ballsLeft--;
    const targetX = W * (0.3 + Math.random() * 0.4);
    ball = { x: W * 0.7, y: H * 0.15, tx: targetX, ty: BAT_Y, t: 0, hit: false, hitText: '', hitColor: '#fff', hitScale: 1 };
    state2 = 'bowling';
  }

  arcadeInput = () => hitBall();
  canvas.addEventListener('touchstart', e => { e.preventDefault(); hitBall(); }, { passive: false });
  canvas.addEventListener('click', hitBall);

  function hitBall() {
    if (!arcadeState || !arcadeState.running) return;
    if (state2 !== 'bowling' || !ball) return;
    const ballY_norm = ball.y / H;
    let zone = ZONES[ZONES.length - 1];
    for (const z of ZONES) {
      if (ballY_norm >= z.yRange[0] && ballY_norm < z.yRange[1]) { zone = z; break; }
    }
    if (zone.runs === -1) {
      wickets--;
      ball.hitText = '💀 OUT!'; ball.hitColor = '#ef4444';
      if (wickets <= 0) { ball.hit = true; setTimeout(() => arcadeGameOver(), 1200); }
    } else {
      score += zone.runs;
      updateArcScore(score);
      ball.hitText = zone.label; ball.hitColor = zone.color;
    }
    ball.hit = true;
    ball.hitScale = 1.8;
    state2 = 'hit';
    setTimeout(() => {
      if (!arcadeState || !arcadeState.running) return;
      if (ballsLeft > 0) setTimeout(bowlBall, 400);
      else arcadeGameOver();
    }, 1000);
  }

  setTimeout(bowlBall, 600);

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.clearRect(0, 0, W, H);

    // Stadium BG
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#001a3a'); bg.addColorStop(0.6, '#003d1a'); bg.addColorStop(1, '#8B4513');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Pitch
    ctx.fillStyle = 'rgba(139,90,43,0.6)';
    ctx.beginPath(); ctx.ellipse(W/2, H*0.7, W*0.18, H*0.22, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([8,6]);
    ctx.beginPath(); ctx.moveTo(W*0.32, pitchLine); ctx.lineTo(W*0.68, pitchLine); ctx.stroke();
    ctx.setLineDash([]);

    // Wickets
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = wickets > 0 ? '#F5DEB3' : '#555';
      ctx.fillRect(W/2 + i*14 - 3, BAT_Y - 40, 5, 40);
      ctx.fillStyle = '#A0522D'; ctx.fillRect(W/2 + i*14 - 5, BAT_Y - 43, 9, 5);
    }

    // Batsman (Crazy XYZ char)
    ctx.font = '40px serif'; ctx.fillText('🧑', BAT_X - 20, BAT_Y - 2);
    ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = '#FFB800';
    ctx.fillText('AMIT', BAT_X - 14, BAT_Y - 44);

    // Bowler
    ctx.font = '30px serif'; ctx.fillText('🧑', W*0.68, H*0.2);
    ctx.font = 'bold 9px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('CRAZY XYZ', W*0.58, H*0.15);

    // Ball
    if (ball && !ball.hit) {
      ball.t += 0.028;
      const ease = ball.t < 1 ? ball.t : 1;
      ball.x = W*0.7 + (ball.tx - W*0.7) * ease;
      ball.y = H*0.15 + (ball.ty - H*0.15) * ease;
      // Arc
      ball.y -= Math.sin(ball.t * Math.PI) * H * 0.08;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 14, 0, Math.PI*2);
      const bgrad = ctx.createRadialGradient(ball.x-3, ball.y-3, 2, ball.x, ball.y, 14);
      bgrad.addColorStop(0, '#ff4444'); bgrad.addColorStop(1, '#990000');
      ctx.fillStyle = bgrad; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      // Seam
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 14, -0.5, 0.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.stroke();
    }

    // Hit text
    if (ball && ball.hit && ball.hitText) {
      ball.hitScale = Math.max(1, ball.hitScale * 0.92);
      ctx.save();
      ctx.translate(W/2, H*0.4);
      ctx.scale(ball.hitScale, ball.hitScale);
      ctx.font = `bold ${Math.round(36/ball.hitScale)}px var(--font-display, sans-serif)`;
      ctx.fillStyle = ball.hitColor;
      ctx.textAlign = 'center';
      ctx.shadowColor = ball.hitColor; ctx.shadowBlur = 20;
      ctx.fillText(ball.hitText, 0, 0);
      ctx.shadowBlur = 0; ctx.restore();
    }

    // Tap hint
    if (state2 === 'bowling' && ball && !ball.hit) {
      const alpha = 0.4 + 0.4 * Math.sin(Date.now() / 300);
      ctx.font = 'bold 15px sans-serif'; ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.textAlign = 'center'; ctx.fillText('TAP TO SMASH! 🏏', W/2, H*0.91);
    }

    // HUD — balls & wickets
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`Balls: ${ballsLeft}`, 16, H - 16);
    ctx.fillText(`Wickets: ${'❤️'.repeat(Math.max(0,wickets))}`, W/2 - 40, H - 16);

    // Zone guide on left
    const zH = H * 0.5 / ZONES.length;
    ZONES.forEach((z, i) => {
      ctx.fillStyle = `${z.color}22`;
      ctx.fillRect(0, H * z.yRange[0], 6, H * (z.yRange[1] - z.yRange[0]));
    });

    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 3: STREET RUSH — Lane Runner
// ═══════════════════════════════════════════
function initStreet(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const LANES = [W*0.22, W*0.5, W*0.78];
  const LANE_W = W * 0.22;
  let lane = 1, targetX = LANES[1], charX = LANES[1];
  let obstacles = [], coins = [], speed = 4, score = 0, frame = 0;
  let spawnT = 50, coinT = 30, alive = true;
  let touchStartX = null, shifting = false;

  const OBS = ['🚌','🚗','🛢️','⚡','🪨','🚧'];
  const COIN_CHAR = '🪙';
  const CHAR = '🏃';

  function shiftLane(dir) {
    if (!arcadeState || !arcadeState.running) return;
    lane = Math.max(0, Math.min(2, lane + dir));
    targetX = LANES[lane];
  }

  arcadeInput = () => {};
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') shiftLane(-1);
    if (e.key === 'ArrowRight') shiftLane(1);
  });
  canvas.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 30) shiftLane(dx < 0 ? -1 : 1);
    touchStartX = null;
  });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.clearRect(0, 0, W, H);
    frame++;

    // Road BG
    const roadW = W * 0.7, roadX = W * 0.15;
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(roadX, 0, roadW, H);

    // Lane dividers (dashed, moving)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.setLineDash([30, 20]);
    ctx.lineDashOffset = -(frame * speed * 0.5) % 50;
    [W*0.36, W*0.64].forEach(lx => {
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Sidewalks
    ctx.fillStyle = '#2a2a3a'; ctx.fillRect(0, 0, roadX, H);
    ctx.fillRect(roadX + roadW, 0, W - roadX - roadW, H);

    // Speed lines on sides
    for (let i = 0; i < 5; i++) {
      const fy = ((frame * speed * 2 + i * (H/5)) % H);
      ctx.fillStyle = 'rgba(96,200,255,0.12)';
      ctx.fillRect(2, fy, 10, 40); ctx.fillRect(W - 14, fy, 10, 40);
    }

    // Character smooth move
    charX += (targetX - charX) * 0.18;
    ctx.font = '38px serif';
    ctx.fillText(CHAR, charX - 19, H * 0.78);
    ctx.font = 'bold 9px sans-serif'; ctx.fillStyle = '#FFB800'; ctx.textAlign = 'center';
    ctx.fillText('CRAZY XYZ', charX, H * 0.78 - 40);
    ctx.textAlign = 'left';

    // Obstacles
    spawnT--;
    if (spawnT <= 0) {
      const ol = Math.floor(Math.random() * 3);
      obstacles.push({ lane: ol, x: LANES[ol], y: -40, char: OBS[Math.floor(Math.random() * OBS.length)] });
      spawnT = Math.max(25, 55 - score * 0.08);
    }
    obstacles.forEach(o => {
      ctx.font = '36px serif'; ctx.fillText(o.char, o.x - 18, o.y);
      o.y += speed;
    });
    obstacles = obstacles.filter(o => o.y < H + 50);

    // Coins
    coinT--;
    if (coinT <= 0) {
      const cl = Math.floor(Math.random() * 3);
      coins.push({ lane: cl, x: LANES[cl], y: -30 });
      coinT = 35 + Math.floor(Math.random() * 20);
    }
    coins.forEach(c => {
      ctx.font = '26px serif'; ctx.fillText(COIN_CHAR, c.x - 13, c.y);
      c.y += speed;
    });
    coins = coins.filter(c => c.y < H + 40);

    // Coin collect
    coins = coins.filter(c => {
      if (Math.abs(c.x - charX) < 28 && Math.abs(c.y - H*0.78) < 36) {
        score++; updateArcScore(score); return false;
      }
      return true;
    });

    // Collision with obstacles
    for (const o of obstacles) {
      if (Math.abs(o.x - charX) < 24 && Math.abs(o.y - H*0.72) < 38) {
        arcadeGameOver(); return;
      }
    }

    speed = 4 + score * 0.05;

    // Arrow hint buttons
    const btnY = H * 0.88, btnR = 28;
    [[W*0.25,'◀'],[W*0.75,'▶']].forEach(([bx, label], i) => {
      ctx.beginPath(); ctx.arc(bx, btnY, btnR, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
      ctx.font = 'bold 18px sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.fillText(label, bx, btnY + 6);
    });
    ctx.textAlign = 'left';

    // Tap buttons for mobile
    if (!canvas._btnsBound) {
      canvas._btnsBound = true;
      canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const btnY2 = H * 0.88;
        if (Math.abs(cy - btnY2) < 40) {
          if (cx < W/2) shiftLane(-1);
          else shiftLane(1);
        }
      });
    }

    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ─── Hook launchGame to support new arcade types ───
const _prevLaunchGame = launchGame;
function launchGame(type) {
  const arcadeGames = ['dino','cricket','street','snake','pong','flappy','shooter','whack','brick','doodle','car','mathslice','catch','simon','ttt','word','colormatch','gravity'];
  if (arcadeGames.includes(type)) {
    launchArcade(type);
  } else {
    _prevLaunchGame(type);
  }
}

// ═══════════════════════════════════════════
// GAME 4: NEON SNAKE
// ═══════════════════════════════════════════
function initSnake(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const gridSize = 20;
  
  let snake = [{x: Math.floor(W/2/gridSize)*gridSize, y: Math.floor(H/2/gridSize)*gridSize}];
  let dx = gridSize, dy = 0;
  let food = {x: 0, y: 0};
  let score = 0;
  let frameCount = 0;
  let touchStartX = null, touchStartY = null;
  
  function placeFood() {
    food.x = Math.floor(Math.random() * ((W - gridSize) / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * ((H - gridSize) / gridSize)) * gridSize;
  }
  placeFood();
  
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -gridSize; }
    else if (e.key === 'ArrowRight' && dx === 0) { dx = gridSize; dy = 0; }
    else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = gridSize; }
  });
  
  canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  canvas.addEventListener('touchmove', e => {
    if (!touchStartX || !touchStartY) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const xDiff = touchStartX - x;
    const yDiff = touchStartY - y;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0 && dx === 0) { dx = -gridSize; dy = 0; } // left
      else if (xDiff < 0 && dx === 0) { dx = gridSize; dy = 0; } // right
    } else {
      if (yDiff > 0 && dy === 0) { dx = 0; dy = -gridSize; } // up
      else if (yDiff < 0 && dy === 0) { dx = 0; dy = gridSize; } // down
    }
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    
    // Control speed
    frameCount++;
    if (frameCount < 5) {
      arcadeState.raf = requestAnimationFrame(loop);
      return;
    }
    frameCount = 0;

    // Move
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    // Eat
    if (Math.abs(head.x - food.x) < gridSize && Math.abs(head.y - food.y) < gridSize) {
      score += 1;
      updateArcScore(score);
      placeFood();
    } else {
      snake.pop();
    }
    
    // Collision
    if (head.x < 0 || head.x >= W || head.y < 0 || head.y >= H) {
      arcadeGameOver(); return;
    }
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        arcadeGameOver(); return;
      }
    }

    // Draw
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
    
    // Grid
    ctx.strokeStyle = '#222'; ctx.lineWidth = 1;
    for (let x=0; x<W; x+=gridSize) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y=0; y<H; y+=gridSize) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    
    // Food
    ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(food.x + gridSize/2, food.y + gridSize/2, gridSize/2 - 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    
    // Snake
    snake.forEach((part, i) => {
      ctx.fillStyle = i === 0 ? '#c026d3' : '#d946ef';
      ctx.fillRect(part.x, part.y, gridSize-1, gridSize-1);
    });

    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 5: SPACE PONG
// ═══════════════════════════════════════════
function initPong(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  
  let p1 = {x: W/2 - 40, y: H - 40, w: 80, h: 10, score: 0};
  let p2 = {x: W/2 - 40, y: 30, w: 80, h: 10, score: 0};
  let ball = {x: W/2, y: H/2, r: 8, dx: 4, dy: 4};
  let touchX = null;
  
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    touchX = e.touches[0].clientX;
  }, { passive: false });
  canvas.addEventListener('mousemove', e => {
    touchX = e.clientX;
  });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    
    // Player 1 Move
    if (touchX !== null) {
      p1.x = touchX - p1.w / 2;
    }
    p1.x = Math.max(0, Math.min(W - p1.w, p1.x));
    
    // Player 2 Move (AI)
    p2.x += (ball.x - (p2.x + p2.w/2)) * 0.1;
    p2.x = Math.max(0, Math.min(W - p2.w, p2.x));
    
    // Ball Move
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall bounce
    if (ball.x < ball.r || ball.x > W - ball.r) ball.dx *= -1;
    
    // Paddle bounce
    if (ball.dy > 0 && ball.y + ball.r > p1.y && ball.x > p1.x && ball.x < p1.x + p1.w) {
      ball.dy *= -1.05;
      ball.dx = (ball.x - (p1.x + p1.w/2)) * 0.2;
    }
    if (ball.dy < 0 && ball.y - ball.r < p2.y + p2.h && ball.x > p2.x && ball.x < p2.x + p2.w) {
      ball.dy *= -1.05;
      ball.dx = (ball.x - (p2.x + p2.w/2)) * 0.2;
    }
    
    // Score
    if (ball.y > H) {
      p2.score++; ball.x = W/2; ball.y = H/2; ball.dy = 4; ball.dx = (Math.random()>0.5?4:-4);
    } else if (ball.y < 0) {
      p1.score++; ball.x = W/2; ball.y = H/2; ball.dy = -4; ball.dx = (Math.random()>0.5?4:-4);
      updateArcScore(p1.score);
    }
    
    if (p1.score >= 5 || p2.score >= 5) {
      arcadeGameOver();
      return;
    }

    // Draw
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1e1b4b'); bg.addColorStop(1, '#312e81');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    
    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    ctx.setLineDash([]);
    
    // Scores
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p2.score, W/2, H/4);
    ctx.fillText(p1.score, W/2, H*0.75);
    ctx.textAlign = 'left';
    
    // Paddles
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(p1.x, p1.y, p1.w, p1.h);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(p2.x, p2.y, p2.w, p2.h);
    
    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();

    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 6: FLAPPY BALLOON
// ═══════════════════════════════════════════
function initFlappy(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let balloon = { y: H/2, vy: 0 };
  let pipes = [], score = 0, frame = 0;
  
  function jump() { if(arcadeState && arcadeState.running) balloon.vy = -8; }
  arcadeInput = jump;
  document.addEventListener('keydown', e => { if(e.code==='Space') jump(); });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, {passive:false});
  canvas.addEventListener('click', jump);

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,W,H);
    balloon.vy += 0.4; balloon.y += balloon.vy;
    
    if(frame%90===0) {
      let gap = 160, py = Math.random()*(H-gap-100)+50;
      pipes.push({x: W, y: py, gap: gap, passed: false});
    }
    
    ctx.fillStyle = '#22c55e';
    pipes.forEach(p => {
      p.x -= 3;
      ctx.fillRect(p.x, 0, 60, p.y);
      ctx.fillRect(p.x, p.y+p.gap, 60, H-(p.y+p.gap));
      if(!p.passed && p.x < W/2-40) { p.passed = true; score++; updateArcScore(score); }
    });
    pipes = pipes.filter(p => p.x > -60);
    
    ctx.font = '40px serif'; ctx.fillText('🎈', W/2-20, balloon.y+10);
    
    if(balloon.y > H || balloon.y < 0) return arcadeGameOver();
    for(let p of pipes) {
      if(W/2 > p.x && W/2-40 < p.x+60) {
        if(balloon.y < p.y || balloon.y > p.y+p.gap) return arcadeGameOver();
      }
    }
    
    frame++;
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 7: SPACE SHOOTER
// ═══════════════════════════════════════════
function initShooter(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let ship = {x: W/2, y: H-60};
  let bullets = [], enemies = [], score = 0, frame = 0;
  
  canvas.addEventListener('touchmove', e=>{ e.preventDefault(); ship.x = e.touches[0].clientX; }, {passive:false});
  canvas.addEventListener('mousemove', e=>{ ship.x = e.clientX; });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,W,H);
    
    if(frame%10===0) bullets.push({x: ship.x, y: ship.y-20});
    if(frame%(Math.max(20, 60-score))===0) enemies.push({x: Math.random()*(W-40)+20, y: -20});
    
    ctx.fillStyle = '#eab308';
    bullets.forEach(b => { b.y-=10; ctx.fillRect(b.x-2, b.y, 4, 15); });
    
    ctx.font = '30px serif';
    enemies.forEach(e => { e.y+=3 + score*0.05; ctx.fillText('👾', e.x-15, e.y+10); });
    
    bullets = bullets.filter(b => b.y>0);
    enemies = enemies.filter(e => {
      let hit = false;
      bullets.forEach(b => {
        if(Math.abs(b.x - e.x)<20 && Math.abs(b.y - e.y)<20) { hit=true; b.y=-100; score++; updateArcScore(score); }
      });
      if(e.y > H) arcadeGameOver();
      return !hit && e.y<=H;
    });
    
    ctx.font = '40px serif'; ctx.fillText('🚀', ship.x-20, ship.y+15);
    frame++;
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 8: WHACK-A-MONSTER
// ═══════════════════════════════════════════
function initWhack(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let holes = [], score = 0, frame = 0;
  for(let i=0; i<9; i++) holes.push({x: W*0.2 + (i%3)*W*0.3, y: H*0.3 + Math.floor(i/3)*H*0.2, type: 0, timer: 0});
  
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    let tx = e.touches[0].clientX, ty = e.touches[0].clientY;
    holes.forEach(h => {
      if(h.timer>0 && Math.abs(h.x-tx)<40 && Math.abs(h.y-ty)<40) {
        if(h.type===1) { score++; updateArcScore(score); h.timer=0; }
        else if(h.type===2) arcadeGameOver();
      }
    });
  }, {passive:false});
  
  canvas.addEventListener('mousedown', e => {
    let tx = e.clientX, ty = e.clientY;
    holes.forEach(h => {
      if(h.timer>0 && Math.abs(h.x-tx)<40 && Math.abs(h.y-ty)<40) {
        if(h.type===1) { score++; updateArcScore(score); h.timer=0; }
        else if(h.type===2) arcadeGameOver();
      }
    });
  });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#166534'; ctx.fillRect(0,0,W,H);
    
    if(frame%30===0) {
      let h = holes[Math.floor(Math.random()*9)];
      if(h.timer<=0) { h.type = Math.random()>0.2 ? 1 : 2; h.timer = 60 - Math.min(40, score); }
    }
    
    holes.forEach(h => {
      ctx.fillStyle = '#064e3b'; ctx.beginPath(); ctx.ellipse(h.x, h.y+10, 30, 15, 0, 0, Math.PI*2); ctx.fill();
      if(h.timer>0) {
        ctx.font = '40px serif'; ctx.fillText(h.type===1 ? '👾' : '💣', h.x-20, h.y+10);
        h.timer--;
      }
    });
    
    frame++;
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 9: BRICK BREAKER
// ═══════════════════════════════════════════
function initBrick(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let pad = {x: W/2-40, y: H-40, w: 80, h: 10};
  let ball = {x: W/2, y: H/2, dx: 4, dy: -4, r: 6};
  let bricks = [], score = 0;
  for(let i=0; i<5; i++) for(let j=0; j<6; j++) bricks.push({x: 10+j*(W/6), y: 50+i*25, w: (W/6)-10, h: 15, alive: true});
  
  canvas.addEventListener('touchmove', e=>{ e.preventDefault(); pad.x = e.touches[0].clientX - pad.w/2; }, {passive:false});
  canvas.addEventListener('mousemove', e=>{ pad.x = e.clientX - pad.w/2; });
  
  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,W,H);
    
    ball.x += ball.dx; ball.y += ball.dy;
    if(ball.x<0 || ball.x>W) ball.dx*=-1;
    if(ball.y<0) ball.dy*=-1;
    if(ball.y>H) return arcadeGameOver();
    
    if(ball.y+ball.r>pad.y && ball.x>pad.x && ball.x<pad.x+pad.w && ball.dy>0) {
      ball.dy*=-1; ball.dx = (ball.x - (pad.x+pad.w/2))*0.2;
    }
    
    ctx.fillStyle = '#3b82f6';
    bricks.forEach(b => {
      if(b.alive) {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        if(ball.x>b.x && ball.x<b.x+b.w && ball.y>b.y && ball.y<b.y+b.h) {
          b.alive = false; ball.dy*=-1; score++; updateArcScore(score);
          if(score >= 30) arcadeGameOver(); // win condition
        }
      }
    });
    
    ctx.fillStyle = '#f87171'; ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
    
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 10: DOODLE JUMPER
// ═══════════════════════════════════════════
function initDoodle(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let player = {x: W/2, y: H/2, vy: 0};
  let plats = [], score = 0, maxScore = 0;
  for(let i=0; i<7; i++) plats.push({x: Math.random()*(W-60), y: H - i*100});
  
  canvas.addEventListener('touchmove', e=>{ e.preventDefault(); player.x = e.touches[0].clientX; }, {passive:false});
  canvas.addEventListener('mousemove', e=>{ player.x = e.clientX; });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#e0f2fe'; ctx.fillRect(0,0,W,H);
    
    player.vy += 0.4; player.y += player.vy;
    if(player.y > H) return arcadeGameOver();
    
    if(player.y < H/2) {
      let dy = H/2 - player.y;
      player.y = H/2;
      score += Math.floor(dy); updateArcScore(score);
      plats.forEach(p => p.y += dy);
    }
    
    ctx.fillStyle = '#16a34a';
    plats.forEach(p => {
      ctx.fillRect(p.x, p.y, 60, 10);
      if(player.vy > 0 && player.x > p.x-20 && player.x < p.x+80 && player.y > p.y-20 && player.y < p.y+10) {
        player.vy = -10;
      }
      if(p.y > H) { p.y = 0; p.x = Math.random()*(W-60); }
    });
    
    ctx.font = '30px serif'; ctx.fillText('🦘', player.x-15, player.y+10);
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 11: CAR DODGER
// ═══════════════════════════════════════════
function initCar(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let lanes = [W*0.25, W*0.5, W*0.75];
  let pLane = 1, enemies = [], score = 0, frame = 0;
  
  canvas.addEventListener('touchstart', e=>{
    let x = e.touches[0].clientX;
    if(x < W/3) pLane = 0; else if(x > W*0.66) pLane = 2; else pLane = 1;
  });
  canvas.addEventListener('mousedown', e=>{
    let x = e.clientX;
    if(x < W/3) pLane = 0; else if(x > W*0.66) pLane = 2; else pLane = 1;
  });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#333'; ctx.fillRect(0,0,W,H);
    
    if(frame%40===0) enemies.push({lane: Math.floor(Math.random()*3), y: -50});
    
    ctx.font = '40px serif';
    enemies.forEach(e => {
      e.y += 5 + score*0.1;
      ctx.fillText('🛻', lanes[e.lane]-20, e.y);
      if(e.y > H) { score++; updateArcScore(score); e.y = H+100; }
      if(e.lane === pLane && Math.abs(e.y - (H-80)) < 40) arcadeGameOver();
    });
    enemies = enemies.filter(e => e.y < H+50);
    
    ctx.fillText('🏎️', lanes[pLane]-20, H-80);
    frame++;
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 12: MATH SLICER
// ═══════════════════════════════════════════
function initMathSlice(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let targetNum = 0, targets = [], score = 0, frame = 0;
  
  function genMath() {
    let a = Math.floor(Math.random()*10)+1, b = Math.floor(Math.random()*10)+1;
    targetNum = a + b;
    return `${a} + ${b} = ?`;
  }
  let problem = genMath();
  
  canvas.addEventListener('touchmove', e=>{
    let x = e.touches[0].clientX, y = e.touches[0].clientY;
    checkSlice(x, y);
  }, {passive:true});
  canvas.addEventListener('mousemove', e=>{ checkSlice(e.clientX, e.clientY); });
  
  function checkSlice(x, y) {
    targets.forEach(t => {
      if(Math.abs(t.x-x)<30 && Math.abs(t.y-y)<30) {
        if(t.val === targetNum) { score++; updateArcScore(score); problem = genMath(); }
        else arcadeGameOver();
        t.y = H+100;
      }
    });
  }

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,W,H);
    
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(problem, W/2, 80);
    
    if(frame%50===0) {
      let isCorrect = Math.random()>0.5;
      targets.push({x: Math.random()*(W-40)+20, y: -20, val: isCorrect ? targetNum : targetNum + Math.floor(Math.random()*5)-2 });
    }
    
    ctx.fillStyle = '#f59e0b';
    targets.forEach(t => {
      t.y += 3 + score*0.1;
      ctx.beginPath(); ctx.arc(t.x, t.y, 25, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.fillText(t.val, t.x, t.y+7); ctx.fillStyle = '#f59e0b';
      if(t.y > H && t.val === targetNum) arcadeGameOver();
    });
    targets = targets.filter(t => t.y < H+50);
    
    ctx.textAlign = 'left';
    frame++;
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 13: CATCH EM ALL
// ═══════════════════════════════════════════
function initCatch(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let basket = {x: W/2, w: 60};
  let items = [], score = 0, frame = 0;
  
  canvas.addEventListener('touchmove', e=>{ e.preventDefault(); basket.x = e.touches[0].clientX; }, {passive:false});
  canvas.addEventListener('mousemove', e=>{ basket.x = e.clientX; });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0,0,W,H);
    
    if(frame%40===0) items.push({x: Math.random()*(W-40)+20, y: -20, type: Math.random()>0.2 ? 1 : 2});
    
    ctx.font = '30px serif';
    items.forEach(i => {
      i.y += 4 + score*0.05;
      ctx.fillText(i.type===1 ? '🎈' : '💣', i.x-15, i.y);
      if(i.y > H-60 && i.x > basket.x-basket.w/2 && i.x < basket.x+basket.w/2) {
        if(i.type===1) { score++; updateArcScore(score); }
        else arcadeGameOver();
        i.y = H+100;
      }
    });
    items = items.filter(i => i.y < H+50);
    
    ctx.fillStyle = '#fb923c'; ctx.fillRect(basket.x-basket.w/2, H-60, basket.w, 40);
    ctx.font = '30px serif'; ctx.fillText('🧺', basket.x-15, H-35);
    
    frame++;
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 14: SIMON PATTERN
// ═══════════════════════════════════════════
function initSimon(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
  const bright = ['#fca5a5', '#93c5fd', '#86efac', '#fde047'];
  let seq = [], userSeq = [], state = 'show', timer = 0, step = 0, lit = -1, score = 0;
  
  function addStep() { seq.push(Math.floor(Math.random()*4)); userSeq = []; state = 'show'; step = 0; timer = 60; lit = -1; }
  addStep();
  
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if(state !== 'play') return;
    let x = e.touches[0].clientX, y = e.touches[0].clientY;
    let pad = -1;
    if(x<W/2 && y<H/2) pad = 0; else if(x>W/2 && y<H/2) pad = 1; else if(x<W/2 && y>H/2) pad = 2; else pad = 3;
    
    lit = pad; setTimeout(()=>lit=-1, 200);
    userSeq.push(pad);
    if(userSeq[userSeq.length-1] !== seq[userSeq.length-1]) return arcadeGameOver();
    if(userSeq.length === seq.length) { score++; updateArcScore(score); setTimeout(addStep, 500); state = 'wait'; }
  }, {passive:false});
  canvas.addEventListener('mousedown', e => {
    if(state !== 'play') return;
    let x = e.clientX, y = e.clientY;
    let pad = -1;
    if(x<W/2 && y<H/2) pad = 0; else if(x>W/2 && y<H/2) pad = 1; else if(x<W/2 && y>H/2) pad = 2; else pad = 3;
    
    lit = pad; setTimeout(()=>lit=-1, 200);
    userSeq.push(pad);
    if(userSeq[userSeq.length-1] !== seq[userSeq.length-1]) return arcadeGameOver();
    if(userSeq.length === seq.length) { score++; updateArcScore(score); setTimeout(addStep, 500); state = 'wait'; }
  });

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    
    if(state === 'show') {
      timer--;
      if(timer<=0) {
        lit = seq[step]; timer = 40; step++;
        if(step > seq.length) { state = 'play'; lit = -1; }
      } else if (timer < 10) lit = -1;
    }
    
    ctx.fillStyle = lit===0 ? bright[0] : colors[0]; ctx.fillRect(0,0,W/2,H/2);
    ctx.fillStyle = lit===1 ? bright[1] : colors[1]; ctx.fillRect(W/2,0,W/2,H/2);
    ctx.fillStyle = lit===2 ? bright[2] : colors[2]; ctx.fillRect(0,H/2,W/2,H/2);
    ctx.fillStyle = lit===3 ? bright[3] : colors[3]; ctx.fillRect(W/2,H/2,W/2,H/2);
    
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(state==='play'?'YOUR TURN':'WATCH', W/2, H/2); ctx.textAlign='left';
    
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 15: TIC TAC TOE
// ═══════════════════════════════════════════
function initTTT(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let board = [0,0,0,0,0,0,0,0,0], turn = 1, score = 0;
  
  function checkWin(b) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(let w of wins) if(b[w[0]] && b[w[0]]===b[w[1]] && b[w[1]]===b[w[2]]) return b[w[0]];
    if(!b.includes(0)) return -1;
    return 0;
  }
  
  canvas.addEventListener('mousedown', e => handleClick(e.clientX, e.clientY));
  canvas.addEventListener('touchstart', e => { e.preventDefault(); handleClick(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
  
  function handleClick(x, y) {
    if(turn!==1) return;
    let s = Math.min(W,H)*0.8, offX = (W-s)/2, offY = (H-s)/2, cs = s/3;
    let c = Math.floor((x-offX)/cs), r = Math.floor((y-offY)/cs);
    if(c>=0 && c<3 && r>=0 && r<3 && board[r*3+c]===0) {
      board[r*3+c] = 1; turn = 2;
      if(checkWin(board)) return handleEnd();
      setTimeout(aiMove, 500);
    }
  }
  
  function aiMove() {
    let empty = []; board.forEach((v,i) => { if(v===0) empty.push(i); });
    if(empty.length) board[empty[Math.floor(Math.random()*empty.length)]] = 2;
    turn = 1; handleEnd();
  }
  
  function handleEnd() {
    let w = checkWin(board);
    if(w===1) { score++; updateArcScore(score); board = [0,0,0,0,0,0,0,0,0]; }
    else if(w===2) arcadeGameOver();
    else if(w===-1) board = [0,0,0,0,0,0,0,0,0];
  }

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#064e3b'; ctx.fillRect(0,0,W,H);
    let s = Math.min(W,H)*0.8, offX = (W-s)/2, offY = (H-s)/2, cs = s/3;
    
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(offX+cs, offY); ctx.lineTo(offX+cs, offY+s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(offX+cs*2, offY); ctx.lineTo(offX+cs*2, offY+s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(offX, offY+cs); ctx.lineTo(offX+s, offY+cs); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(offX, offY+cs*2); ctx.lineTo(offX+s, offY+cs*2); ctx.stroke();
    
    ctx.font = 'bold '+(cs*0.6)+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    for(let i=0; i<9; i++) {
      if(board[i]===1) { ctx.fillStyle='#10b981'; ctx.fillText('X', offX+(i%3)*cs+cs/2, offY+Math.floor(i/3)*cs+cs/2); }
      if(board[i]===2) { ctx.fillStyle='#ef4444'; ctx.fillText('O', offX+(i%3)*cs+cs/2, offY+Math.floor(i/3)*cs+cs/2); }
    }
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 16: WORD GUESS
// ═══════════════════════════════════════════
function initWord(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const words = ['CRAZY','ZINO','GAMES','BALLOON','PLAY','LEARN'];
  let word = words[Math.floor(Math.random()*words.length)], guesses = [], errors = 0, score = 0;
  
  document.addEventListener('keydown', e => {
    let k = e.key.toUpperCase();
    if(k>='A' && k<='Z' && !guesses.includes(k)) {
      guesses.push(k);
      if(!word.includes(k)) errors++;
      checkEnd();
    }
  });

  function checkEnd() {
    let won = word.split('').every(l => guesses.includes(l));
    if(won) { score++; updateArcScore(score); word = words[Math.floor(Math.random()*words.length)]; guesses = []; errors = 0; }
    else if(errors >= 6) arcadeGameOver();
  }

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(0,0,W,H);
    
    ctx.fillStyle = '#fff'; ctx.font = 'bold 40px monospace'; ctx.textAlign='center';
    let display = word.split('').map(l => guesses.includes(l) ? l : '_').join(' ');
    ctx.fillText(display, W/2, H/2);
    
    ctx.font = '20px sans-serif'; ctx.fillStyle='#ef4444';
    ctx.fillText('Errors: '+errors+'/6', W/2, H/2 + 60);
    ctx.fillStyle = '#a78bfa'; ctx.fillText('Type on keyboard!', W/2, H/2 + 100);
    
    ctx.textAlign='left';
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 17: COLOR MATCH
// ═══════════════════════════════════════════
function initColorMatch(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const colors = [{n:'RED',c:'#ef4444'}, {n:'BLUE',c:'#3b82f6'}, {n:'GREEN',c:'#22c55e'}, {n:'YELLOW',c:'#eab308'}];
  let text = '', color = '', isMatch = false, timer = 100, score = 0;
  
  function next() {
    let c1 = colors[Math.floor(Math.random()*4)], c2 = colors[Math.floor(Math.random()*4)];
    isMatch = Math.random()>0.5;
    text = c1.n; color = isMatch ? c1.c : c2.c;
    timer = 100 - Math.min(60, score*2);
  }
  next();
  
  canvas.addEventListener('mousedown', e => handleClick(e.clientX));
  canvas.addEventListener('touchstart', e => { e.preventDefault(); handleClick(e.touches[0].clientX); }, {passive:false});
  
  function handleClick(x) {
    let ans = x < W/2; // Left=Yes, Right=No
    if(ans === isMatch) { score++; updateArcScore(score); next(); }
    else arcadeGameOver();
  }

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#111'; ctx.fillRect(0,0,W,H);
    
    ctx.fillStyle = '#22c55e'; ctx.fillRect(0,H-80,W/2,80);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(W/2,H-80,W/2,80);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign='center';
    ctx.fillText('YES', W/4, H-30); ctx.fillText('NO', W*0.75, H-30);
    
    ctx.fillStyle = color; ctx.font = 'bold 60px sans-serif';
    ctx.fillText(text, W/2, H/2);
    
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W*(timer/100), 10);
    timer--;
    if(timer<=0) arcadeGameOver();
    
    ctx.textAlign='left';
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════
// GAME 18: GRAVITY FLIP
// ═══════════════════════════════════════════
function initGravity(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let p = {x: 50, y: H/2, g: 1}, obs = [], score = 0, frame = 0;
  
  canvas.addEventListener('mousedown', () => { p.g *= -1; });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); p.g *= -1; }, {passive:false});

  function loop() {
    if (!arcadeState || !arcadeState.running) return;
    ctx.fillStyle = '#44403c'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#a8a29e'; ctx.fillRect(0,0,W,40); ctx.fillRect(0,H-40,W,40);
    
    p.y += p.g * 8;
    if(p.y < 40) p.y = 40; if(p.y > H-70) p.y = H-70;
    
    if(frame%50===0) obs.push({x: W, y: Math.random()>0.5 ? 40 : H-80, w: 30, h: 40});
    
    ctx.fillStyle = '#ef4444';
    obs.forEach(o => {
      o.x -= 6 + score*0.1;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      if(p.x < o.x+o.w && p.x+30 > o.x && p.y < o.y+o.h && p.y+30 > o.y) arcadeGameOver();
      if(o.x === 50) { score++; updateArcScore(score); }
    });
    obs = obs.filter(o => o.x > -50);
    
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(p.x, p.y, 30, 30);
    
    frame++;
    arcadeState.raf = requestAnimationFrame(loop);
  }
  loop();
}

