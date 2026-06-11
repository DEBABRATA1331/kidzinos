/* ========================================================
   KIDZINOS ADMIN DASHBOARD - LOGIC
   Handles localStorage storage, dynamic listings & tab state
   ======================================================== */

// ===== STATE & DATA =====
let activeTab = 'contests';
let prizeCounter = 1;

// ===== DOM LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  // Set end date default value (e.g. 7 days from now)
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 7);
  defaultEndDate.setMinutes(0);
  document.getElementById('contest-end').value = defaultEndDate.toISOString().slice(0, 16);
  
  // Set default enrollment times
  const opens = new Date();
  const closes = new Date();
  closes.setDate(closes.getDate() + 7);
  document.getElementById('enroll-opens').value = opens.toISOString().slice(0, 16);
  document.getElementById('enroll-closes').value = closes.toISOString().slice(0, 16);

  // Initialize
  renderContestsList();
  renderQuestionsList();
  updateStats();

  // Trigger initial sync to port 5001 after iframe loads
  setTimeout(() => {
    const contests = JSON.parse(localStorage.getItem('kidzinos_contests') || '[]');
    const questions = JSON.parse(localStorage.getItem('kidzinos_questions') || '[]');
    syncToAppLocalStorage('kidzinos_contests', contests);
    syncToAppLocalStorage('kidzinos_questions', questions);
  }, 1500);
});

// ===== TAB SWITCHING =====
function switchTab(tabId) {
  activeTab = tabId;
  
  // Toggle nav buttons active class
  document.querySelectorAll('.side-nav-btn').forEach(btn => {
    if (btn.getAttribute('onclick').includes(tabId)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle active panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    if (panel.id === `tab-${tabId}`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

// ===== DYNAMIC PRIZES MANAGEMENT =====
function updatePrizeRanks() {
  const rows = document.querySelectorAll('.prize-input-row');
  prizeCounter = rows.length;
  rows.forEach((row, index) => {
    const rankLabel = row.querySelector('.prize-rank');
    const suffix = getRankSuffix(index + 1);
    rankLabel.textContent = `${index + 1}${suffix}`;
  });
}

function getRankSuffix(rank) {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
}

function addPrizeInput() {
  const container = document.getElementById('prizes-list-container');
  const nextRank = container.children.length + 1;
  const suffix = getRankSuffix(nextRank);
  
  const newRow = document.createElement('div');
  newRow.className = 'prize-input-row';
  newRow.innerHTML = `
    <span class="prize-rank">${nextRank}${suffix}</span>
    <input type="text" placeholder="e.g. ₹20,000 cash or 200 coins" required>
    <button type="button" class="del-prize-btn" onclick="removePrizeRow(this)"><i class="fa-solid fa-trash"></i></button>
  `;
  container.appendChild(newRow);
  updatePrizeRanks();
}

function removePrizeRow(btn) {
  const row = btn.parentElement;
  const container = document.getElementById('prizes-list-container');
  if (container.children.length > 1) {
    row.remove();
    updatePrizeRanks();
  } else {
    showToast('⚠️ Minimum one prize rank is required!');
  }
}

// ===== CONTEST ACTIONS =====
function toggleEntryFee() {
  const pricingSelect = document.getElementById('contest-pricing');
  const feeGroup = document.getElementById('entry-fee-group');
  const feeInput = document.getElementById('contest-fee');
  
  if (pricingSelect.value === 'Paid') {
    feeGroup.style.opacity = '1';
    feeGroup.style.pointerEvents = 'auto';
    feeInput.value = '10'; // Default paid entry fee
  } else {
    feeGroup.style.opacity = '0.5';
    feeGroup.style.pointerEvents = 'none';
    feeInput.value = '0';
  }
}

function saveContest(e) {
  e.preventDefault();
  
  const title = document.getElementById('contest-title').value.trim();
  const imageUrl = document.getElementById('contest-image').value.trim();
  const type = document.getElementById('contest-type').value;
  const pricing = document.getElementById('contest-pricing').value;
  const entryFee = parseFloat(document.getElementById('contest-fee').value) || 0;
  const league = document.getElementById('contest-league').value;
  const endDate = document.getElementById('contest-end').value;
  const rules = document.getElementById('contest-rules').value.trim();
  
  // Extract prizes
  const prizes = [];
  document.querySelectorAll('.prize-input-row input').forEach(input => {
    prizes.push(input.value.trim());
  });

  const contest = {
    id: 'custom_' + Date.now(),
    title,
    imageUrl,
    type,
    pricing,
    entryFee,
    league,
    endDate,
    rules,
    prizes
  };

  const contests = JSON.parse(localStorage.getItem('kidzinos_contests') || '[]');
  contests.unshift(contest); // Add to beginning of array
  localStorage.setItem('kidzinos_contests', JSON.stringify(contests));
  syncToAppLocalStorage('kidzinos_contests', contests);

  showToast('🚀 Contest launched successfully!');
  
  // Reset form
  document.getElementById('contest-form').reset();
  
  // Reset prizes rows to 1 rank
  const container = document.getElementById('prizes-list-container');
  container.innerHTML = `
    <div class="prize-input-row">
      <span class="prize-rank">1st</span>
      <input type="text" placeholder="e.g. ₹50,000 cash or 500 coins" required>
      <button type="button" class="del-prize-btn" onclick="removePrizeRow(this)"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;
  updatePrizeRanks();
  toggleEntryFee();
  
  // Refresh UI
  renderContestsList();
  updateStats();
}

function deleteContest(id) {
  let contests = JSON.parse(localStorage.getItem('kidzinos_contests') || '[]');
  contests = contests.filter(c => c.id !== id);
  localStorage.setItem('kidzinos_contests', JSON.stringify(contests));
  syncToAppLocalStorage('kidzinos_contests', contests);
  
  showToast('🗑️ Contest deleted.');
  renderContestsList();
  updateStats();
}

function renderContestsList() {
  const container = document.getElementById('contests-list');
  const contests = JSON.parse(localStorage.getItem('kidzinos_contests') || '[]');
  
  if (contests.length === 0) {
    container.innerHTML = '<div class="empty-state">No custom contests launched yet.</div>';
    return;
  }
  
  container.innerHTML = '';
  contests.forEach(c => {
    const card = document.createElement('div');
    card.className = 'contest-item-card';
    
    const displayDate = c.endDate ? new Date(c.endDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute:'2-digit'}) : 'TBD';
    const firstPrize = c.prizes && c.prizes[0] ? c.prizes[0] : 'N/A';
    
    card.innerHTML = `
      <div class="item-thumb">
        <img src="${c.imageUrl || 'char1.jpg'}" alt="" onerror="this.src='char1.jpg'">
      </div>
      <div class="item-body">
        <div class="item-title">${c.title}</div>
        <div class="item-meta-row">
          <span class="item-meta type">${c.type}</span>
          <span class="item-meta prize"><i class="fa-solid fa-trophy"></i> ${firstPrize}</span>
        </div>
        <div class="item-meta-row">
          <span class="item-meta"><i class="fa-solid fa-layer-group"></i> ${c.league}</span>
          <span class="item-meta"><i class="fa-solid fa-coins"></i> ${c.entryFee > 0 ? '₹' + c.entryFee : 'Free'}</span>
          <span class="item-meta date"><i class="fa-regular fa-clock"></i> Ends ${displayDate}</span>
        </div>
      </div>
      <button class="item-delete-btn" onclick="deleteContest('${c.id}')"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(card);
  });
}

// ===== QUESTION ACTIONS =====
function saveQuestion(e) {
  e.preventDefault();
  
  const category = document.getElementById('q-category').value;
  const tag = document.getElementById('q-tag').value.trim();
  const text = document.getElementById('q-text').value.trim();
  const correct = parseInt(document.getElementById('q-correct').value);
  
  // Extract options
  const opts = [];
  document.querySelectorAll('.q-opt-val').forEach(input => {
    opts.push(input.value.trim());
  });

  const question = {
    id: 'q_' + Date.now(),
    mode: category,
    cat: tag,
    q: text,
    opts: opts,
    ans: correct
  };

  const questions = JSON.parse(localStorage.getItem('kidzinos_questions') || '[]');
  questions.unshift(question);
  localStorage.setItem('kidzinos_questions', JSON.stringify(questions));
  syncToAppLocalStorage('kidzinos_questions', questions);

  showToast('✅ Question uploaded successfully!');
  
  // Reset form
  document.getElementById('question-form').reset();
  
  // Refresh UI
  renderQuestionsList();
  updateStats();
}

function deleteQuestion(id) {
  let questions = JSON.parse(localStorage.getItem('kidzinos_questions') || '[]');
  questions = questions.filter(q => q.id !== id);
  localStorage.setItem('kidzinos_questions', JSON.stringify(questions));
  syncToAppLocalStorage('kidzinos_questions', questions);
  
  showToast('🗑️ Question deleted.');
  renderQuestionsList();
  updateStats();
}

function renderQuestionsList() {
  const container = document.getElementById('questions-list');
  const questions = JSON.parse(localStorage.getItem('kidzinos_questions') || '[]');
  
  if (questions.length === 0) {
    container.innerHTML = '<div class="empty-state">No custom questions uploaded yet.</div>';
    return;
  }
  
  container.innerHTML = '';
  questions.forEach(q => {
    const card = document.createElement('div');
    card.className = 'question-item-card';
    
    const modeNames = { daily: 'Daily Drill', war: 'Crazy War', stash: 'Weekly Stash' };
    
    card.innerHTML = `
      <div class="q-card-header">
        <span class="q-card-tag">${q.cat}</span>
        <span class="q-card-mode">${modeNames[q.mode] || q.mode}</span>
      </div>
      <div class="q-card-text">${q.q}</div>
      <div class="q-card-opts">
        <div class="q-card-opt ${q.ans === 0 ? 'correct' : ''}">A. ${q.opts[0]}</div>
        <div class="q-card-opt ${q.ans === 1 ? 'correct' : ''}">B. ${q.opts[1]}</div>
        <div class="q-card-opt ${q.ans === 2 ? 'correct' : ''}">C. ${q.opts[2]}</div>
        <div class="q-card-opt ${q.ans === 3 ? 'correct' : ''}">D. ${q.opts[3]}</div>
      </div>
      <button class="item-delete-btn" onclick="deleteQuestion('${q.id}')" style="top:16px; right:16px;"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(card);
  });
}

// ===== GLOBAL UTILS =====
function updateStats() {
  const contests = JSON.parse(localStorage.getItem('kidzinos_contests') || '[]');
  const questions = JSON.parse(localStorage.getItem('kidzinos_questions') || '[]');
  
  document.getElementById('stat-contests-count').textContent = contests.length;
  document.getElementById('stat-questions-count').textContent = questions.length;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function syncToAppLocalStorage(key, data) {
  const iframe = document.getElementById('sync-iframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({
      action: 'sync_localstorage',
      key: key,
      data: data
    }, 'http://localhost:5001');
  }
}
