/* ============================================================================
   VIDEO LIBRARY RENDERER + SCHEMA ENGINE
   Reads window.VIDEO_LIBRARY (js/videos-data.js) and:
     1. On the /videos hub  -> renders grouped cards + ItemList/VideoObject JSON-LD
     2. In any article      -> mountArticleVideo() injects a player + VideoObject
   Schema is only ever emitted for videos that are actually embedded on the page.
   ============================================================================ */
(function () {
  var LIB = (window.VIDEO_LIBRARY || []);

  function esc(s){ return String(s||'').replace(/[<>&"]/g, function(c){
    return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]; }); }

  function thumb(v){ return v.thumbnail || ('https://i.ytimg.com/vi/'+v.youtubeId+'/maxresdefault.jpg'); }

  function videoObject(v){
    return {
      "@type": "VideoObject",
      "name": v.title,
      "description": v.description,
      "thumbnailUrl": [thumb(v)],
      "uploadDate": v.uploadDate,
      "duration": v.durationISO,
      "contentUrl": "https://www.youtube.com/watch?v=" + v.youtubeId,
      "embedUrl": "https://www.youtube-nocookie.com/embed/" + v.youtubeId,
      "publisher": {
        "@type": "Organization",
        "name": "Cornerstone Wealth & Legacy Law",
        "url": "https://cornerstonewealthlegacy.com"
      }
    };
  }

  function injectSchema(node){
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(node);
    document.head.appendChild(s);
  }

  function iframe(v){
    return '<div class="video-frame"><iframe loading="lazy" '
      + 'src="https://www.youtube-nocookie.com/embed/' + esc(v.youtubeId) + '?rel=0" '
      + 'title="' + esc(v.title) + '" '
      + 'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
      + 'allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
  }

  /* ---- 1. /videos hub --------------------------------------------------- */
  window.renderVideoHub = function (containerId){
    var el = document.getElementById(containerId);
    if (!el) return;

    if (!LIB.length){
      el.innerHTML = '<div class="video-empty"><h2>Videos coming soon</h2>'
        + '<p>We’re publishing short, practical videos on Florida wills, trusts, '
        + 'real estate, and elder law. In the meantime, take the free 3-minute quiz or '
        + 'read our guides.</p>'
        + '<p><a class="btn btn-primary" href="/quiz">Take the Free Quiz</a> '
        + '<a class="btn btn-outline" href="/insights">Read the Guides</a></p></div>';
      return;
    }

    // Group by topic, in a fixed order
    var order = ["Estate Planning","Real Estate","Elder Law","About"];
    var groups = {};
    LIB.forEach(function(v){ (groups[v.topic] = groups[v.topic] || []).push(v); });

    var html = '';
    order.concat(Object.keys(groups).filter(function(t){return order.indexOf(t)<0;}))
      .forEach(function(topic){
        var items = groups[topic]; if (!items || !items.length) return;
        html += '<section class="video-group"><h2>' + esc(topic) + '</h2><div class="video-grid">';
        items.forEach(function(v){
          html += '<article class="video-card">'
            + iframe(v)
            + '<h3>' + esc(v.title) + '</h3>'
            + '<p>' + esc(v.description) + '</p>'
            + '</article>';
        });
        html += '</div></section>';
      });
    el.innerHTML = html;

    // ItemList of VideoObjects for the hub
    injectSchema({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": LIB.map(function(v, i){
        return { "@type": "ListItem", "position": i + 1, "item": videoObject(v) };
      })
    });
  };

  /* ---- 2. Article embed ------------------------------------------------- */
  // Call on an article page: mountArticleVideo("#video-slot")
  // Finds the video whose `article` matches the current path and injects it.
  window.mountArticleVideo = function (selector){
    var slot = document.querySelector(selector || '#video-slot');
    if (!slot) return;
    var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
    var v = LIB.filter(function(x){
      if (!x.article) return false;
      return x.article.replace(/\.html$/,'').replace(/\/$/,'') === path;
    })[0];
    if (!v){ slot.style.display = 'none'; return; }   // no video yet -> render nothing

    slot.innerHTML = '<div class="article-video">'
      + '<h2>Watch: ' + esc(v.title) + '</h2>'
      + iframe(v)
      + '<p class="article-video-cta"><a href="/quiz">Take the free 3-minute quiz →</a></p>'
      + '</div>';
    injectSchema(Object.assign({ "@context": "https://schema.org" }, videoObject(v)));
  };

  // Auto-mount on article pages that include a #video-slot
  if (document.readyState !== 'loading') { if (document.getElementById('video-slot')) window.mountArticleVideo(); }
  else document.addEventListener('DOMContentLoaded', function(){ if (document.getElementById('video-slot')) window.mountArticleVideo(); });
})();
