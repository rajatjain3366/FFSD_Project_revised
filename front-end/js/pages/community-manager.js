/**
 * NexusHub — Complete CRUD State Manager
 * Handles UI, Modals, Forms, and dynamically rendering lists.
 */

// ==========================================
// 1. STATE (The Source of Truth)
// ==========================================
let state = {
    communityName: "Pro Gamers",

    // --- NEW: DYNAMIC LOGGED-IN USER ---
    currentUser: {
        firstName: "Jake",
        lastName: "Kim",
        fullName: "Jake Kim",
        handle: "jakekim",
        initials: "JK",
        email: "jake@nexushub.io",
        bgClass: "grad-orange",
        role: "👑 Owner"
    },

    // Default Channels Sample Data
    channels: [
        { id: 1, icon: '📣', name: 'announcements', type: '📣 Announcement', perms: '🔒 Mod only' },
        { id: 2, icon: '#', name: 'general', type: '💬 Text', perms: '🌐 Public' },
        { id: 3, icon: '🔊', name: 'study-together', type: '🔊 Voice', perms: '🌐 Public' }
    ],

    // Default Members Sample Data
    members: [
        { id: 101, av: 'JK', bg: 'grad-orange', name: 'Jake Kim', email: 'jake@nexushub.io', role: '👑 Owner', date: 'Mar 1, 2022' },
        { id: 102, av: 'SL', bg: 'grad-purple', name: 'Sara Lee', email: 'sara@example.com', role: '🛡 Moderator', date: 'Jun 12, 2022' },
        { id: 103, av: 'AM', bg: 'grad-violet', name: 'Alex Morgan', email: 'alex@example.com', role: '👤 Member', date: 'Jan 5, 2025' }
    ],

    // Default Events Sample Data
    events: [
        { id: 1, title: 'Weekly Code Review', date: 'Friday, 8:00 PM EST', type: 'Community Event' }
    ],

    // Default Reports Sample Data
    reports: [
        { id: 4821, user: 'BadActor_X', reason: '🚫 Hate Speech', status: 'Pending', notes: 'User was observed repeatedly breaking community rules in #general. Review chat logs.' },
        { id: 4820, user: 'SpamBot99', reason: '📢 Spam', status: 'Pending', notes: 'Account posted 45 identical links in #frontend over a 2 minute window.' }
    ],

    // Default Roles Sample Data
    roles: [
        { id: 1, name: '👑 Owner', desc: 'Full control over community', count: 1, color: '#F59E0B' },
        { id: 2, name: '🛡 Moderator', desc: 'Can moderate members and content', count: 4, color: '#818CF8' },
        { id: 3, name: '👤 Member', desc: 'Standard community member', count: 2446, color: '#9CA3AF' }
    ],

    resolvedReportsCounter: 24
};

// Variables to hold our backups for the "Discard" function
let savedStateSnapshot = null;
let savedInputValues = [];

// ==========================================
// 2. RENDER FUNCTIONS (Updating the UI)
// ==========================================

// --- NEW: Load the current user from localStorage ---
function loadCurrentUser() {
    const storedUser = localStorage.getItem('nexus_current_user');
    if (storedUser) {
        state.currentUser = JSON.parse(storedUser);
    } else {
        // If first time loading, save default user to storage
        localStorage.setItem('nexus_current_user', JSON.stringify(state.currentUser));
    }

    // Update Top Bar Avatar dynamically
    const topAvatar = document.querySelector('.tb-av');
    if (topAvatar) {
        topAvatar.innerText = state.currentUser.initials;
        topAvatar.className = `tb-av ${state.currentUser.bgClass || ''}`;
        if (state.currentUser.bgClass === 'grad-orange' || state.currentUser.initials === 'JK') {
            topAvatar.style.background = 'linear-gradient(135deg, var(--gold), #d97706)';
            topAvatar.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        } else {
            topAvatar.style.background = ''; // Use CSS class instead
        }
    }

    // Update Bottom Left Nav Avatar dynamically
    const footerAv = document.querySelector('.ln-owner-av');
    const footerName = document.querySelector('.ln-owner-name');
    const footerRole = document.querySelector('.ln-owner-role');

    if (footerAv) {
        footerAv.innerText = state.currentUser.initials;
        if (state.currentUser.bgClass === 'grad-orange' || state.currentUser.initials === 'JK') {
            footerAv.style.background = 'linear-gradient(135deg, var(--gold), #d97706)';
        } else {
            footerAv.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-2))'; // Default fallback
        }
    }
    if (footerName) footerName.innerText = state.currentUser.fullName;
    if (footerRole) footerRole.innerText = state.currentUser.role || 'Admin';
}

window.renderAll = function () {
    renderChannels();
    renderMembers();
    renderEvents();
    renderReports();
    renderRoles();
};

function renderChannels() {
    const list = document.getElementById('settingsChannelList');
    const countEl = document.getElementById('totalChannelsCount');
    if (!list || !countEl) return;

    countEl.innerText = state.channels.length;

    list.innerHTML = state.channels.map(ch => `
        <div class="channel-item">
            <div class="channel-icon">${ch.icon}</div>
            <div class="channel-info">
                <div class="channel-name">${ch.name}</div>
                <div class="channel-type">${ch.type}</div>
                <div class="channel-perms">${ch.perms}</div>
            </div>
            <div class="channel-actions">
                <button class="btn-sm" onclick="editChannel(${ch.id})">✏️</button>
                <button class="btn-sm danger" onclick="deleteChannel(${ch.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderMembers() {
    const list = document.getElementById('settingsMemberList');
    const countEl = document.getElementById('totalMembersCount');
    if (!list || !countEl) return;

    countEl.innerText = (2448 + state.members.length).toLocaleString();

    list.innerHTML = state.members.map(m => `
        <div class="member-item">
            <div class="member-avatar ${m.bg || ''}" style="${!m.bg ? 'background: linear-gradient(135deg, var(--accent), var(--accent-2));' : ''}">${m.av}</div>
            <div class="member-info">
                <div class="member-name">${m.name}</div>
                <div class="member-role">${m.role} • ${m.email}</div>
                <div class="member-date">Joined ${m.date}</div>
            </div>
            <div class="member-actions">
                <button class="btn-sm" onclick="editMember(${m.id})">✏️</button>
                ${!m.role.includes('Owner') ? `<button class="btn-sm danger" onclick="kickMember(${m.id})">🚫 Kick</button>` : ''}
            </div>
        </div>
    `).join('');
}

function renderEvents() {
    const list = document.getElementById('settingsEventsList');
    if (!list) return;

    if (state.events.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding: 20px; font-size: 13px; color: var(--text-3);">No upcoming events</div>`;
        return;
    }

    list.innerHTML = state.events.map(e => `
        <div class="role-item-settings">
            <div class="role-info">
                <div class="role-name">${e.title}</div>
                <div class="role-desc" style="color: var(--accent); margin-top: 4px;">📅 ${e.date}</div>
                <div class="role-count" style="margin-top: 4px;">${e.type}</div>
            </div>
            <div class="role-actions">
                <button class="btn-sm danger" onclick="deleteEvent(${e.id})">🗑️ Cancel</button>
            </div>
        </div>
    `).join('');
}

function renderReports() {
    const list = document.getElementById('settingsReportsList');
    const openCountEl = document.getElementById('openReportsCount');
    const resCountEl = document.getElementById('resolvedReportsCount');

    if (!list || !openCountEl || !resCountEl) return;

    openCountEl.innerText = state.reports.length;
    resCountEl.innerText = state.resolvedReportsCounter;

    if (state.reports.length === 0) {
        list.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No open reports! 🎉</td></tr>`;
        return;
    }

    list.innerHTML = state.reports.map(r => `
        <tr>
            <td>#${r.id}</td>
            <td>${r.user}</td>
            <td>${r.reason}</td>
            <td><span class="ri-badge badge-pending" style="color:#F59E0B; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:12px; font-size:10px;">${r.status}</span></td>
            <td>
                <div class="tbl-actions">
                    <div class="tbl-btn" onclick="viewReport(${r.id})" title="View Details">👁</div>
                    <div class="tbl-btn" onclick="resolveReport(${r.id})" title="Resolve">✅</div>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderRoles() {
    const list = document.getElementById('settingsRolesList');
    if (!list) return;

    list.innerHTML = state.roles.map(r => `
        <div class="role-item-settings">
            <div class="role-info">
                <div class="role-name">${r.name}</div>
                <div class="role-desc">${r.desc}</div>
                <div class="role-count">${r.count.toLocaleString()} members</div>
            </div>
            <div class="role-color" style="background:${r.color};"></div>
            <div class="role-actions">
                <button class="btn-sm" onclick="editRole(${r.id})">✏️</button>
                ${!r.name.includes('Owner') ? `<button class="btn-sm danger" onclick="deleteRole(${r.id})">🗑️</button>` : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================
// 3. NAVIGATION (Dynamic User Handoff)
// ==========================================

window.viewAsMember = function () {
    localStorage.setItem('nexus_current_user', JSON.stringify(state.currentUser));
    window.location.href = 'community-page.html';
};

window.openProfileSettings = function () {
    localStorage.setItem('nexus_current_user', JSON.stringify(state.currentUser));
    window.location.href = 'profile-settings.html';
};


// ==========================================
// 4. CRUD ACTIONS (Channels, Members, Events, Reports, Roles)
// ==========================================

window.submitCreateChannel = function () {
    const nameInput = document.getElementById('chNameInput').value.trim();
    const typeInput = document.getElementById('chTypeInput').value;
    const visInput = document.getElementById('chVisInput').value;

    if (!nameInput) return toast('⚠️ Channel name cannot be empty');

    let icon = '#';
    if (typeInput.includes('Voice')) icon = '🔊';
    if (typeInput.includes('Announcement')) icon = '📣';

    const newChannel = {
        id: Date.now(), icon: icon, name: nameInput.toLowerCase().replace(/\s+/g, '-'), type: typeInput, perms: visInput
    };

    state.channels.push(newChannel);
    renderChannels();
    closeModal();
    toast(`✅ Channel #${newChannel.name} created!`);
    document.getElementById('chNameInput').value = '';
};

window.deleteChannel = function (id) {
    if (confirm("Are you sure you want to delete this channel?")) {
        state.channels = state.channels.filter(ch => ch.id !== id);
        renderChannels();
        toast("🗑️ Channel deleted");
    }
};

window.editChannel = function (id) {
    const channel = state.channels.find(ch => ch.id === id);
    if (!channel) return;
    const newName = prompt("Enter new channel name:", channel.name);
    if (newName && newName.trim() !== '') {
        channel.name = newName.trim().toLowerCase().replace(/\s+/g, '-');
        renderChannels();
        toast("✏️ Channel updated");
    }
};

window.kickMember = function (id) {
    if (confirm("Are you sure you want to kick this member?")) {
        state.members = state.members.filter(m => m.id !== id);
        renderMembers();
        toast("🚫 Member kicked");
    }
};

window.editMember = function (id) {
    const member = state.members.find(m => m.id === id);
    if (!member) return;
    if (member.role.includes('Owner')) return toast("⚠️ Cannot edit Owner");

    const newRole = prompt(`Change role for ${member.name} (e.g., '🛡 Moderator' or '👤 Member'):`, member.role);
    if (newRole && newRole.trim() !== '') {
        member.role = newRole.trim();
        renderMembers();
        toast("✅ Role updated");
    }
};

window.openEventModal = function () {
    const modal = document.getElementById('eventModalBg');
    if (modal) modal.classList.add('show');
};

window.closeEventModal = function () {
    const modal = document.getElementById('eventModalBg');
    if (modal) modal.classList.remove('show');
};

window.submitCreateEvent = function () {
    const titleInput = document.getElementById('evTitleInput').value.trim();
    const dateInput = document.getElementById('evDateInput').value;
    const typeInput = document.getElementById('evTypeInput').value;

    if (!titleInput) return toast('⚠️ Event title cannot be empty');

    let displayDate = dateInput;
    if (dateInput) {
        const d = new Date(dateInput);
        if (!isNaN(d.getTime())) {
            const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
            displayDate = d.toLocaleString('en-US', opts);
        }
    } else {
        displayDate = "TBD";
    }

    const newEvent = { id: Date.now(), title: titleInput, date: displayDate, type: typeInput };

    state.events.push(newEvent);
    renderEvents();
    closeEventModal();
    toast(`🎉 Event "${newEvent.title}" scheduled!`);

    document.getElementById('evTitleInput').value = '';
    document.getElementById('evDateInput').value = '';
};

window.deleteEvent = function (id) {
    if (confirm("Are you sure you want to cancel this event?")) {
        state.events = state.events.filter(e => e.id !== id);
        renderEvents();
        toast("🗑️ Event cancelled");
    }
};

window.viewReport = function (id) {
    const report = state.reports.find(r => r.id === id);
    if (!report) return;

    const content = document.getElementById('reportModalContent');
    content.innerHTML = `
        <div style="margin-bottom: 8px;"><strong style="color:var(--text-1)">Report ID:</strong> #${report.id}</div>
        <div style="margin-bottom: 8px;"><strong style="color:var(--text-1)">Reported User:</strong> ${report.user}</div>
        <div style="margin-bottom: 8px;"><strong style="color:var(--text-1)">Violation Reason:</strong> ${report.reason}</div>
        <div style="margin-bottom: 8px;"><strong style="color:var(--text-1)">Current Status:</strong> ${report.status}</div>
        <div style="margin-top: 15px; padding: 12px; background: var(--bg-input); border-radius: 8px; border: 1px solid var(--border);">
            <strong style="color:var(--text-1)">Evidence / Notes:</strong><br/>
            <div style="margin-top: 5px;">${report.notes}</div>
        </div>
    `;

    const resolveBtn = document.getElementById('reportModalResolveBtn');
    resolveBtn.onclick = function () {
        resolveReport(id);
        closeReportModal();
    };

    document.getElementById('reportModalBg').classList.add('show');
};

window.closeReportModal = function () { document.getElementById('reportModalBg').classList.remove('show'); };

window.resolveReport = function (id) {
    state.reports = state.reports.filter(r => r.id !== id);
    state.resolvedReportsCounter++;
    renderReports();
    toast("✅ Report resolved and closed");
};

window.createRole = function () {
    const roleName = prompt("Enter new role name (e.g., 🌟 VIP):");
    if (!roleName || roleName.trim() === '') return;

    const newRole = { id: Date.now(), name: roleName.trim(), desc: 'Custom role created by admin', count: 0, color: '#34D399' };
    state.roles.push(newRole);
    renderRoles();
    toast(`✅ Role ${newRole.name} created!`);
};

window.editRole = function (id) {
    const role = state.roles.find(r => r.id === id);
    if (!role) return;
    if (role.name.includes('Owner')) return toast("⚠️ Cannot edit Owner role");

    const newName = prompt("Enter new name for this role:", role.name);
    if (newName && newName.trim() !== '') {
        role.name = newName.trim();
        renderRoles();
        toast("✏️ Role updated");
    }
};

window.deleteRole = function (id) {
    const role = state.roles.find(r => r.id === id);
    if (!role) return;
    if (role.name.includes('Owner')) return toast("⚠️ Cannot delete Owner role");

    if (confirm(`Are you sure you want to delete the ${role.name} role?`)) {
        state.roles = state.roles.filter(r => r.id !== id);
        renderRoles();
        toast("🗑️ Role deleted");
    }
};


// ==========================================
// 5. UI/UX CONTROLS & SNAPSHOT LOGIC
// ==========================================

window.switchSettingsTab = function (tabId, navEl) {
    document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.settings-nav-item').forEach(item => item.classList.remove('active'));
    const targetTab = document.getElementById('settings-' + tabId);
    if (targetTab) targetTab.classList.add('active');
    if (navEl) navEl.classList.add('active');
};

window.showModal = function () {
    const modal = document.getElementById('modalBg');
    if (modal) modal.classList.add('show');
};
window.closeModal = function () {
    const modal = document.getElementById('modalBg');
    if (modal) modal.classList.remove('show');
};

window.toast = function (msg) {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (!t || !m) return;
    m.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
};

function takeSnapshot() {
    savedStateSnapshot = JSON.parse(JSON.stringify(state));
    savedInputValues = Array.from(document.querySelectorAll('#view-settings input, #view-settings textarea, #view-settings select'))
        .map(el => el.value);
}

window.saveSettings = function () {
    const nameInput = document.getElementById('communityNameInput');
    const topBarName = document.getElementById('topBarCommunityName');
    if (nameInput && topBarName) {
        state.communityName = nameInput.value;
        topBarName.innerText = state.communityName;
    }
    takeSnapshot();
    const actionbar = document.getElementById('settingsActions');
    if (actionbar) actionbar.classList.remove('show');
    toast('✅ All community settings saved!');
};

window.discardSettings = function () {
    if (savedStateSnapshot) { state = JSON.parse(JSON.stringify(savedStateSnapshot)); }
    document.querySelectorAll('#view-settings input, #view-settings textarea, #view-settings select').forEach((el, index) => {
        el.value = savedInputValues[index];
    });
    renderAll();
    const actionbar = document.getElementById('settingsActions');
    if (actionbar) actionbar.classList.remove('show');
    toast('❌ Changes discarded and reverted');
};

// ==========================================
// 6. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentUser(); // Load dynamic user data!
    renderAll();
    takeSnapshot();

    // Settings Action Bar Trigger Logic
    const settingsActions = document.getElementById('settingsActions');
    if (settingsActions) {
        const inputs = document.querySelectorAll('#view-settings input, #view-settings textarea, #view-settings select');
        inputs.forEach(el => {
            el.addEventListener('input', () => settingsActions.classList.add('show'));
            el.addEventListener('change', () => settingsActions.classList.add('show'));
        });

        const tabContainer = document.querySelector('.settings-content');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('btn-modal-ok') && !e.target.classList.contains('btn-modal-cancel')) {
                    settingsActions.classList.add('show');
                }
            });
        }
    }

    console.log("Community Manager Panel initialized.");
});