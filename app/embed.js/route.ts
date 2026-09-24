// Loader for <script src=".../embed.js" data-zestimonial-widget="ID" async></script>.
// Replaces each tag with an iframe that resizes itself to fit its testimonials.
const script = (origin: string) => `(function () {
  var origin = ${JSON.stringify(origin)};
  var frames = {};
  function mount() {
    var tags = document.querySelectorAll('script[data-zestimonial-widget]:not([data-zestimonial-mounted])');
    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i];
      var id = tag.getAttribute('data-zestimonial-widget');
      tag.setAttribute('data-zestimonial-mounted', 'true');
      var frame = document.createElement('iframe');
      frame.src = origin + '/embed/' + encodeURIComponent(id);
      frame.title = 'Client testimonials';
      frame.loading = 'lazy';
      frame.setAttribute('allowtransparency', 'true');
      frame.style.cssText = 'width:100%;height:320px;border:0;display:block;background:transparent;color-scheme:normal';
      tag.parentNode.insertBefore(frame, tag.nextSibling);
      (frames[id] = frames[id] || []).push(frame);
    }
  }
  window.addEventListener('message', function (event) {
    if (event.origin !== origin || !event.data || event.data.type !== 'zestimonial:resize') return;
    var list = frames[event.data.id] || [];
    for (var i = 0; i < list.length; i++) if (list[i].contentWindow === event.source) list[i].style.height = event.data.height + 'px';
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();`;

export function GET(request: Request) {
  return new Response(script(new URL(request.url).origin), {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
