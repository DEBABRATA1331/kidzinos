/* ================================================================
   WATCH FEATURES JS — Kidzinos
   XYZ Video (Reels with Like/Comment/Share/Earn)
   Featured Video (YouTube-style player + earn simulation)
   ================================================================ */

// ── Tab Switching ─────────────────────────────────────────────
function switchWatchTab(tab) {
  document.querySelectorAll('.watch-tab').forEach(t => t.classList.remove('active-wtab'));
  document.querySelectorAll('.watch-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`wtab-${tab}`).classList.add('active-wtab');
  document.getElementById(`watch-panel-${tab}`).classList.remove('hidden');
}

// ── XYZ Reel Like (with heart animation) ─────────────────────
function reelLike(reelId, btn) {
  const iconEl = document.getElementById(`reel-like-icon-${reelId}`);
  const countEl = document.getElementById(`reel-like-count-${reelId}`);

  const isLiked = btn.dataset.liked === 'true';
  if (isLiked) {
    btn.dataset.liked = 'false';
    iconEl.innerHTML = '<i class="fa-regular fa-heart"></i>';
    iconEl.style.color = '';
    const raw = parseFloat(countEl.textContent) - 0.1;
    countEl.textContent = raw >= 1000 ? (raw / 1000).toFixed(1) + 'K' : Math.round(raw);
  } else {
    btn.dataset.liked = 'true';
    iconEl.innerHTML = '<i class="fa-solid fa-heart"></i>';
    iconEl.style.color = '#ef4444';
    // Heart pop animation
    iconEl.style.animation = 'none';
    requestAnimationFrame(() => {
      iconEl.style.animation = 'heartPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)';
    });

    // Floating heart burst
    spawnFloatingHeart(btn);

    // Parse and increment
    const rawStr = countEl.textContent;
    const raw = rawStr.endsWith('K') ? parseFloat(rawStr) * 1000 : parseFloat(rawStr);
    const newVal = raw + 1;
    countEl.textContent = newVal >= 1000 ? (newVal / 1000).toFixed(1) + 'K' : newVal;
  }
}

function spawnFloatingHeart(btn) {
  const heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    font-size: 2rem;
    animation: floatUp 1s ease forwards;
    opacity: 1;
  `;
  const rect = btn.getBoundingClientRect();
  heart.style.left = (rect.left + rect.width / 2) + 'px';
  heart.style.top = rect.top + 'px';
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
}

// ── XYZ Reel Earn ─────────────────────────────────────────────
function reelEarn(reelId, btn) {
  const reel = document.getElementById(`reel-${reelId}`);
  if (reel && reel.dataset.earned === 'true') {
    showToast('✅ Already earned from this reel!');
    return;
  }

  // Simulate watch progress then earn
  let progress = 0;
  const fillEl = document.getElementById(`reel-fill-${reelId}`);
  const hintEl = document.getElementById(`reel-hint-${reelId}`);
  const earnedBadge = document.getElementById(`reel-earned-${reelId}`);

  btn.disabled = true;
  btn.style.opacity = '0.6';

  const interval = setInterval(() => {
    progress += 4;
    if (fillEl) fillEl.style.width = Math.min(progress, 100) + '%';
    if (fillEl) fillEl.style.background = progress >= 80 ? '#22c55e' : '#a855f7';
    if (hintEl) hintEl.textContent = `${Math.min(progress, 100)}% watched...`;

    if (progress >= 100) {
      clearInterval(interval);
      // Mark earned
      if (reel) reel.dataset.earned = 'true';
      if (hintEl) { hintEl.textContent = '✅ +1 Zino Earned!'; hintEl.style.color = '#22c55e'; }
      if (earnedBadge) {
        earnedBadge.classList.remove('hidden');
        setTimeout(() => earnedBadge.classList.add('hidden'), 2500);
      }
      // Update button to earned state
      const iconEl = btn.querySelector('.ra-icon');
      const labelEl = btn.querySelector('.ra-label');
      if (iconEl) iconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
      if (labelEl) labelEl.textContent = 'Earned';
      btn.classList.add('earned-state');
      btn.style.opacity = '1';

      // Award coin
      if (state && state.user) {
        state.user.zinoCoins = (state.user.zinoCoins || 0) + 1;
        updateAllZinos();
        if (typeof saveGameState === 'function') saveGameState();
      }
      showToast('🪙 +1 Zino Coin earned from XYZ Video!');
    }
  }, 80);
}

// ── XYZ Reel Share ────────────────────────────────────────────
function reelShare(reelId) {
  showToast('🔗 Link copied! Share Crazy XYZ with friends!');
}

// ── XYZ Toggle Play ───────────────────────────────────────────
function toggleReelPlay(reelId) {
  const pi = document.getElementById(`reel-pi-${reelId}`);
  if (!pi) return;
  pi.classList.toggle('hidden');
  setTimeout(() => pi.classList.add('hidden'), 1000);
}

// ── COMMENTS MODAL ────────────────────────────────────────────
let currentReelCommentId = null;
const reelCommentStore = {}; // local comment cache

function openReelComments(reelId) {
  currentReelCommentId = reelId;
  const modal = document.getElementById('reel-comments-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  // Load seeded comments from reel data-comments attribute
  const reel = document.getElementById(`reel-${reelId}`);
  let comments = [];
  if (reel && reel.dataset.comments) {
    try { comments = JSON.parse(reel.dataset.comments); } catch(e) {}
  }
  // Merge with user submitted ones
  const extra = reelCommentStore[reelId] || [];
  const all = [...comments, ...extra];

  renderReelComments(reelId, all);
  const countEl = document.getElementById('reel-comments-count');
  if (countEl) countEl.textContent = all.length + ' comment' + (all.length !== 1 ? 's' : '');
}

function renderReelComments(reelId, comments) {
  const list = document.getElementById('reel-comments-list');
  if (!list) return;
  const times = ['just now', '2m ago', '5m ago', '10m ago', '1h ago', '2h ago'];
  list.innerHTML = comments.map((c, i) => `
    <div class="reel-comment-item">
      <div class="rci-avatar">${c.u.charAt(0)}</div>
      <div class="rci-body">
        <div class="rci-name">${c.u}</div>
        <div class="rci-text">${c.t}</div>
        <div class="rci-actions">
          <button class="rci-like-btn" onclick="likeReelComment(this)">
            <i class="fa-regular fa-heart"></i> ${Math.floor(Math.random()*50)}
          </button>
          <span class="rci-time">${times[i % times.length]}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function likeReelComment(btn) {
  btn.classList.toggle('liked');
  const parts = btn.innerHTML.match(/([\d]+)/);
  if (!parts) return;
  const count = parseInt(parts[1]);
  const liked = btn.classList.contains('liked');
  const icon = liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
  btn.innerHTML = `${icon} ${liked ? count + 1 : count - 1}`;
}

function submitReelComment() {
  const input = document.getElementById('reel-comment-input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';

  if (!reelCommentStore[currentReelCommentId]) reelCommentStore[currentReelCommentId] = [];
  reelCommentStore[currentReelCommentId].push({ u: state.user.name || 'You', t: text });

  // Re-render
  const reel = document.getElementById(`reel-${currentReelCommentId}`);
  let seeded = [];
  if (reel && reel.dataset.comments) {
    try { seeded = JSON.parse(reel.dataset.comments); } catch(e) {}
  }
  const all = [...seeded, ...reelCommentStore[currentReelCommentId]];
  renderReelComments(currentReelCommentId, all);

  const countEl = document.getElementById('reel-comments-count');
  if (countEl) countEl.textContent = all.length + ' comments';

  // Scroll to bottom
  const list = document.getElementById('reel-comments-list');
  if (list) list.scrollTop = list.scrollHeight;

  showToast('💬 Comment posted!');
}

function closeReelComments() {
  const modal = document.getElementById('reel-comments-modal');
  if (modal) modal.classList.add('hidden');
  currentReelCommentId = null;
}

// ── FEATURED VIDEO PLAYER ─────────────────────────────────────
const featuredVideos = [
  { title: 'Ab Kuch Crazy Karte Hai! 🚀 — Full Episode 42', views: '2.1M views', time: '2 days ago', likes: '145K', ytUrl: 'https://youtube.com/@crazyxyz' },
  { title: "World's Craziest Science Experiments 🧪 — You Won't Believe!", views: '1.4M views', time: '5 days ago', likes: '98K', ytUrl: 'https://youtube.com/@crazyxyz' },
  { title: 'Behind the Scenes: How We Film Crazy XYZ! 🎬', views: '890K views', time: '1 week ago', likes: '72K', ytUrl: 'https://youtube.com/@crazyxyz', earned: true },
  { title: 'Crazy Challenge with 100 Friends 😂🔥 — Epic Moments!', views: '3.2M views', time: '2 weeks ago', likes: '210K', ytUrl: 'https://youtube.com/@crazyxyz' },
  { title: "India's Biggest Quiz Show by Crazy XYZ 🏆", views: '5.7M views', time: '1 month ago', likes: '380K', ytUrl: 'https://youtube.com/@crazyxyz' }
];

let fpWatchInterval = null;
let fpCurrentVideoIdx = null;
let fpEarned = [false, false, true, false, false]; // video 3 pre-earned

function openFeaturedVideo(idx) {
  fpCurrentVideoIdx = idx;
  const vid = featuredVideos[idx];
  const modal = document.getElementById('featured-player-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  // Set info
  document.getElementById('fp-video-title').textContent = vid.title;
  document.getElementById('fp-info-title').textContent = vid.title;
  document.getElementById('fp-info-meta').textContent = vid.views + ' • ' + vid.time;
  document.getElementById('fp-likes').textContent = vid.likes;
  document.getElementById('fp-yt-link').href = vid.ytUrl;

  // Reset earn bar
  const fill = document.getElementById('fp-earn-fill');
  const pct = document.getElementById('fp-earn-pct');
  const status = document.getElementById('fp-earn-status');
  const collect = document.getElementById('fp-collect-btn');
  if (fill) fill.style.width = '0%';
  if (pct) pct.textContent = '0%';
  if (collect) collect.classList.add('hidden');

  if (fpEarned[idx]) {
    if (status) status.textContent = '✅ Already earned from this video!';
    if (fill) { fill.style.width = '100%'; }
    if (pct) pct.textContent = '100%';
    if (collect) { collect.textContent = 'Collected ✓'; collect.classList.remove('hidden'); collect.disabled = true; }
    return;
  }

  // Simulate watch progress
  let progress = 0;
  if (status) status.innerHTML = 'Simulating watch... <span id="fp-earn-pct">0%</span>';
  clearInterval(fpWatchInterval);
  fpWatchInterval = setInterval(() => {
    progress += 1.5;
    const capped = Math.min(progress, 100);
    if (fill) fill.style.width = capped + '%';
    const pctEl = document.getElementById('fp-earn-pct');
    if (pctEl) pctEl.textContent = Math.round(capped) + '%';

    if (progress >= 70 && !fpEarned[idx]) {
      clearInterval(fpWatchInterval);
      fpEarned[idx] = true;
      if (status) { const p = document.getElementById('fp-earn-pct'); if(p) p.textContent='70%+'; }
      if (collect) collect.classList.remove('hidden');
      if (fill) fill.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
    }
  }, 100);
}

function collectFeaturedReward() {
  const collect = document.getElementById('fp-collect-btn');
  if (!collect || collect.disabled) return;

  if (state && state.user) {
    state.user.zinoCoins = (state.user.zinoCoins || 0) + 2;
    updateAllZinos();
    if (typeof saveGameState === 'function') saveGameState();
  }

  collect.textContent = 'Collected ✓';
  collect.disabled = true;
  collect.style.background = 'rgba(34,197,94,0.2)';
  collect.style.color = '#22c55e';

  const statusEl = document.getElementById('fp-earn-status');
  if (statusEl) statusEl.textContent = '🎉 +2 Zino Coins collected!';

  showToast('🪙 +2 Zino Coins earned from Featured Video!');

  // Mark card as earned in the list
  const cards = document.querySelectorAll('#featured-video-list .fv-card');
  if (cards[fpCurrentVideoIdx]) {
    const pill = cards[fpCurrentVideoIdx].querySelector('.fv-earn-pill');
    if (pill) {
      pill.innerHTML = '<i class="fa-solid fa-circle-check"></i> Earned!';
      pill.style.cssText = 'background:rgba(34,197,94,0.12);color:#22c55e;border-color:rgba(34,197,94,0.3);display:inline-flex;align-items:center;gap:5px;border:1px solid;border-radius:20px;padding:4px 10px;font-size:0.72rem;font-weight:800;font-family:Space Grotesk,sans-serif;';
    }
  }
}

function closeFeaturedVideo() {
  clearInterval(fpWatchInterval);
  const modal = document.getElementById('featured-player-modal');
  if (modal) modal.classList.add('hidden');
  fpCurrentVideoIdx = null;
}

// ── Featured video actions ────────────────────────────────────
function fpLike(btn) {
  const liked = btn.dataset.liked === 'true';
  btn.dataset.liked = liked ? 'false' : 'true';
  const icon = btn.querySelector('i');
  if (icon) icon.className = liked ? 'fa-regular fa-thumbs-up' : 'fa-solid fa-thumbs-up';
  btn.style.color = liked ? '' : '#6366f1';
  if (!liked) showToast('👍 Liked!');
}
function fpDislike(btn) {
  showToast('👎 Disliked');
}
function fpShare() {
  showToast('🔗 Link copied! Share this amazing video!');
}
function fpSave() {
  showToast('🔖 Saved to your Watch Later list!');
}

// ── Inject styles for floating heart ─────────────────────────
(function injectWatchAnimStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes heartPop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.6); }
      100% { transform: scale(1); }
    }
    @keyframes floatUp {
      0%   { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ── Expose to global scope ────────────────────────────────────
window.switchWatchTab = switchWatchTab;
window.reelLike = reelLike;
window.reelEarn = reelEarn;
window.reelShare = reelShare;
window.toggleReelPlay = toggleReelPlay;
window.openReelComments = openReelComments;
window.closeReelComments = closeReelComments;
window.submitReelComment = submitReelComment;
window.likeReelComment = likeReelComment;
window.openFeaturedVideo = openFeaturedVideo;
window.closeFeaturedVideo = closeFeaturedVideo;
window.collectFeaturedReward = collectFeaturedReward;
window.fpLike = fpLike;
window.fpDislike = fpDislike;
window.fpShare = fpShare;
window.fpSave = fpSave;

// ── Featured Video Search & Filter ──────────────────────────────
let fvCurrentCategory = 'all';

// Map video index → categories (matches data in featuredVideos array)
const fvVideoCategories = {
  0: ['trending', 'challenge'],
  1: ['science', 'trending'],
  2: ['behind'],
  3: ['challenge', 'trending'],
  4: ['quiz', 'trending']
};

function filterFeaturedVideos() {
  const input = document.getElementById('fv-search-input');
  const clearBtn = document.getElementById('fv-search-clear');
  const query = input ? input.value.trim().toLowerCase() : '';
  if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

  const cards = document.querySelectorAll('#featured-video-list .fv-card');
  let visibleCount = 0;

  cards.forEach((card, idx) => {
    const titleEl = card.querySelector('.fv-title');
    const title = titleEl ? titleEl.textContent.toLowerCase() : '';
    const cats = fvVideoCategories[idx] || [];

    const matchesSearch = !query || title.includes(query);
    const matchesCat = fvCurrentCategory === 'all' || cats.includes(fvCurrentCategory);

    if (matchesSearch && matchesCat) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Update result count
  const countEl = document.getElementById('fv-result-count');
  if (countEl) countEl.textContent = visibleCount + ' video' + (visibleCount !== 1 ? 's' : '');

  // Show/hide no results
  let noRes = document.getElementById('fv-no-results-msg');
  const list = document.getElementById('featured-video-list');
  if (visibleCount === 0) {
    if (!noRes && list) {
      noRes = document.createElement('div');
      noRes.id = 'fv-no-results-msg';
      noRes.className = 'fv-no-results';
      noRes.innerHTML = '<i class="fa-solid fa-video-slash"></i><p>No videos found</p>';
      list.appendChild(noRes);
    }
  } else {
    if (noRes) noRes.remove();
  }
}

function clearFVSearch() {
  const input = document.getElementById('fv-search-input');
  if (input) input.value = '';
  const clearBtn = document.getElementById('fv-search-clear');
  if (clearBtn) clearBtn.style.display = 'none';
  filterFeaturedVideos();
}

function setFVCategory(cat, btn) {
  fvCurrentCategory = cat;
  document.querySelectorAll('.fv-chip').forEach(c => c.classList.remove('active-fv-chip'));
  if (btn) btn.classList.add('active-fv-chip');
  filterFeaturedVideos();
}

window.filterFeaturedVideos = filterFeaturedVideos;
window.clearFVSearch = clearFVSearch;
window.setFVCategory = setFVCategory;
