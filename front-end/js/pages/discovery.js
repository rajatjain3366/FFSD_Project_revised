/**
 * NexusHub — Community Discovery Logic
 * Handles real-time filtering, category chip management, and keyboard shortcuts.
 */

// ==========================================
// 1. STATE & CONFIG
// ==========================================
let activeCategory = 'all';
let searchTimeout;

// ==========================================
// 2. FILTERING ENGINE
// ==========================================

/**
 * Sets the active category chip and triggers a re-filter
 */
window.setChip = function(el, category) {
    // UI: Active State
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    
    activeCategory = category;
    applyFilters();
};

/**
 * Orchestrates both Category and Search Query filtering
 */
function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.c-card');
    const featuredBanner = document.getElementById('featuredBanner');
    let visibleCount = 0;

    cards.forEach(card => {
        // 1. Category Match
        const cardCat = card.dataset.cat;
        const matchesCategory = (activeCategory === 'all' || cardCat === activeCategory);

        // 2. Search Query Match
        const name = card.querySelector('.c-name').textContent.toLowerCase();
        const desc = card.querySelector('.c-desc').textContent.toLowerCase();
        const tags = card.querySelector('.c-cat').textContent.toLowerCase();
        const matchesQuery = !query || [name, desc, tags].some(text => text.includes(query));

        const shouldShow = matchesCategory && matchesQuery;
        card.style.display = shouldShow ? '' : 'none';
        
        if (shouldShow) visibleCount++;
    });

    // Update Counter
    const countDisplay = document.getElementById('gridCount');
    if (countDisplay) {
        countDisplay.textContent = `Showing ${visibleCount} of 50,214`;
    }

    // Contextual Featured Banner Visibility
    if (featuredBanner) {
        // Only show featured if it fits the category or we are in 'all'
        const relevantToAI = ['all', 'tech', 'science'].includes(activeCategory);
        featuredBanner.style.display = relevantToAI ? 'flex' : 'none';
    }
}

// Debounced version of filter for input performance
window.filterCards = function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 150);
};

// ==========================================
// 3. JOIN LOGIC
// ==========================================

window.toggleJoin = function(btn) {
    const isJoined = btn.classList.contains('joined');
    
    if (isJoined) {
        btn.classList.remove('joined');
        btn.textContent = 'Join';
    } else {
        btn.classList.add('joined');
        btn.textContent = '✓ Joined';
        
        // Trigger global toast if present
        if (window.toast) {
            const name = btn.closest('.c-card-body').querySelector('.c-name').textContent;
            window.toast(`Welcome to ${name}! ⚡`);
        }
    }
};

window.toggleJoinFeat = function(btn) {
    if (btn.textContent === 'Join Community') {
        btn.textContent = '✓ Joined';
        btn.style.background = 'linear-gradient(135deg, #34D399, #059669)';
        btn.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
    } else {
        btn.textContent = 'Join Community';
        btn.style.background = '';
        btn.style.boxShadow = '';
    }
};

// ==========================================
// 4. KEYBOARD SHORTCUTS
// ==========================================

function handleShortcuts(e) {
    // CMD/CTRL + K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
}

// ==========================================
// 5. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Listen for global keyboard shortcuts
    window.addEventListener('keydown', handleShortcuts);

    // Initial Filter Apply
    applyFilters();

    console.log("Discovery module initialized. Press ⌘K to search.");
});