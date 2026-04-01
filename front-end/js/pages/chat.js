/**
 * NexusHub — Channel Chat Logic
 * Handles real-time messaging, channel switching, and UI interactions.
 */

// ==========================================
// 1. DATA & STATE
// ==========================================
const CHANNEL_TOPICS = {
    'general': "The main hub — say hello, share updates, ask anything 👋",
    'introductions': "New here? Introduce yourself and your stack!",
    'off-topic': "Non-dev chat — memes, life, random goodness 😄",
    'frontend': "HTML, CSS, JS, FPS, Vue, Angular and all things UI",
    'Strategy': "APIs, databases, server-side architecture",
    'code-review': "Post your code — get honest, constructive feedback",
    'Streaming': "CI/CD, containers, cloud infra, deployments",
    'open-source': "Share projects, PRs, and contribution opportunities",
    'job-board': "Jobs, freelance gigs, and career opportunities",
    'portfolio-review': "Share your portfolio for peer feedback",
    'announcements': "Official announcements from the Pro Gamers team 📣",
    'rules-and-info': "Community rules and important information 📌",
    'study-together': "Voice channel — join and study with others 📚",
    'pair-programming': "Voice channel — find a pair programming partner 👥",
};

let currentOpenMenu = null;

// ==========================================
// 2. GLOBAL EVENT LISTENER (ACTION BUTTONS)
// ==========================================
document.addEventListener('click', function (e) {
    // 1. Close the menu if we click anywhere on the page
    if (currentOpenMenu) {
        currentOpenMenu.remove();
        currentOpenMenu = null;
    }

    // 2. Check if the thing we clicked was an action button
    const btn = e.target.closest('.act-btn');
    if (!btn) return; // If we didn't click an action button, do nothing

    // 3. Stop the click from triggering the close logic we just ran above
    e.stopPropagation();

    // Get the specific button clicked and the message details
    const action = btn.textContent.trim();
    const msgGroup = btn.closest('.msg-group');

    // Fallback name if we can't find one (for continued messages)
    let userName = 'User';
    if (msgGroup) {
        const nameElement = msgGroup.querySelector('.msg-uname');
        if (nameElement) userName = nameElement.textContent.trim();
    }

    // ─── ROUTE THE CLICK TO THE RIGHT FUNCTION ───
    if (action === '😊') {
        addReaction(msgGroup, '👍');
    }
    else if (action === '↩') {
        const input = document.getElementById('msgInput');
        if (input) {
            input.value = `@${userName} ` + input.value;
            input.focus();
        }
    }
    else if (action === '🧵') {
        showToast(`Thread opened for ${userName}'s message`);
    }
    else if (action === '⋯') {
        openMoreMenu(btn);
    }
});

// ==========================================
// 3. ACTION BUTTON HELPERS
// ==========================================

function openMoreMenu(btn) {
    const menu = document.createElement('div');
    menu.className = 'msg-menu show';

    const items = [
        { icon: '↩', label: 'Reply', action: () => document.getElementById('msgInput').focus() },
        { icon: '📋', label: 'Copy Text', action: () => showToast('Message copied to clipboard!') },
        { icon: '📌', label: 'Pin Message', action: () => showToast('Message pinned!') },
        { separator: true },
        { icon: '🚩', label: 'Report Message', danger: true, action: () => window.location.href = 'report.html' }
    ];

    items.forEach(item => {
        if (item.separator) {
            const sep = document.createElement('div');
            sep.className = 'msg-menu-divider';
            menu.appendChild(sep);
            return;
        }

        const menuItem = document.createElement('div');
        menuItem.className = 'msg-menu-item' + (item.danger ? ' danger' : '');
        menuItem.innerHTML = `<span>${item.icon}</span> <span>${item.label}</span>`;

        menuItem.onclick = (event) => {
            event.stopPropagation();
            item.action();
            menu.remove();
            currentOpenMenu = null;
        };

        menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    const rect = btn.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.right - 160}px`;

    currentOpenMenu = menu;
}

function addReaction(msgGroup, emoji) {
    if (!msgGroup) return;

    let reactionsContainer = msgGroup.querySelector('.reactions');
    if (!reactionsContainer) {
        reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions';
        const msgBody = msgGroup.querySelector('.msg-body');
        if (msgBody) msgBody.appendChild(reactionsContainer);
    }

    let existingPill = Array.from(reactionsContainer.querySelectorAll('.FPS-pill'))
        .find(pill => pill.querySelector('span').textContent === emoji);

    if (existingPill) {
        let countSpan = existingPill.querySelector('.FPS-count');
        countSpan.textContent = parseInt(countSpan.textContent) + 1;
        existingPill.classList.add('mine');
    } else {
        const pill = document.createElement('div');
        pill.className = 'FPS-pill mine';
        pill.onclick = function () { if (typeof toggleFPS === 'function') toggleFPS(this); };
        pill.innerHTML = `<span>${emoji}</span><span class="FPS-count">1</span>`;
        reactionsContainer.appendChild(pill);
    }
}

function showToast(message) {
    const existing = document.getElementById('nexus-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'nexus-toast';
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: 'var(--accent)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '30px',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: '9999',
        boxShadow: '0 8px 24px rgba(91, 110, 245, 0.4)',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ==========================================
// 4. UTILITIES
// ==========================================

const parseMarkdown = (text) => {
    let escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/_(.*?)_/g, '<em>$1</em>');
    escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');
    escaped = escaped.replace(/@([a-zA-Z0-9\s]+)/g, '<span class="mention">@$1</span>');

    return escaped;
};

const scrollToBottom = () => {
    const wrap = document.getElementById('messagesWrap');
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
};

// ==========================================
// 5. UI INTERACTIONS
// ==========================================

window.setChannel = function (el, name, type) {
    document.querySelectorAll('.ch-row').forEach(r => r.classList.remove('active'));
    el.classList.add('active');

    const nameDisplay = document.getElementById('activeChanName');
    const topicDisplay = document.getElementById('activeChanTopic');
    const inputField = document.getElementById('msgInput');

    if (nameDisplay) nameDisplay.textContent = name;
    if (topicDisplay) topicDisplay.textContent = CHANNEL_TOPICS[name] || '';
    if (inputField) {
        inputField.placeholder = `Message ${type}${name}…`;
        inputField.focus();
    }

    const badge = el.querySelector('.ch-unread');
    if (badge) badge.remove();
};

window.toggleFPS = function (pill) {
    pill.classList.toggle('mine');
    const countEl = pill.querySelector('.FPS-count');
    let count = parseInt(countEl.textContent);
    countEl.textContent = pill.classList.contains('mine') ? count + 1 : count - 1;
};

window.autoResize = function (ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
};

// ==========================================
// 6. MESSAGING LOGIC
// ==========================================

window.handleKey = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.sendMessage();
    }
};

window.sendMessage = function () {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if (!text) return;

    const wrap = document.getElementById('messagesWrap');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgEl = document.createElement('div');
    msgEl.className = 'msg-group';
    msgEl.style.animation = 'fadeUp 0.25s ease forwards';
    msgEl.innerHTML = `
        <div class="msg-av grad-violet">AM</div>
        <div class="msg-body">
            <div class="msg-header">
                <span class="msg-uname" style="color:var(--accent-light)">Alex Morgan</span>
                <span class="msg-role-badge" style="background:rgba(91,110,245,0.1); color:var(--accent); font-size:10px; padding:1px 6px; border-radius:10px; margin-right:8px;">You</span>
                <span class="msg-time">${time}</span>
            </div>
            <div class="msg-text">${parseMarkdown(text)}</div>
        </div>
        <div class="msg-actions">
            <div class="act-btn">😊</div><div class="act-btn">↩</div><div class="act-btn">🧵</div><div class="act-btn">⋯</div>
        </div>
    `;

    wrap.appendChild(msgEl);

    input.value = '';
    input.style.height = 'auto';
    scrollToBottom();

    simulateResponse();
};

function simulateResponse() {
    setTimeout(() => {
        const wrap = document.getElementById('messagesWrap');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const replyEl = document.createElement('div');
        replyEl.className = 'msg-group';
        replyEl.style.animation = 'fadeUp 0.25s ease forwards';
        replyEl.innerHTML = `
            <div class="msg-av grad-pink">MP</div>
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-uname" style="color:#F472B6">Mia Park</span>
                    <span class="msg-time">${time}</span>
                </div>
                <div class="msg-text">Got it! We'll be using the <strong>Nexus Design System</strong> to keep things consistent. Can't wait for tomorrow! 🚀</div>
                <div class="reactions">
                    <div class="FPS-pill" onclick="toggleFPS(this)"><span>🔥</span><span class="FPS-count">1</span></div>
                </div>
            </div>
            <div class="msg-actions"><div class="act-btn">😊</div><div class="act-btn">↩</div><div class="act-btn">🧵</div><div class="act-btn">⋯</div></div>
        `;

        wrap.appendChild(replyEl);
        scrollToBottom();
    }, 1500);
}

// ==========================================
// 7. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const selectedChannel = sessionStorage.getItem('selectedChannel');
    const fromCommunityPage = sessionStorage.getItem('fromCommunityPage');

    if (selectedChannel && fromCommunityPage === 'true') {
        const channelName = selectedChannel.replace('#', '');
        const channelRows = document.querySelectorAll('.ch-row');

        channelRows.forEach(row => {
            const channelLabel = row.querySelector('.ch-lbl');
            if (channelLabel && channelLabel.textContent === channelName) {
                const icon = row.querySelector('.ch-type');
                const iconText = icon ? icon.textContent : '#';

                setChannel(row, channelName, iconText);

                sessionStorage.removeItem('selectedChannel');
                sessionStorage.removeItem('fromCommunityPage');
                return;
            }
        });
    }

    scrollToBottom();

    // Core animation styles for dynamically added messages
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});