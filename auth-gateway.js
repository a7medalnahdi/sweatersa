(() => {
  'use strict';
  const page=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
  const publicPages=new Set(['login.html','forgot-password.html','html-page.html']);
  if(publicPages.has(page))return;
  document.documentElement.style.visibility='hidden';

  const ready=(async()=>{
    if(!window.SweaterCloud)throw new Error('تعذر تشغيل خدمة الحسابات');
    const client=window.SweaterCloud.client;
    const {data:{session}}=await client.auth.getSession();
    if(!session?.user){
      const next=encodeURIComponent(page+(location.search||''));
      location.replace(`./login.html?next=${next}`);
      return null;
    }
    const email=String(session.user.email||'').trim().toLowerCase();
    if(!email.endsWith('@sweater.sa')){
      await client.auth.signOut();
      location.replace('./login.html?error=domain');
      return null;
    }
    window.SweaterCloud.setUser(session.user.id);
    let profile;
    try{profile=await window.SweaterCloud.profile(session.user.id)}
    catch(_){
      profile={
        id:session.user.id,
        full_name:session.user.name||email.split('@')[0],
        username:email.split('@')[0],
        email,
        department:'',
        role:'employee',
        status:'active'
      };
    }
    const syncMarker=`swCloudSynced:${session.user.id}`;
    if(!sessionStorage.getItem(syncMarker)){
      try{
        const count=await window.SweaterCloud.pull(session.user.id);
        if(!count)await window.SweaterCloud.pushLocal(session.user.id);
        sessionStorage.setItem(syncMarker,'1');
        if(count){location.reload();return null}
      }catch(syncError){
        console.warn('Firebase profile sync skipped; continuing with the signed-in session.',syncError);
      }
    }
    const authUser={id:session.user.id,name:profile.full_name||session.user.name||session.user.email,username:profile.username||'',email:session.user.email,role:profile.role==='admin'?'admin':'employee',department:profile.department||''};
    window.SweaterAuth={
      session:()=>authUser,
      isAdmin:()=>authUser.role==='admin',
      signOut:async()=>{sessionStorage.removeItem(syncMarker);await client.auth.signOut();location.replace('./login.html')}
    };
    window.SweaterCloud.trackVisit?.(session.user.id,page).catch(()=>{});
    document.documentElement.style.visibility='';
    return authUser;
  })().catch(error=>{
    console.error(error);
    document.documentElement.style.visibility='';
    document.body.innerHTML=`<main style="min-height:100vh;display:grid;place-items:center;font-family:LamaSans,sans-serif;background:#f8fafc;color:#172033"><div style="max-width:420px;padding:25px;text-align:center"><h1 style="font-size:18px">تعذر الاتصال</h1><p style="color:#64748b;font-size:11px;line-height:1.8">تأكد من اتصال الإنترنت وتشغيل إعداد قاعدة البيانات، ثم حاول مجددًا.</p><button onclick="location.reload()" style="height:42px;padding:0 18px;border:0;border-radius:11px;background:#f96714;color:white;font:800 10px LamaSans">إعادة المحاولة</button></div></main>`;
    return null;
  });
  window.SweaterAuthReady=ready;

  document.addEventListener('DOMContentLoaded',async()=>{
    const user=await ready;if(!user)return;
    const header=document.querySelector('body > header,.studio-header,.quote-header');
    if(!header)return;
    const host=header.querySelector('.controls-container,.header-actions,.head-side')||header.lastElementChild;if(!host)return;
    const wrap=document.createElement('div');wrap.className='sw-user-menu';
    wrap.innerHTML=`<button class="sw-user-trigger" aria-expanded="false"><span class="sw-user-avatar">${String(user.name||'م')[0]}</span><span class="sw-user-copy"><strong>${user.name}</strong><small>${user.role==='admin'?'مدير النظام':'موظف'}</small></span><i class="fa-solid fa-chevron-down"></i></button><div class="sw-user-dropdown"><a href="./profile.html"><i class="fa-regular fa-user"></i><span>حسابي</span></a>${user.role==='admin'?'<a href="./admin.html"><i class="fa-solid fa-sliders"></i><span>لوحة التحكم</span></a>':''}<button data-signout><i class="fa-solid fa-arrow-right-from-bracket"></i><span>تسجيل الخروج</span></button></div>`;
    host.prepend(wrap);const trigger=wrap.querySelector('.sw-user-trigger');
    trigger.onclick=e=>{e.stopPropagation();const open=wrap.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open))};
    wrap.querySelector('[data-signout]').onclick=()=>window.SweaterAuth.signOut();document.addEventListener('click',()=>wrap.classList.remove('open'));
  });

  const style=document.createElement('style');style.textContent=`.sw-user-menu{position:relative;direction:rtl;font-family:LamaSans,Cairo,sans-serif}.sw-user-trigger{height:42px;display:flex;align-items:center;gap:8px;padding:4px 7px 4px 10px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#334155}.sw-user-avatar{width:31px;height:31px;border-radius:9px;display:grid;place-items:center;background:#f96714;color:#fff;font-size:11px;font-weight:900}.sw-user-copy{text-align:right;line-height:1.2}.sw-user-copy strong,.sw-user-copy small{display:block}.sw-user-copy strong{max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}.sw-user-copy small{margin-top:3px;color:#94a3b8;font-size:7px}.sw-user-trigger>i{font-size:8px;color:#94a3b8}.sw-user-dropdown{position:absolute;top:calc(100% + 7px);left:0;z-index:9999;width:180px;padding:6px;border:1px solid #e5e7eb;border-radius:13px;background:#fff;box-shadow:0 18px 45px rgba(15,23,42,.15);opacity:0;visibility:hidden;transform:translateY(-5px);transition:.18s}.sw-user-menu.open .sw-user-dropdown{opacity:1;visibility:visible;transform:none}.sw-user-dropdown a,.sw-user-dropdown button{width:100%;height:37px;padding:0 9px;border:0;border-radius:8px;background:transparent;color:#475569;display:flex;align-items:center;gap:9px;text-decoration:none;font-size:9px;font-weight:800;text-align:right}.sw-user-dropdown a:hover,.sw-user-dropdown button:hover{background:#f8fafc;color:#f96714}.sw-user-dropdown button:last-child{color:#dc2626;border-top:1px solid #f1f5f9;border-radius:0;margin-top:4px;padding-top:4px}.dark .sw-user-trigger,.dark .sw-user-dropdown{background:#111827;border-color:#334155;color:#e2e8f0}@media(max-width:700px){.sw-user-copy,.sw-user-trigger>i{display:none}.sw-user-trigger{padding:4px}.sw-user-dropdown{left:0}}`;document.head.append(style);
})();
