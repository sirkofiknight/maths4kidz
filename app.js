

// ============================================================
// ACHIEVEMENTS SYSTEM
// ============================================================
const ACHIEVEMENTS = [
  {id:'first_star', name:'Rising Star', icon:'⭐', desc:'Earn your very first star!', goal:1},
  {id:'star_10', name:'Ten-tastic!', icon:'🔟', desc:'Collect 10 stars!', goal:10},
  {id:'star_50', name:'Maths pro', icon:'🎓', desc:'Collect 50 stars!', goal:50},
  {id:'star_100', name:'Legendary Genius', icon:'🏆', desc:'Reach 100 stars!', goal:100},
  {id:'speed_demon', name:'Speed Demon', icon:'⚡', desc:'Score 10/10 in Speed Quiz!', goal: 10, type:'speed'},
  {id:'perfect_sharing', name:'Master Sharer', icon:'🍎', desc:'Share apples perfectly!', goal: 5, type:'share'}
];
let earnedBadges = [];

function checkAchievements(type, val) {
  ACHIEVEMENTS.forEach(a => {
    if (earnedBadges.includes(a.id)) return;
    let earned = false;
    if (!a.type && type === 'stars' && stars >= a.goal) earned = true;
    if (a.type === type && val >= a.goal) earned = true;

    if (earned) {
      earnedBadges.push(a.id);
      showBadgePopup(a);
      saveData();
    }
  });
}

function showBadgePopup(a) {
  const overlay = document.getElementById('popupOverlay');
  document.getElementById('popEmoji').textContent = '🎖️';
  document.getElementById('popTitle').textContent = 'Badge Earned!';
  document.getElementById('popMsg').innerHTML = `
    <div style="padding:15px;background:var(--indigo-l);border-radius:20px;margin-bottom:10px;">
      <div style="font-size:3rem;margin-bottom:10px;">${a.icon}</div>
      <div style="font-weight:900;color:var(--indigo-d);font-size:1.2rem;">${a.name}</div>
      <div style="color:var(--indigo-d);font-size:0.9rem;">${a.desc}</div>
    </div>
  `;
  overlay.classList.add('show');
  launchConfetti();
}

// ============================================================
// DAILY CHALLENGE SYSTEM
// ============================================================
const CHALLENGES = [
  {text: "Earn 5 stars today!", goal: 5, type: 'stars'},
  {text: "Earn 10 stars today!", goal: 10, type: 'stars'},
  {text: "Solve 3 speed quiz questions!", goal: 3, type: 'speed'},
  {text: "Collect 20 stars for a big reward!", goal: 20, type: 'stars'}
];
let dailyProgress = 0, currentChallenge = null;

function initDailyChallenge() {
  const today = new Date().toDateString();
  const saved = localStorage.getItem('maths_daily_date');
  
  if (saved !== today) {
    const idx = Math.floor(Math.random() * CHALLENGES.length);
    currentChallenge = CHALLENGES[idx];
    dailyProgress = 0;
    localStorage.setItem('maths_daily_date', today);
    localStorage.setItem('maths_daily_idx', idx);
    localStorage.setItem('maths_daily_progress', 0);
    localStorage.setItem('maths_daily_done', 'false');
  } else {
    const idx = localStorage.getItem('maths_daily_idx');
    currentChallenge = CHALLENGES[idx];
    dailyProgress = parseInt(localStorage.getItem('maths_daily_progress')) || 0;
  }
  
  if (localStorage.getItem('maths_daily_done') === 'true') {
    document.getElementById('dailyChallenge').style.display = 'none';
  } else {
    updateChallengeUI();
  }
}

function updateChallengeUI() {
  const el = document.getElementById('dailyChallenge');
  if(!el) return;
  el.style.display = 'block';
  document.getElementById('challengeText').textContent = currentChallenge.text;
  document.getElementById('challengeStatus').textContent = `${dailyProgress} / ${currentChallenge.goal}`;
}

function progressChallenge(type, amt = 1) {
  if (localStorage.getItem('maths_daily_done') === 'true') return;
  if (currentChallenge.type === type) {
    dailyProgress += amt;
    localStorage.setItem('maths_daily_progress', dailyProgress);
    updateChallengeUI();
    if (dailyProgress >= currentChallenge.goal) {
      localStorage.setItem('maths_daily_done', 'true');
      addStar(5);
      document.getElementById('dailyChallenge').style.animation = 'fadeUp 0.5s reverse forwards';
      setTimeout(() => document.getElementById('dailyChallenge').style.display = 'none', 500);
    }
  }
}

// ============================================================
// SCRATCHPAD LOGIC
// ============================================================
let isDrawing = false, lastX = 0, lastY = 0, strokeColor = '#000';
function setupScratch() {
  const canvas = document.getElementById('scratchCanvas');
  const ctx = canvas.getContext('2d');
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height;
  };
  window.addEventListener('resize', resize); resize();

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  };

  const start = (e) => { isDrawing = true; [lastX, lastY] = getPos(e); };
  const draw = (e) => {
    if (!isDrawing) return;
    const [x, y] = getPos(e);
    ctx.beginPath(); ctx.strokeStyle = strokeColor; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
    [lastX, lastY] = [x, y];
  };
  const stop = () => isDrawing = false;

  canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start); canvas.addEventListener('touchmove', draw); canvas.addEventListener('touchend', stop);
}
function toggleScratch() {
  const overlay = document.getElementById('scratchOverlay');
  overlay.classList.toggle('show');
  if (overlay.classList.contains('show')) {
    setTimeout(setupScratch, 50);
  }
}
function clearScratch() {
  const canvas = document.getElementById('scratchCanvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}
function setStroke(c) { strokeColor = c; }

// ============================================================
// DATA
// ============================================================
const SECTIONS = [
  {id:0,label:'Counting',emoji:'🔢',color:'var(--blue)',activeClr:'#3B82F6'},
  {id:1,label:'Adding',emoji:'➕',color:'var(--green)',activeClr:'#22C55E'},
  {id:2,label:'Multiply',emoji:'✖️',color:'var(--purple)',activeClr:'#A855F7'},
  {id:3,label:'Shapes',emoji:'🔷',color:'var(--orange)',activeClr:'#F97316'},
  {id:4,label:'Time',emoji:'🕐',color:'var(--indigo)',activeClr:'#6366F1'},
  {id:5,label:'Fractions',emoji:'🍕',color:'var(--pink)',activeClr:'#EC4899'},
  {id:6,label:'Measuring',emoji:'📏',color:'var(--teal)',activeClr:'#06B6D4'},
  {id:7,label:'Patterns',emoji:'🔁',color:'var(--red)',activeClr:'#EF4444'},
  {id:8,label:'Money',emoji:'💰',color:'var(--yellow)',activeClr:'#F59E0B'},
  {id:9,label:'Speed!',emoji:'⚡',color:'var(--indigo)',activeClr:'#6366F1'},
  {id:10,label:'Division',emoji:'➗',color:'var(--teal)',activeClr:'#06B6D4'},
  {id:11,label:'Data',emoji:'📊',color:'var(--pink)',activeClr:'#EC4899'},
  {id:12,label:'Value',emoji:'🏗️',color:'var(--orange)',activeClr:'#F97316'},
  {id:13,label:'Compare',emoji:'⚖️',color:'var(--red)',activeClr:'#EF4444'},
];

const QUIZ_BANKS = [
  // 0 Counting
  [{q:'How many stars? ⭐⭐⭐⭐⭐',a:5,o:[3,5,7,4]},{q:'What comes after 9?',a:10,o:[8,10,11,12]},{q:'Zero means...?',a:'None!',o:['A lot!','None!','Ten!','Five!']},{q:'Which is EVEN?',a:4,o:[1,3,4,7]},{q:'Which is ODD?',a:7,o:[4,6,7,8]},{q:'Count: 🍎🍎🍎🍎🍎🍎🍎',a:7,o:[5,6,7,8]},{q:'What comes before 10?',a:9,o:[8,9,11,7]},{q:'How many legs does a cat have?',a:4,o:[2,4,6,8]},{q:'How many fingers on both hands?',a:10,o:[8,9,10,12]},{q:'100 is called what?',a:'Hundred',o:['Ten','Hundred','Thousand','Zero']}],
  // 1 Adding & Subtracting
  [{q:'3 + 4 = ?',a:7,o:[6,7,8,9]},{q:'5 + 5 = ?',a:10,o:[8,9,10,11]},{q:'8 – 3 = ?',a:5,o:[4,5,6,3]},{q:'6 + 7 = ?',a:13,o:[11,12,13,14]},{q:'10 – 4 = ?',a:6,o:[5,6,7,4]},{q:'9 + 3 = ?',a:12,o:[10,11,12,13]},{q:'15 – 6 = ?',a:9,o:[7,8,9,10]},{q:'7 + 8 = ?',a:15,o:[13,14,15,16]},{q:'20 – 7 = ?',a:13,o:[11,12,13,14]},{q:'4 + 4 + 4 = ?',a:12,o:[8,10,12,14]}],
  // 2 Multiplication
  [{q:'2 × 3 = ?',a:6,o:[4,5,6,8]},{q:'5 × 4 = ?',a:20,o:[16,18,20,25]},{q:'3 × 3 = ?',a:9,o:[6,9,12,15]},{q:'10 × 5 = ?',a:50,o:[40,45,50,55]},{q:'2 × 8 = ?',a:16,o:[14,15,16,18]},{q:'4 × 4 = ?',a:16,o:[12,14,16,20]},{q:'5 × 5 = ?',a:25,o:[20,22,25,30]},{q:'6 × 3 = ?',a:18,o:[15,16,18,21]},{q:'Any number × 0 = ?',a:0,o:[0,1,5,10]},{q:'7 × 2 = ?',a:14,o:[12,13,14,16]}],
  // 3 Shapes
  [{q:'How many sides does a triangle have?',a:3,o:[2,3,4,5]},{q:'A circle has how many corners?',a:0,o:[0,1,2,4]},{q:'A square has how many equal sides?',a:4,o:[3,4,5,6]},{q:'Which shape has 6 sides?',a:'Hexagon',o:['Triangle','Square','Pentagon','Hexagon']},{q:'A ball is called a...?',a:'Sphere',o:['Cube','Cylinder','Sphere','Cone']},{q:'A dice is called a...?',a:'Cube',o:['Cube','Sphere','Pyramid','Cylinder']},{q:'Pentagon has how many sides?',a:5,o:[4,5,6,7]},{q:'A rectangle has how many sides?',a:4,o:[3,4,5,6]},{q:'Which shape has no sides?',a:'Circle',o:['Square','Triangle','Circle','Pentagon']},{q:'3D shapes have...?',a:'Depth',o:['Sides','Depth','Nothing','Lines']}],
  // 4 Time
  [{q:'How many hours in a day?',a:24,o:[12,24,48,60]},{q:'How many minutes in 1 hour?',a:60,o:[30,45,60,100]},{q:'How many days in a week?',a:7,o:[5,6,7,10]},{q:'How many months in a year?',a:12,o:[10,11,12,13]},{q:'What day comes after Monday?',a:'Tuesday',o:['Sunday','Tuesday','Wednesday','Friday']},{q:'The short clock hand shows the...?',a:'Hour',o:['Second','Minute','Hour','Day']},{q:'How many seconds in 1 minute?',a:60,o:[30,60,100,120]},{q:'AM means...?',a:'Morning',o:['Afternoon','Morning','Night','Evening']},{q:'How many days in a year?',a:365,o:[300,350,365,400]},{q:'Which day is the WEEKEND?',a:'Saturday',o:['Monday','Wednesday','Friday','Saturday']}],
  // 5 Fractions
  [{q:'½ of 10 = ?',a:5,o:[2,4,5,8]},{q:'¼ of 8 = ?',a:2,o:[1,2,3,4]},{q:'How many halves make 1 whole?',a:2,o:[1,2,3,4]},{q:'How many quarters make 1 whole?',a:4,o:[2,3,4,8]},{q:'½ of 6 = ?',a:3,o:[2,3,4,6]},{q:'Which is bigger: ½ or ¼?',a:'½',o:['¼','½','Equal','⅓']},{q:'⅓ of 9 = ?',a:3,o:[2,3,4,5]},{q:'¼ of 12 = ?',a:3,o:[2,3,4,6]},{q:'½ of 20 = ?',a:10,o:[5,8,10,15]},{q:'How many thirds make 1 whole?',a:3,o:[2,3,4,6]}],
  // 6 Measuring
  [{q:'We measure length in...?',a:'cm',o:['kg','cm','°C','litres']},{q:'1 kg = how many grams?',a:1000,o:[10,100,1000,500]},{q:'Water boils at...?',a:'100°C',o:['50°C','75°C','100°C','37°C']},{q:'Body temperature is about...?',a:'37°C',o:['20°C','37°C','50°C','100°C']},{q:'We measure liquid in...?',a:'Litres',o:['kg','cm','Litres','km']},{q:'Ice forms at...?',a:'0°C',o:['0°C','10°C','-10°C','100°C']},{q:'100 cm = ?',a:'1 metre',o:['1 km','10 cm','1 metre','1 mm']},{q:'1000 ml = ?',a:'1 litre',o:['10 litres','1 litre','100 ml','1 kg']},{q:'We measure weight in...?',a:'kg',o:['km','kg','ml','°C']},{q:'Perimeter means...?',a:'Distance around',o:['Inside area','Distance around','Weight','Height']}],
  // 7 Patterns
  [{q:'2, 4, 6, 8, ___?',a:10,o:[9,10,11,12]},{q:'5, 10, 15, ___?',a:20,o:[18,19,20,25]},{q:'10, 20, 30, ___?',a:40,o:[35,40,50,45]},{q:'1, 3, 5, 7, ___?',a:9,o:[8,9,10,11]},{q:'Next even after 6?',a:8,o:[7,8,9,10]},{q:'Count by 2: 12, 14, ___?',a:16,o:[15,16,17,18]},{q:'Count by 5: 25, 30, ___?',a:35,o:[33,34,35,40]},{q:'20, 18, 16, ___?',a:14,o:[12,13,14,15]},{q:'Count by 10: 40, 50, ___?',a:60,o:[55,60,65,70]},{q:'100, 90, 80, ___?',a:70,o:[60,70,75,85]}],
  // 8 Money
  [{q:'2p + 3p = ?',a:'5p',o:['4p','5p','6p','7p']},{q:'10p – 3p = ?',a:'7p',o:['5p','6p','7p','8p']},{q:'How many 2p coins make 10p?',a:5,o:[3,4,5,6]},{q:'5p + 5p + 5p = ?',a:'15p',o:['10p','12p','15p','20p']},{q:'Pay 20p for 15p sweet, change = ?',a:'5p',o:['3p','4p','5p','10p']},{q:'Which is worth more: 50p or 20p?',a:'50p',o:['20p','50p','Equal','10p']},{q:'1p + 2p + 5p = ?',a:'8p',o:['6p','7p','8p','9p']},{q:'2 × 10p coins = ?',a:'20p',o:['15p','20p','25p','30p']},{q:'50p – 25p = ?',a:'25p',o:['10p','20p','25p','30p']},{q:'How many pence in £1?',a:100,o:[50,100,150,200]}],
  // 9 Mixed
  [{q:'What is 7 × 8?',a:56,o:[48,54,56,63]},{q:'½ of 100 = ?',a:50,o:[25,40,50,75]},{q:'How many sides in 2 triangles?',a:6,o:[4,5,6,8]},{q:'24 hours ÷ 2 = ?',a:12,o:[8,10,12,16]},{q:'3 + 4 + 5 = ?',a:12,o:[10,11,12,13]},{q:'10 × 10 = ?',a:100,o:[10,20,100,1000]},{q:'What is 5² (5 squared)?',a:25,o:[10,15,25,30]},{q:'¾ of 20 = ?',a:15,o:[10,12,15,18]},{q:'Count by 3: 9, 12, ___?',a:15,o:[13,14,15,16]},{q:'A hexagon has how many sides?',a:6,o:[4,5,6,7]}],
  // 10 Division
  [{q:'10 ÷ 2 = ?',a:5,o:[2,4,5,8]},{q:'6 ÷ 3 = ?',a:2,o:[2,3,4,1]},{q:'12 ÷ 4 = ?',a:3,o:[2,3,4,6]},{q:'15 ÷ 5 = ?',a:3,o:[2,3,4,5]},{q:'8 ÷ 2 = ?',a:4,o:[3,4,5,2]},{q:'20 ÷ 10 = ?',a:2,o:[1,2,5,10]},{q:'Sharing 10 sweets with 5 friends, each gets?',a:2,o:[2,3,4,5]},{q:'18 ÷ 2 = ?',a:9,o:[7,8,9,10]},{q:'Half of 14 is?',a:7,o:[6,7,8,9]},{q:'9 ÷ 3 = ?',a:3,o:[2,3,4,1]}],
  // 11 Data
  [{q:'A Tally Mark //// means how many?',a:4,o:[3,4,5,6]},{q:'A crossed Tally (5 marks) is called a...?',a:'Gate',o:['Fence','Gate','Block','Star']},{q:'Which chart uses pictures?',a:'Pictogram',o:['Bar Chart','Tally','Pictogram','Pie Chart']},{q:'The most common number is the...?',a:'Mode',o:['Mean','Mode','Median','Range']},{q:'Information we collect is called...?',a:'Data',o:['Numbers','Maths','Data','Info']},{q:'A chart with rectangles is a...?',a:'Bar Chart',o:['Pie Chart','Bar Chart','Tally','Line Graph']},{q:'How many is //// //?',a:7,o:[5,6,7,8]},{q:'We use a survey to...?',a:'Collect data',o:['Do sums','Collect data','Play games','Sleep']},{q:'A Pictogram has a...?',a:'Key',o:['Door','Lock','Key','Map']},{q:'10 tallies is how many gates?',a:2,o:[1,2,3,5]}],
  // 12 Place Value
  [{q:'In 45, what is the value of 4?',a:40,o:[4,40,400,10]},{q:'What is 100 + 20 + 3?',a:123,o:[123,10023,15,321]},{q:'The "U" in HTU stands for...?',a:'Units',o:['Under','Units','Up','Us']},{q:'In 789, which number is the HUNDRED?',a:7,o:[7,8,9,10]},{q:'10 Tens = how many?',a:100,o:[10,50,100,1000]},{q:'In 52, which number is in the ONES place?',a:2,o:[5,2,10,1]},{q:'Two hundreds + Five units = ?',a:205,o:[25,205,250,502]},{q:'Value of 8 in 812?',a:800,o:[8,80,800,100]},{q:'Smallest 3-digit number is?',a:100,o:[10,99,100,101]},{q:'Place value of 0 in 105?',a:'Tens',o:['Hundreds','Tens','Units','Zero']}],
  // 13 Compare
  [{q:'Which is BIGGER: 45 or 54?',a:54,o:[45,54,'Equal','Both']},{q:'7 + 3 ____ 15 - 5',a:'=',o:['<','>','=','+']},{q:'Which is SMALLEST: 12, 21, 11?',a:11,o:[12,21,11,10]},{q:'100 ____ 99',a:'>',o:['<','>','=','-']},{q:'Ascending means...?',a:'Smallest to Biggest',o:['Biggest to Smallest','Smallest to Biggest','Middle','Mixed']},{q:'What is between 19 and 21?',a:20,o:[18,20,22,25]},{q:'Which is CLOSEST to 50?',a:49,o:[40,49,55,60]},{q:'32 ____ 23',a:'>',o:['<','>','=','x']},{q:'Descending means...?',a:'Biggest to Smallest',o:['Smallest to Biggest','Biggest to Smallest','Equal','None']},{q:'Which is GREATER: 88 or 89?',a:89,o:[88,89,'Equal','8']}],
];

// ============================================================
// STATE
// ============================================================
let stars = 0, currentSec = 0;
let clockH = 3, clockM = 0;
let dotCount = 0, coinTotal = 0, shopSpent = 0;
const shopBudget = 20;
let shopPurchased = [];
let skipStep = 2, skipIdx = 0, skipNums = [];
let patternRevealed = false;
let speedActive = false, speedScore = 0, speedQ = 0, speedTimer = null, speedInterval = null;

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  // PWA Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }

  loadData();
  buildFloatBg();
  buildNav();
  buildNumberLine();
  updateAdd();
  updateMult();
  buildShapes();
  buildAngleCards();
  buildCalendar();
  buildPizza(4);
  buildRuler();
  buildThermo();
  buildCoins();
  buildShop();
  buildTimesTable();
  resetCookies();
  newPattern();
  startSkip(2);
  updatePV();
  updateCompare();
  for(let i=0;i<14;i++) newQuiz(i);
  resetShare();
  resetTally();
  resetPV();
  newCompare();
  newBond();
  initDailyChallenge();

  if(!localStorage.getItem('maths_adv_onboarded')){
    showOnboarding();
  }
  
  localStorage.setItem('maths_adv_returning', 'true');
  showSection(0);
});

// ============================================================
// STORAGE ENGINE (Production Ready)
// ============================================================
function saveData() {
    const data = { stars, earnedBadges, date: new Date().toISOString() };
    localStorage.setItem('maths_adventure_v1', JSON.stringify(data));
}
function loadData() {
    const raw = localStorage.getItem('maths_adventure_v1');
    if(raw){
        const data = JSON.parse(raw);
        stars = data.stars || 0;
        earnedBadges = data.earnedBadges || [];
        document.getElementById('starCount').textContent = stars;
        const pct=Math.min(stars*2.5,100);
        const progBar = document.getElementById('progBar');
        if(progBar) progBar.style.width=pct+'%';
    }
}
function openParentalGate(action){
    const q1 = Math.floor(Math.random()*10)+5;
    const q2 = Math.floor(Math.random()*10)+5;
    const ans = prompt(`ASK A GROWN-UP: What is ${q1} + ${q2}?`);
    if(parseInt(ans) === q1 + q2){
        if(action === 'reset') resetAllProgress();
        if(action === 'report') showMasteryReport();
    } else {
        alert("Oops! That's for grown-ups only! 😉");
    }
}
function resetAllProgress(){
    if(confirm("Are you sure you want to delete all stars and progress?")){
        localStorage.clear();
        location.reload();
    }
}


// ============================================================
// FLOATING BG
// ============================================================
function buildFloatBg() {
  const bg = document.getElementById('floatBg');
  const colors = ['#FFD93D','#FF6B35','#A855F7','#3B82F6','#22C55E','#FF6B9D','#06B6D4'];
  for(let i=0;i<14;i++){
    const el=document.createElement('div');
    el.className='float-el';
    const size=Math.random()*28+12;
    el.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*100}%;
      background:${colors[i%colors.length]};
      animation-duration:${14+Math.random()*22}s;animation-delay:${Math.random()*12}s;
      border-radius:${Math.random()>0.5?'50%':'6px'};`;
    bg.appendChild(el);
  }
}

// ============================================================
// NAV BUILD
// ============================================================
function buildNav() {
  const side = document.getElementById('sideNav');
  const bottom = document.getElementById('bottomNav');
  const allItems = SECTIONS;

  allItems.forEach(s => {
    const btn = document.createElement('button');
    btn.className='side-nav-item'+(s.id===0?' active':'');
    btn.innerHTML=`<span class="nav-emoji">${s.emoji}</span>${s.label}<span class="nav-badge">📝</span>`;
    btn.style.setProperty('--ac',s.activeClr);
    if(s.id===0)btn.style.background=s.activeClr;
    btn.onclick=()=>showSection(s.id);
    side.appendChild(btn);
  });

  // Modern Bottom nav
  bottom.style.overflowX='auto';
  bottom.style.justifyContent='flex-start';
  bottom.style.gap='0';
  bottom.style.paddingBottom='calc(env(safe-area-inset-bottom, 0px) + 8px)';
  
  allItems.forEach(s => {
    const btn = document.createElement('button');
    btn.className='bn-item'+(s.id===0?' active':'');
    btn.id='bn-'+s.id;
    btn.innerHTML=`
      <div class="bn-icon-wrapper">
        <span class="bn-icon">${s.emoji}</span>
      </div>
      <span class="bn-label">${s.label}</span>
    `;
    if(s.id===0){btn.style.color=s.activeClr;}
    btn.onclick=()=>showSection(s.id);
    bottom.appendChild(btn);
  });
}

// ============================================================
// SECTION SWITCH
// ============================================================
function showSection(idx) {
  document.querySelectorAll('.section-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('sec-'+idx).classList.add('active');
  

  document.querySelectorAll('.side-nav-item').forEach((b,i)=>{
    b.classList.remove('active');
    b.style.background='';
    b.style.color='';
    if(i===idx){b.classList.add('active');b.style.background=SECTIONS[idx].activeClr;b.style.color='white';}
  });
  
  document.querySelectorAll('.bn-item').forEach((b,i)=>{
    b.classList.remove('active');
    b.style.color='';
    if(i===idx){
      b.classList.add('active');
      b.style.color=SECTIONS[idx].activeClr;
    }
  });

  currentSec=idx;
  document.getElementById('mainContent').scrollTo({top:0,behavior:'smooth'});
  
  const activeBN=document.getElementById('bn-'+idx);
  if(activeBN)activeBN.scrollIntoView({inline:'center',behavior:'smooth'});
}

// ============================================================
// STARS & REWARDS
// ============================================================
function addStar(n=1) {
  stars+=n;
  checkAchievements('stars');
  progressChallenge('stars', n);
  
  document.getElementById('starCount').textContent=stars;
  const pct=Math.min(stars*2.5,100);
  const progBar = document.getElementById('progBar');
  if(progBar) progBar.style.width=pct+'%';
  
  saveData();
  if(stars === 100) showCert();
  
  launchConfetti();
  showPopup();
}

function launchConfetti() {
  const colors=['#FFD93D','#FF6B35','#A855F7','#3B82F6','#22C55E','#FF6B9D','#06B6D4','#EF4444'];
  for(let i=0;i<24;i++){
    setTimeout(()=>{
      const c=document.createElement('div');
      c.className='confetti';
      c.style.cssText=`left:${Math.random()*100}vw;background:${colors[i%colors.length]};
        transform:rotate(${Math.random()*360}deg);animation-delay:${Math.random()*0.4}s;`;
      document.body.appendChild(c);
      setTimeout(()=>c.remove(),3000);
    },i*25);
  }
}

const EMOJIS=['🌟','🎉','🏆','🚀','💫','🎊','⭐','🥇','🦁','🔥'];
const MSGS=['Amazing work!','Super smart!','You rock!','Brilliant!','Keep it up!','Incredible!','Math genius!','Outstanding!'];
function showPopup() {
  document.getElementById('popEmoji').textContent=EMOJIS[stars%EMOJIS.length];
  document.getElementById('popTitle').textContent=MSGS[stars%MSGS.length];
  document.getElementById('popMsg').textContent=`You earned a star! Total: ${stars} ⭐`;
  document.getElementById('popupOverlay').classList.add('show');
  setTimeout(closePopup,2500);
}
function closePopup(){document.getElementById('popupOverlay').classList.remove('show');}

// ============================================================
// NUMBER LINE
// ============================================================
const NUM_FACTS={0:'Zero! Empty! No cookies left 🍪',1:'One! You are unique and special! ✨',2:'Two! 2 eyes, 2 ears, 2 hands! 👀',3:'Three! A triangle has 3 sides! 🔺',4:'Four! A square has 4 sides! ⬜',5:'Five! One hand has 5 fingers! ✋',6:'Six! An insect has 6 legs! 🐛',7:'Seven! A rainbow has 7 colours! 🌈',8:'Eight! A spider has 8 legs! 🕷️',9:'Nine! Just one less than ten!',10:'Ten! Two hands = 10 fingers! 👐',11:'Eleven! A football team has 11 players! ⚽',12:'Twelve! 12 months in a year! 📅',13:'Thirteen! An unlucky number for some! 🍀',14:'Fourteen! 2 weeks = 14 days! 📆',15:'Fifteen! Count by 5s: 5, 10, 15! 🖐️'};
const NUM_ANIMALS=['🦁','🐘','🐸','🦊','🐼','🦋','🐳','⭐','🚀','🌺','🎯','🎵','🍕','🎨','🦄','🌟'];
const NUM_COLORS=['#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#3B82F6','#6366F1','#A855F7','#EC4899','#F43F5E','#10B981','#F59E0B','#8B5CF6','#0EA5E9','#84CC16','#FF6B9D'];

function buildNumberLine(){
  const nl=document.getElementById('numLine');
  for(let i=0;i<=15;i++){
    const b=document.createElement('div');
    b.className='numblock';
    b.style.background=NUM_COLORS[i];
    b.style.height=(36+i*5)+'px';
    b.innerHTML=`<span class="nb-animal">${NUM_ANIMALS[i]}</span>${i}`;
    b.onclick=()=>{
      const f=document.getElementById('numFact');
      f.textContent=NUM_FACTS[i]||`${i} = ${i===0?'nothing!':Array(i).fill('•').join(' ')}`;
      f.style.animation='none';
      requestAnimationFrame(()=>{f.style.animation='fadeUp 0.3s ease';});
    };
    nl.appendChild(b);
  }
}

// ============================================================
// COUNTING DOTS
// ============================================================
const DOT_EMOJIS=['🍎','🌸','⭐','🎈','🦋','🍪','🌈','💎','🚀','🍭','🐸','🦁','🐝','🌻','🎸'];
const DOT_COLORS=['#FF6B35','#A855F7','#3B82F6','#22C55E','#FF6B9D','#06B6D4','#F59E0B','#EF4444','#6366F1','#EC4899'];
function addDot(){
  if(dotCount>=25)return;
  const area=document.getElementById('dotsArea');
  const d=document.createElement('div');d.className='dot-el';
  d.style.background=DOT_COLORS[dotCount%DOT_COLORS.length];
  d.textContent=DOT_EMOJIS[dotCount%DOT_EMOJIS.length];
  d.onclick=()=>{d.style.transform='scale(0)';setTimeout(()=>{d.remove();dotCount--;document.getElementById('dotCount').textContent=dotCount;},300);};
  area.appendChild(d);dotCount++;
  document.getElementById('dotCount').textContent=dotCount;
}
function clearDots(){document.getElementById('dotsArea').innerHTML='';dotCount=0;document.getElementById('dotCount').textContent=0;}

// ============================================================
// PLACE VALUE
// ============================================================
function updatePV(){
  const v=+document.getElementById('pvSlider').value;
  document.getElementById('pvNumber').textContent=v;
  const h=Math.floor(v/100),te=Math.floor((v%100)/10),o=v%10;
  const d=document.getElementById('pvDisplay');d.innerHTML='';
  const make=(val,label,bg,tc)=>{
    if(val===0&&v>0&&label!=='Ones')return;
    const block=document.createElement('div');block.className='pv-block';block.style.background=bg;
    const ones=document.createElement('div');ones.className='pv-ones';
    for(let i=0;i<Math.min(val,10);i++){const sq=document.createElement('div');sq.className='pv-unit';sq.style.background=tc;ones.appendChild(sq);}
    block.innerHTML=`<div class="pv-val" style="color:${tc}">${val}</div><div class="pv-label" style="color:${tc}">${label}</div>`;
    block.appendChild(ones);d.appendChild(block);
  };
  make(h,'Hundreds','#EFF6FF','#1D4ED8');
  make(te,'Tens','#F0FDF4','#15803D');
  make(o,'Ones','#FFF7ED','#C2410C');
}

// ============================================================
// COMPARE
// ============================================================
function updateCompare(){
  const a=+document.getElementById('cmpSliderA').value;
  const b=+document.getElementById('cmpSliderB').value;
  document.getElementById('cmpA').textContent=a;
  document.getElementById('cmpB').textContent=b;
  const area=document.getElementById('compareArea');
  let sym,msg;
  if(a>b){sym='>';msg=`${a} is GREATER THAN ${b}! 🦁`;}
  else if(a<b){sym='<';msg=`${a} is LESS THAN ${b}! 🐭`;}
  else{sym='=';msg=`${a} EQUALS ${b}! They are the same! ⚖️`;}
  area.innerHTML=`<div class="compare-num" style="background:var(--blue)">${a}</div>
    <div class="compare-sym">${sym}</div>
    <div class="compare-num" style="background:var(--red)">${b}</div>`;
  document.getElementById('compareResult').textContent=msg;
}

// ============================================================
// ADD VISUALIZER
// ============================================================
function updateAdd(){
  const v1=+document.getElementById('addSlider1').value;
  const v2=+document.getElementById('addSlider2').value;
  document.getElementById('av1').textContent=v1;
  document.getElementById('av2').textContent=v2;
  const viz=document.getElementById('addViz');viz.innerHTML='';
  for(let i=0;i<v1;i++){const b=document.createElement('div');b.className='add-blk';b.style.background='#3B82F6';b.textContent='🍎';viz.appendChild(b);}
  if(v1>=0&&v2>=0){const op=document.createElement('div');op.className='op-badge';op.textContent='+';viz.appendChild(op);}
  for(let i=0;i<v2;i++){const b=document.createElement('div');b.className='add-blk';b.style.background='#F97316';b.textContent='🍊';viz.appendChild(b);}
  const eq=document.createElement('div');eq.className='op-badge';eq.textContent='=';viz.appendChild(eq);
  const res=document.createElement('div');res.className='res-badge';res.textContent=v1+v2;viz.appendChild(res);
}

// ============================================================
// COOKIES
// ============================================================
function resetCookies(){
  const jar=document.getElementById('cookieJar');jar.innerHTML='';
  let cnt=10;document.getElementById('cookieCount').textContent=10;
  for(let i=0;i<10;i++){
    const c=document.createElement('span');
    c.style.cssText='font-size:2.4rem;cursor:pointer;transition:all 0.3s;display:inline-block;margin:3px;';
    c.textContent='🍪';
    c.onclick=()=>{if(c.style.opacity!=='0.15'){c.style.opacity='0.15';c.style.transform='scale(0.4)';cnt--;document.getElementById('cookieCount').textContent=cnt;}};
    jar.appendChild(c);
  }
}

// ============================================================
// NUMBER BONDS
// ============================================================
function newBond(){
  const target=10;
  const a=Math.floor(Math.random()*11);
  const b=target-a;
  document.getElementById('bondQ').textContent=`${a} + __ = ${target}`;
  const opts=[b,...[1,2,3,4,5,6,7,8,9,0].filter(x=>x!==b).slice(0,3)].sort(()=>Math.random()-0.5);
  const el=document.getElementById('bond-opts');el.innerHTML='';
  const fb=document.getElementById('bond-fb');fb.style.display='none';
  opts.forEach(opt=>{
    const btn=document.createElement('button');btn.className='q-opt';btn.textContent=opt;
    btn.onclick=()=>{
      el.querySelectorAll('.q-opt').forEach(b=>b.style.pointerEvents='none');
      if(opt===b){btn.classList.add('correct');fb.className='quiz-fb good';fb.textContent='🌟 Correct! '+a+' + '+b+' = '+target+'!';fb.style.display='block';addStar(1);}
      else{btn.classList.add('wrong');fb.className='quiz-fb bad';fb.textContent='❌ Not quite! The answer is '+b+'!';fb.style.display='block';el.querySelectorAll('.q-opt').forEach(b=>{if(+b.textContent===b)b.classList.add('correct');});}
    };
    el.appendChild(btn);
  });
}

// ============================================================
// MULTIPLICATION
// ============================================================
const MULT_EMOJIS=['🍪','🌟','🍎','🐸','🎈','🦋','💎','🍭','🚀','🌸'];
function updateMult(){
  const v1=+document.getElementById('multSlider1').value;
  const v2=+document.getElementById('multSlider2').value;
  document.getElementById('mv1').textContent=v1;
  document.getElementById('mv2').textContent=v2;
  document.getElementById('multDisplay').textContent=`${v1} × ${v2} = ${v1*v2}`;
  const grid=document.getElementById('multGrid');grid.innerHTML='';
  const em=MULT_EMOJIS[v2%MULT_EMOJIS.length];
  const colors=['#3B82F6','#22C55E','#F97316','#A855F7','#EC4899','#06B6D4','#EF4444','#F59E0B','#6366F1','#10B981'];
  for(let r=0;r<v1;r++){
    const row=document.createElement('div');row.className='mult-row';
    for(let c=0;c<v2;c++){
      const d=document.createElement('div');d.className='mult-dot';
      d.style.background=colors[r%colors.length]+'22';
      d.style.border=`2px solid ${colors[r%colors.length]}`;
      d.textContent=em;
      row.appendChild(d);
    }
    grid.appendChild(row);
  }
}

// ============================================================
// TIMES TABLE GRID
// ============================================================
function buildTimesTable(){
  const grid=document.getElementById('ttGrid');grid.innerHTML='';
  const colors=['#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#3B82F6','#6366F1','#A855F7','#EC4899','#F43F5E'];
  for(let r=1;r<=10;r++){
    for(let c=1;c<=10;c++){
      const cell=document.createElement('div');cell.className='tt-cell';
      const val=r*c;
      let clr=colors[(r-1)%colors.length];
      if(val%10===0)clr='#6366F1';
      else if(val%5===0)clr='#22C55E';
      else if(val%2===0)clr='#3B82F6';
      cell.style.background=clr;cell.style.fontSize=val>=100?'0.6rem':'0.75rem';
      cell.textContent=val;
      cell.title=`${r} × ${c} = ${val}`;
      cell.onclick=()=>{document.getElementById('ttFact').textContent=`${r} × ${c} = ${val} 🎯`;};
      grid.appendChild(cell);
    }
  }
}

// ============================================================
// SHAPES
// ============================================================
const SHAPES=[
  {name:'Circle',emoji:'⭕',sides:0,fact:'No sides, no corners! A ball (3D) is a sphere! Rolls on any surface! 🏀',color:'#EF4444'},
  {name:'Triangle',emoji:'🔺',sides:3,fact:'3 sides, 3 corners! A pizza slice is a triangle! 🍕 Strongest shape in engineering!',color:'#F97316'},
  {name:'Square',emoji:'⬜',sides:4,fact:'4 EQUAL sides! Like a chess board square 🎲 or a toast! All angles are 90°!',color:'#EAB308'},
  {name:'Rectangle',emoji:'▬',sides:4,fact:'4 sides – opposite sides equal! Doors, books, phone screens are rectangles! 📱',color:'#22C55E'},
  {name:'Pentagon',emoji:'⬠',sides:5,fact:'5 sides, 5 corners! A football patch 🥅 and the USA Pentagon building are pentagons!',color:'#06B6D4'},
  {name:'Hexagon',emoji:'⬡',sides:6,fact:'6 sides! Beehive cells are hexagons – they fit together perfectly with no gaps! 🐝',color:'#3B82F6'},
  {name:'Octagon',emoji:'🛑',sides:8,fact:'8 sides! A STOP sign is an octagon! Count the sides next time you see one! 🚗',color:'#6366F1'},
  {name:'Star',emoji:'⭐',sides:10,fact:'A 5-point star has 10 corners! Stars appear in flags, badges, and awards! 🌟',color:'#A855F7'},
  {name:'Heart',emoji:'❤️',sides:0,fact:'A curved shape! It shows love and kindness! Made of 2 bumps and a V at the bottom! 💕',color:'#EC4899'},
  {name:'Cube',emoji:'🎲',sides:6,fact:'A 3D shape! 6 square faces, 8 corners, 12 edges! Like a dice or a block! 🧱',color:'#F43F5E'},
  {name:'Sphere',emoji:'🔵',sides:0,fact:'A 3D round shape! Like a ball, a planet, or a orange! Rolls in any direction! 🌍',color:'#10B981'},
  {name:'Cylinder',emoji:'🥤',sides:2,fact:'A 3D shape with 2 circular ends and a curved side! Like a can, a drum, or a cup! 🥁',color:'#F59E0B'},
];

function buildShapes(){
  const g=document.getElementById('shapesGrid');
  SHAPES.forEach(s=>{
    const card=document.createElement('div');card.className='shape-card';
    card.style.borderColor=s.color;
    card.innerHTML=`<div class="sh-emoji">${s.emoji}</div><div class="sh-name" style="color:${s.color}">${s.name}</div><div class="sh-sides">${s.sides===0?'Special':''+s.sides+' sides'}</div>`;
    card.onclick=()=>{
      const f=document.getElementById('shapeFact');f.style.display='block';
      f.innerHTML=`<strong style="color:${s.color}">${s.emoji} ${s.name}:</strong> ${s.fact}`;
      card.querySelector('.sh-emoji').style.transform='scale(1.4) rotate(15deg)';
      setTimeout(()=>card.querySelector('.sh-emoji').style.transform='',350);
    };
    g.appendChild(card);
  });
}

// ============================================================
// ANGLES
// ============================================================
const ANGLES=[
  {name:'Right Angle',deg:90,emoji:'📐',color:'#3B82F6',fact:'Exactly 90°! Like the corner of a square, a book, or a door frame! The most common angle in buildings!'},
  {name:'Acute Angle',deg:45,emoji:'🔺',color:'#22C55E',fact:'Less than 90°! A sharp, pointy angle! Like the tip of a pencil or a pizza slice!'},
  {name:'Obtuse Angle',deg:135,emoji:'↗️',color:'#F97316',fact:'More than 90° but less than 180°! A wide, blunt angle! Like when you open a book wide!'},
  {name:'Straight Angle',deg:180,emoji:'➡️',color:'#A855F7',fact:'Exactly 180°! A perfectly straight line! Looks like a flat surface or the horizon! 🌅'},
  {name:'Full Turn',deg:360,emoji:'🔄',color:'#EC4899',fact:'360°! A full circle! When you spin around completely one time! Used in wheels, clocks, and carousels!'},
];

function buildAngleCards(){
  const g=document.getElementById('angleCards');
  if(!g) return;
  ANGLES.forEach(a=>{
    const card=document.createElement('div');card.className='angle-card';card.style.borderColor=a.color;
    const svgSize=70;const cx=svgSize/2,cy=svgSize/2,r=25;
    const rad=(a.deg-90)*Math.PI/180;
    const x2=cx+r*Math.cos(rad),y2=cy+r*Math.sin(rad);
    card.innerHTML=`<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r}" stroke="${a.color}" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${a.color}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="3" fill="${a.color}"/>
    </svg>
    <div style="font-weight:800;color:${a.color};font-size:0.85rem;margin-top:4px;">${a.name}</div>
    <div style="font-weight:700;color:#888;font-size:0.75rem;">${a.deg}°</div>`;
    card.onclick=()=>{
      const f=document.getElementById('angleFact');f.style.display='block';
      f.innerHTML=`<strong style="color:${a.color}">${a.emoji} ${a.name} (${a.deg}°):</strong> ${a.fact}`;
    };
    g.appendChild(card);
  });
}

// ============================================================
// CLOCK
// ============================================================
function buildClock(){
  const g=document.getElementById('cMarkers');
  if(!g) return;
  for(let i=1;i<=12;i++){
    const ang=(i/12)*360-90;
    const r=78;
    const x=110+r*Math.cos(ang*Math.PI/180),y=110+r*Math.sin(ang*Math.PI/180);
    g.innerHTML+=`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="800" fill="#1E3A5F" font-family="Nunito">${i}</text>`;
    const r1=92,r2=i%3===0?84:89;
    const tx1=110+r1*Math.cos(ang*Math.PI/180),ty1=110+r1*Math.sin(ang*Math.PI/180);
    const tx2=110+r2*Math.cos(ang*Math.PI/180),ty2=110+r2*Math.sin(ang*Math.PI/180);
    g.innerHTML+=`<line x1="${tx1}" y1="${ty1}" x2="${tx2}" y2="${ty2}" stroke="#A855F7" stroke-width="${i%3===0?3:1.5}"/>`;
  }
  updateClock();
}
function updateClock(){
  const ha=(clockH%12)*30+clockM*0.5-90,ma=clockM*6-90;
  const hx=110+46*Math.cos(ha*Math.PI/180),hy=110+46*Math.sin(ha*Math.PI/180);
  const mx=110+60*Math.cos(ma*Math.PI/180),my=110+60*Math.sin(ma*Math.PI/180);
  const hh = document.getElementById('hHand');
  const mm = document.getElementById('mHand');
  if(hh) { hh.setAttribute('x2',hx); hh.setAttribute('y2',hy); }
  if(mm) { mm.setAttribute('x2',mx); mm.setAttribute('y2',my); }
  const h12=clockH%12||12,ms=clockM.toString().padStart(2,'0');
  const ampm=clockH<12?'AM':'PM';
  const cTime = document.getElementById('clockTime');
  if(cTime) cTime.textContent=`${h12}:${ms} ${ampm}`;
  const facts=['🌙 Midnight! Time to sleep!','🌅 Early morning! Still dark!','🍳 Breakfast time!','☀️ Morning walk time!','📚 School starts!','🎨 Art class time!','🍱 Lunch time!','😴 Afternoon rest!','🎮 Play time!','🌇 Evening time!','🍽️ Dinner time!','📖 Story time!'];
  const cFact = document.getElementById('clockFact');
  if(cFact) cFact.textContent=facts[Math.floor(clockH)%12];
}
function changeH(d){clockH=(clockH+d+24)%24;updateClock();}
function changeM(d){clockM=(clockM+d+60)%60;updateClock();}
function tickClock(){changeM(15);}

// ============================================================
// CALENDAR
// ============================================================
function buildCalendar(){
  const now=new Date();
  const year=now.getFullYear(),month=now.getMonth();
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const cTitle = document.getElementById('calTitle');
  if(cTitle) cTitle.textContent=MONTHS[month]+' '+year;
  const grid=document.getElementById('calGrid');
  if(!grid) return;
  grid.innerHTML='';
  DAYS.forEach(d=>{const h=document.createElement('div');h.className='cal-header-cell';h.textContent=d;grid.appendChild(h);});
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const facts=['Monday: A new week starts! Fresh start! 💪','Tuesday: Keep going! You are doing great!','Wednesday: Halfway through the week! 🎯','Thursday: Almost the weekend! One more day! 🏃','Friday: Last school day! Weekend tomorrow! 🎉','Saturday: Weekend! Time to play! ⚽','Sunday: Rest day! Read a book! 📚'];
  for(let i=0;i<firstDay;i++){const e=document.createElement('div');e.className='cal-day empty';grid.appendChild(e);}
  for(let d=1;d<=daysInMonth;d++){
    const cell=document.createElement('div');cell.className='cal-day';
    const dayOfWeek=new Date(year,month,d).getDay();
    if(d===now.getDate())cell.classList.add('today');
    if(dayOfWeek===0||dayOfWeek===6)cell.classList.add('weekend');
    cell.textContent=d;
    cell.onclick=()=>{document.getElementById('calFact').textContent=facts[dayOfWeek]+` (Day ${d})`;};
    grid.appendChild(cell);
  }
}

// ============================================================
// PIZZA SLICER (Fractions)
// ============================================================
let pizzaSlices = 4, pizzaEaten = 0;
function buildPizza(n){
  pizzaSlices = n; pizzaEaten = 0;
  const cont = document.getElementById('pizzaCont');
  if(!cont) return;
  cont.innerHTML = '';
  updatePizzaInfo();
  
  for(let i=0; i<n; i++){
    const slice = document.createElement('div');
    slice.style.cssText = `
      position:absolute; top:0; left:50%; width:50%; height:100%;
      background:#FCD34D; border:1px solid #D97706;
      transform-origin:left center; transform:rotate(${(i*360/n)}deg) skewY(${90-(360/n)}deg);
      cursor:pointer; transition:all 0.3s;
    `;
    slice.innerHTML = '<span style="position:absolute;top:20%;left:20%;font-size:1.5rem;transform:skewY(-'+(90-(360/n))+'deg) rotate(-45deg);">🍕</span>';
    slice.onclick = () => {
      if(slice.style.opacity !== '0'){
        pizzaEaten++; updatePizzaInfo();
      }
    };
    cont.appendChild(slice);
  }
}
function updatePizzaInfo(){
  const info = document.getElementById('pizzaInfo');
  const left = pizzaSlices - pizzaEaten;
  info.textContent = `You have ${left} / ${pizzaSlices} slices left!`;
  if(left === 0) { info.textContent = "All gone! 😋"; addStar(1); }
}

// ============================================================
// RULER
// ============================================================
const RULER_FACTS=['A small eraser! 📎','A big coin!','A phone is ~15cm!','A ruler itself 📏','A textbook!','Your foot! 👣','A keyboard!','Your school bag!','A skateboard! 🛹','Your arm! 💪','Waist of a 6-year-old!','A bicycle wheel hub!','A guitar neck! 🎸'];
function buildRuler(){
  const marks=document.getElementById('rulerMarks');
  if(!marks) return;
  for(let i=0;i<=18;i++){const m=document.createElement('div');m.className='ruler-mark';m.textContent=i;marks.appendChild(m);}
  updateRuler();
}
function updateRuler(){
  const slider = document.getElementById('rulerSlider');
  if(!slider) return;
  const v=+slider.value;
  document.getElementById('rVal').textContent=v;
  const obj=document.getElementById('rulerObj');
  obj.style.width=Math.round((v/20)*84)+'%';obj.textContent=`📦 ${v}cm`;
  document.getElementById('rulerFact').textContent=`${v}cm ≈ ${RULER_FACTS[Math.min(v-1,RULER_FACTS.length-1)]}`;
}

// ============================================================
// THERMOMETER
// ============================================================
function buildThermo(){updateThermo();}
const THERMO_LABELS=[
  [-10,0,'❄️ Freezing cold! Ice and snow! ⛄'],[0,10,'🥶 Very cold! Wear a coat!'],[10,20,'😐 Cool day. A light jacket is fine!'],
  [20,30,'😊 Warm and comfortable! Perfect day! ☀️'],[30,40,'🥵 Hot! Drink lots of water! 💧'],[36,38,'👶 Body temperature! Healthy and normal!'],
  [40,60,'🔥 Very hot! Sun can hurt!'],[60,100,'♨️ Boiling hot! Like a hot shower!'],[100,110,'💨 Water boils! 100°C = steam! 🫧'],
];
function updateThermo(){
  const slider = document.getElementById('thermoSlider');
  if(!slider) return;
  const v=+slider.value;
  document.getElementById('thermoVal').textContent=v;
  document.getElementById('thermoDisplay').textContent=v+'°C';
  const pct=Math.max(0,Math.min((v+10)/120,1));
  const h=Math.round(pct*140);
  const fillEl=document.getElementById('thermoFill');
  if(fillEl) { fillEl.setAttribute('y',10+140-h);fillEl.setAttribute('height',h); }
  const clr=v<=0?'#3B82F6':v<=20?'#22C55E':v<=35?'#F97316':'#EF4444';
  if(fillEl) fillEl.setAttribute('fill',clr);
  let label='';
  for(const [lo,hi,txt] of THERMO_LABELS){if(v>=lo&&v<=hi){label=txt;break;}}
  document.getElementById('thermoLabel').textContent=label||'🌡️ Measuring temperature!';
}

// ============================================================
// PATTERNS
// ============================================================
const PATTERN_SETS=[
  {seq:['🔴','🔵','🔴','🔵','🔴'],ans:'🔵',hint:'Red, Blue, repeating!'},
  {seq:['⭐','⭐','🌙','⭐','⭐'],ans:'🌙',hint:'Star, Star, Moon!'},
  {seq:['🐸','🐶','🐸','🐶','🐸'],ans:'🐶',hint:'Frog, Dog, repeating!'},
  {seq:['🟡','🟢','🔵','🟡','🟢'],ans:'🔵',hint:'Yellow, Green, Blue!'},
  {seq:['🍎','🍊','🍋','🍎','🍊'],ans:'🍋',hint:'Apple, Orange, Lemon!'},
  {seq:['🌸','🌸','🌻','🌸','🌸'],ans:'🌻',hint:'Sakura, Sakura, Sunflower!'},
  {seq:['🚀','🌟','🚀','🌟','🚀'],ans:'🌟',hint:'Rocket, Star, Rocket, Star!'},
  {seq:['🦁','🐯','🐻','🦁','🐯'],ans:'🐻',hint:'Lion, Tiger, Bear – oh my!'},
  {seq:['🍕','🍔','🌮','🍕','🍔'],ans:'🌮',hint:'Pizza, Burger, Taco!'},
  {seq:['☀️','🌥️','🌧️','☀️','🌥️'],ans:'🌧️',hint:'Sun, Cloud, Rain!'},
];
function newPattern(){
  patternRevealed=false;
  const area=document.getElementById('patternArea');
  if(!area) return;
  const pat=PATTERN_SETS[Math.floor(Math.random()*PATTERN_SETS.length)];
  area.innerHTML='';
  document.getElementById('patFeedback').textContent='';
  const row=document.createElement('div');row.className='pattern-row';
  pat.seq.forEach(e=>{const el=document.createElement('div');el.className='pattern-el';el.textContent=e;row.appendChild(el);});
  const arrow=document.createElement('div');arrow.className='pattern-el';arrow.textContent='→';arrow.style.fontSize='1.5rem';row.appendChild(arrow);
  const mbox=document.createElement('div');mbox.className='mystery-box';mbox.textContent='?';
  mbox.onclick=()=>{
    if(!patternRevealed){
      mbox.classList.add('revealed');mbox.textContent=pat.ans;patternRevealed=true;
      document.getElementById('patFeedback').textContent='✅ '+pat.ans+' – '+pat.hint;
      addStar(1);
    }
  };
  row.appendChild(mbox);area.appendChild(row);
}

// ============================================================
// SKIP COUNTING
// ============================================================
function startSkip(step){
  skipStep=step;skipIdx=0;skipNums=[];
  for(let i=step;i<=step*10;i+=step)skipNums.push(i);
  const g=document.getElementById('skipGrid');
  if(!g) return;
  g.innerHTML='';
  document.getElementById('skipFeedback').textContent='Tap '+step+' first!';
  const colors={2:'var(--green)',5:'var(--blue)',10:'var(--purple)'};
  skipNums.forEach((n,i)=>{
    const btn=document.createElement('button');btn.className='skip-btn';btn.textContent=n;btn.dataset.i=i;
    btn.onclick=()=>{
      if(+btn.dataset.i===skipIdx){
        btn.classList.add('done');btn.style.background=colors[step];skipIdx++;
        if(skipIdx===skipNums.length){document.getElementById('skipFeedback').textContent='🎉 Amazing! You counted by '+step+'s!';addStar(2);}
        else document.getElementById('skipFeedback').textContent='Great! Next: '+skipNums[skipIdx];
      } else {
        btn.style.animation='shakeX 0.4s ease';setTimeout(()=>btn.style.animation='',400);
        document.getElementById('skipFeedback').textContent='Try '+skipNums[skipIdx]+' next!';
      }
    };
    g.appendChild(btn);
  });
}

// ============================================================
// COINS
// ============================================================
const COINS=[
  {val:1,label:'1p',bg:'linear-gradient(135deg,#D97706,#92400E)'},
  {val:2,label:'2p',bg:'linear-gradient(135deg,#CA8A04,#713F12)'},
  {val:5,label:'5p',bg:'linear-gradient(135deg,#9CA3AF,#4B5563)'},
  {val:10,label:'10p',bg:'linear-gradient(135deg,#9CA3AF,#374151)'},
  {val:20,label:'20p',bg:'linear-gradient(135deg,#60A5FA,#1D4ED8)'},
  {val:50,label:'50p',bg:'linear-gradient(135deg,#4ADE80,#15803D)'},
];
function buildCoins(){
  const rack=document.getElementById('coinRack');
  if(!rack) return;
  rack.innerHTML='';
  COINS.forEach(c=>{
    const el=document.createElement('div');el.className='coin';el.style.background=c.bg;
    el.innerHTML=`<span class="cv">${c.label}</span>`;
    el.onclick=()=>{
      coinTotal+=c.val;
      const disp=coinTotal>=100?`${coinTotal}p = £${(coinTotal/100).toFixed(2)}`:`${coinTotal}p`;
      document.getElementById('coinTotal').textContent=disp;
    };
    rack.appendChild(el);
  });
}
function resetCoins(){coinTotal=0; const ct = document.getElementById('coinTotal'); if(ct) ct.textContent='0p';}

// ============================================================
// SHOP
// ============================================================
const SHOP_ITEMS=[
  {name:'Pencil',price:3,emoji:'✏️'},{name:'Lollipop',price:5,emoji:'🍭'},
  {name:'Sticker',price:2,emoji:'⭐'},{name:'Eraser',price:4,emoji:'🔷'},
  {name:'Balloon',price:6,emoji:'🎈'},{name:'Biscuit',price:4,emoji:'🍪'},
  {name:'Ruler',price:7,emoji:'📏'},{name:'Crayon',price:3,emoji:'🖍️'},
];
function buildShop(){
  shopSpent=0;shopPurchased=[];
  const spentDisp = document.getElementById('shopSpent');
  const leftDisp = document.getElementById('shopLeft');
  const fbDisp = document.getElementById('shopFeedback');
  const budgetDisp = document.getElementById('shopBudgetDisplay');
  const g=document.getElementById('shopGrid');
  
  if(spentDisp) spentDisp.textContent='0p';
  if(leftDisp) leftDisp.textContent=shopBudget+'p';
  if(fbDisp) fbDisp.textContent='';
  if(budgetDisp) budgetDisp.textContent=shopBudget+'p';
  if(!g) return;
  g.innerHTML='';
  SHOP_ITEMS.forEach((item,i)=>{
    const card=document.createElement('div');card.className='shop-item';card.dataset.i=i;
    card.innerHTML=`<div class="si-emoji">${item.emoji}</div><div class="si-name">${item.name}</div><div class="si-price">${item.price}p</div>`;
    card.onclick=()=>{
      if(shopPurchased.includes(i)){document.getElementById('shopFeedback').textContent='Already bought that!';return;}
      if(shopSpent+item.price>shopBudget){document.getElementById('shopFeedback').textContent='Not enough money! 💸';card.style.animation='shakeX 0.4s ease';setTimeout(()=>card.style.animation='',400);return;}
      shopPurchased.push(i);shopSpent+=item.price;
      card.classList.add('bought');
      document.getElementById('shopSpent').textContent=shopSpent+'p';
      document.getElementById('shopLeft').textContent=(shopBudget-shopSpent)+'p';
      document.getElementById('shopFeedback').textContent=`Bought ${item.name}! ${shopBudget-shopSpent}p left.`;
      if(shopSpent===shopBudget){document.getElementById('shopFeedback').textContent='🎉 Spent exactly all your money!';addStar(2);}
    };
    g.appendChild(card);
  });
}
function resetShop(){buildShop();}

// ============================================================
// SPEED QUIZ
// ============================================================
const SPEED_QS=[
  {q:'3 + 4',a:7},{q:'5 × 2',a:10},{q:'8 – 3',a:5},{q:'6 + 7',a:13},{q:'4 × 4',a:16},
  {q:'10 – 6',a:4},{q:'9 + 5',a:14},{q:'3 × 5',a:15},{q:'12 – 4',a:8},{q:'7 + 8',a:15},
  {q:'6 × 3',a:18},{q:'20 – 9',a:11},{q:'5 + 9',a:14},{q:'2 × 9',a:18},{q:'15 – 7',a:8},
];
let speedCurrent=null,speedQsList=[],speedQNum=0,speedTotalQ=10,speedTimeLeft=10;

function startSpeed(){
  speedQsList=[...SPEED_QS].sort(()=>Math.random()-0.5).slice(0,speedTotalQ);
  speedQNum=0;speedScore=0;
  document.getElementById('speedStartBtn').style.display='none';
  document.getElementById('speedResult').textContent='';
  showSpeedQ();
}

function showSpeedQ(){
  if(speedQNum>=speedTotalQ){endSpeed();return;}
  speedCurrent=speedQsList[speedQNum];speedTimeLeft=10;
  const area=document.getElementById('speedArea');
  if(!area) return;
  area.innerHTML=`
    <div class="speed-timer" id="sTimer">⏱️ ${speedTimeLeft}s</div>
    <div style="font-size:0.9rem;font-weight:800;color:#888;text-align:center;">Question ${speedQNum+1} of ${speedTotalQ}</div>
    <div class="speed-q">${speedCurrent.q} = ?</div>
    <input type="number" class="speed-answer" id="sInput" placeholder="?" autocomplete="off" inputmode="numeric">
    <div class="btn-group" style="justify-content:center;margin-top:10px;">
      <button class="btn btn-indigo" onclick="checkSpeed()">✅ Check!</button>
    </div>
    <div id="sFeedback" style="text-align:center;font-size:1.1rem;font-weight:800;min-height:32px;margin-top:8px;"></div>`;
  document.getElementById('sInput').focus();
  document.getElementById('sInput').onkeydown=(e)=>{if(e.key==='Enter')checkSpeed();};
  clearInterval(speedInterval);
  speedInterval=setInterval(()=>{
    speedTimeLeft--;
    const t=document.getElementById('sTimer');
    if(t)t.textContent='⏱️ '+speedTimeLeft+'s';
    if(speedTimeLeft<=0){clearInterval(speedInterval);skipSpeedQ();}
  },1000);
}

function checkSpeed(){
  clearInterval(speedInterval);
  const inp=document.getElementById('sInput');if(!inp)return;
  const ans=+inp.value;const fb=document.getElementById('sFeedback');
  if(ans===speedCurrent.a){
    fb.textContent='✅ Correct! +1 star!';
    fb.style.color='var(--green)';
    speedScore++;
    addStar(1);
    progressChallenge('speed', 1);
  }
  else{
    fb.textContent=`❌ Answer was ${speedCurrent.a}`;
    fb.style.color='var(--red)';
  }
  speedQNum++;
  setTimeout(showSpeedQ,1000);
}

function skipSpeedQ(){
  const fb=document.getElementById('sFeedback');
  if(fb){fb.textContent=`⏰ Time's up! Answer was ${speedCurrent.a}`;fb.style.color='var(--red)';}
  speedQNum++;setTimeout(showSpeedQ,1000);
}

function endSpeed(){
    const area=document.getElementById('speedArea');
    checkAchievements('speed', speedScore);
    area.innerHTML = `
        <div style="text-align:center;padding:20px;">
            <div style="font-size:3rem;">🏆</div>
            <h2 style="font-family:'Baloo 2',cursive;font-size:1.8rem;margin-bottom:10px;">Finished!</h2>
            <p style="font-size:1.2rem;font-weight:800;margin-bottom:20px;">You got ${speedScore} out of ${speedTotalQ}!</p>
            <button class="btn btn-indigo" onclick="startSpeed()">Play Again!</button>
        </div>
    `;
    document.getElementById('speedStartBtn').style.display='inline-flex';
}

// ============================================================
// DIVISION: SHARING MACHINE
// ============================================================
let shareTotal=8, shareInBox1=0, shareInBox2=0;
function resetShare(){
    shareTotal = [4,6,8,10,12][Math.floor(Math.random()*5)];
    shareInBox1=0; shareInBox2=0;
    const cont = document.getElementById('shareItems'); 
    if(!cont) return;
    cont.innerHTML='';
    const status = document.getElementById('shareStatus'); status.textContent = `Can you share ${shareTotal} apples?`;
    status.style.color = 'var(--teal)';
    const bin1 = document.getElementById('bin1'); bin1.innerHTML='Box 1';
    const bin2 = document.getElementById('bin2'); bin2.innerHTML='Box 2';
    
    for(let i=0; i<shareTotal; i++){
        const item = document.createElement('div');
        item.className = 'share-apple';
        item.textContent = '🍎';
        item.style.cursor = 'pointer';
        item.style.fontSize = '2rem';
        item.onclick = () => {
            if(item.parentElement.id === 'shareItems'){
                if(shareInBox1 <= shareInBox2) {
                    document.getElementById('bin1').appendChild(item);
                    shareInBox1++;
                } else {
                    document.getElementById('bin2').appendChild(item);
                    shareInBox2++;
                }
                checkShare();
            }
        };
        cont.appendChild(item);
    }
}
function checkShare(){
    const status = document.getElementById('shareStatus');
    const remaining = document.getElementById('shareItems').children.length;
    if(remaining === 0){
        if(shareInBox1 === shareInBox2){
            status.textContent = `🎉 Perfect! ${shareTotal} ÷ 2 = ${shareInBox1} each!`;
            status.style.color = 'var(--green)';
            addStar(2);
            checkAchievements('share', 1);
        } else {
            status.textContent = `❌ Not equal! ${shareInBox1} vs ${shareInBox2}. Try again!`;
            status.style.color = 'var(--red)';
        }
    } else {
        status.textContent = `Sharing... ${remaining} left!`;
    }
}

// ============================================================
// DATA: TALLY & GRAPH
// ============================================================
let tallyA=0, tallyB=0;
function addTally(type){
    if(type === '🍎') tallyA++;
    else tallyB++;
    updateTally();
}
function updateTally(){
    const tA = document.getElementById('tallyA');
    const tB = document.getElementById('tallyB');
    const bA = document.getElementById('barA');
    const bB = document.getElementById('barB');
    if(!tA || !tB) return;
    
    const formatTally = (n) => {
        let simple = '';
        for(let i=1; i<=n; i++){
            simple += '|';
            if(i%5 === 0) simple += ' ';
        }
        return simple;
    };
    
    tA.textContent = formatTally(tallyA);
    tB.textContent = formatTally(tallyB);
    if(bA) bA.style.height = (tallyA * 15) + 'px';
    if(bB) bB.style.height = (tallyB * 15) + 'px';
    
    if(tallyA + tallyB === 10) {
        addStar(1);
    }
}
function resetTally(){
    tallyA=0; tallyB=0;
    updateTally();
}

// ============================================================
// PLACE VALUE: NUMBER BUILDER
// ============================================================
let pvH=0, pvT=0, pvU=0;
function addPV(type){
    if(type === 'H' && pvH < 9) pvH++;
    if(type === 'T' && pvT < 9) pvT++;
    if(type === 'U' && pvU < 9) pvU++;
    updatePVDisplay();
}
function updatePVDisplay(){
    const h = document.getElementById('pvH');
    const t = document.getElementById('pvT');
    const u = document.getElementById('pvU');
    const tot = document.getElementById('pvTotal');
    if(!h || !t || !u || !tot) return;
    
    h.innerHTML=''; t.innerHTML=''; u.innerHTML='';
    for(let i=0; i<pvH; i++) h.innerHTML += '<div style="width:30px;height:30px;background:var(--purple);border:2px solid #fff;border-radius:4px;"></div>';
    for(let i=0; i<pvT; i++) t.innerHTML += '<div style="width:10px;height:40px;background:var(--blue);border:2px solid #fff;border-radius:2px;"></div>';
    for(let i=0; i<pvU; i++) u.innerHTML += '<div style="width:12px;height:12px;background:var(--orange);border:2px solid #fff;border-radius:2px;"></div>';
    
    tot.textContent = (pvH * 100) + (pvT * 10) + pvU;
    if(tot.textContent > 0 && tot.textContent % 100 === 0) { addStar(1); }
}
function resetPV(){ pvH=0; pvT=0; pvU=0; updatePVDisplay(); }

// ============================================================
// COMPARISON: BALANCER
// ============================================================
let compL=0, compR=0, compSign='';
function newCompare(){
    const lEl = document.getElementById('compL');
    if(!lEl) return;
    compL = Math.floor(Math.random() * 50);
    compR = Math.floor(Math.random() * 50);
    if(Math.random() > 0.8) compR = compL; // Make equals possible
    lEl.textContent = compL;
    document.getElementById('compR').textContent = compR;
    document.getElementById('compSign').textContent = '?';
    document.getElementById('compFeedback').textContent = '';
}
function checkCompare(sign){
    const signBox = document.getElementById('compSign');
    const fb = document.getElementById('compFeedback');
    signBox.textContent = sign;
    
    let correct = false;
    if(sign === '<' && compL < compR) correct = true;
    if(sign === '>' && compL > compR) correct = true;
    if(sign === '=' && compL === compR) correct = true;
    
    if(correct){
        fb.textContent = '🎉 Yes! The gator is happy!';
        fb.style.color = 'var(--green)';
        addStar(1);
        setTimeout(newCompare, 2000);
    } else {
        fb.textContent = '❌ Try again! Look closely!';
        fb.style.color = 'var(--red)';
    }
}


// ============================================================
// BADGE DISPLAY
// ============================================================
function updateBadgeGrid() {
  const grid = document.getElementById('badgeGrid');
  if(!grid) return;
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const isEarned = earnedBadges.includes(a.id);
    const item = document.createElement('div');
    item.className = 'badge-item' + (isEarned ? ' earned' : '');
    item.innerHTML = `
      <div class="badge-icon">${a.icon}</div>
      <div class="badge-name">${a.name}</div>
    `;
    item.title = isEarned ? a.desc : 'Keep learning to unlock!';
    grid.appendChild(item);
  });
}

function showBadges() {
  updateBadgeGrid();
  document.getElementById('badgeOverlay').classList.add('show');
}

// ============================================================
// CERTIFICATE
// ============================================================
function showCert(){
    const dateEl = document.getElementById('certDate');
    if(dateEl) dateEl.textContent = new Date().toLocaleDateString();
    document.getElementById('certOverlay').classList.add('show');
    launchConfetti();
}
function closeCert(){
    document.getElementById('certOverlay').classList.remove('show');
}

function newQuiz(sIdx) {
  const bank = QUIZ_BANKS[sIdx];
  const qObj = bank[Math.floor(Math.random() * bank.length)];
  const qEl = document.getElementById(`q${sIdx}-q`);
  const optsEl = document.getElementById(`q${sIdx}-opts`);
  const fbEl = document.getElementById(`q${sIdx}-fb`);
  
  if (!qEl) return;
  qEl.textContent = qObj.q;
  optsEl.innerHTML = '';
  fbEl.style.display = 'none';

  qObj.o.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'q-opt';
    btn.textContent = opt;
    btn.onclick = () => {
      optsEl.querySelectorAll('.q-opt').forEach(b => b.style.pointerEvents = 'none');
      if (opt === qObj.a) {
        btn.classList.add('correct');
        fbEl.className = 'quiz-fb good';
        fbEl.textContent = '🌟 Correct! You are amazing!';
        fbEl.style.display = 'block';
        addStar(1);
      } else {
        btn.classList.add('wrong');
        fbEl.className = 'quiz-fb bad';
        fbEl.textContent = `❌ Not quite! The answer is ${qObj.a}.`;
        fbEl.style.display = 'block';
      }
    };
    optsEl.appendChild(btn);
  });
}

function showMasteryReport(){
    const overlay = document.getElementById('popupOverlay');
    document.getElementById('popEmoji').textContent = '📊';
    document.getElementById('popTitle').textContent = 'Mastery Report';
    document.getElementById('popMsg').innerHTML = `
        <div style="text-align:left;font-size:0.9rem;font-weight:700;">
            <p>🌟 Total Stars: ${stars}</p>
            <p>🚀 Progress: ${Math.round(Math.min(stars*2.5,100))}%</p>
            <hr style="margin:10px 0;border:none;border-top:1px solid #eee;">
            <p style="color:#666;font-size:0.8rem;margin-bottom:15px;">Keep up the great work! You are becoming a Maths Master!</p>
            <button class="btn btn-indigo btn-sm" style="width:100%;margin-bottom:8px;" onclick="showBadges()">🏆 View My Badges</button>
            <button class="btn btn-red btn-sm" style="width:100%;font-size:0.7rem;" onclick="resetAllProgress()">⚠️ Reset All Progress</button>
        </div>
    `;
    overlay.classList.add('show');
}


// Global click listener for general interactions
window.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.closest('.card-grid > div')) {
    // Interaction tracked
  }
});

// ============================================================
// ONBOARDING LOGIC
// ============================================================
function showOnboarding() {
  document.getElementById('onboardingOverlay').classList.add('show');
}
function finishOnboarding() {
  localStorage.setItem('maths_adv_onboarded', 'true');
  document.getElementById('onboardingOverlay').style.animation = 'fadeUp 0.5s reverse forwards';
  setTimeout(() => document.getElementById('onboardingOverlay').classList.remove('show'), 500);
}
