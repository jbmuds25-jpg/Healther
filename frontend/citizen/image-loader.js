/**
 * Healther Image Loader Utility
 * Dynamically loads images from the downloaded image assets
 */

class HealtherImageLoader {
    constructor() {
        this.imageMapping = null;
        this.basePath = '../assets/images/';
        this.loadedImageCache = new Map();
    }

    /**
     * Load image mapping from JSON file
     */
    async loadImageMapping() {
        try {
            const response = await fetch(this.basePath + 'image_mapping.json');
            this.imageMapping = await response.json();
            console.log('✅ Image mapping loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to load image mapping:', error);
            return false;
        }
    }

    /**
     * Get images by category
     */
    getImagesByCategory(category) {
        if (!this.imageMapping) {
            console.warn('⚠️ Image mapping not loaded. Call loadImageMapping() first.');
            return [];
        }
        return this.imageMapping[category] || [];
    }

    /**
     * Get random image from category
     */
    getRandomImage(category) {
        const images = this.getImagesByCategory(category);
        if (images.length === 0) return null;
        return images[Math.floor(Math.random() * images.length)];
    }

    /**
     * Create image element with proper attributes
     */
    createImageElement(imageData, className = '', altText = null) {
        const img = document.createElement('img');
        img.src = imageData.path;
        img.alt = altText || imageData.name;
        img.className = className;
        img.loading = 'lazy'; // Lazy loading for performance
        
        // Add error handling
        img.onerror = () => {
            console.warn(`⚠️ Failed to load image: ${imageData.path}`);
            img.style.display = 'none';
        };

        img.onload = () => {
            console.log(`✅ Loaded image: ${imageData.name}`);
        };

        return img;
    }

    /**
     * Populate a container with images from a category
     */
    async populateContainer(containerSelector, category, options = {}) {
        const {
            maxImages = 10,
            className = '',
            shuffle = false,
            useRandom = false
        } = options;

        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`❌ Container not found: ${containerSelector}`);
            return;
        }

        // Load mapping if not already loaded
        if (!this.imageMapping) {
            await this.loadImageMapping();
        }

        let images = useRandom ? [this.getRandomImage(category)] : this.getImagesByCategory(category);
        
        if (shuffle) {
            images = this.shuffleArray(images);
        }

        // Clear existing content
        container.innerHTML = '';

        // Add images
        const imagesToAdd = images.slice(0, maxImages);
        imagesToAdd.forEach(imageData => {
            const img = this.createImageElement(imageData, className);
            container.appendChild(img);
        });

        console.log(`✅ Populated ${containerSelector} with ${imagesToAdd.length} images from ${category}`);
    }

    /**
     * Create image gallery with grid layout
     */
    async createGallery(containerSelector, category, options = {}) {
        const {
            columns = 3,
            gap = '15px',
            imageClass = 'gallery-image',
            maxImages = 12
        } = options;

        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`❌ Container not found: ${containerSelector}`);
            return;
        }

        // Set up gallery styles
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        container.style.gap = gap;
        container.className = `healther-gallery ${container.className}`;

        await this.populateContainer(containerSelector, category, {
            maxImages,
            className: imageClass,
            shuffle: true
        });
    }

    /**
     * Utility function to shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Preload images for better performance
     */
    async preloadImages(category, maxImages = 20) {
        const images = this.getImagesByCategory(category).slice(0, maxImages);
        const promises = images.map(imageData => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageData.path;
            });
        });

        try {
            await Promise.all(promises);
            console.log(`✅ Preloaded ${images.length} images from ${category}`);
        } catch (error) {
            console.error(`❌ Failed to preload images from ${category}:`, error);
        }
    }
}

// Global instance for easy access
window.healtherImageLoader = new HealtherImageLoader();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await window.healtherImageLoader.loadImageMapping();
    console.log('🌐 Healther Image Loader initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealtherImageLoader;
}
