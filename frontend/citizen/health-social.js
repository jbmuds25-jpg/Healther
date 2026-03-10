/**
 * Health Social Hub - Global Health News Aggregation Platform
 * Real-time health news from multiple sources with social features
 */

class HealthSocialHub {
    constructor() {
        this.allContent = [];
        this.filteredContent = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            categories: [],
            contentTypes: ['article', 'video', 'image', 'document', 'infographic', 'podcast'],
            regions: ['global']
        };
        this.sortBy = 'latest';
        this.trendingTopics = [];
        this.globalStats = {
            totalNews: 0,
            totalSources: 0,
            totalCountries: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadContent();
        this.loadTrendingTopics();
        this.updateGlobalStats();
    }

    setupEventListeners() {
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            window.location.href = 'citizen.html';
        });

        // Sidebar navigation
        document.querySelectorAll('.sidebar .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const key = item.getAttribute('data-key');
                if (key === 'home') {
                    window.location.href = 'citizen.html';
                }
            });
        });

        // Search
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.searchContent(e.target.value);
        });

        // Clear search
        document.getElementById('clear-search')?.addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            this.searchContent('');
        });

        // Filter button
        document.getElementById('filter-btn')?.addEventListener('click', () => {
            this.toggleFilterModal();
        });

        // Sort select
        document.getElementById('sort-select')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applySorting();
        });

        // Refresh button
        document.getElementById('refresh-btn')?.addEventListener('click', () => {
            this.refreshContent();
        });

        // Load more
        document.getElementById('load-more-btn')?.addEventListener('click', () => {
            this.loadMoreContent();
        });

        // Filter modal
        document.getElementById('close-filter')?.addEventListener('click', () => {
            this.toggleFilterModal();
        });

        document.getElementById('filter-overlay')?.addEventListener('click', () => {
            this.toggleFilterModal();
        });

        // Apply filters
        document.getElementById('apply-filters')?.addEventListener('click', () => {
            this.applyFilters();
            this.toggleFilterModal();
        });

        // Reset filters
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
            this.toggleFilterModal();
        });

        // Modal close
        document.getElementById('content-close')?.addEventListener('click', () => {
            this.closeContentModal();
        });

        document.getElementById('content-overlay')?.addEventListener('click', () => {
            this.closeContentModal();
        });
    }

    async loadContent() {
        const container = document.getElementById('content-grid');
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Fetching global health content...</p>
                </div>
            </div>
        `;

        try {
            // Fetch from backend API
            const response = await fetch('http://localhost:3000/api/health-news?page=1&limit=50');
            
            if (response.ok) {
                const data = await response.json();
                this.allContent = data.content || [];
            } else {
                // Use sample data if API fails
                this.allContent = this.getSampleContent();
            }
        } catch (error) {
            console.warn('Could not fetch health content, using sample data:', error);
            this.allContent = this.getSampleContent();
        }

        this.filteredContent = [...this.allContent];
        this.displayContent();
    }

    getSampleContent() {
        return [
            {
                id: 1,
                title: 'WHO Announces New Global Health Initiative for 2024',
                excerpt: 'World Health Organization launches comprehensive program to address emerging health challenges worldwide.',
                content: 'The World Health Organization today announced a groundbreaking global health initiative aimed at addressing the most pressing health challenges of 2024. The program focuses on preventive care, digital health integration, and equitable access to medical services across all nations.',
                source: 'World Health Organization',
                sourceUrl: 'https://who.int/news/2024/global-health-initiative',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=WHO',
                category: 'policy',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160500-112173e7f151?w=800',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                likes: 892,
                shares: 456,
                downloads: 234,
                country: 'Switzerland',
                region: 'global',
                tags: ['WHO', 'global health', 'policy', '2024']
            },
            {
                id: 2,
                title: 'Revolutionary AI Tool Detects Early Cancer Signs with 95% Accuracy',
                excerpt: 'Breakthrough artificial intelligence system shows remarkable success in early cancer detection across multiple types.',
                content: 'Researchers at leading medical institutions have developed an AI-powered diagnostic tool that can detect early signs of cancer with unprecedented accuracy. The system analyzes medical images, patient data, and genetic markers to identify potential malignancies before symptoms become apparent.',
                source: 'MIT Technology Review',
                sourceUrl: 'https://techreview.mit.edu/ai-cancer-detection',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=MIT',
                category: 'technology',
                contentType: 'video',
                image: 'https://images.unsplash.com/photo-1559755545-2b4d1e72697?w=800',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 1234,
                shares: 789,
                downloads: 567,
                country: 'USA',
                region: 'americas',
                tags: ['AI', 'cancer', 'medical technology', 'diagnostics']
            },
            {
                id: 3,
                title: 'Meditation Apps Show 40% Reduction in Anxiety Symptoms, Study Finds',
                excerpt: 'Comprehensive analysis of digital meditation platforms reveals significant mental health benefits for regular users.',
                content: 'A comprehensive study conducted by mental health researchers has found that regular use of meditation applications can reduce anxiety symptoms by up to 40%. The study tracked over 10,000 users across various meditation platforms for a period of six months.',
                source: 'Mental Health Today',
                sourceUrl: 'https://mentalhealth.today/meditation-apps-study',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=MHT',
                category: 'mental',
                contentType: 'infographic',
                image: 'https://images.unsplash.com/photo-1506905925346-241fddd7a93?w=800',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                likes: 1567,
                shares: 892,
                downloads: 445,
                country: 'UK',
                region: 'europe',
                tags: ['meditation', 'anxiety', 'mental health', 'digital health']
            }
        ];
    }

    async loadTrendingTopics() {
        const container = document.getElementById('trending-list');
        
        // Sample trending topics
        this.trendingTopics = [
            { rank: 1, topic: 'COVID-19 Variants', count: 45678, change: '+12%' },
            { rank: 2, topic: 'Mental Health Awareness', count: 38921, change: '+8%' },
            { rank: 3, topic: 'AI in Healthcare', count: 32456, change: '+25%' },
            { rank: 4, topic: 'Vaccine Development', count: 28934, change: '+5%' },
            { rank: 5, topic: 'Nutrition Science', count: 23456, change: '+15%' }
        ];

        const html = this.trendingTopics.map(item => `
            <div class="trending-item">
                <span class="trending-rank">#${item.rank}</span>
                <span class="trending-topic">${item.topic}</span>
                <span class="trending-count">${(item.count / 1000).toFixed(1)}k</span>
            </div>
        `).join('');

        container.innerHTML = html;
        
        // Update trending count
        document.getElementById('trending-count').textContent = this.trendingTopics.length;
    }

    updateGlobalStats() {
        const uniqueSources = new Set(this.allContent.map(item => item.source));
        const uniqueCountries = new Set(this.allContent.map(item => item.country).filter(Boolean));

        this.globalStats = {
            totalNews: this.allContent.length,
            totalSources: uniqueSources.size,
            totalCountries: uniqueCountries.size
        };

        // Update UI
        document.getElementById('total-news').textContent = this.globalStats.totalNews;
        document.getElementById('total-sources').textContent = this.globalStats.totalSources;
        document.getElementById('total-countries').textContent = this.globalStats.totalCountries;
    }

    displayContent() {
        const container = document.getElementById('content-grid');
        
        if (this.filteredContent.length === 0) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <div class="empty-state-title">No health content found</div>
                        <div class="empty-state-message">Try adjusting your filters or search terms</div>
                    </div>
                </div>
            `;
            return;
        }

        const start = 0;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredContent.length);
        const contentToDisplay = this.filteredContent.slice(start, end);

        const html = contentToDisplay.map(content => this.createContentCard(content)).join('');
        container.innerHTML = html;

        // Add event listeners
        this.addContentEventListeners(contentToDisplay);

        // Update load more button
        this.updateLoadMoreButton(end >= this.filteredContent.length);
    }

    createContentCard(content) {
        const timeAgo = this.getTimeAgo(content.timestamp);
        const engagementScore = this.calculateEngagementScore(content);
        
        return `
            <div class="content-card" data-id="${content.id}">
                <div class="content-media ${content.contentType}">
                    ${content.contentType === 'video' ? '<div class="content-media.video::after"></div>' : ''}
                    <img src="${content.image}" alt="${content.title}" onerror="this.src='https://via.placeholder.com/600x300?text=Health+News'">
                </div>
                <div class="content-body">
                    <div class="content-header">
                        <h3 class="content-title">${content.title}</h3>
                        <span class="content-category">${this.getCategoryLabel(content.category)}</span>
                    </div>
                    <p class="content-excerpt">${content.excerpt}</p>
                    <div class="content-meta">
                        <div class="content-source">
                            <div class="source-logo">${content.sourceLogo ? `<img src="${content.sourceLogo}" alt="${content.source}">` : content.source.charAt(0)}</div>
                            <div class="source-info">
                                <div class="source-name">${content.source}</div>
                                <a href="${content.sourceUrl}" target="_blank" rel="noopener" class="source-url">${new URL(content.sourceUrl).hostname}</a>
                            </div>
                        </div>
                        <div class="content-time">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            ${timeAgo}
                        </div>
                    </div>
                    <div class="content-actions">
                        <button class="action-btn like-btn" data-id="${content.id}" title="Like">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${content.likes}</span>
                        </button>
                        <button class="action-btn share-btn" data-id="${content.id}" title="Share">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13M22 2l-7 20L11 13M22 2l-7 20l4-11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${content.shares}</span>
                        </button>
                        <button class="action-btn download-btn" data-id="${content.id}" title="Download">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${content.downloads}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addContentEventListeners(contentItems) {
        // Content card clicks
        document.querySelectorAll('.content-card').forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    this.openContentModal(contentItems[index]);
                }
            });
        });

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAction(btn);
            });
        });
    }

    handleAction(btn) {
        const contentId = parseInt(btn.dataset.id);
        const content = this.findContentById(contentId);
        
        if (!content) return;

        if (btn.classList.contains('like-btn')) {
            this.likeContent(btn, content);
        } else if (btn.classList.contains('share-btn')) {
            this.shareContent(content);
        } else if (btn.classList.contains('download-btn')) {
            this.downloadContent(content);
        }
    }

    likeContent(btn, content) {
        btn.classList.toggle('liked');
        const span = btn.querySelector('span');
        if (btn.classList.contains('liked')) {
            content.likes++;
            btn.classList.add('liked');
        } else {
            content.likes--;
            btn.classList.remove('liked');
        }
        span.textContent = content.likes;
    }

    shareContent(content) {
        const shareText = `🏥 ${content.title}\n📰 ${content.source}\n🔗 ${content.sourceUrl}\n\n${content.excerpt}`;
        
        if (navigator.share) {
            navigator.share({
                title: content.title,
                text: shareText,
                url: content.sourceUrl
            }).catch(err => console.log('Share failed:', err));
        } else {
            navigator.clipboard.writeText(shareText);
            this.showToast('Link copied to clipboard!');
        }
    }

    downloadContent(content) {
        const downloadContent = `
HEALTH CONTENT DOWNLOAD
========================

Title: ${content.title}
Source: ${content.source}
Source URL: ${content.sourceUrl}
Category: ${content.category}
Date: ${content.timestamp.toLocaleString()}
Country: ${content.country || 'Global'}
Region: ${content.region || 'Global'}

Tags: ${content.tags ? content.tags.join(', ') : 'N/A'}

---

${content.excerpt}

${content.content}

---

Downloaded from Healther Health Social Hub
        `.trim();

        const blob = new Blob([downloadContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${content.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        content.downloads++;
        this.showToast('Content downloaded successfully!');
    }

    findContentById(id) {
        return this.filteredContent.find(content => content.id === id) || this.allContent.find(content => content.id === id);
    }

    calculateEngagementScore(content) {
        return (content.likes * 1) + (content.shares * 2) + (content.downloads * 3);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    getCategoryLabel(category) {
        const labels = {
            covid: 'COVID-19',
            vaccines: 'Vaccines',
            nutrition: 'Nutrition',
            fitness: 'Fitness',
            mental: 'Mental Health',
            technology: 'Health Tech',
            research: 'Research',
            policy: 'Health Policy'
        };
        return labels[category] || category;
    }

    showToast(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary, #007AFF);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    toggleFilterModal() {
        const modal = document.getElementById('filter-modal');
        if (modal.hasAttribute('hidden')) {
            modal.removeAttribute('hidden');
        } else {
            modal.setAttribute('hidden', '');
        }
    }

    openContentModal(content) {
        const modal = document.getElementById('content-modal');
        const modalBody = document.getElementById('content-body');

        modalBody.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">${content.title}</h2>
                <div class="modal-meta">
                    <div class="modal-source">
                        <div class="source-logo">${content.sourceLogo ? `<img src="${content.sourceLogo}" alt="${content.source}">` : content.source.charAt(0)}</div>
                        <div class="source-info">
                            <div class="source-name">${content.source}</div>
                            <a href="${content.sourceUrl}" target="_blank" rel="noopener" class="source-url">${new URL(content.sourceUrl).hostname}</a>
                        </div>
                    </div>
                    <div class="modal-time">${content.timestamp.toLocaleString()}</div>
                    <div class="modal-category">${this.getCategoryLabel(content.category)}</div>
                </div>
            </div>
            <div class="modal-featured-image">
                ${content.contentType === 'video' ? '<div class="content-media.video::after"></div>' : ''}
                <img src="${content.image}" alt="${content.title}" onerror="this.src='https://via.placeholder.com/800x400?text=Health+News'">
            </div>
            <div class="modal-description">${content.content}</div>
            <div class="modal-actions">
                <button class="modal-action-btn" onclick="healthSocialHub.like(this.firstElementChild.nextElementSibling, ${content.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span data-like="${content.id}">${content.likes}</span>
                </button>
                <button class="modal-action-btn" onclick="healthSocialHub.share({title: '${content.title.replace(/'/g, "\\'")}', source: '${content.source}', sourceUrl: '${content.sourceUrl}'})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13M22 2l-7 20L11 13M22 2l-7 20l4-11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Share
                </button>
                <button class="modal-action-btn" onclick="healthSocialHub.download({title: '${content.title.replace(/'/g, "\\'")}', source: '${content.source}', sourceUrl: '${content.sourceUrl}', timestamp: new Date('${content.timestamp}'), excerpt: '${content.excerpt.replace(/'/g, "\\'")}', content: '${content.content.replace(/'/g, "\\'")}'})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Download
                </button>
                <button class="modal-action-btn primary" onclick="window.open('${content.sourceUrl}', '_blank')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    View Source
                </button>
            </div>
        `;

        modal.removeAttribute('hidden');
    }

    closeContentModal() {
        document.getElementById('content-modal').setAttribute('hidden', '');
    }

    applyFilters() {
        const categoryCheckboxes = document.querySelectorAll('[data-filter="category"]:checked');
        const typeCheckboxes = document.querySelectorAll('[data-filter="type"]:checked');
        const regionCheckboxes = document.querySelectorAll('[data-filter="region"]:checked');

        this.filters.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
        this.filters.contentTypes = Array.from(typeCheckboxes).map(cb => cb.value);
        this.filters.regions = Array.from(regionCheckboxes).map(cb => cb.value);

        this.filteredContent = this.allContent.filter(content => {
            const categoryMatch = this.filters.categories.length === 0 || 
                                 this.filters.categories.includes(content.category);
            const typeMatch = this.filters.contentTypes.length === 0 || 
                             this.filters.contentTypes.includes(content.contentType);
            const regionMatch = this.filters.regions.length === 0 || 
                            this.filters.regions.includes(content.region) ||
                            this.filters.regions.includes('global');
            return categoryMatch && typeMatch && regionMatch;
        });

        this.currentPage = 1;
        this.displayContent();
    }

    resetFilters() {
        // Reset all checkboxes
        document.querySelectorAll('[data-filter="category"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('[data-filter="type"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('[data-filter="region"]').forEach(cb => cb.checked = false);
        
        // Check global by default
        document.querySelector('[data-filter="region"][value="global"]').checked = true;
        
        this.filters = {
            categories: [],
            contentTypes: ['article', 'video', 'image', 'document', 'infographic', 'podcast'],
            regions: ['global']
        };

        this.filteredContent = [...this.allContent];
        this.currentPage = 1;
        this.displayContent();
    }

    applySorting() {
        switch (this.sortBy) {
            case 'latest':
                this.filteredContent.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'trending':
                this.filteredContent.sort((a, b) => this.calculateEngagementScore(b) - this.calculateEngagementScore(a));
                break;
            case 'most-liked':
                this.filteredContent.sort((a, b) => b.likes - a.likes);
                break;
            case 'most-shared':
                this.filteredContent.sort((a, b) => b.shares - a.shares);
                break;
        }
        this.displayContent();
    }

    searchContent(query) {
        if (!query.trim()) {
            this.filteredContent = [...this.allContent];
        } else {
            const q = query.toLowerCase();
            this.filteredContent = this.allContent.filter(content =>
                content.title.toLowerCase().includes(q) ||
                content.excerpt.toLowerCase().includes(q) ||
                content.source.toLowerCase().includes(q) ||
                content.tags.some(tag => tag.toLowerCase().includes(q))
            );
        }
        this.currentPage = 1;
        this.displayContent();
    }

    loadMoreContent() {
        this.currentPage++;
        this.displayContent();
    }

    updateLoadMoreButton(allLoaded) {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (allLoaded) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'All content loaded';
        } else {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More Content';
        }
    }

    async refreshContent() {
        const container = document.getElementById('content-grid');
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Refreshing health content...</p>
                </div>
            </div>
        `;

        // Simulate refresh with new data
        setTimeout(() => {
            this.loadContent();
            this.showToast('Content refreshed successfully!');
        }, 1000);
    }
}

// Initialize Health Social Hub
let healthSocialHub;
document.addEventListener('DOMContentLoaded', () => {
    healthSocialHub = new HealthSocialHub();
});
