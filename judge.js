// ============================================
// AdZapp Judge Evaluation System
// Judge Evaluation Page JavaScript
// ============================================

let currentUser = null;
let currentJudge = null;
let teams = [];
let evaluatedTeamIds = [];
let pendingSubmission = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
    setupEventListeners();
});

// ============================================
// INITIALIZATION
// ============================================

async function initializePage() {
    try {
        // Get current user
        currentUser = await getCurrentUser();

        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Get judge data
        const { data: judgeData, error: judgeError } = await window.supabaseClient
            .from('judges')
            .select('*')
            .eq('judge_id', currentUser.id)
            .single();

        if (judgeError) {
            console.error('Error fetching judge:', judgeError);
            showAlert('Error loading judge data. Please try logging in again.', 'error');
            return;
        }

        currentJudge = judgeData;

        // Update UI with judge name
        document.getElementById('judgeName').textContent = currentJudge.judge_name;
        document.getElementById('judgeNameDisplay').textContent = currentJudge.judge_name;

        // Load teams
        await loadTeams();

        // Load submitted evaluations
        await loadSubmittedEvaluations();

    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Error initializing page. Please refresh.', 'error');
    }
}

// ============================================
// LOAD DATA
// ============================================

async function loadTeams() {
    try {
        const { data, error } = await window.supabaseClient
            .from('teams')
            .select('*')
            .order('team_number', { ascending: true });

        if (error) throw error;

        teams = data;

        // Populate team dropdown
        const teamSelect = document.getElementById('teamSelect');
        teamSelect.innerHTML = '<option value="">-- Choose a team --</option>';

        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.team_id;
            option.textContent = `${team.team_leader}`;

            // Mark if already evaluated but kept enabled
            if (evaluatedTeamIds.includes(team.team_id)) {
                option.textContent += ' (Edit Score)';
                option.style.fontWeight = 'bold';
                option.style.color = 'var(--primary)';
            }

            teamSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading teams:', error);
        showAlert('Error loading teams. Please refresh the page.', 'error');
    }
}

async function loadSubmittedEvaluations() {
    try {
        const { data, error } = await window.supabaseClient
            .from('evaluations')
            .select(`
                *,
                teams (team_number, team_leader)
            `)
            .eq('judge_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        evaluatedTeamIds = data.map(e => e.team_id);

        // Display submitted evaluations
        const container = document.getElementById('submittedEvaluations');

        if (data.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No evaluations submitted yet.</p>';
            return;
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Target</th>';
        html += '<th style="text-align: center;">Metrics</th>';
        html += '<th style="text-align: center;">Total</th>';
        html += '<th>Timestamp</th>';
        html += '</tr></thead><tbody>';

        data.forEach(evaluation => {
            const date = new Date(evaluation.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            html += `<tr>
                <td>
                    <div style="font-weight: 600; color: var(--text-main);">${evaluation.teams.team_leader}</div>
                    <div class="text-dim small">Reference #${evaluation.teams.team_number}</div>
                </td>
                <td style="text-align: center; color: var(--text-muted); font-size: 0.8125rem;">
                    S:${evaluation.skit_execution} J:${evaluation.slogan_jingle} C:${evaluation.team_coordination}
                </td>
                <td style="text-align: center;">
                    <span style="font-weight: 700; color: var(--primary);">${evaluation.total_score}</span>
                </td>
                <td style="font-size: 0.75rem; color: var(--text-dim);">${date}</td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;

        // Reload teams to update disabled options
        await loadTeams();

    } catch (error) {
        console.error('Error loading evaluations:', error);
        document.getElementById('submittedEvaluations').innerHTML =
            '<p class="text-error">Error loading evaluations.</p>';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Team selection
    document.getElementById('teamSelect').addEventListener('change', handleTeamSelection);

    // Auto-calculate total score
    const scoreInputs = ['skitExecution', 'sloganJingle', 'teamCoordination'];
    scoreInputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', calculateTotalScore);
        input.addEventListener('change', validateScore);
    });

    // Form submission
    document.getElementById('evaluationForm').addEventListener('submit', handleFormSubmit);
}

async function handleTeamSelection(e) {
    const teamId = e.target.value;
    const formContainer = document.getElementById('evaluationFormContainer');

    if (!teamId) {
        formContainer.classList.add('hidden');
        return;
    }

    // Find selected team
    const team = teams.find(t => t.team_id === teamId);
    if (team) {
        document.getElementById('selectedTeamDisplay').textContent =
            `${team.team_leader}`;
    }

    // Check if already evaluated to pre-fill
    if (evaluatedTeamIds.includes(teamId)) {
        showAlert('Editing previous evaluation for this team.', 'info');

        try {
            const { data, error } = await window.supabaseClient
                .from('evaluations')
                .select('*')
                .eq('judge_id', currentUser.id)
                .eq('team_id', teamId)
                .single();

            if (data) {
                // Pre-fill form
                document.getElementById('skitExecution').value = data.skit_execution;
                document.getElementById('sloganJingle').value = data.slogan_jingle;
                document.getElementById('teamCoordination').value = data.team_coordination;
                document.getElementById('offensiveContent').checked = data.offensive_content;
                document.getElementById('originalContent').checked = data.original_content;
                document.getElementById('timeLimitFollowed').checked = data.time_limit_followed;
                calculateTotalScore();

                // Change button text
                document.getElementById('submitBtn').textContent = 'Update Evaluation';
            }
        } catch (err) {
            console.error('Error fetching existing evaluation:', err);
        }
    } else {
        // Reset form for new evaluation
        resetForm();
        document.getElementById('submitBtn').textContent = 'Finalize & Securely Submit';
    }

    // Show form
    formContainer.classList.remove('hidden');
}

function calculateTotalScore() {
    const skit = parseInt(document.getElementById('skitExecution').value) || 0;
    const slogan = parseInt(document.getElementById('sloganJingle').value) || 0;
    const coordination = parseInt(document.getElementById('teamCoordination').value) || 0;

    const total = skit + slogan + coordination;
    document.getElementById('totalScore').textContent = total;
}

function validateScore(e) {
    const input = e.target;
    const value = parseInt(input.value);
    const max = parseInt(input.max);
    const min = parseInt(input.min);

    if (value > max) {
        input.value = max;
        showAlert(`Maximum score for ${input.name} is ${max}`, 'warning');
    } else if (value < min) {
        input.value = min;
    }

    calculateTotalScore();
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault();

    const teamId = document.getElementById('teamSelect').value;
    if (!teamId) {
        showAlert('Please select a team', 'error');
        return;
    }

    // Get form data
    const skit = parseInt(document.getElementById('skitExecution').value);
    const slogan = parseInt(document.getElementById('sloganJingle').value);
    const coordination = parseInt(document.getElementById('teamCoordination').value);
    const total = skit + slogan + coordination;

    const offensive = document.getElementById('offensiveContent').checked;
    const original = document.getElementById('originalContent').checked;
    const timeLimit = document.getElementById('timeLimitFollowed').checked;

    // Validate scores
    if (skit < 0 || skit > 20 || slogan < 0 || slogan > 15 || coordination < 0 || coordination > 15) {
        showAlert('Please enter valid scores within the allowed range', 'error');
        return;
    }

    // Direct Submission
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const submissionData = {
        team_id: teamId,
        judge_id: currentUser.id,
        skit_execution: skit,
        slogan_jingle: slogan,
        team_coordination: coordination,
        total_score: total,
        offensive_content: offensive,
        original_content: original,
        time_limit_followed: timeLimit
    };

    try {
        // Upsert: Insert or Update if conflict on (judge_id, team_id)
        const { data, error } = await window.supabaseClient
            .from('evaluations')
            .upsert([submissionData], { onConflict: 'judge_id, team_id' })
            .select();

        if (error) throw error;

        // Success!
        showAlert(evaluatedTeamIds.includes(teamId) ? 'Evaluation updated successfully!' : 'Evaluation submitted successfully!', 'success');

        // Reset form and reload
        resetForm();
        document.getElementById('teamSelect').value = '';
        document.getElementById('evaluationFormContainer').classList.add('hidden');

        await loadSubmittedEvaluations();

        // Scroll to submitted evaluations
        document.getElementById('submittedEvaluations').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Submission error:', error);
        showAlert(error.message || 'Error submitting evaluation. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Finalize & Securely Submit';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function resetForm() {
    document.getElementById('skitExecution').value = 0;
    document.getElementById('sloganJingle').value = 0;
    document.getElementById('teamCoordination').value = 0;
    document.getElementById('offensiveContent').checked = false;
    document.getElementById('originalContent').checked = true;
    document.getElementById('timeLimitFollowed').checked = true;
    calculateTotalScore();
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = `alert-${type}`;
    const alertHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;
    alertContainer.innerHTML = alertHTML;

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);

    // Scroll to top to show alert
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleSignOut() {
    const success = await signOut();
    if (success) {
        window.location.href = 'login.html';
    }
}
