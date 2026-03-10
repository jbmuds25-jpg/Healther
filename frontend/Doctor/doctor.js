// Options and settings tile
(function(){
    try{
        const moreBtn = document.getElementById('more-options');
        const optTile = document.getElementById('options-tile');
        const settingsTile = document.getElementById('settings-tile');
        if(!moreBtn || !optTile) return;

        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
            moreBtn.setAttribute('aria-expanded', String(!expanded));
            if (expanded) optTile.setAttribute('hidden','');
            else optTile.removeAttribute('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#options-tile') && !e.target.closest('#more-options') && !e.target.closest('#settings-tile')) {
                optTile.setAttribute('hidden','');
                if (settingsTile) settingsTile.setAttribute('hidden','');
                moreBtn.setAttribute('aria-expanded','false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape'){
                optTile.setAttribute('hidden','');
                if (settingsTile) settingsTile.setAttribute('hidden','');
                moreBtn.setAttribute('aria-expanded','false');
            }
        });

        optTile.addEventListener('click', (e) => {
            const btn = e.target.closest('.opt-btn');
            if(!btn) return;
            const action = btn.dataset.action;
            optTile.setAttribute('hidden','');
            moreBtn.setAttribute('aria-expanded','false');
            if(action === 'settings'){
                if (settingsTile) settingsTile.removeAttribute('hidden');
            } else if(action === 'logout'){
                alert('Logging out...');
            } else if(action === 'profile'){
                window.location.href = '/profile';
            } else if(action === 'help'){
                window.location.href = '/help';
            }
        });

        if (settingsTile){
            settingsTile.addEventListener('click', (e) => {
                const sbtn = e.target.closest('.setting-btn');
                if(!sbtn) return;
                const setting = sbtn.dataset.setting;
                settingsTile.setAttribute('hidden','');
                if(setting === 'ai-mods') window.location.href = '/settings/ai-modifications';
                else if(setting === 'accounts') window.location.href = '/accounts';
                else if(setting === 'language') window.location.href = '/settings/language';
                else if(setting === 'theme') window.location.href = '/settings/theme';
                else if(setting === 'tutorials') window.location.href = '/tutorials';
            });
        }
    }catch(e){ console.error('Options init error', e); }
})();

// Mock data
const messages = [
    "Patient John Doe: Feeling unwell",
    "Patient Mary: Need prescription refill"
];
const appointments = [
    "John Doe - 2025-11-28 10:00AM",
    "Mary - 2025-11-29 2:00PM"
];

const messagesList = document.getElementById("messages-list");
messagesList.innerHTML = "";
messages.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m;
    messagesList.appendChild(li);
});

const appointmentsList = document.getElementById("appointments-list");
appointmentsList.innerHTML = "";
appointments.forEach(a => {
    const li = document.createElement("li");
    li.textContent = a;
    appointmentsList.appendChild(li);
});

// Navigation system for doctor platform
window.navigateToPage = function(pageKey) {
    console.log(`navigateToPage called with: ${pageKey}`);
    
    // Hide all pages
    const dashboard = document.getElementById('dashboard');
    const healthStatusPage = document.getElementById('health-status-page');
    const communityPage = document.getElementById('community-page');
    const badgesPage = document.getElementById('badges-page');
    
    if (dashboard) dashboard.style.display = 'none';
    if (healthStatusPage) healthStatusPage.setAttribute('hidden', '');
    if (communityPage) communityPage.setAttribute('hidden', '');
    if (badgesPage) badgesPage.setAttribute('hidden', '');
    
    // Show the requested page
    switch(pageKey) {
        case 'home':
            console.log('Navigating to Home Dashboard');
            if (dashboard) dashboard.style.display = '';
            break;
            
        case 'health-status':
            console.log('Navigating to Health Status');
            if (healthStatusPage) healthStatusPage.removeAttribute('hidden');
            break;
            
        case 'community':
            console.log('Navigating to Community');
            if (communityPage) communityPage.removeAttribute('hidden');
            break;
            
        case 'badges':
            console.log('Navigating to Badges');
            if (badgesPage) badgesPage.removeAttribute('hidden');
            break;
            
        default:
            console.warn(`Unknown page key: ${pageKey}`);
            // Fallback to home
            if (dashboard) dashboard.style.display = '';
            break;
    }
};

// Set up navigation after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOCTOR NAVIGATION SETUP ===');
    
    // Set up sidebar navigation
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    console.log('Navigation items found:', navItems.length);
    
    navItems.forEach((item) => {
        const key = item.getAttribute('data-key');
        console.log('Setting up navigation for:', key);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Doctor navigation clicked:', key);
            
            // Clear all active states
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Set active state
            this.classList.add('active');
            
            // Handle navigation
            switch(key) {
                case 'home':
                    console.log('Navigating to Home Dashboard');
                    navigateToPage('home');
                    break;
                    
                case 'patients':
                    console.log('Navigating to Patients');
                    navigateToPage('community');
                    break;
                    
                case 'appointments':
                    console.log('Navigating to Appointments');
                    navigateToPage('badges');
                    break;
                    
                case 'messages':
                    console.log('Messages clicked');
                    // Handle messages separately
                    break;
                    
                case 'account':
                    console.log('Navigating to Account');
                    // Handle account separately
                    break;
            }
        });
    });
    
    console.log('Doctor navigation setup complete');
});