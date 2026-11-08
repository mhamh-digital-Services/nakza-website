const film = document.querySelector('.film');
const openGift = document.querySelector('#film-open');
const openLabel = openGift.querySelector('span');
const filmStatus = document.querySelector('#film-status');
const confettiLayer = document.querySelector('.film-confetti');

for (let index = 0; index < 32; index++) {
  const piece = document.createElement('i');
  const angle = index * Math.PI * 2 / 32;
  const radius = 87 + index % 7 * 17;
  piece.style.setProperty('--dx', Math.cos(angle) * radius + 'px');
  piece.style.setProperty('--dy', Math.sin(angle) * radius - 50 + 'px');
  piece.style.setProperty('--turn', index * 71 + 'deg');
  piece.style.setProperty('--delay', 120 + index % 6 * 22 + 'ms');
  piece.style.setProperty('--color', ['#9b65d4','#f2a2c6','#f1bd57','#74b4dd','#80bcab'][index % 5]);
  confettiLayer.append(piece);
}

let autoOpenTimer;
let openingStarted = false;

function setGiftOpen(opening) {
  film.dataset.open = String(opening);
  openGift.setAttribute('aria-expanded', String(opening));
  openLabel.textContent = opening ? 'أعد المفاجأة' : 'افتح الهدية';
  filmStatus.textContent = opening ? 'انفتحت الهدية وطلعت البالونات.' : '';
}

function startGift() {
  clearTimeout(autoOpenTimer);
  openingStarted = true;
  setGiftOpen(true);
}

openGift.addEventListener('click', () => {
  if (film.dataset.open !== 'true') {
    startGift();
    return;
  }
  setGiftOpen(false);
  autoOpenTimer = setTimeout(startGift, 480);
});

function scheduleOpening() {
  if (!openingStarted) autoOpenTimer = setTimeout(startGift, 1100);
}

if ('IntersectionObserver' in window) {
  const openingObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    openingObserver.disconnect();
    scheduleOpening();
  }, {threshold:0.3});
  openingObserver.observe(film.querySelector('.film-scene'));
} else {
  scheduleOpening();
}
