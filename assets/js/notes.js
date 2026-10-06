(() => {
  const space = document.querySelector('#note-space');
  const loading = document.querySelector('#loading-note');
  const desktop = window.matchMedia('(min-width: 701px)');

  if (!space) return;

  const normalize = (href) => {
    const url = new URL(href, window.location.href);
    url.hash = '';
    return url.href;
  };

  const isInternalNote = (link) => {
    if (!link.href || link.target || link.hasAttribute('download')) return false;
    const url = new URL(link.href, window.location.href);
    return url.origin === window.location.origin &&
      !url.hash &&
      !/\.(?:pdf|png|jpe?g|gif|svg|zip)$/i.test(url.pathname);
  };

  const closeAfter = (column) => {
    let next = column.nextElementSibling;
    while (next) {
      const current = next;
      next = next.nextElementSibling;
      current.remove();
    }
  };

  const openNote = async (link, sourceColumn) => {
    const targetUrl = normalize(link.href);
    const existing = [...space.querySelectorAll('[data-note-column]')]
      .find((column) => normalize(column.dataset.noteUrl) === targetUrl);

    if (existing) {
      closeAfter(existing);
      existing.scrollIntoView({ behavior: 'smooth', inline: 'end' });
      history.pushState({ noteUrl: targetUrl }, '', targetUrl);
      return;
    }

    closeAfter(sourceColumn);
    loading.classList.add('is-visible');

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const documentCopy = new DOMParser().parseFromString(html, 'text/html');
      const incoming = documentCopy.querySelector('[data-note-column]');
      if (!incoming) throw new Error('Missing note content');

      incoming.dataset.noteUrl = targetUrl;
      space.append(incoming);
      incoming.scrollIntoView({ behavior: 'smooth', inline: 'end' });
      history.pushState({ noteUrl: targetUrl }, '', targetUrl);
    } catch (error) {
      window.location.assign(targetUrl);
    } finally {
      loading.classList.remove('is-visible');
    }
  };

  space.addEventListener('click', (event) => {
    const closeButton = event.target.closest('.close-note');
    if (closeButton) {
      const column = closeButton.closest('[data-note-column]');
      const previous = column.previousElementSibling;
      column.remove();
      if (previous) {
        previous.scrollIntoView({ behavior: 'smooth', inline: 'end' });
        history.pushState({ noteUrl: previous.dataset.noteUrl }, '', previous.dataset.noteUrl);
      }
      return;
    }

    const link = event.target.closest('a');
    if (!link || !desktop.matches || !isInternalNote(link)) return;

    event.preventDefault();
    openNote(link, link.closest('[data-note-column]'));
  });

  window.addEventListener('popstate', () => window.location.reload());
})();
