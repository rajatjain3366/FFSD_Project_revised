/**
 * NexusHub — Home Dashboard Logic
 * Handles community interactions, join states, and notification management.
 */

// ==========================================
// 1. STATE & MOCK DATA
// ==========================================
let unreadMessages = 12;

// ==========================================
// 2. SIDEBAR TOGGLE FUNCTIONALITY
// ==========================================

/**
 * Toggles sidebar expansion state
 * Switches between compact (72px) and expanded (240px) modes
 */
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('expanded');
    }
};

window.toggleJoin = function(btn) {
    const card = btn.closest('.rec-card');
    const isJoined = btn.classList.contains('joined');

    if (!isJoined) {
        // Join State
        btn.classList.add('joined');
        btn.textContent = '✓ Joined';
        
        // Optional: Trigger global toast if available
        if (window.toast) {
            const name = card.querySelector('.rec-name').textContent;
            window.toast(`Welcome to ${name}! 🚀`);
        }
        
        // Update local stat display if needed
        updateHeaderStats('Communities', 1);
    } else {
        // Unjoin State
        btn.classList.remove('joined');
        btn.textContent = 'Join';
        
        updateHeaderStats('Communities', -1);
    }
};

/**
 * Updates the numbers in the greeting banner dynamically
 */
function updateHeaderStats(label, delta) {
    const stats = document.querySelectorAll('.g-stat');
    stats.forEach(stat => {
        const statLabel = stat.querySelector('.g-stat-label');
        if (statLabel && statLabel.textContent === label) {
            const valEl = stat.querySelector('.g-stat-val');
            let currentVal = parseInt(valEl.textContent);
            valEl.textContent = currentVal + delta;
        }
    });
}

// ==========================================
// 3. NOTIFICATION MANAGEMENT
// ==========================================

/**
 * Clears all unread indicators from the notification list
 */
window.markAllRead = function() {
    const unreadItems = document.querySelectorAll('.notif-item.unread');
    const unreadDots = document.querySelectorAll('.notif-unread-dot');
    
    // Animate out dots
    unreadDots.forEach(dot => {
        dot.style.transform = 'scale(0)';
        dot.style.opacity = '0';
        setTimeout(() => dot.remove(), 300);
    });

    // Remove unread classes
    unreadItems.forEach(item => {
        item.style.transition = 'background 0.5s ease';
        item.classList.remove('unread');
    });

    // Update Header badge
    const headerBadge = document.querySelector('.header-actions .notif-dot');
    if (headerBadge) headerBadge.remove();

    if (window.toast) window.toast("All notifications marked as read");
};

// ==========================================
// 4. AUTHENTICATION
// ==========================================

/**
 * Handles user logout functionality
 * Clears session data and redirects to login page
 */
window.logout = function() {
    // Clear session data
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_owned_communities');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Show confirmation toast if available
    if (window.toast) {
        window.toast("Logging out... 👋");
    }
    
    // Redirect to landing page
    setTimeout(() => {
        window.location.href = 'landing.html';
    }, 1000);
};

// ==========================================
// 5. SCROLL UTILITIES
// ==========================================

/**
 * Enables smooth mouse-wheel horizontal scrolling for the community list
 */
function initHorizontalScroll() {
    const scrollContainer = document.querySelector('.communities-scroll');
    if (!scrollContainer) return;

    scrollContainer.addEventListener('wheel', (evt) => {
        evt.preventDefault();
        scrollContainer.scrollLeft += evt.deltaY;
    });
}

// ==========================================
// 5. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initHorizontalScroll();

    // Hook up "Mark all read" link if it exists in the DOM
    const markReadBtn = document.querySelector('.section-link');
    // We check textContent to target the specific "Mark all read" link
    if (markReadBtn && markReadBtn.textContent.includes('Mark all read')) {
        markReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.markAllRead();
        });
    }

    console.log("Home Dashboard Module Initialized.");
});