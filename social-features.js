/* ========================================
   SOCIAL FEATURES JS — Spark / Dilemma / Fire Votes
======================================== */

// ===== ALIASES =====
const funAliases = [
  'Cosmic Falcon','Thunder Panda','Neon Shark','Pixel Wolf','Storm Eagle',
  'Quantum Fox','Blaze Owl','Turbo Koala','Hyper Lynx','Nebula Tiger',
  'Cyber Hawk','Volt Bear','Astro Dolphin','Nova Jaguar','Zen Phoenix',
  'Rocket Parrot','Chrome Panther','Laser Penguin','Sonic Crane','Plasma Otter'
];
function getAlias(seed){ return funAliases[(seed||0) % funAliases.length]; }
function getUserAlias(){ return getAlias(state.user.name.charCodeAt(0) + state.user.name.length); }
function getUserAgeBand(){
  if(!state.user.dob) return '13-15';
  const age = Math.floor((Date.now()-new Date(state.user.dob).getTime())/31557600000);
  if(age<=12) return '10-12'; if(age<=15) return '13-15'; return '16-17';
}

// ===== SAFETY FILTER =====
const blockedWords = ['stupid','idiot','hate','kill','die','dumb','ugly','sex','porn','drugs','alcohol','caste','religion'];
function isSafe(text){ const t=text.toLowerCase(); return !blockedWords.some(w=>t.includes(w)); }

// ===== SPARK PROMPTS =====
const sparkPrompts = {
  'Science':['If plants eat sunlight, why can\'t humans?','Could we breathe underwater if we evolved differently?','Is fire alive? It grows, it eats, it dies.'],
  'Chemistry':['If atoms are mostly empty space, are we mostly nothing?','Why does ice float when most solids sink?','Could we create a new element someday?'],
  'Biology':['If we share 60% DNA with bananas, are we part fruit?','Why can\'t humans regrow limbs like lizards?','Is a virus alive or not?'],
  'History':['Would the world be different if the internet was invented 100 years earlier?','Why do empires always fall eventually?','Could one person really change history?'],
  'Geography':['If all ice melted, which countries would vanish?','Why are deserts expanding?','Could humans live underwater in cities?'],
  'Mathematics':['Is math invented or discovered?','Why does 0.999... equal 1?','Could aliens have different math?'],
  'Literature':['Can a story change the real world?','Why do sad endings feel more real?','Is the author or reader more important?'],
  'Physics':['If time is relative, is anyone really \'on time\'?','Could we ever travel faster than light?','Do parallel universes exist?'],
  'Culture':['Why do all cultures have music?','Is tradition helpful or limiting?','Can food tell the story of a civilization?'],
};
function getSparkPrompt(cat){ const arr=sparkPrompts[cat]||sparkPrompts['Science']; return arr[Math.floor(Math.random()*arr.length)]; }

// ===== DILEMMA QUESTIONS =====
const dilemmaQuestions = [
  {q:'Should robots make decisions for humans?',theme:'Technology'},
  {q:'Is homework useful or just busywork?',theme:'Education'},
  {q:'Should animals be kept in zoos?',theme:'Ethics'},
  {q:'Is AI smarter than humans?',theme:'Technology'},
  {q:'Should school start later in the morning?',theme:'Education'},
  {q:'Is social media good for teenagers?',theme:'Society'},
  {q:'Should we try to live on Mars?',theme:'Space'},
  {q:'Can money buy happiness?',theme:'Philosophy'},
  {q:'Should exams be replaced by projects?',theme:'Education'},
  {q:'Is it okay to clone animals?',theme:'Science'},
  {q:'Should kids be allowed to vote?',theme:'Politics'},
  {q:'Is it better to be smart or kind?',theme:'Philosophy'},
  {q:'Should plastic be completely banned?',theme:'Environment'},
  {q:'Can video games teach you real skills?',theme:'Technology'},
  {q:'Should we contact aliens if we find them?',theme:'Space'},
  {q:'Is competition good or bad for students?',theme:'Education'},
  {q:'Should uniforms be mandatory in schools?',theme:'Education'},
  {q:'Would you rather know the future or change the past?',theme:'Philosophy'},
  {q:'Is privacy more important than safety?',theme:'Ethics'},
  {q:'Should self-driving cars replace human drivers?',theme:'Technology'},
];
function getTodayDilemma(){
  const d=new Date(); const idx=(d.getFullYear()*1000+d.getMonth()*31+d.getDate())%dilemmaQuestions.length;
  return dilemmaQuestions[idx];
}

// ===== SOCIAL STATE =====
state.social = {
  alias: '',
  sparks: [],
  sparkFilter: 'all',
  dilemma: { votedToday:false, vote:null, lockTimer:0, lockInterval:null, reasonPosted:false,
             yesCount:0, noCount:0, reasonings:[] },
  fireVotes: { weekStart:'', firesRemaining:10, votedItems:{}, feed:[], ageBandFilter:'all' }
};

// ===== DEMO SEED DATA =====
function seedDemoData(){
  state.social.alias = getUserAlias();
  // Seed sparks
  state.social.sparks = [
    {id:1,alias:'Thunder Panda',topic:'Science',text:'If plants eat sunlight and we eat plants... we\'re basically solar powered 🌞',fire:42,bulb:18,rocket:7,time:'2h ago',myReaction:null},
    {id:2,alias:'Neon Shark',topic:'Biology',text:'Viruses aren\'t alive but they can kill. That\'s scarier than any horror movie.',fire:31,bulb:25,rocket:12,time:'4h ago',myReaction:null},
    {id:3,alias:'Pixel Wolf',topic:'Mathematics',text:'Math was probably discovered. The universe runs on equations we just figured out.',fire:28,bulb:33,rocket:5,time:'5h ago',myReaction:null},
    {id:4,alias:'Storm Eagle',topic:'History',text:'Every empire thought they\'d last forever. Humility is the real superpower.',fire:55,bulb:14,rocket:22,time:'6h ago',myReaction:null},
    {id:5,alias:'Quantum Fox',topic:'Geography',text:'If all ice melts, Mumbai goes underwater. That\'s not science fiction, that\'s a weather forecast.',fire:67,bulb:20,rocket:30,time:'8h ago',myReaction:null},
    {id:6,alias:'Blaze Owl',topic:'Science',text:'Fire needs oxygen to survive. Does that make it an organism? 🤔',fire:19,bulb:41,rocket:8,time:'10h ago',myReaction:null},
  ];
  // Seed dilemma
  const dl = state.social.dilemma;
  dl.yesCount = Math.floor(Math.random()*2000)+1500;
  dl.noCount = Math.floor(Math.random()*1500)+800;
  dl.reasonings = [
    {id:1,alias:'Cosmic Falcon',text:'Robots follow rules but don\'t understand consequences. Humans do wrong things too but at least they feel bad about it.',fire:48,myReacted:false},
    {id:2,alias:'Turbo Koala',text:'Let robots decide small stuff like traffic lights. Big stuff like laws? Nah, that needs a heart.',fire:35,myReacted:false},
    {id:3,alias:'Hyper Lynx',text:'AI already makes decisions for us — what we see online, what we buy. We just don\'t notice.',fire:29,myReacted:false},
    {id:4,alias:'Nebula Tiger',text:'If a robot can save more lives than a human doctor, shouldn\'t it? Logic > emotion sometimes.',fire:22,myReacted:false},
  ];
  // Seed fire votes
  const fv = state.social.fireVotes;
  fv.feed = [
    {id:1,source:'dilemma',topic:'Should AI make decisions?',text:'Robots follow rules but don\'t understand consequences. Humans do wrong things too but at least they feel bad about it.',alias:'Cosmic Falcon',age:14,band:'13-15',fireScore:48,agreeScore:134,disagreeCount:12,myVote:null},
    {id:2,source:'spark',topic:'Photosynthesis',text:'If plants eat sunlight and we eat plants, are we solar-powered?',alias:'Thunder Panda',age:12,band:'10-12',fireScore:61,agreeScore:89,disagreeCount:5,myVote:null},
    {id:3,source:'dilemma',topic:'Should exams be replaced?',text:'Projects teach you how to think. Exams teach you how to memorize. Real life needs thinking.',alias:'Pixel Wolf',age:15,band:'13-15',fireScore:37,agreeScore:112,disagreeCount:18,myVote:null},
    {id:4,source:'spark',topic:'History',text:'Every empire fell because leaders stopped listening. That\'s a lesson for classrooms too.',alias:'Storm Eagle',age:16,band:'16-17',fireScore:44,agreeScore:78,disagreeCount:9,myVote:null},
    {id:5,source:'spark',topic:'Geography',text:'We spend billions reaching Mars but can\'t save our own oceans. Priorities?',alias:'Quantum Fox',age:13,band:'13-15',fireScore:52,agreeScore:145,disagreeCount:22,myVote:null},
  ];
}

// ===== COMMUNITY TAB SWITCHING =====
function switchCommTab(tab){
  ['dilemma','sparks','firevotes'].forEach(t=>{
    const btn=document.getElementById(`ctab-${t}`);
    const content=document.getElementById(`ctab-content-${t}`);
    if(t===tab){ btn?.classList.add('active-ctab'); content?.classList.remove('hidden'); }
    else { btn?.classList.remove('active-ctab'); content?.classList.add('hidden'); }
  });
  if(tab==='sparks') renderSparksFeed();
  if(tab==='firevotes') renderFireVotesFeed();
  if(tab==='dilemma') initDilemma();
}

// ===== NAV UPDATE =====
const _socialOrigNav = updateNavActive;
updateNavActive = function(screenId){
  _socialOrigNav(screenId);
  const navMap2 = {community:'nav-community'};
  if(navMap2[screenId]) document.getElementById(navMap2[screenId])?.classList.add('active-nav');
};

// ===== SCREEN INIT OVERRIDES =====
const _socialOrigScreenEnter = onScreenEnter;
onScreenEnter = function(screenId){
  _socialOrigScreenEnter(screenId);
  if(screenId==='community'){
    if(!state.social.sparks.length) seedDemoData();
    document.getElementById('comm-xp').textContent = state.user.csiScore.toLocaleString();
    initDilemma();
  } else if(screenId==='home'){
    updateHomeStats();
    updateCitiesUI();
    initUnlimitedZone();
    renderStories();
  }
};

// ==============================
//   DAILY DILEMMA
// ==============================
function initDilemma(){
  const dl = state.social.dilemma;
  const today = getTodayDilemma();
  const todayStr = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
  document.getElementById('dilemma-date').textContent = `Daily Dilemma · ${todayStr}`;
  document.getElementById('dilemma-question').textContent = today.q;
  const total = dl.yesCount+dl.noCount;
  document.getElementById('dilemma-voters').textContent = `${total.toLocaleString()} students voted today`;
  if(dl.votedToday){
    document.getElementById('dilemma-vote-area').classList.add('hidden');
    document.getElementById('dilemma-result-area').classList.remove('hidden');
    document.getElementById('dilemma-lock-msg').classList.add('hidden');
    document.getElementById('dilemma-bars').classList.remove('hidden');
    showDilemmaBars();
    document.getElementById('dilemma-reasoning-area').classList.remove('hidden');
    document.getElementById('dilemma-share-row').classList.remove('hidden');
  } else {
    document.getElementById('dilemma-vote-area').classList.remove('hidden');
    document.getElementById('dilemma-result-area').classList.add('hidden');
  }
  renderDilemmaReasonings();
}

function voteDilemma(vote){
  const dl = state.social.dilemma;
  if(dl.votedToday) return;
  dl.votedToday = true;
  dl.vote = vote;
  if(vote==='yes') dl.yesCount++; else dl.noCount++;
  // Update UI
  document.getElementById('dilemma-vote-area').classList.add('hidden');
  document.getElementById('dilemma-result-area').classList.remove('hidden');
  document.getElementById('dilemma-your-vote-text').textContent = vote==='yes'?'Yes':'No';
  document.getElementById('dilemma-your-vote-text').style.color = vote==='yes'?'#22C55E':'#EF4444';
  // Show lock timer
  document.getElementById('dilemma-lock-msg').classList.remove('hidden');
  document.getElementById('dilemma-bars').classList.add('hidden');
  dl.lockTimer = 30;
  updateLockTimerDisplay();
  clearInterval(dl.lockInterval);
  dl.lockInterval = setInterval(()=>{
    dl.lockTimer--;
    updateLockTimerDisplay();
    if(dl.lockTimer<=0){
      clearInterval(dl.lockInterval);
      document.getElementById('dilemma-lock-msg').classList.add('hidden');
      document.getElementById('dilemma-bars').classList.remove('hidden');
      showDilemmaBars();
      document.getElementById('dilemma-reasoning-area').classList.remove('hidden');
      document.getElementById('dilemma-share-row').classList.remove('hidden');
      state.user.csiScore += 2;
      showToast('🤔 +2 XP for voting!');
    }
  },1000);
}

function updateLockTimerDisplay(){
  const t = state.social.dilemma.lockTimer;
  document.getElementById('lock-timer-num').textContent = t;
  document.getElementById('lock-seconds').textContent = t;
  const circle = document.getElementById('lock-timer-circle');
  if(circle){ const pct = ((30-t)/30)*100; circle.setAttribute('stroke-dashoffset', pct); }
}

function showDilemmaBars(){
  const dl = state.social.dilemma;
  const total = dl.yesCount+dl.noCount;
  const yesPct = Math.round((dl.yesCount/total)*100);
  const noPct = 100-yesPct;
  document.getElementById('db-yes-pct').textContent = yesPct;
  document.getElementById('db-no-pct').textContent = noPct;
  setTimeout(()=>{ document.getElementById('dilemma-bar-fill').style.width = yesPct+'%'; },100);
  const isMajority = (dl.vote==='yes'&&yesPct>=50)||(dl.vote==='no'&&noPct>=50);
  document.getElementById('dilemma-majority').textContent = isMajority ? "You're with the majority today!" : "You're a rebel thinker! 🔥";
}

// Dilemma char counter
document.addEventListener('DOMContentLoaded',()=>{
  const ri = document.getElementById('dilemma-reason-input');
  if(ri) ri.addEventListener('input',()=>{ document.getElementById('dilemma-char-count').textContent=`${ri.value.length}/100`; });
  const si = document.getElementById('spark-input');
  if(si) si.addEventListener('input',()=>{ document.getElementById('spark-char-count').textContent=`${si.value.length}/150`; });
});

function postDilemmaReasoning(){
  const dl = state.social.dilemma;
  if(dl.reasonPosted){ showToast('You already posted today!'); return; }
  const text = document.getElementById('dilemma-reason-input').value.trim();
  if(!text){ showToast('Write something first!'); return; }
  if(!isSafe(text)){ showToast('⚠️ Please keep it respectful!'); return; }
  dl.reasonPosted = true;
  dl.reasonings.unshift({id:Date.now(),alias:getUserAlias(),text,fire:0,myReacted:false});
  state.user.csiScore += 5;
  state.user.zinoCoins += 3;
  updateAllZinos();
  showToast('✨ Reasoning posted! +5 XP +3 🪙');
  document.getElementById('dilemma-reason-input').value = '';
  document.getElementById('dilemma-reason-btn').textContent = '✅ Posted!';
  document.getElementById('dilemma-reason-btn').style.opacity = '0.5';
  document.getElementById('dilemma-reason-btn').style.pointerEvents = 'none';
  renderDilemmaReasonings();
}

function renderDilemmaReasonings(){
  const feed = document.getElementById('dilemma-reasonings-feed');
  if(!feed) return;
  const items = state.social.dilemma.reasonings;
  feed.innerHTML = items.map(r=>`
    <div class="reasoning-card">
      <div class="reasoning-card-header">
        <div class="reasoning-alias"><i class="fa-solid fa-user-secret"></i> ${r.alias}</div>
        <div class="reasoning-fire-count">🔥 ${r.fire}</div>
      </div>
      <div class="reasoning-text">${r.text}</div>
      <button class="reasoning-react-btn ${r.myReacted?'reacted':''}" onclick="reactReasoning(${r.id})">
        🔥 ${r.myReacted?'Fired!':'Fire'}
      </button>
    </div>
  `).join('');
}

function reactReasoning(id){
  const r = state.social.dilemma.reasonings.find(x=>x.id===id);
  if(!r||r.myReacted) return;
  r.myReacted=true; r.fire++;
  renderDilemmaReasonings();
  showToast('🔥 Fired!');
}

function shareDilemma(){
  const dl = state.social.dilemma;
  const q = getTodayDilemma().q;
  const total = dl.yesCount+dl.noCount;
  const yesPct = Math.round((dl.yesCount/total)*100);
  const text = `🤔 Today's Dilemma: "${q}"\n\nI said ${dl.vote==='yes'?'Yes':'No'}! ${yesPct}% agree.\nWhat do you think? Join Kidzinos! #Kidzinos`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,'_blank');
}

// ==============================
//   POST-QUIZ SPARK
// ==============================
let sparkQuizData = null;

function showSparkPrompt(correct, total, score, category){
  if(correct/total < 0.7) return;
  sparkQuizData = {correct,total,score,category};
  const alias = getUserAlias();
  document.getElementById('spark-score').textContent = `${correct}/${total}`;
  document.getElementById('spark-topic').textContent = `${category} · +${score} XP`;
  document.getElementById('spark-alias').innerHTML = `<i class="fa-solid fa-user-secret"></i> ${alias}'s spark ✦`;
  document.getElementById('spark-prompt-q').textContent = getSparkPrompt(category);
  document.getElementById('spark-input').value = '';
  document.getElementById('spark-char-count').textContent = '0/150';
  document.getElementById('spark-prompt-modal').classList.remove('hidden');
}

function postSpark(){
  const text = document.getElementById('spark-input').value.trim();
  if(!text){ showToast('Write your thought first!'); return; }
  if(text.length<10){ showToast('Make it a bit longer!'); return; }
  if(!isSafe(text)){ showToast('⚠️ Please keep it respectful!'); return; }
  const spark = {
    id: Date.now(), alias: getUserAlias(),
    topic: sparkQuizData?.category||'Science', text,
    fire:0, bulb:0, rocket:0, time:'Just now', myReaction:null
  };
  state.social.sparks.unshift(spark);
  state.user.csiScore += 10;
  state.user.zinoCoins += 5;
  updateAllZinos();
  closeSparkPrompt();
  showToast('🌟 Spark posted! +10 XP +5 🪙');
  // Simulate reactions notification after 30s
  setTimeout(()=>{
    const reactions = Math.floor(Math.random()*15)+5;
    spark.fire = Math.floor(reactions*0.5);
    spark.bulb = Math.floor(reactions*0.3);
    spark.rocket = reactions - spark.fire - spark.bulb;
    showSparkNotification(reactions);
  },30000);
}

function closeSparkPrompt(){
  document.getElementById('spark-prompt-modal').classList.add('hidden');
  sparkQuizData = null;
}

function showSparkNotification(count){
  const notif = document.createElement('div');
  notif.className = 'spark-notification';
  notif.innerHTML = `🌟 Your spark got ${count} reactions!`;
  document.body.appendChild(notif);
  setTimeout(()=>notif.remove(),4000);
}

// ===== SPARKS FEED =====
function filterSparks(topic){
  state.social.sparkFilter = topic;
  document.querySelectorAll('.spark-filter').forEach(b=>{
    b.classList.toggle('active-sf', b.dataset.topic===topic);
  });
  renderSparksFeed();
}

function renderSparksFeed(){
  const feed = document.getElementById('sparks-feed');
  if(!feed) return;
  const filter = state.social.sparkFilter;
  const items = filter==='all' ? state.social.sparks : state.social.sparks.filter(s=>s.topic===filter);
  if(!items.length){ feed.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:40px 0;font-size:0.85rem;">No sparks yet. Complete a quiz with 70%+ to post! ⚡</div>'; return; }
  feed.innerHTML = items.map(s=>`
    <div class="spark-card">
      <div class="spark-card-topic"><i class="fa-solid fa-bolt"></i> ${s.topic}</div>
      <div class="spark-card-text">${s.text}</div>
      <div class="spark-card-meta">
        <div class="spark-card-alias" style="display:flex; align-items:center; gap:8px;">
          <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--crazy-yellow),#ff6b00);color:#111;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.8rem;">${s.alias.charAt(0).toUpperCase()}</div>
          <span><i class="fa-solid fa-user-secret"></i> ${s.alias}</span>
        </div>
        <div class="spark-card-time">${s.time}</div>
      </div>
      <div class="spark-reactions-row">
        <button class="spark-react-btn ${s.myReaction==='fire'?'reacted-fire':''}" onclick="reactSpark(${s.id},'fire')">🔥 ${s.fire}</button>
        <button class="spark-react-btn ${s.myReaction==='bulb'?'reacted-bulb':''}" onclick="reactSpark(${s.id},'bulb')">💡 ${s.bulb}</button>
        <button class="spark-react-btn ${s.myReaction==='rocket'?'reacted-rocket':''}" onclick="reactSpark(${s.id},'rocket')">🚀 ${s.rocket}</button>
      </div>
    </div>
  `).join('');
}

function reactSpark(id, type){
  const s = state.social.sparks.find(x=>x.id===id);
  if(!s) return;
  if(s.myReaction===type){ s[type]--; s.myReaction=null; }
  else { if(s.myReaction) s[s.myReaction]--; s[type]++; s.myReaction=type; }
  renderSparksFeed();
}

// ==============================
//   FIRE VOTES
// ==============================
function filterFireBand(band){
  state.social.fireVotes.ageBandFilter = band;
  document.querySelectorAll('.fv-band').forEach(b=>{
    b.classList.toggle('active-band', b.dataset.band===band);
  });
  renderFireVotesFeed();
}

function renderFireVotesFeed(){
  const fv = state.social.fireVotes;
  const feed = document.getElementById('firevotes-feed');
  if(!feed) return;
  document.getElementById('fv-fires-left').textContent = fv.firesRemaining;
  const band = fv.ageBandFilter;
  const items = band==='all' ? fv.feed : fv.feed.filter(f=>f.band===band);
  feed.innerHTML = items.map(f=>`
    <div class="fv-card">
      <div class="fv-card-source ${f.source==='dilemma'?'fv-source-dilemma':'fv-source-spark'}">
        <i class="fa-solid fa-${f.source==='dilemma'?'scale-balanced':'bolt'}"></i> ${f.source==='dilemma'?'Daily Dilemma':'Post-quiz Spark'} · ${f.topic}
      </div>
      <div class="fv-card-text">${f.text}</div>
      <div class="fv-card-meta">
        <span>${f.alias}</span><span class="fv-dot"></span><span>Age ${f.age}</span><span class="fv-dot"></span>
        <span>🔥 ${f.fireScore}</span><span class="fv-dot"></span><span>👍 ${f.agreeScore}</span><span class="fv-dot"></span><span>👎 ${f.disagreeCount}</span>
      </div>
      <div class="fv-vote-row">
        <button class="fv-vote-btn fv-btn-fire ${f.myVote==='fire'?'voted':''} ${fv.firesRemaining<=0&&f.myVote!=='fire'?'exhausted':''}" onclick="castFireVote(${f.id},'fire')">🔥 Fire</button>
        <button class="fv-vote-btn fv-btn-agree ${f.myVote==='agree'?'voted':''}" onclick="castFireVote(${f.id},'agree')">👍 Agree</button>
        <button class="fv-vote-btn fv-btn-disagree ${f.myVote==='disagree'?'voted':''}" onclick="castFireVote(${f.id},'disagree')">👎 Disagree</button>
      </div>
    </div>
  `).join('');
}

function castFireVote(id, type){
  const fv = state.social.fireVotes;
  const item = fv.feed.find(f=>f.id===id);
  if(!item) return;
  if(type==='fire' && fv.firesRemaining<=0 && item.myVote!=='fire'){
    showToast('🔥 No fires left this week — choose wisely next week!'); return;
  }
  // Undo previous vote
  if(item.myVote){
    if(item.myVote==='fire'){ item.fireScore-=3; fv.firesRemaining++; }
    else if(item.myVote==='agree') item.agreeScore--;
    else if(item.myVote==='disagree') item.disagreeCount--;
  }
  // Apply new vote (toggle off if same)
  if(item.myVote===type){ item.myVote=null; }
  else {
    item.myVote=type;
    if(type==='fire'){ item.fireScore+=3; fv.firesRemaining--; state.user.csiScore+=1; }
    else if(type==='agree'){ item.agreeScore++; }
    else if(type==='disagree'){ item.disagreeCount++; }
  }
  renderFireVotesFeed();
}

// ===== HOOK INTO QUIZ END =====
const _socialOrigEndQuiz = endQuiz;
endQuiz = function(){
  const {correct, questions, score} = state.quiz;
  const cat = questions[0]?.cat || 'Science';
  _socialOrigEndQuiz();
  // Show spark prompt after 2.5s delay if score >= 70%
  setTimeout(()=>{ showSparkPrompt(correct, questions.length, score, cat); }, 2500);
  
  // Increment city progress based on correct answers
  incrementCityProgress(correct * 3);
};

// ===== HOOK INTO MINI GAME END =====
const _socialOrigEndMiniGame = endMiniGame;
endMiniGame = function(){
  _socialOrigEndMiniGame();
  incrementCityProgress(mgState.score >= 50 ? 10 : 5);
};

// ===== USER CREATED SPARKS & FIRE VOTES =====
function postUserSpark() {
  const text = document.getElementById('new-spark-input').value.trim();
  const topic = document.getElementById('new-spark-topic').value;
  if(!text){ showToast('Write something first!'); return; }
  if(!isSafe(text)){ showToast('⚠️ Please keep it respectful!'); return; }
  
  const spark = {
    id: Date.now(), alias: getUserAlias(),
    topic: topic, text,
    fire:0, bulb:0, rocket:0, time:'Just now', myReaction:null
  };
  state.social.sparks.unshift(spark);
  state.user.csiScore += 10;
  state.user.zinoCoins += 5;
  updateAllZinos();
  
  document.getElementById('new-spark-input').value = '';
  showToast('🌟 Spark posted! +10 XP +5 🪙');
  
  renderSparksFeed();
}

function postUserFireVote() {
  const text = document.getElementById('new-fv-input').value.trim();
  let topic = document.getElementById('new-fv-topic').value.trim();
  if(!text){ showToast('Write an opinion first!'); return; }
  if(!topic){ topic = 'General'; }
  if(!isSafe(text)){ showToast('⚠️ Please keep it respectful!'); return; }
  
  const fv = {
    id: Date.now(), source: 'spark', topic: topic, text: text,
    alias: getUserAlias(), age: parseInt(getUserAgeBand().split('-')[0]) || 14, 
    band: getUserAgeBand(), fireScore:0, agreeScore:0, disagreeCount:0, myVote:null
  };
  state.social.fireVotes.feed.unshift(fv);
  state.user.csiScore += 10;
  state.user.zinoCoins += 5;
  updateAllZinos();
  
  document.getElementById('new-fv-input').value = '';
  document.getElementById('new-fv-topic').value = '';
  showToast('🔥 Fire Vote created! +10 XP +5 🪙');
  
  renderFireVotesFeed();
}

// ===== DAILY FACTS DECK DATA =====
const dailyFacts = [
  { cat: "Space", text: "One day on Venus is longer than one year on Venus. Venus rotates extremely slowly!", hypePct: 78, action: null },
  { cat: "Biology", text: "Bananas are berries, but strawberries aren't! In botany, a berry must have seeds inside.", hypePct: 82, action: null },
  { cat: "Ocean", text: "Over 80% of the Earth's oceans are completely unmapped and unexplored.", hypePct: 91, action: null },
  { cat: "Physics", text: "Time goes faster at the top of a mountain than at sea level due to gravitational time dilation.", hypePct: 65, action: null },
  { cat: "Nature", text: "Honey never spoils. You could theoretically eat 3,000-year-old Egyptian tomb honey!", hypePct: 88, action: null },
  { cat: "Technology", text: "The first computer bug was a real moth trapped in a relay of the Harvard Mark II computer in 1947.", hypePct: 73, action: null }
];

// ===== GAME STATE PERSISTENCE =====
function saveGameState() {
  const todayStr = new Date().toDateString();
  const gameState = {
    // Game progress
    zinoCoins: state.user.zinoCoins,
    csiScore: state.user.csiScore,
    streak: state.user.streak,
    shields: state.user.shields || 0,
    citiesUnlocked: state.user.citiesUnlocked || 3,
    cityProgress: state.user.cityProgress || 30,
    factsCompleted: state.social.facts ? state.social.facts.completed : false,
    factsCompletedDate: state.social.facts && state.social.facts.completed ? todayStr : "",
    factsDeck: state.social.facts ? state.social.facts.deck : null,
    // User profile — persisted for auto-login
    userName: state.user.name,
    userEmail: state.user.email,
    userCity: state.user.city,
    userDob: state.user.dob,
    userMobile: state.user.mobile
  };
  localStorage.setItem('kidzinos_game_state', JSON.stringify(gameState));
}

function loadGameState() {
  const saved = localStorage.getItem('kidzinos_game_state');
  if (saved) {
    const gameState = JSON.parse(saved);
    state.user.zinoCoins = gameState.zinoCoins;
    state.user.csiScore = gameState.csiScore;
    state.user.streak = gameState.streak;
    state.user.shields = gameState.shields || 0;
    state.user.citiesUnlocked = gameState.citiesUnlocked || 3;
    state.user.cityProgress = gameState.cityProgress || 30;

    // Restore user profile
    if (gameState.userName) state.user.name = gameState.userName;
    if (gameState.userEmail) state.user.email = gameState.userEmail;
    if (gameState.userCity) state.user.city = gameState.userCity;
    if (gameState.userDob) state.user.dob = gameState.userDob;
    if (gameState.userMobile) state.user.mobile = gameState.userMobile;
    
    // Check if the facts were completed today
    const todayStr = new Date().toDateString();
    if (gameState.factsCompletedDate === todayStr) {
      state.social.facts = {
        completed: gameState.factsCompleted,
        currentIndex: 0,
        deck: gameState.factsDeck || JSON.parse(JSON.stringify(dailyFacts))
      };
      state.social.factsCompletedDate = todayStr;
    } else {
      state.social.facts = {
        completed: false,
        currentIndex: 0,
        deck: JSON.parse(JSON.stringify(dailyFacts))
      };
      state.social.factsCompletedDate = "";
    }
  } else {
    // Defaults
    state.user.shields = 1;
    state.user.citiesUnlocked = 3;
    state.user.cityProgress = 30;
    state.social.facts = {
      completed: false,
      currentIndex: 0,
      deck: JSON.parse(JSON.stringify(dailyFacts))
    };
  }
}

// ===== STREAK FACTS OF THE DAY =====
function openStreakFacts() {
  if (state.social.facts && state.social.facts.completed) {
    showToast("Daily Facts already completed! Come back tomorrow! 🔥");
    return;
  }
  
  if (!state.social.facts) {
    state.social.facts = {
      completed: false,
      currentIndex: 0,
      deck: JSON.parse(JSON.stringify(dailyFacts))
    };
  }
  
  state.social.facts.currentIndex = 0;
  document.getElementById('facts-modal').classList.remove('hidden');
  renderFactCard();
}

function renderFactCard() {
  const fState = state.social.facts;
  const fact = fState.deck[fState.currentIndex];
  
  const catEl = document.getElementById('fact-card-category');
  const textEl = document.getElementById('fact-card-text');
  const progEl = document.getElementById('facts-deck-progress');
  
  if (catEl) catEl.textContent = fact.cat;
  if (textEl) textEl.textContent = fact.text;
  if (progEl) progEl.textContent = `${fState.currentIndex + 1}/6`;
}

function handleFactAction(action) {
  const fState = state.social.facts;
  
  // Record action ('hype' or 'skip')
  fState.deck[fState.currentIndex].action = action;
  if (action === 'hype') {
    fState.deck[fState.currentIndex].hypePct = Math.min(100, (fState.deck[fState.currentIndex].hypePct || 70) + 1);
  }
  
  fState.currentIndex++;
  
  if (fState.currentIndex < 6) {
    // Slide transition animation
    const slide = document.getElementById('current-fact-card');
    if (slide) {
      slide.style.animation = 'none';
      requestAnimationFrame(() => {
        slide.style.animation = 'slideIn 0.3s ease';
      });
    }
    renderFactCard();
  } else {
    // Completed facts deck!
    document.getElementById('facts-modal').classList.add('hidden');
    fState.completed = true;
    
    state.user.streak = (state.user.streak || 5) + 1;
    state.user.zinoCoins += 15;
    updateAllZinos();
    
    let earnedShield = false;
    if (state.user.streak % 7 === 0) {
      state.user.shields = (state.user.shields || 0) + 1;
      earnedShield = true;
    }
    
    if (earnedShield) {
      showToast(`🛡️ 7-Day Streak Shield Earned! Shields: ${state.user.shields}`);
    } else {
      showToast(`🔥 Streak maintained! +15 Zino Coins!`);
    }
    
    updateHomeStats();
    saveGameState();
  }
}

// ===== RENDER FACTS ANALYTICS LIST =====
function renderFactsStats() {
  const container = document.getElementById('facts-stats-container');
  if (!container) return;
  
  if (!state.social.facts) {
    state.social.facts = {
      completed: false,
      currentIndex: 0,
      deck: JSON.parse(JSON.stringify(dailyFacts))
    };
  }
  
  const deck = state.social.facts.deck || dailyFacts;
  
  container.innerHTML = deck.map((fact, idx) => {
    let actionBadge = `<span style="font-size:0.7rem; color:var(--st-muted); background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:99px;">Locked</span>`;
    
    if (state.social.facts.completed || idx < state.social.facts.currentIndex) {
      if (fact.action === 'hype') {
        actionBadge = `<span style="font-size:0.7rem; color:#ffb800; background:rgba(255,184,0,0.12); padding:2px 8px; border-radius:99px; font-weight:700;">⚡ Hyped</span>`;
      } else if (fact.action === 'skip') {
        actionBadge = `<span style="font-size:0.7rem; color:#ef4444; background:rgba(239,68,68,0.12); padding:2px 8px; border-radius:99px; font-weight:700;">✕ Skipped</span>`;
      }
    }
    
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:10px; padding:10px 12px;">
        <div style="flex:1; min-width:0; margin-right:12px;">
          <div style="font-size:0.8rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:2px;">
            <span>Fact ${idx+1}: ${fact.cat}</span>
            ${actionBadge}
          </div>
          <div style="font-size:0.72rem; color:var(--st-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${fact.text}
          </div>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div style="font-family:var(--font-display); font-size:0.95rem; font-weight:800; color:var(--st-yellow);">${fact.hypePct || 70}%</div>
          <div style="font-size:0.65rem; color:var(--st-muted); font-weight:600; text-transform:uppercase;">Hype</div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== HOME STATS & RIVALS WIDGETS =====
function updateHomeStats() {
  // Update streak count
  const streakCount = document.getElementById('shh-streak-count');
  if (streakCount) streakCount.textContent = state.user.streak || 5;
  
  const headerStreak = document.getElementById('home-streak-count');
  if (headerStreak) headerStreak.textContent = state.user.streak || 5;

  // Update Streak Level Title
  const streakLevelTitle = document.getElementById('streak-level-title');
  if (streakLevelTitle) {
    const s = state.user.streak || 5;
    const titles = ['Pehla Kadam! 🌱','Aur Aage Badh! ⚡','Teen Din Ka Toofan! 🌪️','Char Din Ka Cheetah! 🐆','5 Din Ka King! 👑','6 Din Ka Legend! 🔥','7 Din Ka God! 🏆'];
    streakLevelTitle.textContent = titles[Math.min(s-1, titles.length-1)];
  }

  // Update Streak Calendar Dots
  const homeStreakCal = document.getElementById('home-streak-calendar');
  if (homeStreakCal) {
    homeStreakCal.innerHTML = '';
    const s = state.user.streak || 5;
    for (let i = 1; i <= 7; i++) {
      const d = document.createElement('div');
      d.className = 'sc-day' + (i < s ? ' done' : i === s ? ' today' : '');
      d.textContent = i <= s ? '🔥' : i;
      homeStreakCal.appendChild(d);
    }
  }
  
  // Update facts status
  const statusEl = document.getElementById('shh-status');
  if (statusEl) {
    const isCompleted = state.social.facts && state.social.facts.completed;
    statusEl.textContent = isCompleted ? "Completed ✅" : "Fact Deck Pending ⚡";
    statusEl.style.background = isCompleted ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 192, 0, 0.1)";
    statusEl.style.color = isCompleted ? "#22c55e" : "var(--st-yellow)";
  }
  
  const footerText = document.getElementById('streak-card-footer-text');
  if (footerText) {
    const isCompleted = state.social.facts && state.social.facts.completed;
    footerText.textContent = isCompleted ? "Daily facts completed! Come back tomorrow for new facts." : "Tap to review 6 Daily Facts and boost your streak!";
  }
  
  // Update shields
  const shieldVal = document.getElementById('hsc-shields-val');
  if (shieldVal) shieldVal.textContent = state.user.shields || 0;
  
  // Update Crazy Rank
  const xp = state.user.csiScore || 7840;
  const levels = [0,500,1200,2200,3500,5200,7200,9500,12500,16000,20000];
  let lvl = 1;
  for (let i = 0; i < levels.length; i++) { if (xp >= levels[i]) lvl = i + 1; }
  const levelNames = ['Rookie','Newcomer','Challenger','Fighter','Warrior','Beast','Legend','Crazy Star','Unstoppable','GOD MODE'];
  const lvlName = levelNames[Math.min(lvl - 1, levelNames.length - 1)];
  
  const rankNameEl = document.getElementById('home-rank-name');
  if (rankNameEl) rankNameEl.textContent = lvlName;
  const rankLevelEl = document.getElementById('home-rank-level');
  if (rankLevelEl) rankLevelEl.textContent = lvl;
  const rankCsiEl = document.getElementById('home-rank-csi');
  if (rankCsiEl) rankCsiEl.textContent = xp.toLocaleString();
  
  // Render Fact stats
  renderFactsStats();
  
  // Update rival scores dynamically
  const myRivalScore = document.getElementById('rival-my-score');
  if (myRivalScore) myRivalScore.textContent = xp.toLocaleString();
  
  const oppScoreEl = document.getElementById('rival-opp-score');
  if (oppScoreEl) oppScoreEl.textContent = (xp + 70).toLocaleString();
}

// ===== CITIES UNLOCKED PROGRESS BAR =====
function updateCitiesUI() {
  const citiesList = ["Mumbai", "Pune", "Bangalore", "Hyderabad", "Delhi", "Kolkata", "Chennai", "Ahmedabad", "Jaipur", "Lucknow"];
  const unlockedCount = state.user.citiesUnlocked || 3;
  const progress = state.user.cityProgress || 30;
  
  const countEl = document.getElementById('cities-unlocked-count');
  if (countEl) countEl.textContent = `${unlockedCount}/10 Cities`;
  
  const fillEl = document.getElementById('cities-progress-fill');
  if (fillEl) fillEl.style.width = `${progress}%`;
  
  const currentCity = citiesList[unlockedCount - 1] || "Mumbai";
  const nextCity = citiesList[unlockedCount] || "Victory Road";
  
  const labelEl = document.querySelector('.cities-current-label');
  if (labelEl) {
    labelEl.innerHTML = `Current: <strong>${currentCity}</strong>. Complete tasks to reach <strong>${nextCity}</strong>!`;
  }
  
  const nodesRow = document.querySelector('.cities-nodes-row');
  if (nodesRow) {
    nodesRow.innerHTML = '';
    let startIdx = Math.max(0, unlockedCount - 3);
    if (startIdx + 5 > citiesList.length) startIdx = citiesList.length - 5;
    for (let i = 0; i < 5; i++) {
      const idx = startIdx + i;
      const name = citiesList[idx];
      const node = document.createElement('div');
      const isUnlocked = idx < unlockedCount;
      node.className = 'city-node' + (isUnlocked ? ' active' : '');
      node.setAttribute('data-name', name);
      node.textContent = isUnlocked ? '📌' : '🔒';
      nodesRow.appendChild(node);
    }
  }

  // Handle Lock Card / Unlocked Feature Showcase Rendering
  const container = document.getElementById('city-interaction-card');
  if (container) {
    const currIdx = unlockedCount - 1;
    const isClaimed = localStorage.getItem('kidzinos_city_bonus_claimed_' + currIdx) === 'true';

    // Show showcase card if current city's bonus is unclaimed (except for index 0 / Mumbai starter city)
    if (currIdx > 0 && !isClaimed) {
      container.innerHTML = `
        <div class="city-feature-box">
          <div class="cfb-header">
            <div class="cfb-city-name"><i class="fa-solid fa-city"></i> ${currentCity} Unlocked! 🎉</div>
            <span class="cfb-badge">Active City</span>
          </div>
          <div class="cfb-features-list">
            <div class="cfb-feature-item">
              <div class="cfi-icon purple"><i class="fa-solid fa-trophy"></i></div>
              <div class="cfi-body">
                <div class="cfi-title">${currentCity} Clash Event</div>
                <div class="cfi-desc">Play Battles to get 2x CSI XP in ${currentCity}!</div>
              </div>
            </div>
            <div class="cfb-feature-item">
              <div class="cfi-icon green"><i class="fa-solid fa-bullseye"></i></div>
              <div class="cfi-body">
                <div class="cfi-title">${currentCity} Mission</div>
                <div class="cfi-desc">Complete 2 daily facts deck reviews inside ${currentCity}.</div>
              </div>
            </div>
            <div class="cfb-feature-item" id="city-bonus-claim-item">
              <div class="cfi-icon gold"><i class="fa-solid fa-coins"></i></div>
              <div class="cfi-body">
                <div class="cfi-title">${currentCity} Unlock Bonus</div>
                <div class="cfi-desc">Claim your one-time 50 Zino Coins reward!</div>
              </div>
              <button class="cfb-claim-btn" onclick="claimCityBonus()">Claim</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Show Locked next city card with swipe slider
      const label = progress >= 100 ? "Swipe to Claim (Free)" : "Swipe to Unlock (50 🪙)";
      container.innerHTML = `
        <div class="city-lock-box">
          <div class="clb-header">
            <div class="clb-lock-icon"><i class="fa-solid fa-lock"></i></div>
            <div class="clb-title">Next Destination: ${nextCity}</div>
          </div>
          <div class="clb-sub">Unlock ${nextCity} to access exclusive tournaments, city-specific missions, and claim a 50 🪙 Zino Bonus!</div>
          <div class="clb-progress-text">Task Progress: <span class="clb-prog-val">${progress}%</span></div>
          
          <!-- Swipe Track -->
          <div class="swipe-track" id="city-swipe-track">
            <div class="swipe-progress-fill" id="city-swipe-fill"></div>
            <div class="swipe-thumb" id="city-swipe-thumb"><i class="fa-solid fa-chevron-right"></i></div>
            <span class="swipe-label" id="city-swipe-label">${label}</span>
          </div>
        </div>
      `;
      // Init dragging listeners
      setTimeout(() => initSwipeToUnlock(), 50);
    }
  }
}

function initSwipeToUnlock() {
  const thumb = document.getElementById('city-swipe-thumb');
  const track = document.getElementById('city-swipe-track');
  const fill = document.getElementById('city-swipe-fill');
  const label = document.getElementById('city-swipe-label');
  
  if (!thumb || !track) return;
  
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  const maxDrag = track.clientWidth - thumb.clientWidth - 4;
  
  function getEventX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }
  
  function onStart(e) {
    isDragging = true;
    startX = getEventX(e);
    thumb.style.transition = 'none';
    if (fill) fill.style.transition = 'none';
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    e.preventDefault();
  }
  
  function onMove(e) {
    if (!isDragging) return;
    const x = getEventX(e) - startX;
    currentX = Math.max(0, Math.min(x, maxDrag));
    
    thumb.style.left = `${currentX + 2}px`;
    if (fill) fill.style.width = `${currentX + 22}px`;
    
    const pct = currentX / maxDrag;
    if (label) label.style.opacity = 1 - pct * 1.5;
  }
  
  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchend', onEnd);
    
    const pct = currentX / maxDrag;
    if (pct >= 0.9) {
      handleCityUnlockSwipe();
    } else {
      currentX = 0;
      thumb.style.transition = 'left 0.3s ease';
      thumb.style.left = '2px';
      if (fill) {
        fill.style.transition = 'width 0.3s ease';
        fill.style.width = '0px';
      }
      if (label) {
        label.style.transition = 'opacity 0.3s ease';
        label.style.opacity = '1';
      }
    }
  }
  
  thumb.addEventListener('mousedown', onStart);
  thumb.addEventListener('touchstart', onStart);
}

function handleCityUnlockSwipe() {
  const citiesList = ["Mumbai", "Pune", "Bangalore", "Hyderabad", "Delhi", "Kolkata", "Chennai", "Ahmedabad", "Jaipur", "Lucknow"];
  const unlockedCount = state.user.citiesUnlocked || 3;
  const progress = state.user.cityProgress || 30;
  
  if (progress >= 100) {
    state.user.cityProgress = 0;
    state.user.citiesUnlocked = unlockedCount + 1;
    saveGameState();
    updateAllZinos();
    
    const newCity = citiesList[state.user.citiesUnlocked - 1] || "Secret City";
    showToast(`🎉 City Unlocked! Welcome to ${newCity}!`);
    promptShareToUnlimitedZone("general", { text: `🚀 Just unlocked ${newCity} in City Progress! CSI score: ${(state.user.csiScore || 7840).toLocaleString()}!` });
    updateCitiesUI();
  } else {
    if (state.user.zinoCoins >= 50) {
      state.user.zinoCoins -= 50;
      state.user.cityProgress = 0;
      state.user.citiesUnlocked = unlockedCount + 1;
      saveGameState();
      updateAllZinos();
      
      const newCity = citiesList[state.user.citiesUnlocked - 1] || "Secret City";
      showToast(`🎉 City Unlocked! Paid 50 🪙 to reach ${newCity}!`);
      promptShareToUnlimitedZone("general", { text: `🚀 Just unlocked ${newCity} by instant Zino Coin skip! CSI score: ${(state.user.csiScore || 7840).toLocaleString()}!` });
      updateCitiesUI();
    } else {
      showToast(`❌ Insufficient Zino Coins! Need 50 🪙 to skip progress.`);
      const thumb = document.getElementById('city-swipe-thumb');
      const fill = document.getElementById('city-swipe-fill');
      const label = document.getElementById('city-swipe-label');
      if (thumb) {
        thumb.style.transition = 'left 0.3s ease';
        thumb.style.left = '2px';
      }
      if (fill) {
        fill.style.transition = 'width 0.3s ease';
        fill.style.width = '0px';
      }
      if (label) {
        label.style.transition = 'opacity 0.3s ease';
        label.style.opacity = '1';
      }
    }
  }
}

function claimCityBonus() {
  const unlockedCount = state.user.citiesUnlocked || 3;
  const currIdx = unlockedCount - 1;
  
  localStorage.setItem('kidzinos_city_bonus_claimed_' + currIdx, 'true');
  state.user.zinoCoins += 50;
  saveGameState();
  updateAllZinos();
  
  showToast(`🪙 +50 City Unlock Bonus claimed!`);
  updateCitiesUI();
}

function incrementCityProgress(amount) {
  state.user.cityProgress = Math.min(100, (state.user.cityProgress || 30) + amount);
  updateCitiesUI();
  saveGameState();
}

// ===== UNLIMITED ZONE FEED LOGIC =====
let uzPosts = [];

const defaultUzPosts = [
  { id: 1, type: 'city', user: 'ZinoMaster', time: '2m ago', data: { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80', fact: 'Tokyo has the busiest intersection in the world!' }, reactions: { hype: 120, buzz: 45, love: 300 } },
  { id: 2, type: 'badge', user: 'ScienceNerd', time: '15m ago', data: { badge: 'Space Explorer', icon: '🚀', text: 'Unlocked a new badge!' }, reactions: { hype: 12, buzz: 5, love: 30 } },
  { id: 3, type: 'clash', user: 'MathWhiz', time: '1h ago', data: { result: 'Victory!', scoreMe: 40, scoreOpp: 20 }, reactions: { hype: 89, buzz: 12, love: 4 } },
  { id: 4, type: 'streak', user: 'DailyLearner', time: '3h ago', data: { days: 7, text: '7 Day Streak! 🔥' }, reactions: { hype: 200, buzz: 50, love: 150 } },
  { id: 5, type: 'shield', user: 'DefenderX', time: '4h ago', data: { text: 'Activated Streak Shield! 🛡️' }, reactions: { hype: 55, buzz: 20, love: 10 } },
  { id: 6, type: 'offer', user: 'KidzinosSystem', time: '5h ago', data: { title: 'Flash Zino Offer! 💰', text: 'Complete a math quiz now to earn 3x Zino Coins for the next hour!' }, reactions: { hype: 900, buzz: 300, love: 400 } },
  { id: 7, type: 'city', user: 'Globetrotter', time: '6h ago', data: { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80', fact: 'The Eiffel Tower can be 15 cm taller during the summer!' }, reactions: { hype: 340, buzz: 110, love: 600 } },
  { id: 8, type: 'result', user: 'ProGamer', time: '8h ago', data: { title: 'Science Contest', rank: '1st Place 🏆', text: 'Scored 10,000 pts in the weekly contest!' }, reactions: { hype: 500, buzz: 200, love: 800 } }
];

function initUnlimitedZone() {
  const container = document.getElementById('uz-feed-container');
  if (!container) return;
  
  if (uzPosts.length === 0) {
    uzPosts = [...defaultUzPosts];
  }
  
  container.innerHTML = '';
  uzPosts.forEach(post => {
    container.appendChild(createUzPostElement(post));
  });
}

function createUzPostElement(post) {
  const div = document.createElement('div');
  div.className = 'uz-post';
  
  let contentHtml = '';
  if (post.type === 'city') {
    contentHtml = `
      <div class="uz-post-inner uz-post-city">
        <img src="${post.data.image}" alt="${post.data.name}" />
        <div class="uz-post-city-info">
          <div class="uz-post-header" style="margin-bottom:8px;">
            <div class="uz-post-avatar">${post.user[0]}</div>
            <div class="uz-post-user">
              <div class="uz-post-user-name">${post.user}</div>
              <div class="uz-post-user-time">Unlocked ${post.data.name} • ${post.time}</div>
            </div>
          </div>
          <p style="color:#fff; font-size:0.9rem; margin:0; text-align:left;">${post.data.fact}</p>
        </div>
      </div>
    `;
  } else {
    let innerContent = '';
    if (post.type === 'badge') {
      innerContent = `<div style="font-size:3rem; margin-bottom:10px;">${post.data.icon}</div><h3 style="color:#fff; margin:0;">${post.data.badge}</h3><p style="color:var(--st-muted);">${post.data.text}</p>`;
    } else if (post.type === 'clash') {
      innerContent = `<h3 style="color:#fff; margin:0 0 10px 0;">⚔️ Clash ${post.data.result}</h3><div style="font-size:1.5rem; color:#a855f7; font-weight:bold;">${post.data.scoreMe} <span style="color:#fff; font-size:1rem;">vs</span> <span style="color:#ef4444;">${post.data.scoreOpp}</span></div>`;
    } else if (post.type === 'streak') {
      innerContent = `<div style="font-size:3rem; margin-bottom:10px;">🔥</div><h3 style="color:#fff; margin:0;">${post.data.days} Day Streak!</h3>`;
    } else if (post.type === 'tag') {
      innerContent = `<div style="padding:10px 20px; background:linear-gradient(135deg, #FFD700, #FFA500); border-radius:20px; color:#000; font-weight:bold; display:inline-block; margin-bottom:10px;">${post.data.tag}</div><h3 style="color:#fff; margin:0;">${post.data.text}</h3>`;
    } else {
      innerContent = `<p style="color:#fff;">${post.data.text || post.data.title || 'Shared something cool!'}</p>`;
    }
    
    contentHtml = `
      <div class="uz-post-inner">
        <div class="uz-post-header">
          <div class="uz-post-avatar">${post.user[0]}</div>
          <div class="uz-post-user">
            <div class="uz-post-user-name">${post.user}</div>
            <div class="uz-post-user-time">${post.time}</div>
          </div>
        </div>
        ${innerContent}
      </div>
    `;
  }
  
  // Add Reactions below the post inner container
  const userId = 'uz_' + post.user.toLowerCase().replace(/\s/g,'_');
  const isSystemPost = post.user === 'KidzinosSystem' || post.user === 'You';
  const circleRowHtml = isSystemPost ? '' : `
    <div class="uz-circle-row">
      <div class="uz-circle-meta">
        <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;color:#fff;">${post.user.charAt(0)}</div>
        <span>${post.user}</span>
      </div>
      <button class="uz-circle-mini-btn" id="uz-circle-${post.id}" data-circle-user="${userId}"
        onclick="handleUzCircle(this, '${userId}', '${post.user.replace(/'/g,"\\'")}')">
        <i class="fa-solid fa-circle-dot"></i> Circle
      </button>
    </div>`;

  div.innerHTML = `
    ${contentHtml}
    <div class="uz-reactions">
      <button class="uz-reaction-btn" onclick="toggleReaction(this, 'hype', ${post.id})">
        <div class="uz-reaction-icon">⚡</div>
        <div class="uz-reaction-count">${post.reactions.hype}</div>
      </button>
      <button class="uz-reaction-btn" onclick="toggleReaction(this, 'buzz', ${post.id})">
        <div class="uz-reaction-icon">📣</div>
        <div class="uz-reaction-count">${post.reactions.buzz}</div>
      </button>
      <button class="uz-reaction-btn" onclick="toggleReaction(this, 'love', ${post.id})">
        <div class="uz-reaction-icon">❤️</div>
        <div class="uz-reaction-count">${post.reactions.love}</div>
      </button>
    </div>
    ${circleRowHtml}
  `;
  
  return div;
}

function toggleReaction(btn, type, postId) {
  const isReacted = btn.classList.contains('reacted-' + type);
  const countEl = btn.querySelector('.uz-reaction-count');
  let currentCount = parseInt(countEl.innerText);
  
  if (isReacted) {
    btn.classList.remove('reacted-' + type);
    countEl.innerText = currentCount - 1;
  } else {
    btn.classList.add('reacted-' + type);
    countEl.innerText = currentCount + 1;
  }
}

function promptShareToUnlimitedZone(type, data = null) {
  // Determine text and data based on state or passed params
  let postData = data;
  if (!postData) {
    if (type === 'clash') {
      const me = document.getElementById('br-score-me')?.innerText || '0';
      const opp = document.getElementById('br-score-opp')?.innerText || '0';
      postData = { result: 'Victory!', scoreMe: parseInt(me), scoreOpp: parseInt(opp) };
    } else {
      postData = { text: 'I just did something awesome on Kidzinos!' };
    }
  }
  
  const newPost = {
    id: Date.now(),
    type: type,
    user: 'You',
    time: 'Just now',
    data: postData,
    reactions: { hype: 0, buzz: 0, love: 0 }
  };
  
  uzPosts.unshift(newPost);
  initUnlimitedZone();
  if (typeof showToast === 'function') showToast('🎉 Posted to Unlimited Zone!');
}

window.promptShareToUnlimitedZone = promptShareToUnlimitedZone;
window.initUnlimitedZone = initUnlimitedZone;

// ===== TINDER-STYLE FACT ANALYSIS UI
// ========================================
let factSwipeState = {
  isExpanded: false,
  isDoneToday: false,
  currentIndex: 0,
  facts: [
    { id: 1, category: "Science", text: "Water can boil and freeze at the same time. It's called the 'triple point'." },
    { id: 2, category: "Space", text: "A day on Venus is longer than a year on Venus." },
    { id: 3, category: "History", text: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid." },
    { id: 4, category: "Biology", text: "Octopuses have three hearts." },
    { id: 5, category: "Physics", text: "If you travel at the speed of light, time stops." },
    { id: 6, category: "Earth", text: "There are more trees on Earth than stars in the Milky Way." }
  ],
  stats: []
};

function toggleFactAnalysis() {
  const container = document.getElementById('fact-analysis-container');
  const btn = document.getElementById('fact-toggle-btn');
  
  factSwipeState.isExpanded = !factSwipeState.isExpanded;
  
  if (factSwipeState.isExpanded) {
    container.style.display = 'block';
    btn.style.transform = 'rotate(180deg)';
    
    if (factSwipeState.isDoneToday) {
      document.getElementById('fact-swipe-view').style.display = 'none';
      const allDoneMsg = document.getElementById('fact-all-done-msg');
      if (allDoneMsg) allDoneMsg.style.display = 'none';
      
      document.getElementById('fact-grid-container').style.display = 'flex';
      renderFactGrid();
    } else {
      document.getElementById('fact-swipe-view').style.display = 'flex';
      document.getElementById('fact-grid-container').style.display = 'none';
      if(factSwipeState.currentIndex === 0) renderSwipeCards();
    }
  } else {
    container.style.display = 'none';
    btn.style.transform = 'rotate(0deg)';
  }
}

function renderSwipeCards() {
  const container = document.getElementById('swipe-cards-container');
  container.innerHTML = '';
  
  // Render remaining cards, stacked
  for (let i = factSwipeState.facts.length - 1; i >= factSwipeState.currentIndex; i--) {
    const fact = factSwipeState.facts[i];
    const isTop = i === factSwipeState.currentIndex;
    const offset = (i - factSwipeState.currentIndex) * 8; // stack offset
    const scale = 1 - ((i - factSwipeState.currentIndex) * 0.05);
    
    const cardHTML = `
      <div id="swipe-card-${i}" class="swipe-card" style="z-index:${100 - i}; transform: translateY(${offset}px) scale(${scale});">
        <div class="swipe-card-category"><i class="fa-solid fa-tag"></i> ${fact.category}</div>
        <div class="swipe-card-content">"${fact.text}"</div>
      </div>
    `;
    container.innerHTML += cardHTML;
  }
}

function handleFactSwipe(direction) {
  if (factSwipeState.currentIndex >= factSwipeState.facts.length) return;
  
  const currentCard = document.getElementById(`swipe-card-${factSwipeState.currentIndex}`);
  if (!currentCard) return;
  
  // Apply animation
  currentCard.classList.add(direction === 'right' ? 'swipe-out-right' : 'swipe-out-left');
  
  // Save stat
  factSwipeState.stats.push({
    fact: factSwipeState.facts[factSwipeState.currentIndex],
    action: direction === 'right' ? 'Hyped' : 'Skipped'
  });
  
  factSwipeState.currentIndex++;
  
  setTimeout(() => {
    if (factSwipeState.currentIndex >= factSwipeState.facts.length) {
      // Done for the day
      factSwipeState.isDoneToday = true;
      document.getElementById('fact-analysis-status').innerText = 'Completed';
      
      // Update Streak
      state.user.streak++;
      updateHomeStats(); // Refreshes the streak UI
      
      // Show Animated All Done Message
      const swipeView = document.getElementById('fact-swipe-view');
      swipeView.innerHTML = `<div id="fact-all-done-msg" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
        <div style="font-size:4rem; color:#22c55e; margin-bottom:16px;"><i class="fa-solid fa-circle-check"></i></div>
        <h3 style="color:#fff; font-size:1.5rem; margin-bottom:8px;">You're all done for today!</h3>
        <p style="color:rgba(255,255,255,0.7); font-size:1rem;">Streak credited. Come back again tomorrow.</p>
      </div>`;
    } else {
      renderSwipeCards(); // re-render the stack
    }
  }, 400); // Wait for animation to finish
}

function renderFactGrid() {
  const grid = document.getElementById('fact-grid-view');
  grid.innerHTML = factSwipeState.stats.map((stat, i) => {
    // Generate a deterministic hype percentage
    const hash = stat.fact.text.length + i * 13;
    const isHyped = stat.action === 'Hyped';
    const hypePercent = isHyped ? 60 + (hash % 38) : 5 + (hash % 25);
    
    return `
    <div style="aspect-ratio: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; position: relative; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
      ${isHyped ? '<div style="position:absolute; top:-20px; right:-20px; width:60px; height:60px; background:radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 70%); border-radius:50%;"></div>' : ''}
      <div style="font-size:0.6rem; color:#00F2FE; font-weight:800; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:4px;"><i class="fa-solid fa-tag" style="margin-right:2px; opacity:0.8;"></i> ${stat.fact.category}</div>
      <div style="font-size:0.75rem; color:#fff; font-weight:500; line-height:1.4; flex:1; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden;">${stat.fact.text}</div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
        ${isHyped 
          ? '<span style="font-size:0.7rem; color:#00F2FE; font-weight:700;"><i class="fa-solid fa-rocket"></i> Hyped!</span>' 
          : '<span style="font-size:0.7rem; color:var(--st-muted); font-weight:700;"><i class="fa-solid fa-xmark"></i> Skipped</span>'}
        <span style="font-size:0.65rem; color:rgba(255,255,255,0.5); font-weight:600;"><i class="fa-solid fa-fire" style="color:#ff6600;"></i> ${hypePercent}%</span>
      </div>
    </div>
    `;
  }).join('');
}
