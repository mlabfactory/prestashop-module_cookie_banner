<?php

namespace Dolcezampa\CookiePolicyModule\Controllers;

// Rimuoviamo temporaneamente i use delle classi mancanti
// use Dolcezampa\CookiePolicyModule\Objects\CookieTabConfiguration;
// use Dolcezampa\CookiePolicyModule\Objects\ModuleConfigurations;

class ModuleController
{
    private \Context $context;
    private string $moduleName = 'dolcezampa_cookie_policy';
    private \Module $module;
    private string $modulePath;
    

    public function __construct(\Module $module, string $moduleName, string $modulePath)
    {
        $this->context = \Context::getContext();
        $this->module = $module;
        $this->moduleName = $moduleName;
        $this->modulePath = $modulePath;
    }

    public function displayCookieBanner()
    {
        return $this->renderTemplate('cookie_banner.tpl');
    }

    /**
     * Genera il form di configurazione
     */
    private function displayConfigurationForm(): string
    {
        $form = [
            'form' => [
                'legend' => [
                    'title' => $this->module->l('Configurazione Cookie Policy'),
                    'icon' => 'icon-cogs'
                ],
                'description' => $this->description(),
                'input' => $this->getConfigurationFields(),
                'submit' => [
                    'title' => $this->module->l('Salva'),
                    'class' => 'btn btn-default pull-right'
                ]
            ]
        ];

        $helper = new \HelperForm();
        $helper->show_toolbar = false;
        $helper->table = $this->moduleName;
        $helper->default_form_language = $this->context->language->id;
        $helper->allow_employee_form_lang = \Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG', 0);

        $helper->identifier = 'id_configuration';
        $helper->submit_action = 'submit' . $this->moduleName;
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false)
            . '&configure=' . $this->moduleName . '&tab_module=front_office_features&module_name=' . $this->moduleName;
        $helper->token = \Tools::getAdminTokenLite('AdminModules');

        // Usa configurazioni semplici invece delle classi
        $currentValues = [];
        foreach ($this->getConfigurationFields() as $field) {
            if (isset($field['name'])) {
                $currentValues[$field['name']] = \Configuration::get($field['name'], '');
            }
        }

        $helper->tpl_vars = [
            'fields_value' => $currentValues,
            'languages' => $this->context->controller->getLanguages(),
            'id_language' => $this->context->language->id,
        ];

        return $helper->generateForm([$form]);
    }

    /**
     * Configurazioni disponibili per il widget
     */
    public function getConfigurationFields(): array
    {
        // Definiamo le configurazioni direttamente invece di usare le classi
        return [
            [
                'type' => 'text',
                'label' => $this->module->l('Url pagina Privacy Policy'),
                'name' => 'COOKIE_URL_PRIVACY_POLICY',
                'class' => 'fixed-width-m',
                'required' => false
            ],
            [
                'type' => 'text',
                'label' => $this->module->l('Url pagina Cookie Policy'),
                'name' => 'COOKIE_URL_COOKIE_POLICY',
                'class' => 'fixed-width-m',
                'required' => false
            ],
            [
                'type' => 'textarea',
                'label' => $this->module->l('Messaggio banner'),
                'name' => 'COOKIE_DESCRIPTION_COOKIE_POLICY',
                'class' => 'fixed-width-m',
                'required' => false
            ],
            [
                'type' => 'text',
                'label' => $this->module->l('Descrizione cookie di analisi'),
                'name' => 'COOKIE_DESCRIPTION_COOKIE_ANALYTICS',
                'class' => 'fixed-width-m',
                'required' => false
            ],
            [
                'type' => 'text',
                'label' => $this->module->l('Descrizione cookie di marketing'),
                'name' => 'COOKIE_DESCRIPTION_COOKIE_MARKETING',
                'class' => 'fixed-width-m',
                'required' => false
            ],
            [
                'type' => 'text',
                'label' => $this->module->l('Descrizione cookie necessari'),
                'name' => 'COOKIE_DESCRIPTION_COOKIE_NEEDED',
                'class' => 'fixed-width-m',
                'required' => false
            ],
            [
                'type' => 'text',
                'label' => $this->module->l('Descrizione cookie personalizzati'),
                'name' => 'COOKIE_DESCRIPTION_COOKIE_CUSTOM',
                'class' => 'fixed-width-m',
                'required' => false,
            ],
        ];
    }
    
    private function description(): string
    {
        return $this->module->l('Configura le impostazioni per la gestione della Cookie Policy, incluse le descrizioni dei vari tipi di cookie e il link alla pagina della privacy.');
    }

    /**
     * Renderizza un template Smarty
     */
    private function renderTemplate(string $templateName): string
    {
        $templatePath = _PS_MODULE_DIR_ . $this->moduleName . '/views/templates/hook/' . $templateName;

        if (!file_exists($templatePath)) {
            \PrestaShopLogger::addLog(
                "Template not found: {$templatePath}",
                3,
                null,
                'DolceZampaCookiePolicy'
            );
            return '';
        }

        return $this->context->smarty->fetch($templatePath);
    }

    /**
     * Metodo principale per generare il banner cookie
     */
    public function displayBanner(string $position = 'footer'): string
    {
        try {
            // Usa direttamente Configuration invece delle classi
            $templateVars = array_merge([
                'banner_id' => 'dolcezampa-banner-' . $position,
                'banner_position' => $position,
                'description' => \Configuration::get('COOKIE_DESCRIPTION_COOKIE_POLICY', ''),
                'privacy_url' => \Configuration::get('COOKIE_URL_PRIVACY_POLICY', ''),
                'cookie_url' => \Configuration::get('COOKIE_URL_COOKIE_POLICY', ''),
                'cookie_needed_description' => \Configuration::get('COOKIE_DESCRIPTION_COOKIE_NEEDED', ''),
                'cookie_analytics_description' => \Configuration::get('COOKIE_DESCRIPTION_COOKIE_ANALYTICS', ''),
                'cookie_marketing_description' => \Configuration::get('COOKIE_DESCRIPTION_COOKIE_MARKETING', ''),
                'cookie_custom_description' => \Configuration::get('COOKIE_DESCRIPTION_COOKIE_CUSTOM', ''),
            ], $this->dictionary());
            
            $this->context->smarty->assign($templateVars);

            return $this->renderTemplate('cookie_banner.tpl');
        } catch (\Exception $e) {
            \PrestaShopLogger::addLog(
                'Cookie Policy Banner Error: ' . $e->getMessage(),
                3,
                null,
                'DolceZampaCookiePolicy'
            );
            return '';
        }
    }

    public function handleBackOfficeHeader($params)
    {
        try {
            if (\Tools::getValue('configure') === $this->moduleName && \Tools::isSubmit('submit' . $this->moduleName)) {
                $formData = [];
                foreach ($this->getConfigurationFields() as $field) {
                    if (isset($field['name'])) {
                        $formData[$field['name']] = \Tools::getValue($field['name'], '');
                    }
                }

                // Salva le configurazioni
                foreach ($formData as $key => $value) {
                    \Configuration::updateValue($key, $value);
                }

                // Messaggio di conferma
                if (isset($this->context->controller->confirmations)) {
                    $this->context->controller->confirmations[] = $this->module->l('Impostazioni salvate con successo.');
                }
            }

            // Mostra il form di configurazione
            if (\Tools::getValue('configure') === $this->moduleName) {
                echo $this->displayConfigurationForm();
            }
        } catch (\Exception $e) {
            \PrestaShopLogger::addLog(
                'Cookie Policy BackOffice Error: ' . $e->getMessage(),
                3,
                null,
                'DolceZampaCookiePolicy'
            );
        }
    }

    private function dictionary(): array
    {
        return [
            'accept_all' => $this->module->l('Accetta tutti i cookie'),
            'reject_all' => $this->module->l('Rifiuta tutti i cookie'),
            'customize' => $this->module->l('Personalizza'),
            'save_preferences' => $this->module->l('Salva preferenze'),
            'necessary_cookies' => $this->module->l('Cookie necessari'),
            'analytics_cookies' => $this->module->l('Cookie di analisi'),
            'marketing_cookies' => $this->module->l('Cookie di marketing'),
            'custom_cookies' => $this->module->l('Cookie personalizzati'),
            'cookie_policy' => $this->module->l('Cookie Policy'),
            'privacy_policy' => $this->module->l('Privacy Policy'),
            'close' => $this->module->l('Chiudi'),
        ];
    }

    public function handleDisplayHeader()
    {
        try {
            $this->context->controller->addCSS($this->module->getPathUri() . 'views/css/cookie_policy.css');
            $this->context->controller->addJS($this->module->getPathUri() . 'views/js/cookie_policy.js');
        } catch (\Exception $e) {
            \PrestaShopLogger::addLog(
                'Cookie Policy Header Error: ' . $e->getMessage(),
                3,
                null,
                'DolceZampaCookiePolicy'
            );
        }
    }

    public function handleDisplayFooter()
    {
        try {
            return $this->displayBanner('footer');
        } catch (\Exception $e) {
            \PrestaShopLogger::addLog(
                'Cookie Policy Footer Error: ' . $e->getMessage(),
                3,
                null,
                'DolceZampaCookiePolicy'
            );
            return '';
        }
    }

    public function handleConfiguration()
    {
        try {
            return $this->displayConfigurationForm();
        } catch (\Exception $e) {
            \PrestaShopLogger::addLog(
                'Cookie Policy Configuration Error: ' . $e->getMessage(),
                3,
                null,
                'DolceZampaCookiePolicy'
            );
            return $this->module->l('Si è verificato un errore durante il caricamento della configurazione.');
        }
    }

    public function handleCookieBanner()
    {
        try {
            return $this->displayBanner('footer');
        } catch (\Exception $e) {
            \PrestaShopLogger::addLog(
                'Cookie Policy Banner Error: ' . $e->getMessage(),
                3,
                null,
                'DolceZampaCookiePolicy'
            );
            return '';
        }
    }
}