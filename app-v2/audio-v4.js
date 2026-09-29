window.AudioFX=(()=>{
  const bgm=new Audio('../bgm_walk.mp3');
  bgm.loop=true;
  bgm.preload='none';
  bgm.volume=.18;
  let enabled=localStorage.getItem('noriko-v4-sound')!=='off';
  let unlocked=false;
  const sources={
    click:'se-select.mp3',
    correct:'se-jajean2.mp3',
    wrong:'se-jajean.mp3',
    reward:'se-stamp.mp3',
    unlock:'se-mystery.mp3',
    clear:'se-title.mp3'
  };
  const volume={click:.34,correct:.45,wrong:.34,reward:.48,unlock:.38,clear:.44};
  const cache=Object.fromEntries(Object.entries(sources).map(([name,src])=>{
    const audio=new Audio(src);audio.preload='none';return[name,audio];
  }));
  function unlock(){unlocked=true;bgm.load();Object.values(cache).forEach(audio=>audio.load());if(enabled)bgm.play().catch(()=>{})}
  function setMode(mode){bgm.volume=mode==='tension'?.21:mode==='mystery'?.16:.18}
  function setEnabled(value){
    enabled=Boolean(value);localStorage.setItem('noriko-v4-sound',enabled?'on':'off');
    if(!enabled)bgm.pause();else if(unlocked)bgm.play().catch(()=>{});
    return enabled;
  }
  function play(name){
    if(!enabled||!unlocked)return;
    const base=cache[name]||cache.click;
    const audio=base.cloneNode();audio.volume=volume[name]||.35;audio.play().catch(()=>{});
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)bgm.pause();else if(enabled&&unlocked)bgm.play().catch(()=>{});
  });
  return{unlock,setMode,setEnabled,play,get enabled(){return enabled}};
})();
