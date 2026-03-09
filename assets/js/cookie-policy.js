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
        this.cookieScripts = [
            { type: 'analytics', selector: 'script[data-cookie-type="analytics"]' },
            { type: 'marketing', selector: 'script[data-cookie-type="marketing"]' },
            { type: 'preferences', selector: 'script[data-cookie-type="preferences"]' }
        ];
        this.banner = document.getElementById('mlab-cookie-banner');
        this.modal = document.getElementById('cookie-modal');
        this.floatingBtn = document.getElementById('mlab-cookie-settings-btn');
        this.init();
    }
    getConfig() {
        var _a, _b, _c;
        const cfg = (typeof mlabCookieConfig !== 'undefined') ? mlabCookieConfig : null;
        return {
            policyVersion: (_a = cfg === null || cfg === void 0 ? void 0 : cfg.policyVersion) !== null && _a !== void 0 ? _a : '1.0',
            ajaxUrl: (_b = cfg === null || cfg === void 0 ? void 0 : cfg.ajaxUrl) !== null && _b !== void 0 ? _b : '',
            durationDays: (_c = cfg === null || cfg === void 0 ? void 0 : cfg.durationDays) !== null && _c !== void 0 ? _c : 365,
        };
    }
    init() {
        if (!this.banner || !this.modal) {
            console.warn('Cookie banner elements not found');
            return;
        }
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
                    return JSON.parse(decodeURIComponent(cookie.substring(cookieString.length)));
                }
                catch (_a) {
                    return null;
                }
            }
        }
        return null;
    }
    /** Controlla se il consenso salvato è ancora valido per la versione policy corrente. */
    checkExistingPreferences() {
        const existing = this.getCookiePreferences();
        const currentVersion = this.getConfig().policyVersion;
        const isExpired = existing && existing.policyVersion !== currentVersion;
        if (!existing || isExpired) {
            if (isExpired) {
                this.clearPreferenceCookie();
            }
            this.showBanner();
            this.blockAllNonNecessaryScripts();
        }
        else {
            this.hideBanner();
            this.showFloatingBtn();
            this.applyScriptBlocking(existing);
        }
    }
    showBanner() {
        if (this.banner)
            this.banner.style.display = 'block';
        if (this.floatingBtn)
            this.floatingBtn.style.display = 'none';
    }
    hideBanner() {
        if (this.banner)
            this.banner.style.display = 'none';
    }
    showFloatingBtn() {
        if (this.floatingBtn)
            this.floatingBtn.style.display = 'flex';
    }
    blockAllNonNecessaryScripts() {
        this.cookieScripts.forEach(script => {
            document.querySelectorAll(script.selector).forEach(el => {
                el.dataset.originalType = el.type || 'text/javascript';
                el.type = 'text/plain';
            });
        });
    }
    applyScriptBlocking(preferences) {
        this.cookieScripts.forEach(script => {
            const allowed = preferences[script.type];
            document.querySelectorAll(script.selector).forEach(el => {
                var _a;
                if (allowed) {
                    const originalType = el.dataset.originalType || 'text/javascript';
                    el.type = originalType;
                    if (el.src && el.dataset.originalType) {
                        const newScript = document.createElement('script');
                        newScript.src = el.src;
                        newScript.type = originalType;
                        (_a = el.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newScript, el);
                    }
                }
                else {
                    el.dataset.originalType = el.type || 'text/javascript';
                    el.type = 'text/plain';
                }
            });
        });
        this.removeUnauthorizedCookies(preferences);
    }
    removeUnauthorizedCookies(preferences) {
        const analyticsPatterns = ['_ga', '_gid', '_gat', 'analytics'];
        const marketingPatterns = ['_fbp', '_gcl', 'marketing', 'ads'];
        const preferencesPatterns = ['pref_', 'user_pref'];
        document.cookie.split(';').forEach(raw => {
            var _a;
            const name = (_a = raw.split('=')[0]) === null || _a === void 0 ? void 0 : _a.trim();
            if (!name || name === this.cookieName)
                return;
            let remove = false;
            if (!preferences.analytics && analyticsPatterns.some(p => name.includes(p)))
                remove = true;
            else if (!preferences.marketing && marketingPatterns.some(p => name.includes(p)))
                remove = true;
            else if (!preferences.preferences && preferencesPatterns.some(p => name.includes(p)))
                remove = true;
            if (remove) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        });
    }
    saveCookiePreferences(preferences) {
        const days = this.getConfig().durationDays;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        document.cookie = `${this.cookieName}=${encodeURIComponent(JSON.stringify(preferences))};expires=${expiry.toUTCString()};path=/;SameSite=Lax`;
        this.hideBanner();
        this.showFloatingBtn();
        this.applyScriptBlocking(preferences);
    }
    generateUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    clearPreferenceCookie() {
        document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    /** Invia il consenso al server per il logging server-side (audit trail GDPR). */
    logConsent(action, preferences) {
        const { ajaxUrl } = this.getConfig();
        if (!ajaxUrl)
            return;
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
    buildPreferences(analytics, marketing, prefs) {
        return {
            analytics,
            marketing,
            preferences: prefs,
            necessary: true,
            policyVersion: this.getConfig().policyVersion,
            consentId: this.generateUuid(),
        };
    }
    acceptAll() {
        const preferences = this.buildPreferences(true, true, true);
        this.saveCookiePreferences(preferences);
        this.logConsent('accept_all', preferences);
        this.closeModal();
    }
    rejectAll() {
        const preferences = this.buildPreferences(false, false, false);
        this.saveCookiePreferences(preferences);
        this.logConsent('reject_all', preferences);
        this.closeModal();
    }
    saveCustomPreferences() {
        const get = (id) => { var _a, _b; return (_b = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false; };
        const preferences = this.buildPreferences(get('cookie-analytics'), get('cookie-marketing'), get('cookie-preferences'));
        this.saveCookiePreferences(preferences);
        this.logConsent('custom', preferences);
        this.closeModal();
    }
    /** Sincronizza le checkbox del modal con le preferenze attualmente salvate. */
    syncModalCheckboxes() {
        var _a, _b, _c;
        const existing = this.getCookiePreferences();
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el)
                el.checked = val;
        };
        set('cookie-analytics', (_a = existing === null || existing === void 0 ? void 0 : existing.analytics) !== null && _a !== void 0 ? _a : false);
        set('cookie-marketing', (_b = existing === null || existing === void 0 ? void 0 : existing.marketing) !== null && _b !== void 0 ? _b : false);
        set('cookie-preferences', (_c = existing === null || existing === void 0 ? void 0 : existing.preferences) !== null && _c !== void 0 ? _c : false);
    }
    openModal() {
        this.syncModalCheckboxes();
        if (this.modal)
            this.modal.style.display = 'flex';
    }
    closeModal() {
        if (this.modal)
            this.modal.style.display = 'none';
    }
    attachEventListeners() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        (_a = document.getElementById('cookie-customize')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.openModal());
        (_b = document.getElementById('cookie-modal-close')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.closeModal());
        (_c = document.getElementById('cookie-save-preferences')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.saveCustomPreferences());
        (_d = document.getElementById('cookie-reject-modal')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.rejectAll());
        (_e = document.getElementById('cookie-accept-all')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => this.acceptAll());
        (_f = document.getElementById('cookie-accept-all-modal')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => this.acceptAll());
        (_g = document.getElementById('cookie-reject')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => this.rejectAll());
        // Floating button apre direttamente il modal
        (_h = this.floatingBtn) === null || _h === void 0 ? void 0 : _h.addEventListener('click', () => this.openModal());
        // Chiudi modal cliccando fuori
        window.addEventListener('click', (e) => {
            if (e.target === this.modal)
                this.closeModal();
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mlab-cookie-banner')) {
        new MlabCookieBanner();
    }
});
//# sourceMappingURL=cookie-policy.js.map