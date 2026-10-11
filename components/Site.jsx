'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig, useMotionValue, useSpring, useTransform } from 'framer-motion'

// ---- Edit content here ----
const CO = { whatsapp: '910000000000', address: 'Studio address, Kochi, Kerala', hours: 'Mon to Sat, 10 am to 7 pm' }
const SERV = [['Weddings', 'The whole day, told in order. Delivered in three weeks.', 45000], ['Portraits', 'Studio or outdoor, with styling guidance.', 6000], ['Product', 'Clean, consistent shots for shops and brands.', 8000], ['Events', 'Launches, corporate and family gatherings.', 15000]]
const STOPS = [['1.8', 22, '1/4000', 100], ['2.8', 14, '1/2000', 100], ['4', 8, '1/1000', 200], ['8', 3, '1/250', 400], ['16', .6, '1/60', 800]]
const wa = (t) => `https://wa.me/${CO.whatsapp}?text=${encodeURIComponent(t)}`

let ctx
const shutterSound = () => {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume()
  ;[0, .09].forEach((d, i) => { const b = ctx.createBuffer(1, ctx.sampleRate * .05, ctx.sampleRate), a = b.getChannelData(0); for (let k = 0; k < a.length; k++) a[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / a.length, 3); const n = ctx.createBufferSource(), g = ctx.createGain(); n.buffer = b; g.gain.value = i ? .35 : .6; n.connect(g).connect(ctx.destination); n.start(ctx.currentTime + d) })
}

function Focus({ children, d = 0, className = '' }) {
  return <motion.div initial={{ opacity: 0, filter: 'blur(14px)', y: 20 }} whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .9, delay: d, ease: [.16, 1, .3, 1] }} className={className}>{children}</motion.div>
}

function Viewfinder() {
  const box = useRef(null)
  const fRaw = useMotionValue(.58), focus = useSpring(fRaw, { stiffness: 110, damping: 20 })
  const [stop, setStop] = useState(1), [lock, setLock] = useState(true), [hint, setHint] = useState(true), [frames, setFrames] = useState(0), [shot, setShot] = useState(0)
  const apRaw = useMotionValue(STOPS[1][1]), ap = useSpring(apRaw, { stiffness: 120, damping: 18 })
  const bx = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 }), by = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 })

  useEffect(() => {
    if (box.current) {
      const b = box.current.getBoundingClientRect()
      bx.set(b.width / 2)
      by.set(b.height * .58)
    }
  }, [])

  const aim = (e) => {
    if (!box.current) return
    const b = box.current.getBoundingClientRect()
    const y = Math.min(Math.max(e.clientY - b.top, 0), b.height)
    bx.set(e.clientX - b.left)
    by.set(y)
    fRaw.set(y / b.height)
    setHint(false)
  }

  const pick = (i) => { setStop(i); apRaw.set(STOPS[i][1]) }
  const snap = () => { shutterSound(); navigator.vibrate?.(20); setFrames((n) => n + 1); setShot((n) => n + 1) }
  const [f, , sh, iso] = STOPS[stop]
  const irisR = 6 + (4 - stop) * 3

  const imgFilter = useTransform([focus, ap], ([fVal, aVal]) => {
    const dist = Math.abs(fVal - 0.58)
    return `blur(${(dist * aVal * 0.75).toFixed(1)}px)`
  })
  const imgScale = useTransform(focus, [0, 1], [1.04, 1.0])

  return (
    <div ref={box} className="relative h-[100dvh] min-h-[560px] touch-none select-none overflow-hidden bg-black" onPointerDown={(e) => { setLock(false); aim(e) }} onPointerMove={(e) => e.buttons && aim(e)} onPointerUp={() => setLock(true)}>
      {/* Hero Wedding Image with Camera Focus & Aperture depth-of-field simulation */}
      <motion.div style={{ filter: imgFilter, scale: imgScale }} className="absolute inset-0 h-full w-full">
        <img
          src="/hero.jpg"
          alt="Kerala Wedding Moments by Kshana Studio"
          className="h-full w-full object-cover object-[center_35%]"
          draggable={false}
        />
      </motion.div>

      {/* Cinematic Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/65" />

      {/* Film grain / sensor noise */}
      <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay" style={{ opacity: .12 + stop * .06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* Autofocus Reticle */}
      <motion.div style={{ x: bx, y: by }} className="pointer-events-none absolute left-0 top-0">
        <motion.div animate={{ scale: lock ? [1.4, 1] : 1.2, borderColor: lock ? '#7CFF8A' : '#ffffff' }} transition={{ duration: .25 }} className="-ml-9 -mt-9 h-[72px] w-[72px] border-2">
          <div className="absolute inset-x-2 top-1/2 -mt-px h-px bg-current opacity-40" />
          <div className="absolute inset-y-2 left-1/2 -ml-px w-px bg-current opacity-40" />
        </motion.div>
      </motion.div>

      {/* Camera Viewfinder Guides & HUD */}
      <div className="pointer-events-none absolute inset-4 border border-white/30 md:inset-8" />
      <div className="pointer-events-none absolute inset-x-6 top-[max(22px,env(safe-area-inset-top))] flex justify-between font-mono text-xs font-bold tracking-wider text-white md:inset-x-12">
        <span className="drop-shadow-md">f/{f}&nbsp;&nbsp;{sh}&nbsp;&nbsp;ISO {iso}&nbsp;&nbsp;RAW</span>
        <span className="drop-shadow-md">FRAMES {String(frames).padStart(3, '0')}</span>
      </div>

      <div className="pointer-events-none absolute left-6 top-[max(54px,calc(env(safe-area-inset-top)+34px))] font-display text-5xl font-black text-white drop-shadow-lg md:left-12 md:text-7xl">
        Kshana<br /><span className="text-ember">Studio</span>
      </div>

      <AnimatePresence>
        {hint && (
          <motion.p exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 top-[40%] text-center font-mono text-xs md:text-sm font-bold tracking-wide text-white drop-shadow-md">
            Tap or drag anywhere to pull focus
          </motion.p>
        )}
      </AnimatePresence>

      {/* Viewfinder Controls */}
      <div style={{ paddingBottom: 'max(22px, env(safe-area-inset-bottom))' }} className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 rounded-full bg-black/60 p-2 shadow-2xl backdrop-blur-md ring-1 ring-white/15">
          <svg viewBox="-20 -20 40 40" className="ml-1 h-9 w-9" aria-hidden><circle r="18" fill="#111" /><motion.circle animate={{ r: irisR }} fill="#fff" fillOpacity=".9" /></svg>
          {STOPS.map(([n], i) => <button key={n} onClick={() => pick(i)} className={`rounded-full px-3 py-2 font-mono text-sm font-bold transition-colors ${stop === i ? 'bg-ember text-white shadow-lg shadow-ember/40' : 'text-white/80 hover:text-white'}`}>f/{n}</button>)}
        </div>
        <button onClick={snap} aria-label="Take photo" className="grid h-20 w-20 place-items-center rounded-full border-4 border-white shadow-2xl transition-transform active:scale-95"><motion.span whileTap={{ scale: .82 }} className="h-14 w-14 rounded-full bg-white shadow-inner" /></button>
      </div>

      {/* Shutter Animations */}
      <AnimatePresence>{shot > 0 && <motion.div key={shot} initial={{ opacity: .95 }} animate={{ opacity: 0 }} transition={{ duration: .45 }} className="pointer-events-none absolute inset-0 z-20 bg-white" />}</AnimatePresence>
      {shot > 0 && <><motion.div key={`t${shot}`} initial={{ scaleY: 0 }} animate={{ scaleY: [0, 1, 0] }} transition={{ duration: .22 }} className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 origin-top bg-black" /><motion.div key={`b${shot}`} initial={{ scaleY: 0 }} animate={{ scaleY: [0, 1, 0] }} transition={{ duration: .22 }} className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1/2 origin-bottom bg-black" /></>}
    </div>
  )
}

export default function Site() {
  const [kind, setKind] = useState(0)
  const [date, setDate] = useState('')
  return (
    <MotionConfig reducedMotion="user">
      <Viewfinder />

      <section className="px-5 py-24 md:px-12">
        <Focus><p className="max-w-4xl font-display text-[13vw] font-black leading-[.9] md:text-[8rem]">We pull focus on the moments that matter.</p></Focus>
        <Focus d={.1}><p className="mt-8 max-w-md text-xl text-ink/70">Kshana means a single moment. We shoot weddings, portraits, products and events across Kerala.</p></Focus>
      </section>

      <section className="px-5 pb-24 md:px-12">
        <Focus><h2 className="font-display text-6xl font-black md:text-8xl">Shoots</h2></Focus>
        <ul className="mt-8">{SERV.map(([n, d, p], i) => <li key={n}><Focus d={i * .06} className="grid items-baseline gap-2 border-t-2 border-ink py-6 md:grid-cols-[1.2fr_2fr_1fr]"><p className="font-display text-5xl font-black">{n}</p><p className="text-lg text-ink/70">{d}</p><p className="font-mono font-bold md:text-right">From ₹{p.toLocaleString('en-IN')}</p></Focus></li>)}</ul>
      </section>

      <section className="px-5 pb-24 md:px-12">
        <Focus><h2 className="font-display text-6xl font-black md:text-8xl">Contact sheet</h2></Focus>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Focus d={0}>
            <div className="group relative aspect-[3/2] overflow-hidden rounded-md bg-neutral-900">
              <img src="/hero.jpg" alt="Wedding ceremony frame" className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
              <span className="absolute bottom-3 left-3 font-mono text-xs text-white/90">Frame 01 — Wedding</span>
            </div>
          </Focus>
          {Array.from({ length: 5 }, (_, i) => (
            <Focus key={i + 1} d={((i + 1) % 3) * .1}>
              <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-neutral-200">
                <span className="absolute bottom-3 left-3 font-mono text-xs text-ink/50">Frame {i + 2} placeholder</span>
              </div>
            </Focus>
          ))}
        </div>
      </section>

      <section id="book" className="mx-3 mb-3 rounded-[32px] bg-ink px-5 py-16 text-white md:mx-12 md:px-12">
        <Focus><h2 className="font-display text-6xl font-black md:text-8xl">Book a shoot</h2></Focus>
        <div className="mt-8 flex flex-wrap gap-2">{SERV.map(([n], i) => <button key={n} onClick={() => setKind(i)} className={`rounded-full px-6 py-3 font-bold ring-2 ring-white/60 ${kind === i ? 'bg-ember ring-ember' : ''}`}>{n}</button>)}</div>
        <label className="mt-6 block font-mono text-sm" htmlFor="d">Preferred date</label>
        <input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 rounded-2xl bg-white/10 px-5 py-4 [color-scheme:dark]" />
        <div><a href={wa(`Hi Kshana, I'd like to book a ${SERV[kind][0].toLowerCase()} shoot.${date ? `\nDate: ${date}` : ''}`)} className="mt-8 inline-block rounded-full bg-ember px-8 py-4 font-bold">Enquire on WhatsApp</a></div>
      </section>

      <footer className="px-5 pb-10 pt-10 md:px-12"><p className="font-display text-4xl font-black">Kshana Studio</p><p className="mt-3 text-lg">{CO.address}</p><p className="text-lg">{CO.hours}</p><a href="https://www.google.com/maps/search/?api=1&query=Kshana+Studio+Kochi" target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-full px-6 py-3 font-bold ring-2 ring-ink">Open in Maps</a></footer>
    </MotionConfig>
  )
}
