"use strict";
/**
 * Mlab Cookie Policy Module
 *
 * @author Mlab Factory <info@mlabfactory.com>
 * TypeScript implementation for PrestaShop theme
 */
class MlabCookieBanner {
    constructor() {
        this.cookieName = 'mlab_cookie_preferences';
        // Scripts that should be blocked/unblocked based on cookie preferences
        this.cookieScripts = [
            { type: 'analytics', selector: 'script[data-cookie-type="analytics"]' },
            { type: 'marketing', selector: 'script[data-cookie-type="marketing"]' },
            { type: 'preferences', selector: 'script[data-cookie-type="preferences"]' }
        ];
        this.banner = document.getElementById('mlab-cookie-banner');
        this.modal = document.getElementById('cookie-modal');
        this.init();
    }
    init() {
        console.log('Cookie banner script loaded');
        if (!this.banner || !this.modal) {
            console.warn('Cookie banner elements not found');
            return;
        }
        console.log('DOM loaded for cookie banner');
        this.checkExistingPreferences();
        this.attachEventListeners();
    }
    getCookiePreferences() {
        const cookieString = `${this.cookieName}=`;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(cookieString) === 0) {
                try {
                    return JSON.parse(cookie.substring(cookieString.length));
                }
                catch (error) {
                    console.error('Error parsing cookie preferences:', error);
                    return null;
                }
            }
        }
        return null;
    }
    checkExistingPreferences() {
        const existingPreferences = this.getCookiePreferences();
        if (!existingPreferences && this.banner) {
            this.banner.style.display = 'block';
            // Block all non-necessary scripts by default until user makes a choice
            this.blockAllNonNecessaryScripts();
        }
        else if (this.banner) {
            this.banner.style.display = 'none';
            // Apply script blocking based on existing preferences
            if (existingPreferences) {
                this.applyScriptBlocking(existingPreferences);
            }
        }
    }
    blockAllNonNecessaryScripts() {
        // Block all scripts that require cookie consent
        this.cookieScripts.forEach(script => {
            const elements = document.querySelectorAll(script.selector);
            elements.forEach((element) => {
                const scriptElement = element;
                // Store original type and set to plain text to prevent execution
                scriptElement.dataset.originalType = scriptElement.type || 'text/javascript';
                scriptElement.type = 'text/plain';
            });
        });
    }
    applyScriptBlocking(preferences) {
        // Enable or disable scripts based on preferences
        this.cookieScripts.forEach(script => {
            const elements = document.querySelectorAll(script.selector);
            const isAllowed = preferences[script.type];
            elements.forEach((element) => {
                var _a;
                const scriptElement = element;
                if (isAllowed) {
                    // Enable script
                    const originalType = scriptElement.dataset.originalType || 'text/javascript';
                    scriptElement.type = originalType;
                    // If script was blocked, reload it
                    if (scriptElement.src && scriptElement.dataset.originalType) {
                        const newScript = document.createElement('script');
                        newScript.src = scriptElement.src;
                        newScript.type = originalType;
                        (_a = scriptElement.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newScript, scriptElement);
                    }
                }
                else {
                    // Block script
                    scriptElement.dataset.originalType = scriptElement.type || 'text/javascript';
                    scriptElement.type = 'text/plain';
                }
            });
        });
        // Remove cookies that are not allowed
        this.removeUnauthorizedCookies(preferences);
    }
    removeUnauthorizedCookies(preferences) {
        // Get all cookies
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            var _a;
            const parts = cookie.split('=');
            const cookieName = (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim();
            // Skip if cookie name is invalid
            if (!cookieName) {
                return;
            }
            // Skip our preference cookie
            if (cookieName === this.cookieName) {
                return;
            }
            // Define cookie patterns for each category
            // Customize these patterns based on your actual cookies
            const analyticsPatterns = ['_ga', '_gid', '_gat', 'analytics'];
            const marketingPatterns = ['_fbp', '_gcl', 'marketing', 'ads'];
            const preferencesPatterns = ['pref_', 'user_pref'];
            let shouldRemove = false;
            if (!preferences.analytics && analyticsPatterns.some(pattern => cookieName.includes(pattern))) {
                shouldRemove = true;
            }
            else if (!preferences.marketing && marketingPatterns.some(pattern => cookieName.includes(pattern))) {
                shouldRemove = true;
            }
            else if (!preferences.preferences && preferencesPatterns.some(pattern => cookieName.includes(pattern))) {
                shouldRemove = true;
            }
            if (shouldRemove) {
                // Remove cookie by setting expiry date in the past
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        });
    }
    saveCookiePreferences(preferences) {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `${this.cookieName}=${JSON.stringify(preferences)};expires=${expiryDate.toUTCString()};path=/`;
        if (this.banner) {
            this.banner.style.display = 'none';
        }
        // Apply script blocking based on new preferences
        this.applyScriptBlocking(preferences);
    }
    getCheckboxValue(id) {
        const checkbox = document.getElementById(id);
        return checkbox ? checkbox.checked : false;
    }
    acceptAll() {
        const preferences = {
            analytics: true,
            marketing: true,
            preferences: true,
            necessary: true
        };
        this.saveCookiePreferences(preferences);
        this.closeModal();
    }
    rejectAll() {
        // Salva preferenze con solo i cookie necessari accettati
        const preferences = {
            analytics: false,
            marketing: false,
            preferences: false,
            necessary: true
        };
        this.saveCookiePreferences(preferences);
        this.closeModal();
    }
    saveCustomPreferences() {
        const preferences = {
            analytics: this.getCheckboxValue('cookie-analytics'),
            marketing: this.getCheckboxValue('cookie-marketing'),
            preferences: this.getCheckboxValue('cookie-preferences'),
            necessary: true
        };
        this.saveCookiePreferences(preferences);
        this.closeModal();
    }
    openModal() {
        if (this.modal) {
            this.modal.style.display = 'block';
        }
    }
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
    attachEventListeners() {
        // Customize button
        const customizeBtn = document.getElementById('cookie-customize');
        customizeBtn === null || customizeBtn === void 0 ? void 0 : customizeBtn.addEventListener('click', () => this.openModal());
        // Close modal button
        const closeModalBtn = document.getElementById('cookie-modal-close');
        closeModalBtn === null || closeModalBtn === void 0 ? void 0 : closeModalBtn.addEventListener('click', () => this.closeModal());
        // Save preferences button
        const savePreferencesBtn = document.getElementById('cookie-save-preferences');
        savePreferencesBtn === null || savePreferencesBtn === void 0 ? void 0 : savePreferencesBtn.addEventListener('click', () => this.saveCustomPreferences());
        // Accept all buttons
        const acceptAllBtn = document.getElementById('cookie-accept-all');
        const acceptAllModalBtn = document.getElementById('cookie-accept-all-modal');
        acceptAllBtn === null || acceptAllBtn === void 0 ? void 0 : acceptAllBtn.addEventListener('click', () => this.acceptAll());
        acceptAllModalBtn === null || acceptAllModalBtn === void 0 ? void 0 : acceptAllModalBtn.addEventListener('click', () => this.acceptAll());
        // Reject button
        const rejectBtn = document.getElementById('cookie-reject');
        rejectBtn === null || rejectBtn === void 0 ? void 0 : rejectBtn.addEventListener('click', () => this.rejectAll());
        // Close modal by clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });
    }
}
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cookieBannerElement = document.getElementById('mlab-cookie-banner');
    if (cookieBannerElement) {
        new MlabCookieBanner();
    }
});
//# sourceMappingURL=cookie-policy.js.map