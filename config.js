// ============================================
// AdZapp Judge Evaluation System
// Supabase Configuration
// ============================================

(function () {
    const SUPABASE_URL = 'https://jidjiadnkuljvrvkpjjt.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZGppYWRua3VsanZydmtwamp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzMyMjMsImV4cCI6MjA4NTg0OTIyM30.BYY96_NBSbHXfURRWZz0XdBh7aEx0LLIaRzLlbn4qVM';

    // Initialize Supabase client
    // We use window.supabaseClient to make it globally available
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase library not loaded! Check your script tags.');
    }

    // WEB APP URL for Google Drive Uploads
    // TODO: User must paste their deployed script URL here
    window.GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-7ojOg6CzCidTNkR_mBhg8DC-Qs1ojtSeuabBBF67VpvWZzSTOnEsWNHS7FJ5Ba6rLA/exec'; // e.g. 'https://script.google.com/macros/s/...'

    // Helper function to check if user is authenticated
    window.checkAuth = async function () {
        if (!window.supabaseClient) return null;
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error) {
            console.error('Auth check error:', error);
            return null;
        }
        return session;
    };

    // Helper function to get current user
    window.getCurrentUser = async function () {
        if (!window.supabaseClient) return null;
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (error) {
            console.error('Get user error:', error);
            return null;
        }
        return user;
    };

    // Helper function to sign out
    window.signOut = async function () {
        if (!window.supabaseClient) return false;
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
            return false;
        }
        return true;
    };
})();

// Clear any existing alerts when user starts typing (moved from login.js to be globally available)
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        const alertContainer = document.getElementById('alertContainer');
        if (alertContainer) alertContainer.innerHTML = '';
    }
});
