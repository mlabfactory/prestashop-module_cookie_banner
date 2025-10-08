/**
 * Mlab Cookie Policy Module
 * 
 * @author Mlab Factory <info@mlabfactory.com>
 * TypeScript implementation for PrestaShop theme
 */

interface CookiePreferences {
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    necessary: boolean;
}

interface CookieScript {
    type: 'analytics' | 'marketing' | 'preferences';
    selector: string;
}

class MlabCookieBanner {
    private banner: HTMLElement | null;
    private modal: HTMLElement | null;
    private readonly cookieName = 'mlab_cookie_preferences';
    
    // Scripts that should be blocked/unblocked based on cookie preferences
    private readonly cookieScripts: CookieScript[] = [
        { type: 'analytics', selector: 'script[data-cookie-type="analytics"]' },
        { type: 'marketing', selector: 'script[data-cookie-type="marketing"]' },
        { type: 'preferences', selector: 'script[data-cookie-type="preferences"]' }
    ];

    constructor() {
        this.banner = document.getElementById('mlab-cookie-banner');
        this.modal = document.getElementById('cookie-modal');
        this.init();
    }

    private init(): void {
        console.log('Cookie banner script loaded');
        
        if (!this.banner || !this.modal) {
            console.warn('Cookie banner elements not found');
            return;
        }

        console.log('DOM loaded for cookie banner');
        this.checkExistingPreferences();
        this.attachEventListeners();
    }

    private getCookiePreferences(): CookiePreferences | null {
        const cookieString = `${this.cookieName}=`;
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(cookieString) === 0) {
                try {
                    return JSON.parse(cookie.substring(cookieString.length));
                } catch (error) {
                    console.error('Error parsing cookie preferences:', error);
                    return null;
                }
            }
        }
        return null;
    }

    private checkExistingPreferences(): void {
        const existingPreferences = this.getCookiePreferences();
        if (!existingPreferences && this.banner) {
            this.banner.style.display = 'block';
            // Block all non-necessary scripts by default until user makes a choice
            this.blockAllNonNecessaryScripts();
        } else if (this.banner) {
            this.banner.style.display = 'none';
            // Apply script blocking based on existing preferences
            if (existingPreferences) {
                this.applyScriptBlocking(existingPreferences);
            }
        }
    }

    private blockAllNonNecessaryScripts(): void {
        // Block all scripts that require cookie consent
        this.cookieScripts.forEach(script => {
            const elements = document.querySelectorAll(script.selector);
            elements.forEach((element) => {
                const scriptElement = element as HTMLScriptElement;
                // Store original type and set to plain text to prevent execution
                scriptElement.dataset.originalType = scriptElement.type || 'text/javascript';
                scriptElement.type = 'text/plain';
            });
        });
    }

    private applyScriptBlocking(preferences: CookiePreferences): void {
        // Enable or disable scripts based on preferences
        this.cookieScripts.forEach(script => {
            const elements = document.querySelectorAll(script.selector);
            const isAllowed = preferences[script.type];
            
            elements.forEach((element) => {
                const scriptElement = element as HTMLScriptElement;
                
                if (isAllowed) {
                    // Enable script
                    const originalType = scriptElement.dataset.originalType || 'text/javascript';
                    scriptElement.type = originalType;
                    
                    // If script was blocked, reload it
                    if (scriptElement.src && scriptElement.dataset.originalType) {
                        const newScript = document.createElement('script');
                        newScript.src = scriptElement.src;
                        newScript.type = originalType;
                        scriptElement.parentNode?.replaceChild(newScript, scriptElement);
                    }
                } else {
                    // Block script
                    scriptElement.dataset.originalType = scriptElement.type || 'text/javascript';
                    scriptElement.type = 'text/plain';
                }
            });
        });

        // Remove cookies that are not allowed
        this.removeUnauthorizedCookies(preferences);
    }

    private removeUnauthorizedCookies(preferences: CookiePreferences): void {
        // Get all cookies
        const cookies = document.cookie.split(';');
        
        cookies.forEach(cookie => {
            const parts = cookie.split('=');
            const cookieName = parts[0]?.trim();
            
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
            } else if (!preferences.marketing && marketingPatterns.some(pattern => cookieName.includes(pattern))) {
                shouldRemove = true;
            } else if (!preferences.preferences && preferencesPatterns.some(pattern => cookieName.includes(pattern))) {
                shouldRemove = true;
            }
            
            if (shouldRemove) {
                // Remove cookie by setting expiry date in the past
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        });
    }

    private saveCookiePreferences(preferences: CookiePreferences): void {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        document.cookie = `${this.cookieName}=${JSON.stringify(preferences)};expires=${expiryDate.toUTCString()};path=/`;
        
        if (this.banner) {
            this.banner.style.display = 'none';
        }
        
        // Apply script blocking based on new preferences
        this.applyScriptBlocking(preferences);
    }

    private getCheckboxValue(id: string): boolean {
        const checkbox = document.getElementById(id) as HTMLInputElement;
        return checkbox ? checkbox.checked : false;
    }

    private acceptAll(): void {
        const preferences: CookiePreferences = {
            analytics: true,
            marketing: true,
            preferences: true,
            necessary: true
        };
        this.saveCookiePreferences(preferences);
        this.closeModal();
    }

    private rejectAll(): void {
        // Salva preferenze con solo i cookie necessari accettati
        const preferences: CookiePreferences = {
            analytics: false,
            marketing: false,
            preferences: false,
            necessary: true
        };
        this.saveCookiePreferences(preferences);
        this.closeModal();
    }

    private saveCustomPreferences(): void {
        const preferences: CookiePreferences = {
            analytics: this.getCheckboxValue('cookie-analytics'),
            marketing: this.getCheckboxValue('cookie-marketing'),
            preferences: this.getCheckboxValue('cookie-preferences'),
            necessary: true
        };
        this.saveCookiePreferences(preferences);
        this.closeModal();
    }

    private openModal(): void {
        if (this.modal) {
            this.modal.style.display = 'block';
        }
    }

    private closeModal(): void {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    private attachEventListeners(): void {
        // Customize button
        const customizeBtn = document.getElementById('cookie-customize');
        customizeBtn?.addEventListener('click', () => this.openModal());

        // Close modal button
        const closeModalBtn = document.getElementById('cookie-modal-close');
        closeModalBtn?.addEventListener('click', () => this.closeModal());

        // Save preferences button
        const savePreferencesBtn = document.getElementById('cookie-save-preferences');
        savePreferencesBtn?.addEventListener('click', () => this.saveCustomPreferences());

        // Accept all buttons
        const acceptAllBtn = document.getElementById('cookie-accept-all');
        const acceptAllModalBtn = document.getElementById('cookie-accept-all-modal');
        
        acceptAllBtn?.addEventListener('click', () => this.acceptAll());
        acceptAllModalBtn?.addEventListener('click', () => this.acceptAll());

        // Reject button
        const rejectBtn = document.getElementById('cookie-reject');
        rejectBtn?.addEventListener('click', () => this.rejectAll());

        // Close modal by clicking outside
        window.addEventListener('click', (event: MouseEvent) => {
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