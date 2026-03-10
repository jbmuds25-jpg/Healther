// Cross-platform navigation handler for Healther app
const PlatformNav = {
    platformMap: {
        citizen: '/citizen/citizen.html',
        doctor: '/Doctor/doctor.html',
        scientist: '/scientist/scientist.html',
        hospital: '/Hospital/hospital.html',
        management: '/Management/management.html'
    },

    // Initialize platform navigation listeners
    init: function() {
        // Get all navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = e.target.getAttribute('data-platform');
                if (platform) {
                    this.navigateTo(platform);
                }
            });
        });
    },

    // Navigate to a specific platform - opens in same tab
    navigateTo: function(platform) {
        if (this.platformMap[platform]) {
            window.location.href = this.platformMap[platform];
        } else {
            console.error('Unknown platform:', platform);
        }
    },

    // Handle upgrade navigation with absolute paths
    upgradeAndNavigate: function(targetPlatform) {
        // Use absolute paths that work from any platform
        const platformMap = {
            citizen: '/citizen/citizen.html',
            doctor: '/Doctor/doctor.html',
            scientist: '/scientist/scientist.html',
            hospital: '/Hospital/hospital.html',
            management: '/Management/management.html'
        };

        if (platformMap[targetPlatform]) {
            window.location.href = platformMap[targetPlatform];
        } else {
            console.error('Invalid platform:', targetPlatform);
        }
    }
};

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PlatformNav.init();
});
