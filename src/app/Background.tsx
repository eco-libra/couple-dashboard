import { useEffect, useRef, useState } from "react";
import { listMedia, imageUrl, type MediaItem } from "../shared/services/cloudinary";

const SLIDE_MS = 14000;

function shuffle<T>(arr: T[]): T[] {
  return arr.map(x => ({ x, r: Math.random() })).sort((a, b) => a.r - b.r).map(o => o.x);
}

interface SlideState {
  active: 0 | 1;
  slots: [string | null, string | null];
}

/** Full-screen ambient slideshow of the couple's photos, behind every page. */
export function Background() {
  const [imgs, setImgs] = useState<MediaItem[]>([]);
  const [state, setState] = useState<SlideState>({ active: 0, slots: [null, null] });
  const pos = useRef(0);

  useEffect(() => {
    listMedia().then(all => setImgs(shuffle(all.filter(m => m.rtype === "image"))));
  }, []);

  useEffect(() => {
    if (!imgs.length) return;
    let cancelled = false;
    const step = () => {
      const m = imgs[pos.current++ % imgs.length];
      const url = imageUrl(m, 1600);
      const im = new Image();
      im.onload = () => {
        if (cancelled) return;
        setState(prev => {
          const nextActive = prev.active === 0 ? 1 : 0;
          const slots: SlideState["slots"] = [...prev.slots];
          slots[nextActive] = url;
          return { active: nextActive, slots };
        });
      };
      im.src = url;
    };
    step();
    const id = setInterval(step, SLIDE_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [imgs]);

  return (
    <>
      {[0, 1].map(i => (
        <div key={i}
          className={"bg-slide" + (state.active === i && state.slots[i] ? " show" : "")}
          style={state.slots[i] ? { backgroundImage: `url("${state.slots[i]}")` } : undefined}
        />
      ))}
      <div className="bg-scrim" />
    </>
  );
}
