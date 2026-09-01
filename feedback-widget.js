(() => {
  'use strict';
  if (window.__sweaterFeedbackWidget || !window.SweaterCloud) return;
  window.__sweaterFeedbackWidget = true;

  const style = document.createElement('style');
  style.textContent = `
    .sw-feedback{position:fixed;left:22px;bottom:22px;z-index:2147483000;font-family:LamaSans,"Tajawal",Arial,sans-serif;direction:rtl}
    .sw-feedback *{box-sizing:border-box}
    .sw-feedback-trigger{height:52px;padding:0 17px;border:0;border-radius:17px;background:#f96714;color:#fff;display:flex;align-items:center;gap:9px;font:800 14px inherit;box-shadow:0 10px 28px rgba(249,103,20,.26);cursor:pointer;transition:.2s transform,.2s box-shadow}
    .sw-feedback-trigger:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(249,103,20,.32)}
    .sw-feedback-trigger svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .sw-feedback-panel{position:absolute;left:0;bottom:64px;width:min(360px,calc(100vw - 30px));padding:20px;border:1px solid #ece7e3;border-radius:22px;background:#fff;box-shadow:0 22px 60px rgba(18,18,18,.16);opacity:0;visibility:hidden;transform:translateY(10px) scale(.98);transform-origin:bottom left;transition:.2s}
    .sw-feedback.open .sw-feedback-panel{opacity:1;visibility:visible;transform:none}
    .sw-feedback-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:15px}
    .sw-feedback-head strong{display:block;color:#121212;font-size:18px;line-height:1.4}.sw-feedback-head span{display:block;margin-top:3px;color:#707070;font-size:12px;line-height:1.6}
    .sw-feedback-close{width:34px;height:34px;flex:0 0 auto;border:0;border-radius:10px;background:#f6f4f2;color:#121212;font-size:20px;cursor:pointer}
    .sw-feedback textarea{display:block;width:100%;height:116px;resize:vertical;padding:13px 14px;border:1px solid #ddd7d2;border-radius:14px;outline:none;background:#fff;color:#121212;font:500 14px/1.7 inherit;transition:.2s border-color,.2s box-shadow}
    .sw-feedback textarea:focus{border-color:#f96714;box-shadow:0 0 0 3px rgba(249,103,20,.11)}
    .sw-feedback-meta{min-height:20px;margin:8px 2px 10px;color:#777;font-size:11px;line-height:1.6}.sw-feedback-meta.error{color:#b42318}.sw-feedback-meta.success{color:#087443}
    .sw-feedback-send{width:100%;height:46px;border:0;border-radius:13px;background:#f96714;color:#fff;font:900 14px inherit;cursor:pointer}.sw-feedback-send:disabled{opacity:.55;cursor:wait}
    @media(max-width:640px){.sw-feedback{left:14px;bottom:84px}.sw-feedback-trigger{width:50px;height:50px;padding:0;justify-content:center;border-radius:16px}.sw-feedback-trigger span{display:none}.sw-feedback-panel{bottom:60px}.sw-feedback-head strong{font-size:17px}}
  `;
  document.head.append(style);

  const root = document.createElement('div');
  root.className = 'sw-feedback';
  root.innerHTML = `
    <section class="sw-feedback-panel" role="dialog" aria-modal="false" aria-label="إرسال ملاحظة">
      <div class="sw-feedback-head"><div><strong>عندك ملاحظة؟</strong><span>اكتبها هنا وستصل مباشرة إلى الإدارة.</span></div><button class="sw-feedback-close" type="button" aria-label="إغلاق">×</button></div>
      <form><textarea maxlength="2000" placeholder="اكتب ملاحظتك أو اقتراحك..." required></textarea><div class="sw-feedback-meta">سيتم إرفاق اسمك والصفحة الحالية تلقائيًا.</div><button class="sw-feedback-send" type="submit">إرسال الملاحظة</button></form>
    </section>
    <button class="sw-feedback-trigger" type="button" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/></svg><span>عندك ملاحظة؟</span></button>`;

  const trigger = root.querySelector('.sw-feedback-trigger');
  const close = root.querySelector('.sw-feedback-close');
  const form = root.querySelector('form');
  const textarea = root.querySelector('textarea');
  const meta = root.querySelector('.sw-feedback-meta');
  const send = root.querySelector('.sw-feedback-send');
  const setOpen = value => {
    root.classList.toggle('open', value);
    trigger.setAttribute('aria-expanded', String(value));
    if (value) setTimeout(() => textarea.focus(), 80);
  };
  trigger.onclick = () => setOpen(!root.classList.contains('open'));
  close.onclick = () => setOpen(false);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });

  form.onsubmit = async event => {
    event.preventDefault();
    const message = textarea.value.trim();
    if (message.length < 3) {
      meta.className = 'sw-feedback-meta error';
      meta.textContent = 'اكتب ملاحظة واضحة قبل الإرسال.';
      return;
    }
    send.disabled = true;
    send.textContent = 'جارٍ الإرسال...';
    meta.className = 'sw-feedback-meta';
    meta.textContent = 'يتم إرسال الملاحظة إلى الإدارة.';
    try {
      const auth = await window.SweaterAuthReady;
      if (!auth?.id) throw new Error('يلزم تسجيل الدخول');
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const page = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
      const { error } = await window.SweaterCloud.client.from('site_feedback').insert({
        id,
        message,
        user_id: auth.id,
        user_name: auth.name || auth.full_name || auth.username || 'موظف',
        user_email: auth.email || '',
        department: auth.department || '',
        page,
        page_url: location.href.slice(0, 500),
        status: 'new',
        created_at: now,
        updated_at: now
      });
      if (error) throw error;
      textarea.value = '';
      meta.className = 'sw-feedback-meta success';
      meta.textContent = 'وصلت ملاحظتك إلى الإدارة، شكرًا لك.';
      send.textContent = 'تم الإرسال ✓';
      setTimeout(() => { setOpen(false); meta.className = 'sw-feedback-meta'; meta.textContent = 'سيتم إرفاق اسمك والصفحة الحالية تلقائيًا.'; send.textContent = 'إرسال الملاحظة'; }, 1500);
    } catch (error) {
      console.error('Feedback submission failed', error);
      meta.className = 'sw-feedback-meta error';
      meta.textContent = 'تعذر الإرسال الآن. تأكد من الاتصال ثم حاول مرة أخرى.';
      send.textContent = 'إعادة المحاولة';
    } finally {
      send.disabled = false;
    }
  };

  Promise.all([window.SweaterCloudReady, window.SweaterAuthReady]).then(([, auth]) => {
    if (auth?.id) document.body.append(root);
  }).catch(() => {});
})();
