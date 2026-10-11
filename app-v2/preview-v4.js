const CASES=[
  {title:'一票が消えた朝',concept:'国民主権・参政権',time:'5〜7分',client:'さだ子',image:'sadako.webp',hook:'私の一票で、本当に何か変わるの？',mission:'関心と政策を比べて投票を判断'},
  {title:'校則という名の境界線',concept:'平等・自由',time:'6〜8分',client:'ケンタ',image:'kenta.webp',hook:'地毛まで黒く染める必要があるの？',mission:'校則の目的・必要性・影響を調査'},
  {title:'届かないSOS',concept:'社会権',time:'5〜7分',client:'ハルカ',image:'haruka.webp',hook:'生活も進学も不安。どこに相談すれば？',mission:'困りごと・権利・支援先を接続'},
  {title:'拡散された秘密',concept:'情報の人権',time:'6〜8分',client:'タカシ',image:'takashi.webp',hook:'住所が分かる写真を拡散された！',mission:'危険情報を発見して拡散を止める'},
  {title:'平和を守る境界線',concept:'平和主義・9条',time:'6〜8分',client:'ユウタ',image:'assets/case05-newspaper-student.webp',hook:'9条と自衛隊を学校新聞で伝えたい！',mission:'条文・政府見解・判断条件を整理'},
  {title:'いのちの選択',concept:'自己決定権',time:'5〜7分',client:'みさき',image:'misaki.webp',hook:'説明を理解して、自分で決めたい',mission:'医療用語を整理し意思決定を支援'}
];
const RANKS=[
  {name:'新人見習い',short:'見習い'},
  {name:'事件調査見習い',short:'調査'},
  {name:'准・人権調査員',short:'准調査員'},
  {name:'卒業試験',short:'試験'},
  {name:'人権事件調査員',short:'卒業'}
];
const KEY='noriko-v2-v4';
const screen=document.querySelector('#screen');
const stage=document.querySelector('#stage');
const client=document.querySelector('#client');
const speaker=document.querySelector('#speaker');
const message=document.querySelector('#message');
let state=load();
let case1={phase:'intro',dialogue:0,knowledge:0,policy:0};
let run=null;
let endingTimers=[];

function load(){try{return Object.assign({cleared:[],training:[],graduated:false,seen:[],wrong:[],best:{},current:null},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return{cleared:[],training:[],graduated:false,seen:[],wrong:[],best:{},current:null}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function checkpoint(){state.current=run?JSON.parse(JSON.stringify(run)):null;save()}
function say(name,text){speaker.textContent=name;message.textContent=text}
function rankIndex(){const n=state.cleared.length;if(state.graduated)return 4;if(n>=6&&['history','design','rights'].every(x=>state.training.includes(x)))return 3;if(n>=4)return 2;if(n>=2)return 1;return 0}
function assetPath(image){return image.includes('/')?image:`../images/${image}`}
function renderGrowth(){
  const current=rankIndex();
  document.querySelector('.preview-shell').classList.toggle('graduated',state.graduated);
  document.querySelector('#growthSteps').innerHTML=RANKS.map((r,i)=>`<div class="growth-step ${i<current?'done':i===current?'current':''}"><i>${i+1}</i><b>${r.short}</b></div>`).join('');
  const positions=[10,30,50,70,90];
  document.querySelector('#norikoMarker').style.setProperty('--marker',`${positions[current]}%`);
  document.querySelector('.growth').style.setProperty('--growth',`${current*25}%`);
}
function panel(html,kind=''){stage.dataset.phase=kind;screen.innerHTML=`<section class="panel ${kind}">${html}</section>`}
function work(html,kind=''){stage.dataset.phase=kind;screen.innerHTML=`<section class="work-panel ${kind}">${html}</section>`}
function clearEndingTimers(){endingTimers.forEach(clearTimeout);endingTimers=[]}
function setView(view,title){clearEndingTimers();stage.dataset.view=view;stage.dataset.phase='';document.querySelector('.preview-shell').classList.toggle('title-mode',view==='title');document.querySelector('#screenTitle').textContent=title;client.hidden=!/^case[1-6]$/.test(view);AudioFX.setDuck(false);AudioFX.setMode(['map','title'].includes(view)?'calm':view==='training'?'puzzle':view==='graduation'?'tension':'mystery')}

function showTitle(){
  setView('title','人権事件調査室');renderGrowth();
  const hasProgress=state.cleared.length||state.current||state.training.length;
  panel(`<p class="eyebrow">HUMAN RIGHTS CASE FILE</p><h1>法子とけんぽうくん</h1><h2>人権事件調査室</h2><p>身近な事件を調査して、人権を人のために使える調査員を目指そう。</p><button id="enterGame" class="primary">${hasProgress?'調査を続ける':'調査を始める'}</button><small class="title-note">6つの事件｜見習い訓練｜卒業試験</small>`);
  say('けんぽうくん',hasProgress?'調査記録は残っているよ。続きから始めよう！':'最初の事件は、好きなものから選べるよ！');
  document.querySelector('#enterGame').onclick=showMap;
}

function showMap(){
  setView('map','人権事件調査室');renderGrowth();
  const cards=CASES.map((c,i)=>{const done=state.cleared.includes(i+1);return `<button class="case-card ${done?'completed':''}" data-case="${i+1}">${done?'<span class="completion-seal">解決</span>':''}<img class="case-portrait" src="${assetPath(c.image)}" alt="${c.client}"><span class="case-copy"><small>CASE ${String(i+1).padStart(2,'0')}｜${c.concept}</small><b>${c.title}</b><q>${c.hook}</q><span class="meta">${c.time}｜${done?'解決済み・再調査OK':'未解決'}</span></span></button>`}).join('');
  const specialUnlocked=state.cleared.length>=3;
  const specialDone=state.training.includes('rights');
  const basicsDone=state.training.includes('history')&&state.training.includes('design');
  const graduateUnlocked=state.cleared.length===6&&specialDone&&basicsDone;
  const resume=state.current?'<button id="resume" class="primary">調査中の事件へ戻る</button>':'';
  const special=`<button id="special" class="case-card special-card ${specialDone?'completed':''}" ${specialUnlocked?'':'disabled'}>${specialDone?'<span class="completion-seal training-seal">修了</span>':''}<span class="case-copy"><small>SPECIAL TRAINING</small><b>奪われた権利を取り戻せ</b><span>身体の自由・請求権</span><span class="meta">4〜6分｜${specialDone?'修了済み・再挑戦OK':specialUnlocked?'挑戦可能':'3事件解決で解放'}</span></span></button>`;
  const graduation=`<button id="graduation" class="case-card graduation-card ${state.graduated?'completed':''}" ${graduateUnlocked?'':'disabled'}>${state.graduated?'<span class="completion-seal graduation-seal">卒業</span>':''}<img class="case-portrait reward-portrait" src="assets/investigator-badge.webp" alt="人権事件調査員バッジ"><span class="case-copy"><small>FINAL MISSION</small><b>見習い卒業試験</b><span>知識・人権マップ・未知事件</span><span class="meta">8〜10分｜${state.graduated?'卒業済み・再挑戦OK':graduateUnlocked?'挑戦可能':'訓練A・B＋全事件＋特別訓練で解放'}</span></span></button>`;
  panel(`<p class="eyebrow">すき間時間調査モード</p><h2>${RANKS[rankIndex()].name}</h2><p>好きな事件や訓練を選ぼう。解決数で法子が成長します。</p>${resume}<div class="case-grid">${cards}${special}${graduation}</div><div class="screen-actions"><button id="training" class="secondary">見習い訓練</button></div>`);
  screen.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>startCase(Number(b.dataset.case)));
  document.querySelector('#training').onclick=showTrainingMenu;
  if(specialUnlocked)document.querySelector('#special').onclick=startSpecial;
  if(graduateUnlocked)document.querySelector('#graduation').onclick=startGraduation;
  if(state.current)document.querySelector('#resume').onclick=resumeCurrent;
  say('けんぽうくん','全編を続けなくても大丈夫。今日は一つだけ調査してみよう！');
}

function showTrainingMenu(){
  setView('training','見習い認定訓練');
  panel(`<p class="eyebrow">APPRENTICE TRAINING</p><h2>けんぽうくんの見習い訓練</h2><div class="training-grid"><button id="history" class="training-card"><b>訓練A</b>消えた人権の歴史<br><small>年表を復旧する</small></button><button id="design" class="training-card"><b>訓練B</b>憲法の設計図<br><small>三大原則と人権マップ</small></button></div><button id="back" class="secondary">事件一覧へ</button>`);
  document.querySelector('#history').onclick=startHistory;
  document.querySelector('#design').onclick=showConstitution;
  document.querySelector('#back').onclick=showMap;
  say('けんぽうくん','暗記テストじゃないよ。カードを動かして、知識のつながりを取り戻そう！');
}

function startHistory(){
  run={mode:'trainingHistory',step:0};checkpoint();renderHistory();
}
function renderHistory(){
  setView('training','訓練A｜消えた人権の歴史');const ordered=TRAINING_DATA.history;
  const draw=()=>{
    const options=[...ordered].sort(()=>Math.random()-.5);
    work(`<p class="eyebrow">訓練A｜消えた人権の歴史</p><h2>古い出来事から年表へ戻そう</h2><div class="timeline">${ordered.map((x,i)=>`<div class="timeline-slot ${i<run.step?'filled':''}">${i<run.step?`${x.year}<br><b>${x.title}</b>`:'未復旧'}</div>`).join('')}</div><div class="timeline-options">${options.filter(x=>ordered.indexOf(x)>=run.step).map(x=>`<button class="timeline-card" data-id="${x.id}"><small>${x.year}</small><b>${x.title}</b>${x.key}</button>`).join('')}</div><p id="feedback" class="feedback">次に入るカードを選ぼう。</p>`);
    screen.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const x=ordered.find(v=>v.id===b.dataset.id);if(x===ordered[run.step]){run.step++;checkpoint();say('けんぽうくん',`${x.title}：${x.text}`);if(run.step===ordered.length){state.training=[...new Set([...state.training,'history'])];state.current=null;save();work(`<p class="eyebrow">訓練A 完了</p><h2>人権の歴史を復旧した！</h2><p>自然権の考えは、市民革命、社会権、国際的な人権保障へ広がっていった。</p><button id="done" class="primary">訓練メニューへ</button>`);document.querySelector('#done').onclick=showTrainingMenu}else draw()}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='年代を確認しよう。今より前の時代のカードが残っていないかな？'}});
  };draw();
}

function showConstitution(){
  run={mode:'trainingDesign',phase:'constitution',step:0,checked:[]};checkpoint();renderConstitution();
}
function renderConstitution(){
  setView('training','訓練B｜憲法の設計図');const item=TRAINING_DATA.constitution[run.step],options=shuffle([item.old,item.now]);work(`<p class="eyebrow">訓練B｜憲法の設計図</p><div class="mission-bar"><span>明治憲法と日本国憲法</span><strong>${run.step+1}/3</strong></div><h2>日本国憲法の「${item.label}」は？</h2><div class="answer-grid">${options.map(x=>`<button class="choice" data-constitution="${x}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">現在の憲法に当てはまる説明を選ぼう。</p>`);screen.querySelectorAll('[data-constitution]').forEach(b=>b.onclick=()=>{if(b.dataset.constitution===item.now){b.classList.add('correct');document.querySelector('#feedback').textContent=`正解。明治憲法では「${item.old}」、日本国憲法では「${item.now}」。`;run.step++;if(run.step===TRAINING_DATA.constitution.length)run.phase='principles';checkpoint();awaitNext(run.phase==='principles'?'三大原則へ':'説明を読んで次へ',run.phase==='principles'?renderPrinciples:renderConstitution)}else{b.classList.add('wrong');b.disabled=true;document.querySelector('#feedback').textContent=`明治憲法では「${item.old}」。主権と権利保障の変化に注目しよう。`}})
}
function showPrinciples(){
  run={mode:'trainingDesign',phase:'principles',step:3,checked:[]};checkpoint();renderPrinciples();
}
function renderPrinciples(){
  setView('training','訓練B｜憲法の設計図');run.checked??=[];
  work(`<p class="eyebrow">訓練B｜憲法の設計図</p><h2>三大原則を1枚ずつ確認しよう</h2><div class="knowledge-grid">${TRAINING_DATA.principles.map(x=>`<button class="choice ${run.checked.includes(x.name)?'correct':''}" data-principle="${x.name}" ${run.checked.includes(x.name)?'disabled':''}><b>${x.name}</b><br>${x.clue}</button>`).join('')}</div><p id="feedback" class="feedback">3枚を確認すると、人権マップの入口が開きます。</p><button id="unlock" class="primary" ${run.checked.length<3?'disabled':''}>人権マップを開く</button>`);
  screen.querySelectorAll('[data-principle]').forEach(b=>b.onclick=()=>{run.checked=[...new Set([...run.checked,b.dataset.principle])];checkpoint();b.classList.add('correct');b.disabled=true;document.querySelector('#feedback').textContent=`「${b.dataset.principle}」を設計図へ復旧した。`;document.querySelector('#unlock').disabled=run.checked.length<3});
  document.querySelector('#unlock').onclick=()=>{state.training=[...new Set([...state.training,'design'])];state.current=null;save();AudioFX.play('unlock');work(`<p class="eyebrow">人権マップ</p><h2>6つの枝は事件で完成する</h2><div class="knowledge-grid">${TRAINING_DATA.rights.map(x=>`<div class="choice"><b>${x.name}</b><br>${x.example}</div>`).join('')}</div><div class="screen-actions"><span class="rank-label">憲法は国の最高法規</span><span class="rank-label">基本的人権は永久不可侵</span></div><button id="done" class="primary">訓練メニューへ</button>`);document.querySelector('#done').onclick=showTrainingMenu;say('法子','憲法を土台に、6つの人権の枝がつながっているんですね！')};
}

function saveCase1(){state.current={mode:'case1',case1:JSON.parse(JSON.stringify(case1))};save()}
function showCaseArrival(id,next){
  const d=CASES[id-1];setView(`case${id}`,`CASE ${String(id).padStart(2,'0')}｜${d.title}`);client.src=assetPath(d.image);client.alt=d.client;client.hidden=false;stage.dataset.phase='arrival';
  screen.innerHTML=`<section class="arrival-card"><p class="arrival-alert">NEW CLIENT</p><h1>新しい依頼人がやってきた！</h1><div class="arrival-bubble"><b>${d.client}</b><q>${d.hook}</q></div><p class="arrival-mission">今回の調査：${d.mission}</p><button id="openFile" class="primary">事件ファイル OPEN！</button></section>`;
  say(d.client,d.hook);AudioFX.play('arrival');document.querySelector('#openFile').onclick=()=>{AudioFX.play('fileOpen');next()};
}
function startCase1(){case1={phase:'arrival',dialogue:0,knowledge:0,policy:0};saveCase1();showCaseArrival(1,()=>{case1.phase='intro';saveCase1();showCase1Intro()})}
function progress(n){return `<div class="case-progress">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`}
function showCase1Intro(){
  const d=CASE1_STORY.intro[case1.dialogue];
  panel(`<p class="eyebrow">CASE 01｜事件発生</p><h1>一票が消えた朝</h1>${progress(1)}<p>${d.text}</p><button id="next" class="primary">${case1.dialogue===2?'知識の手がかりを探す':'次へ'}</button>`,'incident');
  say(d.speaker,d.text);document.querySelector('#next').onclick=()=>{case1.dialogue++;if(case1.dialogue<3){saveCase1();showCase1Intro()}else{case1.phase='knowledge';saveCase1();showKnowledge()}};
}
function showKnowledge(){
  const q=CASE1_STORY.knowledge[case1.knowledge];
  work(`<p class="eyebrow">知識の手がかり ${case1.knowledge+1}/3</p>${progress(2)}<h2>${q.question}</h2><div class="answer-grid">${q.choices.map(x=>`<button class="choice" data-answer="${x}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">事件に使える言葉を選ぼう。</p>`,'knowledge');
  screen.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(b.dataset.answer===q.answer){b.classList.add('correct');document.querySelector('#feedback').textContent=`正解。${q.explanation}`;say('けんぽうくん',q.explanation);case1.knowledge++;if(case1.knowledge>=3)case1.phase='policy';saveCase1();awaitNext(case1.knowledge<3?'説明を読んで次へ':'現場調査へ',()=>case1.knowledge<3?showKnowledge():showPolicy())}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='説明と用語の中心をもう一度比べよう。'}});
}
function showPolicy(){
  const p=CASE1_STORY.policies[case1.policy],options=[p.correct,...p.wrong].sort(()=>Math.random()-.5);
  work(`<p class="eyebrow">現場調査｜政策を比べる ${case1.policy+1}/2</p>${progress(3)}<h2>さだ子さんの関心</h2><p class="feedback">${p.concern}</p><div class="policy-grid">${options.map(x=>`<button class="choice" data-policy="${x}">${x}</button>`).join('')}</div>`,'investigation investigation-1');
  screen.querySelectorAll('[data-policy]').forEach(b=>b.onclick=()=>{if(b.dataset.policy===p.correct){b.classList.add('correct');case1.policy++;if(case1.policy>=2)case1.phase='turnout';saveCase1();say('法子','名前や雰囲気ではなく、暮らしと政策のつながりを比べられた！');awaitNext(case1.policy<2?'次の政策比較へ':'投票結果を調査',()=>case1.policy<2?showPolicy():showTurnout())}else{b.classList.add('wrong');say('けんぽうくん','関心と政策に共通する目的を探そう。')}});
}
function showTurnout(){
  work(`<p class="eyebrow">投票結果の手がかり</p>${progress(4)}<h2>有権者40人のうち、投票したのは10人</h2><div class="answer-grid"><button class="choice" data-turnout="wrong">棄権した30人は反対票になる</button><button class="choice" data-turnout="right">投票した10人の選択が結果を大きく左右する</button><button class="choice" data-turnout="wrong">40人全員の意見が同じだけ反映される</button></div><p id="feedback" class="feedback">投票しなかった人の意思は、票として数えられるだろうか？</p>`,'investigation investigation-1');
  screen.querySelectorAll('[data-turnout]').forEach(b=>b.onclick=()=>{if(b.dataset.turnout==='right'){b.classList.add('correct');document.querySelector('#feedback').textContent='その通り。棄権は賛成票にも反対票にもならない。';awaitNext('説明を読んで事件解決へ',showCase1Result)}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='棄権は賛成・反対のどちらの票にもならない。'}});
}
function showCase1Result(){
  const wasNew=!state.cleared.includes(1);if(wasNew)state.cleared.push(1);state.current=null;save();renderGrowth();
  panel(`<p class="stamp">事件解決</p><h2>一票が消えた朝</h2>${progress(5)}<p>情報を比較し、自分の判断を一票として示す。それが国民主権を具体的にする行動です。</p><div class="screen-actions"><button id="map" class="primary">事件一覧へ</button><button id="again" class="secondary">もう一度調査</button></div>`,'result');
  say('さだ子','私たちが政治の主役だったのね。次は政策を比べて、自分で決めるわ！');document.querySelector('#map').onclick=showMap;document.querySelector('#again').onclick=startCase1;if(wasNew&&[2,4,6].includes(state.cleared.length))showRankPop();else AudioFX.play('clear');
}

function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(text){return String(text).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function awaitNext(label,callback){screen.querySelectorAll('button.choice,button.clue-button,button.key-button').forEach(b=>b.disabled=true);const feedback=document.querySelector('#feedback');const next=document.createElement('button');next.className='primary learning-next';next.textContent=label;next.onclick=callback;(feedback||screen).insertAdjacentElement('afterend',next)}
function startCase(id){if(id===1)return startCase1();const pool=QUESTION_BANK[String(id)];const preferred=pool.filter(q=>['知識','意味'].includes(q.type));const unseen=preferred.filter(q=>!state.seen.includes(q.id));const selected=shuffle(unseen.length>=2?unseen:preferred).slice(0,2);run={mode:'case',id,phase:'arrival',dialogue:0,questions:selected.map(q=>q.id),qIndex:0,activity:{step:0,found:[],sequence:[]},evidence:[]};checkpoint();renderGenericCase()}
function resumeCurrent(){run=JSON.parse(JSON.stringify(state.current));if(run.mode==='case1'){case1=run.case1;if(case1.phase==='arrival')showCaseArrival(1,()=>{case1.phase='intro';saveCase1();showCase1Intro()});else{setView('case1','CASE 01｜一票が消えた朝');if(case1.phase==='intro')showCase1Intro();else if(case1.phase==='knowledge')showKnowledge();else if(case1.phase==='policy')showPolicy();else showTurnout()}}else if(run.mode==='case')renderGenericCase();else if(run.mode==='special')renderSpecial();else if(run.mode==='graduation')renderGraduation();else if(run.mode==='trainingHistory')renderHistory();else if(run.mode==='trainingDesign')(run.phase==='principles'?renderPrinciples:renderConstitution)()}
function getQuestion(id){return Object.values(QUESTION_BANK).flat().find(q=>q.id===id)}
function renderGenericCase(){
  const d=V4_CASE_DETAILS[run.id];if(run.phase==='arrival')return showCaseArrival(run.id,()=>{run.phase='intro';checkpoint();renderGenericIntro()});setView(`case${run.id}`,`CASE ${String(run.id).padStart(2,'0')}｜${d.title}`);client.src=assetPath(d.image);client.alt=d.client;
  if(run.phase==='intro')renderGenericIntro();else if(run.phase==='knowledge')renderGenericKnowledge();else if(run.phase==='activity')renderGenericActivity();else if(run.phase==='judgment')renderGenericJudgment();else renderGenericResult();
}
function renderGenericIntro(){
  const d=V4_CASE_DETAILS[run.id],line=d.intro[run.dialogue];
  panel(`<p class="eyebrow">CASE ${String(run.id).padStart(2,'0')}｜事件発生</p><h1>${d.title}</h1>${progress(1)}<p>${line[1]}</p><button id="next" class="primary">${run.dialogue===2?'知識の手がかりを探す':'次へ'}</button>`,'incident');
  say(line[0],line[1]);document.querySelector('#next').onclick=()=>{run.dialogue++;if(run.dialogue<3){checkpoint();renderGenericIntro()}else{run.phase='knowledge';checkpoint();renderGenericKnowledge()}};
}
function renderGenericKnowledge(){
  const q=getQuestion(run.questions[run.qIndex]);
  work(`<div class="mission-bar"><span>知識の手がかり</span><strong>${run.qIndex+1}/2</strong></div>${progress(2)}<h2>${q.question}</h2><div class="answer-grid">${shuffle(q.choices.map((text,index)=>({text,correct:index===q.answer}))).map(x=>`<button class="choice" data-correct="${x.correct}">${esc(x.text)}</button>`).join('')}</div><p id="feedback" class="feedback">事件に使える知識を選ぼう。</p>`,'knowledge');
  let attempts=0;screen.querySelectorAll('[data-correct]').forEach(b=>b.onclick=()=>{if(b.dataset.correct==='true'){b.classList.add('correct');state.seen=[...new Set([...state.seen,q.id])];document.querySelector('#feedback').textContent=`正解。${q.explanation}`;say('けんぽうくん',q.explanation);run.qIndex++;if(run.qIndex>=2)run.phase='activity';checkpoint();awaitNext(run.qIndex<2?'説明を読んで次へ':'事件現場へ',()=>run.qIndex<2?renderGenericKnowledge():renderGenericActivity())}else{attempts++;b.disabled=true;b.classList.add('wrong');state.wrong=[...new Set([...state.wrong,q.id])];save();document.querySelector('#feedback').textContent=attempts===1?'ヒント：問いの中心語と選択肢の意味を比べよう。':attempts===2?`具体的な手がかり：${q.explanation}`:`正解と理由：${q.explanation}`}});
}
function renderGenericActivity(){({2:activityRules,3:activityWelfare,4:activityPrivacy,5:activityPeace,6:activityMedical}[run.id])()}
function finishGenericActivity(text){say('法子',text);run.phase='judgment';checkpoint();work(`<p class="eyebrow">現場調査 完了</p>${progress(3)}<h2>${text}</h2><p class="feedback">集めた証拠を読み返して、事件記録に残す根拠を選ぼう。</p><button id="next" class="primary">最終判断へ</button>`,'investigation');document.querySelector('#next').onclick=renderGenericJudgment}
function activityRules(){
  const list=V4_ACTIVITY_DATA.rules,r=list[run.activity.step];
  if(!r)return finishGenericActivity('目的・必要性・影響を比べて、校則回廊を抜けた！');
  work(`<div class="mission-bar"><span>校則回廊</span><strong>${run.activity.step+1}/${list.length}</strong></div>${progress(3)}<div class="rule-card"><strong>${r.rule}</strong>目的：${r.purpose}<br>影響：${r.impact}</div><h2>この資料からの判断は？</h2><div class="answer-grid"><button class="choice" data-decision="認める">目的と制限がつながる</button><button class="choice" data-decision="見直す">負担が広すぎる・見直す</button></div><p id="feedback" class="feedback">目的だけでなく、制限の範囲と負担を確認しよう。</p>`,'investigation investigation-2');
  screen.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>{if(b.dataset.decision===r.answer){b.classList.add('correct');document.querySelector('#feedback').textContent=`正解。目的「${r.purpose}」と影響「${r.impact}」を比べた判断だ。`;run.activity.step++;checkpoint();awaitNext('判断理由を読んで次へ',activityRules)}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='目的に対して、この制限は必要な範囲に収まっている？'}});
}
function activityWelfare(){
  const list=V4_ACTIVITY_DATA.welfare,item=list[run.activity.step];if(!item)return finishGenericActivity('困りごと・権利・支援先を正確につないだ！');
  const options=shuffle(list.map(x=>x.support));
  work(`<div class="mission-bar"><span>福祉支援ルート</span><strong>${run.activity.step+1}/${list.length}</strong></div>${progress(3)}<div class="route-row"><div class="route-box"><small>困りごと</small><br><b>${item.need}</b></div><span class="route-arrow">→</span><div class="route-box"><small>関係する権利</small><br><b>${item.right}</b></div></div><h2>つながる支援先は？</h2><div class="answer-grid">${options.map(x=>`<button class="choice" data-support="${x}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">制度名ではなく、何を支える窓口か考えよう。</p>`,'investigation investigation-3');
  screen.querySelectorAll('[data-support]').forEach(b=>b.onclick=()=>{if(b.dataset.support===item.support){b.classList.add('correct');document.querySelector('#feedback').textContent=`正解。${item.right}を、${item.support}へつないだ。`;run.activity.step++;checkpoint();awaitNext('支援ルートを確認して次へ',activityWelfare)}else{b.classList.add('wrong');b.disabled=true;document.querySelector('#feedback').textContent='困りごとが生活・教育・労働のどれに関係するか見直そう。'}});
}
function activityPrivacy(){
  const data=V4_ACTIVITY_DATA.privacy;
  if(run.activity.step===0){const options=shuffle([...data.clues,data.distractor]);work(`<div class="mission-bar"><span>SNS証拠捜索</span><strong>${run.activity.found.length}/3</strong></div>${progress(3)}<h2>個人の特定につながる情報を3つ探そう</h2><div class="clue-scene">${options.map(x=>`<button class="clue-button ${run.activity.found.includes(x)?'found':''}" data-clue="${x}" ${run.activity.found.includes(x)?'disabled':''}>${x}</button>`).join('')}</div><p id="feedback" class="feedback">場所・住所・所属につながる情報に注目。</p>`,'investigation investigation-4');screen.querySelectorAll('[data-clue]').forEach(b=>b.onclick=()=>{const v=b.dataset.clue;if(data.clues.includes(v)){run.activity.found.push(v);b.classList.add('found');b.disabled=true;checkpoint();document.querySelector('#feedback').textContent=`発見。「${v}」は個人や場所の特定につながる。`;if(run.activity.found.length===3){run.activity.step=1;checkpoint();awaitNext('3つの証拠を確認して対応へ',activityPrivacy)}}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='明るさだけでは、通常は場所や本人を特定できない。'}});return}
  const expected=data.steps[run.activity.sequence.length];if(!expected)return finishGenericActivity('危険情報を発見し、被害を止める手順を実行した！');
  work(`<div class="mission-bar"><span>拡散ストップ作戦</span><strong>${run.activity.sequence.length}/4</strong></div>${progress(3)}<h2>安全な対応順に実行しよう</h2><div class="answer-grid">${shuffle(data.steps).map(x=>`<button class="choice" data-step="${x}" ${run.activity.sequence.includes(x)?'disabled':''}>${x}</button>`).join('')}</div><div class="sequence-log">${run.activity.sequence.map((x,i)=>`<span>${i+1}. ${x}</span>`).join('')}</div><p id="feedback" class="feedback">投稿を消す前に、相談に使える記録を残そう。</p>`,'investigation investigation-4');
  screen.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{if(b.dataset.step===expected){run.activity.sequence.push(expected);checkpoint();document.querySelector('#feedback').textContent=`${run.activity.sequence.length}手目「${expected}」を実行。記録を残しながら被害を止めよう。`;awaitNext('手順を確認して次へ',activityPrivacy)}else{b.classList.add('wrong');document.querySelector('#feedback').textContent=run.activity.sequence.length===0?'まず証拠を保存しよう。':'記録を残しながら、削除・通報・相談へ進もう。'}});
}
function activityPeace(){
  const list=V4_ACTIVITY_DATA.peace.facts,item=list[run.activity.step];if(!item){work(`<p class="eyebrow">学校新聞 完成</p><div class="newspaper-progress completed"><b>平和を考える 学校新聞</b>${list.map(x=>`<span class="filled">✓ ${x.label}</span>`).join('')}</div><h2>条文・政府の説明・判断条件を分けた記事が完成！</h2><p class="feedback">確認できた事実と、まだ情報が足りない点を分けることで、読者が自分で考えられる記事になった。</p><button id="next" class="primary">完成記事をユウタへ渡す</button>`,'investigation investigation-5');say('ユウタ','決めつけずに根拠を分けたら、読んだ人が考えられる新聞になった！');document.querySelector('#next').onclick=()=>finishGenericActivity('判断条件を、推測ではなく資料の事実で確認した！');return}
  work(`<div class="mission-bar"><span>新聞記事を編集</span><strong>${run.activity.step+1}/${list.length}</strong></div>${progress(3)}<div class="newspaper-progress"><b>平和を考える 学校新聞</b>${list.map((x,i)=>`<span class="${i<run.activity.step?'filled':''}">${i<run.activity.step?'✓ ':''}${x.label}</span>`).join('')}</div><div class="scenario-card"><strong>${item.label}</strong>${item.text}</div><h2>この記事に載せられる判断は？</h2><div class="answer-grid"><button class="choice" data-gate="確認">資料から確認できる</button><button class="choice" data-gate="不足">情報が不足している</button></div><p id="feedback" class="feedback">書かれていない事実を推測で補わない。</p><p class="framework-note">条文・政府の説明・判断条件を分け、根拠が確認できる記事にしよう。9条をめぐっては異なる見解があります。</p>`,'investigation investigation-5');
  screen.querySelectorAll('[data-gate]').forEach(b=>b.onclick=()=>{if(b.dataset.gate===item.answer){b.classList.add('correct');document.querySelector('#feedback').textContent=`編集OK。「${item.label}」は${item.answer==='確認'?'資料から確認できる':'資料だけでは判断できない'}。`;run.activity.step++;checkpoint();awaitNext(run.activity.step===list.length?'完成紙面を見る':'記事の次の欄へ',activityPeace)}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='資料にその条件を支える具体的情報が書かれているか確認しよう。'}});
}
function activityMedical(){
  const data=V4_ACTIVITY_DATA.medical;
  if(run.activity.step<data.terms.length){const item=data.terms[run.activity.step],options=shuffle([item.plain,'医師だけで結論を決めること','家族の多数決で決めること']);work(`<div class="mission-bar"><span>伝わる言葉へ変換</span><strong>${run.activity.step+1}/2</strong></div>${progress(3)}<h2>「${item.term}」を分かる言葉へ</h2><div class="answer-grid">${options.map(x=>`<button class="choice" data-plain="${x}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">本人が選べるよう、意味を変えずに言い換えよう。</p>`,'investigation investigation-6');screen.querySelectorAll('[data-plain]').forEach(b=>b.onclick=()=>{if(b.dataset.plain===item.plain){b.classList.add('correct');document.querySelector('#feedback').textContent=`言い換え成功。「${item.term}」は「${item.plain}」。`;run.activity.step++;checkpoint();awaitNext('説明を確認して次へ',activityMedical)}else{b.classList.add('wrong');b.disabled=true;document.querySelector('#feedback').textContent='誰が決めるかではなく、専門用語の意味を説明しよう。'}});return}
  const all=[...data.keys,'周囲の多数決'];work(`<div class="mission-bar"><span>意思決定の4つの鍵</span><strong>${run.activity.found.length}/4</strong></div>${progress(3)}<h2>本人が納得して決めるための条件を選ぼう</h2><div class="key-grid">${all.map(x=>`<button class="key-button ${run.activity.found.includes(x)?'on':''}" data-key="${x}" ${run.activity.found.includes(x)?'disabled':''}>${x}</button>`).join('')}</div><p id="feedback" class="feedback">特定の結論へ誘導せず、決める過程を支える。</p>`,'investigation investigation-6');screen.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{const v=b.dataset.key;if(data.keys.includes(v)){run.activity.found.push(v);b.classList.add('on');b.disabled=true;checkpoint();if(run.activity.found.length===4)finishGenericActivity('説明・理解・熟考・本人意思の4つの鍵がそろった！')}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='周囲の意見は参考にできるが、多数決だけで本人の医療判断は決められない。'}});
}
function renderGenericJudgment(){
  const d=V4_CASE_DETAILS[run.id],wrong={2:['校則だから絶対','自由なら制限不要'],3:['一つの制度だけ','本人に聞かず決定'],4:['仕返しに拡散','証拠をすぐ消す'],5:['賛否だけで決定','条文と政府見解は同じ'],6:['結論を急がせる','家族だけで決定']}[run.id];
  work(`<div class="mission-bar"><span>最終判断</span><strong>根拠 ${run.evidence.length}/2</strong></div>${progress(4)}<h2>事件記録に残す根拠を2つ選ぼう</h2><p class="feedback">${d.record}</p><div class="answer-grid">${shuffle([...d.judgment,...wrong]).map(x=>`<button class="choice" data-evidence="${x}">${x}</button>`).join('')}</div><button id="resolve" class="primary" disabled>この判断で報告する</button>`,'judgment');
  screen.querySelectorAll('[data-evidence]').forEach(b=>b.onclick=()=>{const v=b.dataset.evidence;if(d.judgment.includes(v)){if(!run.evidence.includes(v))run.evidence.push(v);b.classList.add('correct');b.disabled=true;checkpoint();document.querySelector('#resolve').disabled=run.evidence.length<2}else{b.classList.add('wrong');say('けんぽうくん','今回集めた証拠と直接つながる根拠を選ぼう。')}});document.querySelector('#resolve').onclick=()=>{run.phase='result';checkpoint();renderGenericResult()};
}
function renderGenericResult(){
  const d=V4_CASE_DETAILS[run.id],wasNew=!state.cleared.includes(run.id);if(wasNew)state.cleared.push(run.id);state.current=null;save();renderGrowth();
  panel(`<p class="stamp">事件解決</p><h2>${d.title}</h2>${progress(5)}<p>${d.record}</p><p class="rank-label">現在：${RANKS[rankIndex()].name}</p><div class="screen-actions"><button id="map" class="primary">事件一覧へ</button><button id="again" class="secondary">条件を変えて再調査</button></div>`,'result');say(d.client,d.ending);document.querySelector('#map').onclick=showMap;document.querySelector('#again').onclick=()=>startCase(run.id);if(wasNew&&[2,4,6].includes(state.cleared.length))showRankPop();else AudioFX.play('clear');
}
function showRankPop(){AudioFX.play('reward');const pop=document.createElement('div');pop.className='rank-pop';pop.innerHTML=`RANK UP<b>${RANKS[rankIndex()].name}</b>`;document.querySelector('.preview-shell').append(pop);setTimeout(()=>pop.remove(),2100)}

function startSpecial(){run={mode:'special',phase:'order',step:0,sequence:[]};checkpoint();renderSpecial()}
function renderSpecial(){setView('special','特別訓練｜奪われた権利を取り戻せ');client.hidden=true;const data=V4_ACTIVITY_DATA.remedy;if(run.phase==='order'){const expected=data.order[run.step];if(!expected){run.phase='rights';run.step=0;checkpoint();return renderSpecial()}work(`<div class="mission-bar"><span>身体の自由｜手続を復旧</span><strong>${run.step+1}/4</strong></div><h2>次に確認する手続は？</h2><div class="answer-grid">${shuffle(data.order).map(x=>`<button class="choice" data-order="${x}" ${run.sequence.includes(x)?'disabled':''}>${x}</button>`).join('')}</div><div class="sequence-log">${run.sequence.map((x,i)=>`<span>${i+1}. ${x}</span>`).join('')}</div><p id="feedback" class="feedback">身体を拘束する場面ほど、法律で定めた手続が重要になる。</p>`);screen.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>{if(b.dataset.order===expected){run.sequence.push(expected);run.step++;checkpoint();setTimeout(renderSpecial,400)}else{b.classList.add('wrong');document.querySelector('#feedback').textContent='逮捕から裁判、救済までの時間の流れを考えよう。'}});return}
  const item=data.rights[run.step];if(!item)return finishSpecial();const options=shuffle(data.rights.map(x=>x.answer));work(`<div class="mission-bar"><span>請求権｜救済ルート</span><strong>${run.step+1}/4</strong></div><h2>${item.scene}</h2><div class="answer-grid">${options.map(x=>`<button class="choice" data-right="${x}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">侵害された権利を、どの制度で回復する？</p>`);screen.querySelectorAll('[data-right]').forEach(b=>b.onclick=()=>{if(b.dataset.right===item.answer){b.classList.add('correct');run.step++;checkpoint();setTimeout(renderSpecial,420)}else{b.classList.add('wrong');b.disabled=true;document.querySelector('#feedback').textContent='誰に、何を求める権利なのかを比べよう。'}})}
function finishSpecial(){const before=rankIndex();state.training=[...new Set([...state.training,'rights'])];state.current=null;save();renderGrowth();panel(`<p class="stamp">訓練修了</p><h2>奪われた権利を取り戻せ</h2><p>身体の自由を守る手続と、侵害された権利を回復する請求権を獲得した。</p><button id="map" class="primary">事件一覧へ</button>`);say('法子','権利は名前を知るだけでなく、侵害されたとき取り戻す仕組みまで必要なんですね。');document.querySelector('#map').onclick=showMap;if(rankIndex()>before)showRankPop();else AudioFX.play('clear')}

function startGraduation(){const caseIds=Object.keys(QUESTION_BANK);const chosen=caseIds.map(id=>shuffle(QUESTION_BANK[id])[0]);run={mode:'graduation',phase:'knowledge',questions:chosen.map(q=>q.id),qIndex:0,score:0,mapIndex:0,mapScore:0,mapMisses:[],finalStep:0,finalScore:0,finalMisses:[]};checkpoint();renderGraduation()}
function renderGraduation(){setView('graduation','FINAL｜見習い卒業試験');client.hidden=true;if(run.phase==='knowledge')return renderGradKnowledge();if(run.phase==='map')return renderGradMap();if(run.phase==='final')return renderGradFinal();renderGradResult()}
function renderGradKnowledge(){const total=run.questions.length,q=getQuestion(run.questions[run.qIndex]),isLast=run.qIndex===total-1;work(`<div class="mission-bar"><span>卒業審査1｜知識</span><strong>${run.qIndex+1}/${total}</strong></div><h2>${q.question}</h2><div class="answer-grid">${shuffle(q.choices.map((text,index)=>({text,correct:index===q.answer}))).map(x=>`<button class="choice" data-grad="${x.correct}">${x.text}</button>`).join('')}</div><p id="feedback" class="feedback">6事件で集めた知識を使おう。</p><button id="next" class="primary hidden">${isLast?'人権マップ審査へ':'次の問題へ'}</button>`);let answered=false;screen.querySelectorAll('[data-grad]').forEach(b=>b.onclick=()=>{if(answered)return;answered=true;screen.querySelectorAll('[data-grad]').forEach(x=>x.disabled=true);if(b.dataset.grad==='true'){run.score++;b.classList.add('correct');document.querySelector('#feedback').textContent=`正解。${q.explanation}`}else{b.classList.add('wrong');document.querySelector('#feedback').textContent=`確認：${q.explanation}`}run.qIndex++;if(run.qIndex>=total)run.phase='map';document.querySelector('#next').classList.remove('hidden');checkpoint()});document.querySelector('#next').onclick=()=>run.phase==='map'?renderGradMap():renderGradKnowledge()}
function renderGradMap(){run.mapScore??=0;run.mapMisses??=[];const list=V4_ACTIVITY_DATA.classification,item=list[run.mapIndex],names=TRAINING_DATA.rights.map(x=>x.name);if(!item){run.phase='final';checkpoint();return renderGradFinal()}work(`<div class="mission-bar"><span>卒業審査2｜人権マップ</span><strong>${run.mapIndex+1}/6</strong></div><h2>「${item[0]}」はどの枝？</h2><div class="map-board">${names.map(x=>`<button class="choice" data-class="${x}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">具体的な場面を、人権の6分類へ整理しよう。</p>`);screen.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>{if(b.dataset.class===item[1]){b.classList.add('correct');if(!run.mapMisses.includes(run.mapIndex))run.mapScore++;document.querySelector('#feedback').textContent=`正解。「${item[0]}」は${item[1]}につながる。`;run.mapIndex++;checkpoint();awaitNext(run.mapIndex<6?'説明を読んで次へ':'未知事件審査へ',renderGradMap)}else{b.classList.add('wrong');run.mapMisses=[...new Set([...run.mapMisses,run.mapIndex])];checkpoint();document.querySelector('#feedback').textContent='その権利が「自由」「生活保障」「政治参加」「救済」のどれに近いか考えよう。'}})}
const FINAL_CASE=[
  {q:'市の相談窓口が「外国籍の住民は一律利用できない」としている。最初に確認すべき問題は？',choices:['国籍だけで一律に排除する合理的な理由があるか','事務を簡単にするため国籍で分ければよいか','他市も同じなら理由を調べなくてよいか'],answer:'国籍だけで一律に排除する合理的な理由があるか',explanation:'基本的人権は、権利の性質上可能な限り外国人にも保障されると考えられている。まず制限の目的と合理性を確かめる。'},
  {q:'特に関係する憲法上の視点は？',choices:['法の下の平等と個人の尊重','行政の効率だけを最優先すること','同じ結果なら事情の違いを考えないこと'],answer:'法の下の平等と個人の尊重',explanation:'形式的に同じ扱いをするだけでなく、個人の事情と制限の合理性を検討する。'},
  {q:'よりよい解決案は？',choices:['目的や個別事情を確認し、通訳など負担の小さい支援を整える','国籍別に別窓口を作り理由を示さず利用を制限する','全員に日本語だけを求め同じ手続なら平等とする'],answer:'目的や個別事情を確認し、通訳など負担の小さい支援を整える',explanation:'権利への影響を小さくしながら目的を達成できる代替手段を探す。'}
];
const GRAD_KEYWORDS=['国民主権・参政権','平等権・自由権','社会権','プライバシー・情報の人権','平和主義','自己決定権'];
function renderGradFinal(){run.finalScore??=0;run.finalMisses??=[];const item=FINAL_CASE[run.finalStep];if(!item){run.phase='result';checkpoint();return renderGradResult()}work(`<div class="mission-bar"><span>卒業審査3｜未知の最終事件</span><strong>${run.finalStep+1}/3</strong></div><p class="eyebrow">届かなかった声</p><h2>${item.q}</h2><div class="answer-grid">${item.choices.map(x=>`<button class="choice" data-final="${x}">${x}</button>`).join('')}</div><p id="feedback" class="feedback">事実・権利・理由・より負担の小さい方法で考えよう。</p>`);screen.querySelectorAll('[data-final]').forEach(b=>b.onclick=()=>{if(b.dataset.final===item.answer){b.classList.add('correct');if(!run.finalMisses.includes(run.finalStep))run.finalScore++;document.querySelector('#feedback').textContent=`正解。${item.explanation}`;run.finalStep++;checkpoint();awaitNext(run.finalStep<3?'説明を読んで次へ':'審査結果へ',renderGradFinal)}else{b.classList.add('wrong');run.finalMisses=[...new Set([...run.finalMisses,run.finalStep])];checkpoint();document.querySelector('#feedback').textContent='国籍だけで決めず、制限の目的と個別事情、代わりの方法を確認しよう。'}})}
function renderGradResult(){const knowledgePass=run.score>=5,mapPass=run.mapScore>=5,finalPass=run.finalScore>=2,passed=knowledgePass&&mapPass&&finalPass,wasNew=passed&&!state.graduated;state.graduated=passed||state.graduated;state.current=null;save();renderGrowth();if(passed)return showGraduationEnding(wasNew);panel(`<div class="rank-label">知識 ${run.score}/6｜分類 ${run.mapScore}/6｜判断 ${run.finalScore}/3</div><h1>あと一歩！</h1><p>合格基準は、知識5/6・分類5/6・未知事件2/3。未達の審査を事件記録で復習しよう。</p><div class="screen-actions"><button id="map" class="primary">事件一覧へ</button><button id="retry" class="secondary">もう一度挑戦</button></div>`,'result');say('けんぽうくん','間違いは、次に調べる場所が分かった印だよ。');document.querySelector('#map').onclick=showMap;document.querySelector('#retry').onclick=startGraduation;AudioFX.play('wrong')}
function showGraduationEnding(wasNew){
  setView('graduation','FINAL｜卒業エンディング');stage.dataset.phase='ending';client.hidden=true;AudioFX.setDuck(true);
  screen.innerHTML=`<section class="graduation-ending"><p class="ending-kicker">HUMAN RIGHTS MAP</p><h1>6つの事件が、ひとつの地図になる</h1><div class="ending-map">${GRAD_KEYWORDS.map((word,i)=>`<span class="rights-keyword keyword-${i+1}">${word}</span>`).join('')}</div><button id="skipEnding" class="secondary skip-ending">演出をスキップ</button></section>`;
  say('法子','事件で集めた人権の手がかりが、つながっていく……！');
  GRAD_KEYWORDS.forEach((_,i)=>endingTimers.push(setTimeout(()=>{screen.querySelector(`.keyword-${i+1}`)?.classList.add('visible');AudioFX.play('stamp')},650+i*620)));
  endingTimers.push(setTimeout(()=>finishGraduationEnding(wasNew),650+GRAD_KEYWORDS.length*620+700));
  document.querySelector('#skipEnding').onclick=()=>{clearEndingTimers();finishGraduationEnding(wasNew)};
}
function finishGraduationEnding(wasNew){
  clearEndingTimers();AudioFX.setDuck(false);screen.innerHTML=`<section class="graduation-award"><p class="stamp">見習い卒業</p><img src="assets/investigator-badge.webp" alt="人権事件調査員バッジ"><h1>人権事件調査員・法子</h1><p>知識を覚えるだけでなく、事実と根拠を使って人を支えられる調査員になりました。</p><div class="screen-actions"><button id="map" class="primary">卒業後の事件一覧へ</button><button id="retry" class="secondary">卒業試験に再挑戦</button></div></section>`;
  say('けんぽうくん','卒業おめでとう、法子！これからは自分の判断で、人権を人のために使えるね！');AudioFX.play('clear');document.querySelector('#map').onclick=showMap;document.querySelector('#retry').onclick=startGraduation;if(wasNew)endingTimers.push(setTimeout(showRankPop,450));
}

document.querySelector('#mapButton').onclick=showMap;
document.querySelector('#resetButton').onclick=()=>{if(!confirm('解決記録と成長段階を最初からやり直しますか？'))return;localStorage.removeItem(KEY);state=load();showMap()};
const soundButton=document.querySelector('#soundButton');
function renderSound(){soundButton.textContent=AudioFX.enabled?'音 ON':'音 OFF';soundButton.setAttribute('aria-pressed',String(AudioFX.enabled))}
soundButton.onclick=()=>{AudioFX.unlock();AudioFX.setEnabled(!AudioFX.enabled);renderSound()};
document.addEventListener('pointerdown',()=>AudioFX.unlock(),{once:true});
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;setTimeout(()=>AudioFX.play(button.classList.contains('correct')?'correct':button.classList.contains('wrong')?'wrong':'click'),0)});
renderSound();
renderGrowth();showTitle();
