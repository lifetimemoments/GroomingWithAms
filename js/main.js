/* Grooming With Ams - interactions */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- preloader ---------- */
  const preloader = document.getElementById("preloader");
  const killPreloader = () => preloader && preloader.classList.add("is-done");
  window.addEventListener("load", () => setTimeout(killPreloader, 500));
  setTimeout(killPreloader, 2600); // safety net


  /* ---------- nav ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 30);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------- reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- parallax ---------- */
  if (!prefersReduced) {
    const layers = [...document.querySelectorAll("[data-parallax]")];
    const parallax = () => {
      const vh = innerHeight;
      layers.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;
        el.style.translate = `0 ${(-center * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
      });
    };
    parallax();
    addEventListener("scroll", () => requestAnimationFrame(parallax), { passive: true });
  }

  /* ---------- magnetic buttons ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * 0.22}px, ${my * 0.28}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        counterObserver.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        const dur = 1400;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- review stars ---------- */
  document.querySelectorAll(".review").forEach((r) => {
    const stars = document.createElement("div");
    stars.className = "review__stars";
    stars.setAttribute("aria-label", "5 stars");
    stars.innerHTML = "<svg><use href='#star'/></svg>".repeat(5);
    r.insertBefore(stars, r.firstChild);
  });

  /* ---------- menu hover preview ---------- */
  const preview = document.getElementById("menuPreview");
  const previewImg = preview.querySelector("img");
  if (isFinePointer && !prefersReduced) {
    let px = 0, py = 0, tx = 0, ty = 0, rafId = null;
    const followPreview = () => {
      px += (tx - px) * 0.14;
      py += (ty - py) * 0.14;
      const w = preview.offsetWidth, h = preview.offsetHeight;
      const left = Math.min(Math.max(px + 26, 12), innerWidth - w - 12);
      const top = Math.min(Math.max(py - h / 2, 12), innerHeight - h - 12);
      preview.style.translate = `${left}px ${top}px`;
      rafId = requestAnimationFrame(followPreview);
    };
    document.querySelectorAll(".menu__item[data-img]").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        const src = item.dataset.img;
        if (previewImg.getAttribute("src") !== src) previewImg.src = src;
        preview.classList.add("is-visible");
        if (!rafId) rafId = requestAnimationFrame(followPreview);
      });
      item.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
      item.addEventListener("mouseleave", () => preview.classList.remove("is-visible"));
    });
    document.querySelector(".menu").addEventListener("mouseleave", () => {
      preview.classList.remove("is-visible");
    });
  }

  /* ---------- sticky mobile book ---------- */
  const stickyBook = document.getElementById("stickyBook");
  const toggleSticky = () => {
    const past = scrollY > innerHeight * 0.85;
    const footerTop = document.querySelector(".footer").getBoundingClientRect().top;
    stickyBook.classList.toggle("is-shown", past && footerTop > innerHeight * 0.6);
  };
  toggleSticky();
  addEventListener("scroll", toggleSticky, { passive: true });

  /* ---------- nav spy ---------- */
  const spyLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
  const spyMap = new Map(spyLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const link = spyMap.get(e.target.id);
        if (link && e.isIntersecting) {
          spyLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spyObserver.observe(s));

  /* ---------- service filters ---------- */
  const chips = document.querySelectorAll(".chip");
  const items = document.querySelectorAll(".menu__item");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      items.forEach((item) => {
        const show = f === "all" || item.dataset.cat === f;
        item.classList.toggle("is-hidden", !show);
        if (show) {
          item.style.opacity = 0;
          requestAnimationFrame(() => {
            item.style.transition = "opacity .45s ease";
            item.style.opacity = 1;
          });
        }
      });
    });
  });

  /* ---------- enquiry form → mailto ---------- */
  const form = document.getElementById("enquiryForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const name = (d.get("name") || "").toString().trim();
    const dog = (d.get("dog") || "").toString().trim();
    const contact = (d.get("contact") || "").toString().trim();
    const message = (d.get("message") || "").toString().trim();

    const subject = `Grooming enquiry from ${name}${dog ? ` & ${dog}` : ""}`;
    const body = [
      `Hi Amy,`,
      ``,
      message || "I'd like to ask about a groom.",
      ``,
      `Name: ${name}`,
      dog ? `Dog: ${dog}` : null,
      `Best contact: ${contact}`,
      ``,
      `Sent via groomingwithams.co.uk`,
    ]
      .filter(Boolean)
      .join("\n");

    location.href = `mailto:groomingwithams@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
