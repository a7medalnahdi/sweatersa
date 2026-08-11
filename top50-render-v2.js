(() => {
  'use strict';

  const canvas = document.querySelector('#canvas');
  if (!canvas || !window.XLSX || !window.JSZip) return;

  const ctx = canvas.getContext('2d');
  canvas.setAttribute('dir', 'ltr');
  const $ = (selector) => document.querySelector(selector);
  const state = {
    rows: [], page: 1, photos: {}, photoMeta: {},
    template: 'celebration',
    photoAdjust: {
      1: { zoom: 1, offsetY: 0 },
      2: { zoom: 1, offsetY: 0 },
      3: { zoom: 1, offsetY: 0 }
    }
  };
  const ORANGE = '#f96714';
  const INK = '#151515';
  const THEMES = {
    celebration: {
      label: 'احتفالي', description: 'هوية سويتر الحيوية',
      background: '#f96714', surface: '#fffaf5', text: '#151515', muted: '#6b6b6b',
      hero: '#ffffff', accent: '#f96714', row: '#fff8f0e8', footer: '#ffffffb8', radius: 82
    },
    editorial: {
      label: 'تحريري', description: 'أبيض، جريء وواضح',
      background: '#f5f1eb', surface: '#ffffff', text: '#101010', muted: '#68635d',
      hero: '#101010', accent: '#f96714', row: '#ffffff', footer: '#10101099', radius: 34
    },
    midnight: {
      label: 'ليلي', description: 'أسود فاخر وبارز',
      background: '#111111', surface: '#202020', text: '#ffffff', muted: '#b9b9b9',
      hero: '#ffffff', accent: '#ff7627', row: '#202020', footer: '#ffffff9c', radius: 52
    }
  };
  try {
    const savedTemplate = localStorage.getItem('sweater_top50_template');
    if (THEMES[savedTemplate]) state.template = savedTemplate;
  } catch (_) {}
  const templateStyles = document.createElement('style');
  templateStyles.textContent = `
    .template-picker{display:grid;gap:9px}.template-option{width:100%;min-height:72px;padding:8px;border:1px solid #e4e7ec;border-radius:14px;background:#fff;display:grid;grid-template-columns:76px 1fr 26px;align-items:center;gap:10px;text-align:right;cursor:pointer;transition:border-color .18s,box-shadow .18s,transform .18s}.template-option:hover{border-color:#f5a274;transform:translateY(-1px)}.template-option.active{border-color:#f96714;box-shadow:0 0 0 3px #f9671415}.template-thumb{height:52px;border-radius:10px;overflow:hidden;position:relative;display:flex;align-items:flex-end;justify-content:center;gap:4px;padding:6px}.template-thumb:before{content:'';position:absolute;inset:6px 8px auto;height:6px;border-radius:6px;background:currentColor;opacity:.9}.template-thumb i{position:relative;width:18px;border-radius:5px 5px 2px 2px;background:currentColor;opacity:.92}.template-thumb i:nth-child(1){height:18px}.template-thumb i:nth-child(2){height:27px}.template-thumb i:nth-child(3){height:20px}.template-thumb-celebration{color:#fff;background:linear-gradient(145deg,#ff9254,#ed4f00)}.template-thumb-editorial{color:#121212;background:linear-gradient(90deg,#f5f1eb 0 82%,#f96714 82%)}.template-thumb-midnight{color:#f96714;background:radial-gradient(circle at 80% 10%,#47200e,#111 70%)}.template-copy strong,.template-copy small{display:block}.template-copy strong{color:#101828;font-size:12px}.template-copy small{margin-top:3px;color:#98a2b3;font-size:9px}.template-check{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#f2f4f7;color:transparent;font-size:9px}.template-option.active .template-check{background:#f96714;color:#fff}@media(max-width:520px){.template-option{grid-template-columns:66px 1fr 24px}.template-thumb{height:48px}}
  `;
  document.head.append(templateStyles);
  const PHOTO_PROMPT = `أنت محرر صور احترافي متخصص في تنقية وتحسين صور الأشخاص.

عندما أرفع لك أي صورة تحتوي على شخص، نفّذ التعديلات التالية مباشرة على الصورة باستخدام أداة تعديل الصور، ولا تكتفِ بإعطائي برومبت أو شرح لما ستفعله:

1. **الحفاظ على الشخص كما هو تمامًا**

- حافظ على نفس ملامح الوجه والهوية والعمر والتعبير.
- لا تغيّر شكل الوجه، الأنف، العينين، الفم، الشعر أو الجسم.
- لا تجعل الشخص يبدو كشخص مختلف.
- لا تضف أي عناصر أو ملابس غير موجودة في الصورة الأصلية.
- حافظ على وضعية الجسم واتجاه النظر قدر الإمكان.

2. **رفع جودة الصورة**

- حسّن الدقة والوضوح بشكل احترافي.
- استعد التفاصيل الدقيقة للوجه، الشعر، الملابس والحواف.
- أزل التشويش والـ noise والضغط الرقمي والـ pixelation.
- حسّن الحدة بشكل طبيعي بدون oversharpening.
- لا تجعل البشرة بلاستيكية أو مصطنعة.
- حافظ على تفاصيل ومسامات البشرة الطبيعية.

3. **تصحيح الإضاءة**

- عدّل التعريض Exposure والـ Highlights والـ Shadows.
- اجعل إضاءة الوجه متوازنة واحترافية.
- صحح الـ White Balance وألوان البشرة.
- أزل أي صبغات لونية غير مرغوبة.
- استخدم إضاءة استديو ناعمة وطبيعية عند الحاجة.
- حافظ على شكل الإضاءة الواقعي ولا تجعل الصورة تبدو مولدة بالذكاء الاصطناعي.

4. **معالجة الألوان**

- اجعل ألوان البشرة طبيعية ودقيقة.
- حسّن الـ contrast والـ dynamic range بشكل متوازن.
- اجعل النتيجة نظيفة واحترافية ومناسبة للاستخدام التجاري والتصميم.

5. **إزالة الخلفية**

- قص الشخص من الخلفية بدقة عالية جدًا.
- اهتم بشكل خاص بحواف الشعر، الأذن، الملابس والأصابع.
- لا تقص أي جزء من الشخص.
- لا تترك أي Halo أو حواف بيضاء أو بقايا من الخلفية القديمة.
- اجعل الخلفية **شفافة بالكامل Transparent Background / Alpha Channel**.

6. **النتيجة النهائية**

- الشخص فقط بدون خلفية.
- PNG بخلفية شفافة إن أمكن.
- أعلى دقة وجودة ممكنة.
- حواف نظيفة جدًا مناسبة لوضع الشخص فوق أي تصميم.
- مظهر فوتوغرافي واقعي وطبيعي.
- لا تغيّر هوية الشخص أو ملامحه تحت أي ظرف.

**مهم جدًا:** عند إرسالي للصورة، ابدأ مباشرة في تعديل الصورة نفسها. لا ترسل لي تعليمات أو برومبت بديل ولا تطلب مني تأكيد العملية إلا إذا كانت الصورة غير موجودة أو غير قابلة للاستخدام.`;
  const riyalImage = new Image();
  const riyalCanvases = new Map();
  riyalImage.onload = () => render();
  riyalImage.src = './assets/saudi-riyal-symbol.svg';
  const medalImages = {};
  [1, 2, 3].forEach((rank) => {
    const image = new Image();
    image.onload = () => render();
    image.src = `./assets/top50-medal-${rank}.png`;
    medalImages[rank] = image;
  });

  const round = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };

  const headerSide = document.querySelector('.head-side');
  if (headerSide) {
    headerSide.innerHTML = '<button type="button" class="btn copy-prompt-btn"><i class="fa-regular fa-copy"></i><span>انسخ البرومبت</span></button>';
    const copyButton = headerSide.querySelector('.copy-prompt-btn');
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(PHOTO_PROMPT);
      } catch (_) {
        const textarea = document.createElement('textarea');
        textarea.value = PHOTO_PROMPT;
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      copyButton.classList.add('copied');
      copyButton.querySelector('i').className = 'fa-solid fa-check';
      copyButton.querySelector('span').textContent = 'تم النسخ';
      setTimeout(() => {
        copyButton.classList.remove('copied');
        copyButton.querySelector('i').className = 'fa-regular fa-copy';
        copyButton.querySelector('span').textContent = 'انسخ البرومبت';
      }, 1800);
    });
  }

  const designStep = $('#month')?.closest('.step');
  if (designStep) {
    designStep.insertAdjacentHTML('beforebegin', `
      <section class="step template-step">
        <h2><b>2</b>اختر قالب التصميم</h2>
        <div class="template-picker" role="radiogroup" aria-label="قالب التصميم">
          ${Object.entries(THEMES).map(([key, theme]) => `
            <button type="button" class="template-option${key === state.template ? ' active' : ''}" data-template="${key}" role="radio" aria-checked="${key === state.template}">
              <span class="template-thumb template-thumb-${key}" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="template-copy"><strong>${theme.label}</strong><small>${theme.description}</small></span>
              <span class="template-check"><i class="fa-solid fa-check"></i></span>
            </button>`).join('')}
        </div>
      </section>`);
    const designNumber = designStep.querySelector('h2 b');
    if (designNumber) designNumber.textContent = '3';
    const photosNumber = document.querySelector('.photos')?.closest('.step')?.querySelector('h2 b');
    if (photosNumber) photosNumber.textContent = '4';
    document.querySelectorAll('[data-template]').forEach((button) => button.addEventListener('click', () => {
      state.template = button.dataset.template;
      try { localStorage.setItem('sweater_top50_template', state.template); } catch (_) {}
      document.querySelectorAll('[data-template]').forEach((option) => {
        const selected = option === button;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-checked', String(selected));
      });
      requestAnimationFrame(render);
    }));
  }

  const norm = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9$]/g, '');
  const columnIndex = (headers, names) => {
    const normalized = headers.map(norm);
    return names.reduce((found, name) => found > -1 ? found : normalized.indexOf(norm(name)), -1);
  };

  async function parseSheet(file) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const raw = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' });
    if (raw.length < 2) throw new Error('الملف لا يحتوي بيانات');
    const headers = raw[0];
    const name = columnIndex(headers, ["Biker's Name", 'name', 'employee']);
    const place = columnIndex(headers, ['Place', 'rank', 'position']);
    const prize = columnIndex(headers, ['$', 'prize', 'reward']);
    const rating = columnIndex(headers, ['Rating', 'rate']);
    if ([name, place, prize, rating].some((index) => index < 0)) throw new Error('لم أجد الأعمدة المطلوبة');
    return raw.slice(1)
      .filter((row) => row[name] !== '' && row[place] !== '')
      .map((row) => ({
        name: String(row[name]).trim(),
        place: Number(row[place]),
        prize: Number(row[prize]) || 0,
        rating: Number(row[rating]) || 0
      }))
      .sort((a, b) => a.place - b.place);
  }

  const splitName = (value, rank) => {
    const text = String(value || `Winner ${rank}`).trim();
    const match = text.match(/\((\d+)\)\s*$/);
    return {
      name: text.replace(/\s*\(\d+\)\s*$/, '').trim(),
      id: match ? match[1] : String(rank)
    };
  };

  const fitFont = (text, maxWidth, start, weight = 700, min = 30) => {
    let size = start;
    do {
      ctx.font = `${weight} ${size}px LamaSans, Arial, sans-serif`;
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    } while (size > min);
    return size;
  };

  const tintedRiyal = (color) => {
    if (!riyalImage.complete || !riyalImage.naturalWidth) return null;
    if (riyalCanvases.has(color)) return riyalCanvases.get(color);
    const icon = document.createElement('canvas');
    icon.width = 90;
    icon.height = 101;
    const iconContext = icon.getContext('2d');
    iconContext.drawImage(riyalImage, 0, 0, icon.width, icon.height);
    iconContext.globalCompositeOperation = 'source-in';
    iconContext.fillStyle = color;
    iconContext.fillRect(0, 0, icon.width, icon.height);
    riyalCanvases.set(color, icon);
    return icon;
  };

  const drawPrice = (value, anchorX, baselineY, fontSize, color, align = 'center') => {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    const text = Number(value || 0).toLocaleString('en-US');
    ctx.font = `900 ${fontSize}px LamaSans, Arial, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const iconHeight = fontSize * .82;
    const iconWidth = iconHeight * .895;
    const gap = fontSize * .18;
    const totalWidth = iconWidth + gap + textWidth;
    const startX = align === 'right' ? anchorX - totalWidth : anchorX - totalWidth / 2;
    const icon = tintedRiyal(color);
    if (icon) ctx.drawImage(icon, startX, baselineY - iconHeight + fontSize * .08, iconWidth, iconHeight);
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.fillText(text, startX + iconWidth + gap, baselineY);
    ctx.restore();
  };

  const drawBackground = () => {
    const theme = THEMES[state.template];
    if (state.template === 'editorial') {
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, 2000, 3000);
      ctx.fillStyle = '#f96714';
      ctx.fillRect(1770, 0, 230, 3000);
      ctx.fillStyle = '#101010';
      ctx.fillRect(0, 0, 34, 3000);
      ctx.save();
      ctx.globalAlpha = .055;
      ctx.strokeStyle = '#101010';
      ctx.lineWidth = 3;
      for (let x = 150; x < 1800; x += 165) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 3000); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#f9671410';
      ctx.beginPath(); ctx.arc(250, 2520, 500, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (state.template === 'midnight') {
      const dark = ctx.createRadialGradient(1550, 350, 80, 1000, 1500, 2100);
      dark.addColorStop(0, '#44200f');
      dark.addColorStop(.42, '#1d1714');
      dark.addColorStop(1, '#090909');
      ctx.fillStyle = dark;
      ctx.fillRect(0, 0, 2000, 3000);
      ctx.save();
      ctx.globalAlpha = .2;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 5;
      for (let radius = 360; radius < 1500; radius += 170) {
        ctx.beginPath(); ctx.arc(1740, 300, radius, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#f96714';
      ctx.fillRect(0, 0, 2000, 20);
      return;
    }
    const gradient = ctx.createRadialGradient(930, 330, 80, 1020, 1440, 1900);
    gradient.addColorStop(0, '#ff9254');
    gradient.addColorStop(.44, '#ff721f');
    gradient.addColorStop(1, '#ed4f00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2000, 3000);

    ctx.save();
    ctx.globalAlpha = .1;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(1000, 1720, 720, Math.PI * .08, Math.PI * .92, true);
    ctx.stroke();
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(1000, 1720, 610, Math.PI * .08, Math.PI * .92, true);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = .08;
    ctx.fillStyle = '#fff';
    for (let y = -150; y < 3100; y += 190) {
      ctx.save();
      ctx.translate(1000, y);
      ctx.rotate(-.11);
      ctx.fillRect(-1300, 0, 2600, 3);
      ctx.restore();
    }
    ctx.restore();
  };

  const confetti = () => {
    const pieces = [
      [170, 890, 18, 78, -.4], [310, 1450, 15, 62, .6], [1660, 920, 17, 74, .35],
      [1810, 1530, 16, 68, -.5], [390, 1880, 14, 55, -.7], [1570, 1810, 14, 58, .8],
      [230, 2190, 15, 72, .4], [1770, 2260, 16, 66, -.55], [560, 760, 13, 56, .25],
      [1440, 720, 13, 58, -.25]
    ];
    ctx.save();
    pieces.forEach(([x, y, w, h, angle], index) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = index % 2 ? '#ffcc8b' : '#b93400';
      round(-w / 2, -h / 2, w, h, w / 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  };

  const drawHeroTitle = () => {
    const month = $('#month').value || 'June';
    const year = $('#year').value || '2026';
    const theme = THEMES[state.template];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (state.template === 'editorial') {
      ctx.textAlign = 'left';
      ctx.fillStyle = theme.accent;
      round(145, 116, 190, 52, 26); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 25px LamaSans, Arial, sans-serif';
      ctx.fillText('TOP PERFORMERS', 175, 152);
      ctx.fillStyle = theme.hero;
      ctx.font = `900 ${fitFont('BEST 3 BIKERS', 1420, 214, 900, 140)}px LamaSans, Arial, sans-serif`;
      ctx.fillText('BEST 3 BIKERS', 145, 365);
      ctx.fillStyle = theme.accent;
      ctx.fillRect(145, 410, 690, 11);
      ctx.fillStyle = theme.muted;
      ctx.font = '600 61px LamaSans, Arial, sans-serif';
      ctx.fillText(`${month} ${year}  /  Congratulations`, 145, 505);
      return;
    }
    if (state.template === 'midnight') {
      ctx.fillStyle = theme.accent;
      ctx.font = '900 34px LamaSans, Arial, sans-serif';
      ctx.fillText('SWEATER PERFORMANCE AWARDS', 1000, 118);
      ctx.fillStyle = theme.hero;
      ctx.font = '900 218px LamaSans, Arial, sans-serif';
      ctx.fillText('BEST 3 BIKERS', 1000, 345);
      ctx.fillStyle = '#ffffffb5';
      ctx.font = '500 66px LamaSans, Arial, sans-serif';
      ctx.fillText(`${month} ${year}  •  Congratulations`, 1000, 455);
      ctx.fillStyle = theme.accent;
      round(850, 500, 300, 12, 6); ctx.fill();
      return;
    }
    ctx.font = '900 214px LamaSans, Arial, sans-serif';
    ctx.fillStyle = '#9d2b00';
    ctx.fillText('BEST 3 BIKERS', 1000, 344);
    ctx.fillStyle = '#ffb018';
    ctx.fillText('BEST 3 BIKERS', 1000, 322);
    ctx.fillStyle = '#fff';
    ctx.fillText('BEST 3 BIKERS', 1000, 294);
    ctx.font = '500 72px LamaSans, Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`in ${month} ${year}  •  Congratulations`, 1000, 430);

    ctx.fillStyle = '#ffffff20';
    round(500, 495, 1000, 92, 46);
    ctx.fill();
    ctx.font = '900 35px LamaSans, Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('CELEBRATING OUR TOP PERFORMERS', 1000, 555);
  };

  const medalColor = (rank) => rank === 1
    ? ['#ffd76b', '#b87800']
    : rank === 2 ? ['#f4f7fb', '#8e9aa7'] : ['#ffb07a', '#a9491c'];

  const drawMedal = (cx, cy, rank, radius = 92) => {
    const suppliedMedal = medalImages[rank];
    if (suppliedMedal?.complete && suppliedMedal.naturalWidth) {
      const sourceX = 528;
      const sourceY = 294;
      const sourceWidth = 1073;
      const sourceHeight = 1522;
      const drawWidth = radius * 2.25;
      const drawHeight = drawWidth * (sourceHeight / sourceWidth);
      const circleCenterRatio = 476 / sourceHeight;
      ctx.save();
      ctx.shadowColor = '#5d210038';
      ctx.shadowBlur = radius * .22;
      ctx.shadowOffsetY = radius * .12;
      ctx.drawImage(
        suppliedMedal,
        sourceX, sourceY, sourceWidth, sourceHeight,
        cx - drawWidth / 2, cy - drawHeight * circleCenterRatio,
        drawWidth, drawHeight
      );
      ctx.restore();
      return;
    }
    const [light, dark] = medalColor(rank);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = rank === 1 ? '#c73520' : rank === 2 ? '#d9e1ea' : '#d2582b';
    ctx.beginPath();
    ctx.moveTo(-54, radius - 3);
    ctx.lineTo(-18, radius + 112);
    ctx.lineTo(8, radius + 65);
    ctx.lineTo(53, radius + 108);
    ctx.lineTo(46, radius - 2);
    ctx.closePath();
    ctx.fill();
    const gradient = ctx.createRadialGradient(-24, -28, 8, 0, 0, radius);
    gradient.addColorStop(0, light);
    gradient.addColorStop(1, dark);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff70';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${radius}px LamaSans, Arial, sans-serif`;
    ctx.fillStyle = rank === 2 ? '#65717e' : '#7b3900';
    ctx.fillText(String(rank), 0, 8);
    ctx.restore();
  };

  const drawPlaceholder = (cx, bottom, w, h, rank) => {
    const top = bottom - h;
    const g = ctx.createLinearGradient(cx, top, cx, bottom);
    g.addColorStop(0, '#ffbc8f');
    g.addColorStop(1, '#d95008');
    ctx.fillStyle = g;
    round(cx - w / 2, top, w, h, 150);
    ctx.fill();
    ctx.fillStyle = '#ffffff32';
    ctx.beginPath();
    ctx.arc(cx, top + h * .27, w * .2, 0, Math.PI * 2);
    ctx.fill();
    round(cx - w * .3, top + h * .49, w * .6, h * .42, w * .25);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    const placeholderLabel = `PLACE ${rank} PHOTO`;
    ctx.font = `900 ${fitFont(placeholderLabel, w - 80, 54, 900, 34)}px LamaSans, Arial, sans-serif`;
    ctx.fillText(placeholderLabel, cx, top + h * .83);
  };

  const imageHasTransparency = (image) => {
    try {
      const sample = document.createElement('canvas');
      sample.width = 12;
      sample.height = 12;
      const sampleContext = sample.getContext('2d', { willReadFrequently: true });
      sampleContext.drawImage(image, 0, 0, 12, 12);
      const pixels = sampleContext.getImageData(0, 0, 12, 12).data;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] < 245) return true;
    } catch (_) {}
    return false;
  };

  const drawPortrait = (rank, cx, bottom, width, height) => {
    const image = state.photos[rank];
    const adjustment = state.photoAdjust[rank];
    ctx.save();
    ctx.shadowColor = '#8b260055';
    ctx.shadowBlur = 42;
    ctx.shadowOffsetY = 28;
    if (!image) {
      drawPlaceholder(cx, bottom, width, height, rank);
      ctx.restore();
      return;
    }
    const scale = Math.min(width / image.width, height / image.height) * adjustment.zoom;
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = cx - drawWidth / 2;
    const drawY = bottom - drawHeight + adjustment.offsetY;
    if (state.photoMeta[rank]?.transparent) {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
      return;
    }
    const top = bottom - height;
    round(cx - width / 2, top, width, height, 150);
    ctx.clip();
    const coverScale = Math.max(width / image.width, height / image.height) * adjustment.zoom;
    const coverWidth = image.width * coverScale;
    const coverHeight = image.height * coverScale;
    ctx.drawImage(image, cx - coverWidth / 2, top + height - coverHeight + adjustment.offsetY, coverWidth, coverHeight);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#ffffff75';
    ctx.lineWidth = 8;
    round(cx - width / 2, top, width, height, 150);
    ctx.stroke();
    ctx.restore();
  };

  const drawTrophyBackdrop = () => {
    ctx.save();
    ctx.globalAlpha = state.template === 'editorial' ? .1 : .16;
    ctx.strokeStyle = state.template === 'editorial' ? '#f96714' : '#fff';
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(690, 910);
    ctx.lineTo(750, 1480);
    ctx.quadraticCurveTo(805, 1810, 1000, 1850);
    ctx.quadraticCurveTo(1195, 1810, 1250, 1480);
    ctx.lineTo(1310, 910);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(700, 1040);
    ctx.quadraticCurveTo(430, 980, 380, 1240);
    ctx.quadraticCurveTo(350, 1480, 690, 1580);
    ctx.moveTo(1300, 1040);
    ctx.quadraticCurveTo(1570, 980, 1620, 1240);
    ctx.quadraticCurveTo(1650, 1480, 1310, 1580);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1000, 1850);
    ctx.lineTo(1000, 1990);
    ctx.moveTo(820, 1990);
    ctx.lineTo(1180, 1990);
    ctx.stroke();
    ctx.restore();
  };

  const drawWinnerCard = (rank, x, y, width, height) => {
    const theme = THEMES[state.template];
    const winner = state.rows.find((row) => row.place === rank) || { name: `Winner ${rank}`, prize: 0, rating: 0 };
    const person = splitName(winner.name, rank);
    ctx.save();
    ctx.shadowColor = '#8f2b0028';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 22;
    ctx.fillStyle = theme.surface;
    round(x, y, width, height, state.template === 'editorial' ? 30 : 56);
    ctx.fill();
    ctx.restore();

    if (state.template === 'editorial') {
      ctx.fillStyle = theme.accent;
      round(x, y, 16, height, 8); ctx.fill();
    } else if (state.template === 'midnight') {
      ctx.strokeStyle = '#ffffff18'; ctx.lineWidth = 3;
      round(x, y, width, height, 56); ctx.stroke();
    }

    const cx = x + width / 2;
    drawMedal(cx, y - (rank === 1 ? 65 : 55), rank, rank === 1 ? 100 : 88);
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.muted;
    ctx.font = '900 25px LamaSans, Arial, sans-serif';
    ctx.fillText('BIKER ID', cx, y + 190);
    ctx.fillStyle = theme.text;
    ctx.font = '900 108px LamaSans, Arial, sans-serif';
    ctx.fillText(person.id, cx, y + 300);
    ctx.fillStyle = theme.muted;
    ctx.font = `900 ${fitFont(person.name.toUpperCase(), width - 70, 48, 900, 28)}px LamaSans, Arial, sans-serif`;
    ctx.fillText(person.name.toUpperCase(), cx, y + 382);

    ctx.fillStyle = theme.accent;
    round(x + 48, y + 425, width - 96, 112, 56);
    ctx.fill();
    drawPrice(winner.prize, cx, y + 501, 65, '#fff');

    ctx.fillStyle = state.template === 'midnight' ? '#ffffff12' : '#f2f3f5';
    round(x + 48, y + 565, width - 96, 90, 28);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = theme.muted;
    ctx.font = '800 28px LamaSans, Arial, sans-serif';
    ctx.fillText('RATING', x + 78, y + 622);
    ctx.textAlign = 'right';
    ctx.fillStyle = theme.text;
    ctx.font = '900 44px LamaSans, Arial, sans-serif';
    ctx.fillText(`${winner.rating.toFixed(2)}  ★`, x + width - 74, y + 624);
  };

  const drawCover = () => {
    const theme = THEMES[state.template];
    drawBackground();
    if (state.template === 'celebration') confetti();
    drawHeroTitle();

    ctx.fillStyle = state.template === 'editorial' ? '#f967140c' : state.template === 'midnight' ? '#ffffff08' : '#ffffff16';
    round(120, 660, 1760, 1270, 110);
    ctx.fill();
    ctx.strokeStyle = state.template === 'editorial' ? '#10101018' : '#ffffff25';
    ctx.lineWidth = 4;
    ctx.stroke();

    drawTrophyBackdrop();

    drawPortrait(2, 500, 2030, 590, 1120);
    drawPortrait(3, 1500, 2030, 590, 1120);
    drawPortrait(1, 1000, 2070, 760, 1410);

    const fade = ctx.createLinearGradient(0, 1680, 0, 2090);
    fade.addColorStop(0, `${theme.background}00`);
    fade.addColorStop(1, theme.background);
    ctx.fillStyle = fade;
    ctx.fillRect(0, 1660, 2000, 450);

    drawWinnerCard(2, 115, 2130, 550, 710);
    drawWinnerCard(1, 725, 2040, 550, 800);
    drawWinnerCard(3, 1335, 2130, 550, 710);

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.footer;
    ctx.font = '700 29px LamaSans, Arial, sans-serif';
    ctx.fillText('SWEATER • TOP PERFORMANCE RECOGNITION', 1000, 2940);
  };

  const drawList = () => {
    drawBackground();
    const theme = THEMES[state.template];
    const month = $('#month').value || 'June';
    const year = $('#year').value || '2026';
    if (state.template === 'editorial') {
      ctx.textAlign = 'left';
      ctx.fillStyle = theme.hero;
      ctx.font = '900 240px LamaSans, Arial, sans-serif';
      ctx.fillText($('#title').value || 'TOP 50', 145, 285);
      ctx.fillStyle = theme.accent;
      ctx.fillRect(145, 335, 460, 12);
      ctx.fillStyle = theme.muted;
      ctx.font = '600 58px LamaSans, Arial, sans-serif';
      ctx.fillText(`${month} ${year}  /  Congratulations`, 145, 430);
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.hero;
      ctx.font = '900 250px LamaSans, Arial, sans-serif';
      ctx.fillText($('#title').value || 'TOP 50', 1000, 270);
      ctx.font = '500 74px LamaSans, Arial, sans-serif';
      ctx.fillText(`in ${month} ${year}  •  Congratulations`, 1000, 390);
      if (state.template === 'midnight') {
        ctx.fillStyle = theme.accent;
        round(880, 425, 240, 10, 5); ctx.fill();
      }
    }
    const start = 3 + (state.page - 2) * 12;
    state.rows.slice(start, start + 12).forEach((row, index) => {
      const y = 500 + index * 195;
      ctx.fillStyle = theme.row;
      round(190, y, 1620, 165, theme.radius);
      ctx.fill();
      if (state.template !== 'celebration') {
        ctx.strokeStyle = state.template === 'editorial' ? '#10101016' : '#ffffff12';
        ctx.lineWidth = 3; round(190, y, 1620, 165, theme.radius); ctx.stroke();
      }
      if (state.template === 'editorial') {
        ctx.fillStyle = theme.accent;
        round(190, y, 18, 165, 9); ctx.fill();
      }
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = theme.accent;
      ctx.font = '900 68px LamaSans, Arial, sans-serif';
      ctx.fillText(`${row.place}-`, 235, y + 82);
      ctx.fillStyle = theme.text;
      ctx.font = `600 ${fitFont(row.name, 790, 57, 600, 34)}px LamaSans, Arial, sans-serif`;
      ctx.fillText(row.name, 390, y + 82);
      ctx.textAlign = 'right';
      ctx.font = '900 55px LamaSans, Arial, sans-serif';
      ctx.fillText(row.rating.toFixed(2), 1430, y + 82);
      drawPrice(row.prize, 1750, y + 105, 75, theme.accent, 'right');
      ctx.textBaseline = 'alphabetic';
    });
  };

  const render = () => {
    ctx.direction = 'ltr';
    document.querySelectorAll('#pages button').forEach((button, index) => {
      button.classList.toggle('active', index + 1 === state.page);
    });
    state.page === 1 ? drawCover() : drawList();
  };

  const canvasBlob = () => new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
  const save = (blob, name) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const sheetInput = $('#sheetFile');
  sheetInput.onchange = null;
  sheetInput.addEventListener('change', async (event) => {
    if (!event.target.files[0]) return;
    try {
      state.rows = await parseSheet(event.target.files[0]);
      $('#fileStatus').textContent = `تمت قراءة ${state.rows.length} سجل بنجاح.`;
      $('#rowCount').textContent = state.rows.length;
      $('#topRating').textContent = state.rows.length ? Math.max(...state.rows.map((row) => row.rating)).toFixed(2) : '—';
      $('#totalPrize').textContent = state.rows.reduce((sum, row) => sum + row.prize, 0).toLocaleString('en-US');
      render();
    } catch (error) {
      $('#fileStatus').textContent = error.message;
    }
  });

  document.querySelectorAll('[data-photo]').forEach((input) => {
    input.onchange = null;
    input.addEventListener('change', () => {
      if (!input.files[0]) return;
      const previewUrl = URL.createObjectURL(input.files[0]);
      const image = new Image();
      image.onload = () => {
        const rank = Number(input.dataset.photo);
        state.photos[rank] = image;
        state.photoMeta[rank] = { transparent: imageHasTransparency(image) };
        const preview = input.parentElement.querySelector('img');
        if (preview) {
          preview.src = previewUrl;
          preview.hidden = false;
        }
        render();
      };
      image.src = previewUrl;
    });
  });

  const photosStep = document.querySelector('.photos')?.closest('.step');
  if (photosStep) {
    photosStep.insertAdjacentHTML('beforeend', `
      <div class="photo-adjustments">
        <div class="adjustments-title"><strong>ضبط الصور</strong><span>عدّل الحجم والارتفاع لكل فائز</span></div>
        ${[[1, 'الأول'], [2, 'الثاني'], [3, 'الثالث']].map(([rank, label]) => `
          <div class="adjust-row">
            <b>${label}</b>
            <label><span>الحجم</span><input type="range" min="70" max="145" value="100" data-photo-zoom="${rank}"></label>
            <label><span>الارتفاع</span><input type="range" min="-180" max="180" value="0" data-photo-offset="${rank}"></label>
          </div>`).join('')}
      </div>`);
    document.querySelectorAll('[data-photo-zoom]').forEach((input) => input.addEventListener('input', () => {
      state.photoAdjust[Number(input.dataset.photoZoom)].zoom = Number(input.value) / 100;
      requestAnimationFrame(render);
    }));
    document.querySelectorAll('[data-photo-offset]').forEach((input) => input.addEventListener('input', () => {
      state.photoAdjust[Number(input.dataset.photoOffset)].offsetY = Number(input.value);
      requestAnimationFrame(render);
    }));
  }

  ['month', 'year', 'title'].forEach((id) => $('#' + id).addEventListener('input', () => requestAnimationFrame(render)));
  document.querySelectorAll('#pages button').forEach((button, index) => {
    button.addEventListener('click', () => {
      state.page = index + 1;
      requestAnimationFrame(render);
    });
  });

  $('#downloadPage').onclick = async () => {
    render();
    save(await canvasBlob(), `best-50-page-${state.page}.png`);
  };

  $('#downloadAll').onclick = async () => {
    if (!state.rows.length) return;
    const zip = new JSZip();
    const oldPage = state.page;
    for (let page = 1; page <= 5; page += 1) {
      state.page = page;
      render();
      zip.file(`best-50-page-${page}.png`, await canvasBlob());
    }
    state.page = oldPage;
    render();
    save(await zip.generateAsync({ type: 'blob' }), `best-50-${$('#month').value}-${$('#year').value}.zip`);
  };

  document.fonts.ready.then(render);
})();
