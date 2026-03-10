/**
 * HEALTHER AI Assistant - Powered by Jotform Agent
 * 
 * Universal AI Assistant that works on any page
 * Features:
 * - Floating widget with chat interface
 * - Jotform Agent integration
 * - Custom branding (Healther)
 * - Responsive design
 */

// Load Jotform Agent
(function() {
    // Create and load Jotform Agent script
    const jotformScript = document.createElement('script');
    jotformScript.src = 'https://cdn.jotfor.ms/agent/embedjs/019c95a921397c24bab68b014c2b26e91aec/embed.js';
    jotformScript.async = true;
    
    jotformScript.onload = function() {
        // Customize Jotform Agent after loading
        customizeJotformAgent();
    };
    
    document.head.appendChild(jotformScript);
})();

function customizeJotformAgent() {
    // Wait for the agent to be fully loaded
    setTimeout(() => {
        // Remove Jotform branding and watermarks
        removeJotformBranding();
        
        // Add Healther branding
        addHealtherBranding();
        
        // Customize appearance
        customizeAppearance();
    }, 2000);
}

function removeJotformBranding() {
    // Remove Jotform logos, watermarks, and references
    const jotformElements = document.querySelectorAll('[class*="jotform"], [id*="jotform"], [data*="jotform"]');
    jotformElements.forEach(element => {
        // Remove or hide Jotform branding elements
        if (element.textContent && element.textContent.toLowerCase().includes('jotform')) {
            element.style.display = 'none';
        }
        
        // Remove Jotform watermarks
        if (element.classList && element.classList.toString().includes('watermark')) {
            element.remove();
        }
    });
    
    // Remove Jotform links and references
    const jotformLinks = document.querySelectorAll('a[href*="jotform"]');
    jotformLinks.forEach(link => {
        link.remove();
    });
    
    // Remove powered by text
    const poweredByElements = document.querySelectorAll('*');
    poweredByElements.forEach(element => {
        if (element.textContent && element.textContent.toLowerCase().includes('powered by')) {
            element.style.display = 'none';
        }
    });
}

function addHealtherBranding() {
    // Add "Supported by Healther" branding
    const healtherBranding = document.createElement('div');
    healtherBranding.id = 'healther-branding';
    healtherBranding.innerHTML = 'Supported by Healther';
    healtherBranding.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 11px;
        color: #666;
        font-family: Arial, sans-serif;
        z-index: 9999;
        pointer-events: none;
    `;
    
    // Find the agent container and add branding
    const agentContainer = document.querySelector('[class*="agent"], [id*="agent"]');
    if (agentContainer) {
        agentContainer.appendChild(healtherBranding);
    }
}

function customizeAppearance() {
    // Customize colors to match Healther theme
    const style = document.createElement('style');
    style.textContent = `
        /* Healther AI Assistant Custom Styles */
        [class*="agent"] {
            --healther-primary: #28a745;
            --healther-secondary: #17a2b8;
            --healther-dark: #2d2d2d;
            --healther-light: #f8f9fa;
        }
        
        /* Override Jotform default colors */
        [class*="agent"] [class*="header"],
        [class*="agent"] [class*="title"] {
            background-color: var(--healther-primary) !important;
            color: white !important;
        }
        
        [class*="agent"] [class*="button"],
        [class*="agent"] [class*="send"] {
            background-color: var(--healther-primary) !important;
            border-color: var(--healther-primary) !important;
        }
        
        [class*="agent"] [class*="button"]:hover,
        [class*="agent"] [class*="send"]:hover {
            background-color: #218838 !important;
            border-color: #218838 !important;
        }
        
        /* Dark theme support */
        [data-theme="dark"] [class*="agent"] {
            background-color: var(--healther-dark) !important;
            color: white !important;
        }
        
        [data-theme="dark"] [class*="agent"] [class*="message"],
        [data-theme="dark"] [class*="agent"] [class*="input"] {
            background-color: #3d3d3d !important;
            color: white !important;
            border-color: #555 !important;
        }
        
        /* Hide Jotform branding */
        [class*="jotform"],
        [id*="jotform"],
        [data*="jotform"] {
            display: none !important;
        }
        
        /* Custom Healther branding */
        #healther-branding {
            color: var(--healther-primary) !important;
            font-weight: 600;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize Healther AI Assistant
window.HealtherAI = {
    init: function(options = {}) {
        console.log('Healther AI Assistant initialized with Jotform Agent');
        
        // Apply any custom options
        if (options.theme) {
            document.documentElement.setAttribute('data-theme', options.theme);
        }
        
        // Auto-open if specified
        if (options.autoOpen) {
            setTimeout(() => {
                this.open();
            }, 1000);
        }
    },
    
    open: function() {
        // Try to open the Jotform agent
        const agentButton = document.querySelector('[class*="agent"] [class*="button"], [class*="agent"] [class*="trigger"]');
        if (agentButton) {
            agentButton.click();
        }
    },
    
    close: function() {
        // Try to close the Jotform agent
        const closeButton = document.querySelector('[class*="agent"] [class*="close"], [class*="agent"] [class*="minimize"]');
        if (closeButton) {
            closeButton.click();
        }
    },
    
    sendMessage: function(message) {
        // Try to send a message through the Jotform agent
        const inputField = document.querySelector('[class*="agent"] [class*="input"], [class*="agent"] textarea, [class*="agent"] input[type="text"]');
        const sendButton = document.querySelector('[class*="agent"] [class*="send"], [class*="agent"] [class*="submit"]');
        
        if (inputField && sendButton) {
            inputField.value = message;
            sendButton.click();
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.HealtherAI.init();
    });
} else {
    window.HealtherAI.init();
}
