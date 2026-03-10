// Account Center functionality - enhanced to match platform account layout
(function(){
    function $(id){ return document.getElementById(id); }

    function loadUser(){
        try{
            var user = JSON.parse(localStorage.getItem('user') || '{}');
            $('fullName').value = user.fullName || '';
            $('username').value = user.username || '';
            $('email').value = user.email || '';
            var pub = localStorage.getItem('profilePublic');
            $('profilePublic').checked = pub === null ? true : (pub === 'true');
            $('account-healtherid').textContent = user.healtherId || user.id || '—';
            $('account-role').textContent = user.role || 'citizen';
            $('account-member-since').textContent = user.memberSince || '';

            // badges
            var badgesList = $('account-badges-list');
            badgesList.innerHTML = '';
            var storeBadges = JSON.parse(localStorage.getItem('badges') || '[]');
            var source = user.badges || storeBadges || [];
            source.forEach(function(b){ var li = document.createElement('li'); li.className='badge-item'; li.textContent = (b && b.name) ? b.name : b; badgesList.appendChild(li); });

            // avatar
            var avatarData = localStorage.getItem('citizenProfilePhoto') || user.avatar || '';
            $('account-avatar').src = avatarData || '/frontend/assets/images/default-avatar.png';
        }catch(e){ console.warn('Could not load user', e); }
    }

    function saveProfile(){
        try{
            var user = JSON.parse(localStorage.getItem('user') || '{}');
            user.fullName = ($('fullName') ? $('fullName').value.trim() : (user.fullName||'')) || user.fullName;
            user.username = ($('username') ? $('username').value.trim() : (user.username||'')) || user.username;
            localStorage.setItem('user', JSON.stringify(user));
            var pubChecked = ($('profilePublic') ? $('profilePublic').checked : (localStorage.getItem('profilePublic') === 'true'));
            localStorage.setItem('profilePublic', pubChecked ? 'true' : 'false');

            // try syncing with backend
            (async function(){
                try{
                    var token = localStorage.getItem('token');
                    if(token){
                        var res = await fetch('/api/users/' + (user.id || user.healtherId || ''), {
                            method: 'PUT', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+token },
                            body: JSON.stringify({ fullName: user.fullName, username: user.username, public: pubChecked })
                        });
                        if(res.ok){ alert('Profile saved and synced to server.'); return; }
                    }
                }catch(e){ /* ignore network/backend errors */ }
                alert('Profile saved locally. Server sync requires backend support.');
            })();
            // update visible display fields
            try{ if($('account-fullname')) $('account-fullname').textContent = user.fullName || '—'; if($('account-username')) $('account-username').textContent = user.username ? ('@'+user.username) : '—'; }catch(e){}
            // hide edit form if present
            try{ if($('account-edit-form')) $('account-edit-form').hidden = true; }catch(e){}
        }catch(e){ console.error(e); alert('Could not save profile'); }
    }

    function resetProfile(){
        if(!confirm('Reset Full name and Username to empty?')) return;
        try{
            var user = JSON.parse(localStorage.getItem('user') || '{}');
            user.fullName = '';
            user.username = '';
            localStorage.setItem('user', JSON.stringify(user));
            loadUser();
            alert('Profile fields reset locally.');
        }catch(e){ console.error(e); }
    }

    async function changePassword(){
        var cur = $('currentPassword').value;
        var nw = $('newPassword').value;
        var conf = $('confirmPassword').value;
        var msg = $('password-message');
        msg.textContent = '';
        if(!cur || !nw || !conf){ msg.textContent = 'Please fill all password fields'; return; }
        if(nw !== conf){ msg.textContent = 'New passwords do not match'; return; }

        // Try calling backend endpoint if token exists
        var token = localStorage.getItem('token');
        if(token){
            try{
                var res = await fetch('/api/auth/change-password', {
                    method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+token },
                    body: JSON.stringify({ currentPassword: cur, newPassword: nw })
                });
                if(res.ok){ msg.textContent = 'Password changed successfully'; $('currentPassword').value=''; $('newPassword').value=''; $('confirmPassword').value=''; return; }
                var d = await res.json().catch(()=>({}));
                msg.textContent = d.error || 'Password change failed';
                return;
            }catch(e){ console.warn('API password change failed', e); }
        }

        // Fallback for local/demo: store a note in session (do NOT store passwords in localStorage in production)
        try{ sessionStorage.setItem('demoPasswordChanged','true'); msg.textContent='Password change saved for demo (no backend).'; }catch(e){ msg.textContent='Could not change password (no backend)'; }
    }

    function togglePublic(){
        var val = $('profilePublic').checked;
        localStorage.setItem('profilePublic', val ? 'true' : 'false');
        alert('Profile visibility set to ' + (val ? 'Public' : 'Private'));
    }

    function deleteAccount(){
        if(!confirm('Delete account? This will remove local user data only.')) return;
        try{ localStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('profilePublic'); alert('Local account data removed.'); location.href='citizen.html'; }catch(e){ console.error(e); }
    }

    document.addEventListener('DOMContentLoaded', function(){
        loadUser();
        if($('saveProfile')) $('saveProfile').addEventListener('click', saveProfile);
        if($('resetProfile')) $('resetProfile').addEventListener('click', resetProfile);
        if($('changePassword')) $('changePassword').addEventListener('click', changePassword);
        if($('profilePublic')) $('profilePublic').addEventListener('change', togglePublic);
        if($('togglePublicBtn')) $('togglePublicBtn').addEventListener('click', function(){ $('profilePublic').checked = !$('profilePublic').checked; togglePublic(); });
        if($('deleteAccount')) $('deleteAccount').addEventListener('click', deleteAccount);

        // Edit profile toggle
        if($('editProfileBtn')){
            $('editProfileBtn').addEventListener('click', function(){
                // populate edit inputs and show form
                try{ var user = JSON.parse(localStorage.getItem('user') || '{}'); if($('fullName')) $('fullName').value = user.fullName || ''; if($('username')) $('username').value = user.username || ''; }catch(e){}
                if($('account-edit-form')) $('account-edit-form').hidden = false;
                if($('editProfileBtn')) $('editProfileBtn').hidden = true;
            });
        }
        if($('cancelEdit')){
            $('cancelEdit').addEventListener('click', function(){ if($('account-edit-form')) $('account-edit-form').hidden = true; if($('editProfileBtn')) $('editProfileBtn').hidden = false; });
        }

        // avatar upload handling
        $('account-avatar-input').addEventListener('change', function(e){
            var f = e.target.files && e.target.files[0]; if(!f) return;
            var reader = new FileReader();
            reader.onload = function(){
                $('account-avatar').src = reader.result;
                localStorage.setItem('citizenProfilePhoto', reader.result);
                try{ var user = JSON.parse(localStorage.getItem('user') || '{}'); user.avatar = reader.result; localStorage.setItem('user', JSON.stringify(user)); }catch(e){}
            };
            reader.readAsDataURL(f);
        });

        $('account-avatar-remove').addEventListener('click', function(){
            if(!confirm('Remove profile photo?')) return;
            localStorage.removeItem('citizenProfilePhoto');
            try{ var user = JSON.parse(localStorage.getItem('user') || '{}'); user.avatar = ''; localStorage.setItem('user', JSON.stringify(user)); }catch(e){}
            $('account-avatar').src = '/frontend/assets/images/default-avatar.png';
        });
    });
})();
