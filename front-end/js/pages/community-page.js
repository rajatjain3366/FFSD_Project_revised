/**
 * NexusHub — Community Page Interactive Logic
 * Handles tab switching, sidebar toggle, join button, chat interface, member search, etc.
 */

// ==========================================
// 1. TAB SWITCHING
// ==========================================
window.switchTab = function(tabName, btn) {
    // Deactivate all tabs and tab content
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activate the selected tab and its content
    if (btn) btn.classList.add('active');
    const target = document.getElementById('tab-' + tabName);
    if (target) target.classList.add('active');
};

// ==========================================
// 2. SIDEBAR TOGGLE
// ==========================================
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('expanded');
};

// ==========================================
// 3. JOIN / LEAVE BUTTON
// ==========================================
window.toggleMainJoin = function() {
    const btn = document.getElementById('joinMainBtn');
    if (!btn) return;

    if (btn.classList.contains('joined')) {
        btn.classList.remove('joined');
        btn.textContent = '+ Join Community';
        btn.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-hover))';
        btn.style.color = '#fff';
    } else {
        btn.classList.add('joined');
        btn.textContent = '✓ Joined';
        btn.style.background = 'var(--success)';
        btn.style.color = '#fff';
    }
};

// Initialize join button state
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('joinMainBtn');
    if (btn && btn.textContent.includes('Joined')) {
        btn.classList.add('joined');
    }
});

// ==========================================
// 4. CHAT INTERFACE (Channel Click)
// ==========================================
window.openChatInterface = function(channelName) {
    const clean = channelName.replace('#', '');
    window.location.href = `chat.html?channel=${encodeURIComponent(clean)}`;
};

// ==========================================
// 5. MEMBER SEARCH / FILTER
// ==========================================
window.filterMembers = function(query) {
    const q = query.toLowerCase().trim();
    const cards = document.querySelectorAll('.member-card');

    cards.forEach(card => {
        const name = card.querySelector('.m-name');
        if (name) {
            const match = name.textContent.toLowerCase().includes(q);
            card.style.display = match ? '' : 'none';
        }
    });
};

// ==========================================
// 6. REACTION TOGGLE
// ==========================================
window.toggleFPS = function(el) {
    const countEl = el.querySelector('.FPS-count');
    if (!countEl) return;

    let count = parseInt(countEl.textContent);
    if (el.classList.contains('reacted')) {
        el.classList.remove('reacted');
        countEl.textContent = count - 1;
    } else {
        el.classList.add('reacted');
        countEl.textContent = count + 1;
    }
};

// ==========================================
// 7. MESSAGE CONTEXT MENU
// ==========================================
window.showMessageMenu = function(btn) {
    // Remove any existing menus
    document.querySelectorAll('.msg-context-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'msg-context-menu';
    menu.style.cssText = `
        position: absolute; right: 0; top: 100%;
        background: var(--bg-card, #151d2f); border: 1px solid var(--border, rgba(255,255,255,0.08));
        border-radius: 8px; padding: 6px 0; min-width: 140px; z-index: 100;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4); font-size: 13px;
    `;
    menu.innerHTML = `
        <div style="padding:6px 14px;cursor:pointer;color:var(--text-2)" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='none'">📋 Copy Text</div>
        <div style="padding:6px 14px;cursor:pointer;color:var(--text-2)" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='none'">📌 Pin Message</div>
        <div style="padding:6px 14px;cursor:pointer;color:var(--text-2)" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='none'">🚩 Report</div>
    `;

    btn.style.position = 'relative';
    btn.appendChild(menu);

    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', function close(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', close);
            }
        });
    }, 10);
};