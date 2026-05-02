(function () {
  var script = document.currentScript;
  var business = script && script.getAttribute('data-business');
  var baseUrl =
    (script && script.getAttribute('data-base-url')) ||
    new URL(script.src).origin;
  var label =
    (script && script.getAttribute('data-label')) || 'Book an appointment';
  var position =
    (script && script.getAttribute('data-position')) || 'bottom-right';

  if (!business) {
    console.warn('Smart Business Hub widget: data-business is required.');
    return;
  }

  var root = document.createElement('div');
  root.setAttribute('data-smart-hub-widget', business);

  var shadow = root.attachShadow({ mode: 'open' });
  var wrapper = document.createElement('div');
  wrapper.innerHTML =
    '<style>' +
    ':host{all:initial;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
    '.sbh-button{position:fixed;z-index:2147483647;border:0;border-radius:999px;background:#020617;color:white;box-shadow:0 18px 40px rgba(2,6,23,.28);padding:14px 18px;font:600 14px/1.2 Inter,system-ui,sans-serif;cursor:pointer;display:flex;gap:10px;align-items:center}' +
    '.sbh-button:hover{background:#0f172a}' +
    '.bottom-right{right:22px;bottom:22px}.bottom-left{left:22px;bottom:22px}' +
    '.sbh-dot{width:10px;height:10px;border-radius:999px;background:#14b8a6;box-shadow:0 0 0 5px rgba(20,184,166,.18)}' +
    '.sbh-backdrop{position:fixed;inset:0;z-index:2147483646;background:rgba(15,23,42,.44);backdrop-filter:blur(3px);display:none}' +
    '.sbh-frame-wrap{position:fixed;z-index:2147483647;right:22px;bottom:82px;width:min(420px,calc(100vw - 32px));height:min(720px,calc(100vh - 110px));border-radius:18px;overflow:hidden;background:white;box-shadow:0 28px 70px rgba(2,6,23,.35);display:none;border:1px solid rgba(226,232,240,.9)}' +
    '.sbh-frame{width:100%;height:100%;border:0;background:white}' +
    '.sbh-close{position:absolute;right:10px;top:10px;z-index:1;border:0;background:rgba(15,23,42,.82);color:white;border-radius:999px;width:30px;height:30px;cursor:pointer;font:700 16px/1 system-ui}' +
    '@media(max-width:520px){.sbh-frame-wrap{right:0;left:0;bottom:0;width:100vw;height:86vh;border-radius:18px 18px 0 0}.sbh-button{right:16px;bottom:16px}}' +
    '</style>' +
    '<div class="sbh-backdrop"></div>' +
    '<div class="sbh-frame-wrap">' +
    '<button class="sbh-close" aria-label="Close booking widget">×</button>' +
    '<iframe class="sbh-frame" title="Booking widget"></iframe>' +
    '</div>' +
    '<button class="sbh-button ' + position + '"><span class="sbh-dot"></span><span>' + label + '</span></button>';

  shadow.appendChild(wrapper);
  document.body.appendChild(root);

  var button = shadow.querySelector('.sbh-button');
  var backdrop = shadow.querySelector('.sbh-backdrop');
  var frameWrap = shadow.querySelector('.sbh-frame-wrap');
  var frame = shadow.querySelector('.sbh-frame');
  var close = shadow.querySelector('.sbh-close');

  function open() {
    frame.src = baseUrl.replace(/\/$/, '') + '/embed/' + encodeURIComponent(business);
    backdrop.style.display = 'block';
    frameWrap.style.display = 'block';
  }

  function closeWidget() {
    backdrop.style.display = 'none';
    frameWrap.style.display = 'none';
  }

  button.addEventListener('click', open);
  close.addEventListener('click', closeWidget);
  backdrop.addEventListener('click', closeWidget);
})();
