// ============================================
// AdZapp Judge Evaluation System
// User Signup Page JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Signup is disabled. All users must be pre-authorized.
    window.location.href = 'login.html';
    return;

    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const alertContainer = document.getElementById('alertContainer');

    // Handle form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate inputs
        if (!email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        // Check if email ends with @gmail.com or @admin.adzapp.com
        if (!email.toLowerCase().endsWith('@gmail.com') && !email.toLowerCase().endsWith('@admin.adzapp.com')) {
            showAlert('Only Gmail (@gmail.com) or authorized admin emails can sign up.', 'error');
            return;
        }

        // Disable button and show loading state
        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating Account...';

        try {
            // Create user in Supabase Auth
            const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw authError;

            // Success!
            showAlert(`Account created successfully! Redirecting to login...`, 'success');

            // Clear form
            signupForm.reset();

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Signup error:', error);
            showAlert(error.message || 'Failed to create account.', 'error');
            signupBtn.disabled = false;
            signupBtn.textContent = 'Create User Account';
        }
    });

    // Helper function to show alerts
    function showAlert(message, type = 'info') {
        const alertClass = `alert-${type}`;
        const alertHTML = `<div class="alert ${alertClass}">${message}</div>`;
        alertContainer.innerHTML = alertHTML;
    }
});
