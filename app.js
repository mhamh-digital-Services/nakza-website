const stage = document.querySelector('#stage');
const gift = document.querySelector('#gift');
const giftLabel = document.querySelector('#gift-label');
const sound = document.querySelector('#sound');
const letter = document.querySelector('#letter');
const announcement = document.querySelector('#announcement');
const form = document.querySelector('#order-form');
const result = document.querySelector('#result');
let audio;
let soundEnabled = true;
let pendingLetter;
let preparedGift;
const steps = [...document.querySelectorAll('.demo-steps li')];
const confetti = document.querySelector('.confetti');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const occasionSelect = form.elements.occasion;
const revealChoice = document.querySelector('#reveal-choice');
const demos = {
  birthday: {
    name: 'عيد ميلاد', edition: 'BIRTHDAY / 01', middle: 'الأمنية',
    action: 'تمنَّ أمنية وأطفئ الشموع', opened: 'انفتح البوكس وطلعت كيكة الميلاد.',
    kicker: 'HAPPY BIRTHDAY', title: 'كل عام وأنت بخير!',
    message: 'أتمنى تكون سنتك الجديدة مليانة لحظات حلوة وأشياء تحبّها. هذي مفاجأة صغيرة تليق بيومك 🎀',
  },
  graduation: {
    name: 'تخرّج', edition: 'GRADUATION / 02', middle: 'الاحتفال',
    action: 'اقرأ التهنئة', opened: 'طلعت قبعة التخرّج والشهادة.',
    kicker: 'YOU DID IT', title: 'ألف مبروك التخرّج!',
    message: 'تعبك وسهرك وصلوك لهاللحظة. فخورة فيك من أول خطوة لين اليوم. وعقبال كل حلم تستاهله!',
  },
  pregnancy: {
    name: 'مفاجأة حمل', edition: 'BABY NEWS / 03', middle: 'أول تلميح',
    action: 'افتح الرسالة', opened: 'طلع حذاء صغير من الهدية.',
    kicker: 'A LITTLE SECRET', title: 'مفاجأة… بتصير بابا!',
    message: 'صرت أتخيلك تشيل أصغر يد في الدنيا. قريب بنصير ثلاثة، وأنا مرّة متحمسة أعيش هالبداية معك.',
  },
  reveal: {
    name: 'كشف جنس البيبي للأب', edition: 'BABY REVEAL / 04', middle: 'كشف المفاجأة',
    action: 'اكشف المفاجأة', opened: 'طلعت بالونات وردية وزرقاء.',
    kicker: 'A NOTE FOR DAD', title: 'بابا… أنا بنتك!',
    message: 'لسّه ما تقابلنا، بس ماما تقول لي عنك كثير. متحمسة أمسك إصبعك وأسمع صوتك من قريب. أشوفك قريب يا بابا 💗',
  },
};
let activeDemo = 'birthday';
const pickerButtons = [...document.querySelectorAll('[data-picker]')];
const demoDetails = {
  birthday: 'كيكة، شموع ورسالة.',
  graduation: 'قبعة وشهادة وتهنئة.',
  pregnancy: 'مفاجأة «بتصير بابا».',
  reveal: 'بالونات تكشف الخبر للأب.',
};

function selectDemo(key) {
  clearTimeout(pendingLetter);
  stopMelody();
  activeDemo = key;
  const demo = demos[key];
  stage.dataset.occasion = key;
  pickerButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.picker === key));
  });
  document.querySelector('#demo-detail').textContent = demoDetails[key];
  showStep('closed', 0);
  giftLabel.textContent = 'افتح البوكس';
  document.querySelector('#stage-caption').textContent = demo.name;
  document.querySelector('.edition').textContent = demo.edition;
  document.querySelector('#middle-step').textContent = demo.middle;
  document.querySelector('#letter-kicker').textContent = demo.kicker;
  document.querySelector('#letter-heading').textContent = demo.title;
  document.querySelector('#letter-message').textContent = demo.message;
  announcement.textContent = 'تجربة ' + demo.name + ' جاهزة للفتح.';
}

function updateOrder() {
  revealChoice.hidden = occasionSelect.value !== 'reveal';
  form.elements.baby.disabled = revealChoice.hidden;
  document.querySelector('#summary').hidden = true;
}
occasionSelect.addEventListener('change', updateOrder);
updateOrder();

pickerButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.picker !== activeDemo) selectDemo(button.dataset.picker);
  });
});

document.querySelectorAll('[data-demo]').forEach(button => {
  button.addEventListener('click', () => {
    selectDemo(button.dataset.demo);
    stage.scrollIntoView({block:'center'});
    gift.focus({preventScroll:true});
  });
});

for (let index = 0; index < 22; index++) {
  const piece = document.createElement('i');
  const angle = index / 22 * Math.PI * 2;
  const radius = 82 + (index % 5) * 18;
  piece.style.setProperty('--dx', Math.cos(angle) * radius + 'px');
  piece.style.setProperty('--dy', Math.sin(angle) * radius - 35 + 'px');
  piece.style.setProperty('--turn', 80 + index * 48 + 'deg');
  piece.style.setProperty('--delay', 160 + (index % 6) * 30 + 'ms');
  piece.style.setProperty('--piece', ['#f7d48c','#ab87ea','#ff9fb6','#fff4ed'][index % 4]);
  confetti.append(piece);
}

function showStep(step, index) {
  stage.dataset.step = step;
  steps.forEach((item, position) => {
    if (position === index) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, {threshold:.1});
  document.querySelectorAll('.reveal').forEach(section => {
    section.classList.add('observe');
    observer.observe(section);
  });
}

const soundtracks = {
  birthday: {
    beat: .4, wave: 'triangle', level: .1,
    open: [
      [60,.75],[60,.25],[62,1],[60,1],[65,1],[64,2],
      [60,.75],[60,.25],[62,1],[60,1],[67,1],[65,2],
      [60,.75],[60,.25],[72,1],[69,1],[65,1],[64,1],[62,1.5],
      [70,.75],[70,.25],[69,1],[65,1],[67,1],[65,2.5],
    ],
  },
  graduation: {
    beat: .24, wave: 'triangle', level: .095,
    open: [[55,.5],[60,.5],[64,.5],[67,1],[64,.5],[67,.5],[72,2],[71,.5],[72,2.5]],
    letter: [[67,.5],[72,.5],[76,2.5]],
  },
  pregnancy: {
    beat: .44, wave: 'sine', level: .085,
    open: [[72,1],[76,1],[74,1],[72,1.5],[69,1],[72,1],[67,2]],
    letter: [[67,1],[72,1],[76,2]],
  },
  reveal: {
    beat: .24, wave: 'triangle', level: .09,
    open: [[64,1],[67,1],[69,1],[71,2]],
    letter: [[72,.5],[76,.5],[79,.5],[84,1],[79,.5],[84,2]],
  },
};

function playMelody(cue) {
  const Audio = window.AudioContext || window.webkitAudioContext;
  const track = soundtracks[activeDemo];
  const notes = track[cue];
  if (!Audio || !soundEnabled || !notes) return;
  stopMelody();
  let context;
  try {
    context = new Audio();
  } catch {
    return;
  }
  audio = context;
  context.resume().catch(() => {
    if (audio === context) stopMelody();
  });
  let start = context.currentTime + (cue === 'letter' && !reduceMotion.matches ? .39 : .06);
  for (const [pitch, beats] of notes) {
    const tone = context.createOscillator();
    const gain = context.createGain();
    const duration = beats * track.beat;
    const end = start + Math.min(1.05, duration + .09);
    tone.type = track.wave;
    tone.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
    gain.gain.setValueAtTime(.001, start);
    gain.gain.exponentialRampToValueAtTime(track.level, start + .02);
    gain.gain.exponentialRampToValueAtTime(.001, end);
    tone.connect(gain).connect(context.destination);
    tone.start(start);
    tone.stop(end + .01);
    start += duration;
  }
}

function stopMelody() {
  if (!audio) return;
  audio.close().catch(() => {});
  audio = undefined;
}

sound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  sound.setAttribute('aria-pressed', String(soundEnabled));
  if (!soundEnabled) stopMelody();
  else if (stage.dataset.step === 'cake') playMelody('open');
  else if (stage.dataset.step === 'letter') playMelody('letter');
});

gift.addEventListener('click', () => {
  clearTimeout(pendingLetter);
  if (stage.dataset.step === 'closed') {
    showStep('cake', 1);
    giftLabel.textContent = demos[activeDemo].action;
    announcement.textContent = demos[activeDemo].opened;
    playMelody('open');
  } else if (stage.dataset.step === 'cake') {
    showStep('letter', 2);
    giftLabel.textContent = 'إعادة المفاجأة';
    announcement.textContent = 'رسالة المفاجأة جاهزة.';
    playMelody('letter');
    pendingLetter = setTimeout(() => letter.showModal(), reduceMotion.matches ? 0 : 390);
  } else {
    stopMelody();
    showStep('closed', 0);
    giftLabel.textContent = 'افتح البوكس';
    announcement.textContent = '';
  }
});

document.querySelector('#try').addEventListener('click', () => {
  if (stage.dataset.step === 'letter') {
    if (document.body.classList.contains('shared-gift')) gift.click();
    else selectDemo(activeDemo);
  }
  stage.scrollIntoView({block:'nearest'});
  gift.focus({preventScroll:true});
  if (stage.dataset.step === 'closed') gift.click();
});
document.querySelector('#close-letter').addEventListener('click', () => letter.close());
function prepareSelectedGift() {
  occasionSelect.value = activeDemo;
  updateOrder();
}

document.querySelector('#demo-order').addEventListener('click', prepareSelectedGift);
document.querySelector('#letter-order').addEventListener('click', () => {
  prepareSelectedGift();
  letter.close();
});

const dateFields = document.querySelector('.occasion-date');
const dateError = document.querySelector('#date-error');

function latinDigits(value) {
  return value.trim().replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) & 15));
}

dateFields.addEventListener('input', () => {
  dateError.hidden = true;
  dateFields.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(form);
  const name = String(fields.get('name')).trim();
  const message = String(fields.get('message')).trim();
  if (!name || !message) {
    const field = form.elements[name ? 'message' : 'name'];
    field.value = '';
    field.reportValidity();
    return;
  }
  const yearText = latinDigits(String(fields.get('year')));
  const monthText = String(fields.get('month'));
  const dayText = latinDigits(String(fields.get('day')));
  let date = '';
  if (yearText || monthText || dayText) {
    const [year, month, day] = [yearText, monthText, dayText].map(Number);
    const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    let invalidField;
    if (!/^\d{4}$/.test(yearText) || year < 1000) invalidField = 'year';
    else if (!month || month > 12) invalidField = 'month';
    else if (!/^\d{1,2}$/.test(dayText) || day < 1 || day > maxDay) invalidField = 'day';
    if (invalidField) {
      document.querySelector('#summary').hidden = true;
      dateError.textContent = invalidField === 'day' ? 'اكتب يومًا صحيحًا للشهر المختار.' : 'أكمل السنة والشهر واليوم.';
      dateError.hidden = false;
      const field = form.elements[invalidField];
      field.setAttribute('aria-invalid', 'true');
      field.focus();
      return;
    }
    date = day + ' ' + form.elements.month.selectedOptions[0].textContent + ' ' + year;
  }
  preparedGift = { occasion: occasionSelect.value, name, message, date, baby: fields.get('baby') };
  result.value = [
    'نَكْزة | ' + demos[occasionSelect.value].name,
    occasionSelect.value === 'reveal' ? 'المفاجأة: ' + fields.get('baby') : '',
    'الاسم: ' + name,
    date ? 'موعد المناسبة: ' + date : '',
    'رسالة الهدية:',
    message,
  ].filter(Boolean).join('\n');
  document.querySelector('#summary').hidden = false;
  document.querySelector('#copy-status').textContent = '';
  result.focus();
});
document.querySelector('#copy').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(result.value);
    status.textContent = 'تم نسخ التفاصيل.';
  } catch {
    result.focus();
    result.select();
    status.textContent = 'ظلّلنا لك التفاصيل. انسخها من القائمة أو لوحة المفاتيح.';
  }
});

form.addEventListener('input', () => {
  document.querySelector('#summary').hidden = true;
});

function showSharedGift(shared) {
  document.body.classList.add('shared-gift');
  selectDemo(shared.occasion);
  document.querySelector('#letter-heading').textContent = shared.occasion === 'reveal'
    ? (shared.baby === 'بنت' ? 'بابا… أنا بنتك!' : 'بابا… أنا ولدك!')
    : demos[shared.occasion].title;
  document.querySelector('#letter-message').textContent = [
    shared.name, shared.message, shared.date,
  ].filter(Boolean).join('\n\n');
}
