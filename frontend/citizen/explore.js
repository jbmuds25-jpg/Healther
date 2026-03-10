/**
 * Exploration Hub / News Feed
 * Displays global health trends, news, and content from multiple sources
 */

class ExploreHub {
    constructor() {
        this.allNews = [];
        this.filteredNews = [];
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.filters = {
            categories: [],
            contentTypes: ['article', 'video', 'image', 'document']
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNews();
    }

    setupEventListeners() {
        // Don't set up back button and sidebar navigation here - handled by citizen.js
        
        // Filter button
        // Filter button (support both global and explore-prefixed IDs)
        (document.getElementById('filter-toggle') || document.getElementById('explore-filter-toggle') || document.getElementById('explore-filter-btn'))?.addEventListener('click', () => this.toggleFilterPanel());
        (document.getElementById('close-filter') || document.getElementById('explore-close-filter'))?.addEventListener('click', () => this.toggleFilterPanel());
        // Apply filters (support both)
        (document.getElementById('apply-filters') || document.getElementById('explore-apply-filters'))?.addEventListener('click', () => this.applyFilters());

        // Search input (support both header and explore toolbar)
        (document.getElementById('search-input') || document.getElementById('explore-search-input'))?.addEventListener('input', (e) => this.searchNews(e.target.value));
        (document.getElementById('clear-search') || document.getElementById('explore-clear-search'))?.addEventListener('click', () => {
            const si = document.getElementById('search-input') || document.getElementById('explore-search-input');
            if (si) si.value = '';
            this.searchNews('');
        });

        // Load more (support both)
        (document.getElementById('load-more-btn') || document.getElementById('explore-load-more-btn'))?.addEventListener('click', () => this.loadMoreNews());

        // Modal close and overlay (support both id and class-based overlays)
        (document.getElementById('modal-close') || document.getElementById('explore-modal-close') || document.getElementById('modal-close') )?.addEventListener('click', () => this.closeModal());
        (document.getElementById('modal-overlay') || document.querySelector('#explore-news-modal .modal-overlay') || document.querySelector('.news-modal .modal-overlay'))?.addEventListener('click', () => this.closeModal());

        // Sort select
        (document.getElementById('explore-sort-select') || document.getElementById('explore-sort-select'))?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applySorting();
        });

        // Refresh button
        (document.getElementById('explore-refresh-btn') || document.getElementById('explore-refresh-btn'))?.addEventListener('click', () => this.refreshNews());
    }

    toggleFilterPanel() {
        const filterPanel = document.getElementById('explore-filter-panel');
        if (filterPanel.hasAttribute('hidden')) {
            filterPanel.removeAttribute('hidden');
            document.getElementById('explore-news-feed').classList.add('with-sidebar');
        } else {
            filterPanel.setAttribute('hidden', '');
            document.getElementById('explore-news-feed').classList.remove('with-sidebar');
        }
    }

    async loadNews() {
        // Immediately show an aggregated sample feed so the page always has news available
        try {
            const fallback = this.generateAggregatedSample(20);
            this.allNews = fallback;
            this.filteredNews = [...this.allNews];
            this.displayNews();

            // Then try to fetch the real feed in background and replace when ready
            (async () => {
                const endpoints = ['/api/news/ingested?page=1&limit=50', '/api/news?page=1&limit=50'];
                let used = false;
                for (const url of endpoints) {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                            console.info('News API responded with status', response.status, 'for', url);
                            continue;
                        }
                        const data = await response.json();
                        const fetched = data.news || data.items || data || [];
                        if (Array.isArray(fetched) && fetched.length > 0) {
                            // normalize timestamps to Date objects
                            this.allNews = fetched.map(n => ({ ...n, timestamp: n.timestamp ? new Date(n.timestamp) : new Date() }));
                            this.filteredNews = [...this.allNews];
                            // apply existing filters/sorting
                            this.applySorting();
                            this.displayNews();
                            used = true;
                            break;
                        }
                    } catch (err) {
                        console.warn('Background fetch for news failed at', url, err);
                    }
                }
                if (!used) console.info('API returned no news; keeping fallback feed');
            })();
        } catch (err) {
            console.error('Could not render fallback news:', err);
            const container = document.getElementById('explore-news-container') || document.getElementById('news-container');
            if (container) container.innerHTML = '<div class="error-state">Could not load news at this time.</div>';
        }
    }

    generateAggregatedSample(count = 40) {
        const base = this.getSampleNews();
        const regions = ['global', 'americas', 'europe', 'asia', 'africa', 'oceania'];
        const sources = ['HealthWire', 'GlobalHealth Today', 'MedBrief', 'Wellness Journal', 'Nutrition Now', 'Research Digest', 'Vaccine Alert'];
        const categories = ['research','nutrition','fitness','mental','technology','covid','policy','vaccines'];

        const out = [];
        for (let i = 0; i < count; i++) {
            const sample = base[i % base.length];
            const variation = JSON.parse(JSON.stringify(sample));
            variation.id = 1000 + i;
            variation.title = variation.title + ' — ' + sources[i % sources.length];
            variation.source = sources[i % sources.length];
            variation.sourceUrl = 'https://example.com/' + variation.id;
            variation.category = categories[i % categories.length];
            variation.region = regions[i % regions.length];
            variation.timestamp = new Date(Date.now() - (i * 30 + (Math.random()*120)) * 60000);
            variation.likes = Math.floor((variation.likes || 10) * (1 + Math.random()*2));
            variation.shares = Math.floor((variation.shares || 5) * (1 + Math.random()*2));
            variation.downloads = Math.floor((variation.downloads || 2) * (1 + Math.random()*2));
            variation.comments = [];
            out.push(variation);
        }
        // add the original sample at front
        return out.concat(base.map(b => ({...b, comments: []})));
    }

    getSampleNews() {
        return [
            {
                id: 1,
                title: 'New Breakthrough in Cancer Treatment Shows Promise',
                excerpt: 'Researchers announce a revolutionary approach to treating various cancer types with minimal side effects.',
                content: 'Medical researchers have announced a potential breakthrough in cancer treatment... Full article content here.',
                source: 'Health News Daily',
                sourceUrl: 'https://healthnewsdaily.example.com',
                category: 'research',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160500-112173e7f151?w=800',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 234,
                shares: 89,
                downloads: 45
            },
            {
                id: 2,
                title: 'Top 10 Foods for Better Heart Health',
                excerpt: 'Discover the best natural foods that can help improve your cardiovascular system.',
                content: 'Heart health is crucial for a long and healthy life. Here are the top foods...',
                source: 'Nutrition Today',
                sourceUrl: 'https://nutritiontoday.example.com',
                category: 'nutrition',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                likes: 567,
                shares: 234,
                downloads: 112
            },
            {
                id: 3,
                title: 'Fitness Experts Share Latest Exercise Trends',
                excerpt: 'Discover the latest fitness trends that are scientifically proven to be effective.',
                content: 'In 2024, several new fitness trends have emerged...',
                source: 'Fitness Central',
                sourceUrl: 'https://fitnesscentral.example.com',
                category: 'fitness',
                contentType: 'video',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                likes: 445,
                shares: 156,
                downloads: 78
            },
            {
                id: 4,
                title: 'Mental Health: Understanding Anxiety Disorders',
                excerpt: 'A comprehensive guide to understanding and managing anxiety disorders.',
                content: 'Anxiety disorders affect millions of people worldwide...',
                source: 'Mental Health Hub',
                sourceUrl: 'https://mentalhealthhub.example.com',
                category: 'mental',
                contentType: 'document',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                likes: 612,
                shares: 289,
                downloads: 198
            },
            {
                id: 5,
                title: 'Latest Health Technology: AI Diagnostics',
                excerpt: 'Artificial Intelligence is revolutionizing medical diagnosis and treatment planning.',
                content: 'AI technology has shown remarkable promise in medical diagnostics...',
                source: 'Health Tech Weekly',
                sourceUrl: 'https://healthtechweekly.example.com',
                category: 'technology',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
                timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
                likes: 334,
                shares: 167,
                downloads: 89
            },
            {
                id: 6,
                title: 'COVID-19 Variants: What You Need to Know',
                excerpt: 'Latest information on emerging COVID-19 variants and vaccination strategies.',
                content: 'Health authorities continue to monitor COVID-19 variants...',
                source: 'Global Health Organization',
                sourceUrl: 'https://globalhealthorg.example.com',
                category: 'covid',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
                likes: 789,
                shares: 445,
                downloads: 267
            }
        ];
    }

    displayNews() {
        try {
            const container = document.getElementById('explore-news-container') || document.getElementById('news-container');

            if (!container) {
                console.error('News container not found in DOM');
                return;
            }

            if (this.filteredNews.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📰</div>
                        <div class="empty-state-title">No news found</div>
                        <div class="empty-state-message">Try adjusting your filters or search terms</div>
                    </div>
                `;
                return;
            }

        const start = 0;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredNews.length);
        const newsToDisplay = this.filteredNews.slice(start, end);

        const html = newsToDisplay.map(news => this.createNewsItem(news)).join('');
        container.innerHTML = html;

        // Add event listeners
            document.querySelectorAll('.news-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.openModal(newsToDisplay[index]);
                });
            });

            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleAction(btn);
                });
            });

        // Hide load more if all items are displayed
            const loadMoreBtn = document.getElementById('explore-load-more-btn') || document.getElementById('load-more-btn') || document.getElementById('explore-load-more-btn');
            if (loadMoreBtn) {
                if (end >= this.filteredNews.length) {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.textContent = 'All news loaded';
                } else {
                    loadMoreBtn.disabled = false;
                    loadMoreBtn.textContent = 'Load More News';
                }
            }
        } catch (err) {
            console.error('Error rendering news list:', err);
            const container = document.getElementById('explore-news-container') || document.getElementById('news-container');
            if (container) container.innerHTML = '<div class="error-state">An error occurred while loading news. Refresh the page to try again.</div>';
        }
    }

    createNewsItem(news) {
        const timeAgo = this.getTimeAgo(news.timestamp);
        const sourceInitial = news.source.charAt(0).toUpperCase();
        
        return `
            <div class="news-item">
                <img src="${news.image}" alt="${news.title}" class="news-item-media" onerror="this.src='https://via.placeholder.com/600x300?text=Health+News'">
                <div class="news-item-content">
                    <div class="news-item-header">
                        <h3 class="news-item-title">${news.title}</h3>
                        <span class="news-item-badge">${this.getCategoryLabel(news.category)}</span>
                    </div>
                    <p class="news-item-excerpt">${news.excerpt}</p>
                    <div class="news-item-meta">
                        <div class="news-source">
                            <div class="news-source-icon">${sourceInitial}</div>
                            <span title="${news.source}">${news.source}</span>
                        </div>
                        <div class="news-time">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            ${timeAgo}
                        </div>
                    </div>
                    <div class="news-actions">
                        <button class="action-btn like-btn" data-id="${news.id}" title="Like">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${news.likes}</span>
                        </button>
                        <button class="action-btn share-btn" data-id="${news.id}" title="Share">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13M22 2l-7 20L11 13M22 2l-7 20l4-11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${news.shares}</span>
                        </button>
                        <button class="action-btn repost-btn" data-id="${news.id}" title="Repost">
                            ↻
                            <span>${news.shares}</span>
                        </button>
                        <button class="action-btn comment-btn" data-id="${news.id}" title="Comments">
                            💬
                            <span>${(news.comments && news.comments.length) || 0}</span>
                        </button>
                        <button class="action-btn download-btn" data-id="${news.id}" title="Download">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${news.downloads}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    handleAction(btn) {
        const newsId = parseInt(btn.dataset.id);
        const news = this.findNewsById(newsId);
        
        if (!news) return;

        if (btn.classList.contains('like-btn')) {
            this.like(btn, news);
        } else if (btn.classList.contains('share-btn')) {
            this.share(news);
        } else if (btn.classList.contains('repost-btn')) {
            this.repost(news);
        } else if (btn.classList.contains('comment-btn')) {
            // open modal to comments
            this.openModal(news, {focusComments: true});
        } else if (btn.classList.contains('download-btn')) {
            this.download(news);
        }
    }

    like(btn, news) {
        btn.classList.toggle('liked');
        const span = btn.querySelector('span');
        if (btn.classList.contains('liked')) {
            news.likes++;
        } else {
            news.likes--;
        }
        span.textContent = news.likes;
    }

    share(news) {
        const shareText = `Check out this health news: "${news.title}" from ${news.source}\nRead more at: ${news.sourceUrl}`;
        
        if (navigator.share) {
            navigator.share({
                title: news.title,
                text: shareText,
                url: news.sourceUrl
            }).catch(err => console.log('Share failed:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText);
            alert('Link copied to clipboard!');
        }
    }

    repost(news) {
        // simple repost: prompt for optional comment and increment share count
        const userComment = prompt('Add a message to accompany your repost (optional):');
        news.shares = (news.shares || 0) + 1;
        news.reposts = news.reposts || [];
        news.reposts.push({ at: new Date(), comment: userComment || '' });
        this.refreshCounts(news.id);
        alert('Reposted to your feed (local).');
    }

    refreshCounts(newsId) {
        // update counts displayed in list and modal if open
        const btns = document.querySelectorAll(`[data-id="${newsId}"]`);
        const news = this.findNewsById(newsId);
        btns.forEach(b => {
            const span = b.querySelector('span');
            if (span) {
                if (b.classList.contains('like-btn')) span.textContent = news.likes;
                if (b.classList.contains('share-btn') || b.classList.contains('repost-btn')) span.textContent = news.shares;
                if (b.classList.contains('comment-btn')) span.textContent = (news.comments && news.comments.length) || 0;
            }
        });
        // update modal like span if present
        const modalLike = document.querySelector(`[data-like="${newsId}"]`);
        if (modalLike) modalLike.textContent = news.likes;
        const modalCommentsCount = document.getElementById('modal-comments-count');
        if (modalCommentsCount) modalCommentsCount.textContent = (news.comments && news.comments.length) || 0;
    }

    download(news) {
        // Create a downloadable file
        const content = `
HEALTH NEWS DOWNLOAD
====================

Title: ${news.title}
Source: ${news.source}
Source URL: ${news.sourceUrl}
Date: ${news.timestamp.toLocaleString()}

---

${news.excerpt}

${news.content}

---

Downloaded from Healther Exploration Hub
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${news.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    findNewsById(id) {
        return this.filteredNews.find(news => news.id === id) || this.allNews.find(news => news.id === id);
    }

    loadMoreNews() {
        this.currentPage++;
        this.displayNews();
    }

    applyFilters() {
        const categoryCheckboxes = document.querySelectorAll('[data-filter="category"]:checked');
        const typeCheckboxes = document.querySelectorAll('[data-filter="type"]:checked');
        const regionCheckboxes = document.querySelectorAll('[data-filter="region"]:checked');

        this.filters.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
        this.filters.contentTypes = Array.from(typeCheckboxes).map(cb => cb.value);
        this.filters.regions = Array.from(regionCheckboxes).map(cb => cb.value);

        this.filteredNews = this.allNews.filter(news => {
            const categoryMatch = this.filters.categories.length === 0 || this.filters.categories.includes(news.category);
            const typeMatch = this.filters.contentTypes.length === 0 || this.filters.contentTypes.includes(news.contentType);
            const regionMatch = !this.filters.regions || this.filters.regions.length === 0 || (news.region ? this.filters.regions.includes(news.region) : this.filters.regions.includes('global'));
            return categoryMatch && typeMatch && regionMatch;
        });

        this.currentPage = 1;
        this.applySorting();
        this.displayNews();
    }

    applySorting() {
        // default sort: latest
        const sortBy = this.sortBy || 'latest';
        switch (sortBy) {
            case 'latest':
                this.filteredNews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'trending':
                // simple trending formula: likes + shares + downloads in last 48h
                const now = Date.now();
                this.filteredNews.sort((a, b) => {
                    const scoreA = ((a.likes || 0) + (a.shares || 0) + (a.downloads || 0)) / (1 + Math.max(0, (now - new Date(a.timestamp)) / (1000*60*60*24)));
                    const scoreB = ((b.likes || 0) + (b.shares || 0) + (b.downloads || 0)) / (1 + Math.max(0, (now - new Date(b.timestamp)) / (1000*60*60*24)));
                    return scoreB - scoreA;
                });
                break;
            case 'most-liked':
                this.filteredNews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'most-shared':
                this.filteredNews.sort((a, b) => (b.shares || 0) - (a.shares || 0));
                break;
            default:
                this.filteredNews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        this.displayNews();
    }

    async refreshNews() {
        this.currentPage = 1;
        await this.loadNews();
    }

    searchNews(query) {
        if (!query.trim()) {
            this.filteredNews = [...this.allNews];
        } else {
            const q = query.toLowerCase();
            this.filteredNews = this.allNews.filter(news =>
                news.title.toLowerCase().includes(q) ||
                news.excerpt.toLowerCase().includes(q) ||
                news.source.toLowerCase().includes(q)
            );
        }
        this.currentPage = 1;
        this.displayNews();
    }

    openModal(news) {
        const modal = document.getElementById('news-modal') || document.getElementById('explore-news-modal');
        const modalBody = document.getElementById('modal-body') || document.getElementById('explore-modal-body');

        const sourceInitial = news.source.charAt(0).toUpperCase();

        modalBody.innerHTML = `
            <img src="${news.image}" alt="${news.title}" class="modal-featured-image" onerror="this.src='https://via.placeholder.com/800x400?text=Health+News'">
            <h2 class="modal-title">${news.title}</h2>
            <div class="modal-meta">
                <div class="news-source">
                    <div class="news-source-icon">${sourceInitial}</div>
                    <a href="${news.sourceUrl}" target="_blank" rel="noopener">${news.source}</a>
                </div>
                <div class="news-time">${news.timestamp.toLocaleString()}</div>
                <div>${this.getCategoryLabel(news.category)}</div>
            </div>
            <div class="modal-description">${news.content}</div>
            <div class="modal-actions">
                <button class="modal-action-btn" onclick="exploreHub.like(this.firstElementChild.nextElementSibling, ${news.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span data-like="${news.id}">${news.likes}</span>
                </button>
                <button class="modal-action-btn" onclick="exploreHub.share({title: '${news.title.replace(/'/g, "\\'")}', source: '${news.source}', sourceUrl: '${news.sourceUrl}'})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13M22 2l-7 20L11 13M22 2l-7 20l4-11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Share
                </button>
                <button class="modal-action-btn" onclick="exploreHub.download({title: '${news.title.replace(/'/g, "\\'")}', source: '${news.source}', sourceUrl: '${news.sourceUrl}', timestamp: new Date('${news.timestamp}'), excerpt: '${news.excerpt.replace(/'/g, "\\'")}', content: '${news.content.replace(/'/g, "\\'")}'})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Download
                </button>
                <button class="modal-action-btn primary" onclick="window.open('${news.sourceUrl}', '_blank')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    View Source
                </button>
            </div>
            <div class="modal-comments">
                <h4>Comments (<span id="modal-comments-count">${(news.comments && news.comments.length) || 0}</span>)</h4>
                <div id="comments-list">
                    ${this.renderComments(news)}
                </div>
                <div class="comment-form">
                    <textarea id="comment-input" placeholder="Write a comment..."></textarea>
                    <button id="comment-submit" class="btn primary">Post Comment</button>
                </div>
            </div>
        `;

        modal && modal.removeAttribute('hidden');
        applyTranslations();

        // comment submit handler
        document.getElementById('comment-submit')?.addEventListener('click', () => {
            const txt = document.getElementById('comment-input').value.trim();
            if (!txt) return alert('Please enter a comment');
            news.comments = news.comments || [];
            news.comments.push({ text: txt, author: 'You', at: new Date() });
            document.getElementById('comment-input').value = '';
            const commentsList = document.getElementById('comments-list');
            if (commentsList) commentsList.innerHTML = this.renderComments(news);
            this.refreshCounts(news.id);
        });

    }

    renderComments(news) {
        if (!news.comments || news.comments.length === 0) return '<div class="no-comments">No comments yet</div>';
        return news.comments.map(c => `
            <div class="comment-item">
                <div class="comment-meta"><strong>${c.author || 'User'}</strong> · ${new Date(c.at).toLocaleString()}</div>
                <div class="comment-text">${c.text}</div>
            </div>
        `).join('');
    }
    closeModal() {
        const modal = document.getElementById('news-modal') || document.getElementById('explore-news-modal');
        if (modal) modal.setAttribute('hidden', '');
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
            nutrition: 'Nutrition',
            fitness: 'Fitness',
            mental: 'Mental Health',
            technology: 'Health Tech',
            research: 'Research'
        };
        return labels[category] || category;
    }
}

// Initialize Explore Hub
let exploreHub;
function _initExplore() {
    try {
        exploreHub = new ExploreHub();
    } catch (err) {
        console.error('Failed to initialize ExploreHub', err);
        const container = document.getElementById('explore-news-container') || document.getElementById('news-container');
        if (container) container.innerHTML = '<div class="error-state">Could not load the exploration hub. Please try refreshing the page.</div>';
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initExplore);
} else {
    _initExplore();
}

// Global functions for citizen.js integration
window.loadExploreNews = function() {
    if (exploreHub) {
        exploreHub.loadNews();
    }
};

window.searchExploreNews = function(query) {
    if (exploreHub) {
        exploreHub.searchNews(query);
    }
};

window.applyExploreFilters = function() {
    if (exploreHub) {
        exploreHub.applyFilters();
    }
};

window.refreshExploreNews = function() {
    if (exploreHub) {
        exploreHub.refreshNews();
    }
};

window.loadMoreExploreNews = function() {
    if (exploreHub) {
        exploreHub.loadMoreNews();
    }
};

window.sortExploreNews = function(sortBy) {
    if (exploreHub) {
        exploreHub.sortBy = sortBy;
        exploreHub.applySorting();
    }
};
