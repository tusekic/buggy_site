/**
 * gallery.js — Dynamic gallery loader + fast tab filter + lightbox
 *
 * Filtriranje: display:none (instant, bez glitcha) + fade-in animacija
 * na novim stavkama. Nema opacity/position haka koji su uzrokovali glitch.
 */

(function () {
  'use strict';

  var GALLERY_BASE     = 'assets/gallery/';
  var FILENAME_PATTERN = 'img_%n.jpg';
  var MAX_PROBE        = 60;

  var grid     = document.getElementById('gallery-grid');
  var tabsList = document.querySelector('.gallery-tabs');
  var lightbox = document.getElementById('gallery-lightbox');
  var lbImg    = document.getElementById('gallery-lightbox-img');
  var lbClose  = document.getElementById('gallery-lightbox-close');
  var lbPrev   = document.getElementById('gallery-lightbox-prev');
  var lbNext   = document.getElementById('gallery-lightbox-next');
  var emptyMsg = document.getElementById('gallery-empty');

  if (!grid || !tabsList) return;

  /* Čitaj kategorije iz postojećih HTML tabova */
  var tabEls = Array.prototype.slice.call(tabsList.querySelectorAll('.gallery-tab'));
  if (!tabEls.length) return;

  var categories = tabEls.map(function (el) {
    return { folder: el.dataset.category, el: el, label: (el.querySelector('strong') || el).textContent.trim() };
  });

  var activeCategory = categories[0].folder;
  var allItems       = [];
  var activeIndex    = -1;
  var loadedCount    = 0;

  /* Bindaj tabove */
  categories.forEach(function (cat) {
    cat.el.setAttribute('role', 'button');
    cat.el.setAttribute('tabindex', '0');
    cat.el.addEventListener('click', function () { filterCategory(cat.folder); });
    cat.el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filterCategory(cat.folder); }
    });
  });

  /* Otkrivanje slika */
  categories.forEach(function (cat) { probeImages(cat, 1, []); });

  function probeImages(cat, n, found) {
    if (n > MAX_PROBE) { onCategoryLoaded(cat, found); return; }
    var num  = n < 10 ? '0' + n : '' + n;
    var src  = GALLERY_BASE + cat.folder + '/' + FILENAME_PATTERN.replace('%n', num);
    var test = new Image();
    test.onload  = function () { found.push({ src: src, alt: cat.label + ' – slika ' + n }); probeImages(cat, n + 1, found); };
    test.onerror = function () { onCategoryLoaded(cat, found); };
    test.src = src;
  }

  function onCategoryLoaded(cat, images) {
    var isFirst = (cat.folder === categories[0].folder);

    images.forEach(function (d) {
      var item = document.createElement('div');
      /* Skrivene kategorije odmah display:none — bez ikakvih position haka */
      item.className = 'gallery-item gallery-loading' + (isFirst ? '' : ' gallery-hidden');
      item.dataset.category = cat.folder;

      var img = document.createElement('img');
      img.alt = d.alt;
      img.setAttribute('loading', 'lazy');
      item.appendChild(img);
      grid.insertBefore(item, emptyMsg);

      var entry = { el: item, img: img, category: cat.folder, src: d.src, alt: d.alt };
      allItems.push(entry);

      item.addEventListener('click', function () { openLightbox(entry); });
      observeItem(entry);
    });

    loadedCount++;
    if (loadedCount === categories.length) onAllLoaded();
  }

  /* IntersectionObserver lazy load */
  var observer = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { loadImg(e.target._ge); observer.unobserve(e.target); }
        });
      }, { rootMargin: '200px' })
    : null;

  function observeItem(entry) {
    if (observer) { entry.el._ge = entry; observer.observe(entry.el); }
    else loadImg(entry);
  }

  function loadImg(entry) {
    if (entry.img.src) return;
    entry.img.onload  = function () { entry.img.classList.add('loaded'); entry.el.classList.remove('gallery-loading'); };
    entry.img.onerror = function () { entry.el.style.display = 'none'; };
    entry.img.src = entry.src;
  }

  /* Filtriranje — čisti display:none, instant switch, fade-in na novim */
  function filterCategory(category) {
    if (category === activeCategory) return;

    tabsList.classList.add('switching');
    setTimeout(function () { tabsList.classList.remove('switching'); }, 300);

    activeCategory = category;

    tabEls.forEach(function (el) {
      el.classList.toggle('active', el.dataset.category === category);
    });

    /* Korak 1: sakrij sve što nije nova kategorija (sync, instant) */
    allItems.forEach(function (e) {
      if (e.category !== category) {
        e.el.classList.remove('gallery-appearing');
        e.el.classList.add('gallery-hidden');
      }
    });

    /* Korak 2: prikaži novu kategoriju u sljedećem frame-u
       — browser ima frame da makne stare elemente iz layouta,
         pa nema glitcha ni freezea od force-reflow-a */
    var visible = 0;
    var toShow = [];
    allItems.forEach(function (e) {
      if (e.category === category) {
        e.el.classList.remove('gallery-hidden', 'gallery-appearing');
        if (!e.img.src) loadImg(e);
        toShow.push(e.el);
        visible++;
      }
    });

    if (emptyMsg) emptyMsg.classList.toggle('visible', visible === 0);

    /* Dodaj animacijsku klasu tek u sljedećem animation frame —
       bez ikakvog force reflow, browser sam zna da su elementi novi */
    requestAnimationFrame(function () {
      toShow.forEach(function (el) { el.classList.add('gallery-appearing'); });
    });
  }

  function onAllLoaded() {
    var visible = 0;
    allItems.forEach(function (e) {
      if (e.category === activeCategory) { if (!e.img.src) loadImg(e); visible++; }
    });
    if (emptyMsg) emptyMsg.classList.toggle('visible', visible === 0);
  }

  /* Lightbox */
  function visibleItems() {
    return allItems.filter(function (e) { return e.category === activeCategory; });
  }

  function openLightbox(entry) {
    if (!lightbox || !lbImg) return;
    activeIndex = visibleItems().indexOf(entry);
    showLbImage(entry);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showLbImage(entry) {
    lbImg.style.opacity = '0';
    lbImg.onload = function () { lbImg.style.opacity = '1'; };
    lbImg.src = entry.src;
    lbImg.alt = entry.alt;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(function () { lbImg.src = ''; }, 260);
  }

  function navigateLightbox(dir) {
    var vis = visibleItems();
    if (!vis.length) return;
    activeIndex = (activeIndex + dir + vis.length) % vis.length;
    showLbImage(vis[activeIndex]);
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)  lbPrev.addEventListener('click',  function () { navigateLightbox(-1); });
    if (lbNext)  lbNext.addEventListener('click',  function () { navigateLightbox(1); });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    var tx = 0;
    lightbox.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend',   function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) navigateLightbox(dx < 0 ? 1 : -1);
    });
  }

})();
