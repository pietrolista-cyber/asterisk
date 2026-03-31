function ytFallbackUI(el, ytLink) {
  el.style.position = 'relative';
  el.innerHTML =
    '<a href="' + ytLink + '" target="_blank" rel="noopener"' +
    ' style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' +
    'justify-content:center;background:rgba(0,0,0,.88);text-decoration:none;gap:14px;border-radius:inherit;">' +
    '<div style="background:#FF0000;border-radius:8px;padding:10px 24px;">' +
    '<svg width="32" height="22" viewBox="0 0 32 22" fill="none">' +
    '<polygon points="13,4 25,11 13,18" fill="white"/></svg></div>' +
    '<span style="color:#fff;font-size:11px;font-family:monospace;letter-spacing:2px;font-weight:700;">' +
    '&#9658; ASSISTIR NO YOUTUBE</span>' +
    '<span style="color:rgba(255,255,255,.4);font-size:9px;font-family:monospace;">' +
    'embedding desabilitado pelo autor</span></a>';
}

function playInCard(el, e) {
  e.stopPropagation();
  var embed = el.dataset.embed;
  var link  = el.dataset.link || '';
  if (!embed) { if (link) window.open(link, '_blank', 'noopener'); return; }
  el.style.position = 'relative';

  if (embed.indexOf('youtube') >= 0) {
    var src = embed + '?autoplay=1&rel=0&enablejsapi=1';
    el.innerHTML =
      '<iframe src="' + src + '" allowfullscreen' +
      ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
      ' referrerpolicy="strict-origin-when-cross-origin"' +
      ' style="position:absolute;inset:0;width:100%;height:100%;border:none;display:block;"></iframe>';
    var iframe = el.querySelector('iframe');
    el.onclick = null;

    var re = new RegExp('embed/([a-zA-Z0-9_-]{11})');
    var idM = embed.match(re);
    var ytLink = idM ? 'https://www.youtube.com/watch?v=' + idM[1] : link;
    var ready = false;

    var t = setTimeout(function () {
      if (!ready && el.contains(iframe)) ytFallbackUI(el, ytLink);
    }, 2000);

    var mh = function (ev) {
      if (!ev.origin || ev.origin.indexOf('youtube') < 0) return;
      try {
        var m = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        if (m && iframe && ev.source === iframe.contentWindow) {
          if (m.event === 'onReady') {
            ready = true; clearTimeout(t); window.removeEventListener('message', mh);
          }
          if (m.event === 'onError') {
            ready = true; clearTimeout(t); window.removeEventListener('message', mh);
            ytFallbackUI(el, ytLink);
          }
        }
      } catch (err) {}
    };
    window.addEventListener('message', mh);

  } else {
    // Vimeo e outros
    var sep = embed.indexOf('?') >= 0 ? '&' : '?';
    el.innerHTML =
      '<iframe src="' + embed + sep + 'autoplay=1" allowfullscreen' +
      ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
      ' referrerpolicy="strict-origin-when-cross-origin"' +
      ' style="position:absolute;inset:0;width:100%;height:100%;border:none;display:block;"></iframe>';
    el.onclick = null;
  }
}
