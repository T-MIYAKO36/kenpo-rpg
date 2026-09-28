const CASES={
  1:{title:'一票が消えた朝',game:'開票所バイト',client:'さだ子',image:'sadako.webp',concept:'国民主権・参政権',intro:'私ひとりが投票しても、何も変わらないんじゃないかしら……',judgment:['政策を比べる','一票で意思を示す'],record:'情報を比べ、自分の判断を一票として示す'},
  2:{title:'校則という名の境界線',game:'校則回廊',client:'ケンタ',image:'kenta.webp',concept:'自由・平等・公共の福祉',intro:'この校則、本当に全員へ必要なの？理由を知りたいんだ。',judgment:['目的と必要性','より負担の小さい手段'],record:'目的・必要性・影響を比べて校則を見直す'},
  3:{title:'届かないSOS',game:'福祉窓口バイト',client:'ハルカ',image:'haruka.webp',concept:'生存権・社会権',intro:'生活も子どもの学びも仕事も……どこへ相談すればいいの？',judgment:['本人の希望','複数の支援'],record:'生活・教育・就労の支援を本人の希望に合わせる'},
  4:{title:'拡散された秘密',game:'拡散ストップ作戦',client:'タカシ',image:'takashi.webp',concept:'プライバシー・新しい人権',intro:'住所が分かる写真を勝手に広められた。どう止めればいい？',judgment:['被害拡大を止める','証拠を保存して相談'],record:'拡散を止め、証拠を残し、削除・通報・相談を進める'},
  5:{title:'平和を守る境界線',game:'三条件ゲート',client:'けいじ',image:'keiji.webp',concept:'平和主義・憲法9条',intro:'平和を守るために、何をどこまで認めるべきなんだろう。',judgment:['条文と政府見解を区別','三要件の条件を確認'],record:'目的・代替手段・必要最小限度を条件付きで検討する'},
  6:{title:'いのちの選択',game:'意思決定サポートルーム',client:'みさき',image:'misaki.webp',concept:'自己決定権・幸福追求権',intro:'大切なことだからこそ、納得して自分の意思を決めたい。',judgment:['十分な説明と理解','熟考した本人の意思'],record:'理解・対話・熟考を経て本人が意思を示せる状態を支える'}
};
const TYPES=['知識','意味','適用','判断'];
const SAVE_KEY='noriko-kenpo-v3';
const DEFAULT_SAVE={unlocked:1,cleared:{},seen:{},wrong:[],resolved:[],sound:true,currentRun:null,graduated:null};
const screen=document.querySelector('#screen');
const stage=document.querySelector('#stage');
const norikoImage=document.querySelector('#noriko');
const clientImage=document.querySelector('#client');
const speaker=document.querySelector('#speaker');
const message=document.querySelector('#message');
let save=load();
let run=null;

function load(){
  try{
    const current=localStorage.getItem(SAVE_KEY);
    if(current)return Object.assign({},DEFAULT_SAVE,JSON.parse(current));
    const legacy=JSON.parse(localStorage.getItem('noriko-kenpo-v2')||'null');
    if(legacy){
      const migrated=Object.assign({},DEFAULT_SAVE,legacy,{currentRun:null,resolved:legacy.resolved||[]});
      Object.entries(migrated.cleared||{}).forEach(([id,value])=>{migrated.cleared[id]=Object.assign({plays:1,bestStars:value.correct===4?3:value.correct>=2?2:1,firstTry:value.correct||0},value)});
      return migrated;
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }
  catch{return JSON.parse(JSON.stringify(DEFAULT_SAVE))}
}
function persist(){localStorage.setItem(SAVE_KEY,JSON.stringify(save))}
function checkpoint(){save.currentRun=run?JSON.parse(JSON.stringify(run)):null;persist()}
function say(name,text){speaker.textContent=name;message.textContent=text}
function panel(html){screen.innerHTML=`<section class="panel">${html}</section>`}
function work(html){screen.innerHTML=`<section class="work-panel">${html}</section>`}
function bind(selector,handler){screen.querySelectorAll(selector).forEach(el=>el.addEventListener('click',()=>handler(el)))}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(text){return String(text).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function setHud(id=0){
  const c=CASES[id];
  document.querySelector('#caseNumber').textContent=c?`V2｜CASE ${String(id).padStart(2,'0')}`:'V2｜見習い編';
  document.querySelector('#caseTitle').textContent=c?c.title:'法子とけんぽうくんの事件簿';
  document.querySelector('#soundButton').textContent=`音 ${save.sound?'ON':'OFF'}`;
  document.querySelector('#progress').innerHTML='<i></i><i></i><i></i><i></i><i></i>';
  stage.dataset.case=id;clientImage.hidden=!c;
  if(c){clientImage.src=`../images/${c.image}`;clientImage.alt=`相談者の${c.client}`}
}
function markProgress(n){document.querySelectorAll('#progress i').forEach((dot,i)=>dot.classList.toggle('on',i<n))}
function react(type){
  const source={correct:'noriko_resolved.webp',wrong:'noriko_scared.webp',clear:'noriko_clear.webp',normal:'noriko.webp'}[type]||'noriko.webp';
  norikoImage.src=`../images/${source}`;norikoImage.classList.remove('react-correct','react-wrong','react-clear');void norikoImage.offsetWidth;
  if(type!=='normal')norikoImage.classList.add(`react-${type}`);
  if(['correct','wrong'].includes(type))setTimeout(()=>{norikoImage.src='../images/noriko.webp';norikoImage.classList.remove(`react-${type}`)},720);
}
function reward(text){
  AudioFX.play('reward');react('correct');stage.classList.add('stage-flash');
  const toast=document.createElement('div');toast.className='reward-toast';toast.textContent=text;stage.append(toast);
  setTimeout(()=>{toast.remove();stage.classList.remove('stage-flash')},1350);
}
function celebrate(){
  AudioFX.play('clear');react('clear');clientImage.classList.add('react-clear');
  for(let i=0;i<18;i++){const p=document.createElement('i');p.className='particle';p.style.left=`${8+Math.random()*84}%`;p.style.setProperty('--drift',`${-70+Math.random()*140}px`);p.style.background=i%3===0?'#4ca79d':i%3===1?'#d7ab4e':'#d87665';stage.append(p);setTimeout(()=>p.remove(),1600)}
  setTimeout(()=>clientImage.classList.remove('react-clear'),850);
}

function showTitle(){
  run=null;react('normal');AudioFX.setMode('calm');setHud();
  const resume=save.currentRun?'<button class="primary" id="resume">つづきから</button>':'';
  panel(`<p class="eyebrow">憲法事件調査RPG｜V2</p><h1>法子とけんぽうくんの<br>事件簿</h1><p>6つの事件で、操作しながら憲法の考え方を身につけよう。</p><div class="title-actions">${resume}<button class="secondary" id="files">事件ファイル</button></div>${save.currentRun?'<p class="continue-note">事件の途中経過は自動保存されています。</p>':''}`);
  document.querySelector('#files').onclick=showMap;
  if(save.currentRun)document.querySelector('#resume').onclick=resumeRun;
  say('けんぽうくん','判断する前に、事実と根拠を集めるのが調査の基本だよ！');
}
function showMap(){
  run=null;react('normal');AudioFX.setMode('calm');setHud();
  const ongoing=save.currentRun?'<button class="primary" id="ongoing">調査中の事件へ戻る</button>':'';
  const cards=Object.entries(CASES).map(([id,c])=>{
    const n=Number(id),locked=n>save.unlocked,record=save.cleared[id],seen=(save.seen[id]||[]).length;
    const weak=save.wrong.filter(x=>x.startsWith(`${String(id).padStart(2,'0')}-`)&&!save.resolved.includes(x)).length;
    return `<button class="case-card ${locked?'locked':''} ${record?'cleared':''}" data-case="${id}" ${locked?'disabled':''}><small>CASE ${String(id).padStart(2,'0')} <span class="status">${record?'解決済':''}</span></small><b>${c.game}</b><span>${c.title}</span><div class="case-meta"><em>未出 ${12-seen}</em><em>前回 ${record?record.firstTry+'/4':'--'}</em><em>苦手 ${weak}</em></div></button>`;
  }).join('');
  const allClear=Object.keys(CASES).every(id=>save.cleared[id]);
  const graduation=allClear?`<button class="case-card graduation" id="graduation"><small>FINAL MISSION</small><b>見習い卒業テスト</b><span>${save.graduated?`最高記録 ${save.graduated.best}/10`:'6事件の根拠を組み合わせる10問'}</span></button>`:'';
  panel(`<p class="eyebrow">事件選択</p><h2>調査する事件を選ぼう</h2>${ongoing}<div class="case-grid">${cards}${graduation}</div><button class="secondary" id="title">タイトルへ</button><button class="secondary" id="reset">記録を初期化</button>`);
  bind('[data-case]',el=>startCase(Number(el.dataset.case)));
  if(allClear)document.querySelector('#graduation').onclick=startGraduation;
  if(save.currentRun)document.querySelector('#ongoing').onclick=resumeRun;
  document.querySelector('#title').onclick=showTitle;
  document.querySelector('#reset').onclick=()=>{if(confirm('進行記録を初期化しますか？')){localStorage.removeItem(SAVE_KEY);save=load();showMap()}};
  say('法子','未出問題と苦手概念を見ながら、事件を再調査できるよ。');
}
function startCase(id){
  const plays=save.cleared[id]?.plays||0;
  run={mode:'case',caseId:id,variant:plays%2,phase:'intro',activity:{step:0,score:0,found:[],sequence:[]},questions:pickQuestions(id),qIndex:0,firstTry:0,learned:0,mistakeIds:[],resolvedIds:[],evidence:[]};
  checkpoint();renderIntro();
}
function resumeRun(){
  run=JSON.parse(JSON.stringify(save.currentRun));
  if(run.mode==='graduation'){
    if(run.gradAnswered){run.qIndex++;run.gradAnswered=false;if(run.qIndex>=10)return showEnding()}
    return renderGraduationQuestion();
  }
  if(run.awaitingAdvance){run.qIndex++;run.awaitingAdvance=false;if(run.qIndex>=4)return renderJudgment()}
  renderPhase();
}
function renderPhase(){
  setHud(run.caseId);markProgress({intro:1,activity:2,quiz:3,remedial:3,judgment:4,result:5}[run.phase]||1);
  if(run.phase==='intro')renderIntro();else if(run.phase==='activity')renderActivity();else if(['quiz','remedial'].includes(run.phase))renderQuestion();else if(run.phase==='judgment')renderJudgment();else showResult();
}
function renderIntro(){
  const c=CASES[run.caseId];react('normal');AudioFX.setMode('mystery');setHud(run.caseId);markProgress(1);
  panel(`<p class="eyebrow">CASE ${String(run.caseId).padStart(2,'0')}｜${c.game}</p><h1>${c.title}</h1><p>${c.intro}</p><button class="primary" id="investigate">現場を調べる</button>`);
  document.querySelector('#investigate').onclick=()=>{run.phase='activity';checkpoint();renderActivity()};say(c.client,c.intro);
}
function pickQuestions(id){
  const all=window.QUESTION_BANK[String(id)],seen=save.seen[id]||[],weak=save.wrong.filter(x=>x.startsWith(`${String(id).padStart(2,'0')}-`)&&!save.resolved.includes(x));
  return TYPES.map(type=>{const list=all.filter(q=>q.type===type),priority=list.filter(q=>weak.includes(q.id)),unseen=list.filter(q=>!seen.includes(q.id));return shuffle(priority.length?priority:unseen.length?unseen:list)[0].id});
}
function question(id){return Object.values(window.QUESTION_BANK).flat().find(q=>q.id===id)}
function renderActivity(){
  run.phase='activity';checkpoint();AudioFX.setMode('puzzle');setHud(run.caseId);markProgress(2);
  ({1:case1,2:case2,3:case3,4:case4,5:case5,6:case6}[run.caseId])();
}
function finishActivity(text){run.activity.score=1;checkpoint();say('法子',text);reward('事件の証拠を獲得');setTimeout(startQuiz,1150)}

const CASE1_SHIFTS=[
  [{person:'子育て中の人',concern:'放課後の居場所',correct:'学童保育の時間を延ばす',wrong:['駅前広場を改装する','観光ポスターを増やす']},{person:'商店主',concern:'空き店舗',correct:'創業支援と家賃補助',wrong:['公園の遊具を塗る','記念式典を開く']},{person:'高齢者',concern:'通院手段',correct:'地域バスを維持する',wrong:['花火大会を増やす','庁舎の看板を替える']}],
  [{person:'高校生',concern:'通学費',correct:'公共交通の学生支援',wrong:['観光案内板を増やす','市章を新しくする']},{person:'介護家族',concern:'相談先',correct:'地域包括支援を充実',wrong:['街灯の色を替える','駅前で音楽祭を開く']},{person:'農業者',concern:'担い手不足',correct:'就農支援と研修を増やす',wrong:['庁舎ロビーを改装する','記念品を配る']}]
];
function case1(){
  const shifts=CASE1_SHIFTS[run.variant];
  if(run.activity.step<3){
    const s=shifts[run.activity.step],options=shuffle([s.correct,...s.wrong]);
    work(`<div class="mission-bar"><span>開票所バイト｜政策案内</span><strong>受付 ${run.activity.step+1}/3</strong></div><h2>${s.person}の関心「${s.concern}」</h2><p class="instruction">関心に直接つながる政策を案内しよう。</p><div class="shift-list">${options.map(x=>`<button class="shift-card" data-answer="${esc(x)}"><small>政策カード</small>${x}</button>`).join('')}</div><p id="feedback" class="feedback">名前や雰囲気ではなく、政策の内容で比べよう。</p>`);
    bind('[data-answer]',el=>{if(el.dataset.answer===s.correct){AudioFX.play('correct');react('correct');el.classList.add('done');run.activity.step++;checkpoint();setTimeout(case1,450)}else{AudioFX.play('wrong');react('wrong');el.classList.add('wrong');document.querySelector('#feedback').textContent='関心と政策に共通する言葉・目的を探そう。'}});
  }else{
    work(`<div class="mission-bar"><span>開票所バイト｜開票比較</span><strong>最終作業</strong></div><h2>投票する人数で結果はどう変わる？</h2><div class="turnout-box"><div><div id="people" class="people-grid"></div><input id="turnout" class="range" type="range" min="10" max="40" step="10" value="10"></div><div><div class="meter">候補A <b id="aVotes"></b><i id="aBar" class="bar"></i></div><div class="meter">候補B <b id="bVotes"></b><i id="bBar" class="bar"></i></div></div></div><p id="feedback" class="feedback">10人と40人、両方の開票結果を確認しよう。</p><button class="primary" id="done" disabled>勤務完了</button>`);
    const checked=new Set();const draw=v=>{checked.add(v);document.querySelector('#people').innerHTML=Array.from({length:40},(_,i)=>`<i class="person ${i<v?'on':''}"></i>`).join('');const a=Math.round(v*(v===10?.6:v===20?.45:v===30?.53:.5)),b=v-a;document.querySelector('#aVotes').textContent=`${a}票`;document.querySelector('#bVotes').textContent=`${b}票`;document.querySelector('#aBar').style.width=`${a/v*100}%`;document.querySelector('#bBar').style.width=`${b/v*100}%`;document.querySelector('#feedback').textContent=v===40?'40人全員の選択が結果に数えられた。':'投票しなかった人の考えは、賛成にも反対にも数えられない。';document.querySelector('#done').disabled=!(checked.has(10)&&checked.has(40))};
    document.querySelector('#turnout').oninput=e=>draw(Number(e.target.value));document.querySelector('#done').onclick=()=>finishActivity('政策比較と投票参加の関係を記録した！');draw(10);
  }
}

const CORRIDORS=[
  [{rule:'実習室では保護眼鏡を着ける',purpose:'事故から目を守る',impact:'授業参加への負担は小さい',answer:'進む'},{rule:'地毛も一律に黒く染める',purpose:'外見をそろえる',impact:'身体・個性への負担が大きい',answer:'見直す'},{rule:'試験中はスマホを預ける',purpose:'不正を防ぐ',impact:'時間と場所が限定される',answer:'進む'},{rule:'休日の服装を学校が指定する',purpose:'学校の評判を守る',impact:'校外の私生活まで制限する',answer:'見直す'}],
  [{rule:'体育館で運動靴を使う',purpose:'転倒を防ぐ',impact:'場所と活動が限定される',answer:'進む'},{rule:'理由を問わず髪型を一種類にする',purpose:'統一感を出す',impact:'個性や事情への負担が大きい',answer:'見直す'},{rule:'図書室では通話をしない',purpose:'読書環境を守る',impact:'場所が限定される',answer:'進む'},{rule:'登下校後のSNS投稿を全面禁止する',purpose:'トラブルを防ぐ',impact:'学校外の表現まで広く制限する',answer:'見直す'}]
];
function case2(){
  const rules=CORRIDORS[run.variant],index=Math.min(run.activity.step,rules.length-1),r=rules[index];
  work(`<div class="mission-bar"><span>校則回廊｜出口まであと ${rules.length-run.activity.step}</span><strong>連続判断 ${run.activity.step}/${rules.length}</strong></div><div class="corridor"><div class="corridor-door">入口</div><div class="rule-file"><b>校則ファイル ${index+1}</b><strong>${r.rule}</strong><p>目的：${r.purpose}<br>影響：${r.impact}</p></div><div class="corridor-door">出口</div></div><div class="action-grid"><button class="choice" data-decision="進む">根拠がつながる・進む</button><button class="choice" data-decision="見直す">負担が大きい・見直す</button></div><p id="feedback" class="feedback">目的だけでなく、制限の広さと影響も確認しよう。</p>`);
  bind('[data-decision]',el=>{if(el.dataset.decision===r.answer){AudioFX.play('unlock');react('correct');run.activity.step++;checkpoint();if(run.activity.step===rules.length)finishActivity('目的・必要性・影響を比べて回廊を脱出した！');else setTimeout(case2,430)}else{AudioFX.play('wrong');react('wrong');run.activity.step=Math.max(0,run.activity.step-1);checkpoint();document.querySelector('#feedback').textContent='回廊が一つ戻った。目的に対して制限が広すぎないか考えよう。';setTimeout(case2,800)}});
}

const WELFARE=[
  [{name:'住まいと食費に困っている',right:'健康で文化的な最低限度の生活',support:'生活相談・生活保護'},{name:'子どもの教材費が払えない',right:'教育を受ける機会',support:'就学援助・教育相談'},{name:'突然、賃金を下げられた',right:'働く人の権利',support:'労働相談'}],
  [{name:'家族の介護で仕事を続けにくい',right:'生活と労働の保障',support:'介護相談・就労相談'},{name:'病気で収入が途絶えた',right:'生存権・社会保障',support:'福祉窓口・医療相談'},{name:'長時間労働を断れない',right:'働く人の権利',support:'労働基準監督署・労働相談'}]
];
function case3(){
  const clients=WELFARE[run.variant],c=clients[run.activity.step];
  if(!c)return finishActivity('困りごと・権利・支援先を正確につないだ！');
  const options=shuffle(clients.map(x=>x.support));
  work(`<div class="mission-bar"><span>福祉窓口バイト</span><strong>受付残り ${clients.length-run.activity.step}</strong></div><div class="route-map"><div class="route-node"><small>困りごと</small><br><b>${c.name}</b></div><span class="route-arrow">→</span><div class="route-node"><small>関係する権利</small><br><b>${c.right}</b></div></div><p class="instruction">速さより正確さ。本人の困りごとに合う窓口を選ぼう。</p><div class="action-grid">${options.map(x=>`<button class="choice" data-support="${esc(x)}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">制度名だけでなく、何を支える制度かを確かめよう。</p>`);
  bind('[data-support]',el=>{if(el.dataset.support===c.support){AudioFX.play('correct');react('correct');run.activity.step++;checkpoint();setTimeout(case3,440)}else{AudioFX.play('wrong');react('wrong');el.disabled=true;el.classList.add('wrong');document.querySelector('#feedback').textContent='相談内容と、窓口が支える生活場面をもう一度結びつけよう。'}});
}

const PRIVACY_CLUES=[['位置情報','家の表札','制服の校章'],['宅配ラベル','窓から見える店名','位置タグ']];
const STOP_STEPS=['証拠を保存','削除を依頼','運営へ通報','大人・窓口に相談'];
function case4(){
  const clues=PRIVACY_CLUES[run.variant];
  if(run.activity.step===0){
    work(`<div class="mission-bar"><span>拡散ストップ作戦｜特定手がかり</span><strong>${run.activity.found.length}/3</strong></div><div class="social-scene">${[...clues,'写真の明るさ'].map(x=>`<button class="clue ${run.activity.found.includes(x)?'found':''}" data-clue="${esc(x)}" ${run.activity.found.includes(x)?'disabled':''}>${x}</button>`).join('')}</div><p id="feedback" class="feedback">住所や学校、生活範囲の特定につながる情報を3つ探そう。</p>`);
    bind('[data-clue]',el=>{const value=el.dataset.clue;if(clues.includes(value)){AudioFX.play('unlock');el.classList.add('found');el.disabled=true;run.activity.found.push(value);checkpoint();if(run.activity.found.length===3){run.activity.step=1;checkpoint();setTimeout(case4,500)}}else{AudioFX.play('wrong');react('wrong');document.querySelector('#feedback').textContent='明るさそのものは個人の特定情報ではない。場所・所属・住所につながる手がかりを探そう。'}});
  }else{
    const next=STOP_STEPS[run.activity.sequence.length];
    work(`<div class="mission-bar"><span>拡散ストップ作戦｜被害を止める</span><strong>${run.activity.sequence.length}/4</strong></div><h2>安全な対応順に実行しよう</h2><div class="sequence">${shuffle(STOP_STEPS).map(x=>`<button class="choice" data-step="${esc(x)}" ${run.activity.sequence.includes(x)?'disabled':''}>${x}</button>`).join('')}</div><div class="sequence-log">${run.activity.sequence.map((x,i)=>`<span>${i+1}. ${x}</span>`).join('')}</div><p id="feedback" class="feedback">投稿を消す前に、相談や申立てに使える記録を残そう。</p>`);
    bind('[data-step]',el=>{if(el.dataset.step===next){AudioFX.play('unlock');run.activity.sequence.push(next);checkpoint();if(run.activity.sequence.length===4)finishActivity('特定手がかりを見つけ、拡散を止める手順を実行した！');else setTimeout(case4,350)}else{AudioFX.play('wrong');react('wrong');document.querySelector('#feedback').textContent=run.activity.sequence.length===0?'先に消すと記録も失うことがある。まず証拠を保存しよう。':'被害を止めつつ、記録・申立て・相談の順序を考えよう。'}});
  }
}

const GATE_SCENARIOS=[
  {title:'遠隔地への攻撃が続き、住民に重大な被害のおそれ',facts:[['危険','重大で差し迫った危険が示されている'],['代替','避難・外交など他の手段を検討済み'],['限度','住民保護に必要な範囲へ限定']],gates:[true,true,true]},
  {title:'緊張が高まっているが、具体的な攻撃情報は未確認',facts:[['危険','一般的な緊張の情報のみ'],['代替','外交・避難などは検討中'],['限度','活動範囲はまだ決まっていない']],gates:[false,false,false]}
];
function case5(){
  const s=GATE_SCENARIOS[run.variant],index=run.activity.step;
  if(index<3){
    const labels=['明白な危険','他に適当な手段がない','必要最小限度'],fact=s.facts[index],correct=s.gates[index]?'そろう':'不足';
    work(`<div class="mission-bar"><span>三条件ゲート｜政府が示す判断枠組み</span><strong>${index+1}/3</strong></div><div class="scenario-card"><b>${s.title}</b><dl>${s.facts.map(x=>`<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('')}</dl></div><h2>ゲート「${labels[index]}」の情報は？</h2><div class="action-grid"><button class="choice" data-gate="そろう">条件を確かめる情報がそろう</button><button class="choice" data-gate="不足">情報が不足している</button></div><p id="feedback" class="feedback">賛成・反対ではなく、示された事実が条件を支えるか確認しよう。</p><p class="framework-note">※これは政府が示す武力行使の判断枠組みを学ぶ活動です。憲法9条をめぐっては異なる見解があります。</p>`);
    bind('[data-gate]',el=>{if(el.dataset.gate===correct){AudioFX.play('unlock');react('correct');run.activity.step++;checkpoint();setTimeout(case5,420)}else{AudioFX.play('wrong');react('wrong');document.querySelector('#feedback').textContent='書かれていない情報を推測で補わず、事実カードにある内容だけで判断しよう。'}});
  }else{
    const complete=s.gates.every(Boolean),correct=complete?'三条件の情報がそろう':'現段階では情報不足';
    work(`<div class="mission-bar"><span>三条件ゲート｜総合判定</span><strong>FINAL</strong></div><div class="gate-checks">${s.gates.map((x,i)=>`<div class="gate-check ${x?'open':'missing'}"><b>条件${i+1}</b><br>${x?'確認できた':'情報不足'}</div>`).join('')}</div><h2>この資料から言えることは？</h2><div class="action-grid"><button class="choice" data-final="三条件の情報がそろう">三条件の情報がそろう</button><button class="choice" data-final="現段階では情報不足">現段階では情報不足</button></div><p id="feedback" class="feedback">条件が一つでも確認できなければ、資料だけで結論を出さない。</p><p class="framework-note">※ここで判定するのは政治的な賛否ではなく、提示資料と判断枠組みの対応です。</p>`);
    bind('[data-final]',el=>{if(el.dataset.final===correct)finishActivity('三条件を、推測ではなく提示された事実で確認した！');else{AudioFX.play('wrong');react('wrong');document.querySelector('#feedback').textContent='3つのゲートの表示を見直そう。条件の情報はすべてそろっている？'}});
  }
}

const MEDICAL=[
  [{term:'予後',plain:'これから病気がどう進む見込みか'},{term:'副作用',plain:'治療の目的以外に起こる望ましくない作用'}],
  [{term:'治療の選択肢',plain:'選べる治療法と、それぞれの違い'},{term:'同意',plain:'説明を理解したうえで受け入れる意思'}]
];
function case6(){
  const pairs=MEDICAL[run.variant];
  if(run.activity.step<2){
    const p=pairs[run.activity.step],options=shuffle([p.plain,'医師が一人で結論を決めること','家族の多数決で決めること']);
    work(`<div class="mission-bar"><span>意思決定サポート｜ことばを整える</span><strong>${run.activity.step+1}/2</strong></div><div class="plain-pair"><div><small>説明に出た言葉</small><h2>${p.term}</h2></div><span>→</span><div><small>本人に伝わる表現を選ぶ</small></div></div><div class="action-grid">${options.map(x=>`<button class="choice" data-plain="${esc(x)}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">専門用語を、意味を変えずに分かる言葉へ直そう。</p>`);
    bind('[data-plain]',el=>{if(el.dataset.plain===p.plain){AudioFX.play('correct');react('correct');run.activity.step++;checkpoint();setTimeout(case6,420)}else{AudioFX.play('wrong');react('wrong');el.disabled=true;el.classList.add('wrong');document.querySelector('#feedback').textContent='本人が選べるように、言葉の意味を具体的に説明しよう。'}});
  }else{
    const keys=['十分な説明','本人の理解','考える時間','本人の意思'];
    work(`<div class="mission-bar"><span>意思決定サポート｜4つの鍵</span><strong>${run.activity.found.length}/4</strong></div><h2>納得して決める過程を支えよう</h2><div class="key-rack">${[...keys,'周囲の多数決'].map(x=>`<button class="decision-key ${run.activity.found.includes(x)?'on':''}" data-key="${x}" ${run.activity.found.includes(x)?'disabled':''}>${x}</button>`).join('')}</div><p id="feedback" class="feedback">特定の結論へ誘導せず、本人が意思をつくるための条件を選ぼう。</p>`);
    bind('[data-key]',el=>{const v=el.dataset.key;if(keys.includes(v)){AudioFX.play('unlock');el.classList.add('on');el.disabled=true;run.activity.found.push(v);checkpoint();if(run.activity.found.length===4)finishActivity('説明・理解・熟考・本人意思の4つの鍵がそろった！')}else{AudioFX.play('wrong');react('wrong');document.querySelector('#feedback').textContent='周囲の意見は参考にできるが、本人の医療判断を多数決だけでは決められない。'}});
  }
}

function startQuiz(){run.phase='quiz';run.qIndex=0;checkpoint();AudioFX.setMode('puzzle');renderQuestion()}
function renderQuestion(){
  run.phase='quiz';run.awaitingAdvance=false;checkpoint();setHud(run.caseId);markProgress(3);
  const q=question(run.questions[run.qIndex]);
  work(`<div class="work-head"><div><span class="mini-label">${q.type} ${run.qIndex+1} / 4</span><h2>${q.question}</h2></div></div><div id="answers" class="answer-grid">${shuffle(q.choices.map((text,index)=>({text,correct:index===q.answer}))).map(x=>`<button class="choice" data-correct="${x.correct}">${x.text}</button>`).join('')}</div><p id="feedback" class="feedback">根拠まで説明できる答えを選ぼう。</p><button id="next" class="primary" hidden>${run.qIndex===3?'最終判断へ':'次の問題へ'}</button>`);
  let attempts=0;
  bind('[data-correct]',el=>{
    if(el.dataset.correct==='true'){
      AudioFX.play('correct');react('correct');el.classList.add('correct');screen.querySelectorAll('[data-correct]').forEach(b=>b.disabled=true);
      if(attempts===0)run.firstTry++;else{run.resolvedIds.push(q.id);save.resolved=[...new Set([...save.resolved,q.id])]};run.learned++;save.seen[run.caseId]=[...new Set([...(save.seen[run.caseId]||[]),q.id])];
      run.awaitingAdvance=true;document.querySelector('#feedback').textContent=`正解！ ${q.explanation}`;document.querySelector('#next').hidden=false;checkpoint();
    }else{
      attempts++;AudioFX.play('wrong');react('wrong');el.disabled=true;el.classList.add('wrong');run.mistakeIds.push(q.id);save.wrong=[...new Set([...save.wrong,q.id])];
      if(attempts===1)document.querySelector('#feedback').textContent='ヒント：問いの中心語と、各選択肢の理由を比べよう。';
      else{screen.querySelectorAll('[data-correct]').forEach(b=>b.disabled=true);document.querySelector('#feedback').innerHTML=`<b>考え方：</b>${q.explanation}<br>短い類題で確かめよう。`;document.querySelector('#next').textContent='類題へ';document.querySelector('#next').hidden=false;document.querySelector('#next').onclick=()=>renderRemedial(q);}
      checkpoint();
    }
  });
  document.querySelector('#next').onclick=advanceQuestion;
}
function renderRemedial(original){
  run.phase='remedial';run.awaitingAdvance=false;checkpoint();
  const pool=window.QUESTION_BANK[String(run.caseId)].filter(q=>q.type===original.type&&q.id!==original.id),q=shuffle(pool)[0];
  work(`<div class="work-head"><div><span class="mini-label">学び直し｜${original.type}</span><h2>${q.question}</h2></div></div><div id="answers" class="answer-grid">${shuffle(q.choices.map((text,index)=>({text,correct:index===q.answer}))).map(x=>`<button class="choice" data-correct="${x.correct}">${x.text}</button>`).join('')}</div><div class="remedial"><b>さっきの考え方を別の場面で使おう。</b><br>${original.explanation}</div><p id="feedback" class="feedback">類題に正解すると、苦手概念の学び直し完了。</p>`);
  bind('[data-correct]',el=>{if(el.dataset.correct==='true'){AudioFX.play('correct');react('correct');screen.querySelectorAll('[data-correct]').forEach(b=>b.disabled=true);el.classList.add('correct');run.resolvedIds.push(original.id);run.learned++;run.awaitingAdvance=true;save.resolved=[...new Set([...save.resolved,original.id])];save.seen[run.caseId]=[...new Set([...(save.seen[run.caseId]||[]),original.id,q.id])];checkpoint();document.querySelector('#feedback').textContent=`学び直し完了！ ${q.explanation}`;const next=document.createElement('button');next.className='primary';next.textContent=run.qIndex===3?'最終判断へ':'次の問題へ';next.onclick=advanceQuestion;screen.querySelector('.work-panel').append(next)}else{AudioFX.play('wrong');react('wrong');el.disabled=true;el.classList.add('wrong');document.querySelector('#feedback').textContent=`もう一度。${q.explanation}`}});
}
function advanceQuestion(){run.qIndex++;run.awaitingAdvance=false;if(run.qIndex<4)renderQuestion();else renderJudgment()}
function renderJudgment(){
  run.phase='judgment';checkpoint();AudioFX.setMode('tension');setHud(run.caseId);markProgress(4);const c=CASES[run.caseId];
  const distractors={1:['納税の義務','印象だけで選ぶ'],2:['校則は絶対','自由なら制限不要'],3:['一つの制度だけ','本人に聞かず決定'],4:['仕返しに拡散','証拠をすぐ消す'],5:['賛否だけで決定','条文と政府見解は同じ'],6:['結論を急がせる','家族だけで決定']}[run.caseId];
  work(`<div class="work-head"><div><span class="mini-label">最終判断</span><h2>事件記録に残す根拠を2つ選ぼう</h2></div></div><p class="judgment">${c.record}</p><div class="evidence-grid">${shuffle([...c.judgment,...distractors]).map(x=>`<button class="choice" data-evidence="${esc(x)}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">ミニゲームと問題で確かめた根拠を使おう。</p><button id="resolve" class="primary" disabled>この判断で報告する</button>`);
  bind('[data-evidence]',el=>{const v=el.dataset.evidence;if(c.judgment.includes(v)){if(run.evidence.includes(v))return;AudioFX.play('unlock');react('correct');run.evidence.push(v);el.classList.add('correct');el.disabled=true;document.querySelector('#feedback').textContent=`根拠 ${run.evidence.length}/2。`;document.querySelector('#resolve').disabled=run.evidence.length<2;checkpoint()}else{AudioFX.play('wrong');react('wrong');el.classList.add('wrong');setTimeout(()=>el.classList.remove('wrong'),350);document.querySelector('#feedback').textContent='今回集めた証拠と直接つながるものを選ぼう。'}});
  document.querySelector('#resolve').onclick=showResult;
}
function showResult(){
  run.phase='result';setHud(run.caseId);markProgress(5);const id=run.caseId,c=CASES[id];
  const mistakes=[...new Set(run.mistakeIds)],resolved=mistakes.every(x=>run.resolvedIds.includes(x)),starParts=[true,run.firstTry>=3,resolved];const stars=starParts.filter(Boolean).length;
  const previous=save.cleared[id]||{plays:0,bestStars:0};save.cleared[id]={firstTry:run.firstTry,learned:run.learned,stars,date:new Date().toISOString(),plays:(previous.plays||0)+1,bestStars:Math.max(previous.bestStars||0,stars)};save.unlocked=Math.max(save.unlocked,Math.min(6,id+1));save.currentRun=null;persist();
  panel(`<p class="stamp">事件解決</p><h2>${c.title}</h2><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><div class="score-strip"><div><b>操作・根拠</b>完遂 ★</div><div><b>初回正答</b>${run.firstTry}/4 ${run.firstTry>=3?'★':'☆'}</div><div><b>学び直し</b>${resolved?'完了 ★':'未完了 ☆'}</div></div><div class="record"><div><b>あなたの判断</b><span>${c.record}</span></div><div><b>憲法の根拠</b><span>${c.concept}</span></div></div><button class="primary" id="map">事件一覧へ</button><button class="secondary" id="again">条件を変えて再調査</button>`);
  AudioFX.setMode('ending');celebrate();document.querySelector('#map').onclick=showMap;document.querySelector('#again').onclick=()=>startCase(id);say(c.client,'根拠を確かめて、自分で判断できた。ありがとう！');
}

function startGraduation(){
  const chosen=Object.keys(CASES).map(id=>shuffle(window.QUESTION_BANK[id])[0]);const used=new Set(chosen.map(q=>q.id));const extras=shuffle(Object.values(window.QUESTION_BANK).flat().filter(q=>!used.has(q.id))).slice(0,4);
  run={mode:'graduation',phase:'graduation',questions:[...chosen,...extras].map(q=>q.id),qIndex:0,score:0};checkpoint();renderGraduationQuestion();
}
function renderGraduationQuestion(){
  setHud();stage.dataset.case=0;AudioFX.setMode('tension');const q=question(run.questions[run.qIndex]);
  work(`<div class="mission-bar"><span>見習い卒業テスト</span><strong>${run.qIndex+1}/10</strong></div><span class="mini-label">CASE ${q.id.slice(0,2)}｜${q.type}</span><h2>${q.question}</h2><div class="answer-grid">${shuffle(q.choices.map((text,index)=>({text,correct:index===q.answer}))).map(x=>`<button class="choice" data-grad="${x.correct}">${x.text}</button>`).join('')}</div><p id="feedback" class="feedback">6事件で集めた考え方を組み合わせよう。</p><button class="primary" id="next" hidden>${run.qIndex===9?'卒業判定へ':'次の問題へ'}</button>`);
  let answered=false;run.gradAnswered=false;bind('[data-grad]',el=>{if(answered)return;answered=true;run.gradAnswered=true;screen.querySelectorAll('[data-grad]').forEach(b=>b.disabled=true);if(el.dataset.grad==='true'){run.score++;el.classList.add('correct');AudioFX.play('correct');react('correct');document.querySelector('#feedback').textContent=`正解！ ${q.explanation}`}else{el.classList.add('wrong');AudioFX.play('wrong');react('wrong');document.querySelector('#feedback').textContent=`確認：${q.explanation}`}document.querySelector('#next').hidden=false;checkpoint()});
  document.querySelector('#next').onclick=()=>{run.qIndex++;run.gradAnswered=false;if(run.qIndex<10)renderGraduationQuestion();else showEnding()};say('けんぽうくん','事件名ではなく、根拠と事例を結びつけよう！');
}
function showEnding(){
  const passed=run.score>=8,best=Math.max(save.graduated?.best||0,run.score);save.graduated={best,date:new Date().toISOString()};save.currentRun=null;persist();setHud();AudioFX.setMode('ending');celebrate();
  panel(`<div class="ending-badge">憲法事件<br>調査員</div><h1>${passed?'見習い卒業！':'あと一歩！'}</h1><p>卒業テスト ${run.score}/10</p><p>${passed?'6つの事件で、事実を調べ、根拠を比べ、自分の判断をつくりました。':'8問正解で卒業。苦手な事件を再調査して、もう一度挑戦しよう。'}</p><button class="primary" id="map">事件一覧へ</button><button class="secondary" id="retry">もう一度挑戦</button>`);
  document.querySelector('#map').onclick=showMap;document.querySelector('#retry').onclick=startGraduation;say('法子',passed?'答えを覚えるだけじゃなく、根拠で判断できる調査員になったよ！':'苦手は次の調査先が分かった印。事件ファイルへ戻ろう！');
}

document.querySelector('#homeButton').onclick=()=>{if(run&&run.phase!=='result')checkpoint();showMap()};
document.addEventListener('pointerdown',()=>{AudioFX.unlock();AudioFX.setEnabled(save.sound)},{once:true});
document.addEventListener('click',event=>{const target=event.target.closest('button');if(target&&!target.matches('[data-correct],[data-grad],[data-evidence]'))AudioFX.play('click')});
document.querySelector('#soundButton').onclick=()=>{save.sound=!save.sound;AudioFX.setEnabled(save.sound);persist();document.querySelector('#soundButton').textContent=`音 ${save.sound?'ON':'OFF'}`};
if(!save.sound)AudioFX.setEnabled(false);
showTitle();
