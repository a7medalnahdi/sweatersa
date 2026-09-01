(() => {
  'use strict';

  const STORAGE='sweaterAdminConfigV2';
  const ROW_ID='global';
  const BUCKET='site-assets';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const defaults={
    version:9,
    content:{
      heroTitle:'أدواتك في منصة واحدة متكاملة',
      heroDescription:'مجموعة أدوات مبنية خصيصاً لفريق SWEATER. صُممت لتسريع سير العمل اليومي، أتمتة المهام المتكررة، وضمان أعلى جودة في المخرجات.',
      toolsTitle:'أدوات العمل',
      referencesTitle:'مراجع الشركة',
      numbersTitle:'أرقام تكبر معنا كل يوم'
    },
    references:[
      {id:'company-profile',name:'الملف التعريفي',description:'نبذة الشركة، الخدمات، الانتشار وأبرز الإنجازات.',url:'',icon:'fa-building',enabled:true},
      {id:'visual-identity',name:'الهوية البصرية',description:'الألوان، الخطوط، أسلوب الصور وقواعد الاستخدام.',url:'',icon:'fa-swatchbook',enabled:true},
      {id:'logo-library',name:'الشعار',description:'نسخ الشعار المعتمدة للاستخدام الرقمي والمطبوع.',url:'',icon:'fa-signature',enabled:true},
      {id:'photo-library',name:'مكتبة الصور',description:'صور الخدمات، الفرق، السيارات والحملات المعتمدة.',url:'',icon:'fa-images',enabled:true}
    ],
    banners:[
      {id:'home-hero',name:'بنر الصفحة الرئيسية',image:'',alt:'بنر سويتر',enabled:false}
    ],
    tools:[
      {id:'framing',href:'./framing-tool.html',name:'أداة تركيب الإطارات',description:'ارفع صورك وأضف إطاراً من اختيارك، مع دعم التصدير الفردي أو الجماعي دفعةً واحدة.',image:'https://i.ibb.co/FbHvLZwd/444.png',enabled:true},
      {id:'coupons',href:'./coupon-tool.html',name:'أداة تصدير الكوبونات',description:'صمّم كوبونات الخصم، واستورد ملف Excel لإنتاج مئات الكوبونات دفعة واحدة.',image:'https://i.ibb.co/jPLhFFf5/333.png',enabled:true},
      {id:'quotes',href:'./Quotation Generator.html',name:'مولّد عروض الأسعار',description:'أنشئ عروض أسعار احترافية واحفظها وصدّرها كملفات PDF رسمية.',image:'https://i.ibb.co/k20tnLpN/112.png',enabled:true},
      {id:'design',href:'./n_icons.html',name:'استوديو التصميم',description:'استوديو متكامل لإنشاء التصاميم وإدارة النصوص والصور والطبقات.',image:'https://i.ibb.co/F4J0bMRW/image.png',enabled:true},
      {id:'partners',href:'./logo-framer-tool.html',name:'قوالب الشراكات',description:'ركّب شعارات الشركاء على القوالب المعتمدة وصدّرها بأعلى جودة.',image:'https://i.ibb.co/nMRr1xgn/image.png',enabled:true}
      ,{id:'qrcode',href:'./qr-generator.html',name:'صانع QR Code',description:'أنشئ رموز QR للروابط والنصوص وواتساب والبريد وشبكات Wi‑Fi مع تخصيص كامل.',image:'./assets/qr-tool-card.svg',enabled:true}
      ,{id:'document-logo',href:'./document-logo-tool.html',name:'ختم الملفات بالشعار',description:'أضف شعاراً إلى جميع صفحات PDF أو شرائح PowerPoint وصدّر الملف كاملاً.',image:'./assets/document-logo-tool.svg',enabled:true}
      ,{id:'package-cards',href:'./package-card-tool.html',name:'صانع كروت الباقات',description:'عدّل أسماء الباقات والأسعار والصلاحية وصدّر الكرت بالعربية أو الإنجليزية.',image:'./assets/package-card-tool.svg',enabled:true}
      ,{id:'employee-cards',href:'./employee-card-tool.html',name:'إصدار كروت الموظفين',description:'أنشئ بطاقة الموظف الرسمية بوجهين، وعدّل الصورة والبيانات ثم صدّرها بجودة عالية.',image:'./assets/employee-card-tool.svg',enabled:true}
      ,{id:'top50',href:'./top50-tool.html',name:'صانع تصاميم أفضل 50',description:'استورد بيانات الفائزين من Excel وأنتج صفحات أفضل 50 مع صور المراكز الثلاثة الأولى.',image:'./assets/top50-tool.svg',enabled:true}
      ,{id:'content-writer',href:'./content-writer.html',name:'كاتب المحتوى',description:'مساعد ذكي يكتب محتوى سويتر ويحفظ محادثات كل موظف في حسابه.',image:'./assets/content-writer.svg',enabled:true}
      ,{id:'bilingual-pdf',href:'./bilingual-pdf-tool.html?v=26',name:'بوابة الملفات ثنائية اللغة',description:'ارفع نسختين عربية وإنجليزية وانشرهما في رابط عام واحد قابل للتحديث.',image:'./assets/bilingual-pdf-tool.svg',enabled:true,adminOnly:true}
      ,{id:'html-pages',href:'./html-editor-tool.html',name:'مستعرض صفحات HTML',description:'أنشئ صفحات HTML داخلية واحفظها أو انشرها بروابط مستقلة.',image:'./assets/html-pages-tool.svg',enabled:true,adminOnly:true}
      ,{id:'affiliate-codes',href:'./affiliate-code-tool.html',name:'أكواد المسوّقين',description:'أنشئ قوالب أكواد التسويق بالعمولة.',image:'./assets/affiliate/marketing-code-template.png',enabled:true}
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
      {id:'builtin-framing-1',name:'الإطار الأول',tool:'framing',category:'إطارات',status:'active',source:'built-in',preview:'https://i.ibb.co/1tGQgpK7/11.png',payload:{src:'https://i.ibb.co/1tGQgpK7/11.png'},notes:'إطار أفقي معتمد'},
      {id:'builtin-framing-2',name:'الإطار الثاني',tool:'framing',category:'إطارات',status:'active',source:'built-in',preview:'https://i.ibb.co/4n5D2hJt/22.png',payload:{src:'https://i.ibb.co/4n5D2hJt/22.png'},notes:'إطار أفقي معتمد'},
      {id:'builtin-coupon-l1',name:'كوبون أفقي 1',tool:'coupons',category:'أفقي',status:'active',source:'built-in',preview:'https://i.ibb.co/MkCmHfJT/fdsfsd.png',payload:{url:'https://i.ibb.co/MkCmHfJT/fdsfsd.png',orientation:'landscape'},notes:'قالب كوبون أفقي معتمد'},
      {id:'builtin-coupon-l2',name:'كوبون أفقي 2',tool:'coupons',category:'أفقي',status:'active',source:'built-in',preview:'https://i.ibb.co/Xz9tGxB/c1.png',payload:{url:'https://i.ibb.co/Xz9tGxB/c1.png',orientation:'landscape'},notes:'قالب كوبون أفقي معتمد'},
      {id:'builtin-coupon-l3',name:'كوبون أفقي 3',tool:'coupons',category:'أفقي',status:'active',source:'built-in',preview:'https://i.ibb.co/7jXkH2B/c2.png',payload:{url:'https://i.ibb.co/7jXkH2B/c2.png',orientation:'landscape'},notes:'قالب كوبون أفقي معتمد'},
      {id:'builtin-coupon-p1',name:'كوبون عمودي 1',tool:'coupons',category:'عمودي',status:'active',source:'built-in',preview:'https://i.ibb.co/Hpx5QBBq/Artboard-1.png',payload:{url:'https://i.ibb.co/Hpx5QBBq/Artboard-1.png',orientation:'portrait'},notes:'قالب كوبون عمودي معتمد'},
      {id:'builtin-coupon-p2',name:'كوبون عمودي 2',tool:'coupons',category:'عمودي',status:'active',source:'built-in',preview:'https://i.ibb.co/dG0G2pB/coupon-bg-1.png',payload:{url:'https://i.ibb.co/dG0G2pB/coupon-bg-1.png',orientation:'portrait'},notes:'قالب كوبون عمودي معتمد'},
      {id:'builtin-coupon-p3',name:'كوبون عمودي 3',tool:'coupons',category:'عمودي',status:'active',source:'built-in',preview:'https://i.ibb.co/Hpx5QBBq/Artboard-1.png',payload:{url:'https://i.ibb.co/Hpx5QBBq/Artboard-1.png',orientation:'portrait'},notes:'القالب الاحتياطي العمودي الموجود في الأداة'},
      {id:'builtin-design-orange',name:'منشور جريء',tool:'design',category:'منشورات',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'orange'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1080'},
      {id:'builtin-design-clean',name:'عرض خدمات',tool:'design',category:'عروض',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'clean'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1080'},
      {id:'builtin-design-dark',name:'رسالة ملهمة',tool:'design',category:'منشورات',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'dark'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1080'},
      {id:'builtin-design-story',name:'قصة عمودية',tool:'design',category:'قصص',status:'active',source:'built-in',preview:'',payload:{builtInTemplate:'story'},notes:'القالب الأساسي الموجود في استوديو التصميم — 1080 × 1920'},
      {id:'builtin-partners-modern',name:'قالب شراكة عصري',tool:'partners',category:'شراكات',status:'active',source:'built-in',preview:'https://i.ibb.co/nqcpnVM4/Artboard-2.png',payload:{src:'https://i.ibb.co/nqcpnVM4/Artboard-2.png',x:50,y:50,size:30},notes:'قالب الشراكات الحالي'},
      {id:'builtin-partners-minimal',name:'قالب شراكة بسيط',tool:'partners',category:'شراكات',status:'active',source:'built-in',preview:'https://i.ibb.co/gL64tpnH/Artboard-3.png',payload:{src:'https://i.ibb.co/gL64tpnH/Artboard-3.png',x:50,y:35,size:25},notes:'قالب الشراكات الحالي'},
      {id:'builtin-partners-future',name:'قالب شراكة مستقبلي',tool:'partners',category:'شراكات',status:'active',source:'built-in',preview:'https://i.ibb.co/Df4Z9Khx/LINK-30-7.png',payload:{src:'https://i.ibb.co/Df4Z9Khx/LINK-30-7.png',x:50,y:70,size:35},notes:'قالب الشراكات الحالي'}
      ,{id:'builtin-qr-url',name:'رابط موقع',tool:'qrcode',category:'روابط',status:'active',source:'built-in',preview:'./assets/qr-tool-card.svg',payload:{type:'url',fields:{url:'https://sweater.sa'},darkColor:'#111827',lightColor:'#ffffff'},notes:'قالب سريع لإنشاء QR لرابط'}
      ,{id:'builtin-qr-whatsapp',name:'تواصل واتساب',tool:'qrcode',category:'تواصل',status:'active',source:'built-in',preview:'./assets/qr-tool-card.svg',payload:{type:'whatsapp',fields:{phone:'966',message:'مرحباً، أود الاستفسار'}},notes:'قالب واتساب مع رسالة جاهزة'}
      ,{id:'builtin-qr-wifi',name:'شبكة Wi‑Fi',tool:'qrcode',category:'شبكات',status:'active',source:'built-in',preview:'./assets/qr-tool-card.svg',payload:{type:'wifi',fields:{ssid:'SWEATER',security:'WPA',password:'',hidden:false}},notes:'قالب مشاركة بيانات شبكة Wi‑Fi'}
      ,{id:'builtin-document-bottom-left',name:'شعار أسفل اليسار',tool:'document-logo',category:'ختم ملفات',status:'active',source:'built-in',preview:'./assets/document-logo-tool.svg',payload:{x:85,y:85,size:18,opacity:100},notes:'موضع واضح وهادئ لجميع الصفحات والشرائح'}
      ,{id:'builtin-document-top-right',name:'شعار أعلى اليمين',tool:'document-logo',category:'ختم ملفات',status:'active',source:'built-in',preview:'./assets/document-logo-tool.svg',payload:{x:15,y:15,size:15,opacity:90},notes:'موضع رسمي أعلى الصفحة'}
      ,{id:'builtin-package-prime-ar',name:'برايم عربي',tool:'package-cards',category:'باقات',status:'active',source:'built-in',preview:'./assets/package-card-tool.svg',payload:{lang:'ar',packageName:'سويتر برايم',description:'5 غسلات ( داخلي وخارجي ) لسيارتك',validity:'صلاحية شهرين',perWash:'29',oldPrice:'299',newPrice:'145',ctaText:'اشتر الآن'},notes:'قالب كرت PRIME باللغة العربية'}
      ,{id:'builtin-package-prime-en',name:'Prime English',tool:'package-cards',category:'باقات',status:'active',source:'built-in',preview:'./assets/package-card-tool.svg',payload:{lang:'en',packageName:'Sweater Prime',description:'5 (IN&OUT) washes',validity:'Valid for 2 months',perWash:'29',oldPrice:'299',newPrice:'145',ctaText:'Buy Now'},notes:'PRIME package card in English'}
      ,{id:'builtin-employee-standard',name:'بطاقة الموظف الرسمية',tool:'employee-cards',category:'موظفين',status:'active',source:'built-in',preview:'./assets/employee-card-tool.svg',payload:{firstName:'Sultan',lastName:'Alazzam',jobTitle:'Operations Excellence Lead',department:'Operation Department',employeeNo:'1293',qrUrl:'https://sweater.sa'},notes:'قالب بطاقة الموظف الرسمية بوجهين'}
    ],
    settings:{siteName:'SWEATER Workspace',supportEmail:'Business@sweater.sa',maintenance:false}
  };

  const merge=(base,value)=>{
    const templates=Array.isArray(value?.templates)?clone(value.templates):clone(base.templates);
    {
      const known=new Set(templates.map(item=>item.id));
      base.templates.filter(item=>item.source==='built-in').forEach(item=>{if(!known.has(item.id))templates.push(clone(item))});
    }
    const tools=Array.isArray(value?.tools)?clone(value.tools):clone(base.tools);
    {
      const known=new Set(tools.map(item=>item.id));
      base.tools.forEach(item=>{if(!known.has(item.id))tools.push(clone(item))});
    }
    return {
      ...clone(base),...(value||{}),version:base.version,
      content:{...base.content,...(value?.content||{})},
      settings:{...base.settings,...(value?.settings||{})},
      references:Array.isArray(value?.references)?value.references:clone(base.references),
      banners:Array.isArray(value?.banners)?value.banners:clone(base.banners),
      tools,
      stats:Array.isArray(value?.stats)?value.stats:clone(base.stats),
      employees:Array.isArray(value?.employees)?value.employees:[],
      templates
    };
  };
  const cached=()=>{try{return merge(defaults,JSON.parse(localStorage.getItem(STORAGE)||'null'))}catch(_){return clone(defaults)}};
  let current=cached();
  const cache=value=>{
    current=merge(defaults,value);
    try{localStorage.setItem(STORAGE,JSON.stringify(current))}catch(_){}
    window.dispatchEvent(new CustomEvent('sweater:config-updated',{detail:clone(current)}));
    return clone(current);
  };
  const client=window.SweaterCloud?.client;
  const escape=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safeLink=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:''}catch(_){return ''}};
  const page=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
  if(page!=='index.html'){
    document.documentElement.classList.add('sw-unified-ui');
    if(!document.querySelector('link[data-sweater-theme]')){const theme=document.createElement('link');theme.rel='stylesheet';theme.href='./workspace-theme.css?v=1';theme.dataset.sweaterTheme='true';document.head.append(theme)}
    if(!document.querySelector('script[data-sweater-palette]')){const palette=document.createElement('script');palette.src='./brand-palette.js?v=1';palette.dataset.sweaterPalette='true';document.head.append(palette)}
  }
  const toolId={'framing-tool.html':'framing','coupon-tool.html':'coupons','Quotation Generator.html':'quotes','n_icons.html':'design','logo-framer-tool.html':'partners','qr-generator.html':'qrcode','document-logo-tool.html':'document-logo','package-card-tool.html':'package-cards','employee-card-tool.html':'employee-cards','top50-tool.html':'top50','affiliate-code-tool.html':'affiliate-codes','content-writer.html':'content-writer','bilingual-pdf-tool.html':'bilingual-pdf','html-editor-tool.html':'html-pages'}[page];
  const adapters={};
  let authenticatedUser=null,authResolved=false;

  async function loadCloud(){
    if(!client)return current;
    try{
      let {data,error}=await client.from('site_config').select('id,value').eq('id',ROW_ID).maybeSingle();
      if(error)throw error;
      if(!data?.value){
        const fallback=await client.from('site_config').select('id,value').limit(1).maybeSingle();
        if(fallback.error)throw fallback.error;
        data=fallback.data;
      }
      return data?.value?cache(data.value):current;
    }catch(error){
      console.warn('تعذر تحميل إعدادات الموقع المركزية',error);
      return current;
    }
  }

  const ready=(async()=>{
    if(window.SweaterAuthReady)authenticatedUser=await window.SweaterAuthReady.catch(()=>null);
    authResolved=true;
    const result=await loadCloud();
    if(client){
      client.channel('sweater-global-site-config')
        .on('postgres_changes',{event:'*',schema:'public',table:'site_config',filter:`id=eq.${ROW_ID}`},payload=>{
          if(payload.new?.value)cache(payload.new.value);
        })
        .subscribe();
    }
    return result;
  })();

  async function save(value){
    if(!client)throw new Error('الاتصال بقاعدة البيانات غير متاح');
    const saved=merge(defaults,value);
    const {data:sessionData}=await client.auth.getSession();
    const user=sessionData.session?.user;
    if(!user)throw new Error('يجب تسجيل الدخول أولاً');
    const {error}=await client.from('site_config').upsert({
      id:ROW_ID,value:saved,updated_by:user.id,updated_at:new Date().toISOString()
    },{onConflict:'id'});
    if(error)throw error;
    return cache(saved);
  }

  async function uploadAsset(file,folder='general'){
    if(!client)throw new Error('خدمة رفع الصور غير متاحة');
    if(!file?.type?.startsWith('image/'))throw new Error('اختر ملف صورة صالحاً');
    if(file.size>10*1024*1024)throw new Error('حجم الصورة يجب ألا يتجاوز 10 ميجابايت');
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
    const path=`${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error}=await client.storage.from(BUCKET).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
    if(error)throw error;
    return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  window.SweaterAdmin={
    defaults:clone(defaults),
    ready,
    load:()=>clone(current),
    save,
    reset:()=>save(clone(defaults)),
    uploadAsset,
    getTemplates:id=>current.templates.filter(t=>t.tool===id&&t.status!=='archived'),
    registerTemplateAdapter:(id,fn)=>{adapters[id]=fn}
  };

  function applyHome(){
    if(page!=='index.html'&&page!=='')return;
    const data=current;
    const h1=document.querySelector('main section h1');
    const heroP=h1?.parentElement?.querySelector('p');
    if(h1&&data.content.heroTitle){const words=String(data.content.heroTitle).trim().split(/\s+/);const last=words.pop()||'';h1.innerHTML=`${escape(words.join(' '))}${words.length?'<br>':''}<em>${escape(last)}</em>`}
    if(heroP&&data.content.heroDescription)heroP.textContent=data.content.heroDescription;
    const sections=[...document.querySelectorAll('main section')];
    const toolsSection=sections.find(s=>s.querySelector('a[href="./framing-tool.html"]'));
    const toolsHeading=toolsSection?.querySelector('h2');
    if(toolsHeading){const icon=toolsHeading.querySelector('i')?.outerHTML||'';toolsHeading.innerHTML=`${icon}${escape(data.content.toolsTitle)}`}
    const refs=document.querySelector('#company-references h2');if(refs)refs.textContent=data.content.referencesTitle;
    const nums=document.querySelector('#company-numbers h2');if(nums)nums.textContent=data.content.numbersTitle;
    const normalToolsGrid=document.querySelector('.tools-grid');
    const adminToolsGrid=document.querySelector('#adminToolsGrid');
    data.tools.forEach(tool=>{
      const card=document.querySelector(`a[href="${tool.href}"]`);if(!card)return;
      const isAdmin=authenticatedUser?.role==='admin'||window.SweaterAuth?.isAdmin?.()===true;
      if(tool.id!=='html-pages'&&isAdmin&&tool.adminOnly===true&&adminToolsGrid){adminToolsGrid.append(card);card.classList.add('admin-zone-tool')}
      else if(tool.id!=='html-pages'&&tool.adminOnly!==true&&normalToolsGrid&&card.parentElement!==normalToolsGrid){normalToolsGrid.append(card);card.classList.remove('admin-zone-tool')}
      const isHidden=tool.adminOnly===true&&!isAdmin;
      const isLocked=tool.enabled===false&&!isAdmin;
      card.classList.toggle('tool-card-hidden',isHidden);
      card.classList.toggle('tool-locked',isLocked);
      if(isHidden)card.style.setProperty('display','none','important');
      else card.style.removeProperty('display');
      card.setAttribute('aria-disabled',String(isLocked));
      card.setAttribute('href',tool.href);
      card.onclick=isLocked?event=>event.preventDefault():null;
      if(!card.querySelector('.tool-lock-notice')){
        const copy=card.querySelector('.simple-copy,.tool-card-copy');
        if(copy)copy.insertAdjacentHTML('beforeend','<span class="tool-lock-notice"><i class="fa-solid fa-lock"></i> قريبًا ستكون متاحة</span>');
      }
      if(tool.id==='html-pages'){
        const adminZone=document.querySelector('#admin-tools-zone');
        if(adminZone)adminZone.style.setProperty('display',isHidden?'none':'block',isHidden?'important':'');
      }
      const title=card.querySelector('h3'),desc=card.querySelector('p'),visual=card.querySelector('.bg-cover,.simple-visual');
      if(title)title.textContent=tool.name;if(desc)desc.textContent=tool.description;
      if(visual?.classList.contains('simple-visual')){visual.style.removeProperty('background-image');visual.style.removeProperty('background-size');visual.style.removeProperty('background-position')}
      else if(visual&&tool.image){visual.style.setProperty('background-image',`linear-gradient(#10131922,#10131922),url("${String(tool.image).replace(/"/g,'%22')}")`,'important');visual.style.backgroundSize='cover';visual.style.backgroundPosition='center'}
    });
    data.references.forEach(reference=>{
      const card=document.querySelector(`[data-reference-id="${reference.id}"]`);if(!card)return;
      card.style.display=reference.enabled===false?'none':'';
      const title=card.querySelector('h3'),desc=card.querySelector('p'),icon=card.querySelector('.reference-icon i'),status=card.querySelector('[data-reference-status]');
      if(title)title.textContent=reference.name;if(desc)desc.textContent=reference.description;
      if(icon)icon.className=`fa-solid ${reference.icon||'fa-link'}`;
      const referenceUrl=safeLink(reference.url);
      const available=Boolean(referenceUrl);
      card.href=available?referenceUrl:'#company-references';
      card.target=available?'_blank':'';
      card.rel=available?'noopener noreferrer':'';
      card.setAttribute('aria-disabled',String(!available));
      if(status){status.textContent=available?'فتح المرجع':'غير متاح';status.classList.toggle('text-sweater-500',available)}
    });
    const statCards=[...document.querySelectorAll('#company-numbers .stat-card')];
    data.stats.forEach((stat,index)=>{const card=statCards[index];if(!card)return;const strong=card.querySelector('strong'),span=card.querySelector('span');if(strong)strong.textContent=stat.value;if(span)span.textContent=stat.label});
    const banner=data.banners.find(item=>item.id==='home-hero');
    const bannerImage=document.querySelector('#homeHeroBannerImage');
    const bannerFallback=document.querySelector('#homeHeroBannerFallback');
    const showBanner=Boolean(banner?.enabled&&banner?.image);
    if(bannerImage){bannerImage.src=showBanner?banner.image:'';bannerImage.alt=banner?.alt||'بنر سويتر';bannerImage.classList.toggle('hidden',!showBanner)}
    if(bannerFallback)bannerFallback.classList.toggle('hidden',showBanner);
  }

  function applyGlobal(){
    document.documentElement.dataset.siteConfig='ready';
    if(current.settings.siteName)document.title=document.title.replace(/SWEATER Workspace|مغاسل سويتر/g,current.settings.siteName);
    const activeTool=toolId?current.tools.find(t=>t.id===toolId):null;
    if(activeTool&&!authResolved)return;
    const isAdmin=authenticatedUser?.role==='admin'||window.SweaterAuth?.isAdmin?.()===true;
    if(activeTool&&((activeTool.enabled===false&&!isAdmin)||(activeTool.adminOnly===true&&!isAdmin)))location.replace('./index.html?tool=locked');
  }

  async function maintenanceGate(){
    if(page==='admin.html'||!current.settings.maintenance)return;
    let auth=null;
    try{
      auth=await window.SweaterAuthReady;
    }catch(_){}
    if(auth?.role==='admin')return;
    document.body.innerHTML=`<main class="sw-maintenance"><img src="https://i.ibb.co/qLNFj53h/Logo-2.png" alt="SWEATER"><h1>نعود إليكم قريباً</h1><p>نجري حالياً تحسينات على مساحة العمل. يرجى المحاولة بعد قليل.</p><a href="mailto:${escape(current.settings.supportEmail)}">التواصل مع الدعم</a></main>`;
    const style=document.createElement('style');style.textContent='.sw-maintenance{min-height:100vh;display:grid;place-content:center;justify-items:center;text-align:center;padding:24px;background:#f8fafc;color:#172033;font-family:LamaSans,sans-serif}.sw-maintenance img{width:150px;margin-bottom:28px}.sw-maintenance h1{font-size:30px;margin:0 0 10px}.sw-maintenance p{color:#64748b}.sw-maintenance a{margin-top:14px;padding:12px 18px;border-radius:12px;background:#f96714;color:#fff;text-decoration:none;font-weight:800}';document.head.append(style);
  }

  function templateModal(){
    if(!toolId)return;
    const list=current.templates.filter(t=>t.tool===toolId&&t.status!=='archived');if(!list.length)return;
    const canEdit=window.SweaterAuth?.isAdmin?.()===true;
    const header=document.querySelector('header,.top-bar');const actions=header?.querySelector(':scope > .controls-container, :scope > .actions, :scope > .top-actions, :scope > .head-actions, :scope > .head-side, :scope > .header-actions')||header?.lastElementChild;if(!actions||actions.querySelector('.sw-admin-templates-btn'))return;
    const btn=document.createElement('a');btn.href='#sw-ready-templates';btn.className='sw-admin-templates-btn';btn.innerHTML=`<i class="fa-solid fa-boxes-stacked"></i><span>قوالب جاهزة</span><b>${list.length}</b>`;actions.prepend(btn);
    const modal=document.createElement('div');modal.id='sw-ready-templates';modal.className='sw-admin-templates-modal';modal.innerHTML=`<div class="sw-admin-template-card"><header><div><strong>قوالب جاهزة</strong><span>قوالب معتمدة وجاهزة للاستخدام</span></div><a href="#" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></a></header><div class="sw-admin-template-grid">${list.map(t=>`<article><div class="sw-admin-template-preview">${t.preview?`<img src="${escape(t.preview)}" alt="">`:'<i class="fa-solid fa-layer-group"></i>'}</div><div><strong>${escape(t.name)}</strong><span>${escape(t.category||'عام')}</span></div><div class="sw-admin-template-actions"><button data-admin-template="${escape(t.id)}">استخدام</button>${canEdit?`<button class="edit" data-edit-ready-template="${escape(t.id)}">تعديل</button>`:''}</div></article>`).join('')}</div></div>`;document.body.append(modal);
    const openModal=()=>{modal.classList.add('open');modal.style.display='grid'};
    const closeModal=()=>{modal.classList.remove('open');modal.style.removeProperty('display');if(location.hash==='#sw-ready-templates')history.replaceState(null,'',location.pathname+location.search)};
    window.SweaterReadyTemplateActions={
      open:openModal,
      close:closeModal,
      use:id=>{const template=list.find(t=>t.id===id);if(!template)return;localStorage.setItem('sweaterPendingAdminTemplate',JSON.stringify(template));if(adapters[toolId])adapters[toolId](template);else window.dispatchEvent(new CustomEvent('sweater:apply-admin-template',{detail:template}));closeModal()},
      edit:id=>{const template=list.find(t=>t.id===id);if(!template||!canEdit)return;if(toolId==='coupons'){window.dispatchEvent(new CustomEvent('sweater:edit-ready-template',{detail:template}));closeModal();return}const params=new URLSearchParams(location.search);params.set('adminTemplate','1');params.set('editTemplate',id);location.search=params.toString()}
    };
    modal.addEventListener('click',e=>{const use=e.target.closest('[data-admin-template]'),edit=e.target.closest('[data-edit-ready-template]');if(use){window.SweaterReadyTemplateActions.use(use.dataset.adminTemplate);return}if(edit){window.SweaterReadyTemplateActions.edit(edit.dataset.editReadyTemplate);return}if(e.target===modal)closeModal()});
  }

  const templateExtractors={
    'package-cards':()=>{
      const keys=['packageName','description','validity','perWash','oldPrice','newPrice','ctaText','ctaColor','priceColor','validColor','washColor','washTextColor'];
      const payload={lang:document.querySelector('[data-lang].active')?.dataset.lang||'ar'};
      keys.forEach(key=>{const input=document.getElementById(key);if(input)payload[key]=input.value});
      payload.showPayments=document.getElementById('showPayments')?.checked!==false;return payload;
    },
    'employee-cards':()=>{const payload={};['firstName','lastName','jobTitle','department','employeeNo','qrUrl'].forEach(key=>{const input=document.getElementById(key);if(input)payload[key]=input.value});return payload},
    'affiliate-codes':()=>{try{return {layers:JSON.parse(localStorage.getItem('sweaterAffiliatePosterV1')||'{}').layers||[]}}catch(_){return {layers:[]}}}
  };

  function templateAuthoring(){
    if(!toolId||!window.SweaterAuth?.isAdmin?.())return;
    const params=new URLSearchParams(location.search),editingId=params.get('editTemplate')||'';
    if(editingId){const template=current.templates.find(item=>item.id===editingId&&item.tool===toolId);if(template)setTimeout(()=>window.dispatchEvent(new CustomEvent('sweater:apply-admin-template',{detail:template})),180)}
    const extract=templateExtractors[toolId];if(!extract)return;
    const header=document.querySelector('header,.top-bar'),actions=header?.querySelector(':scope > .actions,:scope > .top-actions,:scope > .head-actions,:scope > .head-side,:scope > .header-actions')||header?.lastElementChild;if(!actions||actions.querySelector('.sw-save-admin-template'))return;
    const button=document.createElement('button');button.type='button';button.className='sw-save-admin-template';button.innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i><span>حفظ كقالب جاهز</span>';actions.prepend(button);
    button.onclick=async()=>{const existing=current.templates.find(item=>item.id===editingId),name=prompt('اسم القالب',existing?.name||'قالب جديد');if(!name?.trim())return;const category=prompt('تصنيف القالب',existing?.category||'عام')||'عام',config=clone(current),record={...(existing||{}),id:editingId||`template-${toolId}-${Date.now()}`,name:name.trim(),tool:toolId,category,status:'active',source:'custom',preview:existing?.preview||current.tools.find(t=>t.id===toolId)?.image||'',payload:extract(),notes:`تم إنشاؤه من ${current.tools.find(t=>t.id===toolId)?.name||'الأداة'}`,updatedAt:new Date().toISOString()};const index=config.templates.findIndex(item=>item.id===record.id);if(index<0)config.templates.unshift(record);else config.templates[index]=record;button.disabled=true;try{await save(config);button.innerHTML='<i class="fa-solid fa-check"></i><span>تم الحفظ للجميع</span>';setTimeout(()=>button.innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i><span>حفظ كقالب جاهز</span>',1600)}catch(error){alert(error.message||'تعذر حفظ القالب')}finally{button.disabled=false}};
  }

  const styles=document.createElement('style');styles.textContent=`
    .sw-save-admin-template{height:40px;padding:0 13px;border:0;border-radius:11px;background:#f96714;color:#fff;display:inline-flex;align-items:center;gap:7px;font:900 10px LamaSans,Cairo,sans-serif;cursor:pointer}.sw-save-admin-template:disabled{opacity:.6}
    .sw-admin-templates-btn{height:40px;padding:0 12px;border:1px solid #fed7aa;border-radius:11px;background:#fff7ed;color:#c2410c;display:flex;align-items:center;gap:7px;font:800 10px LamaSans,Cairo,sans-serif;text-decoration:none}.sw-admin-templates-btn b{min-width:18px;height:18px;display:grid;place-items:center;border-radius:99px;background:#f96714;color:#fff;font-size:8px}.sw-admin-templates-modal{position:fixed;inset:0;z-index:10000;display:none;place-items:center;padding:18px;background:rgba(2,6,23,.58);backdrop-filter:blur(8px);direction:rtl}.sw-admin-templates-modal.open,.sw-admin-templates-modal:target{display:grid}.sw-admin-template-card{width:min(760px,100%);max-height:82vh;overflow:auto;border-radius:22px;background:#fff;box-shadow:0 30px 90px rgba(2,6,23,.3);color:#172033}.sw-admin-template-card>header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #e5e7eb}.sw-admin-template-card header strong{display:block;font-size:14px}.sw-admin-template-card header span{display:block;margin-top:3px;color:#94a3b8;font-size:9px}.sw-admin-template-card header>a{width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:9px;background:#f1f5f9;color:#64748b;text-decoration:none}.sw-admin-template-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px}.sw-admin-template-grid article{border:1px solid #e5e7eb;border-radius:15px;overflow:hidden;background:#fff}.sw-admin-template-preview{height:120px;display:grid;place-items:center;background:#f8fafc;color:#f96714;font-size:28px}.sw-admin-template-preview img{width:100%;height:100%;object-fit:cover}.sw-admin-template-grid article>div:nth-child(2){padding:10px 11px}.sw-admin-template-grid article strong{display:block;font-size:10px}.sw-admin-template-grid article span{font-size:8px;color:#94a3b8}.sw-admin-template-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 10px 10px}.sw-admin-template-actions>button{height:34px;border:0;border-radius:9px;background:#f96714;color:#fff;font-size:9px;font-weight:800}.sw-admin-template-actions>button.edit{background:#172033}.sw-admin-template-actions>button:only-child{grid-column:1/-1}@media(max-width:650px){.sw-admin-template-grid{grid-template-columns:1fr 1fr}.sw-admin-templates-btn span{display:none}}`;document.head.append(styles);

  applyHome();applyGlobal();
  ready.then(()=>{applyHome();applyGlobal();templateModal();templateAuthoring();maintenanceGate()});
  window.addEventListener('sweater:config-updated',()=>{applyHome();applyGlobal()});
})();
