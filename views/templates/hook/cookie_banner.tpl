{**
 * Mlab Cookie Policy Banner
 * Template per il banner dei cookie in fondo alla pagina
 *}

{* Configurazione globale per il JavaScript *}
<script>
    window.mlabCookieConfig = {$cookie_js_config nofilter};
</script>

{* ── Main Banner ─────────────────────────────────────────── *}
<div id="mlab-cookie-banner" class="mlab-cookie-banner">
    <div class="cookie-banner-container">
        <div class="cookie-content">
            <div class="cookie-icon">🍪</div>
            <div class="cookie-text">
                <h4 class="cookie-title">🐾 Cookie e Privacy</h4>
                <p class="cookie-description">
                    {$description}
                    <a href="{$privacy_url|default:'/privacy-policy'}" target="_blank" class="cookie-link">Informativa Privacy</a>
                    e <a href="{$cookie_url|default:'/cookie-policy'}" target="_blank" class="cookie-link">Cookie Policy</a>.
                </p>
                <p class="cookie-duration-notice">
                    Le tue preferenze verranno ricordate per <strong>{$duration_days} giorni</strong>.
                </p>
                {if $controller_name || $controller_email}
                <p class="cookie-controller-info">
                    Titolare del trattamento:
                    {if $controller_name}<strong>{$controller_name|escape:'html':'UTF-8'}</strong>{/if}
                    {if $controller_name && $controller_email} — {/if}
                    {if $controller_email}<a href="mailto:{$controller_email|escape:'html':'UTF-8'}" class="cookie-link">{$controller_email|escape:'html':'UTF-8'}</a>{/if}
                </p>
                {/if}
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
</div>

{* ── Modal personalizzazione (separato dal banner) ───────── *}
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
                        <strong>🔒 Cookie Necessari</strong>
                        <span class="cookie-required">(Sempre attivi)</span>
                    </label>
                </div>
                <p class="cookie-category-desc">{$cookie_needed_description}</p>
            </div>

            <div class="cookie-category">
                <div class="cookie-category-header">
                    <input type="checkbox" id="cookie-analytics" value="analytics">
                    <label for="cookie-analytics"><strong>📊 Cookie Analitici</strong></label>
                </div>
                <p class="cookie-category-desc">{$cookie_analytics_description}</p>
            </div>

            <div class="cookie-category">
                <div class="cookie-category-header">
                    <input type="checkbox" id="cookie-marketing" value="marketing">
                    <label for="cookie-marketing"><strong>📢 Cookie Marketing</strong></label>
                </div>
                <p class="cookie-category-desc">{$cookie_marketing_description}</p>
            </div>

            <div class="cookie-category">
                <div class="cookie-category-header">
                    <input type="checkbox" id="cookie-preferences" value="preferences">
                    <label for="cookie-preferences"><strong>⚙️ Cookie Preferenze</strong></label>
                </div>
                <p class="cookie-category-desc">{$cookie_custom_description}</p>
            </div>
        </div>

        <div class="cookie-modal-footer">
            <button type="button" id="cookie-reject-modal" class="btn-cookie btn-reject">
                ❌ Rifiuta tutti
            </button>
            <button type="button" id="cookie-save-preferences" class="btn-cookie btn-accept">
                💾 Salva Preferenze
            </button>
            <button type="button" id="cookie-accept-all-modal" class="btn-cookie btn-customize">
                ✅ Accetta Tutti
            </button>
        </div>
    </div>
</div>

{* ── Floating button (visibile solo dopo il consenso) ────── *}
<button type="button" id="mlab-cookie-settings-btn" class="mlab-cookie-settings-btn" style="display:none;" title="Gestione preferenze cookie" aria-label="Gestione preferenze cookie">
    🍪
</button>

