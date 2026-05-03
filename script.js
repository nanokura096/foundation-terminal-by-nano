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

need:'LEVEL-3',

profile:'サイト-256所属職員。複数異常案件への対応経験を持つ。',
ability:'戦闘・調査両面において高い適応能力を示す。',
weapon:'SCP-███',
weaponinfo:'収容違反時にのみ使用許可。',
record:'O5承認が必要な機密記録あり。',
note:'現在も監視継続中。',

extraInfo:[
  {level:1,label:"NOTE",value:"通常観察対象として登録済み"},
  {level:3,label:"BEHAVIOR",value:"異常な集中力および判断速度の上昇を確認"},
  {level:4,label:"CLASSIFIED",value:"O5評議会管理下データ。閲覧制限あり"},
  {level:5,label:"BLACK",value:"████████████████████"}
]
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

function buzzer(t=900){
  if(!audioCtx)return;
  try{
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);

    o.type='sawtooth';
    o.frequency.setValueAtTime(120,audioCtx.currentTime);
    o.frequency.linearRampToValueAtTime(70,audioCtx.currentTime+t/1000);

    g.gain.setValueAtTime(0.15,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+t/1000);

    o.start();
    o.stop(audioCtx.currentTime+t/1000);
  }catch(e){}
}

/* ================= CLEARANCE ================= */

function getLevel(){
  return parseInt(clearance.value);
}

function deny(){
  result.innerText='ACCESS DENIED\nINSUFFICIENT CLEARANCE';
  tabs.style.display='none';
  currentFile=null;
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

/* ================= TAB SYSTEM ================= */

function getStatusClass(status){
  switch(status){
    case "ACTIVE":
      return "status-active";
    case "KIA":
      return "status-kia";
    case "TERMINATED":
      return "status-terminated";
    default:
      return "status-unknown";
  }
}

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

    const statusClass = getStatusClass(currentFile.status);

    txt =
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

    /* ================= ADDITIONAL INFO ================= */
    const extra = currentFile.extraInfo || [];
    const filtered = extra.filter(e => getLevel() >= e.level);

    if(filtered.length > 0){
      txt += `\n\n────────────────────\n[ADDITIONAL DATA]\n`;

      filtered.forEach(e=>{
        txt += `\n[LV${e.level}] ${e.label}\n${e.value}\n`;
      });
    }

    /* ステータス表示をHTMLで追加 */
    txt += `\n\nSTATUS: <span class="${statusClass}">${currentFile.status}</span>`;
  }

  if(tab==='ability') txt=currentFile.ability;

  if(tab==='artifact')
    txt=`SCP DESIGNATION: ${currentFile.weapon}\n\n${currentFile.weaponinfo}`;

  if(tab==='record')
    txt=`RECORD: ${currentFile.record}\n\nNOTE: ${currentFile.note}`;

  result.innerHTML = txt;
}

  /* ================= PERSONNEL ================= */
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

    /* ================= ADDITIONAL INFO ================= */
    const extra=currentFile.extraInfo || [];

    const filtered=extra.filter(e=>getLevel()>=e.level);

    if(filtered.length>0){
      txt+=`\n\n────────────────────\n[ADDITIONAL DATA]\n`;

      filtered.forEach(e=>{
        txt+=`\n[LV${e.level}] ${e.label}\n${e.value}\n`;
      });
    }
  }

  if(tab==='ability') txt=currentFile.ability;

  if(tab==='artifact')
    txt=`SCP DESIGNATION: ${currentFile.weapon}\n\n${currentFile.weaponinfo}`;

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

/* ================= UI ================= */

function toggleStaffList(){
  beep(700,25,.03);
  staffList.style.display=
    staffList.style.display==='block'?'none':'block';
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

clearance.onchange=()=>{
  initAudio();
  beep(750,30,.03);
  clearanceAuth();
};
