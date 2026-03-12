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

// Navigation functionality
(function(){
    try{
        const homePage = document.querySelector('.home-page');
        const patientsPage = document.getElementById('patients-page');
        const appointmentsPage = document.getElementById('appointments-page');
        const messagesPage = document.getElementById('messages-page');
        const navItems = document.querySelectorAll('.sidebar .nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', function(){
                const key = item.getAttribute('data-key');
                
                // Hide all pages
                if (homePage) homePage.style.display = 'none';
                if (patientsPage) patientsPage.setAttribute('hidden', '');
                if (appointmentsPage) appointmentsPage.setAttribute('hidden', '');
                if (messagesPage) messagesPage.setAttribute('hidden', '');
                
                // Show selected page
                if (key === 'home') {
                    if (homePage) homePage.style.display = '';
                } else if (key === 'patients') {
                    if (patientsPage) patientsPage.removeAttribute('hidden');
                } else if (key === 'appointments') {
                    if (appointmentsPage) appointmentsPage.removeAttribute('hidden');
                } else if (key === 'messages') {
                    if (messagesPage) messagesPage.removeAttribute('hidden');
                }
                
                // Update active state
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }catch(e){ console.error('Navigation init error', e); }
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
if (messagesList) {
    messagesList.innerHTML = "";
    messages.forEach(m => {
        const li = document.createElement("li");
        li.textContent = m;
        messagesList.appendChild(li);
    });
}

const appointmentsList = document.getElementById("appointments-list");
if (appointmentsList) {
    appointmentsList.innerHTML = "";
    appointments.forEach(a => {
        const li = document.createElement("li");
        li.textContent = a;
        appointmentsList.appendChild(li);
    });
}