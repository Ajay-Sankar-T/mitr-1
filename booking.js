// Shared "Book a Session" modal, used by the Schedule a Session button on the
// home page and the Book Slot button on the emergency page.
//
// No backend or storage is involved: submitting opens a pre-filled Gmail
// compose window addressed to the chosen venue, and the visitor sends it
// themselves from their own inbox.
//
// Each page supplies the modal markup (so Tailwind sees the classes up front);
// this file owns the venue list and all of the behaviour, so the two pages
// cannot drift apart.
(function () {
    'use strict';

    var VENUES = [
        { label: 'Institute Hospital', email: 'cmo@iitm.ac.in' },
        {
            label: 'Wellness Centre — 1st Floor, DoSt Office',
            email: 'wellness1@smail.iitm.ac.in'
        },
        {
            label: 'YourDOST — 2nd Floor, Central Library',
            // Placeholder — no real desk email was given for the library;
            // swap this for the actual address before deploy.
            email: 'library.counsellor@iitm.ac.in'
        }
    ];

    function init() {
        var modal = document.getElementById('booking-modal');
        if (!modal) return;

        var openers = document.querySelectorAll('[data-open-booking]');
        if (!openers.length) return;

        var closeBtn = document.getElementById('booking-modal-close');
        var cancelBtn = document.getElementById('booking-cancel');
        var form = document.getElementById('booking-form');
        var dateInput = document.getElementById('booking-date');
        var timeInput = document.getElementById('booking-time');
        var venueInput = document.getElementById('booking-venue');
        var messageInput = document.getElementById('booking-message');
        var errorEl = document.getElementById('booking-error');
        var successEl = document.getElementById('booking-success');

        VENUES.forEach(function (venue) {
            var option = document.createElement('option');
            option.textContent = venue.label;
            venueInput.appendChild(option);
        });

        function emailForVenue(label) {
            for (var i = 0; i < VENUES.length; i++) {
                if (VENUES[i].label === label) return VENUES[i].email;
            }
            return null;
        }

        function todayStr() {
            var d = new Date();
            var yyyy = d.getFullYear();
            var mm = String(d.getMonth() + 1).padStart(2, '0');
            var dd = String(d.getDate()).padStart(2, '0');
            return yyyy + '-' + mm + '-' + dd;
        }

        function formatDateForEmail(dateVal) {
            var parts = dateVal.split('-');
            var d = new Date(parts[0], parts[1] - 1, parts[2]);
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        function formatTimeForEmail(timeVal) {
            var parts = timeVal.split(':');
            var d = new Date();
            d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10));
            return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
        }

        function openModal() {
            form.reset();
            form.classList.remove('hidden');
            errorEl.classList.add('hidden');
            successEl.classList.add('hidden');
            dateInput.min = todayStr();
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        Array.prototype.forEach.call(openers, function (btn) {
            btn.addEventListener('click', openModal);
        });
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            errorEl.classList.add('hidden');

            var dateVal = dateInput.value;
            var timeVal = timeInput.value;
            var venueVal = venueInput.value;

            if (!dateVal || !venueVal) {
                errorEl.textContent = 'Please fill in date and venue.';
                errorEl.classList.remove('hidden');
                return;
            }

            // Time is optional. With a time, the whole moment must be in the
            // future; without one, the date alone just can't be in the past.
            var chosen = timeVal
                ? new Date(dateVal + 'T' + timeVal)
                : new Date(dateVal + 'T23:59');
            if (isNaN(chosen.getTime()) || chosen.getTime() <= Date.now()) {
                errorEl.textContent = timeVal
                    ? 'Please choose a date and time in the future.'
                    : 'Please choose a date in the future.';
                errorEl.classList.remove('hidden');
                return;
            }

            var recipient = emailForVenue(venueVal);
            if (!recipient) {
                errorEl.textContent = 'This venue is not set up for booking yet.';
                errorEl.classList.remove('hidden');
                return;
            }

            var messageVal = messageInput ? messageInput.value.trim() : '';

            var subject = 'Counselling Session Request via MITR Website — '
                + formatDateForEmail(dateVal) + ', ' + venueVal;

            var body = 'Hello,\n\n' +
                'I am a member of the IIT Madras campus community and I am reaching out '
                + 'because I would like support for my emotional wellbeing. I am requesting '
                + 'a counselling session at the slot below.\n\n' +
                'Requested date:  ' + formatDateForEmail(dateVal) + '\n' +
                'Requested time:  ' + (timeVal
                    ? formatTimeForEmail(timeVal)
                    : 'No specific time — any slot that works for you') + '\n' +
                'Preferred venue: ' + venueVal + '\n\n';

            if (messageVal) {
                body += 'What I would like you to know beforehand:\n'
                    + messageVal + '\n\n';
            }

            body += 'Please confirm whether this slot works, or suggest the nearest '
                + 'available one. If this request needs to be redirected to a different '
                + 'desk, kindly let me know.\n\n' +
                'Thank you for your time and support.\n\n' +
                '—\n' +
                'Sent from the Team MITR wellness portal.\n' +
                'This request was submitted through the website booking form and is '
                + 'awaiting confirmation.';

            var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1'
                + '&to=' + encodeURIComponent(recipient)
                + '&su=' + encodeURIComponent(subject)
                + '&body=' + encodeURIComponent(body);

            // Opened synchronously in response to the click, so it isn't
            // blocked as an unrequested popup.
            window.open(gmailUrl, '_blank');

            form.classList.add('hidden');
            successEl.textContent = 'Opening Gmail with your request filled in — just hit send from there.';
            successEl.classList.remove('hidden');
            setTimeout(closeModal, 1800);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
