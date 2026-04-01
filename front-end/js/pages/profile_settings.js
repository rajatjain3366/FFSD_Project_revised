/**
 * NexusHub — Profile & Settings Logic
 * Handles view switching, theme selection, and real-time profile synchronization.
 */

let hasUnsavedChanges = false;
let toastDebounce;

window.switchView = function (viewId, navEl) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.ln-item').forEach(i => i.classList.remove('active'));
    if (navEl) navEl.classList.add('active');
};

function setupProfileSync() {
    const nameInput = document.getElementById('inpFullName');
    const handleInput = document.getElementById('inpHandle');

    const sidebarName = document.getElementById('navName');
    const sidebarHandle = document.getElementById('navHandle');
    const hintHandle = document.getElementById('hintHandle');

    if (nameInput && sidebarName) {
        nameInput.addEventListener('input', (e) => {
            sidebarName.textContent = e.target.value || "New User";
            markAsDirty();
        });
    }

    if (handleInput && sidebarHandle) {
        handleInput.addEventListener('input', (e) => {
            const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
            sidebarHandle.textContent = val ? `@${val}` : "@username";
            if (hintHandle) hintHandle.textContent = val;
            markAsDirty();
        });
    }

    document.querySelectorAll('.main input, .main textarea, .main select').forEach(input => {
        input.addEventListener('change', markAsDirty);
    });
}

function markAsDirty() {
    hasUnsavedChanges = true;
    const saveBtn = document.querySelector('.tb-btn.save');
    if (saveBtn) saveBtn.classList.add('pulse');
}

window.setStatus = function (el) {
    document.querySelectorAll('.status-badge').forEach(b => b.classList.remove('on'));
    el.classList.add('on');

    const statusText = el.textContent.trim();
    const sidebarStatus = document.querySelector('.profile-status');
    if (sidebarStatus) sidebarStatus.textContent = statusText;

    window.toast(`Status updated to ${statusText}`);
    markAsDirty();
};

window.setTheme = function (el) {
    document.querySelectorAll('.theme-opt').forEach(t => t.classList.remove('on'));
    el.classList.add('on');

    const themeName = el.querySelector('.theme-label').textContent;
    window.toast(`Theme preview: ${themeName}`);
    markAsDirty();
};

window.logout = function () {
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_owned_communities');
    localStorage.removeItem('nexus_current_user');
    window.toast("Logging out... 👋");
    setTimeout(() => {
        window.location.href = 'landing.html';
    }, 1000);
};

window.toast = function (msg) {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (!t || !m) return;

    m.textContent = msg;
    t.classList.add('show');

    clearTimeout(toastDebounce);
    toastDebounce = setTimeout(() => t.classList.remove('show'), 2500);
};

// --- THIS IS THE DYNAMIC SAVE LOGIC ---
window.saveAllChanges = function () {
    if (!hasUnsavedChanges) {
        window.toast("No changes to save.");
        return;
    }

    const saveBtn = document.querySelector('.tb-btn.save');
    if (saveBtn) {
        saveBtn.textContent = "Saving...";
        saveBtn.disabled = true;
    }

    setTimeout(() => {
        hasUnsavedChanges = false;

        // Retrieve existing, update, calculate new initials, and save back to local storage!
        const userStr = localStorage.getItem('nexus_current_user');
        if (userStr) {
            const user = JSON.parse(userStr);

            user.firstName = document.getElementById('inpFirstName').value.trim();
            user.lastName = document.getElementById('inpLastName').value.trim();
            user.fullName = document.getElementById('inpFullName').value.trim() || `${user.firstName} ${user.lastName}`;
            user.handle = document.getElementById('inpHandle').value.trim();
            user.email = document.getElementById('inpEmail').value.trim();

            // Calculate Initials automatically!
            let newInitials = "U";
            if (user.firstName && user.lastName) {
                newInitials = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase();
            } else if (user.fullName && user.fullName.length >= 2) {
                newInitials = user.fullName.substring(0, 2).toUpperCase();
            }
            user.initials = newInitials;

            // Give non-JK users a generic purple background so they don't look broken
            if (user.initials !== 'JK') {
                user.bgClass = 'grad-purple';
            }

            localStorage.setItem('nexus_current_user', JSON.stringify(user));

            // Refresh avatars on this page immediately
            loadUserData();
        }

        if (saveBtn) {
            saveBtn.textContent = "Save Changes";
            saveBtn.disabled = false;
            saveBtn.classList.remove('pulse');
        }
        window.toast("✅ All changes saved successfully!");
    }, 1200);
};

function loadUserData() {
    const storedUser = localStorage.getItem('nexus_current_user');
    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    // Update Avatars dynamically
    const avatars = [
        document.getElementById('topBarAvatar'),
        document.getElementById('sidebarBottomAvatar'),
        document.getElementById('navMainAvatar'),
        document.getElementById('mainAvatarPreview')
    ];

    avatars.forEach(av => {
        if (av) {
            av.innerText = user.initials;
            // Clean slate
            av.style.background = '';
            av.style.borderColor = '';

            if (user.bgClass === 'grad-orange' || user.initials === 'JK') {
                av.style.background = 'linear-gradient(135deg, var(--gold), #d97706)';
                av.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            } else if (user.bgClass) {
                av.className = `profile-av ${user.bgClass}`; // Fallback class
            }
        }
    });

    // Update Sidebar text
    const sidebarName = document.getElementById('navName');
    const sidebarHandle = document.getElementById('navHandle');
    if (sidebarName) sidebarName.innerText = user.fullName;
    if (sidebarHandle) sidebarHandle.innerText = `@${user.handle}`;

    // Update Input Fields
    const inpFirst = document.getElementById('inpFirstName');
    const inpLast = document.getElementById('inpLastName');
    const inpFull = document.getElementById('inpFullName');
    const inpHandle = document.getElementById('inpHandle');
    const inpEmail = document.getElementById('inpEmail');
    const hintHandle = document.getElementById('hintHandle');

    if (inpFirst) inpFirst.value = user.firstName;
    if (inpLast) inpLast.value = user.lastName;
    if (inpFull) inpFull.value = user.fullName;
    if (inpHandle) inpHandle.value = user.handle;
    if (hintHandle) hintHandle.innerText = user.handle;
    if (inpEmail) inpEmail.value = user.email;
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    setupProfileSync();

    const topSaveBtn = document.querySelector('.tb-btn.save');
    if (topSaveBtn) {
        topSaveBtn.onclick = window.saveAllChanges;
    }
});