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
      <div class="arcade-gameover-reward">🎈 +<span id="arc-earned">${cfg.reward}</span> Zino Balloons!</div>
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
  showToast(`🎮 +${arcadeState.reward} Zino Balloons!`);
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
  const COIN_CHAR = '🎈';
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
  if (type === 'dino' || type === 'cricket' || type === 'street') {
    launchArcade(type);
  } else {
    _prevLaunchGame(type);
  }
}
