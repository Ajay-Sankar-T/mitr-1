// Shared mobile navigation, used by the hamburger button in the header of
// every page. Below the md breakpoint the desktop <nav> is hidden, so this
// panel is the only way to move between pages.
//
// Each page supplies the button and panel markup (so Tailwind sees the classes
// up front, and so each page can mark its own link as the active one); this
// file owns all of the behaviour, so the four headers cannot drift apart.
(function () {
    'use strict';

    // Matches Tailwind's md breakpoint, where the desktop <nav> takes over.
    var DESKTOP = '(min-width: 768px)';

    function init() {
        var btn = document.getElementById('mobile-menu-btn');
        var panel = document.getElementById('mobile-menu');
        if (!btn || !panel) return;

        function isOpen() {
            return !panel.classList.contains('hidden');
        }

        function open() {
            panel.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Close menu');
        }

        function close() {
            panel.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Open menu');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isOpen()) close(); else open();
        });

        // Tapping anywhere outside the panel dismisses it. The button is
        // excluded via stopPropagation above so its own click still toggles.
        document.addEventListener('click', function (e) {
            if (isOpen() && !panel.contains(e.target)) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) {
                close();
                btn.focus();
            }
        });

        // Widening past md swaps the desktop <nav> back in; leaving the panel
        // open would strand it on screen with nothing to close it.
        var desktop = window.matchMedia(DESKTOP);
        var onWidthChange = function (e) { if (e.matches) close(); };
        if (desktop.addEventListener) {
            desktop.addEventListener('change', onWidthChange);
        } else {
            // Safari < 14 only has the deprecated listener API.
            desktop.addListener(onWidthChange);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
