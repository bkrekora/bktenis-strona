// ============================================================
// Nabór — ostatni weekend sierpnia + pierwsze dwa weekendy
// września, wyliczane automatycznie z kalendarza (nic nie trzeba
// co roku ręcznie poprawiać). W te dni wstęga sezonowa dodatkowo
// podkreśla, że trwa nabór.
// ============================================================
const MONTHS_GEN = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia'];

function lastWeekendOfMonth(year, month /* 1-12 */) {
  const d = new Date(year, month, 0); // ostatni dzień miesiąca
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1); // cofnij do niedzieli
  const sunday = new Date(d);
  const saturday = new Date(d);
  saturday.setDate(saturday.getDate() - 1);
  return [saturday, sunday];
}

function firstWeekendsOfMonth(year, month /* 1-12 */, count) {
  const d = new Date(year, month - 1, 1);
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1); // pierwsza sobota
  const weekends = [];
  for (let i = 0; i < count; i++) {
    const saturday = new Date(d);
    const sunday = new Date(d);
    sunday.setDate(sunday.getDate() + 1);
    weekends.push([saturday, sunday]);
    d.setDate(d.getDate() + 7);
  }
  return weekends;
}

function formatWeekend([saturday, sunday]) {
  return `${saturday.getDate()}–${sunday.getDate()} ${MONTHS_GEN[sunday.getMonth()]}`;
}

function getNaborInfo(now) {
  let year = now.getFullYear();
  // okno naboru kończy się w niedzielę drugiego weekendu września danego roku
  const provisionalEnd = firstWeekendsOfMonth(year, 9, 2)[1][1];
  if (now > provisionalEnd) year += 1; // po naborze — pokaż przyszłoroczny termin

  const augWeekend = lastWeekendOfMonth(year, 8);
  const sepWeekends = firstWeekendsOfMonth(year, 9, 2);
  const start = new Date(augWeekend[0]); start.setHours(0, 0, 0, 0);
  const end = new Date(sepWeekends[1][1]); end.setHours(23, 59, 59, 999);
  const isActive = now >= start && now <= end;

  return {
    schoolYearLabel: `${year}/${year + 1}`,
    weekends: [augWeekend, ...sepWeekends],
    isActive
  };
}

const nabor = getNaborInfo(new Date());

const naborYearEl = document.getElementById('nabor-year');
const naborDatesEl = document.getElementById('nabor-dates');
const naborTagEl = document.getElementById('nabor-tag');

if (naborYearEl) naborYearEl.textContent = nabor.schoolYearLabel;
if (naborDatesEl) {
  naborDatesEl.innerHTML = '';
  nabor.weekends.forEach((weekend) => {
    const chip = document.createElement('span');
    chip.className = 'nabor__date';
    chip.textContent = formatWeekend(weekend);
    naborDatesEl.appendChild(chip);
  });
}
if (naborTagEl && nabor.isActive) naborTagEl.textContent = 'NABÓR SZKÓŁEK TENISOWYCH TRWA';

// ============================================================
// Seasonal theme — data-season is set in <head> (before paint).
// Podział wg realnego roku szkółki BKtenis (nie kalendarzowych
// pór roku): IX–XI hala/start, XII–II hala/pełnia, III–VI hala/finisz,
// VII–VIII wakacje — lekcje indywidualne na kortach odkrytych.
// ============================================================
const SEASON_COPY = {
  jesien: {
    icon: '🍂',
    badge: '🍂 START SZKÓŁEK TENISOWYCH',
    ribbon: 'Jesień w BKtenis — nowy sezon treningowy w hali SCS Sokół',
    topbar: '🍂 Wrzesień–listopad — zajęcia w hali, SCS Sokół'
  },
  zima: {
    icon: '❄️',
    badge: '❄️ SEZON W PEŁNI',
    ribbon: 'Zima w BKtenis — trenujemy w hali przez cały sezon',
    topbar: '❄️ Grudzień–luty — zajęcia w hali, SCS Sokół'
  },
  wiosna: {
    icon: '🌱',
    badge: '🌱 FINISZ SEZONU',
    ribbon: 'Wiosna w BKtenis — ostatnie miesiące sezonu halowego',
    topbar: '🌱 Marzec–czerwiec — zajęcia w hali, SCS Sokół'
  },
  lato: {
    icon: '☀️',
    badge: '☀️ WAKACJE NA KORCIE',
    ribbon: 'Wakacje w BKtenis — lekcje indywidualne na kortach odkrytych (inne obiekty)',
    topbar: '☀️ Lipiec–sierpień — lekcje indywidualne, korty odkryte'
  }
};

// Emoji użyte jako unoszące się w tle hero "cząsteczki" sezonowe.
const SEASON_PARTICLES = {
  jesien: ['🍂', '🍁'],
  zima: ['❄️'],
  wiosna: ['🌸', '🌿'],
  lato: ['☀️', '🎾']
};

const season = document.documentElement.dataset.season;
const copy = SEASON_COPY[season];

if (copy) {
  const badge = document.getElementById('season-badge');
  const topbarNote = document.getElementById('season-note');
  const ribbonIcon = document.getElementById('season-ribbon-icon');
  const ribbonText = document.getElementById('season-ribbon-text');
  if (badge) badge.textContent = copy.badge;
  if (topbarNote) topbarNote.textContent = copy.topbar;
  if (ribbonIcon) ribbonIcon.textContent = copy.icon;
  if (ribbonText) ribbonText.textContent = copy.ribbon;
}

// W aktywne dni naboru wstęga sezonowa priorytetowo pokazuje to,
// zamiast standardowego komunikatu o porze roku (nadpisuje go celowo).
if (nabor.isActive) {
  const ribbon = document.getElementById('season-ribbon');
  const ribbonIcon = document.getElementById('season-ribbon-icon');
  const ribbonText = document.getElementById('season-ribbon-text');
  if (ribbon) ribbon.classList.add('is-nabor');
  if (ribbonIcon) ribbonIcon.textContent = '🎾';
  if (ribbonText) ribbonText.textContent = 'Trwa nabór do BKtenis — w ten weekend darmowe treningi. Zapisz się!';
}

// Generuje unoszące się cząsteczki sezonowe w tle hero (liczba i pozycje
// lekko losowe, żeby wyglądały naturalnie, nie mechanicznie).
const particleHost = document.getElementById('hero-particles');
if (particleHost) {
  const emojis = SEASON_PARTICLES[season] || ['✨'];
  const count = window.matchMedia('(max-width: 640px)').matches ? 8 : 14;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'particle';
    span.textContent = emojis[i % emojis.length];
    span.style.left = (Math.random() * 100).toFixed(1) + '%';
    span.style.animationDelay = (Math.random() * 9).toFixed(2) + 's';
    span.style.animationDuration = (9 + Math.random() * 8).toFixed(2) + 's';
    span.style.fontSize = (1 + Math.random() * 0.9).toFixed(2) + 'rem';
    span.style.opacity = (0.35 + Math.random() * 0.35).toFixed(2);
    frag.appendChild(span);
  }
  particleHost.appendChild(frag);
}

// ============================================================
// Mobile nav toggle
// ============================================================
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============================================================
// Contact form — wysyłka przez Formspree (formspree.io), bez
// własnego backendu.
//
// Formularz jest już aktywny — podpięty pod endpoint
// https://formspree.io/f/meaqkrbw (atrybut action w index.html).
// ============================================================
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

if (form && status) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.classList.remove('is-error');

    // Pole-pułapka: jeśli wypełnione, to bot — udajemy sukces i kończymy.
    if (form._gotcha && form._gotcha.value) {
      status.textContent = 'Dziękujemy za wiadomość!';
      form.reset();
      return;
    }

    const actionUrl = form.getAttribute('action') || '';

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wysyłanie…'; }
    status.textContent = '';

    try {
      const response = await fetch(actionUrl, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const name = form.name.value.trim();
        status.textContent = `Dzięki${name ? ', ' + name.split(' ')[0] : ''}! Wiadomość wysłana — odezwę się najszybciej jak mogę.`;
        form.reset();
      } else {
        status.textContent = 'Coś poszło nie tak. Spróbuj ponownie albo zadzwoń: 883 007 327.';
        status.classList.add('is-error');
      }
    } catch (err) {
      status.textContent = 'Brak połączenia. Spróbuj ponownie albo zadzwoń: 883 007 327.';
      status.classList.add('is-error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
    }
  });
}

// ============================================================
// Footer year
// ============================================================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================================
// Cookie banner (RODO) + warunkowe ładowanie Google Analytics
//
// Google Analytics NIE ładuje się, dopóki użytkownik nie kliknie
// "Akceptuj wszystkie". Wybór zapisywany jest w localStorage, więc
// baner pokazuje się tylko przy pierwszej wizycie (i po kliknięciu
// "Ustawienia cookies" w stopce).
// ============================================================
(function () {
  var GA_MEASUREMENT_ID = 'G-NBEQ7M5QDG';
  var CONSENT_KEY = 'bktenis-cookie-consent'; // wartości: 'accepted' | 'rejected'

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); }
    catch (e) { return null; } // np. przeglądarka w trybie prywatnym blokującym storage
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); }
    catch (e) { /* brak dostępu do localStorage — trudno, baner pokaże się ponownie */ }
  }

  function loadAnalytics() {
    if (document.getElementById('ga-script')) return; // już załadowane w tej sesji

    var s = document.createElement('script');
    s.id = 'ga-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  // Najlepszy wysiłek: kasuje ciasteczka Google Analytics, jeśli ktoś
  // zaakceptował wcześniej, a teraz się z tego wycofuje. Same skrypty
  // GA raz wczytane do przeglądarki pozostają w pamięci do odświeżenia
  // strony — dlatego zalecamy też odświeżenie po zmianie zgody.
  function deleteAnalyticsCookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga/.test(name) || /^_gid/.test(name)) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname + ';';
      }
    });
  }

  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');
  var settingsLink = document.getElementById('cookie-settings-link');

  function showBanner() { if (banner) banner.classList.add('is-visible'); }
  function hideBanner() { if (banner) banner.classList.remove('is-visible'); }

  var consent = getConsent();
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'rejected') {
    // brak zapisanej decyzji — pokaż baner (z małym opóźnieniem, żeby
    // animacja wjazdu była widoczna, a nie "przeskakiwała" przy starcie)
    window.setTimeout(showBanner, 400);
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      setConsent('accepted');
      loadAnalytics();
      hideBanner();
    });
  }
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () {
      setConsent('rejected');
      deleteAnalyticsCookies();
      hideBanner();
    });
  }
  if (settingsLink) {
    settingsLink.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner();
    });
  }
})();
