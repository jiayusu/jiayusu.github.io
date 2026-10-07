(() => {
  const space = document.querySelector('#note-space');
  const track = document.querySelector('#note-track');
  const loading = document.querySelector('#loading-note');
  const preview = document.querySelector('#note-preview');
  const desktop = window.matchMedia('(min-width: 801px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const COLUMN_WIDTH = 625;
  const SPINE_WIDTH = 40;
  const cache = new Map();

  if (!space || !track) return;

  const columns = () => [...track.querySelectorAll(':scope > [data-note-column]')];

  const pathFrom = (value) => {
    const url = new URL(value, window.location.origin);
    return url.pathname.replace(/\/index\.html$/, '/');
  };

  const columnPath = (column) => pathFrom(column.dataset.noteUrl);
  const rootPath = columnPath(columns()[0]);

  const isInternalNote = (link) => {
    if (!link?.href || link.target || link.hasAttribute('download')) return false;
    const url = new URL(link.href, window.location.href);
    return url.origin === window.location.origin &&
      !url.hash &&
      !/\.(?:pdf|png|jpe?g|gif|svg|zip|xml|json)$/i.test(url.pathname);
  };

  const loadNote = (path) => {
    if (cache.has(path)) return cache.get(path);

    const request = fetch(path, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((html) => {
        const documentCopy = new DOMParser().parseFromString(html, 'text/html');
        const column = documentCopy.querySelector('[data-note-column]');
        if (!column) throw new Error('Missing note content');
        return {
          markup: column.outerHTML,
          title: column.dataset.noteTitle || column.querySelector('h1')?.textContent?.trim() || '笔记'
        };
      })
      .catch((error) => {
        cache.delete(path);
        throw error;
      });

    cache.set(path, request);
    return request;
  };

  const createColumn = (entry, path) => {
    const template = document.createElement('template');
    template.innerHTML = entry.markup.trim();
    const column = template.content.firstElementChild;
    column.dataset.noteUrl = path;
    column.dataset.noteTitle = entry.title;
    return column;
  };

  const indexColumns = () => {
    columns().forEach((column, index) => {
      column.style.setProperty('--stack-index', index);
    });
  };

  const updateDocumentTitle = () => {
    const title = columns()
      .map((column) => column.dataset.noteTitle)
      .filter(Boolean)
      .join(' | ');
    if (title) document.title = title;
  };

  const updateActiveLinks = () => {
    const openPaths = new Set(columns().map(columnPath));
    track.querySelectorAll('a').forEach((link) => {
      const active = isInternalNote(link) && openPaths.has(pathFrom(link.href));
      link.classList.toggle('is-active-note', active);
    });
  };

  const updateColumnStates = () => {
    if (!desktop.matches) return;

    const scrollLeft = space.scrollLeft;
    const overlap = COLUMN_WIDTH - SPINE_WIDTH;
    const viewportWidth = space.clientWidth;

    columns().forEach((column, index) => {
      const leftTrigger = Math.max(0, overlap * (index - 1));
      const rightTrigger = Math.min(
        space.scrollWidth,
        overlap * index - (viewportWidth - (index - 1) * SPINE_WIDTH) + 80
      );
      const obscuredAfter = Math.max(0, overlap * (index + 1) - 80);
      let state = 'resting';

      if (scrollLeft > leftTrigger) {
        state = scrollLeft > obscuredAfter ? 'obscured' : 'overlay';
      } else if (scrollLeft < rightTrigger) {
        state = 'obscured';
      }

      column.classList.toggle('is-obscured', state === 'obscured');
      column.classList.toggle('is-overlay', state === 'overlay');
    });
  };

  const refreshStack = () => {
    indexColumns();
    updateActiveLinks();
    updateDocumentTitle();
    updateColumnStates();
  };

  const stackUrl = () => {
    const paths = columns().map(columnPath);
    const url = new URL(paths[0], window.location.origin);
    url.search = '';
    paths.slice(1).forEach((path) => url.searchParams.append('stackedNotes', path));
    return `${url.pathname}${url.search}`;
  };

  const commitStack = () => {
    history.pushState({ stackedNotes: columns().map(columnPath) }, '', stackUrl());
  };

  const scrollToColumn = (column, behavior = 'smooth') => {
    const index = columns().indexOf(column);
    if (index < 0) return;
    const left = index * COLUMN_WIDTH - (space.clientWidth - COLUMN_WIDTH) / 2;
    space.scrollTo({ left: Math.max(0, left), top: 0, behavior });
  };

  const warmLinkedNotes = (column) => {
    const links = [...column.querySelectorAll('a')].filter(isInternalNote);
    if (links.length === 0 || links.length > 12) return;

    const warm = () => links.forEach((link) => loadNote(pathFrom(link.href)).catch(() => {}));
    if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 1500 });
    else window.setTimeout(warm, 300);
  };

  const appendColumn = (entry, path) => {
    const column = createColumn(entry, path);
    track.append(column);
    warmLinkedNotes(column);
    refreshStack();
    return column;
  };

  const removeAfter = async (sourceColumn, animate = true) => {
    const allColumns = columns();
    const sourceIndex = allColumns.indexOf(sourceColumn);
    const doomed = allColumns.slice(sourceIndex + 1);
    if (doomed.length === 0) return;

    if (animate && !reducedMotion.matches) {
      doomed.forEach((column) => column.classList.add('will-be-replaced'));
      await new Promise((resolve) => window.setTimeout(resolve, 120));
    }
    doomed.forEach((column) => column.remove());
  };

  const clearHoverState = () => {
    columns().forEach((column) => {
      column.classList.remove('is-hover-target', 'will-be-replaced');
    });
    preview?.classList.remove('is-visible');
    if (preview) {
      preview.hidden = true;
      preview.innerHTML = '';
    }
  };

  const openNote = async (link, sourceColumn) => {
    const targetPath = pathFrom(link.href);
    const existing = columns().find((column) => columnPath(column) === targetPath);
    clearHoverState();

    if (existing) {
      scrollToColumn(existing);
      return;
    }

    loading?.classList.add('is-visible');
    try {
      const entry = await loadNote(targetPath);
      await removeAfter(sourceColumn);
      const incoming = appendColumn(entry, targetPath);
      commitStack();
      window.setTimeout(() => scrollToColumn(incoming), 10);
    } catch (error) {
      window.location.assign(targetPath);
    } finally {
      loading?.classList.remove('is-visible');
    }
  };

  let hoverTimer = 0;
  let hoveredLink = null;

  const hidePreview = () => {
    window.clearTimeout(hoverTimer);
    hoveredLink = null;
    clearHoverState();
  };

  const positionPreview = (link) => {
    if (!preview) return;
    const rect = link.getBoundingClientRect();
    const width = Math.min(500, window.innerWidth - 32);
    const gap = 12;
    let left = rect.right + gap;
    if (left + width > window.innerWidth - gap) left = Math.max(gap, rect.left - width - gap);
    const top = Math.max(gap, Math.min(rect.top, window.innerHeight - 412));
    preview.style.left = `${left}px`;
    preview.style.top = `${top}px`;
  };

  const showPreview = async (link) => {
    if (!preview || !desktop.matches || hoveredLink !== link) return;
    const targetPath = pathFrom(link.href);
    const sourceColumn = link.closest('[data-note-column]');
    const allColumns = columns();
    const targetColumn = allColumns.find((column) => columnPath(column) === targetPath);

    if (targetColumn) targetColumn.classList.add('is-hover-target');
    else {
      const sourceIndex = allColumns.indexOf(sourceColumn);
      allColumns.slice(sourceIndex + 1).forEach((column) => column.classList.add('will-be-replaced'));
    }

    try {
      const entry = await loadNote(targetPath);
      if (hoveredLink !== link) return;
      const column = createColumn(entry, targetPath);
      const body = column.querySelector('.note-column__body');
      preview.innerHTML = body ? body.outerHTML : '';
      preview.hidden = false;
      positionPreview(link);
      requestAnimationFrame(() => preview.classList.add('is-visible'));
    } catch {
      clearHoverState();
    }
  };

  const desiredPathsFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    const stacked = params.getAll('stackedNotes')
      .map((value) => pathFrom(value))
      .filter((path, index, paths) => path !== rootPath && paths.indexOf(path) === index);
    return [pathFrom(window.location.pathname), ...stacked];
  };

  let restoreVersion = 0;
  const restoreStack = async (behavior = 'smooth') => {
    const version = ++restoreVersion;
    const desired = desiredPathsFromLocation();
    if (desired[0] !== rootPath) {
      window.location.reload();
      return;
    }

    const current = columns();
    let common = 0;
    while (common < current.length && common < desired.length && columnPath(current[common]) === desired[common]) {
      common += 1;
    }

    current.slice(common).forEach((column) => column.remove());
    try {
      for (const path of desired.slice(common)) {
        const entry = await loadNote(path);
        if (version !== restoreVersion) return;
        appendColumn(entry, path);
      }
      refreshStack();
      const last = columns().at(-1);
      if (last) window.setTimeout(() => scrollToColumn(last, behavior), 10);
    } catch {
      window.location.assign(desired.at(-1));
    }
  };

  track.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !desktop.matches || !isInternalNote(link)) return;
    event.preventDefault();
    openNote(link, link.closest('[data-note-column]'));
  });

  track.addEventListener('mouseover', (event) => {
    const link = event.target.closest('a');
    if (!desktop.matches || !isInternalNote(link) || link === hoveredLink) return;
    hidePreview();
    hoveredLink = link;
    hoverTimer = window.setTimeout(() => showPreview(link), 140);
  });

  track.addEventListener('mouseout', (event) => {
    const link = event.target.closest('a');
    if (!link || link !== hoveredLink || link.contains(event.relatedTarget)) return;
    hidePreview();
  });

  let scrollFrame = 0;
  space.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateColumnStates();
    });
  }, { passive: true });

  space.addEventListener('wheel', (event) => {
    if (!desktop.matches || !event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    space.scrollBy({ left: event.deltaY, behavior: 'auto' });
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (!desktop.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    space.scrollBy({ left: direction * (COLUMN_WIDTH - SPINE_WIDTH), behavior: 'smooth' });
  });

  window.addEventListener('resize', () => {
    hidePreview();
    updateColumnStates();
  });
  window.addEventListener('popstate', () => restoreStack());

  indexColumns();
  warmLinkedNotes(columns()[0]);
  refreshStack();

  const initialStack = new URLSearchParams(window.location.search).getAll('stackedNotes');
  if (!desktop.matches && initialStack.length) {
    window.location.replace(pathFrom(initialStack.at(-1)));
  } else if (desktop.matches && initialStack.length) {
    restoreStack('auto');
  }
})();
