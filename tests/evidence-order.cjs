const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../game-v6/game.js','utf8');
let seed=19790617;const seededMath=Object.create(Math);seededMath.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function element(){const classes=new Set();return {textContent:'',hidden:false,disabled:false,children:[],dataset:{},append(x){this.children.push(x)},classList:{add(...xs){xs.forEach(x=>classes.add(x))},toggle(x,on){if(on)classes.add(x);else classes.delete(x)},contains:x=>classes.has(x)}}}
let ui={};const actor=element(),ctx={Math:seededMath,Set,Number,Array,run:null,c:null,persist(){this.saves=(this.saves||0)+1},sound(ok){ctx.lastSound=ok},pose(){},line(){},$:id=>ui[id],document:{createElement:element,querySelectorAll:()=>ui.choices.children,querySelector:()=>actor}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../game-v6/cases-data.js','utf8')+';this.cases=CASES',ctx);
vm.runInContext(source.slice(source.indexOf('function shuffle('),source.indexOf('function persist(')),ctx);
vm.runInContext(source.slice(source.indexOf('function renderEvidence('),source.indexOf("$('next').onclick=")),ctx);
const sequences=new Set(),positions=Array.from({length:18},()=>new Set());let questions=0;
for(let round=0;round<200;round++)for(const c of ctx.cases){
 ctx.c=c;ctx.run={stage:'evidence',evidenceStep:0,tries:0,answered:false,score:35};const correctSequence=[];
 for(let step=0;step<c.evidence.length;step++){
  ctx.run.evidenceStep=step;ctx.run.answered=false;ctx.run.tries=0;
  ui={game:element(),phase:element(),choices:element(),feedback:element(),progress:element(),next:element()};ctx.renderEvidence();
  const order=Array.from(ctx.evidenceOrder()),expected=c.cards[c.evidence[step].a],correctPosition=order.indexOf(c.evidence[step].a);
  assert.deepEqual([...order].sort(),[0,1,2]);correctSequence.push(correctPosition);positions[c.id*3+step].add(correctPosition);
  assert.equal(ui.choices.children[correctPosition].textContent,expected+' を示す');
  const wrongPosition=(correctPosition+1)%3;ui.choices.children[wrongPosition].onclick();assert.equal(ctx.lastSound,false);assert.equal(ctx.run.tries,1);assert.equal(ctx.run.answered,false);
  // A re-render after an error, followed by serialization/reload, must retain the order.
  ui.choices.children=[];ctx.renderEvidence();assert.deepEqual(Array.from(ctx.evidenceOrder()),order);
  ctx.run=JSON.parse(JSON.stringify(ctx.run));ui.choices.children=[];ctx.renderEvidence();assert.deepEqual(Array.from(ctx.evidenceOrder()),order);
  ui.choices.children[wrongPosition].onclick();assert.equal(ctx.run.tries,2);assert(ui.feedback.textContent.includes(expected));
  ui.choices.children[correctPosition].onclick();assert.equal(ctx.lastSound,true);assert.equal(ctx.run.answered,true);assert.equal(ctx.run.score,35);
  assert.deepEqual(ui.choices.children.map((b,i)=>b.classList.contains('ok')?i:null).filter(x=>x!==null),[correctPosition]);assert(ui.choices.children.every(b=>b.disabled));
  // Saved correct answers keep the correct highlight after re-rendering too.
  ctx.run=JSON.parse(JSON.stringify(ctx.run));ui.choices.children=[];ctx.renderEvidence();assert(ui.choices.children[correctPosition].classList.contains('ok'));
  questions++;
 }
 sequences.add(correctSequence.join(','));
}
assert(positions.every(x=>x.size===3));assert.equal(sequences.size,27);
// Invalid/legacy saved layouts are replaced without resetting progression or score.
ctx.run={stage:'evidence',evidenceStep:1,tries:1,score:77,answered:false,evidenceOrders:[null,[0,0,2]]};const repaired=ctx.evidenceOrder();assert.equal(new Set(repaired).size,3);assert.equal(ctx.run.score,77);assert.equal(ctx.run.tries,1);assert.equal(ctx.run.evidenceStep,1);
console.log('PASS:',questions,'evidence questions across all 18 prompts; every position and all 27 correct-position sequences; rendered click handlers, hints, highlighting, retries, legacy saves and serialized resume');
