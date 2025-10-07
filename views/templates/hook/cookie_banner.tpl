{**
 * Dolce & Zampa Cookie Policy Banner
 * Template per il banner dei cookie in fondo alla pagina
 *}

{* Debug info *}
<!-- Cookie Banner Debug: Template loaded -->

<style>
    .dolcezampa-cookie-banner {
        display: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: white;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        padding: 15px;
    }
</style>

<div id="dolcezampa-cookie-banner" class="dolcezampa-cookie-banner">
    <div class="cookie-banner-container">
        <div class="cookie-content">
            <div class="cookie-icon">
                🍪
            </div>
            <div class="cookie-text">
                <h4 class="cookie-title">🐾 Cookie e Privacy</h4>
                <p class="cookie-description">
                    {$description}
                    <a href="{$privacy_url|default:'/privacy-policy'}" target="_blank" class="cookie-link">Informativa Privacy</a> 
                    e <a href="{$cookie_url|default:'/cookie-policy'}" target="_blank" class="cookie-link">Cookie Policy</a>.
                </p>
            </div>
        </div>
        
        <div class="cookie-actions">
            <button type="button" id="cookie-accept-all" class="btn-cookie btn-accept">
                ✅ Accetta Tutti
            </button>
            <button type="button" id="cookie-customize" class="btn-cookie btn-customize">
                ⚙️ Personalizza
            </button>
            <button type="button" id="cookie-reject" class="btn-cookie btn-reject">
                ❌ Rifiuta
            </button>
        </div>
        
    </div>
    
    {* Modal per personalizzazione cookie *}
    <div id="cookie-modal" class="cookie-modal" style="display: none;">
        <div class="cookie-modal-content">
            <div class="cookie-modal-header">
                <h3>🍪 Gestione Cookie</h3>
                <button type="button" id="cookie-modal-close" class="cookie-close">×</button>
            </div>
            
            <div class="cookie-modal-body">
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="cookie-necessary" checked disabled>
                        <label for="cookie-necessary">
                            <strong>Cookie Necessari</strong>
                            <span class="cookie-required">(Obbligatori)</span>
                        </label>
                    </div>
                    <p class="cookie-category-desc">
                        {$cookie_needed_description}
                    </p>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="cookie-analytics" value="analytics">
                        <label for="cookie-analytics">
                            <strong>Cookie Analitici</strong>
                        </label>
                    </div>
                    <p class="cookie-category-desc">
                        {$cookie_analytics_description}
                    </p>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="cookie-marketing" value="marketing">
                        <label for="cookie-marketing">
                            <strong>Cookie Marketing</strong>
                        </label>
                    </div>
                    <p class="cookie-category-desc">
                        {$cookie_marketing_description}
                    </p>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="cookie-preferences" value="preferences">
                        <label for="cookie-preferences">
                            <strong>Cookie Preferenze</strong>
                        </label>
                    </div>
                    <p class="cookie-category-desc">
                        {$cookie_custom_description}
                    </p>
                </div>
            </div>
            
            <div class="cookie-modal-footer">
                <button type="button" id="cookie-save-preferences" class="btn-cookie btn-accept">
                    💾 Salva Preferenze
                </button>
                <button type="button" id="cookie-accept-all-modal" class="btn-cookie btn-customize">
                    ✅ Accetta Tutti
                </button>
            </div>
        </div>
    </div>
</div>

<script>
{literal}
    console.log('Cookie banner script loaded');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded for cookie banner');
        const banner = document.getElementById('dolcezampa-cookie-banner');
        const modal = document.getElementById('cookie-modal');

        // Funzione per verificare se il cookie esiste
        function getCookiePreferences() {
            const cookieName = 'dolcezampa_cookie_preferences=';
            const cookies = document.cookie.split(';');
            for(let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.indexOf(cookieName) === 0) {
                    return JSON.parse(cookie.substring(cookieName.length));
                }
            }
            return null;
        }

        // Controlla se il cookie esiste già
        const existingPreferences = getCookiePreferences();
        if (!existingPreferences) {
            banner.style.display = 'block';
        } else {
            banner.style.display = 'none';
        }

        // Gestione apertura/chiusura modal
        document.getElementById('cookie-customize').addEventListener('click', () => {
            modal.style.display = 'block';
        });
        
        document.getElementById('cookie-modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Funzione per salvare il cookie tecnico
        function saveCookiePreferences(preferences) {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            document.cookie = `dolcezampa_cookie_preferences=${JSON.stringify(preferences)};expires=${expiryDate.toUTCString()};path=/`;
            banner.style.display = 'none';
        }

        // Gestione salvataggio preferenze
        document.getElementById('cookie-save-preferences').addEventListener('click', () => {
            const preferences = {
                analytics: document.getElementById('cookie-analytics').checked,
                marketing: document.getElementById('cookie-marketing').checked,
                preferences: document.getElementById('cookie-preferences').checked,
                necessary: true
            };
            saveCookiePreferences(preferences);
            modal.style.display = 'none';
        });

        // Funzione corretta per accettare tutti i cookie
        function acceptAll() {
            const preferences = {
                analytics: true,
                marketing: true,
                preferences: true,
                necessary: true
            };
            saveCookiePreferences(preferences);
            modal.style.display = 'none';
        }

        // Gestione accetta tutti
        document.getElementById('cookie-accept-all').addEventListener('click', acceptAll);
        document.getElementById('cookie-accept-all-modal').addEventListener('click', acceptAll);

        // Gestione rifiuta tutti
        document.getElementById('cookie-reject').addEventListener('click', () => {
            const preferences = {
                analytics: false,
                marketing: false,
                preferences: false,
                necessary: true
            };
            saveCookiePreferences(preferences);
        });

        // Chiudi modal cliccando fuori
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
{/literal}
</script>