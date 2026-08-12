// Shared site chrome — the header (with its mobile menu) and the footer, which
// every page drops in via <div data-site-header></div> / <div data-site-footer></div>.
//
// Each page used to carry its own hand-copied header and footer, and they had
// drifted: four different footers, dead links, and a hamburger button that only
// worked on the one page that remembered to load nav.js. Owning the markup here
// means a change lands everywhere at once.
//
// Two rules keep this safe to inject into any page:
//
//   1. Only stock Tailwind utilities plus the colour tokens (primary, surface-*,
//      outline-variant, ...) that all five pages define identically. The custom
//      spacing and font tokens are NOT consistent — directory.html and the
//      faculty page define `page` where the others define `margin-page`, and
//      only some define `body-md` — so a token used here would silently collapse
//      to nothing on the pages that lack it.
//   2. Paths are resolved against wherever this script was loaded from, so the
//      copy in "Faculty co  ord/" gets its ../ prefixes without extra config.
//
// The Tailwind Play CDN watches the DOM, so classes on injected markup are
// generated just like the ones present at parse time.
(function () {
    'use strict';

    // Where the site root is, relative to the current page. Taken from this
    // script's own src ("../site-chrome.js" -> "../"), so a page in a
    // subdirectory needs no configuration.
    var BASE = (function () {
        var script = document.currentScript;
        if (!script) return '';
        var src = script.getAttribute('src') || '';
        return src.replace(/site-chrome\.js.*$/, '');
    })();

    var FEEDBACK_URL = 'https://app.youform.com/forms/7nivpjkd';
    var DOST_URL = 'https://dost.iitm.ac.in';
    var CONTACT_EMAIL = 'mitrevents@smail.iitm.ac.in';

    // key is matched against the current filename to mark the active link.
    var NAV = [
        { key: 'index', label: 'Home', href: 'index.html' },
        { key: 'emergency', label: 'Support Desk', href: 'emergency.html' },
        { key: 'directory', label: 'Contact Us', href: 'directory.html' },
        { key: 'yearbook', label: 'Gallery', href: 'yearbook.html' },
        { key: 'selfcheck', label: 'Self-Check Up', href: FEEDBACK_URL, external: true }
    ];

    function url(href, external) {
        return external ? href : BASE + href;
    }

    // A directory page nested under "Faculty co  ord/" is still the Contact Us
    // section, so the basename alone is enough to pick the active link.
    function activeKey() {
        var file = window.location.pathname.split('/').pop() || 'index.html';
        var key = file.replace(/\.html$/, '');
        for (var i = 0; i < NAV.length; i++) {
            if (NAV[i].key === key) return key;
        }
        return 'index';
    }

    function navLinks(active, mobile) {
        return NAV.map(function (item) {
            var isActive = !item.external && item.key === active;
            var cls = mobile
                ? (isActive
                    ? 'text-primary font-bold text-base py-3'
                    : 'text-on-surface-variant text-base py-3')
                : (isActive
                    ? 'text-primary border-b-2 border-primary pb-1 font-bold text-base'
                    : 'text-on-surface-variant hover:text-primary transition-colors text-base');
            return '<a href="' + url(item.href, item.external) + '"'
                + (item.external ? ' target="_blank" rel="noopener"' : '')
                + (isActive ? ' aria-current="page"' : '')
                + ' class="' + cls + '">' + item.label + '</a>';
        }).join('');
    }

    function headerHtml(active) {
        return '' +
        '<header class="fixed top-0 z-50 w-full bg-surface/60 backdrop-blur-md border-b border-transparent transition-all duration-500 h-20" id="main-header">' +
          '<div class="flex justify-between items-center w-full px-6 lg:px-16 max-w-screen-2xl mx-auto h-full">' +
            '<a href="' + url('index.html') + '" class="flex items-center gap-4">' +
              '<img alt="IIT Madras Logo" class="h-12 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW1n8lOW9_eqQl9UfG96njTZrftuphW1MbaA6n6q1Xcy5pzrYEkSKoxllnCHXsVxeDOGYc-JXXD77-moN7w4CbZ3yPv9ecW6vxl6JiHqJAFx9TBBq1iwPcUO9NK_aquo5q3H_qOEVmu9pzQcTOKAh6no-dPiiJmo75zCY8EUPomFxqW5rAuUPOh9Iiv1lhD_XOJxbe4jXwJjoXUfBoZGKCdO6MsaoOb_Go1HbOQleX7Y8ZWC_kwvzYvLlOnD8yTVR4">' +
              '<span class="h-10 w-px bg-outline-variant/40"></span>' +
              '<img alt="Team MITR" class="h-12 w-auto" src="' + BASE + 'mitr-logo.png">' +
            '</a>' +
            '<nav class="hidden md:flex items-center space-x-8" aria-label="Main">' +
              navLinks(active, false) +
            '</nav>' +
            '<div class="flex items-center gap-6">' +
              '<button class="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:scale-95 transition-transform duration-200" id="sos-btn" data-support-btn type="button">Support</button>' +
              '<a href="' + DOST_URL + '" target="_blank" rel="noopener">' +
                '<img src="' + BASE + 'dostiitmlogo.svg" alt="Dost IITM" class="h-12 w-auto cursor-pointer hover:opacity-70 transition-opacity">' +
              '</a>' +
              '<button aria-controls="mobile-menu" aria-expanded="false" aria-label="Open menu" class="md:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-full text-primary hover:bg-primary/5 transition-colors" id="mobile-menu-btn" type="button">' +
                '<span class="material-symbols-outlined text-3xl">menu</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<nav class="hidden md:hidden absolute top-20 inset-x-0 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-lg px-6 py-4 flex-col" id="mobile-menu" aria-label="Mobile">' +
            navLinks(active, true) +
            '<button class="bg-primary text-on-primary mt-3 px-6 py-3 rounded-full font-bold active:scale-95 transition-transform duration-200" data-support-btn type="button">Support</button>' +
          '</nav>' +
        '</header>';
    }

    function footerHtml() {
        var link = 'text-on-surface-variant hover:text-secondary transition-colors hover:underline';
        var links = NAV.map(function (item) {
            return '<a class="' + link + '" href="' + url(item.href, item.external) + '"'
                + (item.external ? ' target="_blank" rel="noopener"' : '')
                + '>' + item.label + '</a>';
        }).join('');

        return '' +
        // mt-auto keeps the footer pinned to the bottom on short pages whose
        // body is a min-h-screen flex column (directory.html); it computes to 0
        // in normal block flow, so the other pages are unaffected.
        '<footer class="w-full mt-auto px-6 lg:px-16 py-16 flex flex-col items-center gap-8 bg-surface-container border-t border-outline-variant/50">' +
          '<div class="flex flex-col items-center gap-6">' +
            // Logo only — the mark already carries the wordmark and the "In need
            // and indeed for you" line, so a repeated "IITM MITR" heading beside
            // it was saying the same thing twice.
            '<img alt="Team MITR — In need and indeed for you" class="h-20 w-auto" src="' + BASE + 'mitr-logo.png">' +
            '<nav class="flex flex-wrap justify-center gap-x-8 gap-y-3 text-base" aria-label="Footer">' +
              links +
              '<a class="' + link + '" href="' + FEEDBACK_URL + '" target="_blank" rel="noopener">Feedback</a>' +
            '</nav>' +
          '</div>' +
          '<div class="w-full max-w-screen-xl border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">' +
            '<p class="text-sm text-on-surface-variant text-center">&copy; 2026 Indian Institute of Technology Madras. All rights reserved.</p>' +
            '<div class="flex gap-6 text-on-surface-variant">' +
              '<a href="' + DOST_URL + '" target="_blank" rel="noopener" aria-label="DoSt IIT Madras" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">public</span></a>' +
              '<a href="mailto:' + CONTACT_EMAIL + '" aria-label="Email Team MITR" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">alternate_email</span></a>' +
            '</div>' +
          '</div>' +
        '</footer>';
    }

    // The desks behind the header's Support button. Each row is a tel: link, so
    // choosing one dials it directly.
    var CAMPUS_DESKS = [
        ['Emergency Hotline', 'Available 24/7', '+91 44 2257 8000', '+914422578000'],
        ['Institute Hospital', 'Medical emergencies and clinical consultation', '044 2257 8330', '04422578330'],
        ['Campus Security', 'Immediate safety threats anywhere on campus', '044 2257 8280', '04422578280'],
        ['Wellness Centre', 'Counselling support, Mon to Sat, 10 am – 6 pm', '044 2257 8521', '04422578521']
    ];

    var NATIONAL_DESKS = [
        ['Tele-MANAS', 'Government of India mental health helpline — free, 24/7, in 20 languages', '14416', '14416'],
        ['Emergency Services', 'Police, fire and ambulance — the all-India emergency number', '112', '112']
    ];

    function deskRows(desks) {
        return desks.map(function (d) {
            return '' +
            '<a class="flex items-center justify-between gap-4 bg-surface-container hover:bg-surface-container-high rounded-2xl px-4 py-3 transition-colors" href="tel:' + d[3] + '">' +
              '<span class="flex flex-col">' +
                '<span class="font-bold text-on-surface">' + d[0] + '</span>' +
                '<span class="text-sm text-on-surface-variant">' + d[1] + '</span>' +
                '<span class="text-sm text-secondary font-bold">' + d[2] + '</span>' +
              '</span>' +
              '<span class="material-symbols-outlined text-secondary">call</span>' +
            '</a>';
        }).join('');
    }

    function sosHtml() {
        return '' +
        '<div id="sos-modal" role="dialog" aria-modal="true" aria-labelledby="sos-modal-title"' +
        '     class="hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm items-center justify-center p-6">' +
          '<div class="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-[85vh] overflow-y-auto">' +
            '<div class="flex items-start justify-between gap-4 mb-2">' +
              '<h3 class="text-2xl font-bold text-on-surface" id="sos-modal-title" style="font-family:\'Newsreader\',serif">Call for help</h3>' +
              '<button id="sos-modal-close" type="button" aria-label="Close"' +
              '        class="material-symbols-outlined text-on-surface-variant hover:text-primary leading-none">close</button>' +
            '</div>' +
            '<p class="text-on-surface-variant mb-6">Choose the desk you need — tapping a number dials it straight away.</p>' +
            '<div class="space-y-3">' + deskRows(CAMPUS_DESKS) + '</div>' +
            '<p class="text-xs uppercase tracking-widest text-on-surface-variant mt-8 mb-3">National helplines</p>' +
            '<div class="space-y-3">' + deskRows(NATIONAL_DESKS) + '</div>' +
            '<a class="mt-6 flex items-center justify-center gap-2 text-primary font-bold hover:underline" href="' + url('emergency.html') + '">' +
              'See all emergency contacts<span class="material-symbols-outlined text-base">arrow_forward</span>' +
            '</a>' +
          '</div>' +
        '</div>';
    }

    // Below md the desktop <nav> is hidden, so this panel is the only way to
    // move between pages. (Behaviour moved here from the old nav.js.)
    function wireMobileMenu() {
        var btn = document.getElementById('mobile-menu-btn');
        var panel = document.getElementById('mobile-menu');
        if (!btn || !panel) return;

        function isOpen() { return !panel.classList.contains('hidden'); }
        function open() {
            panel.classList.remove('hidden');
            panel.classList.add('flex');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Close menu');
        }
        function close() {
            panel.classList.add('hidden');
            panel.classList.remove('flex');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Open menu');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isOpen()) close(); else open();
        });

        // Tapping outside dismisses. The button stops propagation above so its
        // own click still toggles rather than immediately re-closing.
        document.addEventListener('click', function (e) {
            if (isOpen() && !panel.contains(e.target)) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) { close(); btn.focus(); }
        });

        // Widening past md swaps the desktop nav back in; an open panel would
        // otherwise be stranded on screen with nothing to close it.
        var desktop = window.matchMedia('(min-width: 768px)');
        var onWidthChange = function (e) { if (e.matches) close(); };
        if (desktop.addEventListener) {
            desktop.addEventListener('change', onWidthChange);
        } else {
            desktop.addListener(onWidthChange); // Safari < 14
        }
    }

    // Support opens the "Call for help" dialog on every page. It used to only
    // work on the home page, which was the one page carrying the markup;
    // everywhere else the button just navigated to the support desk page, which
    // is the slowest possible route to a phone number in an emergency.
    function wireSupportButtons() {
        var modal = document.getElementById('sos-modal');
        var buttons = document.querySelectorAll('[data-support-btn]');

        // Injected only when the page hasn't kept its own copy.
        if (!modal) {
            var host = document.createElement('div');
            host.innerHTML = sosHtml();
            modal = host.firstElementChild;
            document.body.appendChild(modal);
        }

        var closeBtn = document.getElementById('sos-modal-close');

        // Toggling `flex` rather than leaving it on avoids relying on `hidden`
        // winning the display cascade against it.
        function open() {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        function close() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        Array.prototype.forEach.call(buttons, function (btn) {
            btn.addEventListener('click', open);
        });
        if (closeBtn) closeBtn.addEventListener('click', close);
        modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });
    }

    function init() {
        var headerSlot = document.querySelector('[data-site-header]');
        var footerSlot = document.querySelector('[data-site-footer]');

        if (headerSlot) headerSlot.outerHTML = headerHtml(activeKey());
        if (footerSlot) footerSlot.outerHTML = footerHtml();

        wireMobileMenu();
        wireSupportButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
