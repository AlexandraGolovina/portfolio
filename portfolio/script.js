/* =========================================================
   Портфолио — Головина Александра
   Vanilla JS, без зависимостей
   ========================================================= */
(() => {
  'use strict';

  /* ---------- 0. Утилиты ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. Тема (Dark / Light)
     ========================================================= */
  const themeToggle = $('#themeToggle');
  const root = document.documentElement;
  const STORAGE_KEY = 'ag-theme';

  const getStoredTheme = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };
  const storeTheme = (v) => {
    try { localStorage.setItem(STORAGE_KEY, v); } catch { /* noop */ }
  };

  const applyTheme = (theme, announce = false) => {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
    );
    if (announce) storeTheme(theme);
  };

  // Инициализация: сохранённая тема → системная → светлая
  const stored = getStoredTheme();
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (systemDark ? 'dark' : 'light'));

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  /* =========================================================
     2. Прогресс-бар чтения
     ========================================================= */
  const scrollBar = $('#scrollBar');
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    scrollBar.style.width = p + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  /* =========================================================
     3. Хедер: скролл-стайл + активная ссылка
     ========================================================= */
  const header = $('#header');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');

  const onScrollHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        navLinks.forEach((l) => {
          l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => activeObserver.observe(s));

  /* =========================================================
     4. Бургер-меню
     ========================================================= */
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');

  const closeMenu = () => {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    document.body.style.overflow = '';
    setTimeout(() => { mobileMenu.hidden = true; }, 320);
  };

  const openMenu = () => {
    mobileMenu.hidden = false;
    requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    document.body.style.overflow = 'hidden';
  };

  burger.addEventListener('click', () => {
    burger.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  $$('.mobile-menu__link').forEach((link) =>
    link.addEventListener('click', closeMenu)
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.classList.contains('is-open')) closeMenu();
  });

  /* =========================================================
     5. Reveal по скроллу (Intersection Observer)
     ========================================================= */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  // Лёгкая задержка для «каскада» в одной сетке
  const revealEls = $$('.reveal');
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    revealObserver.observe(el);
  });

  // Отдельно — скиллы (анимируем ширину полосок)
  const skillsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          skillsObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  $$('.skills__item').forEach((el) => skillsObserver.observe(el));

  /* =========================================================
     6. Кнопка «Наверх»
     ========================================================= */
  const toTop = $('#toTop');
  const onScrollTop = () => {
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScrollTop, { passive: true });
  onScrollTop();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* =========================================================
     7. Кастомный курсор (только desktop)
     ========================================================= */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover && !prefersReducedMotion) {
    const cursor = $('#cursor');
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    const HOVER_SELECTOR = 'a, button, .project, .tag, .tags li, input, textarea, .contact__link';

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    // Плавное «догоняние» кольца
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tick);
    };
    tick();

    // Hover-состояние
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(HOVER_SELECTOR)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(HOVER_SELECTOR)) cursor.classList.remove('is-hover');
    });

    // Скрываем курсор при уходе со страницы
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });
  }

  /* =========================================================
     8. Модальные окна проектов
     ========================================================= */

  /**
   * Данные проектов.
   * Каждое изображение: { src, alt, w, h, layout }
   *   layout:
   *     'desktop'  — широкая картинка (десктопный мокап)
   *     'mobile'   — узкая вертикальная (мобильный экран)
   *     'square'   — квадратная
   *     'full'     — на всю ширину модалки
   *     'longread' — вертикальная колонка по центру (секции лонгрида)
   */
  const PROJECTS = {
    'green-shelf-app': {
      tag: 'Web-приложение',
      title: 'Green Shelf',
      desc: 'Веб-приложение для осознанного потребления косметических продуктов. Спроектировала интерфейс в двух темах, проработала светлую и тёмную версии для десктопа и мобильных устройств.',
      images: [
        { src: 'images/img1.jpg', alt: 'Светлая версия — десктоп',   w: 1057, h: 753, layout: 'desktop' },
        { src: 'images/img2.jpg', alt: 'Тёмная версия — десктоп',    w: 1057, h: 753, layout: 'desktop' },
        { src: 'images/img3.jpg', alt: 'Светлая версия — мобильный', w: 348,  h: 753, layout: 'mobile'  },
        { src: 'images/img4.jpg', alt: 'Тёмная версия — мобильный',  w: 348,  h: 753, layout: 'mobile'  },
      ],
    },

    'green-shelf-longread': {
      tag: 'Промосайт · Лонгрид',
      title: 'Green Shelf — промо',
      desc: 'Десктопный лонгрид, раскрывающий идею приложения. Четыре экрана складываются в единую вертикальную историю о бережном отношении к косметике.',
      images: [
        { src: 'images/img5.jpg', alt: 'Секция 1', w: 427, h: 678, layout: 'longread' },
        { src: 'images/img6.jpg', alt: 'Секция 2', w: 427, h: 678, layout: 'longread' },
        { src: 'images/img7.jpg', alt: 'Секция 3', w: 427, h: 678, layout: 'longread' },
        { src: 'images/img8.jpg', alt: 'Секция 4', w: 427, h: 469, layout: 'longread' },
      ],
    },

    'animals': {
      tag: 'Иллюстрация · Прикладной дизайн',
      title: 'Стилизация животных',
      desc: 'Учебный проект по дисциплине «Прикладной дизайн». Серия авторских иллюстраций с поиском выразительной формы и характера.',
      images: [
        { src: 'images/img9.jpg',  alt: 'Стилизация животных — работа 1', w: 1065, h: 708, layout: 'full'   },
        { src: 'images/img10.jpg', alt: 'Стилизация животных — работа 2', w: 725,  h: 708, layout: 'square' },
      ],
    },

    'personal': {
      tag: 'Личное творчество',
      title: 'Личное творчество',
      desc: 'Свободные работы и эксперименты — то, что рождается вне учебных заданий и рамок.',
      images: [
        { src: 'images/img11.jpg', alt: 'Личная работа 1', w: 600, h: 848, layout: 'full'   },
        { src: 'images/img12.jpg', alt: 'Личная работа 2', w: 568, h: 568, layout: 'square' },
        { src: 'images/img13.jpg', alt: 'Личная работа 3', w: 568, h: 568, layout: 'square' },
      ],
    },
  };

  const modal = $('#modal');
  const modalTag = $('#modalTag');
  const modalTitle = $('#modalTitle');
  const modalDesc = $('#modalDesc');
  const modalGallery = $('#modalGallery');

  let lastFocused = null;

  const openModal = (key) => {
    const data = PROJECTS[key];
    if (!data) return;

    lastFocused = document.activeElement;

    modalTag.textContent = data.tag;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;

    // Очищаем галерею
    modalGallery.innerHTML = '';

    // Собираем слайды
    data.images.forEach((img) => {
      const figure = document.createElement('figure');
      figure.className = `is-${img.layout || 'full'}`;

      const el = document.createElement('img');
      el.src = img.src;
      el.alt = img.alt;
      el.width = img.w;
      el.height = img.h;
      el.loading = 'lazy';
      el.decoding = 'async';

      figure.appendChild(el);

      // Подпись показываем, если в проекте несколько разных изображений
      if (data.images.length > 1) {
        const caption = document.createElement('figcaption');
        caption.textContent = img.alt;
        figure.appendChild(caption);
      }

      modalGallery.appendChild(figure);
    });

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));

    // Фокус на кнопку закрытия — для a11y
    setTimeout(() => $('.modal__close', modal)?.focus(), 60);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.hidden = true;
      if (lastFocused) lastFocused.focus();
    }, 320);
  };

  // Открытие: клик или Enter/Space по карточке
  $$('.project').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.project));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.project);
      }
    });
  });

  // Закрытие: клик по оверлею или кнопке, Escape
  modal.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Простой focus-trap внутри модалки
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || modal.hidden) return;
    const focusables = $$(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      modal
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  /* =========================================================
     9. Форма обратной связи (визуальная)
     ========================================================= */
  const form = $('#contactForm');
  const note = $('#formNote');

  const setError = (field, msg) => {
    const wrap = field.closest('.form__field');
    const errEl = wrap?.querySelector('.form__error');
    if (!wrap || !errEl) return;
    wrap.classList.toggle('has-error', Boolean(msg));
    errEl.textContent = msg || '';
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  const validators = {
    name: (v) => {
      if (!v.trim()) return 'Напиши, пожалуйста, как к тебе обращаться';
      if (v.trim().length < 2) return 'Слишком коротко — минимум 2 символа';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'Email нужен, чтобы я могла ответить';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Похоже, в email опечатка';
      return '';
    },
    message: (v) => {
      if (!v.trim()) return 'Расскажи пару слов о задаче';
      if (v.trim().length < 10) return 'Чуть подробнее — минимум 10 символов';
      return '';
    },
  };

  // Валидация при вводе
  $$('input, textarea', form).forEach((field) => {
    field.addEventListener('blur', () => {
      const fn = validators[field.name];
      if (fn) setError(field, fn(field.value));
    });
    field.addEventListener('input', () => {
      const wrap = field.closest('.form__field');
      if (wrap?.classList.contains('has-error')) {
        const fn = validators[field.name];
        if (fn) setError(field, fn(field.value));
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasErrors = false;
    $$('input, textarea', form).forEach((field) => {
      const fn = validators[field.name];
      if (!fn) return;
      const msg = fn(field.value);
      setError(field, msg);
      if (msg) hasErrors = true;
    });

    if (hasErrors) {
      note.textContent = 'Проверь выделенные поля — там что-то не так.';
      return;
    }

    // =========================================================
    // TODO: здесь подключить реальную отправку.
    // Варианты:
    //   1) Formspree:  action="https://formspree.io/f/XXXX"  method="POST"
    //   2) EmailJS:    подключить SDK и вызвать emailjs.send(...)
    //   3) Telegram-бот: fetch(`https://api.telegram.org/bot<TOKEN>/sendMessage`, ...)
    // Пока — просто визуальный отклик.
    // =========================================================

    const btn = form.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn__text');
    const original = btnText.textContent;

    btn.disabled = true;
    btnText.textContent = 'Отправлено ✓';
    note.textContent = 'Спасибо! Я свяжусь с тобой в течение 24 часов.';
    form.reset();

    setTimeout(() => {
      btn.disabled = false;
      btnText.textContent = original;
    }, 3200);
  });

  /* =========================================================
     10. Год в футере
     ========================================================= */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     11. Плавный скролл для внутренних ссылок (fallback)
     ========================================================= */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      ) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();