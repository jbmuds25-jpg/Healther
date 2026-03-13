// Use real backend API endpoints (requires running backend/server.js)
const API = "/api";

// Check if Terms and Conditions have been accepted and reCAPTCHA verified
try {
    const termsAccepted = localStorage.getItem('termsAccepted');
    const captchaVerified = localStorage.getItem('captchaVerified');
    // Only redirect to the auth/terms flow when the user is not authenticated.
    let storedUser = null;
    try { storedUser = JSON.parse(localStorage.getItem('user')); } catch(e) { storedUser = null; }
    const isAuthenticated = !!(storedUser && (storedUser.username || storedUser.id));
        // Authentication check disabled to prevent unwanted redirects
        // if (!isAuthenticated && (termsAccepted !== 'true' || captchaVerified !== 'true')) {
        //     // Redirect directly to terms page if not accepted or verified and no authenticated user
        //     window.location.href = '../auth/terms.html';
        // }
} catch(err) {
    console.warn('Could not check terms acceptance:', err);
}

let currentUser = {
    id: 1,
    username: "johndoe",
    fullName: "John Doe",
    role: "citizen",
    badges: ["Welcome Badge"],
    upgradedTo: []
};
try {
    const stored = localStorage.getItem("user");
    if (stored) {
        const parsed = JSON.parse(stored);
        currentUser = Object.assign({}, currentUser, parsed);
        // Normalize fields coming from backend so the UI always has the right properties
        if (!currentUser.fullName) {
            currentUser.fullName = parsed.fullName || parsed.name || parsed.username || "";
        }
        if (!currentUser.username) {
            currentUser.username = parsed.username || (parsed.email ? parsed.email.split("@")[0] : "");
        }
        if (!currentUser.email && parsed.email) {
            currentUser.email = parsed.email;
        }
    }
    // Fallback: also merge data from citizen registration flow if backend user is missing or incomplete
    const citizenStored = localStorage.getItem("citizenData");
    if (citizenStored) {
        const citizen = JSON.parse(citizenStored);
        // Always merge registration data to ensure fields are populated
        if (citizen.fullName) {
            currentUser.fullName = citizen.fullName;
        }
        if (citizen.email) {
            currentUser.email = citizen.email;
            // Generate username from email if not set
            if (!currentUser.username) {
                currentUser.username = citizen.email.split("@")[0];
            }
        }
        if (citizen.username) {
            currentUser.username = citizen.username;
        }
        if (!currentUser.dateOfBirth && citizen.dateOfBirth) {
            currentUser.dateOfBirth = citizen.dateOfBirth;
        }
        if (!currentUser.nationality && citizen.nationality) {
            currentUser.nationality = citizen.nationality;
        }
        if (!currentUser.mobileNumber && citizen.mobileNumber) {
            currentUser.mobileNumber = citizen.mobileNumber;
        }
        if (!currentUser.countryCode && citizen.countryCode) {
            currentUser.countryCode = citizen.countryCode;
        }
        if (!currentUser.idNumber && citizen.idNumber) {
            currentUser.idNumber = citizen.idNumber;
        }
        if (!currentUser.birthCertificateNumber && citizen.birthCertificateNumber) {
            currentUser.birthCertificateNumber = citizen.birthCertificateNumber;
        }
        
        // Update localStorage with merged user data
        localStorage.setItem("user", JSON.stringify(currentUser));
    }
} catch (e) {
    console.warn("Could not load user from localStorage", e);
}

// Loading overlay functionality
function showLoading() {
    // Create loading overlay dynamically
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-page">
                <div class="loading-content">
                    <h1 class="loading-title">Healther</h1>
                    <div class="loading-icon">
                        <img src="../assets/healthload.ico" alt="Healther">
                    </div>
                    <p class="loading-subtitle">Loading...</p>
                    <div class="loading-bar">
                        <div class="loading-bar-fill"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #loading-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                background: linear-gradient(135deg, #ffffff 0%, #e8f5e8 25%, #d4edda 50%, #c3e6cb 75%, #28a745 100%);
                background-size: 400% 400%;
                animation: gradientShift 8s ease infinite;
            }
            .loading-page {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #ffffff 0%, #e8f5e8 25%, #d4edda 50%, #c3e6cb 75%, #28a745 100%);
                background-size: 400% 400%;
                animation: gradientShift 8s ease infinite;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.6s ease-out;
            }
            .loading-page.fade-out {
                opacity: 0;
            }
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .loading-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                animation: loadFadeIn 0.8s ease-out;
            }
            @keyframes loadFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.92);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            .loading-title {
                font-size: 2rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                color: #28a745;
                margin: 0;
                animation: titleGlow 2s ease-in-out infinite;
                text-shadow: 0 0 20px rgba(40, 167, 69, 0.5);
            }
            @keyframes titleGlow {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.85; }
            }
            .loading-icon {
                width: 88px;
                height: 88px;
                margin-top: 0.25rem;
                opacity: 0;
                animation: iconAppear 1s ease-out 0.3s forwards, iconHover 2s ease-in-out 1.4s infinite;
                filter: drop-shadow(0 0 10px rgba(40, 167, 69, 0.3));
            }
            .loading-icon img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
            }
            @keyframes iconAppear {
                from {
                    opacity: 0;
                    transform: scale(0.6) translateY(8px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            @keyframes iconHover {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-6px) scale(1.05); }
            }
            .loading-subtitle {
                font-size: 0.95rem;
                color: #155724;
                opacity: 0.9;
                margin: 0;
                text-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
            }
            .loading-bar {
                width: 160px;
                height: 4px;
                background: rgba(40, 167, 69, 0.2);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 0.5rem;
                box-shadow: 0 0 10px rgba(40, 167, 69, 0.2);
            }
            .loading-bar-fill {
                height: 100%;
                width: 40%;
                background: linear-gradient(90deg, #28a745, #20c997, #28a745);
                border-radius: 2px;
                animation: barMove 1.2s ease-in-out infinite;
                box-shadow: 0 0 15px rgba(40, 167, 69, 0.5);
            }
            @keyframes barMove {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
            }
            [data-theme="dark"] #loading-overlay {
                background: linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #0d1a0d 50%, #0f1414 75%, #0f172a 100%);
                background-size: 400% 400%;
                animation: gradientShift 8s ease infinite;
            }
            [data-theme="dark"] .loading-page {
                background: linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #0d1a0d 50%, #0f1414 75%, #0f172a 100%);
                background-size: 400% 400%;
                animation: gradientShift 8s ease infinite;
            }
            [data-theme="dark"] .loading-title {
                color: #22c55e;
                text-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
            }
            [data-theme="dark"] .loading-subtitle {
                color: #e2e8f0;
                text-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
            }
            [data-theme="dark"] .loading-bar {
                background: rgba(34, 197, 94, 0.1);
            }
            [data-theme="dark"] .loading-bar-fill {
                background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        const loadingPage = overlay.querySelector('.loading-page');
        if (loadingPage) {
            loadingPage.classList.add('fade-out');
            setTimeout(() => {
                overlay.style.display = 'none';
                loadingPage.classList.remove('fade-out');
            }, 600);
        } else {
            overlay.style.display = 'none';
        }
    }
}

// Show loading during navigation
function navigateWithLoading(callback, duration = 2200) {
    showLoading();
    setTimeout(() => {
        if (callback) callback();
        hideLoading();
    }, duration);
}

// Make loading functions globally accessible
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.navigateWithLoading = navigateWithLoading;

// Theme toggle removed for citizen platform

// Badges
const badgeList = document.getElementById("badge-list");
function loadBadges(){
    if (!badgeList) return;
    const fragment = document.createDocumentFragment();
    // Don't display badges on the third tile - leave empty
    // refresh current user from API to get latest badges/upgrades
    // fetch(`${API}/users/${currentUser.id}`)
    //     .then(r => {
    //         if (!r.ok) {
    //             throw new Error(`HTTP error! status: ${r.status}`);
    //         }
    //         return r.json();
    //     })
    //     .then(u => {
    //         currentUser = Object.assign(currentUser, u);
    //         (currentUser.badges || []).forEach(b => {
    //             const li = document.createElement("li");
    //             li.textContent = b;
    //             fragment.appendChild(li);
    //         });
    //     }).catch(err => {
    //         console.warn('API not available, using local badges:', err.message);
    //         // fallback to local badges
    //         (currentUser.badges || []).forEach(b => {
    //             const li = document.createElement("li");
    //             li.textContent = b;
    //             fragment.appendChild(li);
    //         });
    //     }).finally(() => {
    //         badgeList.appendChild(fragment);
    //     });
}
loadBadges();

// Health Status card click handler - moved to DOM ready
document.addEventListener('DOMContentLoaded', function() {
    const statusCard = document.querySelector('.status-card');
    if (statusCard) {
        statusCard.addEventListener('click', function() {
            console.log('Health Status card clicked!');
            window.location.href = 'health-status.html';
        });
        console.log('Health Status card click handler added');
    } else {
        console.log('Health Status card not found');
    }
});

// Upgrade buttons removed for citizen-only view (no DOM elements present)

// Sidebar navigation behavior: show label only for clicked icon and mark active; Account opens account page
(function(){
    try{
        var homePage = document.getElementById('home-page');
        var accountPage = document.getElementById('account-page');
        var items = document.querySelectorAll('.sidebar .nav-item');
        items.forEach(function(it){
            it.addEventListener('click', function(){
                navigateWithLoading(() => {
                    // clear visual classes from all items
                    items.forEach(i => { i.classList.remove('active'); i.classList.remove('clicked'); i.classList.remove('show-label'); });
                    it.classList.add('active');
                    it.classList.add('show-label');
                    setTimeout(() => { it.classList.remove('show-label'); }, 2000);
                    it.classList.add('clicked');
                    it.addEventListener('animationend', function onAnim(){
                        it.classList.remove('clicked');
                        it.removeEventListener('animationend', onAnim);
                    });
                    var key = it.getAttribute('data-key');
                    var name = it.getAttribute('data-name');
                    if (key === 'account') {
                        if (accountPage) {
                            accountPage.removeAttribute('hidden');
                            if (homePage) homePage.style.display = 'none';
                            if (typeof window.renderAccountPage === 'function') window.renderAccountPage();
                        }
                    } else if (key === 'explore') {
                        // Show explore page within citizen platform
                        const explorePage = document.getElementById('explore-page');
                        if (explorePage) {
                            explorePage.removeAttribute('hidden');
                            if (homePage) homePage.style.display = 'none';
                            if (accountPage) accountPage.setAttribute('hidden', '');
                            // Initialize explore functionality
                            if (typeof window.initializeExplore === 'function') {
                                window.initializeExplore();
                            }
                        }
                    } else if (key === 'market') {
                        // Show market page within citizen platform
                        const marketPage = document.getElementById('market-page');
                        if (marketPage) {
                            marketPage.removeAttribute('hidden');
                            if (homePage) homePage.style.display = 'none';
                            if (accountPage) accountPage.setAttribute('hidden', '');
                            // Hide explore page when market is shown
                            const explorePage = document.getElementById('explore-page');
                            if (explorePage) {
                                explorePage.setAttribute('hidden', '');
                            }
                            // Initialize market functionality
                            if (typeof window.initializeMarket === 'function') {
                                window.initializeMarket();
                            }
                        } else {
                            // Fallback: redirect to market page if not embedded
                            window.location.href = 'market.html';
                        }
                    } else if (key === 'home') {
                        // Show dashboard/home page
                        if (accountPage) {
                            accountPage.setAttribute('hidden', '');
                        }
                        if (homePage) homePage.style.display = '';
                        // Hide other pages
                        const explorePage = document.getElementById('explore-page');
                        const marketPage = document.getElementById('market-page');
                        if (explorePage) explorePage.setAttribute('hidden', '');
                        if (marketPage) marketPage.setAttribute('hidden', '');
                    } else {
                        // Default behavior for any other navigation
                        if (accountPage) {
                            accountPage.setAttribute('hidden', '');
                            if (homePage) homePage.style.display = '';
                        }
                        // Hide explore page when other items are clicked
                        const explorePage = document.getElementById('explore-page');
                        if (explorePage) {
                            explorePage.setAttribute('hidden', '');
                        }
                        // Hide market page when other items are clicked
                        const marketPage = document.getElementById('market-page');
                        if (marketPage) {
                            marketPage.setAttribute('hidden', '');
                        }
                        // Hide AI page when other items are clicked
                        const aiPage = document.getElementById('healther-ai-page');
                        if (aiPage) {
                            aiPage.setAttribute('hidden', '');
                        }
                    }
                });
            });
        });
        // Set initial active item: respect hash or openExplore flag
        const shouldOpenExplore = (window.location.hash === '#explore') || (localStorage.getItem('openExplore') === 'true');
        if (shouldOpenExplore) {
            // activate explore nav item
            const exploreItem = Array.from(items).find(i => i.getAttribute('data-key') === 'explore');
            if (exploreItem) {
                exploreItem.classList.add('active');
                exploreItem.classList.add('show-label');
                setTimeout(() => { exploreItem.classList.remove('show-label'); }, 2000);
                // Show explore page
                const explorePage = document.getElementById('explore-page');
                if (explorePage) {
                    explorePage.removeAttribute('hidden');
                    if (homePage) homePage.style.display = 'none';
                    if (accountPage) accountPage.setAttribute('hidden', '');
                    if (typeof window.initializeExplore === 'function') window.initializeExplore();
                }
            }
            // clear flag after use
            localStorage.removeItem('openExplore');
        } else {
            if(items.length) items[0].classList.add('active');
        }
    }catch(e){console.error('Sidebar init error', e);}
})();

// Explore page navigation
document.getElementById('explore-back-btn')?.addEventListener('click', () => {
    const explorePage = document.getElementById('explore-page');
    const homePage = document.getElementById('home-page');
    
    if (explorePage) explorePage.setAttribute('hidden', '');
    if (homePage) homePage.style.display = '';
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar .nav-item').forEach(function(i){
        i.classList.remove('active');
        if (i.getAttribute('data-key') === 'home') i.classList.add('active');
    });
});

// ========================================
// MARKET FUNCTIONALITY
// ========================================

// Initialize market functionality
window.navigateWithLoading = function(callback) {
    console.log('Navigating...');
    if (callback) callback();
};

// Open Healther AI function
function openHealtherAI(){
    window.location.href="healther-ai.html";
}

// Simple direct navigation handler buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryCard = this.closest('.category-card');
            const categoryTitle = categoryCard.querySelector('h4').textContent;
            console.log('Market category clicked:', categoryTitle);
            
            // Handle category navigation
            handleMarketCategory(categoryTitle);
        });
    });
    
    // Setup featured buttons
    const featuredBtns = document.querySelectorAll('.featured-btn');
    featuredBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const featuredItem = this.closest('.featured-item');
            const featuredTitle = featuredItem.querySelector('h4').textContent;
            console.log('Featured deal clicked:', featuredTitle);
            
            // Handle featured deal
            handleFeaturedDeal(featuredTitle);
        });
    });
    
    // Setup market back button
    const marketBackBtn = document.getElementById('market-back-btn');
    if (marketBackBtn) {
        marketBackBtn.addEventListener('click', function() {
            console.log('Market back button clicked');
            
            // Hide market page
            const marketPage = document.getElementById('market-page');
            if (marketPage) {
                marketPage.setAttribute('hidden', '');
            }
            
            // Show home page
            const homePage = document.getElementById('dashboard');
            if (homePage) {
                homePage.style.display = '';
            }
            
            // Update sidebar active state
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            const homeItem = document.querySelector('.nav-item[data-key="home"]');
            if (homeItem) {
                homeItem.classList.add('active');
            }
        });
    }
};

// Handle market category navigation
function handleMarketCategory(category) {
    console.log('Navigating to market category:', category);
    
    // Map categories to their respective pages
    const categoryMap = {
        'Pharmacy': 'pharmacy-page',
        'Healthcare Services': 'healthcare-page', 
        'Wellness': 'wellness-page',
        'Lab Tests': 'labtests-page'
    };
    
    const targetPage = categoryMap[category];
    
    if (targetPage) {
        // Hide market page
        document.getElementById('market-page').setAttribute('hidden', '');
        
        // Show target page
        const pageElement = document.getElementById(targetPage);
        if (pageElement) {
            pageElement.removeAttribute('hidden');
            console.log(`Showing ${targetPage}`);
        } else {
            console.warn(`Page ${targetPage} not found`);
        }
    }
}

// Handle featured deals
function handleFeaturedDeal(deal) {
    console.log('Processing featured deal:', deal);
    
    // Show deal details or proceed with booking
    if (deal.includes('Health Checkup')) {
        alert('Booking Annual Health Checkup...\nThis will redirect to the booking system.');
    } else if (deal.includes('Telemedicine')) {
        alert('Starting Telemedicine Consultation...\nThis will connect you with a healthcare provider.');
    }
}

// Initialize explore functionality
window.initializeExplore = function() {
    // This will be called when explore page is shown
    console.log('Explore page initialized');
    
    // Setup category navigation for fixed tile
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryTitle = document.getElementById('current-category-title');
    const categoryDesc = document.getElementById('current-category-desc');
    const newsGrid = document.getElementById('news-grid-container');
    
    // Category information
    const categoryInfo = {
        policy: {
            title: 'Health Policy',
            description: 'Government regulations and health guidelines'
        },
        research: {
            title: 'Medical Research',
            description: 'Latest scientific discoveries and breakthroughs'
        },
        mental: {
            title: 'Mental Health',
            description: 'Wellness, psychology, and mental wellness'
        },
        nutrition: {
            title: 'Nutrition',
            description: 'Dietary guidelines, nutrition science, and healthy eating'
        },
        technology: {
            title: 'Health Technology',
            description: 'Digital health, AI, and medical innovations'
        },
        fitness: {
            title: 'Fitness',
            description: 'Exercise, sports medicine, and physical wellness'
        }
    };
    
    // Category switching functionality
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            
            // Remove active class from all items
            categoryItems.forEach(cat => cat.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Update content header
            const info = categoryInfo[category];
            if (info) {
                categoryTitle.textContent = info.title;
                categoryDesc.textContent = info.description;
            }
            
            // Load news for the selected category
            loadCategoryNews(category);
            
            console.log(`Switched to category: ${category}`);
        });
    });
    
    // Function to load news for a specific category
    function loadCategoryNews(category) {
        if (!newsGrid) return;
        
        // Show loading spinner
        newsGrid.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading ${category} news...</p>
            </div>
        `;
        
        // Simulate loading delay and then show news
        setTimeout(() => {
            const newsItems = healthNewsData[category] || [];
            
            if (newsItems.length === 0) {
                newsGrid.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📰</div>
                        <p>No news available in this category</p>
                    </div>
                `;
                return;
            }
            
            newsGrid.innerHTML = newsItems.map(news => `
                <div class="news-item" data-id="${news.id}">
                    <div class="news-image">
                        <img src="${news.image}" alt="${news.title}" loading="lazy">
                        ${news.trending ? '<span class="trending-badge">🔥 Trending</span>' : ''}
                    </div>
                    <div class="news-content">
                        <h4 class="news-title">${news.title}</h4>
                        <p class="news-excerpt">${news.excerpt}</p>
                        <div class="news-footer">
                            <div class="news-date">📅 ${news.date}</div>
                            <div class="news-stats">
                                <span class="news-likes">❤️ ${news.likes}</span>
                                <span class="news-shares">🔄 ${news.shares}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }, 800);
    }
    
    // Load initial category (policy)
    loadCategoryNews('policy');
    
    // Setup explore event listeners
    const exploreSearchInput = document.getElementById('explore-search-input');
    const exploreClearSearch = document.getElementById('explore-clear-search');
    const exploreFilterBtn = document.getElementById('explore-filter-btn');
    const exploreCloseFilter = document.getElementById('explore-close-filter');
    const exploreFilterPanel = document.getElementById('explore-filter-panel');
    const exploreApplyFilters = document.getElementById('explore-apply-filters');
    const exploreResetFilters = document.getElementById('explore-reset-filters');
    const exploreRefreshBtn = document.getElementById('explore-refresh-btn');
    const exploreLoadMoreBtn = document.getElementById('explore-load-more-btn');
    const exploreSortSelect = document.getElementById('explore-sort-select');
    
    // Search functionality
    if (exploreSearchInput) {
        exploreSearchInput.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                exploreClearSearch?.removeAttribute('hidden');
            } else {
                exploreClearSearch?.setAttribute('hidden', '');
            }
            // Trigger search
            if (typeof window.searchExploreNews === 'function') {
                window.searchExploreNews(e.target.value);
            }
        });
    }
    
    if (exploreClearSearch) {
        exploreClearSearch.addEventListener('click', () => {
            exploreSearchInput.value = '';
            exploreClearSearch.setAttribute('hidden', '');
            if (typeof window.searchExploreNews === 'function') {
                window.searchExploreNews('');
            }
        });
    }
    
    // Filter panel
    if (exploreFilterBtn) {
        exploreFilterBtn.addEventListener('click', () => {
            exploreFilterPanel?.removeAttribute('hidden');
        });
    }
    
    if (exploreCloseFilter) {
        exploreCloseFilter.addEventListener('click', () => {
            exploreFilterPanel?.setAttribute('hidden', '');
        });
    }
    
    if (exploreApplyFilters) {
        exploreApplyFilters.addEventListener('click', () => {
            if (typeof window.applyExploreFilters === 'function') {
                window.applyExploreFilters();
            }
            exploreFilterPanel?.setAttribute('hidden', '');
        });
    }
    
    if (exploreResetFilters) {
        exploreResetFilters.addEventListener('click', () => {
            // Reset all checkboxes
            document.querySelectorAll('#explore-filter-panel input[type="checkbox"]').forEach(cb => {
                cb.checked = cb.defaultValue === 'true';
            });
            if (typeof window.applyExploreFilters === 'function') {
                window.applyExploreFilters();
            }
            exploreFilterPanel?.setAttribute('hidden', '');
        });
    }
    
    // Refresh
    if (exploreRefreshBtn) {
        exploreRefreshBtn.addEventListener('click', () => {
            if (typeof window.refreshExploreNews === 'function') {
                window.refreshExploreNews();
            }
        });
    }
    
    // Load more
    if (exploreLoadMoreBtn) {
        exploreLoadMoreBtn.addEventListener('click', () => {
            if (typeof window.loadMoreExploreNews === 'function') {
                window.loadMoreExploreNews();
            }
        });
    }
    
    // Sort
    if (exploreSortSelect) {
        exploreSortSelect.addEventListener('change', (e) => {
            if (typeof window.sortExploreNews === 'function') {
                window.sortExploreNews(e.target.value);
            }
        });
    }
    
    // Modal close
    const exploreModalClose = document.getElementById('explore-modal-close');
    const exploreModalOverlay = document.querySelector('#explore-news-modal .modal-overlay');
    
    if (exploreModalClose) {
        exploreModalClose.addEventListener('click', () => {
            document.getElementById('explore-news-modal')?.setAttribute('hidden', '');
        });
    }
    
    if (exploreModalOverlay) {
        exploreModalOverlay.addEventListener('click', () => {
            document.getElementById('explore-news-modal')?.setAttribute('hidden', '');
        });
    }
    
    // Load initial news
    if (typeof window.loadExploreNews === 'function') {
        window.loadExploreNews();
    }
};

// Top-right options tile
(function(){
    try{
        const moreBtn = document.getElementById('more-options');
        const optTile = document.getElementById('options-tile');
        if(!moreBtn || !optTile) return;

        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
            moreBtn.setAttribute('aria-expanded', String(!expanded));
            if (expanded) optTile.setAttribute('hidden','');
            else optTile.removeAttribute('hidden');
        });

        // close when clicking outside (also respect settings tile)
        const settingsTile = document.getElementById('settings-tile');
        const themeTile = document.getElementById('theme-tile');
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#options-tile') && !e.target.closest('#more-options') && !e.target.closest('#settings-tile') && !e.target.closest('#theme-tile')) {
                optTile.setAttribute('hidden','');
                if (settingsTile) settingsTile.setAttribute('hidden','');
                if (themeTile) themeTile.setAttribute('hidden','');
                moreBtn.setAttribute('aria-expanded','false');
            }
        });

        // close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape'){
                optTile.setAttribute('hidden','');
                if (settingsTile) settingsTile.setAttribute('hidden','');
                if (themeTile) themeTile.setAttribute('hidden','');
                moreBtn.setAttribute('aria-expanded','false');
            }
        });

        // theme selection is handled inside the settings tile (see below)

        // handle option clicks
        optTile.addEventListener('click', (e) => {
            const btn = e.target.closest('.opt-btn');
            if(!btn) return;
            const action = btn.dataset.action;
            // hide options tile by default
            optTile.setAttribute('hidden','');
            moreBtn.setAttribute('aria-expanded','false');
            // action handlers
            if(action === 'logout'){
                // Clear all stored user data and session information
                try {
                    // Clear authentication token
                    localStorage.removeItem('token');
                    // Clear user profile data
                    localStorage.removeItem('user');
                    // Clear citizen registration data
                    localStorage.removeItem('citizenData');
                    // Clear authentication step tracking
                    sessionStorage.removeItem('authStep');
                    sessionStorage.removeItem('citizenPassword');
                    // Clear theme preference (optional - user might want to keep this)
                    // localStorage.removeItem('theme');
                    
                    console.log('✅ Session cleared successfully');
                } catch(e) {
                    console.warn('Could not clear some session data:', e);
                }
                
                // Show logout confirmation
                alert('You have been logged out successfully. Redirecting to login...');
                
                // Redirect to login page
                window.location.href = '../auth/auth.html';
            } else if(action === 'profile'){
                // Open the in-app Account page (same behavior as sidebar 'My account')
                try {
                    const accountPage = document.getElementById('account-page');
                    const dashboard = document.getElementById('dashboard');
                    if (accountPage) {
                        accountPage.removeAttribute('hidden');
                        if (dashboard) dashboard.style.display = 'none';
                        if (typeof window.renderAccountPage === 'function') window.renderAccountPage();
                        // update sidebar active state
                        document.querySelectorAll('.sidebar .nav-item').forEach(function(i){
                            i.classList.remove('active');
                            if (i.getAttribute('data-key') === 'account') i.classList.add('active');
                        });
                    }
                } catch (e) { console.error('Open account error', e); }
            } else if(action === 'settings'){
                if (settingsTile) {
                    settingsTile.removeAttribute('hidden');
                }
            } else if(action === 'help'){
                // Help disabled to prevent unwanted redirects
                alert('Help feature coming soon!');
                // window.location.href = '/help';
            }
        });

        // settings tile interaction
        if (settingsTile) {
            // ensure theme choices are closed when settings opens
            const closeThemeChoices = () => {
                settingsTile.querySelectorAll('.theme-setting').forEach(el => el.classList.remove('open'));
            };

            settingsTile.addEventListener('click', (e) => {
                // theme option buttons
                // clicking the Theme row opens the floating theme tile
                const themeRow = e.target.closest('.theme-setting') || e.target.closest('[data-setting="theme"]');
                if (themeRow) {
                    if (themeTile) themeTile.removeAttribute('hidden');
                    return;
                }

                // theme option buttons inside the floating tile are handled below

                const sbtn = e.target.closest('.setting-btn');
                if(!sbtn) return;
                const setting = sbtn.dataset.setting;
                // hide settings after selection
                settingsTile.setAttribute('hidden','');
                closeThemeChoices();
                // handle basic actions
                if(setting === 'accounts'){
                    // Show account center as overlay within citizen platform
                    navigateWithLoading(() => {
                        showAccountCenter();
                    });
                } else if(setting === 'language'){
                    // Show language selector modal
                    showLanguageSelector();
                } else if(setting === 'tutorials'){
                    // Tutorials disabled to prevent unwanted redirects
                    alert('Tutorials coming soon!');
                    // window.location.href = '/tutorials';
                } else if(setting === 'ai-mods'){
                    // AI modifications disabled to prevent unwanted redirects
                    alert('AI modifications coming soon!');
                    // window.location.href = '/settings/ai-modifications';
                }
            });

            // when settings is opened from options menu, ensure floating theme tile is closed
            new MutationObserver(muts => {
                if (!settingsTile.hasAttribute('hidden') && themeTile) themeTile.setAttribute('hidden','');
            }).observe(settingsTile, {attributes: true});

            // handle clicks inside the floating theme tile
            if (themeTile) {
                themeTile.addEventListener('click', (ev) => {
                    const tbtn = ev.target.closest('.theme-option');
                    if (!tbtn) return;
                    const newTheme = tbtn.dataset.theme;
                    try{ document.documentElement.setAttribute('data-theme', newTheme); }catch(e){}
                    try{ localStorage.setItem('theme', newTheme); }catch(e){}
                    themeTile.setAttribute('hidden','');
                    settingsTile.setAttribute('hidden','');
                });
            }
        }
    }catch(e){ console.error('Options tile init error', e); }
})();

// Pre-configured stick-person / default profile image (like other platforms)
function getDefaultAvatarDataUrl() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var stroke = isDark ? '#9ca3af' : '#6b7280';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="7" r="4"/>' +
        '<path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>' +
        '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Account page: render user info and profile picture
function renderAccountPage() {
    const fullnameEl = document.getElementById('account-fullname');
    const usernameEl = document.getElementById('account-username');
    const fullnameDetailEl = document.getElementById('account-fullname-detail');
    const usernameDetailEl = document.getElementById('account-username-detail');
    const emailEl = document.getElementById('account-email');
    const healtherIdEl = document.getElementById('account-healtherid');
    const dobEl = document.getElementById('account-dob');
    const nationalityEl = document.getElementById('account-nationality');
    const mobileEl = document.getElementById('account-mobile');
    const idNumberEl = document.getElementById('account-idnumber');
    const birthCertEl = document.getElementById('account-birthcert');
    const badgesList = document.getElementById('account-badges-list');
    const avatarImg = document.getElementById('account-avatar');
    const avatarWrap = avatarImg && avatarImg.closest('.account-avatar-wrap');

    // Update header display
    if (fullnameEl) fullnameEl.textContent = currentUser.fullName || currentUser.username || '—';
    if (usernameEl) usernameEl.textContent = currentUser.username || '—';
    
    // Update detail rows
    if (fullnameDetailEl) fullnameDetailEl.textContent = currentUser.fullName || currentUser.username || '—';
    if (usernameDetailEl) usernameDetailEl.textContent = currentUser.username || '—';
    if (emailEl) emailEl.textContent = currentUser.email || '—';
    if (healtherIdEl) healtherIdEl.textContent = currentUser.healtherId || '—';
    if (dobEl) dobEl.textContent = currentUser.dateOfBirth || '—';
    if (nationalityEl) nationalityEl.textContent = currentUser.nationality || '—';
    if (mobileEl) mobileEl.textContent = currentUser.mobileNumber || '—';
    if (idNumberEl) idNumberEl.textContent = currentUser.idNumber || '—';
    if (birthCertEl) birthCertEl.textContent = currentUser.birthCertificateNumber || '—';
    if (badgesList) {
        badgesList.innerHTML = '';
        // Don't display badges - leave empty
        // const badges = currentUser.badges || [];
        // if (badges.length === 0) {
        //     const li = document.createElement('li');
        //     li.textContent = 'No badges yet';
        //     li.style.background = 'rgba(0,0,0,0.06)';
        //     li.style.color = 'var(--text)';
        //     badgesList.appendChild(li);
        // } else {
        //     badges.forEach(function (b) {
        //         const li = document.createElement('li');
        //         li.textContent = b;
        //         badgesList.appendChild(li);
        //     });
        // }
    }
    // Profile picture: load from localStorage, then avatar URL, else default stick-person placeholder
    var defaultAvatar = getDefaultAvatarDataUrl();
    if (avatarImg) {
        var savedPhoto = localStorage.getItem('citizenProfilePhoto');
        if (savedPhoto) {
            avatarImg.src = savedPhoto;
            avatarImg.alt = 'Profile photo';
            if (avatarWrap) avatarWrap.classList.add('has-photo');
        } else if (currentUser.avatar) {
            avatarImg.src = currentUser.avatar;
            avatarImg.alt = 'Profile photo';
            if (avatarWrap) avatarWrap.classList.add('has-photo');
        } else {
            avatarImg.src = defaultAvatar;
            avatarImg.alt = 'Default profile';
            if (avatarWrap) avatarWrap.classList.remove('has-photo');
        }
    }
}
window.renderAccountPage = renderAccountPage;

// Back to Home on account page
(function () {
    const backBtn = document.getElementById('account-back-btn');
    const accountPage = document.getElementById('account-page');
    const homePage = document.getElementById('home-page');
    if (!backBtn || !accountPage || !homePage) return;
    
    // Back functionality
    backBtn.addEventListener('click', function () {
        navigateWithLoading(() => {
            accountPage.setAttribute('hidden', '');
            homePage.style.display = '';
            document.querySelectorAll('.sidebar .nav-item').forEach(function (i) {
                i.classList.remove('active');
                if (i.getAttribute('data-key') === 'home') i.classList.add('active');
            });
        });
    });
})();

// Search Functionality - Global
window.initSearch = function() {
    try {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const clearSearch = document.getElementById('clear-search');
        const searchResults = document.getElementById('search-results');
        const closeResults = document.getElementById('close-results');
        const resultsList = document.getElementById('results-list');
        
        const badgeListEl = document.getElementById('badge-list');
        
        if (!searchInput || !searchResults || !resultsList) {
            console.warn('Search elements not found', {
                searchInput: !!searchInput,
                searchResults: !!searchResults,
                resultsList: !!resultsList
            });
            return;
        }
        
        console.log('Search elements found, initializing...');
    
        let searchTimeout;
        
        // Add sample data if empty
        function ensureDataExists() {
            // Add sample badges if empty
            if (badgeListEl && badgeListEl.children.length === 0) {
                const sampleBadges = [
                    'Health Champion',
                    'Wellness Warrior',
                    'Fitness Enthusiast'
                ];
                sampleBadges.forEach(badge => {
                    const li = document.createElement('li');
                    li.textContent = badge;
                    badgeListEl.appendChild(li);
                });
            }
        }
        
        // Collect all searchable data
        function collectSearchData() {
            const results = [];
            
            // Collect badges
            if (badgeListEl) {
                Array.from(badgeListEl.querySelectorAll('li')).forEach(li => {
                    const text = li.textContent.trim();
                    if (text) {
                        results.push({
                            type: 'badge',
                            text: text,
                            element: li
                        });
                    }
                });
            }
            
            // Add page content
            const pageContent = [
                { type: 'page', text: 'Home - Dashboard', element: document.body },
                { type: 'page', text: 'Explore Hub - Discover health content', element: document.body },
                { type: 'page', text: 'Market - Health products and services', element: document.body },
                { type: 'page', text: 'Notifications - Stay updated', element: document.body }
            ];
            
            results.push(...pageContent);
            
            return results;
        }
        
        // Perform search
        function performSearch(query) {
            console.log('performSearch called with:', query);
            if (!query || !query.trim()) {
                searchResults.setAttribute('hidden', '');
                if (clearSearch) clearSearch.setAttribute('hidden', '');
                return;
            }
            
            if (clearSearch) clearSearch.removeAttribute('hidden');
            
            const lowerQuery = query.toLowerCase().trim();
            const allData = collectData();
            
            // Filter results
            const results = allData.filter(item => 
                item.text.toLowerCase().includes(lowerQuery)
            );
            console.log('Search results:', results.length, 'matches');
            
            resultsList.innerHTML = '';
            
            if (results.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.textContent = 'No results found';
                resultsList.appendChild(noResults);
            } else {
                results.forEach((result, index) => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    resultItem.style.cursor = 'pointer';
                    
                    const typeIcon = result.type === 'post' ? '📝' : 
                                   result.type === 'badge' ? '🏆' : '📄';
                    
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'result-icon';
                    iconDiv.textContent = typeIcon;
                    
                    const textDiv = document.createElement('div');
                    textDiv.className = 'result-text';
                    // Highlight search term in results
                    let displayText = result.text.substring(0, 100);
                    if (result.text.length > 100) displayText += '...';
                    textDiv.textContent = displayText;
                    
                    resultItem.appendChild(iconDiv);
                    resultItem.appendChild(textDiv);
                    
                    resultItem.addEventListener('click', () => {
                        // Highlight the original element
                        if (result.element && result.element.style) {
                            result.element.style.backgroundColor = '#ffeb3b';
                            setTimeout(() => {
                                result.element.style.backgroundColor = '';
                            }, 2000);
                        }
                        // Close results
                        searchResults.setAttribute('hidden', '');
                    });
                    
                    resultsList.appendChild(resultItem);
                });
            }
            
            searchResults.removeAttribute('hidden');
        }
        
        // Initialize data first
        ensureDataExists();
        
        // Event listeners
        searchInput.addEventListener('input', (e) => {
            console.log('Search input changed:', e.target.value);
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 200);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter pressed, searching for:', searchInput.value);
                clearTimeout(searchTimeout);
                performSearch(searchInput.value);
            }
        });
        
        // Search button click
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Search button clicked, searching for:', searchInput.value);
                performSearch(searchInput.value);
            });
        } else {
            console.error('Search button not found!');
        }
        
        // Clear button
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                clearSearch.setAttribute('hidden', '');
                searchResults.setAttribute('hidden', '');
                searchInput.focus();
            });
        }
        
        // Close results button
        if (closeResults) {
            closeResults.addEventListener('click', () => {
                searchResults.setAttribute('hidden', '');
            });
        }
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-search')) {
                searchResults.setAttribute('hidden', '');
            }
        });
        
        // Show/hide clear button based on input
        searchInput.addEventListener('input', () => {
            if (clearSearch) {
                if (searchInput.value.trim()) {
                    clearSearch.removeAttribute('hidden');
                } else {
                    clearSearch.setAttribute('hidden', '');
                }
            }
        });
        
        console.log('Search functionality initialized');
        
    } catch (e) {
        console.error('Search init error', e);
    }
};

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initSearch);
} else {
    window.initSearch();
}

// AI Page Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // AI back button
    const aiBackBtn = document.getElementById('ai-back-btn');
    if (aiBackBtn) {
        aiBackBtn.addEventListener('click', function() {
            console.log('AI back button clicked');
            
            // Hide AI page
            const aiPage = document.getElementById('healther-ai-page');
            if (aiPage) {
                aiPage.setAttribute('hidden', '');
            }
            
            // Show home page
            const homePage = document.getElementById('dashboard');
            if (homePage) {
                homePage.style.display = '';
            }
            
            // Update sidebar active state
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            const homeItem = document.querySelector('.nav-item[data-key="home"]');
            if (homeItem) {
                homeItem.classList.add('active');
            }
        });
    }
});

// Account Center functionality
(function() {
    function showAccountCenter() {
        // Create overlay if it doesn't exist
        let overlay = document.getElementById('account-center-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'account-center-overlay';
            overlay.className = 'account-overlay';
            overlay.innerHTML = `
                <div class="account-modal">
                    <div class="account-modal-header">
                        <h2>Account Center</h2>
                        <button class="close-modal" onclick="closeAccountCenter()">×</button>
                    </div>
                    <div class="account-modal-content">
                        <div class="account-profile-section">
                            <div class="account-avatar-wrap">
                                <img id="modal-account-avatar" class="account-avatar" src="${getDefaultAvatarDataUrl()}" alt="Profile" />
                                <label class="account-avatar-upload" for="modal-account-avatar-input">
                                    <span>Change photo</span>
                                    <input type="file" id="modal-account-avatar-input" accept="image/*" hidden>
                                </label>
                                <button type="button" class="account-avatar-remove" id="modal-account-avatar-remove">Remove photo</button>
                            </div>
                            <div class="account-name-wrap">
                                <p class="account-value account-fullname" id="modal-account-fullname">${currentUser.fullName || '—'}</p>
                                <p class="account-subvalue account-username-inline" id="modal-account-username">@${currentUser.username || '—'}</p>
                            </div>
                        </div>
                        <div class="account-details">
                            <div class="account-row">
                                <span class="account-label">Full name</span>
                                <span class="account-value"><input id="modal-fullName" type="text" value="${currentUser.fullName || ''}" style="width:100%;"/></span>
                            </div>
                            <div class="account-row">
                                <span class="account-label">Username</span>
                                <span class="account-value"><input id="modal-username" type="text" value="${currentUser.username || ''}" style="width:100%;"/></span>
                            </div>
                        </div>
                        <div class="account-badges-section">
                            <h3 class="account-subheading">Badges</h3>
                            <ul class="account-badges-list" id="modal-account-badges-list"></ul>
                        </div>
                        <div class="account-actions">
                            <button type="button" class="btn" onclick="saveAccountChanges()">Save Changes</button>
                            <button type="button" class="account-back-btn" onclick="closeAccountCenter()">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        loadAccountBadges();
        loadAccountProfilePhoto();
    }
    
    function loadAccountProfilePhoto() {
        const avatarImg = document.getElementById('modal-account-avatar');
        if (!avatarImg) return;
        
        const savedPhoto = localStorage.getItem('citizenProfilePhoto');
        if (savedPhoto) {
            avatarImg.src = savedPhoto;
            const avatarWrap = avatarImg.closest('.account-avatar-wrap');
            if (avatarWrap) avatarWrap.classList.add('has-photo');
        } else {
            avatarImg.src = getDefaultAvatarDataUrl();
            const avatarWrap = avatarImg.closest('.account-avatar-wrap');
            if (avatarWrap) avatarWrap.classList.remove('has-photo');
        }
        
        // Add upload functionality
        const input = document.getElementById('modal-account-avatar-input');
        if (input) {
            input.addEventListener('change', function () {
                const file = input.files && input.files[0];
                if (!file || !file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = function () {
                    const dataUrl = reader.result;
                    avatarImg.src = dataUrl;
                    const avatarWrap = avatarImg.closest('.account-avatar-wrap');
                    if (avatarWrap) avatarWrap.classList.add('has-photo');
                    try { localStorage.setItem('citizenProfilePhoto', dataUrl); } catch (e) { console.warn('Profile photo too large to store'); }
                };
                reader.readAsDataURL(file);
                input.value = '';
            });
        }
        
        // Add remove functionality
        const removeBtn = document.getElementById('modal-account-avatar-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', function () {
                try { localStorage.removeItem('citizenProfilePhoto'); } catch (e) {}
                avatarImg.src = getDefaultAvatarDataUrl();
                avatarImg.alt = 'Default profile';
                const avatarWrap = avatarImg.closest('.account-avatar-wrap');
                if (avatarWrap) avatarWrap.classList.remove('has-photo');
            });
        }
    }
    
    function closeAccountCenter() {
        const overlay = document.getElementById('account-center-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    function saveAccountChanges() {
        const fullName = document.getElementById('modal-fullName').value;
        const username = document.getElementById('modal-username').value;
        // Email is constant from registration, don't update
        
        // Update currentUser object
        currentUser.fullName = fullName;
        currentUser.username = username;
        // Email remains unchanged
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        // Update account center overlay display
        const displayName = document.getElementById('modal-account-fullname');
        const displayUsername = document.getElementById('modal-account-username');
        if (displayName) displayName.textContent = fullName || '—';
        if (displayUsername) displayUsername.textContent = '@' + (username || '—');
        
        // Update My Account page display if it exists
        const accountFullname = document.getElementById('account-fullname');
        const accountUsername = document.getElementById('account-username');
        if (accountFullname) accountFullname.textContent = fullName || '—';
        if (accountUsername) accountUsername.textContent = username || '—';
        
        // Update any other displays that might show user info
        updateUserDisplays();
        
        alert('Account changes saved successfully!');
        closeAccountCenter();
    }
    
    function updateUserDisplays() {
        // Update any other places where user info is displayed
        // This can be expanded to update sidebar, header, etc.
        const sidebarAccount = document.querySelector('.nav-item[data-key="account"] .label');
        if (sidebarAccount) {
            sidebarAccount.textContent = `My account`;
        }
    }
    
    function loadAccountBadges() {
        const badgesList = document.getElementById('modal-account-badges-list');
        if (!badgesList) return;
        
        badgesList.innerHTML = '';
        const li = document.createElement('li');
        li.className = 'badge-item';
        li.textContent = 'No badges yet';
        badgesList.appendChild(li);
    }
    
    // Make account functions globally accessible
    window.showAccountCenter = showAccountCenter;
    window.closeAccountCenter = closeAccountCenter;
    window.saveAccountChanges = saveAccountChanges;
    window.updateUserDisplays = updateUserDisplays;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }
})();

// ========================================
// NOTIFICATION SYSTEM WITH CATEGORIES
// ========================================

// Notification data organized by categories
const notificationsData = {
    emergency: [
        {
            id: 1,
            title: 'Medical Emergency Alert',
            message: 'Emergency services have been dispatched to downtown area. Please avoid the location.',
            time: '2 minutes ago',
            unread: true
        },
        {
            id: 2,
            title: 'Critical System Alert',
            message: 'Your account security has been compromised. Please change your password immediately.',
            time: '15 minutes ago',
            unread: true
        }
    ],
    spam: [
        {
            id: 3,
            title: 'Suspicious Login Attempt',
            message: 'Someone tried to access your account from an unrecognized device.',
            time: '1 hour ago',
            unread: true
        },
        {
            id: 4,
            title: 'Phishing Email Blocked',
            message: 'We blocked a phishing email pretending to be from Healther support.',
            time: '2 hours ago',
            unread: false
        }
    ],
    updates: [
        {
            id: 5,
            title: 'Platform Update Available',
            message: 'New features have been added to your health dashboard. Check them out!',
            time: '3 hours ago',
            unread: false
        },
        {
            id: 6,
            title: 'Security Patch Applied',
            message: 'Latest security updates have been successfully installed on your account.',
            time: '5 hours ago',
            unread: false
        }
    ],
    explore: [
        {
            id: 7,
            title: 'New Health Article Published',
            message: 'Read our latest article on nutrition tips for better health.',
            time: '6 hours ago',
            unread: false
        },
        {
            id: 8,
            title: 'Community Challenge Started',
            message: 'Join the weekly fitness challenge and compete with other users.',
            time: '1 day ago',
            unread: false
        }
    ],
    wellness: [
        {
            id: 9,
            title: 'Daily Meditation Reminder',
            message: 'Time for your daily mindfulness session. Take 10 minutes for mental wellness.',
            time: '2 hours ago',
            unread: true
        },
        {
            id: 10,
            title: 'Hydration Goal Achieved',
            message: 'Congratulations! You\'ve reached your daily water intake goal.',
            time: '4 hours ago',
            unread: false
        }
    ],
    medical: [
        {
            id: 11,
            title: 'Appointment Reminder',
            message: 'Doctor appointment scheduled for tomorrow at 10:00 AM.',
            time: '1 day ago',
            unread: true
        },
        {
            id: 12,
            title: 'Lab Results Available',
            message: 'Your recent blood test results are now available in your medical records.',
            time: '2 days ago',
            unread: false
        }
    ]
};

// Notification system functions
function showNotificationsTile() {
    const notificationsTile = document.getElementById('notifications-tile');
    if (notificationsTile) {
        notificationsTile.removeAttribute('hidden');
        renderNotifications();
    }
}

function hideNotificationsTile() {
    const notificationsTile = document.getElementById('notifications-tile');
    if (notificationsTile) {
        notificationsTile.setAttribute('hidden', '');
    }
}

function renderNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = '';
    
    // Render each category
    Object.keys(notificationsData).forEach(category => {
        const categoryNotifications = notificationsData[category];
        if (categoryNotifications.length === 0) return;
        
        // Create category section
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'notification-category';
        
        // Category header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'category-header';
        headerDiv.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        // Category title with count
        const titleDiv = document.createElement('div');
        titleDiv.className = 'category-title';
        titleDiv.innerHTML = `
            <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <span class="category-count">${categoryNotifications.filter(n => n.unread).length}</span>
        `;
        
        categoryDiv.appendChild(headerDiv);
        categoryDiv.appendChild(titleDiv);
        
        // Render notifications in this category
        categoryNotifications.forEach(notification => {
            const notificationDiv = document.createElement('div');
            notificationDiv.className = `notification-item ${notification.unread ? 'unread' : ''} ${category}`;
            notificationDiv.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <div class="notification-actions">
                    <button class="notification-btn mark-read" onclick="markAsRead(${notification.id}, '${category}')">Mark as read</button>
                    <button class="notification-btn report" onclick="reportNotification(${notification.id}, '${category}')">Report</button>
                    <button class="notification-btn view" onclick="viewNotification(${notification.id}, '${category}')">View</button>
                </div>
            `;
            categoryDiv.appendChild(notificationDiv);
        });
        
        notificationsList.appendChild(categoryDiv);
    });
    
    updateUnreadBadge();
}

function updateUnreadBadge() {
    let totalUnread = 0;
    Object.values(notificationsData).forEach(categoryNotifications => {
        totalUnread += categoryNotifications.filter(n => n.unread).length;
    });
    
    const notificationsNavItem = document.querySelector('.nav-item[data-key="notifications"]');
    if (notificationsNavItem) {
        notificationsNavItem.setAttribute('data-unread-count', totalUnread);
    }
}

function markAsRead(notificationId, category) {
    const notification = notificationsData[category].find(n => n.id === notificationId);
    if (notification) {
        notification.unread = false;
        renderNotifications();
    }
}

function reportNotification(notificationId, category) {
    const notification = notificationsData[category].find(n => n.id === notificationId);
    if (notification) {
        // Remove the notification
        const index = notificationsData[category].findIndex(n => n.id === notificationId);
        if (index > -1) {
            notificationsData[category].splice(index, 1);
        }
        renderNotifications();
        alert('Notification has been reported and removed.');
    }
}

function viewNotification(notificationId, category) {
    const notification = notificationsData[category].find(n => n.id === notificationId);
    if (notification) {
        // Mark as read when viewed
        if (notification.unread) {
            markAsRead(notificationId, category);
        }
        
        // Handle viewing based on category
        switch (category) {
            case 'medical':
                alert(`Medical Notification:\n\n${notification.message}\n\nThis notification is related to your medical care.`);
                break;
            case 'wellness':
                alert(`Wellness Tip:\n\n${notification.message}\n\nTake care of your mental and physical health.`);
                break;
            case 'explore':
                alert(`Explore Hub:\n\n${notification.message}\n\nDiscover more health content.`);
                break;
            case 'updates':
                alert(`Platform Update:\n\n${notification.message}\n\nStay informed about new features.`);
                break;
            default:
                alert(`Notification:\n\n${notification.message}`);
        }
    }
}

function markAllAsRead() {
    Object.values(notificationsData).forEach(categoryNotifications => {
        categoryNotifications.forEach(notification => {
            notification.unread = false;
        });
    });
    renderNotifications();
}

// Initialize notifications
document.addEventListener('DOMContentLoaded', () => {
    // Notification tile toggle
    const notificationsNavItem = document.querySelector('.nav-item[data-key="notifications"]');
    const closeNotificationsBtn = document.getElementById('close-notifications');
    const markAllReadBtn = document.getElementById('mark-all-read');
    
    if (notificationsNavItem) {
        notificationsNavItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Show notifications tile above current content
            showNotificationsTile();
        });
    }
    
    if (closeNotificationsBtn) {
        closeNotificationsBtn.addEventListener('click', () => {
            hideNotificationsTile();
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllAsRead();
        });
    }
    
    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item[data-key="notifications"]') && 
            !e.target.closest('#notifications-tile')) {
            
            const notificationsTile = document.getElementById('notifications-tile');
            if (notificationsTile && !notificationsTile.hidden) {
                hideNotificationsTile();
            }
        }
    });
    
    // Initialize
    renderNotifications();
});

// ========================================
// EXPLORE HUB FUNCTIONALITY
// ========================================

// Sample health news data organized by categories
const healthNewsData = {
    policy: [
        {
            id: 1,
            title: "WHO Announces New Global Health Guidelines",
            excerpt: "World Health Organization releases comprehensive guidelines for post-pandemic healthcare systems...",
            image: "https://images.unsplash.com/photo-1584116769339-7c38b40b9b17?w=400&h=200&fit=crop",
            date: "2024-03-15",
            author: "WHO Health Team",
            likes: 245,
            shares: 89,
            trending: true
        },
        {
            id: 2,
            title: "FDA Approves New Mental Health Treatment Protocol",
            excerpt: "Federal Drug Administration establishes new guidelines for digital mental health therapies...",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=400&h=200&fit=crop",
            date: "2024-03-14",
            author: "Health Policy Institute",
            likes: 189,
            shares: 67,
            trending: false
        }
    ],
    research: [
        {
            id: 3,
            title: "Breakthrough in COVID-19 Treatment Research",
            excerpt: "Scientists discover promising new antiviral compound that shows 95% effectiveness in clinical trials...",
            image: "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=400&h=200&fit=crop",
            date: "2024-03-14",
            author: "Medical Research Institute",
            likes: 298,
            shares: 156,
            trending: true
        },
        {
            id: 4,
            title: "New Cancer Detection Method Shows 99% Accuracy",
            excerpt: "Revolutionary blood test can detect early-stage cancers with unprecedented precision...",
            image: "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=400&h=200&fit=crop",
            date: "2024-03-13",
            author: "Cancer Research Center",
            likes: 312,
            shares: 178,
            trending: true
        }
    ],
    mental: [
        {
            id: 5,
            title: "Mental Health Apps Show 40% Increase in User Engagement",
            excerpt: "New study reveals that digital mental health platforms are significantly improving patient outcomes...",
            image: "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=400&h=200&fit=crop",
            date: "2024-03-13",
            author: "Digital Health Journal",
            likes: 156,
            shares: 45,
            trending: false
        },
        {
            id: 6,
            title: "Mindfulness Therapy Reduces Stress by 60%",
            excerpt: "Clinical trials demonstrate effectiveness of mindfulness-based stress reduction techniques...",
            image: "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=400&h=200&fit=crop",
            date: "2024-03-12",
            author: "Psychology Today",
            likes: 134,
            shares: 78,
            trending: false
        }
    ],
    nutrition: [
        {
            id: 7,
            title: "Nutrition Guidelines Updated for 2024",
            excerpt: "Federal health officials release new dietary recommendations emphasizing plant-based proteins...",
            image: "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=400&h=200&fit=crop",
            date: "2024-03-12",
            author: "Health & Nutrition Board",
            likes: 189,
            shares: 89,
            trending: false
        },
        {
            id: 8,
            title: "Mediterranean Diet Linked to Longer Lifespan",
            excerpt: "New study confirms cardiovascular benefits of Mediterranean eating patterns...",
            image: "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=400&h=200&fit=crop",
            date: "2024-03-11",
            author: "Nutrition Science Institute",
            likes: 167,
            shares: 92,
            trending: false
        }
    ],
    technology: [
        {
            id: 9,
            title: "AI-Powered Diagnostic Tools Revolutionize Early Detection",
            excerpt: "Machine learning algorithms now capable of detecting diseases from routine blood tests with 99% accuracy...",
            image: "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=400&h=200&fit=crop",
            date: "2024-03-11",
            author: "Tech Health News",
            likes: 298,
            shares: 156,
            trending: true
        },
        {
            id: 10,
            title: "Wearable Health Monitors Gain FDA Approval",
            excerpt: "New generation of smart watches and fitness trackers receive medical device certification...",
            image: "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=400&h=200&fit=crop",
            date: "2024-03-10",
            author: "Digital Health Weekly",
            likes: 234,
            shares: 123,
            trending: false
        }
    ],
    fitness: [
        {
            id: 11,
            title: "High-Intensity Interval Training Proven Most Effective",
            excerpt: "Research shows HIIT workouts provide superior cardiovascular benefits in less time...",
            image: "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=400&h=200&fit=crop",
            date: "2024-03-10",
            author: "Fitness Science Journal",
            likes: 198,
            shares: 87,
            trending: false
        },
        {
            id: 12,
            title: "Virtual Reality Fitness Classes Surge in Popularity",
            excerpt: "Immersive workout experiences transform home exercise routines...",
            image: "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=400&h=200&fit=crop",
            date: "2024-03-09",
            author: "Sports Medicine Today",
            likes: 145,
            shares: 67,
            trending: false
        }
    ]
};

let currentNewsData = [...healthNewsData];
let filteredNewsData = [...healthNewsData];
let currentPage = 1;
const newsPerPage = 6;

// Render explore news by categories
function renderExploreNews() {
    const categories = ['policy', 'research', 'mental', 'nutrition', 'technology', 'fitness'];
    
    categories.forEach(category => {
        const container = document.getElementById(`${category}-news`);
        if (!container) return;
        
        const newsItems = healthNewsData[category] || [];
        
        if (newsItems.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📰</div>
                    <p>No news available in this category</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = newsItems.map(news => `
            <div class="news-item" data-id="${news.id}">
                <div class="news-image">
                    <img src="${news.image}" alt="${news.title}" loading="lazy">
                    ${news.trending ? '<span class="trending-badge">🔥 Trending</span>' : ''}
                </div>
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-footer">
                        <span class="news-date">${new Date(news.date).toLocaleDateString()}</span>
                        <span class="news-author">By ${news.author}</span>
                        <div class="news-stats">
                            <span class="news-likes">❤️ ${news.likes}</span>
                            <span class="news-shares">🔄 ${news.shares}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Search explore news across all categories
window.searchExploreNews = function(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm === '') {
        renderExploreNews();
        return;
    }
    
    const categories = ['policy', 'research', 'mental', 'nutrition', 'technology', 'fitness'];
    
    categories.forEach(category => {
        const container = document.getElementById(`${category}-news`);
        if (!container) return;
        
        const filteredNews = (healthNewsData[category] || []).filter(news => 
            news.title.toLowerCase().includes(searchTerm) ||
            news.excerpt.toLowerCase().includes(searchTerm)
        );
        
        if (filteredNews.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>No news found matching "${query}"</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredNews.map(news => `
            <div class="news-item" data-id="${news.id}">
                <div class="news-image">
                    <img src="${news.image}" alt="${news.title}" loading="lazy">
                    ${news.trending ? '<span class="trending-badge">🔥 Trending</span>' : ''}
                </div>
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-footer">
                        <span class="news-date">${new Date(news.date).toLocaleDateString()}</span>
                        <span class="news-author">By ${news.author}</span>
                        <div class="news-stats">
                            <span class="news-likes">❤️ ${news.likes}</span>
                            <span class="news-shares">🔄 ${news.shares}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    });
};

// Apply explore filters
window.applyExploreFilters = function() {
    const categoryFilters = Array.from(document.querySelectorAll('#explore-category-filters input:checked')).map(cb => cb.value);
    const typeFilters = Array.from(document.querySelectorAll('#explore-type-filters input:checked')).map(cb => cb.value);
    
    const categories = categoryFilters.length > 0 ? categoryFilters : ['policy', 'research', 'mental', 'nutrition', 'technology', 'fitness'];
    
    categories.forEach(category => {
        const container = document.getElementById(`${category}-news`);
        if (!container) return;
        
        const newsItems = healthNewsData[category] || [];
        
        if (newsItems.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>No news available in this category</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = newsItems.map(news => `
            <div class="news-item" data-id="${news.id}">
                <div class="news-image">
                    <img src="${news.image}" alt="${news.title}" loading="lazy">
                    ${news.trending ? '<span class="trending-badge">🔥 Trending</span>' : ''}
                </div>
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-footer">
                        <span class="news-date">${new Date(news.date).toLocaleDateString()}</span>
                        <span class="news-author">By ${news.author}</span>
                        <div class="news-stats">
                            <span class="news-likes">❤️ ${news.likes}</span>
                            <span class="news-shares">🔄 ${news.shares}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    });
    
    // Hide categories not selected
    const allCategories = ['policy', 'research', 'mental', 'nutrition', 'technology', 'fitness'];
    allCategories.forEach(cat => {
        const section = document.querySelector(`#${cat}-news`).closest('.news-category-section');
        if (categoryFilters.length > 0 && !categoryFilters.includes(cat)) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
};

// Initialize Healther AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AI assistant with Healther theme
    window.HealtherAI.init({
        theme: document.documentElement.getAttribute('data-theme') || 'light',
        autoOpen: false
    });
});

// Health Status Page Navigation
window.showHealthStatusPage = function() {
    // Hide all other pages
    const dashboard = document.getElementById('dashboard');
    const accountPage = document.getElementById('account-page');
    const explorePage = document.getElementById('explore-page');
    const marketPage = document.getElementById('market-page');
    const healthStatusPage = document.getElementById('health-status-page');
    
    // Hide all pages
    if (dashboard) dashboard.style.display = 'none';
    if (accountPage) accountPage.setAttribute('hidden', '');
    if (explorePage) explorePage.setAttribute('hidden', '');
    if (marketPage) marketPage.setAttribute('hidden', '');
    
    // Hide all trading pages
    const tradingPages = ['pharmacy-page', 'healthcare-page', 'wellness-page', 'labtests-page'];
    tradingPages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) page.setAttribute('hidden', '');
    });
    
    // Show health status page
    if (healthStatusPage) {
        healthStatusPage.removeAttribute('hidden');
        console.log('Health Status page shown');
    }
    
    // Update sidebar active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
