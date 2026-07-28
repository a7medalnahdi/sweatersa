(() => {
  'use strict';
  const STORAGE='sweaterAdminConfigV1';
  const defaults={
    version:2,
    content:{
      heroTitle:'أدواتك في منصة واحدة متكاملة',
      heroDescription:'مجموعة أدوات مبنية خصيصاً لفريق SWEATER. صُممت لتسريع سير العمل اليومي، أتمتة المهام المتكررة، وضمان أعلى جودة في المخرجات.',
      toolsTitle:'أدوات العمل',
      referencesTitle:'مراجع الشركة',
      numbersTitle:'أرقام تكبر معنا كل يوم'
    },
    tools:[
      {id:'framing',href:'./framing-tool.html',name:'أداة تركيب الإطارات',description:'ارفع صورك وأضف إطاراً من اختيارك، مع دعم التصدير الفردي أو الجماعي دفعةً واحدة.',image:'https://i.ibb.co/FbHvLZwd/444.png',enabled:true},
      {id:'coupons',href:'./coupon-tool.html',name:'أداة تصدير الكوبونات',description:'صمّم كوبونات الخصم، واستورد ملف Excel لإنتاج مئات الكوبونات دفعة واحدة.',image:'https://i.ibb.co/jPLhFFf5/333.png',enabled:true},
      {id:'quotes',href:'./Quotation Generator.html',name:'مولّد عروض الأسعار',description:'أنشئ عروض أسعار احترافية واحفظها وصدّرها كملفات PDF رسمية.',image:'https://i.ibb.co/k20tnLpN/112.png',enabled:true},
      {id:'design',href:'./n_icons.html',name:'استوديو التصميم',description:'استوديو متكامل لإنشاء التصاميم وإدارة النصوص والصور والطبقات.',image:'https://i.ibb.co/F4J0bMRW/image.png',enabled:true},
      {id:'partners',href:'./logo-framer-tool.html',name:'قوالب الشراكات',description:'ركّب شعارات الشركاء على القوالب المعتمدة وصدّرها بأعلى جودة.',image:'https://i.ibb.co/nMRr1xgn/image.png',enabled:true}
    ],
    stats:[
      {id:'washes',value:'3M',label:'غسلة'},
      {id:'customers',value:'600K',label:'عميل'},
      {id:'cities',value:'12',label:'مدينة'},
      {id:'satisfaction',value:'96%',label:'رضا العملاء'},
      {id:'partners',value:'500',label:'شراكة'}
    ],
    employees:[],
    templates:[
      {id:'builtin-design-orange',name:'منشور جريء',tool:'design',category:'منشورات',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'orange'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1080'},
      {id:'builtin-design-clean',name:'عرض خدمات',tool:'design',category:'عروض',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'clean'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1080'},
      {id:'builtin-design-dark',name:'رسالة ملهمة',tool:'design',category:'منشورات',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'dark'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1080'},
      {id:'builtin-design-story',name:'قصة عمودية',tool:'design',category:'قصص',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'story'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1920'},
      {id:'builtin-partners-modern',name:'قالب شراكة عصري',tool:'partners',category:'شراكات',status:'active',source:'built-in',preview:'https://i.ibb.co/nqcpnVM4/Artboard-2.png',payload:{src:'https://i.ibb.co/nqcpnVM4/Artboard-2.png',x:50,y:50,size:30},notes:'قالب الشراكات الحالي'},
      {id:'builtin-partners-minimal',name:'قالب شراكة بسيط',tool:'partners',category:'شراكات',status:'active',source:'built-in',preview:'https://i.ibb.co/gL64tpnH/Artboard-3.png',payload:{src:'https://i.ibb.co/gL64tpnH/Artboard-3.png',x:50,y:35,size:25},notes:'قالب الشراكات الحالي'},
      {id:'builtin-partners-future',name:'قالب شراكة مستقبلي',tool:'partners',category:'شراكات',status:'active',source:'built-in',preview:'https://i.ibb.co/Df4Z9Khx/LINK-30-7.png',payload:{src:'https://i.ibb.co/Df4Z9Khx/LINK-30-7.png',x:50,y:70,size:35},notes:'قالب الشراكات الحالي'}
    ],
    settings:{siteName:'SWEATER Workspace',supportEmail:'Business@sweater.sa',maintenance:false}
  };
  const clone=v=>JSON.parse(JSON.stringify(v));
  const merge=(base,value)=>({...clone(base),...(value||{}),version:base.version,content:{...base.content,...(value?.content||{})},settings:{...base.settings,...(value?.settings||{})},tools:Array.isArray(value?.tools)?value.tools:clone(base.tools),stats:Array.isArray(value?.stats)?value.stats:clone(base.stats),employees:Array.isArray(value?.employees)?value.employees:[],templates:Array.isArray(value?.templates)?value.templates:clone(base.templates)});
  const load=()=>{try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');const data=merge(defaults,raw);if(raw&&Number(raw.version||1)<2){const existing=new Set(data.templates.map(t=>t.id));defaults.templates.forEach(t=>{if(!existing.has(t.id))data.templates.push(clone(t))});data.version=2;localStorage.setItem(STORAGE,JSON.stringify(data))}return data}catch(_){return clone(defaults)}};
  const save=data=>{const saved=merge(defaults,data);localStorage.setItem(STORAGE,JSON.stringify(saved));window.dispatchEvent(new CustomEvent('sweater:config-updated',{detail:saved}));return saved};
  const escape=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const page=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
  const toolId={'framing-tool.html':'framing','coupon-tool.html':'coupons','Quotation Generator.html':'quotes','n_icons.html':'design','logo-framer-tool.html':'partners'}[page];
  const adapters={};
  window.SweaterAdmin={
    defaults:clone(defaults),
    load,
    save,
    reset:()=>{localStorage.removeItem(STORAGE);location.reload()},
    getTemplates:id=>load().templates.filter(t=>t.tool===id&&t.status!=='archived'),
    registerTemplateAdapter:(id,fn)=>{adapters[id]=fn}
  };
  function applyHome(){
    if(page!=='index.html'&&page!=='')return;
    const data=load();
    const h1=document.querySelector('main section h1');
    const heroP=h1?.parentElement?.querySelector('p');
    if(h1&&data.content.heroTitle)h1.textContent=data.content.heroTitle;
    if(heroP&&data.content.heroDescription)heroP.textContent=data.content.heroDescription;
    const sections=[...document.querySelectorAll('main section')];
    const toolsSection=sections.find(s=>s.querySelector('a[href="./framing-tool.html"]'));
    const toolsHeading=toolsSection?.querySelector('h2');
    if(toolsHeading){const icon=toolsHeading.querySelector('i')?.outerHTML||'';toolsHeading.innerHTML=`${icon}${escape(data.content.toolsTitle)}`}
    const refs=document.querySelector('#company-references h2');if(refs)refs.textContent=data.content.referencesTitle;
    const nums=document.querySelector('#company-numbers h2');if(nums)nums.textContent=data.content.numbersTitle;
    data.tools.forEach(tool=>{
      const card=document.querySelector(`a[href="${tool.href}"]`);if(!card)return;
      card.style.display=tool.enabled===false?'none':'';
      const title=card.querySelector('h3'),desc=card.querySelector('p'),visual=card.querySelector('.bg-cover');
      if(title)title.textContent=tool.name;if(desc)desc.textContent=tool.description;
      if(visual&&tool.image)visual.style.backgroundImage=`url("${String(tool.image).replace(/"/g,'%22')}")`;
    });
    const statCards=[...document.querySelectorAll('#company-numbers .stat-card')];
    data.stats.forEach((stat,index)=>{const card=statCards[index];if(!card)return;const strong=card.querySelector('strong'),span=card.querySelector('span');if(strong)strong.textContent=stat.value;if(span)span.textContent=stat.label});
  }
  function templateModal(){
    if(!toolId||page==='index.html')return;
    const list=window.SweaterAdmin.getTemplates(toolId);if(!list.length)return;
    const header=document.querySelector('header,.top-bar');const actions=header?.querySelector('.controls-container')||header?.lastElementChild;if(!actions)return;
    const btn=document.createElement('button');btn.className='sw-admin-templates-btn';btn.innerHTML=`<i class="fa-solid fa-boxes-stacked"></i><span>قوالب الإدارة</span><b>${list.length}</b>`;actions.prepend(btn);
    const modal=document.createElement('div');modal.className='sw-admin-templates-modal';modal.innerHTML=`<div class="sw-admin-template-card"><header><div><strong>قوالب ${escape(load().tools.find(t=>t.id===toolId)?.name||'الأداة')}</strong><span>قوالب أضافها مدير النظام</span></div><button aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button></header><div class="sw-admin-template-grid">${list.map(t=>`<article><div class="sw-admin-template-preview">${t.preview?`<img src="${escape(t.preview)}" alt="">`:'<i class="fa-solid fa-layer-group"></i>'}</div><div><strong>${escape(t.name)}</strong><span>${escape(t.category||'عام')}</span></div><button data-admin-template="${escape(t.id)}">استخدام القالب</button></article>`).join('')}</div></div>`;document.body.append(modal);
    btn.onclick=()=>modal.classList.add('open');modal.querySelector('header button').onclick=()=>modal.classList.remove('open');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open')};
    modal.querySelectorAll('[data-admin-template]').forEach(button=>button.onclick=()=>{const template=list.find(t=>t.id===button.dataset.adminTemplate);if(!template)return;localStorage.setItem('sweaterPendingAdminTemplate',JSON.stringify(template));if(adapters[toolId])adapters[toolId](template);else window.dispatchEvent(new CustomEvent('sweater:apply-admin-template',{detail:template}));modal.classList.remove('open');const notice=document.createElement('div');notice.className='sw-admin-template-notice';notice.textContent=`تم تجهيز قالب «${template.name}» للأداة`;document.body.append(notice);setTimeout(()=>notice.classList.add('show'),10);setTimeout(()=>notice.remove(),2600)});
  }
  const styles=document.createElement('style');styles.textContent=`
    .sw-admin-templates-btn{height:40px;padding:0 12px;border:1px solid #fed7aa;border-radius:11px;background:#fff7ed;color:#c2410c;display:flex;align-items:center;gap:7px;font:800 10px LamaSans,Cairo,sans-serif}.sw-admin-templates-btn b{min-width:18px;height:18px;display:grid;place-items:center;border-radius:99px;background:#f96714;color:#fff;font-size:8px}.sw-admin-templates-modal{position:fixed;inset:0;z-index:10000;display:none;place-items:center;padding:18px;background:rgba(2,6,23,.58);backdrop-filter:blur(8px);direction:rtl}.sw-admin-templates-modal.open{display:grid}.sw-admin-template-card{width:min(760px,100%);max-height:82vh;overflow:auto;border-radius:22px;background:#fff;box-shadow:0 30px 90px rgba(2,6,23,.3);color:#172033}.sw-admin-template-card>header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #e5e7eb}.sw-admin-template-card header strong{display:block;font-size:14px}.sw-admin-template-card header span{display:block;margin-top:3px;color:#94a3b8;font-size:9px}.sw-admin-template-card header button{width:34px;height:34px;border:0;border-radius:9px;background:#f1f5f9;color:#64748b}.sw-admin-template-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px}.sw-admin-template-grid article{border:1px solid #e5e7eb;border-radius:15px;overflow:hidden;background:#fff}.sw-admin-template-preview{height:120px;display:grid;place-items:center;background:#f8fafc;color:#f96714;font-size:28px}.sw-admin-template-preview img{width:100%;height:100%;object-fit:cover}.sw-admin-template-grid article>div:nth-child(2){padding:10px 11px}.sw-admin-template-grid article strong{display:block;font-size:10px}.sw-admin-template-grid article span{font-size:8px;color:#94a3b8}.sw-admin-template-grid article>button{width:calc(100% - 20px);height:34px;margin:0 10px 10px;border:0;border-radius:9px;background:#f96714;color:#fff;font-size:9px;font-weight:800}.sw-admin-template-notice{position:fixed;left:18px;bottom:18px;z-index:11000;padding:12px 15px;border-radius:11px;background:#111827;color:#fff;font:800 10px LamaSans,Cairo,sans-serif;opacity:0;transform:translateY(10px);transition:.2s}.sw-admin-template-notice.show{opacity:1;transform:none}@media(max-width:650px){.sw-admin-template-grid{grid-template-columns:1fr 1fr}.sw-admin-templates-btn span{display:none}}`;document.head.append(styles);
  applyHome();templateModal();window.addEventListener('sweater:config-updated',applyHome);
})();
