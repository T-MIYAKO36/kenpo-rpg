window.AudioFX=(()=>{
  const bgm=new Audio('../bgm_walk.mp3');
  bgm.loop=true;
  bgm.preload='none';
  bgm.volume=.18;
  let enabled=localStorage.getItem('noriko-v4-sound')!=='off';
  let unlocked=false;
  let loaded=false;
  let ducked=false;
  let context=null;
  let lastPlayAt=0;
  const sources={
    click:'se-select.mp3',
    correct:'se-jajean2.mp3',
    reward:'se-stamp.mp3',
    unlock:'se-mystery.mp3',
    clear:'se-title.mp3',arrival:'se-mystery.mp3',fileOpen:'se-jajean2.mp3',stamp:'se-stamp.mp3'
  };
  const volume={click:.28,correct:.42,wrong:.34,reward:.46,unlock:.36,clear:.44,arrival:.32,fileOpen:.4,stamp:.42};
  const cache=Object.fromEntries(Object.entries(sources).map(([name,src])=>{
    const audio=new Audio(src);audio.preload='none';return[name,audio];
  }));
  function unlock(){
    if(unlocked){if(enabled&&bgm.paused)bgm.play().catch(()=>{});return}
    unlocked=true;
    if(!context)context=new (window.AudioContext||window.webkitAudioContext)();
    if(context.state==='suspended')context.resume();
    if(!loaded){bgm.load();Object.values(cache).forEach(audio=>audio.load());loaded=true}
    if(enabled&&bgm.paused)bgm.play().catch(()=>{});
  }
  function setMode(mode){if(ducked)return;bgm.volume=mode==='tension'?.21:mode==='mystery'?.16:.18}
  function setDuck(value){ducked=Boolean(value);bgm.volume=ducked?.07:.18}
  function setEnabled(value){
    enabled=Boolean(value);localStorage.setItem('noriko-v4-sound',enabled?'on':'off');
    if(!enabled)bgm.pause();else if(unlocked)bgm.play().catch(()=>{});
    return enabled;
  }
  function play(name){
    if(!enabled||!unlocked)return;
    const now=performance.now();
    if(name==='click'&&now-lastPlayAt<120)return;
    lastPlayAt=now;
    if(name==='wrong')return softWrong();
    const base=cache[name]||cache.click;
    const audio=base.cloneNode();audio.volume=volume[name]||.35;audio.play().catch(()=>{});
  }
  function softWrong(){
    if(!context)return;
    const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime;
    oscillator.type='sine';oscillator.frequency.setValueAtTime(220,start);oscillator.frequency.exponentialRampToValueAtTime(165,start+.2);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.035,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+.24);
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+.25);
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)bgm.pause();else if(enabled&&unlocked)bgm.play().catch(()=>{});
  });
  return{unlock,setMode,setDuck,setEnabled,play,get enabled(){return enabled}};
})();
