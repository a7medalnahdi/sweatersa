(() => {
  'use strict';
  const page = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const isDashboard = page === '' || page === 'index.html';
  const legacy = page === 'n_icons.html' || page === 'Quotation Generator.html';

  document.body.classList.add(isDashboard ? 'sw-dashboard' : 'sw-tool');
  if (legacy) document.body.classList.add('sw-legacy');
  if (page === 'Quotation Generator.html') document.body.classList.add('sw-quotation');
  if (page === 'n_icons.html') document.body.classList.add('sw-designer');

  const header = document.querySelector('header, .top-bar');
  if (header && !header.querySelector('.sw-version')) {
    const badge = document.createElement('span');
    badge.className = 'sw-version';
    badge.textContent = 'الإصدار 2.0';
    const target = header.querySelector('.controls-container') || header.lastElementChild || header;
    target.prepend(badge);
  }

  if (!isDashboard) {
    const quick = document.createElement('nav');
    quick.className = 'sw-shortcuts';
    quick.setAttribute('aria-label', 'روابط سريعة');
    quick.innerHTML = '<a class="sw-shortcut" href="./index.html"><i class="fa-solid fa-grid-2"></i> كل الأدوات</a>';
    document.body.appendChild(quick);
  }

  if (isDashboard) {
    const heroText = document.querySelector('section p');
    const hero = heroText?.parentElement;
    if (hero) {
      const release = document.createElement('span');
      release.className = 'release-mark';
      release.innerHTML = '<i class="fa-solid fa-sparkles"></i> تحديث صيف 2026';
      hero.insertBefore(release, hero.firstElementChild);

      const wrap = document.createElement('div');
      wrap.className = 'search-wrap';
      wrap.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i><input id="toolSearch" class="tool-search" type="search" placeholder="ابحث عن أداة أو مهمة…" autocomplete="off" aria-label="البحث في الأدوات">';
      hero.appendChild(wrap);
    }

    const grid = document.querySelector('.grid.grid-cols-1');
    const cards = grid ? [...grid.querySelectorAll(':scope > a[href$=".html"]')] : [];
    if (grid && cards.length) {
      cards.forEach(card => {
        card.dataset.search = card.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
        card.addEventListener('click', () => localStorage.setItem('swLastTool', card.getAttribute('href') || ''));
      });
      const empty = document.createElement('div');
      empty.className = 'empty-tools md:col-span-2 lg:col-span-3';
      empty.innerHTML = '<i class="fa-regular fa-face-frown-open" style="font-size:28px;margin-bottom:10px;display:block"></i>ما لقينا أداة بهذا الاسم';
      grid.appendChild(empty);
      document.getElementById('toolSearch')?.addEventListener('input', event => {
        const q = event.target.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(card => {
          const show = !q || card.dataset.search.includes(q);
          card.classList.toggle('tool-card-hidden', !show);
          if (show) visible++;
        });
        empty.style.display = visible ? 'none' : 'block';
      });
    }
  }

  // Persistent field drafts. File inputs, secrets and generated output are intentionally excluded.
  const draftKey = `sw:draft:${page || 'index'}`;
  const fields = [...document.querySelectorAll('input[id]:not([type="file"]):not([type="password"]), textarea[id], select[id]')]
    .filter(el => !/search|upload|file/i.test(el.id));
  const restoreDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || '{}');
      fields.forEach(el => {
        if (!(el.id in draft)) return;
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = Boolean(draft[el.id]);
        else el.value = draft[el.id];
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } catch (_) { /* Ignore damaged drafts instead of blocking the tool. */ }
  };
  const state = document.createElement('div');
  state.className = 'sw-save-state';
  state.innerHTML = '<i class="fa-solid fa-cloud-check"></i><span>تم حفظ المسودة محليًا</span>';
  document.body.appendChild(state);
  let draftTimer;
  const saveDraft = () => {
    const draft = {};
    fields.forEach(el => { draft[el.id] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value; });
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      state.classList.add('show');
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => state.classList.remove('show'), 1800);
    } catch (_) { /* Storage may be unavailable or full. */ }
  };
  fields.forEach(el => {
    el.addEventListener('input', () => { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 450); });
    el.addEventListener('change', saveDraft);
  });
  setTimeout(restoreDraft, 0);

  // Safer file handling across every tool.
  document.addEventListener('change', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file' || !input.files?.length) return;
    const oversized = [...input.files].find(file => file.size > 25 * 1024 * 1024);
    if (oversized) {
      input.value = '';
      alert(`الملف «${oversized.name}» أكبر من الحد المسموح (25MB).`);
    }
  }, true);

  // Command center: navigation, tool actions, backup and keyboard access.
  const overlay = document.createElement('div');
  overlay.className = 'sw-power';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'مركز الأوامر');
  overlay.innerHTML = '<div class="sw-power-card"><div class="sw-power-head"><i class="fa-solid fa-command"></i><input class="sw-power-search" placeholder="ابحث عن أمر أو أداة…" aria-label="بحث الأوامر"><span class="sw-key">ESC</span></div><div class="sw-power-body"></div></div>';
  document.body.appendChild(overlay);
  const trigger = document.createElement('button');
  trigger.className = 'sw-power-trigger';
  trigger.title = 'مركز الأوامر (⌘K)';
  trigger.setAttribute('aria-label', 'فتح مركز الأوامر');
  trigger.innerHTML = '<i class="fa-solid fa-bolt"></i>';
  const headerActions = header?.querySelector('.controls-container') || header?.querySelector(':scope > div > div:last-child') || header?.lastElementChild;
  if (headerActions) { trigger.classList.add('in-header'); headerActions.prepend(trigger); }
  else document.body.appendChild(trigger);
  const powerSearch = overlay.querySelector('.sw-power-search');
  const powerBody = overlay.querySelector('.sw-power-body');

  const tools = [
    ['لوحة الأدوات','كل الأدوات في مكان واحد','./index.html','fa-grid-2'],
    ['تركيب الإطارات','صور فردية ومجموعات','./framing-tool.html','fa-images'],
    ['صانع الكوبونات','كوبونات وبيانات Excel','./coupon-tool.html','fa-ticket'],
    ['عروض الأسعار','إنشاء وحفظ عروض رسمية','./Quotation Generator.html','fa-file-invoice-dollar'],
    ['استوديو التصميم','تصميم حر وقوالب','./n_icons.html','fa-pen-nib'],
    ['قوالب الشراكات','تركيب شعارات الشركاء','./logo-framer-tool.html','fa-handshake']
  ];
  const actionCandidates = [
    ['حفظ العمل','حفظ أو تنزيل المشروع الحالي','fa-floppy-disk', /save|حفظ/i],
    ['تصدير النتيجة','تصدير أو تحميل المخرج الحالي','fa-download', /export|download|تصدير|تحميل/i],
    ['تراجع','الرجوع عن آخر تعديل','fa-rotate-left', /undo|تراجع/i],
    ['إعادة','إعادة آخر تعديل','fa-rotate-right', /redo|إعادة/i],
    ['تبديل المظهر','التبديل بين الوضع الفاتح والداكن','fa-circle-half-stroke', /theme|المظهر/i]
  ];
  const visible = el => el && !el.disabled && el.offsetParent !== null;
  const findAction = pattern => [...document.querySelectorAll('button,a')].find(el => visible(el) && pattern.test(`${el.id} ${el.title} ${el.textContent}`));
  const backup = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('sw') || key?.startsWith('sweater')) data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `sweater-workspace-${new Date().toISOString().slice(0,10)}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const commands = () => [
    ...tools.map(([title,desc,href,icon]) => ({ section:'الأدوات',title,desc,icon,run:() => location.href=href })),
    ...actionCandidates.map(([title,desc,icon,pattern]) => ({ section:'إجراءات الصفحة',title,desc,icon,element:findAction(pattern),run(){ this.element?.click(); } })).filter(x => x.element),
    { section:'مساحة العمل',title:'نسخة احتياطية',desc:'تنزيل الإعدادات والمشاريع المحلية كملف JSON',icon:'fa-box-archive',run:backup },
    { section:'مساحة العمل',title:'مسح مسودة هذه الصفحة',desc:'إعادة حقول الصفحة لقيمها الأصلية عند التحديث',icon:'fa-eraser',run:() => { localStorage.removeItem(draftKey); location.reload(); } }
  ];
  let filtered = [];
  const renderCommands = query => {
    const q = query.trim().toLowerCase();
    filtered = commands().filter(c => !q || `${c.title} ${c.desc} ${c.section}`.toLowerCase().includes(q));
    if (!filtered.length) { powerBody.innerHTML = '<div class="sw-command-empty">لا توجد نتائج مطابقة</div>'; return; }
    let section = '';
    powerBody.innerHTML = filtered.map((c,i) => `${section !== c.section ? `<div class="sw-command-section">${section = c.section}</div>` : ''}<button class="sw-command${i===0?' active':''}" data-command="${i}"><span class="sw-command-icon"><i class="fa-solid ${c.icon}"></i></span><span class="sw-command-copy"><span class="sw-command-title">${c.title}</span><span class="sw-command-desc">${c.desc}</span></span></button>`).join('');
    powerBody.querySelectorAll('[data-command]').forEach(btn => btn.addEventListener('click', () => { filtered[Number(btn.dataset.command)].run(); closePower(); }));
  };
  const openPower = () => { renderCommands(''); overlay.classList.add('open'); powerSearch.value=''; setTimeout(() => powerSearch.focus(), 0); };
  const closePower = () => overlay.classList.remove('open');
  trigger.addEventListener('click', openPower);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePower(); });
  powerSearch.addEventListener('input', () => renderCommands(powerSearch.value));
  powerSearch.addEventListener('keydown', e => { if (e.key === 'Enter' && filtered[0]) { filtered[0].run(); closePower(); } });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('open') ? closePower() : openPower(); }
    if (e.key === 'Escape' && overlay.classList.contains('open')) closePower();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && !e.target.matches('input,textarea,[contenteditable="true"]')) { const action = findAction(/save|حفظ/i); if (action) { e.preventDefault(); action.click(); } }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e' && !e.target.matches('input,textarea,[contenteditable="true"]')) { const action = findAction(/export|download|تصدير|تحميل/i); if (action) { e.preventDefault(); action.click(); } }
  });

  // Drop feedback for pages that already support file uploads.
  if (document.querySelector('input[type="file"]')) {
    let dragDepth = 0;
    document.addEventListener('dragenter', e => { if ([...e.dataTransfer?.types || []].includes('Files')) { dragDepth++; document.body.classList.add('sw-drop-active'); } });
    document.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth=0; document.body.classList.remove('sw-drop-active'); } });
    document.addEventListener('drop', () => { dragDepth=0; document.body.classList.remove('sw-drop-active'); });
  }

  // Ensure icon-only controls remain understandable to screen readers and tooltips.
  const iconLabels = [['fa-trash-can','حذف'],['fa-trash','حذف'],['fa-xmark','إغلاق'],['fa-rotate-left','تراجع'],['fa-rotate-right','إعادة'],['fa-arrow-up','رفع الطبقة'],['fa-arrow-down','خفض الطبقة'],['fa-lock','قفل العنصر'],['fa-align-left','محاذاة لليسار'],['fa-align-center','توسيط'],['fa-align-right','محاذاة لليمين']];
  const labelIconButtons = root => root.querySelectorAll?.('button').forEach(button => {
    if (button.getAttribute('aria-label') || button.title || button.textContent.trim()) return;
    const hit = iconLabels.find(([className]) => button.querySelector(`.${className}`));
    button.setAttribute('aria-label', hit?.[1] || 'إجراء');
    button.title = hit?.[1] || 'إجراء';
  });
  labelIconButtons(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === 1) labelIconButtons(node.matches?.('button') ? node.parentElement : node);
  }))).observe(document.body, { childList:true, subtree:true });
})();
