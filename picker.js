/* ============================================================
   The dinner picker on /whatdoicooktoday/.

   Loaded only on that page. `script.js` must come first — it
   exposes window.burstEmoji for the confetti on a logged meal.

   This is the same rule the iOS app uses (see src/suggest.ts in
   menti-ashfaq/whatdoicooktoday): each dish is weighted by
   (days since last cooked + 1)², a dish never cooked counts as 90
   days stale, and a reroll ignores the weighting 40% of the time so
   the suggestion never feels predetermined. Nothing here talks to a
   server; the dish list below is sample data.
   ============================================================ */

(function () {
  "use strict";

  const result = document.querySelector("#result");
  const pickBtn = document.querySelector("#pick-btn");
  if (!result || !pickBtn) return;

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const burst = (chars, count) => {
    if (typeof window.burstEmoji === "function") window.burstEmoji(chars, count);
  };

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

  const subActions = document.querySelector("#sub-actions");
  const shuffleBtn = document.querySelector("#shuffle-btn");
  const cookBtn = document.querySelector("#cook-btn");
  const poolCount = document.querySelector("#pool-count");
  const log = document.querySelector("#cook-log");
  const logList = document.querySelector("#cook-log-list");

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

  document.querySelectorAll(".tag").forEach((btn) => {
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
