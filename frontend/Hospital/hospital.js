// Theme toggle
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

// Mock hospital list
const hospitalList = document.getElementById("hospital-list");
let hospitals = ["Global Health Hospital", "Nairobi Central Clinic"];

hospitalList.innerHTML = "";
hospitals.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h;
    hospitalList.appendChild(li);
});