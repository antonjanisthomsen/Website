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
