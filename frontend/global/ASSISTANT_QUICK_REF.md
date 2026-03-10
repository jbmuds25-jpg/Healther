# Healther Assistant - Quick Reference

## 📦 Files

- `frontend/global/assistant.js` - Core module (required)
- `frontend/global/assistant.css` - Styles (required)
- `frontend/global/assistant-config.js` - Configuration (optional)
- `frontend/global/ASSISTANT_README.md` - Full documentation

## 🚀 3-Step Setup

### 1. Add CSS
```html
<link rel="stylesheet" href="../global/assistant.css">
```

### 2. Add HTML Container
```html
<div id="healther-assistant"></div>
```

### 3. Initialize
```html
<script src="../global/assistant.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        HaealtherAssistant.init({
            containerId: 'healther-assistant',
            position: 'embedded' // or 'floating'
        });
    });
</script>
```

## 📍 Modes

| Mode | Use Case | Example |
|------|----------|---------|
| **embedded** | Fixed assistant in page | Modal, Help section, Sidebar |
| **floating** | Popup that can be minimized | Home pages, Dashboard |

## 🎯 Example Setups

### Help Modal (Auth)
```js
HaealtherAssistant.init({
    containerId: 'auth-assistant',
    position: 'embedded',
    title: 'Healther Assistant'
});
```

### Floating on Dashboard
```js
HaealtherAssistant.init({
    containerId: 'citizen-assistant',
    position: 'floating',
    autoOpen: false
});
```

### Sidebar Widget
```js
HaealtherAssistant.init({
    containerId: 'doctor-assistant',
    position: 'embedded',
    title: 'Doctor Support'
});
```

## 🎨 Customization

```js
HaealtherAssistant.init({
    containerId: 'my-assistant',
    position: 'floating',
    title: 'Custom Title',
    subtitle: 'Custom subtitle',
    apiEndpoint: '/api/ai',
    autoOpen: false,
    debug: false,
    onError: (error) => console.error(error)
});
```

## 🔧 Methods

```js
const assistant = HaealtherAssistant.getInstance();

// Chat control
assistant.addMessage(text, sender);  // 'user', 'bot', 'error'
assistant.clear();
assistant.sendMessage(message);

// For floating mode
assistant.open();
assistant.close();
assistant.toggle();
```

## 🌐 Integration Status

| Page | Status | Position | Container |
|------|--------|----------|-----------|
| Auth | ✅ Done | embedded | #auth-assistant |
| Citizen | ✅ Done | floating | #citizen-assistant |
| Doctor | ✅ Done | embedded | #doctor-assistant |
| Scientist | ✅ Done | floating | #scientist-assistant |
| Hospital | ⏳ Ready | floating | #hospital-assistant |
| Management | ⏳ Ready | floating | #management-assistant |

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Not showing | Check container ID exists, CSS loaded |
| Messages not sending | Verify `/api/ai` endpoint works |
| Styling broken | Ensure CSS imported before page CSS |
| Mobile layout broken | Floating mode auto-adapts; check viewport |

## 📝 Current Integrations

✅ **Auth Page** (`auth.html`)
- Embedded in help modal
- Initialized on "Help" button click

✅ **Citizen Dashboard** (`citizen.html`)
- Floating assistant
- Open/close toggle

✅ **Doctor Dashboard** (`doctor.html`)
- Embedded in dashboard
- Always visible

✅ **Scientist Dashboard** (`scientist.html`)
- Floating assistant
- Open/close toggle

## 🔜 Next Steps

- [ ] Add Hospital and Management pages
- [ ] Implement real AI backend
- [ ] Add message persistence
- [ ] Multi-language support
- [ ] Analytics/logging
- [ ] Customizable themes

## 💡 Tips

1. **Use `position: 'floating'`** for pages where space is limited
2. **Use `position: 'embedded'`** for dedicated help areas
3. **Set `autoOpen: true`** only for help/onboarding flows
4. **Enable `debug: true`** to see console logs during development
5. **Handle `onError`** callback to track issues

## 📖 Full Documentation

See [ASSISTANT_README.md](./ASSISTANT_README.md) for complete API documentation and advanced usage patterns.
