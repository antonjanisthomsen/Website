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

// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Skill bars animate when visible =====
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      fill.style.width = fill.dataset.width + '%';
      barObserver.unobserve(fill);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.bar-fill').forEach(el => barObserver.observe(el));

// ===== Imprint / Privacy modals =====
document.querySelectorAll('[data-modal]').forEach(btn =>
  btn.addEventListener('click', () => document.getElementById(btn.dataset.modal).showModal())
);

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
  // close when clicking the backdrop
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
});
