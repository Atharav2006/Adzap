// ============================================
// AdZapp Judge Evaluation System
// Login Page JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const alertContainer = document.getElementById('alertContainer');
    const roleRadios = document.getElementsByName('userRole');
    const loginLabel = document.getElementById('loginLabel');
    const loginInput = document.getElementById('emailOrName');
    const loginHint = document.getElementById('loginHint');

    // Authorized Judges Mapping (Name -> Email)
    const JUDGE_MAPPING = {
        'Chetna Chand': 'chetna.chand@judge.adzapp.com',
        'Purvi Ramanujan': 'purvi.ramanujan@judge.adzapp.com',
        'Vashim Qureshi': 'vashim.qureshi@judge.adzapp.com',
        'Hetal Joshiyara': 'hetal.joshiyara@judge.adzapp.com'
    };

    // Update UI based on role selection
    roleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const role = e.target.value;
            if (role === 'admin') {
                loginLabel.textContent = 'User Email';
                loginInput.placeholder = 'user@example.com';
                loginInput.type = 'email';
                loginHint.textContent = 'Enter your user email address';
            } else {
                loginLabel.textContent = 'Judge Name';
                loginInput.placeholder = 'Enter your full name';
                loginInput.type = 'text';
                loginHint.textContent = 'Enter your authorized judge name';
            }
        });
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rawInput = document.getElementById('emailOrName').value.trim();
        let password = document.getElementById('password').value;
        const selectedRole = document.querySelector('input[name="userRole"]:checked').value;

        // Validate inputs
        if (!rawInput || !password) {
            showAlert('Please enter both credentials', 'error');
            return;
        }

        let emailToUse = rawInput.toLowerCase();

        // If Judge, try to resolve Name -> Email
        if (selectedRole === 'judge') {
            // Check if input matches a judge name (case-insensitive check)
            const judgeName = Object.keys(JUDGE_MAPPING).find(name =>
                name.toLowerCase() === rawInput.toLowerCase()
            );

            if (judgeName) {
                emailToUse = JUDGE_MAPPING[judgeName];
            } else if (!rawInput.includes('@')) {
                // If it's not an email and not in our list
                showAlert('Judge name not recognized. Please check the spelling or ask admin.', 'error');
                return;
            }
        }

        // Disable button and show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        try {
            // Attempt to sign in with Supabase Auth
            let { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: emailToUse,
                password: password
            });

            if (error) throw error;

            // Check if user exists in judges table (and insert if missing, for legacy compatibility)
            // Note: In strict mode, we might skip this, but keeping it for robustness
            const { data: judgeData, error: judgeError } = await window.supabaseClient
                .from('judges')
                .select('*')
                .eq('judge_id', data.user.id)
                .single();

            if (!judgeData && selectedRole === 'judge') {
                // Find name from mapping or fall back
                const judgeName = Object.keys(JUDGE_MAPPING).find(key => JUDGE_MAPPING[key] === emailToUse) || 'Unknown Judge';

                await window.supabaseClient
                    .from('judges')
                    .insert([
                        {
                            judge_id: data.user.id,
                            judge_name: judgeName,
                            email: emailToUse
                        }
                    ]);
            }

            // Success! Show message and redirect
            showAlert('Login successful! Redirecting...', 'success');

            // Redirect based on selected role
            if (selectedRole === 'admin') {
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                setTimeout(() => {
                    window.location.href = 'judge.html';
                }, 1000);
            }

        } catch (error) {
            console.error('Login error:', error);

            // Show user-friendly error message
            let errorMessage = 'Login failed. Please check your credentials.';

            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Invalid name/email or password.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Please confirm your email address or contact admin.';
            }

            showAlert(errorMessage, 'error');

            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    });

    // Helper function to show alerts
    function showAlert(message, type = 'info') {
        const alertClass = `alert-${type}`;
        const alertHTML = `
            <div class="alert ${alertClass}">
                ${message}
            </div>
        `;
        alertContainer.innerHTML = alertHTML;

        // Auto-dismiss success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 3000);
        }
    }

    // Clear any existing alerts when user starts typing
    document.getElementById('emailOrName').addEventListener('input', () => {
        alertContainer.innerHTML = '';
    });

    document.getElementById('password').addEventListener('input', () => {
        alertContainer.innerHTML = '';
    });
});
