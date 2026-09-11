/* ============================================================
   Shared site chrome — loaded on every page.
   No dependencies, no build step.
   ============================================================ */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     Footer year
     ------------------------------------------------------------ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------
     Theme toggle. Light is the default, including for visitors
     whose system is set to dark; dark is opt-in and remembered.
     ------------------------------------------------------------ */
  const themeBtn = $("#theme-btn");
  if (themeBtn) {
    const meta = $("#theme-color");
    const BAR = { light: "#F5F8FC", dark: "#0A0F1A" };

    const paintBrowserBar = (theme) => {
      if (meta) meta.setAttribute("content", BAR[theme] || BAR.light);
    };

    paintBrowserBar(document.documentElement.dataset.theme || "light");

    themeBtn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      paintBrowserBar(next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* private browsing — the choice just won't persist */
      }
    });
  }

  /* ------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------ */
  const navBtn = $("#nav-btn");
  const nav = $("#nav");
  if (navBtn && nav) {
    const setNav = (open) => {
      nav.classList.toggle("is-open", open);
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
      navBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    navBtn.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") setNav(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* ------------------------------------------------------------
     Scroll reveal, stat count-up, and the active nav link
     ------------------------------------------------------------ */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (!Number.isFinite(target) || calm || target === 0) {
      el.textContent = String(target || 0) + suffix;
      return;
    }
    const started = performance.now();
    const step = (now) => {
      const p = Math.min((now - started) / 900, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          entry.target.querySelectorAll("[data-count]").forEach(countUp);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    $$(".reveal").forEach((el) => io.observe(el));

    // Highlight the nav link for whichever section is in view. Links that
    // point at another page (for example "/#work") resolve to nothing here
    // and are simply skipped.
    const links = $$(".nav a");
    const byId = new Map(
      links
        .map((a) => [(a.getAttribute("href") || "").split("#")[1], a])
        .filter(([id]) => id)
    );
    const sections = Array.from(byId.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((a) => a.classList.remove("is-active"));
            const link = byId.get(entry.target.id);
            if (link) link.classList.add("is-active");
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach((s) => spy.observe(s));
    }
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  }

  /* ------------------------------------------------------------
     Rotating words in the headline. Every phrase is rendered up
     front and stacked in one grid cell, so the headline settles at
     the width of the longest phrase instead of reflowing on each
     swap.
     ------------------------------------------------------------ */
  const swap = $("#swap");
  if (swap && !calm) {
    const phrases = [
      "monitor your website",
      "are scalable",
      "are performant",
      "page me before users notice",
    ];

    swap.innerHTML = "";
    const words = phrases.map((text, i) => {
      const span = document.createElement("span");
      span.className = "swap-word" + (i === 0 ? " is-on" : "");
      span.textContent = text;
      swap.appendChild(span);
      return span;
    });

    let i = 0;
    setInterval(() => {
      const from = words[i];
      i = (i + 1) % words.length;
      const to = words[i];

      from.classList.remove("is-on");
      from.classList.add("is-out");
      to.classList.remove("is-out");
      to.classList.add("is-on");

      setTimeout(() => from.classList.remove("is-out"), 600);
    }, 3200);
  }

  /* ------------------------------------------------------------
     A small shower of emoji. Used by the portrait here, and by the
     dinner picker on /whatdoicooktoday/ — hence the global.
     ------------------------------------------------------------ */
  window.burstEmoji = function (chars, count) {
    const stage = $("#confetti");
    if (!stage || calm) return;

    for (let i = 0; i < count; i++) {
      const bit = document.createElement("i");
      bit.textContent = chars[Math.floor(Math.random() * chars.length)];
      bit.style.left = Math.random() * 100 + "vw";
      bit.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
      bit.style.animationDelay = Math.random() * 0.35 + "s";
      bit.style.setProperty(
        "--spin",
        (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 540) + "deg"
      );
      stage.appendChild(bit);
      setTimeout(() => bit.remove(), 4200);
    }
  };

  const portraitBtn = $("#portrait-btn");
  const portraitFlip = $("#portrait-flip");

  if (portraitBtn) {
    portraitBtn.addEventListener("click", () => {
      window.burstEmoji(["👋", "🍳", "🧑‍🍳", "☕", "🍽️"], 12);
    });
  }

  if (portraitFlip) {
    // Angle only ever increases, so the coin always keeps spinning the
    // same way. An odd number of half turns leaves "click me" facing out.
    let angle = 0;
    const hovered = () => portraitBtn && portraitBtn.matches(":hover");
    const showingBack = () => Math.round(angle / 180) % 2 !== 0;

    const spinTo = (halfTurns, ms) => {
      angle += halfTurns * 180;
      portraitFlip.style.transitionDuration = ms + "ms";
      portraitFlip.style.transform = "rotateY(" + angle + "deg)";
    };

    // A coin toss: three half turns that settle on "click me", a beat to
    // read it, then one turn back to the photo.
    const coinToss = () => {
      spinTo(3, 1000);
      setTimeout(() => {
        if (!hovered()) spinTo(1, 550);
      }, 2000);
    };

    portraitBtn.addEventListener("mouseenter", () => {
      if (!showingBack()) spinTo(1, 450);
    });
    portraitBtn.addEventListener("mouseleave", () => {
      if (showingBack()) spinTo(1, 450);
    });

    if (!calm) {
      setTimeout(coinToss, 1200);
      setInterval(() => {
        if (!hovered()) coinToss();
      }, 15000);
    }
  }
})();
