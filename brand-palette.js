(()=>{
  'use strict';
  if(window.SweaterBrandPalette)return;
  const COLORS=['#00B67A','#121212','#1389FF','#E5E5E5','#FFF8F3','#FFFFFF','#FFB178','#D92027','#E13C00','#27D97D','#F96714','#00BAB0'];
  const aliases={'#000000':'#121212','#111111':'#121212','#111827':'#121212','#172033':'#121212','#2563EB':'#1389FF','#168BF0':'#1389FF','#0EA5E9':'#1389FF','#16A34A':'#00B67A','#22C55E':'#27D97D','#00B979':'#00B67A','#FED7AA':'#FFB178','#F05208':'#E13C00','#F8F8FF':'#FFF8F3','#FFE6D8':'#FFB178','#D7EDFF':'#E5E5E5'};
  const normalize=value=>{const color=String(value||'').trim().toUpperCase();return COLORS.includes(color)?color:(aliases[color]||'#F96714')};
  const style=document.createElement('style');style.textContent='.sw-palette-trigger{width:34px!important;height:34px!important;min-width:34px!important;padding:0!important;border:2px solid #fff!important;border-radius:50%!important;background:var(--selected-color)!important;box-shadow:0 0 0 1px #d7d2cc!important;cursor:pointer!important}.sw-palette-trigger::after{content:"";display:block;width:8px;height:8px;margin:auto;border-radius:50%;background:rgba(255,255,255,.72);mix-blend-mode:difference}.sw-brand-palette-popover{position:fixed;z-index:30000;padding:14px;border:1px solid #e9e5e1;border-radius:16px;background:#fff;box-shadow:0 18px 50px rgba(18,18,18,.18);direction:rtl}.sw-brand-palette-popover[hidden]{display:none!important}.sw-brand-palette-popover>strong{display:block;margin-bottom:11px;color:#171717;font:900 11px LamaSans,Cairo,sans-serif}.sw-brand-palette-popover>div{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.sw-brand-palette-popover [data-sw-color]{aspect-ratio:1;width:100%;padding:0;border:2px solid #eee;border-radius:10px;background:var(--swatch);box-shadow:none}.sw-brand-palette-popover [data-sw-color].active{border-color:#f96714;box-shadow:0 0 0 2px rgba(249,103,20,.18)!important}';document.head.append(style);
  let active=null;
  const pop=document.createElement('div');pop.className='sw-brand-palette-popover';pop.hidden=true;pop.innerHTML=`<strong>ألوان سويتر المعتمدة</strong><div>${COLORS.map(color=>`<button type="button" data-sw-color="${color}" style="--swatch:${color}" aria-label="${color}" title="${color}"></button>`).join('')}</div>`;document.body.append(pop);
  const position=trigger=>{const rect=trigger.getBoundingClientRect(),width=Math.min(316,innerWidth-24);pop.style.width=width+'px';pop.style.left=Math.max(12,Math.min(innerWidth-width-12,rect.left))+'px';pop.style.top=Math.min(innerHeight-190,rect.bottom+8)+'px'};
  const open=(input,trigger)=>{active=input;pop.hidden=false;position(trigger);pop.querySelectorAll('[data-sw-color]').forEach(button=>button.classList.toggle('active',button.dataset.swColor===normalize(input.value)))};
  const close=()=>{pop.hidden=true;active=null};
  pop.addEventListener('click',event=>{const button=event.target.closest('[data-sw-color]');if(!button||!active)return;active.value=button.dataset.swColor;active.dispatchEvent(new Event('input',{bubbles:true}));active.dispatchEvent(new Event('change',{bubbles:true}));active._swTrigger.style.setProperty('--selected-color',button.dataset.swColor);active._swTrigger.title=button.dataset.swColor;close()});
  const enhance=input=>{
    if(input.dataset.swPaletteReady)return;input.dataset.swPaletteReady='1';
    const selected=normalize(input.value);input.value=selected;
    const trigger=document.createElement('button');trigger.type='button';trigger.className='sw-palette-trigger';trigger.style.setProperty('--selected-color',selected);trigger.title=selected;trigger.setAttribute('aria-label','اختيار لون من ألوان سويتر');
    input.insertAdjacentElement('afterend',trigger);input.hidden=true;input.style.setProperty('display','none','important');input._swTrigger=trigger;
    trigger.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();open(input,trigger)});
    const scope=input.parentElement;scope?.querySelectorAll('input:not([type=color])').forEach(field=>{if(/hex|color/i.test(field.id||'')||/^#[0-9a-f]{6}$/i.test(field.value||'')){field.readOnly=true;field.value=selected}});
    input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
  };
  const scan=root=>(root.querySelectorAll?.('input[type="color"]')||[]).forEach(enhance);
  const normalizeExisting=()=>{
    document.querySelectorAll('[data-color]').forEach(button=>{if(/^#[0-9a-f]{6}$/i.test(button.dataset.color||'')){const color=normalize(button.dataset.color);button.dataset.color=color;button.style.background=color}});
    ['ctaColor','priceColor','validColor','washColor','washTextColor'].forEach(id=>{const input=document.getElementById(id);if(!input)return;const color=normalize(input.value);if(input.value.toUpperCase()===color)return;input.value=color;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))});
  };
  scan(document);
  normalizeExisting();
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.('input[type="color"]'))enhance(node);scan(node)}))).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',event=>{if(!pop.hidden&&!pop.contains(event.target)&&!event.target.closest('.sw-palette-trigger'))close()});
  document.addEventListener('click',event=>{if(event.target.closest('[data-preset],[data-admin-template]'))setTimeout(normalizeExisting)});
  window.addEventListener('sweater:apply-admin-template',()=>setTimeout(normalizeExisting));
  addEventListener('resize',close);addEventListener('scroll',close,true);
  window.SweaterBrandPalette={colors:COLORS,normalize};
})();
