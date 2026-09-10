/* ============================================================
   mohammedashfaq.com — no dependencies, no build step.
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
     Theme toggle. Starts from the system preference and flips to
     the opposite, after which the choice is remembered.
     ------------------------------------------------------------ */
  const themeBtn = $("#theme-btn");
  if (themeBtn) {
    const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || (systemDark() ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
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
    if (!Number.isFinite(target) || calm || target === 0) {
      el.textContent = String(target || 0);
      return;
    }
    const started = performance.now();
    const step = (now) => {
      const p = Math.min((now - started) / 900, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
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

    const links = $$(".nav a");
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const sections = Array.from(byId.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

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
      "stay out of the way",
      "work without a login",
      "keep your data at home",
      "make one decision easier",
      "still work offline",
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

  /* ============================================================
     The dinner picker.

     This is the same rule the iOS app uses: each dish is weighted
     by (days since last cooked + 1)², a dish never cooked counts
     as 90 days stale, and a reroll ignores the weighting 40% of the
     time so the suggestion never feels predetermined. Nothing here
     talks to a server.
     ============================================================ */

  const NEVER_COOKED_DAYS = 90;
  const MAX_DAYS = 180;
  const REROLL_RANDOM_CHANCE = 0.4;

  const d = (name, emoji, daysAgo, ...tags) => ({ name, emoji, daysAgo, tags });

  const DISHES = [
    d("Dal & Rice", "🍚", 3, "veg", "quick", "comfort"),
    d("Rajma Chawal", "🫘", 24, "veg", "comfort"),
    d("Chana Masala", "🍛", 11, "veg", "healthy"),
    d("Paneer Butter Masala", "🧈", 46, "veg", "comfort"),
    d("Khichdi", "🥣", 6, "veg", "quick", "comfort", "healthy"),
    d("Aloo Paratha", "🥟", 38, "veg", "comfort"),
    d("Sambar & Idli", "🍥", 52, "veg", "healthy"),
    d("Masala Dosa", "🥞", 71, "veg"),
    d("Vegetable Pulao", "🍚", 19, "veg", "quick"),
    d("Chicken Curry", "🍗", 9, "comfort"),
    d("Butter Chicken", "🍛", 33, "comfort"),
    d("Biryani", "🍲", 58, "comfort"),
    d("Egg Curry", "🥚", 5, "quick"),
    d("Fish Fry", "🐟", 96, "quick", "healthy"),
    d("Pasta Arrabbiata", "🍝", 8, "veg", "quick"),
    d("Spaghetti Aglio e Olio", "🧄", 14, "veg", "quick"),
    d("Margherita Pizza", "🍕", 41, "veg", "comfort"),
    d("Mushroom Risotto", "🍄", 63, "veg", "comfort"),
    d("Lasagne", "🧀", 88, "veg", "comfort"),
    d("Minestrone Soup", "🥕", 27, "veg", "healthy", "quick"),
    d("Pasta Carbonara", "🥓", 16, "quick", "comfort"),
    d("Bolognese", "🍝", 22, "comfort"),
    d("Stir-fried Noodles", "🍜", 4, "veg", "quick"),
    d("Veg Fried Rice", "🍚", 12, "veg", "quick"),
    d("Chilli Paneer", "🌶️", 29, "veg", "quick"),
    d("Hot & Sour Soup", "🥣", 44, "veg", "healthy", "quick"),
    d("Mapo Tofu", "🧊", 76, "veg", "quick"),
    d("Kung Pao Chicken", "🥜", 35, "quick"),
    d("Shakshuka", "🍳", 21, "veg", "quick", "healthy"),
    d("Falafel Wraps", "🥙", 55, "veg", "healthy"),
    d("Grilled Salmon", "🐠", null, "healthy", "quick"),
    d("Tacos", "🌮", null, "quick", "comfort"),
  ];

  DISHES.forEach((dish, i) => {
    dish.id = "d" + i;
    dish.cookedToday = false;
  });

  const stalenessWeight = (dish) => {
    const days = dish.cookedToday ? 0 : dish.daysAgo === null ? NEVER_COOKED_DAYS : dish.daysAgo;
    return Math.pow(Math.min(Math.max(days, 0), MAX_DAYS) + 1, 2);
  };

  const pickWeighted = (pool) => {
    const weights = pool.map(stalenessWeight);
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  };

  const pickUniform = (pool) => pool[Math.min(Math.floor(Math.random() * pool.length), pool.length - 1)];

  const lastCookedLabel = (dish) => {
    if (dish.cookedToday) return "Cooked today";
    const days = dish.daysAgo;
    if (days === null) return "Never cooked";
    if (days === 0) return "Cooked today";
    if (days === 1) return "Cooked yesterday";
    if (days < 30) return "Cooked " + days + " days ago";
    const months = Math.floor(days / 30);
    return "Cooked " + months + (months === 1 ? " month" : " months") + " ago";
  };

  (function initPicker() {
    const result = $("#result");
    const pickBtn = $("#pick-btn");
    if (!result || !pickBtn) return;

    const subActions = $("#sub-actions");
    const shuffleBtn = $("#shuffle-btn");
    const cookBtn = $("#cook-btn");
    const poolCount = $("#pool-count");
    const log = $("#cook-log");
    const logList = $("#cook-log-list");

    const activeTags = new Set();
    let current = null;
    let busy = false;

    const matchesFilters = (dish) => Array.from(activeTags).every((t) => dish.tags.includes(t));
    const eligible = () => DISHES.filter(matchesFilters);

    const updateCount = () => {
      if (!poolCount) return;
      const n = eligible().length;
      poolCount.textContent =
        activeTags.size === 0
          ? n + (n === 1 ? " dish" : " dishes") + " in rotation"
          : n + (n === 1 ? " dish matches" : " dishes match");
    };

    const renderIdle = () => {
      result.innerHTML =
        '<div class="result-empty"><span class="plate">🍽️</span>' +
        "<p>Tap below and I'll decide for you.</p></div>";
      if (subActions) subActions.hidden = true;
    };

    const renderNone = () => {
      result.innerHTML =
        '<p class="dish-none">Nothing matches all of those at once. Drop a filter and try again.</p>';
      if (subActions) subActions.hidden = true;
    };

    const renderDish = (dish) => {
      result.innerHTML = "";

      const card = document.createElement("div");
      card.className = "dish";

      const emoji = document.createElement("div");
      emoji.className = "dish-emoji";
      emoji.textContent = dish.emoji;

      const name = document.createElement("p");
      name.className = "dish-name";
      name.textContent = dish.name;

      const meta = document.createElement("p");
      meta.className = "dish-meta";
      meta.textContent = lastCookedLabel(dish);

      const tags = document.createElement("div");
      tags.className = "dish-tags";
      dish.tags.forEach((t) => {
        const s = document.createElement("span");
        s.textContent = t;
        tags.appendChild(s);
      });

      card.append(emoji, name, meta, tags);
      result.appendChild(card);
    };

    const refreshLog = () => {
      if (!log || !logList) return;
      const cooked = DISHES.filter((x) => x.cookedToday);
      logList.innerHTML = "";
      cooked.forEach((x) => {
        const li = document.createElement("li");
        li.textContent = x.emoji + "  " + x.name;
        logList.appendChild(li);
      });
      log.hidden = cooked.length === 0;
    };

    const suggest = (isReroll) => {
      if (busy) return;

      const pool = eligible();
      if (pool.length === 0) {
        current = null;
        renderNone();
        return;
      }

      // Avoid repeating the dish already on screen, unless it is the only one left.
      const others = current ? pool.filter((dish) => dish.id !== current.id) : pool;
      const from = others.length ? others : pool;

      const choose = () => {
        const goRandom = isReroll && Math.random() < REROLL_RANDOM_CHANCE;
        current = goRandom ? pickUniform(from) : pickWeighted(from);

        renderDish(current);
        if (subActions) subActions.hidden = false;
        if (cookBtn) {
          cookBtn.classList.toggle("is-logged", current.cookedToday);
          cookBtn.textContent = current.cookedToday ? "Logged ✓ · Undo" : "I'm cooking this";
        }
        pickBtn.textContent = "Pick again";
        busy = false;
      };

      if (calm) {
        choose();
        return;
      }

      // A short spin before the answer — deciding should feel like something.
      busy = true;
      result.innerHTML =
        '<div class="result-empty"><span class="plate is-spinning">🍽️</span><p>Deciding…</p></div>';
      setTimeout(choose, 520);
    };

    pickBtn.addEventListener("click", () => suggest(false));
    if (shuffleBtn) shuffleBtn.addEventListener("click", () => suggest(true));

    if (cookBtn) {
      cookBtn.addEventListener("click", () => {
        if (!current) return;

        const logged = !current.cookedToday;
        current.cookedToday = logged;

        cookBtn.classList.toggle("is-logged", logged);
        cookBtn.textContent = logged ? "Logged ✓ · Undo" : "I'm cooking this";
        renderDish(current);
        refreshLog();

        if (logged) burst(["🍜", "🥘", "🍛", "🌮", "🍝"], 14);
      });
    }

    $$(".tag").forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");

      btn.addEventListener("click", () => {
        const tag = btn.dataset.tag;
        const turningOff = activeTags.has(tag);

        if (turningOff) activeTags.delete(tag);
        else activeTags.add(tag);

        btn.classList.toggle("is-on", !turningOff);
        btn.setAttribute("aria-pressed", String(!turningOff));
        updateCount();

        // Keep whatever is on screen consistent with the new filters.
        if (eligible().length === 0) {
          current = null;
          renderNone();
        } else if (current && !matchesFilters(current)) {
          suggest(false);
        } else if (!current) {
          renderIdle();
        }
      });
    });

    updateCount();
  })();

  /* ------------------------------------------------------------
     A small shower of food emoji — when you log a meal, and when
     you poke the portrait.
     ------------------------------------------------------------ */
  function burst(chars, count) {
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
  }

  const portraitBtn = $("#portrait-btn");
  if (portraitBtn) {
    portraitBtn.addEventListener("click", () => {
      portraitBtn.classList.add("is-spun");
      setTimeout(() => portraitBtn.classList.remove("is-spun"), 600);
      burst(["👋", "🍳", "🧑‍🍳", "☕", "🍽️"], 12);
    });
  }
})();
