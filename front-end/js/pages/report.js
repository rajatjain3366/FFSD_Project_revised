/**
 * NexusHub — Report Content Logic
 * Handles multi-step reporting, content previewing, and submission states.
 */

// ==========================================
// 1. STATE & CONFIG
// ==========================================
let currentReportStep = 1;
let selectedReportType = 'message';
let selectedViolationReason = 'Hate Speech';

// ==========================================
// 2. STEP NAVIGATION
// ==========================================

/**
 * Moves between the different panels of the report wizard
 * @param {number} step - The target step (1-4)
 */
window.goStep = function(step) {
    // UI: Hide all panels and show target
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById('panel' + step);
    if (targetPanel) targetPanel.classList.add('active');

    // UI: Update Stepper visual state
    [1, 2, 3].forEach(i => {
        const stepIndicator = document.getElementById('s' + i);
        if (!stepIndicator) return;
        
        stepIndicator.classList.remove('active', 'done');
        if (i < step) stepIndicator.classList.add('done');
        if (i === step) stepIndicator.classList.add('active');
    });

    // logic: Build the summary if moving to review
    if (step === 3) buildReportSummary();

    currentReportStep = step;
    
    // Scroll container to top on step change
    const wrap = document.querySelector('.page-wrap');
    if (wrap) wrap.scrollTop = 0;
};

// ==========================================
// 3. SELECTION LOGIC
// ==========================================

window.selectType = function(type) {
    selectedReportType = type;
    
    // UI: Toggle card selection
    document.getElementById('tcMsg').classList.toggle('selected', type === 'message');
    document.getElementById('tcUser').classList.toggle('selected', type === 'user');
    
    // UI: Show relevant preview
    const msgPreview = document.getElementById('msgPreviewWrap');
    const userPreview = document.getElementById('userPreviewWrap');
    
    if (msgPreview) msgPreview.style.display = type === 'message' ? 'block' : 'none';
    if (userPreview) userPreview.style.display = type === 'user' ? 'block' : 'none';
};

window.selectReason = function(el, reason) {
    document.querySelectorAll('.reason-opt').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    selectedViolationReason = reason;
};

// ==========================================
// 4. SUMMARY & SUBMISSION
// ==========================================

/**
 * Populates the Review Panel with current form data
 */
function buildReportSummary() {
    const typeLabel = document.getElementById('rvType');
    const reasonLabel = document.getElementById('rvReason');
    const contextLabel = document.getElementById('rvContext');
    const contextInput = document.getElementById('additionalContext');

    if (typeLabel) {
        typeLabel.textContent = selectedReportType === 'message' ? 'Message Report' : 'User Report';
    }

    const activeReasonOpt = document.querySelector('.reason-opt.selected');
    if (activeReasonOpt && reasonLabel) {
        const icon = activeReasonOpt.querySelector('.reason-icon').textContent;
        const title = activeReasonOpt.querySelector('.reason-title').textContent;
        reasonLabel.textContent = `${icon} ${title}`;
    }

    if (contextInput && contextLabel) {
        const text = contextInput.value.trim();
        contextLabel.textContent = text || 'None provided';
        contextLabel.style.color = text ? 'var(--text-1)' : 'var(--text-3)';
    }
}

window.submitReport = function() {
    const btn = document.getElementById('submitBtn');
    if (!btn) return;

    btn.textContent = 'Submitting report...';
    btn.disabled = true;

    // Simulate API submission
    setTimeout(() => {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        const successPanel = document.getElementById('panel4');
        const stepper = document.getElementById('stepper');

        if (successPanel) successPanel.classList.add('active');
        if (stepper) stepper.style.opacity = '0'; // Hide progress bar on success
        
        if (window.toast) window.toast("Report successfully logged. ID: RPT-039471");
    }, 1200);
};

// ==========================================
// 5. UTILITIES & RESET
// ==========================================

window.resetForm = function() {
    // Restore UI visibility
    const stepper = document.getElementById('stepper');
    if (stepper) stepper.style.opacity = '1';

    // Reset Inputs
    const check = document.getElementById('confirmCheck');
    const context = document.getElementById('additionalContext');
    if (check) check.checked = false;
    if (context) context.value = '';
    
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0/500';

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '🚩 Submit Report';
    }

    // Default States
    window.selectType('message');
    
    // Set default reason (Hate Speech)
    const reasons = document.querySelectorAll('.reason-opt');
    reasons.forEach((r, i) => r.classList.toggle('selected', i === 1));

    window.goStep(1);
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Reporting module initialized. Standing by for user input.");
});