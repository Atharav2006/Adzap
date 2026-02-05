// ============================================
// AdZapp Judge Evaluation System
// Admin Dashboard JavaScript
// ============================================

let allTeams = [];
let allEvaluations = [];
let allJudges = [];
let teamRankings = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAdminDashboard();
});

// ============================================
// INITIALIZATION
// ============================================

async function initializeAdminDashboard() {
    try {
        // Check authentication
        const user = await getCurrentUser();

        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Check if admin (anyone NOT ending in @judge.adzapp.com is considered a user/admin)
        if (!user.email || user.email.endsWith('@judge.adzapp.com')) {
            showAlert('Access denied. Admin privileges required.', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }

        // Load all data
        await loadAllData();

    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Error initializing dashboard. Please refresh.', 'error');
    }
}

// ============================================
// LOAD DATA
// ============================================

async function loadAllData() {
    try {
        // Load teams
        const { data: teamsData, error: teamsError } = await window.supabaseClient
            .from('teams')
            .select('*')
            .order('team_number', { ascending: true });

        if (teamsError) throw teamsError;
        allTeams = teamsData;

        // Load all evaluations with judge and team info
        const { data: evaluationsData, error: evaluationsError } = await window.supabaseClient
            .from('evaluations')
            .select(`
                *,
                judges (judge_id, judge_name, email),
                teams (team_id, team_number, team_leader)
            `)
            .order('created_at', { ascending: false });

        if (evaluationsError) throw evaluationsError;
        allEvaluations = evaluationsData;

        // Load all judges
        const { data: judgesData, error: judgesError } = await window.supabaseClient
            .from('judges')
            .select('*');

        if (judgesError) throw judgesError;
        allJudges = judgesData;

        // Calculate rankings
        calculateRankings();

        // Update UI
        updateSummaryStats();
        displayRankings();

    } catch (error) {
        console.error('Error loading data:', error);
        showAlert('Error loading data. Please refresh the page.', 'error');
    }
}

// ============================================
// CALCULATIONS
// ============================================

function calculateRankings() {
    teamRankings = allTeams.map(team => {
        // Get all evaluations for this team
        const teamEvaluations = allEvaluations.filter(e => e.team_id === team.team_id);

        // Calculate totals
        const judgesCount = teamEvaluations.length;
        const finalScore = teamEvaluations.reduce((sum, e) => sum + e.total_score, 0);

        // Check for offensive content
        const hasOffensiveContent = teamEvaluations.some(e => e.offensive_content === true);

        // Get average scores for display
        const avgSkitExecution = judgesCount > 0
            ? (teamEvaluations.reduce((sum, e) => sum + e.skit_execution, 0) / judgesCount).toFixed(1)
            : 0;
        const avgSloganJingle = judgesCount > 0
            ? (teamEvaluations.reduce((sum, e) => sum + e.slogan_jingle, 0) / judgesCount).toFixed(1)
            : 0;
        const avgTeamCoordination = judgesCount > 0
            ? (teamEvaluations.reduce((sum, e) => sum + e.team_coordination, 0) / judgesCount).toFixed(1)
            : 0;

        return {
            team_id: team.team_id,
            team_number: team.team_number,
            team_leader: team.team_leader,
            judges_count: judgesCount,
            final_score: finalScore,
            has_offensive_content: hasOffensiveContent,
            avg_skit_execution: avgSkitExecution,
            avg_slogan_jingle: avgSloganJingle,
            avg_team_coordination: avgTeamCoordination,
            evaluations: teamEvaluations
        };
    });

    // Sort by final score (descending), then by team number (ascending)
    teamRankings.sort((a, b) => {
        if (b.final_score !== a.final_score) {
            return b.final_score - a.final_score;
        }
        return a.team_number - b.team_number;
    });
}

// ============================================
// UI UPDATES
// ============================================

function updateSummaryStats() {
    document.getElementById('totalTeams').textContent = allTeams.length;
    document.getElementById('totalEvaluations').textContent = allEvaluations.length;

    // Count unique judges who have submitted evaluations
    const uniqueJudges = new Set(allEvaluations.map(e => e.judge_id));
    document.getElementById('totalJudges').textContent = uniqueJudges.size;

    // Calculate average score per team
    const teamsWithEvaluations = teamRankings.filter(t => t.judges_count > 0);
    const avgScore = teamsWithEvaluations.length > 0
        ? (teamsWithEvaluations.reduce((sum, t) => sum + t.final_score, 0) / teamsWithEvaluations.length).toFixed(1)
        : 0;
    document.getElementById('avgScore').textContent = avgScore;
}

function displayRankings() {
    const container = document.getElementById('rankingsContainer');

    if (teamRankings.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No teams found.</p>';
        return;
    }

    let html = '<div class="table-container"><table>';
    html += '<thead><tr>';
    html += '<th>Rank</th>';
    html += '<th>Team Leader</th>';
    html += '<th>Judges</th>';
    html += '<th>Avg Skit</th>';
    html += '<th>Avg Slogan</th>';
    html += '<th>Avg Coord</th>';
    html += '<th>Total Score</th>';
    html += '<th>Status</th>';
    html += '<th>Actions</th>';
    html += '</tr></thead><tbody>';

    teamRankings.forEach((team, index) => {
        const rank = index + 1;
        const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;

        let statusBadge = '';
        if (team.has_offensive_content) {
            statusBadge = '<span class="badge badge-danger">🚨 Flagged</span>';
        } else if (team.judges_count === 0) {
            statusBadge = '<span class="badge badge-warning">Not Evaluated</span>';
        } else {
            statusBadge = '<span class="badge badge-success">✓ Clean</span>';
        }

        const rowBg = rank === 1 ? 'rgba(255, 215, 0, 0.05)' : rank === 2 ? 'rgba(192, 192, 192, 0.05)' : rank === 3 ? 'rgba(205, 127, 50, 0.05)' : '';

        html += `<tr style="background: ${rowBg}">
            <td style="font-weight: 800; font-size: 1.25rem; text-align: center;">${rankBadge}</td>
            <td>
                <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">${team.team_leader}</div>
                <div class="text-dim small" style="opacity: 0.6;">Team Reference #${team.team_number}</div>
            </td>
            <td style="text-align: center;"><span class="badge" style="background: rgba(255,255,255,0.1);">${team.judges_count}</span></td>
            <td style="text-align: center; color: var(--text-muted);">${team.avg_skit_execution}</td>
            <td style="text-align: center; color: var(--text-muted);">${team.avg_slogan_jingle}</td>
            <td style="text-align: center; color: var(--text-muted);">${team.avg_team_coordination}</td>
            <td style="text-align: center;">
                <span style="font-weight: 800; font-size: 1.25rem; color: var(--primary); font-family: 'Outfit';">
                    ${team.final_score}
                </span>
            </td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;" 
                        onclick="showTeamDetails('${team.team_id}')"
                        ${team.judges_count === 0 ? 'disabled' : ''}>
                    Analytics
                </button>
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function showTeamDetails(teamId) {
    const team = teamRankings.find(t => t.team_id === teamId);
    if (!team || team.evaluations.length === 0) return;

    // Scroll table into view
    document.getElementById('detailsContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });

    let html = `
        <div class="animate-fade-in">
            <div class="mb-lg" style="border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                <h4 class="text-primary mb-xs" style="font-size: 1.5rem;">${team.team_leader}</h4>
                <div style="display: flex; gap: 1rem; color: var(--text-dim); font-size: 0.875rem;">
                    <span>Ref #${team.team_number}</span>
                    <span>•</span>
                    <span>${team.judges_count} Evaluations</span>
                    <span>•</span>
                    <span class="text-primary">Score: ${team.final_score}</span>
                </div>
            </div>`;

    html += '<div class="table-container"><table style="font-size: 0.875rem;"><thead><tr>';
    html += '<th>Judge</th>';
    html += '<th style="text-align: center;">Scores</th>';
    html += '<th style="text-align: center;">Total</th>';
    html += '<th>Flags</th>';
    html += '</tr></thead><tbody>';

    team.evaluations.forEach(e => {
        let flags = [];
        if (e.offensive_content) flags.push('<span class="badge badge-danger" title="Offensive Content">OFF</span>');
        if (!e.original_content) flags.push('<span class="badge badge-warning" title="Plagiarized">PLG</span>');
        if (!e.time_limit_followed) flags.push('<span class="badge badge-warning" title="Time Limit Exceeded">TIME</span>');

        const flagDisplay = flags.length > 0 ? flags.join(' ') : '<span class="text-dim">-</span>';

        html += `<tr>
            <td>
                <div style="font-weight: 600; color: var(--text-main);">${e.judges.judge_name}</div>
            </td>
            <td style="text-align: center; color: var(--text-muted); font-family: monospace;">
                S:${e.skit_execution} J:${e.slogan_jingle} C:${e.team_coordination}
            </td>
            <td style="text-align: center;">
                <span style="font-weight: 700; color: var(--secondary);">${e.total_score}</span>
            </td>
            <td>${flagDisplay}</td>
        </tr>`;
    });

    html += '</tbody></table></div></div>';

    document.getElementById('detailsContainer').innerHTML = html;
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

function exportToCSV() {
    try {
        // Headers
        let csv = 'Rank,Team Number,Team Leader,Judges Count,Skit Exec (Avg),Slogan (Avg),Coord (Avg),Total Score,Status\n';

        // Data
        teamRankings.forEach((team, index) => {
            csv += `${index + 1},${team.team_number},"${team.team_leader}",${team.judges_count},${team.avg_skit_execution},${team.avg_slogan_jingle},${team.avg_team_coordination},${team.final_score},${team.has_offensive_content ? 'Flagged' : 'Clean'}\n`;
        });

        // Add detailed evaluations
        csv += '\n\nDetailed Evaluations\n';
        csv += 'Team Number,Team Name,Judge Name,Skit Execution,Slogan/Jingle,Team Coordination,Total Score,Offensive Content,Original Content,Time Limit Followed,Submitted At\n';

        allEvaluations.forEach(evaluation => {
            csv += `${evaluation.teams.team_number},`;
            csv += `"${evaluation.teams.team_name}",`;
            csv += `"${evaluation.judges.judge_name}",`;
            csv += `${evaluation.skit_execution},`;
            csv += `${evaluation.slogan_jingle},`;
            csv += `${evaluation.team_coordination},`;
            csv += `${evaluation.total_score},`;
            csv += `${evaluation.offensive_content ? 'Yes' : 'No'},`;
            csv += `${evaluation.original_content ? 'Yes' : 'No'},`;
            csv += `${evaluation.time_limit_followed ? 'Yes' : 'No'},`;
            csv += `"${new Date(evaluation.created_at).toLocaleString()}"\n`;
        });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `adzapp_results_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showAlert('Results exported successfully!', 'success');

    } catch (error) {
        console.error('Export error:', error);
        showAlert('Error exporting data. Please try again.', 'error');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function refreshData() {
    showAlert('Refreshing data...', 'info');
    await loadAllData();
    showAlert('Data refreshed successfully!', 'success');
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

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleSignOut() {
    const success = await signOut();
    if (success) {
        window.location.href = 'login.html';
    }
}

// ============================================
// SETUP AUTHORIZED TEAMS
// ============================================

async function setupAuthorizedTeams() {
    if (!confirm('This will CLEAR all existing teams and evaluations and reset them to the authorized 12 teams. Are you sure?')) {
        return;
    }

    showAlert('Starting database reset...', 'info');

    try {
        // 1. Clear evaluations (due to foreign key constraints)
        const { error: evalError } = await window.supabaseClient
            .from('evaluations')
            .delete()
            .neq('evaluation_id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (evalError) throw evalError;

        // 2. Clear teams
        const { error: teamClearError } = await window.supabaseClient
            .from('teams')
            .delete()
            .neq('team_number', 0); // Delete all

        if (teamClearError) throw teamClearError;

        // 3. Insert authorized teams
        const AUTHORIZED_TEAMS = [
            { team_number: 1, team_leader: 'Shrey Miteshbhai Butala' },
            { team_number: 2, team_leader: 'Parth M' },
            { team_number: 3, team_leader: 'Kothari Krupali Ashokbhai' },
            { team_number: 4, team_leader: 'Vagadiya yati nareshbhai' },
            { team_number: 5, team_leader: 'Aleena Sebi' },
            { team_number: 6, team_leader: 'Patel Khushi Nirajkumar' },
            { team_number: 7, team_leader: 'Patel Dhruvi Sanjaykumar' },
            { team_number: 8, team_leader: 'Pal Umesh Laltabhai' },
            { team_number: 9, team_leader: 'Dhrumi Tailor' },
            { team_number: 10, team_leader: 'Dishant Solanki' },
            { team_number: 11, team_leader: 'Daksh Mehta' },
            { team_number: 12, team_leader: 'Patel DhruvikaKumari shaileshbhai' }
        ];

        const { error: insertError } = await window.supabaseClient
            .from('teams')
            .insert(AUTHORIZED_TEAMS);

        if (insertError) throw insertError;

        showAlert('Database synchronized successfully!', 'success');
        await loadAllData();

    } catch (error) {
        console.error('Setup error:', error);
        showAlert(`Error resetting database: ${error.message}`, 'error');
    }
}

// ============================================
// FILE UPLOAD HANDLER
// ============================================

async function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const statusDiv = document.getElementById('uploadStatus');

    if (fileInput.files.length === 0) {
        statusDiv.innerHTML = '<span style="color: var(--secondary);">⚠️ Please select a file first.</span>';
        return;
    }

    const file = fileInput.files[0];
    const scriptUrl = window.GOOGLE_SCRIPT_URL; // From config.js

    if (!scriptUrl) {
        statusDiv.innerHTML = `
            <span style="color: var(--secondary);">⚠️ Configuration Missing!</span><br>
            Please paste your deployed Google Script URL into <code>config.js</code>.<br>
            <a href="TRIGGER_GOOGLE_DRIVE.js" target="_blank" style="color: var(--primary);">View Setup Guide</a>
        `;
        return;
    }

    // Update UI
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span>⏳</span> Uploading...';
    statusDiv.innerHTML = 'Converting file...';

    const reader = new FileReader();
    reader.onload = async function (e) {
        const base64Data = e.target.result.split(',')[1]; // Remove "data:mime;base64," prefix

        const payload = {
            base64: base64Data,
            mimeType: file.type,
            filename: file.name
        };

        try {
            statusDiv.innerHTML = 'Sending to Drive...';

            // Send data as text/plain to avoid CORS preflight (Simple Request)
            const response = await fetch(scriptUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "text/plain"
                }
            });

            const result = await response.json();

            if (result.status === 'success') {
                statusDiv.innerHTML = `
                    <span style="color: var(--success);">✅ Upload Complete!</span><br>
                    <a href="${result.fileUrl}" target="_blank" style="color: var(--text-dim); text-decoration: underline;">View File</a>
                `;
                fileInput.value = ''; // Reset
            } else {
                throw new Error(result.message || 'Unknown server error');
            }

        } catch (error) {
            console.error('Upload error:', error);
            statusDiv.innerHTML = `
                <span style="color: var(--error);">⚠️ Upload Failed</span><br>
                ${error.message}<br>
                <small>Check Console for details.</small>
            `;
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<span>📤</span> Upload';
        }
    };

    reader.readAsDataURL(file);
}
