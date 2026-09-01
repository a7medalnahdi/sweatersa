(() => {
  'use strict';
  if (window.__sweaterEditorResize) return;
  window.__sweaterEditorResize = true;

  const css = document.createElement('style');
  css.textContent = `
    .sw-range-number{display:grid!important;grid-template-columns:minmax(0,1fr) 72px!important;align-items:center!important;gap:9px!important;width:100%!important}
    .sw-range-number>input[type=range]{width:100%!important;min-width:0!important}
    .sw-range-value{width:72px!important;height:38px!important;padding:0 7px!important;border:1px solid #dedad5!important;border-radius:10px!important;background:#fff!important;color:#171717!important;text-align:center!important;font:800 12px LamaSans,Cairo,Arial,sans-serif!important}
    .sw-corner-resize{position:absolute!important;right:-9px!important;bottom:-9px!important;z-index:2147482000!important;width:20px!important;height:20px!important;padding:0!important;border:3px solid #fff!important;border-radius:6px!important;background:#f96714!important;box-shadow:0 0 0 1px #f96714,0 3px 10px #0002!important;cursor:nwse-resize!important;touch-action:none!important}
    .sw-corner-resize.sw-external-resize{right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important}
  `;
  document.head.append(css);

  const isSizeRange=input=>/size|scale|font|width|logo/i.test(`${input.id||''} ${input.name||''}`);
  const numeric = input => {
    if(!isSizeRange(input))return;
    if (input.dataset.swNumberReady) return;
    input.dataset.swNumberReady = '1';
    const wrap = document.createElement('div');
    wrap.className = 'sw-range-number';
    input.parentNode.insertBefore(wrap, input);
    wrap.append(input);
    const number = document.createElement('input');
    number.type = 'number';
    number.className = 'sw-range-value';
    number.min = input.min || '';
    number.max = input.max || '';
    number.step = input.step || '1';
    number.value = input.value;
    number.setAttribute('aria-label', 'القيمة الرقمية');
    wrap.append(number);
    const fromRange = () => { number.value = input.value; };
    const fromNumber = () => {
      let value = Number(number.value);
      if (!Number.isFinite(value)) return;
      if (input.min !== '') value = Math.max(Number(input.min), value);
      if (input.max !== '') value = Math.min(Number(input.max), value);
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles:true }));
      input.dispatchEvent(new Event('change', { bubbles:true }));
      number.value = input.value;
    };
    input.addEventListener('input', fromRange);
    input.addEventListener('change', fromRange);
    number.addEventListener('input', fromNumber);
    number.addEventListener('change', fromNumber);
  };

  const enhanceRanges = root => root.querySelectorAll?.('input[type="range"]:not([data-sw-number-ready])').forEach(numeric);
  enhanceRanges(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType !== 1) return;
    if (node.matches?.('input[type="range"]')) numeric(node);
    enhanceRanges(node);
  }))).observe(document.documentElement,{childList:true,subtree:true});

  const rangeFor = element => {
    if (element.classList.contains('logo-overlay')) return document.querySelector('#logoSize');
    return [...document.querySelectorAll('input[type="range"]')].find(input => {
      const section=input.closest('section,div');
      return input.id === 'sizeSl' || /size|scale|font|logo/i.test(input.id||input.name||'') && section?.offsetParent!==null;
    });
  };
  const addHandle = element => {
    if (!element) return;
    const replaced=/^(IMG|CANVAS|SVG)$/.test(element.tagName);
    const existing=replaced
      ? element.parentElement?.querySelector(`:scope > .sw-corner-resize[data-resize-for="${CSS.escape(element.id||'')}"]`)
      : element.querySelector(':scope > .sw-corner-resize');
    if(existing)return;
    if (getComputedStyle(element).position === 'static') element.style.position='relative';
    const handle=document.createElement('button');
    handle.type='button';
    handle.className='sw-corner-resize';
    handle.title='اسحب لتغيير الحجم';
    handle.dataset.html2canvasIgnore='true';
    handle.setAttribute('aria-label','تغيير الحجم بالسحب');
    const positionExternal=()=>{
      if(!replaced)return;
      const parent=element.parentElement,parentRect=parent.getBoundingClientRect(),rect=element.getBoundingClientRect();
      handle.style.left=`${rect.right-parentRect.left}px`;
      handle.style.top=`${rect.bottom-parentRect.top}px`;
    };
    if(replaced){
      if(!element.id)element.id=`sw-resize-${Date.now()}`;
      handle.classList.add('sw-external-resize');
      handle.dataset.resizeFor=element.id;
      element.parentElement.append(handle);
      positionExternal();
    }else element.append(handle);
    handle.addEventListener('pointerdown', event => {
      event.preventDefault();event.stopPropagation();
      const range=rangeFor(element);if(!range)return;
      const rect=element.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
      const startDistance=Math.max(20,Math.hypot(event.clientX-cx,event.clientY-cy)),startValue=Number(range.value);
      handle.setPointerCapture(event.pointerId);
      const move=e=>{
        const ratio=Math.hypot(e.clientX-cx,e.clientY-cy)/startDistance;
        let value=Math.round(startValue*ratio/(Number(range.step)||1))*(Number(range.step)||1);
        if(range.min!=='')value=Math.max(Number(range.min),value);if(range.max!=='')value=Math.min(Number(range.max),value);
        range.value=String(value);range.dispatchEvent(new Event('input',{bubbles:true}));
        positionExternal();
      };
      const end=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);range.dispatchEvent(new Event('change',{bubbles:true}))};
      handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
    });
  };
  const refreshHandles=()=>{
    document.querySelectorAll('.sw-corner-resize').forEach(handle=>{
      const target=handle.dataset.resizeFor?document.getElementById(handle.dataset.resizeFor):handle.parentElement;
      if(!target?.matches('.selected,.logo-overlay'))handle.remove();
    });
    document.querySelectorAll('.movable.selected,.logo-overlay').forEach(addHandle);
  };
  document.addEventListener('pointerdown',()=>setTimeout(refreshHandles,0),true);
  new MutationObserver(refreshHandles).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class','src']});
  refreshHandles();
})();
