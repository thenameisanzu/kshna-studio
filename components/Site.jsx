'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig, useMotionValue, useSpring, useTransform } from 'framer-motion'

// ---- Edit content here ----
const CO = { whatsapp: '910000000000', instagram: 'kshanastudio', address: 'Studio address, Kochi, Kerala', hours: 'Mon to Sat, 10 am to 7 pm' }
const SERV = [['Weddings', 'The whole day, told in order. Delivered in three weeks.', 45000], ['Portraits', 'Studio or outdoor, with styling guidance.', 6000], ['Product', 'Clean, consistent shots for shops and brands.', 8000], ['Events', 'Launches, corporate and family gatherings.', 15000]]
const STOPS = [['1.8', 22, '1/4000', 100], ['2.8', 14, '1/2000', 100], ['4', 8, '1/1000', 200], ['8', 3, '1/250', 400], ['16', .6, '1/60', 800]]
const wa = (t) => `https://wa.me/${CO.whatsapp}?text=${encodeURIComponent(t)}`
const insta = (h = CO.instagram) => `https://instagram.com/${h.replace('@', '')}`

const FRAMES = [
  { num: '01', cat: 'Wedding', title: 'Muhurtham Vows', src: '/hero.jpg', alt: 'Kerala wedding vows moment' },
  { num: '02', cat: 'Portraits', title: 'Kasavu & Vilakku', src: '/frame-02.jpg', alt: 'Portrait of woman in traditional kasavu saree holding lamp' },
  { num: '03', cat: 'Product', title: 'Cardamom & Coffee EDP', src: '/frame-03.jpg', alt: 'Luxury perfume product styling with cardamom and coffee' },
  { num: '04', cat: 'Events', title: 'Courtyard Soirée', src: '/frame-04.jpg', alt: 'Candid celebration evening under warm fairy lights' },
  { num: '05', cat: 'Wedding', title: 'Laughter at Twilight', src: '/frame-05.jpg', alt: 'Bride and groom laughing together outdoors' },
  { num: '06', cat: 'Portraits', title: 'Chiaroscuro Studio', src: '/frame-06.jpg', alt: 'Dramatic editorial studio portrait with fine lighting' }
]

const INSTA_POSTS = [
  {
    id: 1,
    img: '/insta-01.jpg',
    type: 'carousel',
    likes: '1,420',
    comments: '48',
    caption: 'Intricate henna, heirloom gold & mullappoo. Mattancherry wedding details.',
    date: '2d'
  },
  {
    id: 2,
    img: '/insta-02.jpg',
    type: 'reel',
    likes: '3,890',
    comments: '112',
    caption: '6:15 AM mist cutting across Vembanad lake. Silence before the oars strike.',
    date: '4d'
  },
  {
    id: 3,
    img: '/frame-05.jpg',
    type: 'post',
    likes: '2,150',
    comments: '64',
    caption: 'When the rituals pause and they catch each other’s eyes. Unscripted joy.',
    date: '6d'
  },
  {
    id: 4,
    img: '/frame-02.jpg',
    type: 'post',
    likes: '1,830',
    comments: '53',
    caption: 'Natural sunlight through ancestral wooden pillars. Fort Kochi portraits.',
    date: '1w'
  },
  {
    id: 5,
    img: '/frame-04.jpg',
    type: 'reel',
    likes: '2,640',
    comments: '89',
    caption: 'A hundred fairy lights, warm laughter, and stories stretching past midnight.',
    date: '1w'
  },
  {
    id: 6,
    img: '/frame-03.jpg',
    type: 'carousel',
    likes: '1,290',
    comments: '37',
    caption: 'Commercial series for local botanicals: cardamom pods dried on stone.',
    date: '2w'
  }
]

let ctx
const shutterSound = () => {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume()
  ;[0, .09].forEach((d, i) => { const b = ctx.createBuffer(1, ctx.sampleRate * .05, ctx.sampleRate), a = b.getChannelData(0); for (let k = 0; k < a.length; k++) a[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / a.length, 3); const n = ctx.createBufferSource(), g = ctx.createGain(); n.buffer = b; g.gain.value = i ? .35 : .6; n.connect(g).connect(ctx.destination); n.start(ctx.currentTime + d) })
}

function Focus({ children, d = 0, className = '' }) {
  return <motion.div initial={{ opacity: 0, filter: 'blur(14px)', y: 20 }} whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .9, delay: d, ease: [.16, 1, .3, 1] }} className={className}>{children}</motion.div>
}

function Viewfinder() {
  const box = useRef(null)
  const touchStartRef = useRef(null)
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

  const aim = (point) => {
    if (!box.current) return
    const b = box.current.getBoundingClientRect()
    const cx = point.clientX ?? point.x
    const cy = point.clientY ?? point.y
    const y = Math.min(Math.max(cy - b.top, 0), b.height)
    bx.set(cx - b.left)
    by.set(y)
    fRaw.set(y / b.height)
    setHint(false)
  }

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse') {
      setLock(false)
      aim(e)
    } else {
      touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
    }
  }

  const handlePointerMove = (e) => {
    if (e.pointerType === 'mouse' && e.buttons) {
      aim(e)
    }
  }

  const handlePointerUp = (e) => {
    if (e.pointerType === 'mouse') {
      setLock(true)
    } else if (touchStartRef.current) {
      const dx = Math.abs(e.clientX - touchStartRef.current.x)
      const dy = Math.abs(e.clientY - touchStartRef.current.y)
      const dt = Date.now() - touchStartRef.current.time
      if (dx < 14 && dy < 14 && dt < 450) {
        setLock(false)
        aim({ x: touchStartRef.current.x, y: touchStartRef.current.y })
        navigator.vibrate?.(15)
        setTimeout(() => setLock(true), 350)
      }
      touchStartRef.current = null
    }
  }

  const handlePointerCancel = () => {
    touchStartRef.current = null
    setLock(true)
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
    <div
      ref={box}
      className="relative h-[100dvh] min-h-[560px] touch-pan-y select-none overflow-hidden bg-black"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
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
          <motion.p exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 top-[40%] px-4 text-center font-mono text-xs md:text-sm font-bold tracking-wide text-white drop-shadow-md">
            <span className="md:hidden">Tap anywhere to focus • Swipe to explore</span>
            <span className="hidden md:inline">Tap or drag anywhere to pull focus</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Viewfinder Controls */}
      <div style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }} className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 rounded-full bg-black/60 p-2 shadow-2xl backdrop-blur-md ring-1 ring-white/15">
          <svg viewBox="-20 -20 40 40" className="ml-1 h-9 w-9" aria-hidden><circle r="18" fill="#111" /><motion.circle animate={{ r: irisR }} fill="#fff" fillOpacity=".9" /></svg>
          {STOPS.map(([n], i) => <button key={n} onClick={() => pick(i)} className={`rounded-full px-3 py-2 font-mono text-sm font-bold transition-colors ${stop === i ? 'bg-ember text-white shadow-lg shadow-ember/40' : 'text-white/80 hover:text-white'}`}>f/{n}</button>)}
        </div>
        <button onClick={snap} aria-label="Take photo" className="grid h-18 w-18 md:h-20 md:w-20 place-items-center rounded-full border-4 border-white shadow-2xl transition-transform active:scale-95"><motion.span whileTap={{ scale: .82 }} className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white shadow-inner" /></button>
        <a href="#intro" className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-white/70 transition-colors hover:text-white" aria-label="Scroll to explore">
          <span>SCROLL TO EXPLORE</span>
          <svg className="h-3.5 w-3.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
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

      <section id="intro" className="px-5 py-24 md:px-12">
        <Focus><p className="max-w-4xl font-display text-[13vw] font-black leading-[.9] md:text-[8rem]">We pull focus on the moments that matter.</p></Focus>
        <Focus d={.1}><p className="mt-8 max-w-md text-xl text-ink/70">Kshana means a single moment. We shoot weddings, portraits, products and events across Kerala.</p></Focus>
      </section>

      <section id="shoots" className="px-5 pb-24 md:px-12">
        <Focus><h2 className="font-display text-6xl font-black md:text-8xl">Shoots</h2></Focus>
        <ul className="mt-8">{SERV.map(([n, d, p], i) => <li key={n}><Focus d={i * .06} className="grid items-baseline gap-2 border-t-2 border-ink py-6 md:grid-cols-[1.2fr_2fr_1fr]"><p className="font-display text-5xl font-black">{n}</p><p className="text-lg text-ink/70">{d}</p><p className="font-mono font-bold md:text-right">From ₹{p.toLocaleString('en-IN')}</p></Focus></li>)}</ul>
      </section>

      <section id="contact-sheet" className="px-5 pb-24 md:px-12">
        <Focus>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ember">Curated Proofs</p>
              <h2 className="font-display text-6xl font-black md:text-8xl">Contact sheet</h2>
            </div>
            <p className="max-w-md font-mono text-xs text-ink/60">
              Raw frames from recent assignments across Kerala. 35mm &amp; medium format digital.
            </p>
          </div>
        </Focus>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {FRAMES.map((f, i) => (
            <Focus key={f.num} d={((i % 3) * 0.08)}>
              <div className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-neutral-900 shadow-md">
                <img
                  src={f.src}
                  alt={f.alt}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between font-mono text-xs text-white">
                  <div>
                    <span className="block font-bold tracking-wider text-white/95">
                      Frame {f.num} — {f.cat}
                    </span>
                    <span className="block text-[11px] text-white/70">{f.title}</span>
                  </div>
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-widest backdrop-blur-sm">
                    RAW
                  </span>
                </div>
              </div>
            </Focus>
          ))}
        </div>
      </section>

      {/* Instagram Integration Placeholder */}
      <section id="instagram" className="px-5 pb-24 md:px-12">
        <Focus>
          <div className="flex flex-col gap-4 border-t-2 border-ink pt-12 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-sm">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Live Dispatch</span>
              </div>
              <h2 className="mt-1 font-display text-5xl font-black md:text-7xl">@{CO.instagram}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-semibold text-ink/60">14.8K followers • 384 frames</span>
              <a
                href={insta()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-xs font-bold text-white shadow-md transition-all hover:bg-ember active:scale-95"
              >
                <span>Follow on Instagram</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </Focus>

        {/* Instagram Post Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {INSTA_POSTS.map((post, i) => (
            <Focus key={post.id} d={(i % 6) * 0.05}>
              <a
                href={insta()}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-lg bg-neutral-900 shadow-sm"
              >
                <img
                  src={post.img}
                  alt={post.caption}
                  className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                />

                {/* Badge top-right */}
                <div className="absolute right-2 top-2 rounded bg-black/60 p-1 text-white backdrop-blur-sm transition-opacity group-hover:opacity-0">
                  {post.type === 'reel' ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : post.type === 'carousel' ? (
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  ) : null}
                </div>

                {/* Hover overlay with likes, comments, and caption */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/75 p-3 text-white opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex items-center justify-between font-mono text-[11px] text-white/80">
                    <span className="flex items-center gap-1 font-bold">
                      <svg className="h-3.5 w-3.5 fill-ember text-ember" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                      </svg>
                      {post.comments}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-xs leading-snug text-white/90">
                    {post.caption}
                  </p>
                  <span className="font-mono text-[10px] text-white/60">
                    {post.date} ago • View post ↗
                  </span>
                </div>
              </a>
            </Focus>
          ))}
        </div>

        {/* Studio handle note */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-ink/50">
          <span>Feed integration placeholder • Connects to Instagram Graph API</span>
          <a href={insta()} target="_blank" rel="noreferrer" className="underline hover:text-ember">
            @{CO.instagram}
          </a>
        </div>
      </section>

      <section id="book" className="mx-3 mb-3 rounded-[32px] bg-ink px-5 py-16 text-white md:mx-12 md:px-12">
        <Focus><h2 className="font-display text-6xl font-black md:text-8xl">Book a shoot</h2></Focus>
        <div className="mt-8 flex flex-wrap gap-2">{SERV.map(([n], i) => <button key={n} onClick={() => setKind(i)} className={`rounded-full px-6 py-3 font-bold ring-2 ring-white/60 ${kind === i ? 'bg-ember ring-ember' : ''}`}>{n}</button>)}</div>
        <label className="mt-6 block font-mono text-sm" htmlFor="d">Preferred date</label>
        <input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 rounded-2xl bg-white/10 px-5 py-4 [color-scheme:dark]" />
        <div><a href={wa(`Hi Kshana, I'd like to book a ${SERV[kind][0].toLowerCase()} shoot.${date ? `\nDate: ${date}` : ''}`)} className="mt-8 inline-block rounded-full bg-ember px-8 py-4 font-bold">Enquire on WhatsApp</a></div>
      </section>

      <footer className="px-5 pb-10 pt-10 md:px-12">
        <p className="font-display text-4xl font-black">Kshana Studio</p>
        <p className="mt-3 text-lg">{CO.address}</p>
        <p className="text-lg">{CO.hours}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="https://www.google.com/maps/search/?api=1&query=Kshana+Studio+Kochi" target="_blank" rel="noreferrer" className="inline-block rounded-full px-6 py-3 font-bold ring-2 ring-ink hover:bg-ink hover:text-white transition-colors">Open in Maps</a>
          <a href={insta()} target="_blank" rel="noreferrer" className="inline-block rounded-full px-6 py-3 font-bold ring-2 ring-ink hover:bg-ink hover:text-white transition-colors">Instagram @{CO.instagram} ↗</a>
        </div>
      </footer>
    </MotionConfig>
  )
}
