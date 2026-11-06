import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react'

import './App.css'

// three.js + the model only load when a 3D stage is actually shown.
const HeroStage = lazy(() => import('./Stage3D.jsx').then((m) => ({ default: m.HeroStage })))
const ViewerStage = lazy(() => import('./Stage3D.jsx').then((m) => ({ default: m.ViewerStage })))

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const PRODUCT = {
  model: 'Air Jordan 1 Retro High',
  colorway: 'Varsity Red',
  price: '$180.50',
  swatches: [
    { hex: '#B3242F', en: 'Red', nl: 'Rood' },
    { hex: '#1D1C1C', en: 'Black', nl: 'Zwart' },
    { hex: '#F4F1EA', en: 'White', nl: 'Wit' },
  ],
}

const team = [
  { name: 'Noah Julian da Conceição', img: '/about/NoahJulianDaConceicao.webp' },
  { name: 'Mayson Roeleveld', img: '/about/MaysonRoeleveld.webp' },
  { name: 'Nino Sowinangoen', img: '/about/NinoSowinangoen.webp' },
]

const translations = {
  en: {
    skip: 'Skip to content',
    nav: { home: 'Air Jordan 1', viewer: '3D viewer', about: 'About', menu: 'Menu', close: 'Close', label: 'Main' },
    hero: {
      eyebrow: "Retro High — Men's Shoes",
      model: 'Model',
      colorway: 'Colorway',
      price: 'Price',
      cta: 'Explore in 3D',
      details: 'See the details',
      drag: 'Drag to rotate',
      loading3d: 'Loading 3D',
      fig: 'Fig. 01 — Lateral, three-quarter view',
      stageLabel: '3D view of the Air Jordan 1. Use the left and right arrow keys to rotate.',
      imgAlt: 'Air Jordan 1 Retro High in red, black and white, seen from the side',
    },
    detail: {
      index: '02',
      label: 'Up close',
      title: ['UP', 'CLOSE'],
      intro:
        'Four close-ups rendered from the same 3D scan you can turn above. The scan shows the pair as it was captured, creases and wear included.',
      figs: [
        { n: '02', title: 'Outsole', text: 'Concentric pivot circle under the forefoot.', alt: 'Underside of the sneaker showing the outsole tread pattern' },
        { n: '03', title: 'Heel and collar', text: 'Collar, heel overlay and the tongue label.', alt: 'Close-up of the heel and collar from behind' },
        { n: '04', title: 'Swoosh', text: 'Stitching along the Swoosh and the eyestay.', alt: 'Close-up of the black Swoosh and its stitching' },
        { n: '05', title: 'Toe box', text: 'Perforations across the white toe box.', alt: 'Close-up of the perforated toe box' },
      ],
    },
    specs: {
      index: '03',
      label: 'The shoe',
      desc:
        'The Air Jordan 1 Retro High remakes the classic sneaker, giving you a fresh look with a familiar feel. Premium materials with new colors and textures give modern expression to an all-time favorite.',
      rows: { model: 'Model', category: 'Category', colorway: 'Colorway', colors: 'Colors', price: 'Price' },
      category: "Men's Shoes",
      cta: 'Open the 3D viewer',
      top: 'Back to top',
    },
    viewer: {
      title: '3D viewer',
      hint: 'Drag to orbit · scroll or pinch to zoom',
      views: 'Views',
      presets: { hero: '3/4', lateral: 'Lateral', medial: 'Medial', toe: 'Toe', heel: 'Heel', sole: 'Sole' },
      spin: 'Slow turntable',
      loading: 'Loading the 3D model…',
      failed: 'The 3D model could not be shown on this device. Here is the product image instead.',
      load: 'Load 3D model',
      saveData: 'Data saver is on. The 3D model is about 3 MB.',
    },
    about: {
      label: 'The team',
      title: 'ABOUT US',
      intro: 'NTS goons is made by three people. This is who did what.',
      members: [
        {
          role: 'UX Designer & Developer',
          bio: 'Hi, I am Noah Julian da Conceição. I brought this project to life through UX design and front-end development. Starting from Mayson Roelevelds original vision and 3D expertise, I transformed the concept into a polished, interactive website that blends immersive sneaker visuals with an intuitive user experience.',
        },
        {
          role: '3D & Immersive Designer',
          bio: 'Hi, I am Mayson Roeleveld. I started this project by turning my passion for sneakers and 3D design into an interactive concept. My focus was on creating realistic models and immersive visuals that capture every detail, laying the creative foundation for the experience. Together with Noahs UX design and development, the idea evolved into the finished website you see today.',
        },
        {
          role: 'Front-end Engineer',
          bio: 'Hi, I am Nino Sowinangoen. As the planner and tester of this project, I helped organize the development process and ensured every feature worked as intended. By coordinating the workflow and thoroughly testing the website, I helped create a smooth, reliable, and user-friendly experience from start to finish.',
        },
      ],
    },
    footer: {
      top: 'Back to top',
      legal: 'Air Jordan, Jordan and Nike are trademarks of Nike, Inc. NTS goons is not affiliated with Nike.',
      lang: 'Language',
    },
  },
  nl: {
    skip: 'Naar de inhoud',
    nav: { home: 'Air Jordan 1', viewer: '3D-viewer', about: 'Over ons', menu: 'Menu', close: 'Sluiten', label: 'Hoofdmenu' },
    hero: {
      eyebrow: 'Retro High — Herenschoenen',
      model: 'Model',
      colorway: 'Kleurstelling',
      price: 'Prijs',
      cta: 'Bekijk in 3D',
      details: 'Bekijk de details',
      drag: 'Sleep om te draaien',
      loading3d: '3D laden',
      fig: 'Fig. 01 — Buitenkant, driekwart aanzicht',
      stageLabel: '3D-weergave van de Air Jordan 1. Gebruik de pijltjestoetsen links en rechts om te draaien.',
      imgAlt: 'Air Jordan 1 Retro High in rood, zwart en wit, van opzij gezien',
    },
    detail: {
      index: '02',
      label: 'Van dichtbij',
      title: ['VAN', 'DICHTBIJ'],
      intro:
        'Vier close-ups, gerenderd uit dezelfde 3D-scan die je hierboven kunt draaien. De scan toont het paar zoals het is vastgelegd, met plooien en slijtage.',
      figs: [
        { n: '02', title: 'Buitenzool', text: 'Concentrische draaicirkel onder de voorvoet.', alt: 'Onderkant van de sneaker met het profiel van de buitenzool' },
        { n: '03', title: 'Hiel en kraag', text: 'Kraag, hielstuk en het label op de tong.', alt: 'Close-up van de hiel en kraag van achteren' },
        { n: '04', title: 'Swoosh', text: 'Stiksels langs de Swoosh en de veterrij.', alt: 'Close-up van de zwarte Swoosh en de stiksels' },
        { n: '05', title: 'Neus', text: 'Perforaties over de witte neus.', alt: 'Close-up van de geperforeerde neus' },
      ],
    },
    specs: {
      index: '03',
      label: 'De schoen',
      desc:
        'De Air Jordan 1 Retro High geeft de klassieke sneaker een frisse look met een vertrouwd gevoel. Premium materialen met nieuwe kleuren en texturen geven een moderne draai aan een tijdloze favoriet.',
      rows: { model: 'Model', category: 'Categorie', colorway: 'Kleurstelling', colors: 'Kleuren', price: 'Prijs' },
      category: 'Herenschoenen',
      cta: 'Open de 3D-viewer',
      top: 'Terug naar boven',
    },
    viewer: {
      title: '3D-viewer',
      hint: 'Sleep om te draaien · scroll of knijp om te zoomen',
      views: 'Aanzichten',
      presets: { hero: '3/4', lateral: 'Buiten', medial: 'Binnen', toe: 'Neus', heel: 'Hiel', sole: 'Zool' },
      spin: 'Langzaam draaien',
      loading: '3D-model laden…',
      failed: 'Het 3D-model kan op dit apparaat niet worden getoond. Hier is de productafbeelding.',
      load: '3D-model laden',
      saveData: 'Databesparing staat aan. Het 3D-model is ongeveer 3 MB.',
    },
    about: {
      label: 'Het team',
      title: 'OVER ONS',
      intro: 'NTS goons is gemaakt door drie mensen. Dit is wie wat deed.',
      members: [
        {
          role: 'UX-ontwerper & Developer',
          bio: 'Hoi, ik ben Noah Julian da Conceição. Ik heb dit project tot leven gebracht met UX-design en front-end development. Vanuit Mayson Roelevelds oorspronkelijke visie en 3D-expertise heb ik het concept omgevormd tot een verzorgde, interactieve website die meeslepende sneakervisuals combineert met een intuïtieve gebruikerservaring.',
        },
        {
          role: '3D- & Immersive Ontwerper',
          bio: 'Hoi, ik ben Mayson Roeleveld. Ik begon dit project door mijn passie voor sneakers en 3D-design om te zetten in een interactief concept. Mijn focus lag op realistische modellen en meeslepende visuals die elk detail vastleggen, wat de creatieve basis legde voor de ervaring. Samen met Noahs UX-design en development groeide het idee uit tot de afgeronde website die je nu ziet.',
        },
        {
          role: 'Front-end Engineer',
          bio: 'Hoi, ik ben Nino Sowinangoen. Als planner en tester van dit project hielp ik het ontwikkelproces te organiseren en zorgde ik dat elke functie werkte zoals bedoeld. Door de workflow te coördineren en de website grondig te testen, hielp ik een soepele, betrouwbare en gebruiksvriendelijke ervaring te creëren van begin tot eind.',
        },
      ],
    },
    footer: {
      top: 'Terug naar boven',
      legal: 'Air Jordan, Jordan en Nike zijn handelsmerken van Nike, Inc. NTS goons is niet verbonden aan Nike.',
      lang: 'Taal',
    },
  },
}

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: translations.en })
const useLang = () => useContext(LangContext)

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const ROUTES = { '': 'home', viewer: 'viewer', about: 'about' }
const HREF = { home: '#/', viewer: '#/viewer', about: '#/about' }

function readRoute() {
  const key = window.location.hash.replace(/^#\/?/, '').split('/')[0]
  return ROUTES[key] ?? 'home'
}

function useRoute() {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

function readStoredLang() {
  try {
    const v = localStorage.getItem('nts-lang')
    if (v && translations[v]) return v
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('nl') ? 'nl' : 'en'
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

const scrollTop = () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })

function Picture({ name, widths, sizes, alt, eager, className }) {
  const fallback = widths.includes(1200) ? 1200 : widths[0]
  return (
    <img
      className={className}
      src={`/img/${name}-${fallback}.webp`}
      srcSet={widths.map((w) => `/img/${name}-${w}.webp ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  )
}

function Arrow({ dir = 'right' }) {
  const d = { right: 'M1 6h13M9 1l5 5-5 5', down: 'M6 1v13M1 9l5 5 5-5', up: 'M6 14V1M1 6l5-5 5 5' }[dir]
  const vb = dir === 'right' ? '0 0 15 12' : '0 0 12 15'
  return (
    <svg className="arrow" viewBox={vb} width={dir === 'right' ? 15 : 12} height={dir === 'right' ? 12 : 15} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Chrome                                                              */
/* ------------------------------------------------------------------ */

function LangSwitch() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang" role="group" aria-label={t.footer.lang}>
      {Object.keys(translations).map((code, i) => (
        <span key={code}>
          {i > 0 && <span className="lang-sep" aria-hidden="true">/</span>}
          <button
            type="button"
            className="lang-btn"
            aria-pressed={lang === code}
            lang={code}
            onClick={() => setLang(code)}
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  )
}

function NavLinks({ route, onNavigate }) {
  const { t } = useLang()
  return (['home', 'viewer', 'about'].map((key) => (
    <a
      key={key}
      href={HREF[key]}
      className="nav-link"
      aria-current={route === key ? 'page' : undefined}
      onClick={onNavigate}
    >
      {t.nav[key]}
    </a>
  )))
}

function Header({ route }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.documentElement.classList.add('menu-lock')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('menu-lock')
    }
  }, [open])

  return (
    <header className={`header${open ? ' is-open' : ''}`}>
      <a className="logo" href="#/" onClick={() => setOpen(false)}>
        NTS goons
      </a>
      <nav className="nav" aria-label={t.nav.label}>
        <NavLinks route={route} />
      </nav>
      <div className="header-end">
        <LangSwitch />
        <button
          ref={toggleRef}
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? t.nav.close : t.nav.menu}
        </button>
      </div>
      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label={t.nav.label}>
          <NavLinks route={route} onNavigate={() => setOpen(false)} />
        </nav>
        <LangSwitch />
      </div>
    </header>
  )
}

function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer">
      <div className="footer-row">
        <a className="footer-mark" href="#/">NTS goons</a>
        <nav className="footer-nav" aria-label="Footer">
          <NavLinks route={null} />
        </nav>
        <button type="button" className="text-link" onClick={scrollTop}>
          {t.footer.top} <Arrow dir="up" />
        </button>
      </div>
      <div className="footer-row footer-small">
        <span>© {new Date().getFullYear()} NTS goons</span>
        <span>{t.footer.legal}</span>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Product stage: static image first, 3D swaps in when ready           */
/* ------------------------------------------------------------------ */

function useCanLoad3D() {
  const [state] = useState(() => {
    if (!hasWebGL()) return 'none'
    if (navigator.connection?.saveData) return 'ask'
    return 'auto'
  })
  return state
}

function HeroProduct() {
  const { t } = useLang()
  const mode = useCanLoad3D()
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [touched, setTouched] = useState(false)
  const [rotateBy, setRotateBy] = useState(null)

  // Start loading 3D once the browser is idle and the entrance has played.
  useEffect(() => {
    if (mode !== 'auto') return
    const start = () => setMount(true)
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2000 })
      : window.setTimeout(start, 1200)
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id))
  }, [mode])

  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setFailed(true), [])
  const live = ready && !failed

  const onKeyDown = (e) => {
    if (!live) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      setTouched(true)
      setRotateBy({ delta: e.key === 'ArrowLeft' ? -0.3 : 0.3 })
    }
  }

  return (
    <figure className={`hero-product${live ? ' is-live' : ''}`}>
      <div
        className="product-stage"
        tabIndex={live ? 0 : -1}
        role={live ? 'img' : undefined}
        aria-label={live ? t.hero.stageLabel : undefined}
        onKeyDown={onKeyDown}
        onPointerDown={() => setTouched(true)}
      >
        <Picture
          className="product-img"
          name="hero"
          widths={[2000, 1200, 800]}
          sizes="(min-width: 900px) 62vw, 100vw"
          alt={t.hero.imgAlt}
          eager
        />
        {mount && !failed && (
          <div className="product-canvas" aria-hidden="true">
            <Suspense fallback={null}>
              <HeroStage onReady={onReady} onError={onError} rotateBy={rotateBy} />
            </Suspense>
          </div>
        )}
      </div>
      <figcaption className="hero-caption">
        <span className="fig">{t.hero.fig}</span>
        <span className={`drag-hint${live ? ' is-visible' : ''}${touched ? ' is-quiet' : ''}`} aria-hidden={!live}>
          <svg viewBox="0 0 28 10" width="28" height="10" aria-hidden="true">
            <path d="M1 5h26M5 1L1 5l4 4M23 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          {mount && !ready && !failed ? t.hero.loading3d : t.hero.drag}
        </span>
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

function Swatches({ withLabels }) {
  const { lang } = useLang()
  return (
    <span className="swatches">
      {PRODUCT.swatches.map((s) => (
        <span key={s.hex} className="swatch-item">
          <span className="swatch" style={{ background: s.hex }} title={s[lang]} />
          {withLabels && <span>{s[lang]}</span>}
        </span>
      ))}
    </span>
  )
}

function Hero() {
  const { t } = useLang()
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero-eyebrow">{t.hero.eyebrow}</p>
      <h1 id="hero-title" className="hero-title">
        <span className="line line-air"><span className="word">AIR</span></span>
        <span className="line line-jordan"><span className="word">JORDAN</span></span>
        <span className="sr-only"> 1 Retro High</span>
      </h1>
      <span className="hero-numeral" aria-hidden="true">1</span>

      <HeroProduct />

      <div className="product-block">
        <dl className="spec-list">
          <div>
            <dt>{t.hero.model}</dt>
            <dd>{PRODUCT.model}</dd>
          </div>
          <div>
            <dt>{t.hero.colorway}</dt>
            <dd className="dd-colorway">
              {PRODUCT.colorway} <Swatches />
            </dd>
          </div>
          <div>
            <dt>{t.hero.price}</dt>
            <dd className="price">{PRODUCT.price}</dd>
          </div>
        </dl>
        <div className="product-actions">
          <a className="btn" href="#/viewer">
            {t.hero.cta} <Arrow />
          </a>
          <button type="button" className="text-link" onClick={() => scrollToId('details')}>
            {t.hero.details} <Arrow dir="down" />
          </button>
        </div>
      </div>
    </section>
  )
}

function Fig({ fig, children, className }) {
  return (
    <figure className={`detail-fig ${className}`}>
      <div className="detail-frame">{children}</div>
      <figcaption>
        <span className="fig-n">Fig. {fig.n}</span>
        <span className="fig-title">{fig.title}</span>
        <span className="fig-text">{fig.text}</span>
      </figcaption>
    </figure>
  )
}

function Details() {
  const { t } = useLang()
  const f = t.detail.figs
  return (
    <section id="details" className="details" tabIndex={-1} aria-labelledby="details-title">
      <header className="section-head">
        <p className="section-label">
          <span>{t.detail.index}</span> {t.detail.label}
        </p>
        <h2 id="details-title" className="details-title reveal">
          <span>{t.detail.title[0]}</span> <span>{t.detail.title[1]}</span>
        </h2>
        <p className="details-intro reveal">{t.detail.intro}</p>
      </header>

      <Fig fig={f[0]} className="fig-sole reveal">
        <Picture name="detail-sole" widths={[2000, 1200, 800]} sizes="(min-width: 900px) 66vw, 100vw" alt={f[0].alt} />
      </Fig>
      <Fig fig={f[1]} className="fig-heel reveal">
        <Picture name="detail-heel" widths={[1200, 800]} sizes="(min-width: 900px) 30vw, 70vw" alt={f[1].alt} />
      </Fig>
      <Fig fig={f[2]} className="fig-swoosh reveal">
        <Picture name="detail-swoosh" widths={[1800, 1200, 800]} sizes="(min-width: 900px) 50vw, 100vw" alt={f[2].alt} />
      </Fig>
      <Fig fig={f[3]} className="fig-toe reveal">
        <Picture name="detail-toe" widths={[2000, 1200, 800]} sizes="(min-width: 900px) 58vw, 100vw" alt={f[3].alt} />
      </Fig>
    </section>
  )
}

function Specs() {
  const { t } = useLang()
  const r = t.specs.rows
  return (
    <section className="specs" aria-labelledby="specs-title">
      <p className="section-label">
        <span>{t.specs.index}</span> {t.specs.label}
      </p>
      <div className="specs-grid">
        <h2 id="specs-title" className="specs-title reveal">
          Air Jordan 1<br />Retro High
        </h2>
        <p className="specs-desc reveal">{t.specs.desc}</p>
        <dl className="spec-table reveal">
          <div><dt>{r.model}</dt><dd>{PRODUCT.model}</dd></div>
          <div><dt>{r.category}</dt><dd>{t.specs.category}</dd></div>
          <div><dt>{r.colorway}</dt><dd>{PRODUCT.colorway}</dd></div>
          <div><dt>{r.colors}</dt><dd><Swatches withLabels /></dd></div>
          <div><dt>{r.price}</dt><dd className="price">{PRODUCT.price}</dd></div>
        </dl>
        <div className="specs-actions reveal">
          <a className="btn" href="#/viewer">
            {t.specs.cta} <Arrow />
          </a>
          <button type="button" className="text-link" onClick={scrollTop}>
            {t.specs.top} <Arrow dir="up" />
          </button>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <>
      <Hero />
      <Details />
      <Specs />
    </>
  )
}

function ViewerPage() {
  const { t } = useLang()
  const mode = useCanLoad3D()
  const [requested, setRequested] = useState(mode === 'auto')
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(mode === 'none')
  const [preset, setPreset] = useState(null)
  const [active, setActive] = useState('hero')
  const [spin, setSpin] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setFailed(true), [])
  const live = ready && !failed

  const choose = (name) => {
    setActive(name)
    setPreset({ name })
  }

  return (
    <section className="viewer" aria-labelledby="viewer-title">
      <div className="viewer-head">
        <p className="section-label">
          <span>3D</span> {PRODUCT.model}
        </p>
        <h1 id="viewer-title" className="viewer-title">{t.viewer.title}</h1>
      </div>

      <div className={`viewer-stage${live ? ' is-live' : ''}`}>
        <Picture className="product-img" name="hero" widths={[2000, 1200, 800]} sizes="100vw" alt={t.hero.imgAlt} eager />
        {requested && !failed && (
          <div className="product-canvas">
            <Suspense fallback={null}>
              <ViewerStage onReady={onReady} onError={onError} preset={preset} autoRotate={spin} />
            </Suspense>
          </div>
        )}
        <p className="viewer-status" role="status">
          {failed && t.viewer.failed}
          {!failed && requested && !ready && t.viewer.loading}
          {!failed && live && t.viewer.hint}
        </p>
        {!requested && !failed && (
          <div className="viewer-ask">
            <p>{t.viewer.saveData}</p>
            <button type="button" className="btn" onClick={() => setRequested(true)}>
              {t.viewer.load}
            </button>
          </div>
        )}
      </div>

      <div className="viewer-controls" aria-disabled={!live}>
        <fieldset className="presets" disabled={!live}>
          <legend>{t.viewer.views}</legend>
          {Object.entries(t.viewer.presets).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={active === key} onClick={() => choose(key)}>
              {label}
            </button>
          ))}
        </fieldset>
        <label className="toggle">
          <input type="checkbox" checked={spin} disabled={!live} onChange={(e) => setSpin(e.target.checked)} />
          <span className="toggle-box" aria-hidden="true" />
          {t.viewer.spin}
        </label>
        <p className="viewer-meta">
          <span>{PRODUCT.colorway}</span>
          <span className="price">{PRODUCT.price}</span>
        </p>
      </div>
    </section>
  )
}

function AboutPage() {
  const { t } = useLang()
  return (
    <section className="about" aria-labelledby="about-title">
      <p className="section-label">
        <span>NTS</span> {t.about.label}
      </p>
      <h1 id="about-title" className="about-title">{t.about.title}</h1>
      <p className="about-intro">{t.about.intro}</p>

      <ol className="team">
        {team.map((person, i) => {
          const copy = t.about.members[i]
          return (
            <li key={person.name} className={`member member-${i + 1} reveal`}>
              <figure className="member-photo">
                <img src={person.img} alt={person.name} width="800" height="600" loading="lazy" decoding="async" />
              </figure>
              <div className="member-text">
                <span className="member-index">{String(i + 1).padStart(2, '0')}</span>
                <h2>{person.name}</h2>
                <p className="member-role">{copy.role}</p>
                <p className="member-bio">{copy.bio}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

const pages = { home: HomePage, viewer: ViewerPage, about: AboutPage }

/* Fade-and-rise for elements marked .reveal as they enter the viewport. */
function useReveal(route) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [route])
}

export default function App() {
  const route = useRoute()
  const [lang, setLangState] = useState(readStoredLang)
  const t = translations[lang] ?? translations.en
  const mainRef = useRef(null)
  const first = useRef(true)

  const setLang = useCallback((code) => {
    setLangState(code)
    try {
      localStorage.setItem('nts-lang', code)
    } catch {
      /* storage unavailable */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // New page: start at the top and move focus to the content for screen readers.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [route])

  useReveal(route)

  const Page = pages[route] ?? HomePage

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
        {t.skip}
      </a>
      <div className={`site site-${route}`}>
        <Header route={route} />
        <main id="main" ref={mainRef} tabIndex={-1}>
          <Page />
        </main>
        <Footer />
      </div>
    </LangContext.Provider>
  )
}
