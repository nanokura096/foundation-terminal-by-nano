const files=[
{
id:'AP-000000',
name:'鳴瀬 可楚',
sex:'FEMALE',
age:'29',
division:'Foundation Personnel',
rank:'Research Supervisor',
status:'ACTIVE',
clearance:'3',
profile:'サイト-256所属職員。複数異常案件への対応経験を持つ。',
ability:'[PERSONNEL PROFILE]\n戦闘・調査両面において高い適応能力を示す。\n精神汚染耐性試験にて良好な数値を記録。',
weapon:'SCP-███',
Description:'収容違反時にのみ使用を許可された異常装備。\n攻撃対象の行動結果を強制的に阻害する。',
record:'複数機密記録はO5評議会承認が必要。',
note:'現在も監視継続中。'
}
];

let currentFile=null;
let loginAttempts=0;
let audioCtx=null;

/* ================= AUDIO ================= */

function initAudio(){
  try{
    if(!audioCtx){
      audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    }
    if(audioCtx.state==='suspended') audioCtx.resume();
  }catch(e){}
}

function beep(f,d,v=0.05){
  if(!audioCtx)return;
  try{
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);

    o.frequency.value=f;
    g.gain.setValueAtTime(v,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+d/1000);

    o.start();
    o.stop(audioCtx.currentTime+d/1000);
  }catch(e){}
}

function buzzer(duration=900){
  if(!audioCtx)return;
  try{
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);

    o.type='sawtooth';
    o.frequency.setValueAtTime(120,audioCtx.currentTime);
    o.frequency.linearRampToValueAtTime(70,audioCtx.currentTime+duration/1000);

    g.gain.setValueAtTime(0.15,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+duration/1000);

    o.start();
    o.stop(audioCtx.currentTime+duration/1000);
  }catch(e){}
}

/* ================= SECURITY POPUP ================= */

function securityViolation(){
  buzzer(1300);
  warningPopup.style.display='flex';

  setTimeout(()=>{
    warningPopup.style.display='none';
  },2500);
}

/* ================= LOGIN ================= */

function login(){
  initAudio();

  const u=username.value.trim();
  const p=password.value.trim();

  if(u==='admin'&&p==='226227'){
    loginBox.innerHTML='<div class="blink">AUTHENTICATING...</div>';
    setTimeout(()=>{
      loginScreen.style.display='none';
      startLoadingSequence();
    },1200);
  }else{
    loginAttempts++;
    loginError.innerText='ACCESS DENIED';
    buzzer(900);

    if(loginAttempts>=3) initiateAmnestic();
  }
}

/* ================= AMNESTIC ================= */

function initiateAmnestic(){
  buzzer(1500);
  amnesticOverlay.style.display='flex';
  setTimeout(()=>location.reload(),7000);
}

/* ================= BOOT ================= */

function startLoadingSequence(){
  bootScreen.style.display='block';
  bootScreen.innerHTML='';

  const lines=[
    '> SCP FOUNDATION ENCRYPTED BOOT...',
    '> VERIFYING SITE-256 NETWORK... [OK]',
    '> DECRYPTING SECURE ARCHIVES...',
    '> MEMETIC FILTER ENABLED...',
    '> CLEARANCE LEVEL ACCEPTED...',
    '> WELCOME, AUTHORIZED PERSONNEL.'
  ];

  let i=0;

  function add(){
    if(i<lines.length){
      const d=document.createElement('div');
      d.innerText=lines[i];
      bootScreen.appendChild(d);
      d.scrollIntoView();

      beep(500+i*100,40,.03);
      i++;
      setTimeout(add,700);
    }else{
      setTimeout(finishBoot,1000);
    }
  }

  add();
}

function finishBoot(){
  bootScreen.style.display='none';
  mainTerminal.style.display='block';
  updateClock();
  setInterval(updateClock,1000);
  loadStaffList();
}

function updateClock(){
  statusbar.innerText='FOUNDATION ONLINE / SITE-256 / '+new Date().toLocaleString();
}

/* ================= CLEARANCE ================= */

function getLevel(){
  return parseInt(clearance.value);
}

function deny(){
  result.innerText='ACCESS DENIED\nINSUFFICIENT CLEARANCE';
  tabs.style.display='none';
  currentFile=null;
  securityViolation();
  buzzer(1000);
}

/* ================= SEARCH ================= */

function searchFile(){
  initAudio();

  const id=staffId.value.trim();
  const f=files.find(x=>x.id===id);

  if(!f){
    result.innerText='FILE NOT FOUND';
    buzzer(900);
    return;
  }

  if(getLevel()<parseInt(f.clearance)){
    deny();
    return;
  }

  currentFile=f;
  tabs.style.display='flex';
  showTab('personnel');
}

/* ================= TABS ================= */

function showTab(tab){

  if(!currentFile){
    result.innerText='NO FILE LOADED';
    return;
  }

  if(getLevel()<parseInt(currentFile.clearance)){
    deny();
    return;
  }

  let txt='';

  if(tab==='personnel'){
    txt=
`[PERSONAL DATA]
ID: ${currentFile.id}
SEX: ${currentFile.sex}
AGE: ${currentFile.age}

────────────────────

[FOUNDATION RECORD]
NAME: ${currentFile.name}
DIVISION: ${currentFile.division}
RANK: ${currentFile.rank}
STATUS: ${currentFile.status}

────────────────────

${currentFile.profile}`;
  }

  if(tab==='ability') txt=currentFile.ability;

  if(tab==='artifact')
    txt=`SCP DESIGNATION: ${currentFile.weapon}\n\n${currentFile.Description}`;

  if(tab==='record')
    txt=`RECORD: ${currentFile.record}\n\nNOTE: ${currentFile.note}`;

  result.innerText=txt;
}

/* ================= STAFF LIST ================= */

function loadStaffList(){
  staffList.innerHTML='';

  files.forEach(f=>{
    const d=document.createElement('div');
    d.className='staffEntry';
    d.innerText=`ID: ${f.id} / NAME: ${f.name}`;

    d.onclick=()=>{
      initAudio();
      beep(600,35,.04);

      staffId.value=f.id;

      if(getLevel()<parseInt(f.clearance)){
        deny();
        return;
      }

      searchFile();
    };

    staffList.appendChild(d);
  });
}

function toggleStaffList(){
  beep(700,25,.03);
  staffList.style.display=
    staffList.style.display==='block'?'none':'block';
}

/* ================= EMERGENCY ================= */

function triggerEmergency(){
  buzzer(1800);

  emergencyOverlay.style.display='flex';

  emergencyMsg.innerHTML=
  '[ CONTAINMENT BREACH ]<br><br>Mobile Task Force has been dispatched.<br>Awaiting situation update.';

  emergencyChoices.innerHTML='';

  setTimeout(()=>{
    emergencyMsg.innerHTML='Containment restored?<br><br>';
    emergencyChoices.innerHTML=
    '<button onclick="resolveEmergency()">YES</button><button onclick="forceYes()" id="noBtn">NO</button>';
  },5000);
}

function forceYes(){
  buzzer(700);
  noBtn.innerText='YES';
  noBtn.onclick=resolveEmergency;
  emergencyMsg.innerHTML+='<br>[ NEGATIVE RESPONSE NOT PERMITTED ]';
}

function resolveEmergency(){
  beep(850,50,.04);
  emergencyOverlay.style.display='none';
}

/* ================= EVENTS ================= */

loginBtn.onclick=()=>{beep(700,50,.04);login();};
searchBtn.onclick=()=>{beep(650,40,.04);searchFile();};
staffListTitle.onclick=toggleStaffList;
emergencyBtn.onclick=triggerEmergency;

document.querySelectorAll('#tabs button').forEach(b=>{
  b.onclick=()=>{
    beep(820,30,.03);
    showTab(b.dataset.tab);
  };
});

username.addEventListener('input',()=>{initAudio();beep(950,12,.01);});
password.addEventListener('input',()=>{initAudio();beep(950,12,.01);});
staffId.addEventListener('input',()=>{initAudio();beep(950,12,.01);});
clearance.onchange=()=>{initAudio();beep(750,30,.03);};
