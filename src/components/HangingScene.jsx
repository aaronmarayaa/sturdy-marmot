import React, { useEffect, useRef } from "react";
import { Flower2, Gift, Heart, Sparkles, Star } from "lucide-react";

const ornaments = [
  { kind: "star", x: "5%", length: "155px", mobileLength: "165px", size: "58px", weight: .8 },
  { kind: "heart", x: "16%", length: "300px", mobileLength: "260px", size: "76px", weight: 1.2 },
  { kind: "flower", x: "28%", length: "92px", mobileLength: "54px", size: "54px", weight: .7 },
  { kind: "sparkle", x: "39%", length: "40px", mobileLength: "25px", size: "32px", weight: .55 },
  { kind: "heart", x: "61%", length: "55px", mobileLength: "31px", size: "34px", weight: .65 },
  { kind: "star", x: "73%", length: "118px", mobileLength: "70px", size: "64px", weight: .85 },
  { kind: "gift", x: "85%", length: "325px", mobileLength: "280px", size: "73px", weight: 1.05 },
  { kind: "flower", x: "96%", length: "190px", mobileLength: "180px", size: "53px", weight: .9 },
];
const icons = { star: Star, heart: Heart, flower: Flower2, gift: Gift, sparkle: Sparkles };

export function HangingScene({ children }) {
  const scene = useRef(null);
  const motion = useRef({ angle: 0, velocity: 0, target: 0, dragging: false, reduced: false });
  const gesture = useRef({ id: -1, startX: 0, startY: 0, lastX: 0, lastTime: 0, speed: 0, moved: false });
  const suppressClick = useRef(false);

  useEffect(() => {
    const elements = Array.from(scene.current?.querySelectorAll(".hanging-thread") ?? []);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;
    const tick = (now) => {
      const dt = previous ? Math.min((now - previous) / 16.667, 2) : 1;
      previous = now;
      const m = motion.current;
      m.velocity += (m.target - m.angle) * .025 * dt;
      m.velocity *= Math.pow(m.dragging ? .73 : .955, dt);
      m.angle += m.velocity * dt;
      elements.forEach((element, index) => {
        const idle = Math.sin(now / (1700 + index * 143) + index * 1.8) * 1.5;
        element.style.transform = `rotate(${m.angle * ornaments[index].weight + idle}deg)`;
      });
      frame = requestAnimationFrame(tick);
    };
    const updatePreference = () => {
      cancelAnimationFrame(frame);
      motion.current.reduced = preference.matches;
      motion.current.angle = 0;
      motion.current.velocity = 0;
      motion.current.target = 0;
      previous = 0;
      if (preference.matches) elements.forEach(el => { el.style.transform = "rotate(0deg)"; });
      else frame = requestAnimationFrame(tick);
    };
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => { cancelAnimationFrame(frame); preference.removeEventListener("change", updatePreference); };
  }, []);

  const start = (event) => {
    if (!event.isPrimary || event.button !== 0 || motion.current.reduced) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, speed: 0, moved: false };
  };
  const move = (event) => {
    const g = gesture.current;
    if (g.id !== event.pointerId) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (!g.moved && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { g.id = -1; return; }
    if (!g.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      g.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add("is-swiping");
    }
    if (!g.moved) return;
    const elapsed = Math.max(event.timeStamp - g.lastTime, 1);
    g.speed = (event.clientX - g.lastX) / elapsed;
    g.lastX = event.clientX;
    g.lastTime = event.timeStamp;
    motion.current.dragging = true;
    motion.current.target = -Math.max(-23, Math.min(23, dx * .12));
  };
  const end = (event) => {
    const g = gesture.current;
    if (g.id !== event.pointerId) return;
    if (g.moved) {
      suppressClick.current = true;
      const recentSpeed = event.timeStamp - g.lastTime < 120 ? g.speed : 0;
      motion.current.velocity -= Math.max(-1.8, Math.min(1.8, recentSpeed)) * 1.1;
    }
    motion.current.target = 0;
    motion.current.dragging = false;
    event.currentTarget.classList.remove("is-swiping");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    g.id = -1;
  };

  return <section ref={scene} className="experience hanging-experience" aria-label="Birthday surprise with hanging decorations" tabIndex={0}
    onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
    onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
    onKeyDown={event => {
      if (event.target !== event.currentTarget || motion.current.reduced) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        motion.current.velocity += event.key === "ArrowRight" ? -2.5 : 2.5;
      }
    }}>
    <div className="hanging-decorations" aria-hidden="true">
      {ornaments.map((ornament, i) => {
        const Icon = icons[ornament.kind];
        return <div key={i} className={`hanging-thread ornament-${ornament.kind} ornament-${i}`} style={{ "--hang-x": ornament.x, "--thread-length": ornament.length, "--mobile-thread-length": ornament.mobileLength, "--charm-size": ornament.size }}>
          <span className="hanging-string"/><span className="hanging-bead"/><span className="hanging-charm"><Icon strokeWidth={1.1}/></span>
        </div>;
      })}
    </div>
    {children}
  </section>;
}
