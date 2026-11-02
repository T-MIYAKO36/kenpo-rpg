'use strict';
function newArticleRun(weak=[]){
  const ids=ARTICLE_GAME.questions.map((_,i)=>i),priority=[...new Set(weak)].filter(x=>ids.includes(x));
  const queue=[...shuffle(priority),...shuffle(ids.filter(x=>!priority.includes(x)))],offset=Math.floor(Math.random()*3);
  const slots=shuffle(ids.map((_,i)=>(i+offset)%3)),options={};
  queue.forEach((id,i)=>{const q=ARTICLE_GAME.questions[id],order=shuffle([0,1,2].filter(x=>x!==q.answer));order.splice(slots[i],0,q.answer);options[id]=order});
  return {bankVersion:ARTICLE_GAME.version,stage:'articleIntro',queue,baseCount:ids.length,cursor:0,options,score:0,firstCorrect:0,missed:[],reviewPassed:[],reviewQueued:false,tries:0,wrongChoices:[],answered:false,choice:null,recorded:false};
}
function applyArticleChoice(state,choice){
  if(state.stage!=='articleQuestion'||state.answered||![0,1,2].includes(choice)||state.wrongChoices.includes(choice))return 'ignored';
  const id=state.queue[state.cursor],q=ARTICLE_GAME.questions[id];state.choice=choice;
  if(choice===q.answer){
    if(state.cursor<state.baseCount&&state.tries===0){state.firstCorrect++;state.score+=10}
    if(state.cursor>=state.baseCount&&!state.reviewPassed.includes(id))state.reviewPassed.push(id);
    state.answered=true;return 'correct';
  }
  state.tries++;state.wrongChoices.push(choice);
  if(state.cursor<state.baseCount&&!state.missed.includes(id))state.missed.push(id);
  if(state.tries>=2){state.answered=true;return 'revealed'}
  return 'hint';
}
function advanceArticle(state){
  if(state.stage!=='articleQuestion'||!state.answered)return false;
  state.cursor++;state.tries=0;state.wrongChoices=[];state.choice=null;state.answered=false;
  if(state.cursor===state.baseCount&&!state.reviewQueued){state.reviewQueued=true;state.queue.push(...shuffle(state.missed))}
  if(state.cursor>=state.queue.length){state.stage='articleResult';return true}
  return false;
}
function articleUnlocked(){return TEST_MODE||(saved.finalPassed&&CASES.every(x=>saved.cleared[x.id]))}
function clearArticleView(){$('article-screen')?.remove();$('word-shot')?.remove();$('game').classList.remove('article-game')}
function addArticleEntry(container){
  const b=document.createElement('button');b.className='article-entry';b.textContent=articleUnlocked()?'卒業後｜条文シューティング':'条文シューティング｜卒業テスト合格で開放';b.disabled=!articleUnlocked();b.onclick=()=>startArticle();container.append(b);
  if(saved.articleBest!==undefined){const best=document.createElement('small');best.textContent='条文シューティング　自己ベスト '+saved.articleBest+' / 100pt';container.append(best)}
}
const beforeArticleMenu=menu,beforeArticleTitle=showTitle,beforeArticleRender=render,beforeArticleNext=$('next').onclick,beforeArticleCase=openCase,beforeArticleJourney=startJourney;
menu=function(){clearArticleView();beforeArticleMenu();addArticleEntry($('start'))};
showTitle=function(){clearArticleView();beforeArticleTitle();if(articleUnlocked())addArticleEntry($('start'))};
openCase=function(id){clearArticleView();beforeArticleCase(id)};
startJourney=function(which,retry=false){clearArticleView();beforeArticleJourney(which,retry)};
render=function(){if(c.id==='article-game')renderArticle();else{clearArticleView();beforeArticleRender();if(run?.stage==='credits'&&articleUnlocked()){const b=articleElement('button','','卒業後の条文シューティングへ ▶');b.onclick=()=>startArticle();$('choices').append(b)}}};
function startArticle(retry=false){
  if(!articleUnlocked())return;
  persist();c={id:'article-game',client:'journey',name:'',title:'条文シューティング'};
  run=saved.runs[c.id];if(retry||!run||run.bankVersion!==ARTICLE_GAME.version||run.stage==='articleResult')run=newArticleRun(saved.articleWeak||[]);
  $('start').hidden=true;$('start').style.display='none';$('game').dataset.client='journey';setBgmTrack('main');render();persist();
}
function articleElement(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el}
function renderArticle(){
  clearArticleView();resetPanel();journeyMode(true);$('game').classList.add('article-game');
  $('game').style.backgroundImage='linear-gradient(#0e213011,#0d1a3422),url("'+ARTICLE_GAME.background+'")';
  document.querySelector('header span').textContent='卒業後｜条文シューティング';
  const screen=articleElement('section','article-screen');screen.id='article-screen';screen.setAttribute('aria-label','条文シューティング');$('game').append(screen);
  if(run.stage==='articleIntro'){
    $('phase').textContent='POST GAME｜ことばの的をねらえ！';
    screen.classList.add('article-intro');screen.append(articleElement('p','article-eyebrow','卒業した相棒への、新しいトレーニング'),articleElement('h2','','ことばの的をねらえ！'),articleElement('p','','空欄に合う言葉の的をタップ。\nことばの光で、条文を完成させよう。'));
    line('k','時間制限はないよ。ゆっくり読んで大丈夫！\n間違えた条文は、最後にもう一度たしかめよう。',0,'reveal');
    $('feedback').textContent='10条文・一発正解で10点。復習で確認した答えは加点せず、最初の正答を記録します。';$('progress').textContent='自己ベスト '+(saved.articleBest||0)+' / 100pt';$('next').textContent='トレーニングをはじめる ▶';return;
  }
  if(run.stage==='articleResult'){
    screen.classList.add('article-result');screen.append(articleElement('p','article-eyebrow','TRAINING COMPLETE'),articleElement('h2','',run.score+' / 100pt'),articleElement('p','','一発正解 '+run.firstCorrect+' / '+run.baseCount+'問'),articleElement('p','article-best','自己ベスト '+(saved.articleBest||0)+' / 100pt'));
    const review=run.missed.length;line('n',review?'間違えた'+review+'つの条文も、もう一度確認できた！\n繰り返して、言葉と意味をつなげていこう。':'全部、一発で正解！\n条文の言葉が、しっかりつながったね！',2,'bounce');
    $('phase').textContent='条文トレーニング｜完了';$('feedback').textContent=review?'復習で自分で正解 '+run.reviewPassed.length+' / '+review+'条文。解説で確かめた言葉も、次の一発正解につなげよう。':'第9・13・14・15・19・21・25・26・28・30条を確認したよ。';
    $('progress').textContent='卒業テストの称号と事件の記録は、そのまま残ります。';$('next').textContent='もう一度挑戦 ▶';
    const b=articleElement('button','','ステージ一覧へ');b.onclick=()=>menu();$('choices').append(b);return;
  }
  const id=run.queue[run.cursor],q=ARTICLE_GAME.questions[id],review=run.cursor>=run.baseCount;
  $('phase').textContent=review?'条文シューティング｜復習 '+(run.cursor-run.baseCount+1)+' / '+run.missed.length:'条文シューティング｜'+(run.cursor+1)+' / '+run.baseCount;
  const question=articleElement('div','article-question');question.append(articleElement('small','','第'+q.article+'条｜条文の一部'));
  const text=articleElement('p','article-text'),parts=q.text.split('【　】'),blank=articleElement('mark','article-blank',run.answered?q.choices[q.answer]:'？');text.append(document.createTextNode(parts[0]),blank,document.createTextNode(parts[1]));question.append(text);screen.append(question);
  const targets=articleElement('div','article-targets');if(run.tries||run.answered)targets.classList.add('targets-stopped');
  run.options[id].forEach((originalIndex,position)=>{const b=articleElement('button','word-target',q.choices[originalIndex]);b.style.setProperty('--delay',(-position*1.2)+'s');b.setAttribute('aria-label',q.choices[originalIndex]+' をねらう');b.disabled=run.answered||run.wrongChoices.includes(originalIndex);if(run.answered&&originalIndex===q.answer)b.classList.add('target-correct');if(run.wrongChoices.includes(originalIndex))b.classList.add('target-wrong');b.onclick=()=>answerArticle(originalIndex,b);targets.append(b)});screen.append(targets);
  if(run.answered){const correct=run.choice===q.answer;line(correct?'n':'k',correct?'命中！条文が完成したよ！':'正しい言葉をいっしょに確認しよう。',correct?2:0,correct?'bounce':'reveal');$('feedback').textContent=q.explanation;$('next').textContent=run.cursor===run.queue.length-1?(run.cursor<run.baseCount&&run.missed.length?'間違えた条文を復習する ▶':'結果を見る ▶'):'次の条文へ ▶'}
  else{line('k',run.tries?'もう一度、条文を読み直そう。':'空欄に合う言葉の的をタップしよう。',0,'reveal');$('feedback').textContent=run.tries?q.hint:'時間制限なし。的はゆっくり動くよ。';$('next').hidden=true}
  $('progress').textContent=run.score+' pt　｜　一発正解 '+run.firstCorrect+' / '+run.baseCount+'問'+(review?'　｜　復習は加点なし':'');
}
function shootArticle(button,correct){
  const g=$('game').getBoundingClientRect(),from=document.querySelector('.kenpo').getBoundingClientRect(),to=button.getBoundingClientRect();
  const shot=articleElement('div','word-shot'+(correct?'':' shot-miss'));shot.id='word-shot';shot.setAttribute('aria-hidden','true');shot.style.left=(from.left+from.width/2-g.left)+'px';shot.style.top=(from.top+from.height*.3-g.top)+'px';shot.style.setProperty('--dx',(to.left+to.width/2-from.left-from.width/2)+'px');shot.style.setProperty('--dy',(to.top+to.height/2-from.top-from.height*.3)+'px');$('game').append(shot);
}
function answerArticle(choice,button){
  const result=applyArticleChoice(run,choice);if(result==='ignored')return;
  sound(result==='correct');persist();render();
  const replacement=Array.from(document.querySelectorAll('.word-target')).find(x=>x.textContent===ARTICLE_GAME.questions[run.queue[run.cursor]].choices[choice]);
  if(replacement)shootArticle(replacement,result==='correct');
}
function recordArticleResult(){if(run.recorded)return;run.recorded=true;saved.articleBest=Math.max(saved.articleBest||0,run.score);saved.articleWeak=run.missed.filter(id=>!run.reviewPassed.includes(id));saved.articlePlays=(saved.articlePlays||0)+1}
$('next').onclick=()=>{
  if(c.id!=='article-game'){beforeArticleNext();return}
  if(run.stage==='articleIntro')run.stage='articleQuestion';else if(run.stage==='articleResult'){startArticle(true);return}else if(!run.answered)return;else if(advanceArticle(run))recordArticleResult();
  render();persist();
};
showTitle();
