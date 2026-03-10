# Healther AI Assistant Module

A reusable, modular AI assistant component for seamless integration across all Healther platforms.

## Quick Start

### 1. **Embedded Assistant** (Static, in-page)

Add to your HTML:

```html
<link rel="stylesheet" href="../global/assistant.css">

<!-- Somewhere in your page body -->
<div id="healther-assistant"></div>

<script src="../global/assistant.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        HaealtherAssistant.init({
            containerId: 'healther-assistant',
            position: 'embedded'  // Fixed height in page
        });
    });
</script>
```

### 2. **Floating Assistant** (Draggable popup)

```html
<link rel="stylesheet" href="../global/assistant.css">

<div id="healther-assistant" data-assistant-auto-init></div>

<script src="../global/assistant.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const assistant = HaealtherAssistant.getInstance();
        if (assistant) {
            assistant.config.position = 'floating';
            assistant.config.autoOpen = false; // User clicks to open
        }
    });
</script>
```

### 3. **Modal-based Assistant** (In help/settings modal)

```html
<!-- In your modal content -->
<div id="modal-assistant"></div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize when modal opens
        const openModalBtn = document.getElementById('open-help');
        openModalBtn.addEventListener('click', () => {
            if (!document.querySelector('#modal-assistant .healther-assistant-wrapper')) {
                HaealtherAssistant.init({
                    containerId: 'modal-assistant',
                    position: 'embedded',
                    title: 'Healther Help',
                    subtitle: 'Get instant help'
                });
            }
        });
    });
</script>
```

## Configuration Options

```javascript
HaealtherAssistant.init({
    // Container element ID
    containerId: 'healther-assistant',
    
    // API endpoint for messages
    apiEndpoint: '/api/ai',
    
    // UI text
    title: 'Healther Assistant',
    subtitle: 'Ask questions or report issues',
    
    // Display mode: 'embedded' (fixed height) or 'floating' (popup)
    position: 'embedded',
    
    // Auto-open on page load
    autoOpen: false,
    
    // Theme: 'light' or 'dark' (respects data-theme attribute)
    theme: 'light',
    
    // Error handler callback
    onError: (error) => console.error(error),
    
    // Debug logging
    debug: false
});
```

## API Methods

### Singleton Pattern

```javascript
// Initialize and get instance
const assistant = HaealtherAssistant.init(options);

// Get existing instance
const assistant = HaealtherAssistant.getInstance();
```

### Instance Methods

```javascript
// Send message (called automatically by form submission)
assistant.sendMessage(message);

// Add message to chat window
assistant.addMessage(text, sender);  // sender: 'user', 'bot', or 'error'

// Clear chat history
assistant.clear();

// For floating mode
assistant.open();
assistant.close();
assistant.toggle();
```

## Integration Examples

### Example 1: Citizen Dashboard

```html
<!-- citizen.html -->
<link rel="stylesheet" href="../global/assistant.css">

<section class="dashboard">
    <!-- Existing dashboard content -->
</section>

<!-- Floating assistant for quick help -->
<div id="citizen-assistant" data-assistant-auto-init></div>

<script src="citizen.js"></script>
<script src="../global/assistant.js"></script>
<script>
    // Optional: Customize floating assistant
    document.addEventListener('DOMContentLoaded', () => {
        const assistant = HaealtherAssistant.getInstance();
        if (assistant) {
            assistant.config.position = 'floating';
        }
    });
</script>
```

### Example 2: Doctor Dashboard with Embedded Assistant

```html
<!-- doctor.html -->
<link rel="stylesheet" href="../global/assistant.css">

<section class="dashboard">
    <div class="card">
        <h2>Doctor Dashboard</h2>
        <!-- Doctor content -->
    </div>
    
    <!-- Embedded assistant in sidebar -->
    <div class="assistant-container">
        <div id="doctor-assistant"></div>
    </div>
</section>

<script src="doctor.js"></script>
<script src="../global/assistant.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        HaealtherAssistant.init({
            containerId: 'doctor-assistant',
            position: 'embedded',
            title: 'Doctor Assistant',
            subtitle: 'Help with patients or cases'
        });
    });
</script>
```

### Example 3: Settings Modal

```html
<div id="settings-modal" class="modal">
    <div class="modal-content">
        <!-- Settings content -->
        
        <!-- Assistant for settings help -->
        <div id="settings-assistant"></div>
    </div>
</div>

<script>
    const settingsBtn = document.getElementById('open-settings');
    settingsBtn.addEventListener('click', () => {
        // Show modal...
        
        // Initialize assistant inside modal
        setTimeout(() => {
            if (!document.querySelector('#settings-assistant .healther-assistant-wrapper')) {
                HaealtherAssistant.init({
                    containerId: 'settings-assistant',
                    position: 'embedded',
                    title: 'Settings Help',
                    subtitle: 'Get help with settings'
                });
            }
        }, 100);
    });
</script>
```

## Backend Integration

The assistant sends POST requests to `/api/ai`:

```javascript
POST /api/ai
Content-Type: application/json

{
    "message": "How do I reset my password?"
}
```

Expected response:

```json
{
    "reply": "To reset your password, go to Settings > Change Password...",
    "text": "Alternative response format"
}
```

Error response:

```json
{
    "error": "Error message"
}
```

See [backend/server.js](../backend/server.js) for the AI endpoint stub.

## Styling & Customization

The assistant uses CSS custom properties for theming. Add to your CSS:

```css
/* Override assistant colors */
:root {
    --primary: #00A651;
    --bg: #fff;
    --text: #222;
    --card: #f4f4f4;
}

[data-theme="dark"] {
    --primary: #00A651;
    --bg: #070707;
    --text: #e6e6e6;
    --card: #0f0f0f;
}
```

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation (Tab, Enter, Escape)
- Focus management
- Respects `prefers-reduced-motion`

## Mobile Responsiveness

- Floating assistant adapts to mobile (full-screen on small devices)
- Embedded assistant scales responsively
- Touch-friendly buttons and inputs

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript required
- CSS Grid and Flexbox

## Troubleshooting

### Assistant not appearing?
- Check if container element exists with correct ID
- Verify CSS file is loaded
- Check browser console for errors

### Messages not sending?
- Verify `/api/ai` endpoint is working
- Check network tab in browser DevTools
- Ensure backend is running

### Styling issues?
- Import `assistant.css` **before** page-specific CSS
- Ensure CSS custom properties (--primary, --bg, etc.) are defined

## Files

- `frontend/global/assistant.js` - Core module
- `frontend/global/assistant.css` - Styles
- `frontend/auth/auth.html` - Auth page integration (example)
- `backend/server.js` - AI endpoint (`POST /api/ai`)
