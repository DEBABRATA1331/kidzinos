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

// ===== COMMUNITY SCREEN INIT =====
const _socialOrigScreenEnter = onScreenEnter;
onScreenEnter = function(screenId){
  _socialOrigScreenEnter(screenId);
  if(screenId==='community'){
    if(!state.social.sparks.length) seedDemoData();
    document.getElementById('comm-xp').textContent = state.user.csiScore.toLocaleString();
    initDilemma();
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
  showToast('✨ Reasoning posted! +5 XP +3 🎈');
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
  showToast('🌟 Spark posted! +10 XP +5 🎈');
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
  showToast('🌟 Spark posted! +10 XP +5 🎈');
  
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
  showToast('🔥 Fire Vote created! +10 XP +5 🎈');
  
  renderFireVotesFeed();
}

// ===== INIT ON LOAD =====
document.addEventListener('DOMContentLoaded',()=>{ seedDemoData(); });
