/**
 * Healther Logout Utility
 * Handles user logout across all platforms
 */

/**
 * Perform user logout - clears session and redirects to login
 * @param {Object} options - Configuration options
 * @param {boolean} options.showAlert - Show confirmation alert (default: true)
 * @param {string} options.redirectTo - URL to redirect after logout (default: ../auth/auth.html)
 */
function healerLogout(options = {}) {
    const {
        showAlert = true,
        redirectTo = '../auth/auth.html'
    } = options;

    try {
        // Clear authentication token
        localStorage.removeItem('token');
        // Clear user profile data
        localStorage.removeItem('user');
        // Clear citizen registration data
        localStorage.removeItem('citizenData');
        // Clear tertiary identity data
        localStorage.removeItem('tertiaryData');
        // Clear authentication step tracking
        sessionStorage.removeItem('authStep');
        sessionStorage.removeItem('citizenPassword');
        // Theme preference is kept to maintain user's choice
        
        console.log('✅ Session cleared successfully');
    } catch(e) {
        console.warn('Could not clear some session data:', e);
    }
    
    // Show logout confirmation
    if (showAlert) {
        alert('You have been logged out successfully. Redirecting to login...');
    }
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = redirectTo;
    }, 500);
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { healerLogout };
}
