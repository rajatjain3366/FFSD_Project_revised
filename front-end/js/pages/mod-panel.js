/**
 * NexusHub — Moderator Review Panel Logic
 * Handles real-time report triaging, cross-community switching, 
 * and automated moderation workflows.
 */

// ==========================================
// 1. DATA & STATE
// ==========================================
const REPORTS_DATA = [
    { id:'#4821', user:'BadActor_X',   av:'BX', bg:'linear-gradient(135deg,#EF4444,#DC2626)', channel:'#general',       reason:'🚫 Hate Speech / Harassment',  badge:'pending',   repeat:'3× offender', time:'2m ago',  violations:3, days:48,  bans:0, warnings:2, sub:'Member since Jan 2026', unread:true  },
    { id:'#4820', user:'SpamBot99',    av:'SP', bg:'linear-gradient(135deg,#F59E0B,#D97706)', channel:'#frontend',      reason:'📢 Spam / Self-promotion',      badge:'pending',   repeat:null,          time:'14m ago', violations:1, days:12,  bans:0, warnings:0, sub:'Member since Feb 2026', unread:true  },
    { id:'#4819', user:'TrollX_420',   av:'TX', bg:'linear-gradient(135deg,#A78BFA,#7C3AED)', channel:'#code-review',   reason:'😡 Harassment',                badge:'review',    repeat:'2× offender', time:'31m ago', violations:2, days:90,  bans:0, warnings:1, sub:'Member since Oct 2025', unread:false },
    { id:'#4818', user:'NewUser_874',  av:'NW', bg:'linear-gradient(135deg,#06B6D4,#0891B2)', channel:'#general',       reason:'❌ Misinformation',             badge:'pending',   repeat:null,          time:'1h ago',  violations:0, days:3,   bans:0, warnings:0, sub:'Member since Mar 2026', unread:false },
    { id:'#4817', user:'DarkRaider',   av:'DR', bg:'linear-gradient(135deg,#F87171,#DC2626)', channel:'#off-topic',     reason:'🔞 NSFW Content',               badge:'escalated', repeat:'5× offender', time:'2h ago',  violations:5, days:180, bans:1, warnings:3, sub:'Member since Sep 2025', unread:false },
    { id:'#4816', user:'GhostHacker',  av:'GH', bg:'linear-gradient(135deg,#34D399,#059669)', channel:'#Streaming',        reason:'⚠️ Other Rule Violation',       badge:'pending',   repeat:null,          time:'3h ago',  violations:1, days:60,  bans:0, warnings:0, sub:'Member since Jan 2026', unread:false },
    { id:'#4815', user:'FakeNews_Bot', av:'FN', bg:'linear-gradient(135deg,#FBBF24,#F59E0B)', channel:'#announcements', reason:'❌ Misinformation',             badge:'pending',   repeat:null,          time:'4h ago',  violations:1, days:22,  bans:0, warnings:0, sub:'Member since Feb 2026', unread:false },
    { id:'#4814', user:'MemeRaider_7', av:'MR', bg:'linear-gradient(135deg,#818CF8,#4F46E5)', channel:'#introductions', reason:'📢 Spam',                       badge:'review',    repeat:null,          time:'5h ago',  violations:0, days:7,   bans:0, warnings:0, sub:'Member since Mar 2026', unread:false },
];

let activeModTab = 'pending';
let currentReportIdx = 0;
let toastDebounce;

// ==========================================
// 2. QUEUE ENGINE
// ==========================================

window.renderQueue = function(searchQuery = '') {
    const listContainer = document.getElementById('queueList');
    if (!listContainer) return;

    const filtered = REPORTS_DATA.filter(report => {
        const matchesTab = activeModTab === 'pending' ? (report.badge === 'pending' || report.badge === 'escalated')
                         : activeModTab === 'review'  ? report.badge === 'review'
                         : report.badge === 'resolved';

        const matchesSearch = !searchQuery || 
                             report.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             report.channel.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesTab && matchesSearch;
    });

    listContainer.innerHTML = filtered.map((report, i) => {
        const globalIdx = REPORTS_DATA.indexOf(report);
        const isActive = globalIdx === currentReportIdx;
        
        return `
            <div class="report-item ${isActive ? 'active' : ''}" 
                 onclick="selectReport(this, ${globalIdx})" 
                 style="animation-delay: ${i * 0.03}s">
                ${report.unread ? '<div class="ri-unread-dot"></div>' : ''}
                <div class="ri-top">
                    <div class="ri-av" style="background: ${report.bg}">${report.av}</div>
                    <span class="ri-name">${report.user}</span>
                    <span class="ri-time">${report.time}</span>
                </div>
                <div class="ri-reason">${report.reason}</div>
                <div class="ri-bottom">
                    <span class="ri-badge badge-${report.badge}">
                        ${capitalize(report.badge)}
                    </span>
                    ${report.repeat ? `<span class="repeat-badge">${report.repeat}</span>` : ''}
                    <span class="ri-channel">${report.channel}</span>
                </div>
            </div>`;
    }).join('');

    updateQueueCounters(filtered.length);
};

function updateQueueCounters(count) {
    const qCount = document.getElementById('queueCount');
    const oCount = document.getElementById('openCount');
    if (qCount) qCount.textContent = count;
    if (oCount) oCount.textContent = count;
}

// ==========================================
// 3. DETAIL & ACTION PANELS
// ==========================================

window.selectReport = function(el, idx) {
    currentReportIdx = idx;
    const r = REPORTS_DATA[idx];
    
    // Mark as read
    r.unread = false;
    window.renderQueue();

    // Update Detail Header
    const titleEl = document.getElementById('dpTitle');
    if (titleEl) titleEl.textContent = `Report ${r.id} — ${r.user} in ${r.channel}`;

    // Update Accused User Mini-Profile
    syncActionPanel(r);

    // Default to 'Content' tab
    window.setDpTab(document.querySelector('.dp-tab'), 'content');
};

function syncActionPanel(report) {
    const elements = {
        'accAvatar': el => { el.textContent = report.av; el.style.background = report.bg; },
        'accName': el => el.textContent = report.user,
        'accSub': el => el.textContent = report.sub,
        'accViolations': el => el.textContent = report.violations,
        'accDays': el => el.textContent = report.days,
        'accBans': el => el.textContent = report.bans,
        'accWarnings': el => el.textContent = report.warnings
    };

    for (const [id, updateFn] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) updateFn(el);
    }

    const rw = document.getElementById('repeatWarning');
    if (rw) {
        if (report.violations >= 2) {
            rw.style.display = 'flex';
            rw.textContent = `⚠️ Repeat offender — ${report.violations} violations. ${report.violations >= 3 ? 'Escalated action recommended.' : 'Check history.'}`;
        } else {
            rw.style.display = 'none';
        }
    }
}

window.setQTab = function(el, tab) {
    document.querySelectorAll('.qp-tab').forEach(t => t.classList.remove('on'));
    el.classList.add('on');
    activeModTab = tab;
    window.renderQueue();
};

window.setDpTab = function(el, tabName) {
    document.querySelectorAll('.dp-tab').forEach(t => t.classList.remove('on'));
    if (el) el.classList.add('on');

    const tabs = ['tabContent', 'tabHistory', 'tabPrevious'];
    tabs.forEach(id => {
        const tabEl = document.getElementById(id);
        if (tabEl) tabEl.style.display = id.toLowerCase().includes(tabName) ? 'block' : 'none';
    });
};

window.setMute = function(el) {
    document.querySelectorAll('.mute-opt').forEach(o => o.classList.remove('on'));
    el.classList.add('on');
};

// ==========================================
// 4. MODERATION WORKFLOW
// ==========================================

const ACTION_FEEDBACK = {
    warn:     { icon:'⚠️', msg:'Warning issued' },
    mute:     { icon:'🔇', msg:'User muted successfully' },
    ban7:     { icon:'🚫', msg:'7-day ban applied' },
    banperm:  { icon:'⛔', msg:'Permanent ban applied' },
    dismiss:  { icon:'✅', msg:'Report dismissed — no action' },
    escalate: { icon:'🔺', msg:'Report escalated to Admin' },
};

window.takeAction = function(type) {
    const feedback = ACTION_FEEDBACK[type];
    const user = REPORTS_DATA[currentReportIdx].user;
    window.showToast(feedback.icon, `${feedback.msg} — ${user}`);
};

window.resolveReport = function() {
    window.showToast('✅', 'Report resolved. Loading next report...');
    
    // Mark current as resolved
    REPORTS_DATA[currentReportIdx].badge = 'resolved';
    
    // Find next pending
    const nextIdx = REPORTS_DATA.findIndex((r, i) => 
        i > currentReportIdx && (r.badge === 'pending' || r.badge === 'escalated' || r.badge === 'review')
    );

    setTimeout(() => {
        window.renderQueue();
        if (nextIdx !== -1) {
            window.selectReport(null, nextIdx);
        } else {
            // If no more in queue, reset view
            document.getElementById('dpBody')?.classList.add('empty-queue');
        }
    }, 750);
};

window.switchCommunity = function(el, name, icon) {
    document.querySelectorAll('.comm-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    
    const nameEl = document.getElementById('activeCommName');
    const iconEl = document.getElementById('activeCommIcon');
    
    if (nameEl) nameEl.textContent = name;
    if (iconEl) iconEl.textContent = icon;
    
    window.showToast('🏘️', `Switched mod context to ${name}`);
    // In a real app, this would trigger a fetch for that community's reports
    window.renderQueue();
};

window.filterQueue = function(val) {
    window.renderQueue(val);
};

// ==========================================
// 5. UTILITIES & INIT
// ==========================================

window.showToast = function(icon, msg) {
    const t = document.getElementById('toast');
    const tIcon = document.getElementById('toastIcon');
    const tMsg = document.getElementById('toastMsg');
    
    if (!t || !tIcon || !tMsg) return;

    tIcon.textContent = icon;
    tMsg.textContent = msg;
    t.classList.add('show');
    
    clearTimeout(toastDebounce);
    toastDebounce = setTimeout(() => t.classList.remove('show'), 2800);
};

function capitalize(s) {
    if (s === 'review') return 'In Review';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

document.addEventListener('keydown', e => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    
    const keyMap = { 
        w: 'warn', m: 'mute', b: 'ban7', 
        p: 'banperm', d: 'dismiss', e: 'escalate' 
    };
    
    const action = keyMap[e.key.toLowerCase()];
    if (action) {
        e.preventDefault();
        window.takeAction(action);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    window.renderQueue();
    console.log("Moderator Review Panel v3.0 initialized.");
});