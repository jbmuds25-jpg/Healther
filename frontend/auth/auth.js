/* ================= API CONFIGURATION ================= */
// Point directly to the Node auth server so POST requests hit the correct backend.
const API = "http://localhost:3000/api";

/* ================= HELPER FUNCTIONS ================= */
function showError(formType, message) {
    const errorEl = document.getElementById(`${formType}-error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
    }
}

function clearMessages() {
    document.querySelectorAll(".error").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });
}

function toggleForms(event) {
    event.preventDefault();
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const formTitle = document.getElementById("form-title");
    
    if (loginForm.classList.contains("hidden")) {
        // Switch to login
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        formTitle.textContent = "Log In";
    } else {
        // Switch to signup
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
        formTitle.textContent = "Sign Up";
    }
    clearMessages();
}

function showOtpModal(email) {
    window.location.href = "identity.html";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("hidden");
    }
}

// Make closeModal globally accessible for onclick handlers
window.closeModal = closeModal;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("hidden");
    }
}

/* ================= SETTINGS MODAL FUNCTIONALITY ================= */
function initSettingsModal() {
    const themeToggle = document.getElementById("theme-toggle");
    const settingsModal = document.getElementById("settings-modal");
    
    // Initialize theme toggle state
    if (themeToggle) {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        themeToggle.checked = currentTheme === "dark";
        
        themeToggle.addEventListener("change", (e) => {
            const newTheme = e.target.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            try {
                localStorage.setItem("theme", newTheme);
            } catch (err) {
                console.warn("Could not save theme preference:", err);
            }
        });
    }
    
    // Close modal when clicking outside
    if (settingsModal) {
        settingsModal.addEventListener("click", (e) => {
            if (e.target === settingsModal) {
                closeModal("settings-modal");
            }
        });
    }
}

/* ================= HELP MODAL FUNCTIONALITY ================= */
function initHelpModal() {
    const helpModal = document.getElementById("help-modal");
    
    // Close modal when clicking outside
    if (helpModal) {
        helpModal.addEventListener("click", (e) => {
            if (e.target === helpModal) {
                closeModal("help-modal");
            }
        });
    }
}

/* ================= CAPTCHA HELPER ================= */
function getCaptchaToken() {
    // Check if grecaptcha is available (Google reCAPTCHA)
    if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse) {
        const token = grecaptcha.getResponse();
        if (!token) {
            alert("Please complete the CAPTCHA");
            return null;
        }
        return token;
    }
    // If CAPTCHA is not loaded, return a dummy token for development
    // In production, you should require CAPTCHA
    console.warn("CAPTCHA not loaded - using dummy token for development");
    return "dummy-captcha-token";
}


/* ================= PASSWORD TOGGLE FUNCTIONALITY ================= */
function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (!input || !button) return;
    
    button.addEventListener('click', () => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Update icon
        const svg = button.querySelector('svg');
        if (svg) {
            if (type === 'text') {
                // Show "eye-off" icon
                svg.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                `;
            } else {
                // Show "eye" icon
                svg.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                `;
            }
        }
    });
}

/* ================= MENU FUNCTIONALITY ================= */
function initMenu() {
    const menuToggle = document.getElementById("menu-toggle");
    const menuDropdown = document.getElementById("menu-dropdown");
    const menuContainer = document.querySelector(".menu-container");
    const menuAi = document.getElementById("menu-ai");
    const menuSettings = document.getElementById("menu-settings");
    const menuHelp = document.getElementById("menu-help");
    
    if (!menuToggle || !menuDropdown) return;
    
    // Toggle menu dropdown
    menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle("show");
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (menuContainer && !menuContainer.contains(e.target)) {
            menuDropdown.classList.remove("show");
        }
    });
    
    // Handle menu item clicks
    if (menuAi) {
        menuAi.addEventListener("click", () => {
            alert("Healther AI Modifications - Coming soon!");
            menuDropdown.classList.remove("show");
        });
    }
    
    if (menuSettings) {
        menuSettings.addEventListener("click", () => {
            const settingsModal = document.getElementById("settings-modal");
            if (settingsModal) {
                settingsModal.classList.remove("hidden");
            }
            menuDropdown.classList.remove("show");
        });
    }
    
    if (menuHelp) {
        menuHelp.addEventListener("click", () => {
            const helpModal = document.getElementById("help-modal");
            if (helpModal) {
                helpModal.classList.remove("hidden");
            }
            menuDropdown.classList.remove("show");
        });
    }
}

/* ================= INITIALIZE ON DOM READY ================= */
function initAuth() {
    // Menu functionality
    initMenu();
    
    // Modal functionality
    initSettingsModal();
    initHelpModal();
    
    // Password toggle buttons
    togglePasswordVisibility('login-password', 'toggle-login-password');
    togglePasswordVisibility('signup-password', 'toggle-signup-password');
    togglePasswordVisibility('signup-confirm', 'toggle-signup-confirm');
    
    // Login form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

/* ================= LOGIN ================= */
async function handleLogin(e) {
    e.preventDefault();
    clearMessages();

    const credential = (document.getElementById("login-healtherid").value || "").trim();
    const password = document.getElementById("login-password").value;

    if (!credential || !password) {
        showError("login", "Please fill in Healther ID / Username / Email and Password.");
        return;
    }

    const captcha = getCaptchaToken();
    if (!captcha) return;

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Backend will look at either `email` or `username`.
                // For now we treat the login field as email (the same one used at signup),
                // but also send it as `username` for compatibility.
                email: credential,
                username: credential,
                password,
                captcha
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            // If response is not JSON, it might be an HTML error page
            if (!response.ok) {
                showError("login", `Server error: ${response.status} ${response.statusText}`);
                return;
            }
            throw new Error("Invalid response from server");
        }

        if (!response.ok) {
            showError("login", data.error || data.message || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "../citizen/citizen.html";

    } catch (err) {
        console.error("Login error:", err);
        if (err.message.includes("fetch")) {
            showError("login", "Network error: Could not connect to server. Please check your connection.");
        } else {
            showError("login", err.message || "An error occurred during login");
        }
    }
}

/* ================= SIGNUP ================= */
async function handleSignup(e) {
    e.preventDefault();
    clearMessages();

    const fullName = (document.getElementById("signup-fullname").value || "").trim();
    const email = (document.getElementById("signup-email").value || "").trim();
    const passwordInput = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm").value;
    const usernameInput = (document.getElementById("signup-username").value || "").trim();

    if (!fullName || !email || !passwordInput || !confirmPassword) {
        showError("signup", "Please fill in all fields.");
        return;
    }
    if (passwordInput !== confirmPassword) {
        showError("signup", "Passwords do not match");
        return;
    }
    if (passwordInput.length < 6) {
        showError("signup", "Password must be at least 6 characters.");
        return;
    }

    const username =
        usernameInput ||
        email.split("@")[0] ||
        fullName.toLowerCase().replace(/\s+/g, "");

    try {
        const response = await fetch(`${API}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Backend JSON auth uses `name`, `email`, `password`, `role`
                name: fullName,
                email,
                password: passwordInput,
                role: "patient",
                // extra fields are ignored by backend but kept for future compatibility
                username
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            // If response is not JSON, it might be an HTML error page
            if (!response.ok) {
                console.warn("Signup server error (non-JSON):", response.status, response.statusText);
                // In this environment, still proceed to identity selection
                showOtpModal(email);
                return;
            }
            throw new Error("Invalid response from server");
        }

        if (!response.ok) {
            console.warn("Signup failed response:", data);
            // Show error but still proceed to identity selection for demo/local usage
            showError("signup", data.error || data.message || "Signup failed, continuing to identity selection...");
            showOtpModal(email);
            return;
        }

        /* ===== SHOW OTP INPUT / IDENTITY SELECTION ===== */
        showOtpModal(email);

    } catch (err) {
        console.error("Signup error:", err);
        // For local/demo usage, still proceed to identity selection even if backend is down
        if (err.message && err.message.includes("fetch")) {
            showError("signup", "Network error: proceeding without server verification.");
        } else {
            showError("signup", err.message || "An error occurred during signup, proceeding anyway.");
        }
        showOtpModal(email);
    }
}
