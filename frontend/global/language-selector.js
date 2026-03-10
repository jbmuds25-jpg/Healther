/**
 * Language Selector UI Component
 * Shows language selection modal when user clicks language settings
 */

function showLanguageSelector() {
    // Get the available languages
    const languages = getAvailableLanguages();
    const currentLang = getCurrentLanguage();
    
    // Create modal HTML
    const modalHTML = `
        <div id="language-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;">
            <div class="modal-content" style="background: var(--bg); color: var(--text); border-radius: 12px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 400px; width: 90%; max-height: 600px; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 1.5em;" data-i18n="language_select">Select Language</h2>
                    <button onclick="closeLanguageSelector()" style="background: none; border: none; color: var(--text); font-size: 1.5em; cursor: pointer;">&times;</button>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${languages.map(lang => `
                        <button 
                            onclick="selectLanguage('${lang.code}')" 
                            style="
                                padding: 12px 16px;
                                border: 2px solid ${currentLang === lang.code ? 'var(--primary, #007AFF)' : 'var(--border, #e0e0e0)'};
                                background: ${currentLang === lang.code ? 'var(--primary-bg, #f0f4ff)' : 'transparent'};
                                color: var(--text);
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 1em;
                                transition: all 0.2s;
                                text-align: left;
                                font-weight: ${currentLang === lang.code ? 'bold' : 'normal'};
                            "
                            onmouseover="this.style.borderColor='var(--primary, #007AFF)'; this.style.transform='translateX(4px)';"
                            onmouseout="this.style.borderColor='${currentLang === lang.code ? 'var(--primary, #007AFF)' : 'var(--border, #e0e0e0)'}'; this.style.transform='translateX(0)';"
                        >
                            ${currentLang === lang.code ? '✓ ' : ''}${lang.name}
                        </button>
                    `).join('')}
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button 
                        onclick="closeLanguageSelector()" 
                        style="
                            padding: 10px 20px;
                            border: 1px solid var(--border, #e0e0e0);
                            background: transparent;
                            color: var(--text);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.95em;
                        "
                        data-i18n="language_cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existing = document.getElementById('language-modal');
    if (existing) existing.remove();
    
    // Add to body
    const temp = document.createElement('div');
    temp.innerHTML = modalHTML;
    document.body.appendChild(temp.firstElementChild);
    
    // Apply translations to new modal
    applyTranslations();
    
    // Close on background click
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLanguageSelector();
            }
        });
    }
}

function selectLanguage(langCode) {
    setLanguage(langCode);
    
    // Show confirmation
    alert(`Language changed to ${getAvailableLanguages().find(l => l.code === langCode).name}`);
    
    // Apply translations to page
    applyTranslations();
    
    // Close modal
    setTimeout(closeLanguageSelector, 300);
}

function closeLanguageSelector() {
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 200);
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLanguageSelector,
        selectLanguage,
        closeLanguageSelector
    };
}
