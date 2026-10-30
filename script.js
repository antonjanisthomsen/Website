// ===== Language switch (EN / DE) =====
function getInitialLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'de') return saved;
  } catch (e) {}
  return 'en';
}

let currentLang = getInitialLang();
const t = key => (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;

function applyLang(lang, persist) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.title = t('meta.title');
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', t('meta.desc'));
  const mail = document.getElementById('mailBtn');
  if (mail) mail.href = 'mailto:antonjanis.thomsen@gmail.com?subject=' + encodeURIComponent(t('contact.subject'));
  document.querySelectorAll('.lang-switch button').forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  if (persist) {
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  document.dispatchEvent(new CustomEvent('langchange'));
}

document.querySelectorAll('.lang-switch button').forEach(b =>
  b.addEventListener('click', () => { if (b.dataset.lang !== currentLang) applyLang(b.dataset.lang, true); })
);
applyLang(currentLang, false);

// ===== Navbar background on scroll =====
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile navigation =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

// ===== Reveal on scroll (robust, no IntersectionObserver needed) =====
function inViewport(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.92 && r.bottom > 0;
}

function reveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    if (inViewport(el)) el.classList.add('visible');
  });
  document.querySelectorAll('.bar-fill:not(.done)').forEach(el => {
    if (inViewport(el)) {
      el.classList.add('done');
      el.style.width = el.dataset.width + '%';
    }
  });
}

window.addEventListener('scroll', reveal, { passive: true });
window.addEventListener('resize', reveal, { passive: true });
window.addEventListener('load', reveal);
document.addEventListener('visibilitychange', reveal);
reveal();

// ===== Imprint / Privacy modals =====
document.querySelectorAll('[data-modal]').forEach(btn =>
  btn.addEventListener('click', () => document.getElementById(btn.dataset.modal).showModal())
);

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
});

// ===== Dot navigation with scrollspy (scroll + getBoundingClientRect, no IntersectionObserver) =====
(function () {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (sections.length < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'dotnav';
  const list = document.createElement('ul');

  // Strip the leading "01 —" from the tag; numbering follows the dot order instead
  const nameOf = section => {
    const tag = section.querySelector('.tag');
    if (section.id === 'hero') return t('dot.index');
    return tag ? tag.textContent.replace(/^\s*\d+\s*[—–-]\s*/, '').trim() : section.id;
  };

  const dots = sections.map((section, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + section.id;
    a.className = 'dotnav-link';

    const label = document.createElement('span');
    label.className = 'dotnav-label';
    const dot = document.createElement('span');
    dot.className = 'dotnav-dot';
    a.append(label, dot);

    a.addEventListener('click', e => {
      e.preventDefault();
      section.scrollIntoView(); // honours scroll-padding-top and CSS scroll-behavior
    });

    li.appendChild(a);
    list.appendChild(li);
    return a;
  });

  nav.appendChild(list);
  document.body.appendChild(nav);

  // (Re)build labels from the current .tag texts; runs now and after every language change
  function updateLabels() {
    nav.setAttribute('aria-label', t('dot.aria'));
    dots.forEach((a, i) => {
      const name = nameOf(sections[i]);
      a.setAttribute('aria-label', name);
      a.querySelector('.dotnav-label').textContent = String(i + 1).padStart(2, '0') + ' · ' + name;
    });
  }
  updateLabels();
  document.addEventListener('langchange', updateLabels);

  let current = -1;
  function spy() {
    const line = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + window.innerHeight * 0.25;
    let idx = 0;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= line) idx = i;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) idx = sections.length - 1;
    if (idx === current) return;
    current = idx;
    dots.forEach((a, i) => {
      a.classList.toggle('active', i === idx);
      if (i === idx) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy, { passive: true });
  window.addEventListener('load', spy);
  spy();
})();

// ===== Copy email button =====
(function () {
  const btn = document.getElementById('copyEmail');
  if (!btn) return;
  const out = btn.querySelector('.cta-copied');
  let timer;

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  btn.addEventListener('click', async () => {
    const text = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      fallbackCopy(text);
    }
    out.textContent = t('contact.copied');
    btn.classList.add('copied');
    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('copied');
      out.textContent = '';
    }, 2000);
  });
})();

// ===== Hero logo: draws itself, and again whenever you come back to the top =====
(function () {
  const v = document.getElementById('heroLogo');
  if (!v) return;

  // Swap the video for the static finished logo (works on every device)
  let swapped = false;
  const showStatic = () => {
    if (swapped) return;
    swapped = true;
    const img = document.createElement('img');
    img.src = 'logo-white.png';
    img.alt = 'AJT logo';
    img.className = 'hero-logo';
    v.replaceWith(img);
  };

  // Reduced motion: skip the animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showStatic();
    return;
  }

  // Video can't load or autoplay is blocked (e.g. iPhone low-power mode)
  v.addEventListener('error', showStatic, true);
  const p = v.play();
  if (p && p.catch) p.catch(showStatic);

  // Replay the drawing after the logo was scrolled out of view and comes back
  let away = false;
  const replay = () => {
    if (swapped) return;
    const r = v.getBoundingClientRect();
    if (r.bottom <= 0) {
      away = true;
    } else if (away && r.bottom > r.height * 0.5) {
      away = false;
      v.currentTime = 0;
      const q = v.play();
      if (q && q.catch) q.catch(showStatic);
    }
  };
  window.addEventListener('scroll', replay, { passive: true });
  window.addEventListener('resize', replay, { passive: true });
})();

// ===== Console greeting =====
console.log(
  '%cHi there 👋%c\nCurious how this was built? Let\'s talk.\n%cantonthomsen.de · antonjanis.thomsen@gmail.com',
  'font: 700 22px/1.6 "Space Grotesk", system-ui, sans-serif; color: #fff; background: #0a0a0a; padding: 6px 14px 0;',
  'font: 400 13px/1.8 Inter, system-ui, sans-serif; color: #d4d4d4; background: #0a0a0a; padding: 0 14px;',
  'font: 400 12px/1.8 Inter, system-ui, sans-serif; color: #8a8a8a; background: #0a0a0a; padding: 0 14px 6px;'
);
