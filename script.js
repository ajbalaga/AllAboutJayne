"use strict";

// Mobile nav
const $menuToggle = document.getElementById('menu-toggle');
const $navMenu = document.getElementById('nav-menu');
if ($menuToggle && $navMenu) {
    $menuToggle.addEventListener('click', () => {
        const open = $navMenu.classList.toggle('open');
        $menuToggle.setAttribute('aria-expanded', String(open));
    });
    $navMenu.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.tagName === 'A') {
            $navMenu.classList.remove('open');
            $menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Scroll reveal
const revealables = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        }
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });
    revealables.forEach(el => io.observe(el));
} 
else {
    revealables.forEach(el => el.classList.add('is-visible'));
}

// Disneyland tracker with persistence
const PARKS_KEY = 'ajb-parks';

const parks = [...document.querySelectorAll('input.park')];
const doneEl = document.getElementById('parks-done');
const totalEl = document.getElementById('parks-total');
const barEl = document.querySelector('.tracker-bar');
const progressEl = document.querySelector('.tracker-progress');

const load = () => {
    try {
        return JSON.parse(localStorage.getItem(PARKS_KEY) || '{}');
    } catch {
        return {};
    }
};

const save = (state) => {
    localStorage.setItem(PARKS_KEY, JSON.stringify(state));
};

const syncUI = () => {
    const state = load();
    let count = 0;

    for (const cb of parks) {
        // Only override if storage has this key
        if (state.hasOwnProperty(cb.dataset.key)) {
            cb.checked = !!state[cb.dataset.key];
        }
        if (cb.checked) count++;
    }

    const total = parks.length;
    doneEl.textContent = count;
    totalEl.textContent = total;

    const pct = total ? Math.round((count / total) * 100) : 0;
    barEl.style.width = pct + '%';
    progressEl.setAttribute('aria-valuenow', count);
};

const init = () => {
    syncUI();

    for (const cb of parks) {
        cb.addEventListener('change', () => {
            const state = load();
            state[cb.dataset.key] = cb.checked;
            save(state);
            syncUI();
        });
    }
};

if (parks.length) init();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", function() {

    const tokyoSea = document.querySelector('input[data-key="tokyo2"]');
    const hongKong = document.querySelector('input[data-key="hongkong"]');

    if (tokyoSea) tokyoSea.checked = true;
    if (hongKong) hongKong.checked = true;

});

//IMAGE LIGHTBOX (click to enlarge)
(() => {
    const SELECTOR = '.gallery-grid img, .gal img';
    const imgs = document.querySelectorAll(SELECTOR);
    if (!imgs.length) return;

    let lb, lbImg, lbClose;
    const ensure = () => {
        if (lb) return;
        lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.innerHTML = `
      <button class="lightbox__close" aria-label="Close">✕</button>
      <img class="lightbox__img" alt="" />
    `;
        document.body.appendChild(lb);
        lbImg = lb.querySelector('.lightbox__img');
        lbClose = lb.querySelector('.lightbox__close');

        const close = () => {
            lb.classList.remove('open');
            document.body.style.overflow = '';
        };

        lb.addEventListener('click', (e) => {
            if (e.target === lb) close();
        });
        lbClose.addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lb.classList.contains('open')) close();
        });
    };

    const open = (src, alt = '') => {
        ensure();
        lbImg.src = src;
        lbImg.alt = alt;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        lbClose.focus();
    };

    imgs.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.setAttribute('tabindex', '0');
        img.addEventListener('click', () => open(img.src, img.alt));
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(img.src, img.alt);
            }
        });
    });
})();

//Fun Fact Image - It moves to the next fun fact, Shows the fact (with caption) - Changes emoji per click
(() => {
    // Pink gradient fallback (SVG data URI)
    const FALLBACK =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='#ffd3ec'/>
            <stop offset='1' stop-color='#ff9acb'/>
          </linearGradient>
        </defs>
        <rect width='1200' height='800' fill='url(#g)'/>
      </svg>`
        );

    // Fun Facts Data (IN ORDER)
    const funFacts = [{
            text: "“Cookie owns way too many pink accessories… and yes, he’s a boy. 🐶💖  ",
            img: "images/jane-cookie.jpg",
            alt: "Cookie wearing a pink scarf"
        },
        {
            text: "I was honored with an award during graduation 💅",
            img: "images/uni.jpg",
            alt: "Graduation cap with colors"
        },
        {
            text: "Pageants + programming coexist 👑",
            img: "images/pageant.jpg",
            alt: "Runway shoes beside a laptop"
        },
        {
            text: "Got engaged in Japan 💍✨ — it felt like a K‑drama scene (I cried) 🥹 ",
            img: "images/engaged.jpg",
            alt: "Engagement image"
        },
        {
            text: "Current favorite game: Palworld 🦙🍓💞 ",
            img: "images/palworld.jpg",
            alt: "palworld image"
        }, {
            text: "Addicted customizing my PC 🖥️",
            img: "images/PC.jpg",
            alt: "PC image"
        },
    ];

    // Preload images
    funFacts.forEach(f => {
        const i = new Image();
        i.src = f.img;
    });

    // Elements
    const $btn = document.getElementById("btn-fact");
    const $img = document.getElementById("fact-img");
    const $cap = document.getElementById("fact-caption");
    const $box = document.getElementById("fact-box");
    const $media = document.querySelector("#funFact .fact-media");
    const $stage = document.querySelector("#funFact .confetti-stage");
    const $emoji = document.querySelector("#btn-fact .emoji");

    // Emoji choices - fun fact button
    const emojis = ["✨", "💖", "🌸", "🎀", "⚡", "🦄", "⭐", "💫"];
    const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];

    // Index moves forward sequentially (NOT random)
    let lastIdx = 0;
 
    // Show a Fun Fact
    function showFact(idx, {
        showText = true
    } = {}) {
        const fact = funFacts[idx];

        $media.classList.add("loading");
        $img.classList.remove("show");

        const nextSrc = fact.img || FALLBACK;
        const nextAlt = fact.alt || "Fun fact image";

        const loader = new Image();
        loader.onload = () => {
            $img.src = nextSrc;
            $img.alt = nextAlt;

            // caption set
            $cap.textContent = fact.text || "";

            requestAnimationFrame(() => {
                $img.classList.add("show");
                $media.classList.remove("loading");
            });
        };

        loader.onerror = () => {
            $img.src = FALLBACK;
            $img.alt = "Pink gradient placeholder";
            $cap.textContent = fact.text || "";
            requestAnimationFrame(() => {
                $img.classList.add("show");
                $media.classList.remove("loading");
            });
        };

        loader.src = nextSrc;

        // Caption animation
        if (showText && fact.text) {
            $box.classList.remove("visible");
            void $box.offsetWidth; // restart animation
            $box.textContent = fact.text;
            $box.classList.add("visible");
        }
    }

    // Show first image (no text)
    if ($img && $media) {
        showFact(lastIdx, {
            showText: false
        });
    }

    // Hover emoji
    if ($btn) {
        // CLICK: sequential fun fact
        $btn.addEventListener("click", () => {
            // next index in order
            lastIdx = (lastIdx + 1) % funFacts.length;
            const idx = lastIdx;

            showFact(idx, {
                showText: true
            });

            // Random emoji for button
            if ($emoji) $emoji.textContent = randomItem(emojis);
            btn.classList.remove('rippling');
            void btn.offsetWidth; // reflow to retrigger
            btn.classList.add('rippling');
        });
    }
})();

//Fun Fact Image -  Load image- Animate image-Make fun facts switch smoothly-Enable sequential navigation
function showFact(idx, { showText = true } = {}) {
    const fact = funFacts[idx];
    if (!$img || !$media) return;

    // Loading state
    $media.classList.add("loading");

    $img.classList.remove("show");
    $img.style.opacity = "0";
    $img.style.transform = "translateY(25px) scale(.96)";
    $img.style.filter = "blur(10px) saturate(1.1)";

    const nextSrc = fact?.img || FALLBACK;
    const nextAlt = fact?.alt || "Fun fact image";

    const loader = new Image();

    loader.onload = () => {
        $img.src = nextSrc;
        $img.alt = nextAlt;
        $cap.textContent = fact?.text || "";
    };

    loader.onerror = () => {
        $img.src = FALLBACK;
        $img.alt = "Pink placeholder";
        $cap.textContent = fact?.text || "";        
    };

    loader.src = nextSrc;

    // Caption slide-up animation
    if (showText && fact?.text) {
        $box.classList.remove("visible");
        void $box.offsetWidth;
        $box.textContent = fact.text;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                $box.classList.add("visible");
            });
        });
    } else {
        $box.classList.remove("visible");
    }
}

//music
const audio = document.getElementById("bg-music");
const toggle = document.getElementById("music-toggle");

toggle.addEventListener("click", async () => {
  try {
    if (audio.paused) {
      await audio.play();
      toggle.textContent = "⏸️ Pause";
    } else {
      audio.pause();
      toggle.textContent = "▶️ Play";
    }
  } catch (err) {
    console.log("Playback failed:", err);
  }
});