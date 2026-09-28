window.AudioFX=(()=>{
  let context=null;
  let master=null;
  let enabled=true;
  let timer=null;
  let step=0;
  let mode='calm';
  const themes={
    calm:{tempo:620,wave:'triangle',notes:[262,330,392,330,294,349,440,349]},
    mystery:{tempo:520,wave:'triangle',notes:[220,262,330,294,196,247,294,262]},
    puzzle:{tempo:460,wave:'sine',notes:[294,370,440,370,330,392,494,392]},
    tension:{tempo:390,wave:'triangle',notes:[196,220,233,220,196,247,233,220]},
    ending:{tempo:650,wave:'sine',notes:[262,330,392,523,440,392,330,262]}
  };
  function unlock(){
    if(!context){context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=.34;master.connect(context.destination)}
    if(context.state==='suspended')context.resume();
    if(enabled&&!timer)startTheme();
  }
  function tone(freq,duration=.09,type='sine',volume=.055,delay=0){
    if(!enabled||!context)return;
    const oscillator=context.createOscillator();
    const gain=context.createGain();
    const start=context.currentTime+delay;
    oscillator.type=type;oscillator.frequency.setValueAtTime(freq,start);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain);gain.connect(master);oscillator.start(start);oscillator.stop(start+duration+.02);
  }
  function startTheme(){
    stopTheme();
    const play=()=>{const theme=themes[mode];tone(theme.notes[step++%theme.notes.length],.42,theme.wave,.018);if(step%4===1)tone(theme.notes[(step+3)%theme.notes.length]/2,.5,'sine',.011)};
    play();timer=setInterval(play,themes[mode].tempo);
  }
  function stopTheme(){if(timer){clearInterval(timer);timer=null}}
  function setMode(next){mode=themes[next]?next:'calm';step=0;if(enabled&&context)startTheme()}
  function setEnabled(value){enabled=value;if(!enabled)stopTheme();else{unlock();startTheme()}}
  const patterns={
    click:()=>tone(520,.055,'square',.025),
    correct:()=>{tone(523,.1,'triangle',.06);tone(659,.12,'triangle',.06,.08);tone(784,.18,'triangle',.06,.17)},
    wrong:()=>{tone(180,.13,'sawtooth',.045);tone(145,.2,'sawtooth',.04,.1)},
    reward:()=>{tone(392,.1,'square',.045);tone(523,.1,'square',.045,.08);tone(659,.22,'triangle',.055,.16)},
    unlock:()=>{tone(330,.08,'triangle',.05);tone(440,.09,'triangle',.05,.07);tone(660,.24,'sine',.06,.15)},
    clear:()=>{[262,330,392,523,659].forEach((n,i)=>tone(n,i===4?.5:.14,'triangle',.065,i*.11))}
  };
  function play(name){(patterns[name]||patterns.click)()}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTheme();else if(enabled&&context)startTheme()});
  return{unlock,setMode,setEnabled,play,get enabled(){return enabled}};
})();
