/* =========================================================================
   CIRCLE FEATURE — Kidzinos
   Social connection system: send circle request → circle back = mutual circle
   ========================================================================= */

// ===== CIRCLE STATE =====
const circleState = {
  myCircle: [],        // people I've circled (accepted)
  sentRequests: [],    // requests I sent, pending
  incomingRequests: [] // requests waiting for my response
};

// Seed some incoming requests for demo
function initCircle() {
  const saved = localStorage.getItem('kidzinos_circle');
  if (saved) {
    Object.assign(circleState, JSON.parse(saved));
  } else {
    // Demo: 2 incoming requests out of the box
    circleState.incomingRequests = [
      { id: 'user_rohan', name: 'Rohan (Delhi)', avatar: null, time: '2m ago', tag: 'Legend' },
      { id: 'user_priya', name: 'Priya M.', avatar: null, time: '15m ago', tag: 'Master' }
    ];
    saveCircle();
  }
  updateCircleBadge();
}

function saveCircle() {
  localStorage.setItem('kidzinos_circle', JSON.stringify(circleState));
}

// ===== BADGE COUNTER =====
function updateCircleBadge() {
  const count = circleState.incomingRequests.length;
  document.querySelectorAll('.circle-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ===== SEND CIRCLE REQUEST =====
// Called from story viewer or UZ post
function sendCircleRequest(userId, userName) {
  // Already in circle?
  if (circleState.myCircle.find(u => u.id === userId)) {
    showToast(`✅ ${userName} is already in your Circle!`);
    return;
  }
  // Already sent?
  if (circleState.sentRequests.find(u => u.id === userId)) {
    showToast(`⏳ Circle request already sent to ${userName}`);
    return;
  }

  circleState.sentRequests.push({ id: userId, name: userName, time: 'just now' });
  saveCircle();

  // Simulate them accepting after 3s (for demo feel)
  setTimeout(() => {
    const idx = circleState.sentRequests.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const user = circleState.sentRequests[idx];
      // 70% chance they circle back immediately (demo)
      if (Math.random() > 0.3) {
        circleState.sentRequests.splice(idx, 1);
        circleState.myCircle.push({ id: userId, name: userName, time: 'just now' });

        // Also add a "they circled back" incoming notification
        circleState.incomingRequests.unshift({
          id: userId + '_back',
          name: userName,
          avatar: null,
          time: 'just now',
          tag: 'New Circle',
          circledBack: true // already accepted, just notify
        });
        saveCircle();
        updateCircleBadge();
        showToast(`🔵 ${userName} circled you back! You're now in each other's Circle!`);
      }
    }
  }, 3000);

  showToast(`🔵 Circle request sent to ${userName}!`);
  updateCircleButtonState(userId, 'sent');
}

// ===== RESPOND TO REQUEST =====
function acceptCircleRequest(reqId) {
  const idx = circleState.incomingRequests.findIndex(r => r.id === reqId);
  if (idx === -1) return;
  const req = circleState.incomingRequests[idx];

  circleState.incomingRequests.splice(idx, 1);
  if (!circleState.myCircle.find(u => u.id === req.id)) {
    circleState.myCircle.push({ id: req.id, name: req.name, time: 'just now' });
  }
  saveCircle();
  updateCircleBadge();
  renderCircleRequestsList();
  showToast(`🔵 You circled back ${req.name}! You're now in each other's Circle!`);
}

function declineCircleRequest(reqId) {
  const idx = circleState.incomingRequests.findIndex(r => r.id === reqId);
  if (idx === -1) return;
  const name = circleState.incomingRequests[idx].name;
  circleState.incomingRequests.splice(idx, 1);
  saveCircle();
  updateCircleBadge();
  renderCircleRequestsList();
  showToast(`❌ Declined circle request from ${name}`);
}

// ===== BUTTON STATE HELPER =====
function updateCircleButtonState(userId, state) {
  document.querySelectorAll(`[data-circle-user="${userId}"]`).forEach(btn => {
    if (state === 'sent') {
      btn.textContent = '⏳ Requested';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    } else if (state === 'circled') {
      btn.textContent = '✅ In Circle';
      btn.disabled = true;
      btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      btn.style.opacity = '1';
    }
  });
}

function getCircleButtonLabel(userId) {
  if (circleState.myCircle.find(u => u.id === userId)) return 'in_circle';
  if (circleState.sentRequests.find(u => u.id === userId)) return 'sent';
  return 'none';
}

// ===== CIRCLE MODAL =====
function openCircleModal() {
  const modal = document.getElementById('circle-modal');
  if (modal) {
    modal.classList.remove('hidden');
    renderCircleRequestsList();
  }
}

function closeCircleModal() {
  const modal = document.getElementById('circle-modal');
  if (modal) modal.classList.add('hidden');
}

function renderCircleRequestsList() {
  const incoming = document.getElementById('circle-incoming-list');
  const myCircleList = document.getElementById('my-circle-list');
  const incomingCount = document.getElementById('circle-incoming-count');
  const myCircleCount = document.getElementById('my-circle-count');

  if (incomingCount) incomingCount.textContent = circleState.incomingRequests.length;
  if (myCircleCount) myCircleCount.textContent = circleState.myCircle.length;

  if (incoming) {
    if (circleState.incomingRequests.length === 0) {
      incoming.innerHTML = `
        <div style="text-align:center; padding:24px 0; color:rgba(255,255,255,0.4);">
          <i class="fa-solid fa-circle-check" style="font-size:2rem; margin-bottom:8px; display:block;"></i>
          <div style="font-size:0.85rem;">No pending circle requests</div>
        </div>`;
    } else {
      incoming.innerHTML = circleState.incomingRequests.map(req => `
        <div class="circle-req-item" id="req-${req.id}">
          <div class="circle-req-avatar">${req.name.charAt(0)}</div>
          <div class="circle-req-info">
            <div class="circle-req-name">${req.name}</div>
            <div class="circle-req-meta">
              ${req.tag ? `<span class="circle-req-tag">${req.tag}</span>` : ''}
              <span style="font-size:0.72rem; color:rgba(255,255,255,0.4);">${req.time}</span>
            </div>
          </div>
          ${req.circledBack
            ? `<div style="font-size:0.78rem; color:#22c55e; font-weight:700; background:rgba(34,197,94,0.1); padding:4px 10px; border-radius:8px; flex-shrink:0;">✅ Mutual</div>`
            : `<div style="display:flex; gap:8px; flex-shrink:0;">
                <button class="circle-back-btn" onclick="acceptCircleRequest('${req.id}')">
                  <i class="fa-solid fa-circle-dot"></i> Circle Back
                </button>
                <button class="circle-decline-btn" onclick="declineCircleRequest('${req.id}')">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>`
          }
        </div>
      `).join('');
    }
  }

  if (myCircleList) {
    if (circleState.myCircle.length === 0) {
      myCircleList.innerHTML = `
        <div style="text-align:center; padding:24px 0; color:rgba(255,255,255,0.4);">
          <i class="fa-solid fa-users" style="font-size:2rem; margin-bottom:8px; display:block;"></i>
          <div style="font-size:0.85rem;">Your circle is empty — start connecting!</div>
        </div>`;
    } else {
      myCircleList.innerHTML = circleState.myCircle.map(user => `
        <div class="circle-req-item">
          <div class="circle-req-avatar" style="background:linear-gradient(135deg,#6366f1,#a855f7);">${user.name.charAt(0)}</div>
          <div class="circle-req-info">
            <div class="circle-req-name">${user.name}</div>
            <div class="circle-req-meta">
              <span class="circle-req-tag" style="background:rgba(34,197,94,0.15); color:#22c55e; border-color:rgba(34,197,94,0.3);">In Circle</span>
            </div>
          </div>
          <div style="color:#22c55e; font-size:1.2rem;"><i class="fa-solid fa-circle-check"></i></div>
        </div>
      `).join('');
    }
  }
}

// ===== CIRCLE TAB SWITCHER =====
function switchCircleTab(tab) {
  document.querySelectorAll('.circle-tab').forEach(t => t.classList.remove('active-circle-tab'));
  document.querySelectorAll('.circle-tab-panel').forEach(p => p.style.display = 'none');
  document.getElementById(`circle-tab-${tab}`).classList.add('active-circle-tab');
  document.getElementById(`circle-panel-${tab}`).style.display = 'block';
}

// ===== BUILD CIRCLE BUTTON FOR STORY =====
function buildCircleButton(userId, userName) {
  const status = getCircleButtonLabel(userId);
  if (status === 'in_circle') {
    return `<button class="circle-send-btn in-circle" data-circle-user="${userId}" disabled>
      <i class="fa-solid fa-circle-check"></i> In Circle
    </button>`;
  } else if (status === 'sent') {
    return `<button class="circle-send-btn pending" data-circle-user="${userId}" disabled>
      <i class="fa-solid fa-clock"></i> Requested
    </button>`;
  } else {
    return `<button class="circle-send-btn" data-circle-user="${userId}" onclick="sendCircleRequest('${userId}', '${userName.replace(/'/g, "\\'")}')">
      <i class="fa-solid fa-circle-dot"></i> Circle
    </button>`;
  }
}

// ===== ATTACH CIRCLE BUTTON TO STORY VIEWER =====
// Called from openStory override
function injectCircleIntoStory(name, avatarSrc) {
  const userId = 'user_' + name.toLowerCase().replace(/\s/g, '_');
  const storyFooter = document.getElementById('story-circle-footer');
  if (storyFooter) {
    storyFooter.innerHTML = `
      <div style="text-align:center; padding-top:4px;">
        ${buildCircleButton(userId, name)}
      </div>`;
  }
}

// ===== UZ CIRCLE HANDLER =====
function handleUzCircle(btn, userId, userName) {
  const status = getCircleButtonLabel(userId);
  if (status === 'in_circle') {
    showToast(`✅ ${userName} is already in your Circle!`);
    return;
  }
  if (status === 'sent') {
    showToast(`⏳ Circle request already sent!`);
    return;
  }
  sendCircleRequest(userId, userName);
  // Update button immediately
  btn.innerHTML = '<i class="fa-solid fa-clock"></i> Requested';
  btn.classList.add('sent-state');
  btn.disabled = true;
  // After the auto-accept timeout, update to circled
  setTimeout(() => {
    if (getCircleButtonLabel(userId) === 'in_circle') {
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> In Circle';
      btn.classList.remove('sent-state');
      btn.classList.add('circled-state');
    }
  }, 3500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', initCircle);

window.sendCircleRequest = sendCircleRequest;
window.acceptCircleRequest = acceptCircleRequest;
window.declineCircleRequest = declineCircleRequest;
window.openCircleModal = openCircleModal;
window.closeCircleModal = closeCircleModal;
window.switchCircleTab = switchCircleTab;
window.buildCircleButton = buildCircleButton;
window.injectCircleIntoStory = injectCircleIntoStory;
window.handleUzCircle = handleUzCircle;
