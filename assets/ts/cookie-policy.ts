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
    policyVersion: string;
    consentId: string;
}

interface CookieScript {
    type: 'analytics' | 'marketing' | 'preferences';
    selector: string;
}

interface MlabCookieConfig {
    policyVersion: string;
    ajaxUrl: string;
    durationDays: number;
}

declare const mlabCookieConfig: MlabCookieConfig;

class MlabCookieBanner {
    private banner: HTMLElement | null;
    private modal: HTMLElement | null;
    private floatingBtn: HTMLElement | null;
    private readonly cookieName = 'mlab_cookie_preferences';

    private readonly cookieScripts: CookieScript[] = [
        { type: 'analytics', selector: 'script[data-cookie-type="analytics"]' },
        { type: 'marketing', selector: 'script[data-cookie-type="marketing"]' },
        { type: 'preferences', selector: 'script[data-cookie-type="preferences"]' }
    ];

    constructor() {
        this.banner = document.getElementById('mlab-cookie-banner');
        this.modal = document.getElementById('cookie-modal');
        this.floatingBtn = document.getElementById('mlab-cookie-settings-btn');
        this.init();
    }

    private getConfig(): MlabCookieConfig {
        const cfg = (typeof mlabCookieConfig !== 'undefined') ? mlabCookieConfig : null;
        return {
            policyVersion: cfg?.policyVersion ?? '1.0',
            ajaxUrl: cfg?.ajaxUrl ?? '',
            durationDays: cfg?.durationDays ?? 365,
        };
    }

    private init(): void {
        if (!this.banner || !this.modal) {
            console.warn('Cookie banner elements not found');
            return;
        }
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
                    return JSON.parse(decodeURIComponent(cookie.substring(cookieString.length)));
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    /** Controlla se il consenso salvato è ancora valido per la versione policy corrente. */
    private checkExistingPreferences(): void {
        const existing = this.getCookiePreferences();
        const currentVersion = this.getConfig().policyVersion;

        const isExpired = existing && existing.policyVersion !== currentVersion;

        if (!existing || isExpired) {
            if (isExpired) {
                this.clearPreferenceCookie();
            }
            this.showBanner();
            this.blockAllNonNecessaryScripts();
        } else {
            this.hideBanner();
            this.showFloatingBtn();
            this.applyScriptBlocking(existing);
        }
    }

    private showBanner(): void {
        if (this.banner) this.banner.style.display = 'block';
        if (this.floatingBtn) this.floatingBtn.style.display = 'none';
    }

    private hideBanner(): void {
        if (this.banner) this.banner.style.display = 'none';
    }

    private showFloatingBtn(): void {
        if (this.floatingBtn) this.floatingBtn.style.display = 'flex';
    }

    private blockAllNonNecessaryScripts(): void {
        this.cookieScripts.forEach(script => {
            document.querySelectorAll<HTMLScriptElement>(script.selector).forEach(el => {
                el.dataset.originalType = el.type || 'text/javascript';
                el.type = 'text/plain';
            });
        });
    }

    private applyScriptBlocking(preferences: CookiePreferences): void {
        this.cookieScripts.forEach(script => {
            const allowed = preferences[script.type];
            document.querySelectorAll<HTMLScriptElement>(script.selector).forEach(el => {
                if (allowed) {
                    const originalType = el.dataset.originalType || 'text/javascript';
                    el.type = originalType;
                    if (el.src && el.dataset.originalType) {
                        const newScript = document.createElement('script');
                        newScript.src = el.src;
                        newScript.type = originalType;
                        el.parentNode?.replaceChild(newScript, el);
                    }
                } else {
                    el.dataset.originalType = el.type || 'text/javascript';
                    el.type = 'text/plain';
                }
            });
        });

        this.removeUnauthorizedCookies(preferences);
    }

    private removeUnauthorizedCookies(preferences: CookiePreferences): void {
        const analyticsPatterns = ['_ga', '_gid', '_gat', 'analytics'];
        const marketingPatterns = ['_fbp', '_gcl', 'marketing', 'ads'];
        const preferencesPatterns = ['pref_', 'user_pref'];

        document.cookie.split(';').forEach(raw => {
            const name = raw.split('=')[0]?.trim();
            if (!name || name === this.cookieName) return;

            let remove = false;
            if (!preferences.analytics && analyticsPatterns.some(p => name.includes(p))) remove = true;
            else if (!preferences.marketing && marketingPatterns.some(p => name.includes(p))) remove = true;
            else if (!preferences.preferences && preferencesPatterns.some(p => name.includes(p))) remove = true;

            if (remove) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        });
    }

    private saveCookiePreferences(preferences: CookiePreferences): void {
        const days = this.getConfig().durationDays;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);

        document.cookie = `${this.cookieName}=${encodeURIComponent(JSON.stringify(preferences))};expires=${expiry.toUTCString()};path=/;SameSite=Lax`;

        this.hideBanner();
        this.showFloatingBtn();
        this.applyScriptBlocking(preferences);
    }

    private generateUuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    private clearPreferenceCookie(): void {
        document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    /** Invia il consenso al server per il logging server-side (audit trail GDPR). */
    private logConsent(action: string, preferences: CookiePreferences): void {
        const { ajaxUrl } = this.getConfig();
        if (!ajaxUrl) return;

        fetch(ajaxUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                consent_id: preferences.consentId,
                policy_version: preferences.policyVersion,
                action,
                preferences: {
                    analytics: preferences.analytics,
                    marketing: preferences.marketing,
                    preferences: preferences.preferences,
                },
            }),
        }).catch(() => {
            // Il consenso è già salvato lato client; il log server-side è best-effort
        });
    }

    private buildPreferences(analytics: boolean, marketing: boolean, prefs: boolean): CookiePreferences {
        return {
            analytics,
            marketing,
            preferences: prefs,
            necessary: true,
            policyVersion: this.getConfig().policyVersion,
            consentId: this.generateUuid(),
        };
    }

    private acceptAll(): void {
        const preferences = this.buildPreferences(true, true, true);
        this.saveCookiePreferences(preferences);
        this.logConsent('accept_all', preferences);
        this.closeModal();
    }

    private rejectAll(): void {
        const preferences = this.buildPreferences(false, false, false);
        this.saveCookiePreferences(preferences);
        this.logConsent('reject_all', preferences);
        this.closeModal();
    }

    private saveCustomPreferences(): void {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.checked ?? false;
        const preferences = this.buildPreferences(get('cookie-analytics'), get('cookie-marketing'), get('cookie-preferences'));
        this.saveCookiePreferences(preferences);
        this.logConsent('custom', preferences);
        this.closeModal();
    }

    /** Sincronizza le checkbox del modal con le preferenze attualmente salvate. */
    private syncModalCheckboxes(): void {
        const existing = this.getCookiePreferences();
        const set = (id: string, val: boolean) => {
            const el = document.getElementById(id) as HTMLInputElement | null;
            if (el) el.checked = val;
        };
        set('cookie-analytics', existing?.analytics ?? false);
        set('cookie-marketing', existing?.marketing ?? false);
        set('cookie-preferences', existing?.preferences ?? false);
    }

    private openModal(): void {
        this.syncModalCheckboxes();
        if (this.modal) this.modal.style.display = 'flex';
    }

    private closeModal(): void {
        if (this.modal) this.modal.style.display = 'none';
    }

    private attachEventListeners(): void {
        document.getElementById('cookie-customize')?.addEventListener('click', () => this.openModal());
        document.getElementById('cookie-modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cookie-save-preferences')?.addEventListener('click', () => this.saveCustomPreferences());
        document.getElementById('cookie-reject-modal')?.addEventListener('click', () => this.rejectAll());
        document.getElementById('cookie-accept-all')?.addEventListener('click', () => this.acceptAll());
        document.getElementById('cookie-accept-all-modal')?.addEventListener('click', () => this.acceptAll());
        document.getElementById('cookie-reject')?.addEventListener('click', () => this.rejectAll());

        // Floating button apre direttamente il modal
        this.floatingBtn?.addEventListener('click', () => this.openModal());

        // Chiudi modal cliccando fuori
        window.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.modal) this.closeModal();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mlab-cookie-banner')) {
        new MlabCookieBanner();
    }
});