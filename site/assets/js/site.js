/* ============================================================================
   site.js · builds shared chrome (header / sidebar / footer), mobile drawer,
   reading-progress bar, prev-next, and the localStorage progress store.
   Pages only need: <body data-page="home|syllabus|lesson" data-lesson="id">
   and a <main id="main"> with their content.
   ============================================================================ */
(function () {
  "use strict";
  const C = window.COURSE;
  const BASE = (window.SITE_BASE || "").replace(/\/$/, ""); // optional sub-path support
  const url = (p) => BASE + p;

  /* ---------------------------------------------------- icon library ---- */
  const I = {
    menu: 'M4 7h16M4 12h16M4 17h16',
    check: 'M20 6 9 17l-5-5',
    chevron: 'M9 6l6 6-6 6',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
    book: 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM18 3v16',
    map: 'M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z M9 4v14 M15 6v14',
    clock: 'M12 8v4l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    signal: 'M3 20h2v-4H3zM9 20h2V10H9zM15 20h2V4h-2z',
    spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  };
  function svg(d, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${
      d.split('M').filter(Boolean).map((seg) => `<path d="M${seg.trim()}"/>`).join('')
    }</svg>`;
  }

  /* ---------------------------------------------------- progress store -- */
  const KEY = C.meta.storageKey;
  const Progress = {
    _read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
    _write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {} },
    isDone(id) { return !!this._read()[id]; },
    set(id, v) { const o = this._read(); if (v) o[id] = Date.now(); else delete o[id]; this._write(o); this._emit(); },
    toggle(id) { this.set(id, !this.isDone(id)); return this.isDone(id); },
    doneCount() { const o = this._read(); return C.allLessons().filter((l) => o[l.id]).length; },
    total() { return C.allLessons().length; },
    pct() { return Math.round((this.doneCount() / Math.max(1, this.total())) * 100); },
    _subs: [],
    onChange(fn) { this._subs.push(fn); },
    _emit() { this._subs.forEach((fn) => fn()); },
  };
  window.Progress = Progress;

  /* ---------------------------------------------------- HEADER ---------- */
  function buildHeader(page) {
    const h = document.createElement("header");
    h.className = "site-header";
    h.innerHTML = `
      <button class="menu-toggle" aria-label="Open course menu" aria-expanded="false">${svg(I.menu)}</button>
      <a class="brand-lockup" href="${url('/')}" aria-label="Home — Penguin Empire 2551">
        <img src="${url('/assets/img/logo-2551.png')}" alt="" width="40" height="40">
        <span class="brand-name">Penguin <b>Empire</b><span class="brand-sub">2551 · Code Academy</span></span>
      </a>
      <span class="header-spacer"></span>
      <nav class="header-nav">
        <a href="${url('/')}" data-nav="home">Home</a>
        <a href="${url('/syllabus.html')}" data-nav="syllabus">Curriculum</a>
        <a class="btn btn--sm btn--primary" href="${url('/lessons/java/what-is-programming.html')}">Start learning</a>
      </nav>`;
    h.querySelector(`[data-nav="${page}"]`)?.classList.add("is-active");
    const toggle = h.querySelector(".menu-toggle");
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open);
    });
    return h;
  }

  /* ---------------------------------------------------- SIDEBAR --------- */
  function buildSidebar(currentId) {
    const aside = document.createElement("aside");
    aside.className = "sidebar";
    aside.id = "course-nav";

    let html = `
      <div class="sidebar-head">
        <div class="sidebar-progress-label"><span>Your progress</span><span data-prog-text>0%</span></div>
        <div class="progress-track"><div class="progress-fill" data-prog-fill></div></div>
      </div>`;

    C.tracks.forEach((tr) => {
      html += `<div class="nav-track"><div class="nav-track-title">${tr.tag} · ${tr.label}<span class="rule"></span></div>`;
      tr.units.forEach((u) => {
        const hasCurrent = u.lessons.some((l) => l.id === currentId);
        html += `<div class="nav-unit" aria-expanded="${hasCurrent ? "true" : "false"}">
          <button class="nav-unit-btn" type="button">
            ${svg(I.chevron, "chev")}
            <span class="nav-unit-num">${u.num}</span>
            <span class="nav-unit-name">${u.title}</span>
          </button>
          <ul class="nav-lessons">`;
        u.lessons.forEach((l) => {
          const done = Progress.isDone(l.id);
          const cur = l.id === currentId;
          const cls = [l.ready ? "" : "is-locked", done ? "is-done" : "", cur ? "is-current" : ""].join(" ").trim();
          const href = l.ready ? url(l.href) : null;
          const tail = l.ready
            ? `<span class="nav-check">${svg(I.check)}</span>`
            : svg(I.lock, "nav-lock");
          html += href
            ? `<li><a href="${href}" class="${cls}" data-lesson-link="${l.id}"><span class="nav-lesson-t">${l.t}</span>${tail}</a></li>`
            : `<li><a class="${cls}" aria-disabled="true" title="Locked"><span class="nav-lesson-t">${l.t}</span>${tail}</a></li>`;
        });
        html += `</ul></div>`;
      });
      html += `</div>`;
    });

    aside.innerHTML = html;
    aside.querySelectorAll(".nav-unit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const unit = btn.closest(".nav-unit");
        unit.setAttribute("aria-expanded", unit.getAttribute("aria-expanded") === "true" ? "false" : "true");
      });
    });
    return aside;
  }

  /* ---------------------------------------------------- FOOTER ---------- */
  function buildFooter() {
    const f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML = `
      <div class="container">
        <div class="footer-brand">
          <img src="${url('/assets/img/logo-2551.png')}" alt="Penguin Empire Robotics 2551 logo">
          <div>
            <h3>Penguin Empire Robotics</h3>
            <p>FRC Team 2551 · The programming onboarding academy. Learn Java, then learn to make a robot move.</p>
          </div>
        </div>
        <div class="footer-col">
          <h4>Learn</h4>
          <a href="${url('/syllabus.html')}">Full curriculum</a>
          <a href="${url('/lessons/java/what-is-programming.html')}">Phase 1 · Java &amp; OOP</a>
          <a href="${url('/lessons/frc/moving-a-motor.html')}">Phase 2 · FRC Robot</a>
        </div>
        <div class="footer-col">
          <h4>Reference</h4>
          <a href="https://docs.wpilib.org/" target="_blank" rel="noopener">WPILib Docs ↗</a>
          <a href="https://docs.revrobotics.com/" target="_blank" rel="noopener">REV Robotics ↗</a>
          <a href="https://docs.limelightvision.io/" target="_blank" rel="noopener">Limelight ↗</a>
          <a href="https://pathplanner.dev/" target="_blank" rel="noopener">PathPlanner ↗</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© <span class="u-mono">2551</span> Penguin Empire Robotics · Built for new programmers.</span>
        <span class="u-mono">Java · WPILib · Command-Based</span>
      </div>`;
    return f;
  }

  /* ---------------------------------------------------- READING BAR ----- */
  function initReadingProgress() {
    const header = document.querySelector(".site-header");
    const main = document.getElementById("main");
    if (!header || !main) return;
    const onScroll = () => {
      const top = main.offsetTop;
      const total = main.offsetHeight - window.innerHeight;
      const pct = Math.min(100, Math.max(0, ((window.scrollY - top) / Math.max(1, total)) * 100));
      header.style.setProperty("--read-progress", pct + "%");
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------- CONTINUE STATE -- */
  // A returning student should not be greeted like a stranger. Progress has
  // been tracked in localStorage all along; this is the first thing that reads
  // it on the homepage. Silent for first-time visitors — the hero keeps its
  // original "Start Lesson 1" CTA untouched.
  function initContinue() {
    if ((document.body.dataset.page || "home") !== "home") return;
    const cta = document.querySelector(".hero-cta .btn--primary");
    if (!cta) return;
    const doneCount = Progress.doneCount();
    if (!doneCount) return;

    const next = C.readyList().find((l) => !Progress.isDone(l.id));
    if (next) {
      cta.href = url(next.href);
      cta.textContent = `Continue → ${next.t}`;
    } else {
      cta.href = url("/syllabus.html");
      cta.textContent = "You're all caught up →";
    }

    const strip = document.createElement("div");
    strip.className = "hero-resume";
    strip.innerHTML = `
      <div class="hr-line">
        <span class="hr-label">${next ? `Unit ${next.unitNum} · ${next.unitTitle}` : "Lessons Completed"}</span>
        <span class="hr-count"><b>${doneCount}</b> of ${Progress.total()} lessons</span>
      </div>
      <div class="progress-track"><div class="progress-fill" data-prog-fill></div></div>`;
    cta.closest(".hero-cta").after(strip);
    refreshProgressUI();
  }

  /* ---------------------------------------------------- REDUCED MOTION -- */
  /* The global CSS rule in brand.css zeroes transition/animation durations,
     but it cannot stop a rAF loop or an IntersectionObserver callback — so
     every JS-driven animation checks this first. Read live, not cached, so a
     mid-session OS preference change is respected. */
  const reduceMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.PEreduceMotion = reduceMotion;

  /* ---------------------------------------------------- STATS TICKER ---- */
  // The band under the hero ships as one static row. Only once we know the
  // set is wider than the viewport (i.e. there is actually something to
  // reveal by scrolling it) do we clone it and switch to ticker mode — a
  // marquee that fits on screen with room to spare just jitters for nothing.
  // The clone is aria-hidden so each stat is announced exactly once.
  function initStatTicker() {
    const band = document.querySelector(".statband");
    if (!band) return;
    const track = band.querySelector(".statband-track");
    const set = band.querySelector(".statband-set");
    if (!track || !set) return;

    let clone = null;
    const off = () => {
      band.classList.remove("is-marquee");
      if (clone) { clone.remove(); clone = null; }
    };

    const sync = () => {
      if (reduceMotion()) { off(); return; }
      // Measure in ticker mode: the static row wraps, so its scrollWidth is
      // always the container width and would never look like an overflow.
      // Nothing paints between this class flip and the decision below.
      band.classList.add("is-marquee");
      if (set.scrollWidth <= band.clientWidth) { off(); return; }
      if (!clone) {
        clone = set.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
      // Constant travel speed (~52px/s) whatever the width, so the ticker
      // reads the same on a phone as on a wide desktop.
      band.style.setProperty("--marq-dur", Math.round(set.scrollWidth / 52) + "s");
    };

    sync();
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(sync, 150); }, { passive: true });
  }

  /* ---------------------------------------------------- SCROLL REVEAL --- */
  function countUp(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (!Number.isFinite(target)) return;
    const DUR = 900;
    const t0 = performance.now();
    el.textContent = "0" + suffix;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);        // ease-out cubic, matches --ease-out's feel
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initReveal() {
    const items = Array.from(document.querySelectorAll(".reveal-on-scroll"));
    const stats = Array.from(document.querySelectorAll("[data-count]"));
    if (!items.length && !stats.length) return;

    // Reduced motion, or no observer support: settle everything immediately.
    // Stats keep their server-rendered values — nothing counts, nothing moves.
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);                          // one-shot; never re-hides on scroll up
        if (el.dataset.count !== undefined) { countUp(el); return; }
        // Stagger only inside an explicit [data-stagger] row, where siblings
        // cross the threshold together. Vertical lists reveal one-by-one on
        // their own and would just feel laggy with an added delay.
        const parent = el.parentElement;
        if (parent && parent.dataset.stagger !== undefined) {
          const group = Array.from(parent.children).filter((c) =>
            c.classList.contains("reveal-on-scroll"));
          el.style.transitionDelay = group.indexOf(el) * 60 + "ms";
        }
        el.classList.add("in-view");
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });

    items.forEach((el) => io.observe(el));
    stats.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------- PREV / NEXT ----- */
  function buildPrevNext(currentId) {
    const all = C.allLessons().filter((l) => l.ready);
    const i = all.findIndex((l) => l.id === currentId);
    if (i < 0) return null;
    const prev = all[i - 1], next = all[i + 1];
    const wrap = document.createElement("nav");
    wrap.className = "lesson-nav";
    wrap.setAttribute("aria-label", "Lesson navigation");
    const card = (l, dir) => {
      if (!l) return `<span class="disabled"></span>`;
      const cls = dir === "next" ? "next" : "prev";
      const dis = l.ready ? "" : " disabled";
      const href = l.ready ? ` href="${url(l.href)}"` : "";
      const label = dir === "next" ? "Next →" : "← Previous";
      const title = l.ready ? l.t : l.t + " · locked";
      return `<a class="${cls}${dis}"${href}><span class="ln-dir">${label}</span><span class="ln-title">${title}</span></a>`;
    };
    wrap.innerHTML = card(prev, "prev") + card(next, "next");
    return wrap;
  }

  /* ---------------------------------------------------- ASSEMBLE -------- */
  function refreshProgressUI() {
    document.querySelectorAll("[data-prog-fill]").forEach((e) => (e.style.width = Progress.pct() + "%"));
    document.querySelectorAll("[data-prog-text]").forEach((e) => (e.textContent = Progress.pct() + "%"));
    const cur = document.body.dataset.lesson;
    document.querySelectorAll("[data-lesson-link]").forEach((a) => {
      a.classList.toggle("is-done", Progress.isDone(a.dataset.lessonLink));
    });
    document.querySelectorAll("[data-syl-link]").forEach((a) => {
      a.classList.toggle("is-done", Progress.isDone(a.dataset.sylLink));
    });
  }

  function init() {
    const page = document.body.dataset.page || "home";
    const lessonId = document.body.dataset.lesson || null;
    const main = document.getElementById("main");

    // skip link
    const skip = document.createElement("a");
    skip.className = "skip-link"; skip.href = "#main"; skip.textContent = "Skip to content";
    document.body.prepend(skip);

    document.body.prepend(buildHeader(page));

    if (page === "lesson") {
      document.body.classList.add("layout-doc");
      const shell = document.createElement("div");
      shell.className = "app-shell";
      const scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.addEventListener("click", () => document.body.classList.remove("nav-open"));
      main.parentNode.insertBefore(shell, main);
      shell.appendChild(buildSidebar(lessonId));
      shell.appendChild(main);
      document.body.appendChild(scrim);

      const pn = buildPrevNext(lessonId);
      const inner = main.querySelector(".content-inner") || main;
      if (pn) inner.appendChild(pn);
      initReadingProgress();
    } else {
      document.body.classList.add("layout-page");
    }

    document.body.appendChild(buildFooter());
    Progress.onChange(refreshProgressUI);
    refreshProgressUI();
    initContinue();
    initStatTicker();
    initReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.PEsvg = svg; window.PEicons = I;
})();
