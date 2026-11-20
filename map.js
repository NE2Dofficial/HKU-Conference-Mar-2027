{
  for (const button of document.querySelectorAll('[data-travel-dialog]')) {
    const dialog = document.getElementById(button.getAttribute('aria-controls'));
    if (!dialog) continue;
    button.addEventListener('click', () => {
      if (!dialog.open) dialog.showModal();
    });
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.scrollTop = 0;
      if (button.getClientRects().length) button.focus({preventScroll: true});
    });
  }
}
{
  const panel = document.querySelector('.travel-map-panel');
  if (panel) {
    const frame = panel.querySelector('.map-frame');
    const map = frame.querySelector('svg');
    const initial = {x: 0, y: 0, w: 900, h: 700};
    const selection = panel.querySelector('.map-selection');
    const places = {
      hku: ['The University of Hong Kong', ''],
      station: ['HKU MTR Station', 'Island Line station serving the university campus.'],
      temple: ['Man Mo Temple', 'Visit on Hollywood Road as part of the Sheung Wan walk.'],
      ferry: ['Central Pier 7', 'Board the Star Ferry here for Tsim Sha Tsui.'],
      tsim: ['Tsim Sha Tsui Star Ferry Pier', 'Walk east along the waterfront after disembarking.'],
      artpark: ['West Kowloon Art Park', 'Start here for a waterfront walk and a visit to nearby M+.']
    };
    let view = {...initial};
    let drag = null;

    function render() {
      view.x = Math.max(0, Math.min(initial.w-view.w, view.x));
      view.y = Math.max(0, Math.min(initial.h-view.h, view.y));
      map.setAttribute('viewBox', [view.x,view.y,view.w,view.h].join(' '));
      panel.querySelector('[data-map-action="in"]').disabled = view.w <= initial.w/4;
      panel.querySelector('[data-map-action="out"]').disabled = view.w >= initial.w;
    }

    function zoom(factor, x=view.x+view.w/2, y=view.y+view.h/2) {
      const w = Math.max(initial.w/4, Math.min(initial.w,view.w*factor));
      const h = w*initial.h/initial.w;
      view = {x:x-w/2, y:y-h/2, w, h};
      render();
    }

    function select(place, move) {
      selection.hidden = place === 'hku';
      selection.querySelector('strong').textContent = selection.hidden ? '' : places[place][0];
      selection.querySelector('span').textContent = places[place][1];
      for (const control of panel.querySelectorAll('[data-map-place]')) {
        const active = control.dataset.mapPlace === place;
        control.classList.toggle('is-selected',active);
        control.setAttribute('aria-pressed',active?'true':'false');
      }
      if (move) {
        const pin = map.querySelector('[data-map-place="'+place+'"]');
        const position = pin.transform.baseVal.getItem(0).matrix;
        zoom(Math.min(1, initial.w*.58/view.w),position.e,position.f);
      }
    }

    panel.addEventListener('click', event => {
      const place = event.target.closest('[data-map-place]');
      const tool = event.target.closest('[data-map-action]');
      if (place) select(place.dataset.mapPlace, true);
      if (tool?.dataset.mapAction === 'in') zoom(.72);
      if (tool?.dataset.mapAction === 'out') zoom(1/.72);
      if (tool?.dataset.mapAction === 'reset') {
        view = {...initial};
        select('hku',false);
        render();
      }
    });

    frame.addEventListener('keydown', event => {
      const pin = event.target.closest('[data-map-place]');
      if (pin && ['Enter',' '].includes(event.key)) {
        event.preventDefault();
        select(pin.dataset.mapPlace,true);
        return;
      }
      const keys = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]};
      if (keys[event.key]) {
        event.preventDefault();
        view.x += keys[event.key][0]*view.w*.12;
        view.y += keys[event.key][1]*view.h*.12;
        render();
      } else if (event.key==='+' || event.key==='=') {
        event.preventDefault();
        zoom(.72);
      } else if (event.key==='-') {
        event.preventDefault();
        zoom(1/.72);
      }
    });

    frame.addEventListener('pointerdown', event => {
      if (event.button!==0 || event.target.closest('[data-map-place]')) return;
      const scale = map.getScreenCTM().a;
      if (!scale) return;
      drag = {pointer:event.pointerId, x:event.clientX, y:event.clientY, left:view.x, top:view.y, scale};
      frame.setPointerCapture(event.pointerId);
    });
    frame.addEventListener('pointermove',event=>{
      if (drag?.pointer!==event.pointerId) return;
      view.x=drag.left-(event.clientX-drag.x)/drag.scale;
      view.y=drag.top-(event.clientY-drag.y)/drag.scale;
      render();
    });
    frame.addEventListener('lostpointercapture',()=>{ drag=null; });

    select('hku',false);
    render();
  }
}
