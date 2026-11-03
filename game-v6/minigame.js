'use strict';
function newArticleRun(weak=[],mode="normal"){
  const ids=ARTICLE_GAME.questions.map((_,i)=>i),priority=[...new Set(weak)].filter(x=>ids.includes(x));
  const queue=[...shuffle(priority),...shuffle(ids.filter(x=>!priority.includes(x)))].slice(0,10),offset=Math.floor(Math.random()*3);
  const slots=shuffle(queue.map((_,i)=>(i+offset)%3)),options={};
  queue.forEach((id,i)=>{const q=ARTICLE_GAME.questions[id],order=shuffle([0,1,2].filter(x=>x!==q.answer));order.splice(slots[i],0,q.answer);options[id]=order});
  return {mode,draft:'',wrongTexts:[],bankVersion:ARTICLE_GAME.version,stage:'articleIntro',queue,baseCount:queue.length,cursor:0,options,score:0,firstCorrect:0,missed:[],reviewPassed:[],reviewQueued:false,tries:0,wrongChoices:[],answered:false,choice:null,recorded:false};
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
  state.cursor++;state.draft='';state.wrongTexts=[];state.tries=0;state.wrongChoices=[];state.choice=null;state.answered=false;
  if(state.cursor===state.baseCount&&!state.reviewQueued){state.reviewQueued=true;state.queue.push(...shuffle(state.missed))}
  if(state.cursor>=state.queue.length){state.stage='articleResult';return true}
  return false;
}
function normalizeArticleAnswer(value){return String(value).normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,x=>String.fromCharCode(x.charCodeAt(0)-96)).replace(/[\s、。・!！?？]/g,'')}
function applyArticleText(state,text){
  const value=normalizeArticleAnswer(text);if(!value||state.answered||state.stage!=='articleQuestion')return 'ignored';
  const q=ARTICLE_GAME.questions[state.queue[state.cursor]],valid=[q.choices[q.answer],...(q.aliases||[])].map(normalizeArticleAnswer);
  if(valid.includes(value))return applyArticleChoice(state,q.answer);
  state.wrongTexts=state.wrongTexts||[];if(state.wrongTexts.includes(value))return 'ignored';state.wrongTexts.push(value);
  return applyArticleChoice(state,[0,1,2].find(i=>i!==q.answer&&!state.wrongChoices.includes(i)));
}
function articleBestKey(){return run.mode==='hard'?'articleHardBest':'articleBest'}
function articleWeakKey(mode){return mode==='hard'?'articleHardWeak':'articleWeak'}
function articleUnlocked(){return saved.finalPassed&&CASES.every(x=>saved.cleared[x.id])}
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
function startArticle(retry=false,mode){
  if(!articleUnlocked())return;
  persist();c={id:'article-game',client:'journey',name:'',title:'条文シューティング'};
  run=saved.runs[c.id];if(retry||!run||run.bankVersion!==ARTICLE_GAME.version||run.stage==='articleResult')run=newArticleRun(saved[articleWeakKey(mode||run?.mode)]||[],mode||run?.mode||'normal');
  $('start').hidden=true;$('start').style.display='none';$('game').dataset.client='journey';setBgmTrack('article');render();persist();
}
function articleElement(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el}
function renderArticle(){
  clearArticleView();resetPanel();journeyMode(true);$('game').classList.add('article-game');
  $('game').style.backgroundImage='linear-gradient(#0e213011,#0d1a3422),url("'+ARTICLE_GAME.background+'")';
  document.querySelector('header span').textContent='卒業後｜条文シューティング｜'+(run.mode==='hard'?'ハード':'ノーマル');
  const screen=articleElement('section','article-screen');screen.id='article-screen';screen.setAttribute('aria-label','条文シューティング');$('game').append(screen);
  if(run.stage==='articleCatalog'){
    screen.classList.add('article-catalog');screen.append(articleElement('h2','','問題一覧｜全'+ARTICLE_GAME.questions.length+'問'));
    ARTICLE_GAME.questions.forEach(q=>{const item=articleElement('details','');item.append(articleElement('summary','','第'+q.article+'条｜'+q.text));item.append(articleElement('p','','正答：'+q.choices[q.answer]+'（'+(q.aliases||[])[0]+'）'),articleElement('p','','選択肢：'+q.choices.join(' ／ ')),articleElement('p','',q.explanation));screen.append(item)});
    line('k','毎回10問を出題するよ。間違えた問題は、最後にもう一度！',0,'reveal');$('next').textContent='レベル選択に戻る ▶';return;
  }
  if(run.stage==='articleIntro'){
    $('phase').textContent='POST GAME｜ことばの的をねらえ！';
    screen.classList.add('article-intro');
    const modes=articleElement('div','article-modes');[['normal','ノーマル｜三択'],['hard','ハード｜タイピング']].forEach(([mode,label])=>{const b=articleElement('button',run.mode===mode?'selected':'',label);b.setAttribute('aria-pressed',String(run.mode===mode));b.onclick=()=>startArticle(true,mode);modes.append(b)});screen.append(modes);
    const catalog=articleElement('button','article-bank-button','問題一覧を見る（'+ARTICLE_GAME.questions.length+'問）');catalog.onclick=()=>{run.stage='articleCatalog';render();persist()};screen.append(catalog);screen.append(articleElement('p','article-eyebrow','卒業した相棒への、新しいトレーニング'),articleElement('h2','','ことばの的をねらえ！'),articleElement('p','',run.mode==='hard'?'空欄に合う言葉を入力して発射！\nひらがな・漢字のどちらでもOK。':'空欄に合う言葉の的をタップ。\nことばの光で、条文を完成させよう。'));
    line('k','時間制限はないよ。ゆっくり読んで大丈夫！\n間違えた条文は、最後にもう一度たしかめよう。',0,'reveal');
    $('feedback').textContent='全'+ARTICLE_GAME.questions.length+'問から10問。一発正解10点。間違えた条文は最後に復習します。';$('progress').textContent='自己ベスト '+(saved[articleBestKey()]||0)+' / 100pt';$('next').textContent='トレーニングをはじめる ▶';return;
  }
  if(run.stage==='articleResult'){
    screen.classList.add('article-result');screen.append(articleElement('p','article-eyebrow','TRAINING COMPLETE'),articleElement('h2','',run.score+' / 100pt'),articleElement('p','','一発正解 '+run.firstCorrect+' / '+run.baseCount+'問'),articleElement('p','article-best','自己ベスト '+(saved[articleBestKey()]||0)+' / 100pt'));
    const review=run.missed.length;line('n',review?'間違えた'+review+'つの条文も、もう一度確認できた！\n繰り返して、言葉と意味をつなげていこう。':'全部、一発で正解！\n条文の言葉が、しっかりつながったね！',2,'bounce');
    $('phase').textContent='条文トレーニング｜完了';$('feedback').textContent=review?'復習で自分で正解 '+run.reviewPassed.length+' / '+review+'条文。解説で確かめた言葉も、次の一発正解につなげよう。':'今回の10条文を確認したよ。次の挑戦では、別の条文にも出会えるよ。';
    $('progress').textContent='卒業テストの称号と事件の記録は、そのまま残ります。';$('next').textContent='もう一度挑戦 ▶';
    const levels=articleElement('button','','レベルを選び直す');levels.onclick=()=>{startArticle(true);};$('choices').append(levels);const b=articleElement('button','','ステージ一覧へ');b.onclick=()=>menu();$('choices').append(b);return;
  }
  const id=run.queue[run.cursor],q=ARTICLE_GAME.questions[id],review=run.cursor>=run.baseCount;
  $('phase').textContent=review?'条文シューティング｜復習 '+(run.cursor-run.baseCount+1)+' / '+run.missed.length:'条文シューティング｜'+(run.cursor+1)+' / '+run.baseCount;
  const question=articleElement('div','article-question');question.append(articleElement('small','','第'+q.article+'条｜条文の一部'));
  const text=articleElement('p','article-text'),parts=q.text.split('【　】'),blank=articleElement('mark','article-blank',run.answered?q.choices[q.answer]:'？');text.append(document.createTextNode(parts[0]),blank,document.createTextNode(parts[1]));question.append(text);screen.append(question);
  if(run.mode==='hard'){renderArticleTyping(screen)}else{
  const targets=articleElement('div','article-targets');if(run.tries||run.answered)targets.classList.add('targets-stopped');
  run.options[id].forEach((originalIndex,position)=>{const b=articleElement('button','word-target',q.choices[originalIndex]);b.style.setProperty('--delay',(-position*1.2)+'s');b.setAttribute('aria-label',q.choices[originalIndex]+' をねらう');b.disabled=run.answered||run.wrongChoices.includes(originalIndex);if(run.answered&&originalIndex===q.answer)b.classList.add('target-correct');if(run.wrongChoices.includes(originalIndex))b.classList.add('target-wrong');b.onclick=()=>answerArticle(originalIndex,b);targets.append(b)});screen.append(targets);}
  if(run.answered){const correct=run.choice===q.answer;line(correct?'n':'k',correct?'命中！条文が完成したよ！':'正しい言葉をいっしょに確認しよう。',correct?2:0,correct?'bounce':'reveal');$('feedback').textContent=q.explanation;$('next').textContent=run.cursor===run.queue.length-1?(run.cursor<run.baseCount&&run.missed.length?'間違えた条文を復習する ▶':'結果を見る ▶'):'次の条文へ ▶'}
  else{line('k',run.tries?'もう一度、条文を読み直そう。':(run.mode==='hard'?'空欄に合う言葉を入力して発射しよう。':'空欄に合う言葉の的をタップしよう。'),0,'reveal');$('feedback').textContent=run.tries?q.hint:(run.mode==='hard'?'時間制限なし。ひらがなでもOK。入力を確定してから発射してね。':'時間制限なし。的はゆっくり動くよ。');$('next').hidden=true}
  $('progress').textContent=run.score+' pt　｜　一発正解 '+run.firstCorrect+' / '+run.baseCount+'問'+(review?'　｜　復習は加点なし':'');
}
function renderArticleTyping(screen){
  const form=articleElement('form','article-typing'),input=articleElement('input','');input.type='text';input.autocomplete='off';input.spellcheck=false;input.setAttribute('aria-label','空欄の言葉');input.placeholder='ひらがなでもOK';input.value=run.draft||'';input.disabled=run.answered;
  const fire=articleElement('button','','発射する');fire.type='submit';fire.disabled=run.answered;let composing=false;
  input.oncompositionstart=()=>{composing=true};input.oncompositionend=()=>{composing=false};input.onkeydown=e=>{if(e.key==='Enter'&&(e.isComposing||composing||e.keyCode===229))e.preventDefault()};input.oninput=()=>{run.draft=input.value};
  form.onsubmit=e=>{e.preventDefault();if(composing)return;const result=applyArticleText(run,input.value);if(result==='ignored')return;sound(result==='correct');persist();render();const target=document.querySelector('.article-typing button');if(target)shootArticle(target,result==='correct')};
  form.append(input,fire);screen.append(form);
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
function recordArticleResult(){if(run.recorded)return;run.recorded=true;saved[articleBestKey()]=Math.max(saved[articleBestKey()]||0,run.score);saved[articleWeakKey(run.mode)]=run.missed.filter(id=>!run.reviewPassed.includes(id));saved.articlePlays=(saved.articlePlays||0)+1}
$('next').onclick=()=>{
  if(c.id!=='article-game'){beforeArticleNext();return}
  if(run.stage==='articleCatalog')run.stage='articleIntro';else if(run.stage==='articleIntro')run.stage='articleQuestion';else if(run.stage==='articleResult'){startArticle(true);return}else if(!run.answered)return;else if(advanceArticle(run))recordArticleResult();
  render();persist();
};
document.addEventListener('visibilitychange',()=>{if(c?.id==='article-game')persist()});
showTitle();
