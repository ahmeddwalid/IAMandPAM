(function () {
  'use strict';
  function scan() {
    var els = document.getElementsByClassName('geDiagramContainer');
    for (var i = 0; i < els.length; i++) {
      if (!els[i].getAttribute('data-mxgraph')) continue;
      if (els[i].childElementCount > 0) continue;
      if (window.GraphViewer) {
        try {
          window.GraphViewer.processElements('geDiagramContainer');
        } catch (e) {
          if (window.console) window.console.error('drawio render failed', e);
        }
      }
    }
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.setTimeout(scan, 100);
  } else {
    window.addEventListener('load', function () { window.setTimeout(scan, 100); });
  }
  if (window.MutationObserver) {
    new window.MutationObserver(function () { window.setTimeout(scan, 60); })
      .observe(document.documentElement, {childList: true, subtree: true});
  }
})();
