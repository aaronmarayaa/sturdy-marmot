import React, { useEffect, useRef, useState } from "react";
import { birthday } from "./birthday-content";
import { HangingScene } from "./components/HangingScene";
import { ArrowRight, Camera, Check, ChevronLeft, ChevronRight, Gift, Heart, Mail, Music2, RotateCcw, Ticket, VolumeX, Wind, X } from "lucide-react";

const items = [
  { id: "letter", cardTitle: null, cardSubtitle: null, ariaLabel: null, Icon: Mail, number: "01", mark: "♡", interactive: false },
  { id: "memories", cardTitle: "Little moments", cardSubtitle: "the ones worth keeping", ariaLabel: "Open little moments", Icon: Camera, number: "02", mark: "✦", interactive: true },
  { id: "reasons", cardTitle: null, cardSubtitle: null, ariaLabel: null, Icon: Heart, number: "03", mark: "✿", interactive: false },
  { id: "treats", cardTitle: null, cardSubtitle: null, ariaLabel: null, Icon: Ticket, number: "04", mark: "✧", interactive: false },
];

function Confetti({ burst, grand = false }) {
  if (!burst) return null;
  const count = grand ? 90 : 68;
  const colors = ["#f7cad5", "#f1cf79", "#d79ab0", "#fff0d1", "#d9e2ff", "#ffffff"];
  return <div key={`${burst}-${grand ? "grand" : "soft"}`} className={`confetti ${grand ? "confetti-grand" : ""}`} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => <i key={i} style={{ "--x": `${(i * 37) % 100}vw`, "--drift": `${((i * 71) % (grand ? 480 : 280)) - (grand ? 240 : 140)}px`, "--delay": `${(i % 17) * .045}s`, "--spin": `${180 + i * 29}deg`, backgroundColor: colors[i % colors.length], borderRadius: i % 3 === 0 ? "50%" : "1px" }} />)}
  </div>;
}

function LittleMomentsModal({ moments, memory, setMemory, onClose }) {
  const [failed, setFailed] = useState({});
  const current = moments[memory];

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setMemory(v => (v + moments.length - 1) % moments.length);
      if (event.key === "ArrowRight") setMemory(v => (v + 1) % moments.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moments.length, onClose, setMemory]);

  return <div className="modal-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="keepsake-dialog" role="dialog" aria-modal="true" aria-labelledby="little-moments-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close little moments"><X size={18}/></button>
      <h2 id="little-moments-title" className="dialog-title">Little moments</h2>
      <p className="sr-only">Two little moments.</p>
      <div className="memory-polaroid">
        {current?.image && !failed[current.image]
          ? <img src={current.image} alt={`Little moment ${memory + 1}`} onError={() => setFailed(v => ({ ...v, [current.image]: true }))}/>
          : <div className="photo-placeholder"><Camera size={38}/><span>{current?.label ?? "little moment"}</span><small>add your photo here ♡</small></div>}
      </div>
      <div className="memory-controls">
        <button className="memory-nav-button" type="button" aria-label="Previous memory" onClick={() => setMemory(v => (v + moments.length - 1) % moments.length)}><ChevronLeft size={18}/></button>
        <span aria-live="polite">{String(memory + 1).padStart(2, "0")} / {String(moments.length).padStart(2, "0")}</span>
        <button className="memory-nav-button" type="button" aria-label="Next memory" onClick={() => setMemory(v => (v + 1) % moments.length)}><ArrowRight size={18}/></button>
      </div>
    </section>
  </div>;
}

export default function App() {
  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(0);
  const [modal, setModal] = useState(false);
  const [blown, setBlown] = useState(false);
  const [memory, setMemory] = useState(0);
  const [visited, setVisited] = useState([]);
  const [music, setMusic] = useState(true);
  const [celebrationMoment, setCelebrationMoment] = useState(0);
  const [cakeBites, setCakeBites] = useState(0);
  const [cakeEating, setCakeEating] = useState(false);
  const audioRef = useRef(null);
  const celebrationTimersRef = useRef([]);
  const cakeTimersRef = useRef([]);
  const surpriseButton = useRef(null);
  const lastTrigger = useRef(null);

  const moments = birthday.memories.slice(0, 2);
  const celebrate = () => setBurst(v => v + 1);
  const clearCelebrationTimers = () => { celebrationTimersRef.current.forEach(clearTimeout); celebrationTimersRef.current = []; };
  const clearCakeTimers = () => { cakeTimersRef.current.forEach(clearTimeout); cakeTimersRef.current = []; };

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio || !music) return;
    audio.volume = 0.18;
    audio.play().catch(() => {});
  };
  const toggleMusic = () => {
    const next = !music;
    setMusic(next);
    const audio = audioRef.current;
    if (!audio) return;
    if (next) { audio.volume = 0.18; audio.play().catch(() => {}); }
    else audio.pause();
  };
  const openBox = () => { startMusic(); setOpened(true); celebrate(); };
  const showMemories = () => {
    lastTrigger.current = document.activeElement;
    setModal(true);
    setVisited(v => v.includes("memories") ? v : [...v, "memories"]);
  };
  const closeModal = () => {
    setModal(false);
    setTimeout(() => lastTrigger.current?.focus?.(), 20);
  };
  const blowCandles = () => {
    if (blown) {
      clearCakeTimers();
      setCakeEating(false);
      setCakeBites(0);
      setBlown(false);
      return;
    }
    clearCakeTimers();
    setCakeEating(false);
    setCakeBites(0);
    setBlown(true);
    clearCelebrationTimers();
    setCelebrationMoment(v => v + 1);
    celebrate();
    celebrationTimersRef.current = [setTimeout(() => setCelebrationMoment(0), 2800)];
  };
  const eatCake = () => {
    if (!blown || cakeEating || cakeBites >= 6) return;
    clearCakeTimers();
    setCakeEating(true);
    cakeTimersRef.current = Array.from({ length: 6 }, (_, index) => setTimeout(() => {
      setCakeBites(index + 1);
      if (index === 5) setCakeEating(false);
    }, 360 + index * 430));
  };
  const replay = () => {
    clearCelebrationTimers();
    clearCakeTimers();
    setCelebrationMoment(0);
    setModal(false);
    setOpened(false);
    setBlown(false);
    setCakeEating(false);
    setCakeBites(0);
    setVisited([]);
    setMemory(0);
    setBurst(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => surpriseButton.current?.focus(), 100);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.18;
    if (!music) { audio.pause(); return; }
    const unlockMusic = () => audio.play().catch(() => {});
    unlockMusic();
    window.addEventListener("pointerdown", unlockMusic, { capture: true });
    window.addEventListener("keydown", unlockMusic, { capture: true });
    window.addEventListener("touchstart", unlockMusic, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlockMusic, { capture: true });
      window.removeEventListener("keydown", unlockMusic, { capture: true });
      window.removeEventListener("touchstart", unlockMusic, { capture: true });
    };
  }, [music]);

  useEffect(() => () => {
    clearCelebrationTimers();
    clearCakeTimers();
    audioRef.current?.pause();
  }, []);

  return <main className={`birthday-page ${opened ? "is-open" : ""} ${celebrationMoment ? "birthday-celebration" : ""}`}>
    <Confetti burst={burst} grand={Boolean(celebrationMoment)} />
    <audio ref={audioRef} src="/birthday-melody.wav" loop preload="auto" aria-hidden="true" />

    <header className="site-header">
      <div />
      <div className="header-right">
        <button className="music-button" type="button" onClick={toggleMusic} aria-pressed={music}>{music ? <Music2 size={17}/> : <VolumeX size={17}/>}<span>Sound {music ? "on" : "off"}</span></button>
      </div>
    </header>

    <HangingScene>
      <div className="intro"><span className="eyebrow">SWIPE TO MAKE A LITTLE MAGIC</span><h1>Happy Sabbath,<br/><em>{birthday.name}:&gt;</em><span className="heading-star" aria-hidden="true">✧</span></h1></div>

      <div className={`gift-scene ${opened ? "unwrapped" : ""}`}>
        <div className="gift-stage">
          <div className="opened-base" aria-hidden="true" />
          {items.map(({ id, cardTitle, cardSubtitle, ariaLabel, Icon, number, mark, interactive }) => {
            const content = <>
              <span className="panel-number">{number}</span>
              <span className="paper-tape" aria-hidden="true" />
              <span className="panel-art"><Icon size={42}/></span>
              {cardTitle && <strong>{cardTitle}</strong>}
              {cardSubtitle && <span className="panel-subtitle">{cardSubtitle}</span>}
              {!cardTitle && <span className="panel-mark" aria-hidden="true">{mark}</span>}
              {interactive && <span className="panel-open">{visited.includes(id) ? <Check size={14}/> : <ArrowRight size={14}/>}</span>}
            </>;
            return interactive
              ? <button key={id} tabIndex={opened ? 0 : -1} aria-hidden={!opened} aria-label={ariaLabel ?? undefined} onClick={showMemories} className={`surprise-panel panel-${id} has-copy`}>{content}</button>
              : <div key={id} aria-hidden="true" className={`surprise-panel panel-${id} decorative-card`}>{content}</div>;
          })}

          <div className="cake-center" aria-hidden={!opened}>
            <button type="button" tabIndex={opened && blown && cakeBites < 6 ? 0 : -1}
              className={`cake-image-wrap ${blown ? "candles-out cake-is-tappable" : ""} ${cakeEating ? "cake-is-eating" : ""} ${cakeBites >= 6 ? "cake-gone" : ""}`}
              onClick={eatCake} disabled={!blown || cakeEating || cakeBites >= 6}
              aria-label={blown ? (cakeBites >= 6 ? "The birthday cake has been eaten" : "Eat the birthday cake") : "Blow the candles before eating the cake"}>
              <img src="/birthday-cake.png" alt="A handmade paper birthday cake with pink frosting and three candles" className={`cake-image cake-bite-stage-${cakeBites}`} />
              <div className="candle-glow" aria-hidden="true"><span/><span/><span/></div>
              <div className="candle-smoke" aria-hidden="true"><span/><span/><span/></div>
              {cakeBites > 0 && cakeBites < 6 && <div key={cakeBites} className="cake-crumbs" aria-hidden="true"><i/><i/><i/><i/><i/></div>}
            </button>
            <span className="cake-caption">{!blown ? "psst… make a wish" : cakeBites >= 6 ? "every last crumb ♡" : cakeEating ? "nom nom nom…" : "tap the cake ♡"}</span>
            <button tabIndex={opened ? 0 : -1} className="wish-button" type="button" onClick={blowCandles}>{blown ? <RotateCcw size={14}/> : <Wind size={14}/>} {blown ? "Wish again" : "Blow the candles"}</button>
          </div>

          <button ref={surpriseButton} className="gift-box" onClick={openBox} aria-label="Open your birthday surprise" disabled={opened} tabIndex={opened ? -1 : 0} aria-hidden={opened}>
            <span className="box-side"/>
            <span className="box-lid">
              <span className="ribbon-horizontal"/><span className="ribbon-vertical"/>
              <span className="bow-loop bow-left"/><span className="bow-loop bow-right"/><span className="bow-knot"/>
              <span className="gift-label"><span>something special</span><strong>just for you</strong><Heart size={17}/></span>
            </span>
          </button>
        </div>
      </div>

      <div className="experience-action">
        {!opened && <><button className="primary-button" type="button" onClick={openBox}><Gift size={17}/> Open your surprise <ArrowRight size={16}/></button><span className="action-note">best opened with a smile</span></>}
        <div className="screen-reader-status" role="status">{opened ? "Your gift is open." : "Your birthday gift is waiting to be opened."}{blown ? " Your candles are out." : ""}{cakeEating ? " The cake is being eaten." : ""}{cakeBites >= 6 ? " The birthday cake has been eaten." : ""}</div>
      </div>
    </HangingScene>

    {opened && <footer><span className="footer-heart">♡</span><button type="button" onClick={replay}><RotateCcw size={13}/> Wrap it up again</button></footer>}

    {modal && <LittleMomentsModal moments={moments} memory={memory} setMemory={setMemory} onClose={closeModal}/>} 
  </main>;
}
