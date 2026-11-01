/* ==========================================================================
   The content database. Reads db/site.json, which the content manager writes,
   and puts it over SITE_CONTENT. Only then are the other scripts started,
   because several of them read SITE_CONTENT as soon as they run.
   Without the file (opened from disk, GitHub Pages preview, a server problem)
   the page simply uses content.js, so it always has something to show.
   ========================================================================== */
(function () {
  const WAIT_MS = 3000;   /* a slow database never holds the page back for longer */

  function apply(db) {
    if (!db || !Array.isArray(db.sections) || !db.sections.length || db.sections[0].id !== 'overview' || !db.media) return;
    const { publishedAt, ui, ...content } = db;
    Object.assign(SITE_CONTENT, content);
    Object.assign(SITE_CONTENT.ui, ui);   /* text added to the code later still has its content.js value */
  }

  /* The scripts are listed in index.html; they run in that order, and core.js waits for the signal. */
  function startScripts() {
    const listed = [...document.querySelectorAll('script[data-src]')];
    listed.forEach((tag, k) => {
      const script = document.createElement('script');
      script.src = tag.dataset.src;
      script.async = false;
      if (k === listed.length - 1) script.onload = script.onerror = () => document.dispatchEvent(new Event('st:scripts-ready'));
      document.head.append(script);
    });
  }

  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), WAIT_MS);
  fetch('db/site.json', { cache: 'no-cache', signal: stop.signal })
    .then(response => response.ok ? response.json() : null)
    .then(apply)
    .catch(() => {})
    .finally(() => { clearTimeout(timer); startScripts(); });
})();
