// Interactive Engine for IITM MITR Wellness Portal

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDarkMode();
  initDirectorySearch();
  initYearbookModal();
  initSOSModal();
  initEventFilters();
  initFeedbackForm();
});

// 1. Single Page & Multi-page Tab Navigation Handler
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Handle Hash routing for SPA feel
  function switchTab(tabId) {
    if (!tabId) tabId = 'home';
    tabId = tabId.replace('#', '');
    
    let targetTab = document.getElementById(`tab-${tabId}`);
    if (!targetTab) {
      tabId = 'home';
      targetTab = document.getElementById('tab-home');
    }

    tabContents.forEach(content => {
      content.classList.remove('active');
    });

    if (targetTab) {
      targetTab.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav active states
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes(`#${tabId}`) || href.includes(`${tabId}.html`)) {
        link.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-primary');
        link.classList.remove('text-on-surface-variant');
      } else {
        link.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
        link.classList.add('text-on-surface-variant');
      }
    });

    // Close mobile menu if open
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }
  }

  // Bind clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const tabId = href.substring(1);
        window.location.hash = tabId;
        switchTab(tabId);
      }
    });
  });

  // Listen to hash changes
  window.addEventListener('hashchange', () => {
    switchTab(window.location.hash);
  });

  // Initial tab load
  if (window.location.hash) {
    switchTab(window.location.hash);
  }

  // Mobile Menu Toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

// 2. Dark Mode Toggle with localStorage
function initDarkMode() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const isDark = localStorage.getItem('mitr_theme') === 'dark' || 
    (!('mitr_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const currentDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('mitr_theme', currentDark ? 'dark' : 'light');
    });
  }
}

// 3. Coordinator Directory Search & Filtering
function initDirectorySearch() {
  const searchInput = document.getElementById('directory-search-input');
  const categoryFilter = document.getElementById('directory-category-filter');
  const cards = document.querySelectorAll('.coordinator-card');
  const noResultsMsg = document.getElementById('directory-no-results');

  if (!searchInput) return;

  function filterCoordinators() {
    const query = searchInput.value.toLowerCase().trim();
    const category = categoryFilter ? categoryFilter.value.toLowerCase() : 'all';
    let visibleCount = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cardCategory = card.getAttribute('data-category') || '';

      const matchesSearch = query === '' || text.includes(query);
      const matchesCategory = category === 'all' || cardCategory === category;

      if (matchesSearch && matchesCategory) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  searchInput.addEventListener('input', filterCoordinators);
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterCoordinators);
  }
}

// 4. Interactive Yearbook Preview Modal
function initYearbookModal() {
  const modal = document.getElementById('yearbook-modal');
  const closeBtn = document.getElementById('close-yearbook-modal');
  const previewBtns = document.querySelectorAll('.view-yearbook-btn');
  const modalTitle = document.getElementById('yearbook-modal-title');

  if (!modal) return;

  previewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const year = btn.getAttribute('data-year') || '2024-2025';
      if (modalTitle) modalTitle.textContent = `MITR Year Book (${year} Edition)`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}

// 5. Emergency SOS Quick Modal
function initSOSModal() {
  const sosModal = document.getElementById('sos-modal');
  const triggerBtns = document.querySelectorAll('.trigger-sos-btn');
  const closeBtn = document.getElementById('close-sos-modal');

  if (!sosModal) return;

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sosModal.classList.remove('hidden');
      sosModal.classList.add('flex');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sosModal.classList.add('hidden');
      sosModal.classList.remove('flex');
    });
  }

  sosModal.addEventListener('click', (e) => {
    if (e.target === sosModal) {
      sosModal.classList.add('hidden');
      sosModal.classList.remove('flex');
    }
  });
}

// 6. Events & De-stressing Workshops Filter
function initEventFilters() {
  const eventTabs = document.querySelectorAll('.event-filter-tab');
  const eventCards = document.querySelectorAll('.event-item-card');

  if (!eventTabs.length) return;

  eventTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');

      eventTabs.forEach(t => {
        t.classList.remove('bg-primary', 'text-on-primary');
        t.classList.add('bg-surface-container', 'text-on-surface-variant');
      });

      tab.classList.add('bg-primary', 'text-on-primary');
      tab.classList.remove('bg-surface-container', 'text-on-surface-variant');

      eventCards.forEach(card => {
        const type = card.getAttribute('data-event-type');
        if (filter === 'all' || type === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// 7. Interactive Feedback / Survey Form
function initFeedbackForm() {
  const form = document.getElementById('mitr-feedback-form');
  const successNotice = document.getElementById('feedback-success-alert');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (successNotice) {
      successNotice.classList.remove('hidden');
      form.reset();
      setTimeout(() => {
        successNotice.classList.add('hidden');
      }, 5000);
    }
  });
}
