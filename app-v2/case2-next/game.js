const $ = (s) => document.querySelector(s);
const state = {step:0, score:0, growth:8, talks:new Set(), sound:true, variant:Math.random()>.5?"A":"B", selected:{}, mistakes:{}};
const ui = {headline:$("#headline"),message:$("#message"),content:$("#content"),actions:$("#actions"),speaker:$("#speaker"),step:$("#stepLabel"),scene:$("#scene"),classBar:$("#classBar"),classScore:$("#classScore"),growth:$("#growthBar"),skills:$("#skillIcons"),noriko:$("#noriko"),reactions:$("#reactionLayer")};
const audio = {bgm:$("#bgm"),select:$("#seSelect"),mystery:$("#seMystery"),stamp:$("#seStamp")};
audio.bgm.volume=.16; audio.select.volume=.35; audio.mystery.volume=.3; audio.stamp.volume=.4;

function play(name){if(!state.sound)return; const a=audio[name]; if(a){a.currentTime=0;a.play().catch(()=>{});}}
function softWrong(){if(!state.sound)return; const C=window.AudioContext||window.webkitAudioContext; if(!C)return; const c=new C(); [330,280].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,c.currentTime+i*.13);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+i*.13+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+i*.13+.18);o.connect(g).connect(c.destination);o.start(c.currentTime+i*.13);o.stop(c.currentTime+i*.13+.2)});}
function setText(speaker,step,head,msg){ui.speaker.textContent=speaker;ui.step.textContent=step;ui.headline.textContent=head;ui.message.textContent=msg;ui.content.innerHTML="";ui.actions.innerHTML="";}
function button(label,fn,cls="primary"){const b=document.createElement("button");b.className=cls;b.textContent=label;b.onclick=()=>{play("select");fn()};ui.actions.append(b);return b;}
function setProgress(scoreAdd=0,growthAdd=0){state.score=Math.min(100,state.score+scoreAdd);state.growth=Math.min(100,state.growth+growthAdd);ui.classBar.style.width=state.score+"%";ui.classScore.textContent=state.score;ui.growth.style.width=state.growth+"%";}
function react(text,x=55,y=28){const t=document.createElement("span");t.className="toast";t.textContent=text;t.style.left=x+"%";t.style.top=y+"%";ui.reactions.append(t);setTimeout(()=>t.remove(),1400);ui.noriko.classList.remove("happy");void ui.noriko.offsetWidth;ui.noriko.classList.add("happy");}
function start(){audio.bgm.play().catch(()=>{});setText("憲法くん","見習いクイズ 1/2","まずは“同じ”と“公平”を見分けよう","全員に同じ決まりを適用すれば、いつでも公平と言えるかな？");quiz([
  ["言える。全員同じなら必ず公平",false,"憲法くん『全員に同じサイズの靴を配る感じかな』……それは公平というより、だいたい靴ずれだね。事情によって負担が偏ることがあるよ。"],
  ["目的と影響を確かめないと判断できない",true,"その通り！ 公平は“影響”まで見るのがポイント。"],
  ["多数決で決めれば必ず公平",false,"多数決だけでは少数の困りごとが見えないこともあるよ。"]
],diagnostic2);}
function quiz(items,next){ui.content.className="content actions";items.forEach(([label,ok,hint])=>{const b=button(label,()=>{[...ui.actions.children].forEach(x=>x.disabled=true);b.classList.add(ok?"correct":"wrong");ui.message.textContent=hint;if(ok){setProgress(8,7);react("なるほど！ +8",62,26);ui.actions.innerHTML="";button("次へ",next)}else{softWrong();setTimeout(()=>{[...ui.actions.children].forEach(x=>x.disabled=false);b.disabled=true;ui.message.textContent+=" ほかの考えも試してみよう。"},500)}},"choice")});}
function diagnostic2(){setText("憲法くん","見習いクイズ 2/2","校則は自由を制限できる？","大切なのは“禁止か自由か”の二択ではない。何を比べる？");quiz([
  ["先生の好みと生徒の好み",false,"個人の好みではなく、決まりの根拠を比べよう。"],
  ["決まりの目的・必要性・みんなへの影響",true,"調査の3点セットを獲得！"],
  ["昔の校則ともっと昔の校則",false,"歴史も資料になるけれど、それだけでは今の必要性を判断できないね。"]
],talkPhase);}
const talkData={
  a:{name:"ミオたち",quote:"『黒だけ』って、茶色のゴムまで注意されるのは不思議。でも授業中に電飾みたいに光ったら、さすがに数学より気になるかも。",quoteB:"茶色のゴムまで注意されたんだ。先生も理由を説明できたら、納得しやすいのにね。……虹色に光るゴムは私も二度見するけど。",fact:"落ち着いた色まで一律禁止で、困る生徒がいる。",reply:"『自由なら何でもOK』ではなく、どこまでなら学習を邪魔しないか考えるんだね。",x:24,y:20},
  b:{name:"ユウトたち",quote:"黒いゴムで集中力が上がるなら、テスト前に10本つけたい。……たぶん、上がらないけど。",quoteB:"校則の目的は集中らしいよ。黒ゴムをつけ忘れた日の僕が急に天才になった記録も、まだない。",fact:"校則の目的は学習環境だが、色との関係は未確認。",reply:"目的は分かった。でも、髪どめの色と集中のつながりは証拠が必要だ！",x:55,y:18},
  c:{name:"委員のソラ",quote:"守る側・困る側、両方の理由を集めよう。『なんとなく昔から』は、理由カードとして弱すぎ選手権優勝だよ。",quoteB:"多数決だけだと、少ない側の困りごとが消えちゃう。全員の理由を聞いてから決めたいな。",fact:"話し合いと見直しの手続きが求められている。",reply:"それ、理由じゃなくて伝統だけかも！ 決め方そのものも大事なんだ。",x:79,y:23}
};
function talkPhase(){setText("法子","聞き込み調査","気になるグループをタップして、本音と事実を集めよう","会話には“意見”と“確かめられる事実”が混ざっている。3組の話を聞いてみよう。");ui.scene.innerHTML="";Object.entries(talkData).forEach(([id,d],i)=>{const b=document.createElement("button");b.className=`talk-spot spot-${id}`;b.innerHTML=`<b>${d.name}</b><span>${state.talks.has(id)?"✓ 話を聞いた":"話しかける"}</span>`;b.onclick=()=>talk(id,b);ui.scene.append(b)});ui.content.innerHTML='<span class="tag">獲得中</span> 「目的」「必要性」「影響」の3つで話を整理する';}
function talk(id,btn){play("select");const d=talkData[id],first=!state.talks.has(id),quote=state.variant==="B"?d.quoteB:d.quote;setText(d.name,"聞き込み調査",quote,`${first?"事実メモ":"再確認メモ"}：${d.fact}　法子「${d.reply}」`);if(first){state.talks.add(id);setProgress(12,5);react(["そうそう！","なるほど！","それも大事！"][state.talks.size-1],d.x,d.y)}button(first?"メモに追加":"聞き込みに戻る",()=>{talkPhase();if(state.talks.size===3){ui.message.textContent="3つの立場がそろった！ 意見が違っても、理由を聞くと話し合えるね。";ui.scene.querySelectorAll("button").forEach(x=>x.classList.add("done"));button("集めた事実を比べる",compareIntro)}});}
function compareIntro(){ui.scene.innerHTML="";play("mystery");setText("憲法くん","能力解放","新能力「比べる」が使えるようになった！","校則の目的が正しくても、手段が必要以上に自由を狭めていないか、影響が偏っていないかを比べよう。");ui.skills.children[1].classList.add("on");setProgress(5,18);react("🔎 比べる 解放！",58,22);button("比較ミッションへ",()=>compare(0));}
const trials=[
 {rule:"髪どめは黒色だけ",purpose:"授業に集中できる環境",evidence:["茶色でも授業への影響は確認されていない","昔から黒だった","黒が好きな人が多い"],right:0,judgment:"見直す",why:"目的とのつながりが弱く、落ち着いた色まで禁じる必要性が低い。"},
 {rule:"実験中は長い髪を結ぶ",purpose:"事故を防ぎ、安全を守る",evidence:["結ばない方がおしゃれ","火や薬品に髪が触れる危険がある","理科室は寒い"],right:1,judgment:"維持する",why:"安全という目的と手段が直接つながり、必要性が高い。"},
 {rule:"冬の上着は校内で禁止",purpose:"服装を整える",evidence:["教室ごとに室温差があり、体調への影響が出る","制服は写真映えする","春は暖かい"],right:0,judgment:"見直す",why:"健康への負担があり、色指定など、より制限の少ない方法がある。"}
];
function compare(i){const t=trials[i];state.selected={};setText("法子",`比較ミッション ${i+1}/3`,t.rule,`目的は「${t.purpose}」。判断に必要な証拠を1つ選ぼう。`);ui.content.className="content cards";t.evidence.forEach((e,n)=>{const b=document.createElement("button");b.className="card";b.innerHTML=`<span class="tag">証拠${n+1}</span>${e}`;b.onclick=()=>{play("select");ui.content.querySelectorAll("button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");state.selected.evidence=n;renderJudgment(i)};ui.content.append(b)});}
function renderJudgment(i){const t=trials[i],key=`compare${i}`;if(i===2){renderImprovement(t,key);return}ui.actions.innerHTML="";["維持する","見直す"].forEach(v=>button(v,()=>{if(state.selected.evidence===t.right&&v===t.judgment){play("stamp");setProgress(10,8);react("みんな納得！",62,21);ui.message.textContent=t.why;ui.actions.innerHTML="";button("次の校則へ",()=>compare(i+1))}else{softWrong();state.mistakes[key]=(state.mistakes[key]||0)+1;ui.message.textContent=state.mistakes[key]>1?`具体ヒント：「${t.purpose}」と直接つながる、確かめられる証拠はどれ？ 好みや昔からという理由はいったん外そう。`:`法子『決めた！』 憲法くん『0.3秒で？ 事件より判断が速いよ』――「目的と関係する証拠」→「必要性と影響」の順で、もう一度比べよう。`}},"choice"));}
function renderImprovement(t,key){ui.actions.innerHTML="";ui.message.textContent="最後は維持・廃止の二択ではなく、目的を守りながら制限を小さくする改善案を選ぼう。";const ideas=["上着は今までどおり全面禁止","寒さや体調に応じ、落ち着いた色の上着を認める","制服そのものを明日から廃止する"];ideas.forEach((idea,n)=>button(idea,()=>{if(state.selected.evidence===t.right&&n===1){play("stamp");setProgress(10,8);react("改善案できた！",62,21);ui.message.textContent=t.why;ui.actions.innerHTML="";button("事件簿を完成させる",record)}else{softWrong();state.mistakes[key]=(state.mistakes[key]||0)+1;ui.message.textContent=state.mistakes[key]>1?"具体ヒント：健康への負担を減らしつつ、服装を整える目的も残せる案はどれ？":"目的を捨てず、必要以上の制限だけを小さくできる案を探そう。"}},"choice"));}
const recordSets=[
 {key:"fact",title:"事実",options:["茶色のゴムで授業が乱れた記録はない","黒色が一番かっこいい"],correct:0},
 {key:"right",title:"人権",options:["個人の尊重と自由","何でも好きにする権利"],correct:0},
 {key:"reason",title:"理由",options:["目的との関係が弱く、負担が大きい","新しい方が楽しそう"],correct:0},
 {key:"idea",title:"改善",options:["安全・学習を妨げない落ち着いた色を認める","校則を全部なくす"],correct:0}
];
function shuffled(items){return [...items].sort(()=>Math.random()-.5)}
function record(){state.selected={};setText("法子","事件簿づくり","4枚のカードで、理由の通る改善案をつくろう","“自由だから”だけで終わらず、事実・人権・理由・改善をつなげるのが見習い調査員の仕事！");ui.content.className="content cards";recordSets.forEach((set)=>{shuffled(set.options.map((o,n)=>({o,n}))).forEach(({o,n})=>{const b=document.createElement("button");b.className="card";b.innerHTML=`<span class="tag">${set.title}</span>${o}`;b.onclick=()=>{play("select");state.selected[set.key]=n;[...ui.content.children].filter(x=>x.dataset.key===set.key).forEach(x=>x.classList.remove("selected"));b.classList.add("selected");b.dataset.key=set.key;checkRecord()};b.dataset.key=set.key;ui.content.append(b)})});}
function checkRecord(){ui.actions.innerHTML="";if(Object.keys(state.selected).length===4)button("この事件簿で提案する",()=>{const wrong=recordSets.find(s=>state.selected[s.key]!==s.correct);if(!wrong)finish();else{softWrong();state.mistakes.record=(state.mistakes.record||0)+1;ui.message.textContent=state.mistakes.record>1?`具体ヒント：「${wrong.title}」カードを見直そう。好みではなく、確認できる内容と制限の小さい改善を選ぼう。`:`どこかが“好み”だけの理由になっているよ。確かめられる事実と、制限を小さくする改善を選ぼう。`}},"primary");}
function finish(){play("stamp");setProgress(25,30);setText("クラスのみんな","CASE CLEAR","「聞いてくれて、ありがとう！」教室に笑顔の会話が戻った！","法子の提案：学習や安全を妨げない落ち着いた色の髪どめを認め、一定期間試してからみんなで見直す。ユウト『じゃあ黒ゴム10本作戦は中止で』 法子『最初から中止して！』――自由とルールを“対立”で終わらせず、話し合いで調整できた！");ui.content.className="final-record";["事実｜影響を示す記録は未確認","人権｜個人の尊重・自由","理由｜必要以上の制限","改善｜試行して再検討"].forEach(x=>{const [a,b]=x.split("｜");ui.content.insertAdjacentHTML("beforeend",`<div class="record-part"><b>${a}</b>${b}</div>`)});ui.actions.innerHTML="";react("わいわい！ 😊",52,17);react("いい案だね！ ✨",73,27);button("もう一度（別会話あり）",()=>location.reload(),"primary");button("CASE選択へ戻る",()=>location.href="../index.html","small-btn");}
$("#primaryBtn").onclick=start;
$("#homeBtn").onclick=()=>{if(confirm("CASE2を最初からやり直しますか？"))location.reload()};
$("#soundBtn").onclick=(e)=>{state.sound=!state.sound;e.currentTarget.textContent=state.sound?"♪":"×";if(state.sound)audio.bgm.play().catch(()=>{});else audio.bgm.pause()};
