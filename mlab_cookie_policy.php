<?php

use Dolcezampa\CookiePolicyModule\Controllers\ModuleController;


/**
 * Prestashop Module to manage cookie policy banner
 * @author mlabfactory <tech@mlabfactory.com>
 * Dolce & Zampa - Cookie Policy Module
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

// Carica l'autoloader di Composer
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    // Autoloader alternativo manuale - CORRETTO IL NAMESPACE
    spl_autoload_register(function ($className) {
        $prefix = 'Dolcezampa\\CookiePolicyModule\\';
        $base_dir = __DIR__ . '/src/';
        
        $len = strlen($prefix);
        if (strncmp($prefix, $className, $len) !== 0) {
            return;
        }
        
        $relative_class = substr($className, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
        
        if (file_exists($file)) {
            require $file;
        }
    });
}


class Dolcezampa_Cookie_Policy extends Module
{
    private $moduleController;

    public function __construct()
    {
        $this->name = 'dolcezampa_cookie_policy';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'mlabfactory';
        $this->need_instance = 0;
        $this->_path = dirname(__FILE__) . '/';
        
        // Compatibilità PS9
        $this->ps_versions_compliancy = [
            'min' => '8.0.0',
            'max' => '9.99.99'
        ];
        
        $this->bootstrap = true;

        // Chiamata SEMPRE sicura al parent constructor
        parent::__construct();

        $this->displayName = $this->l('Dolce & Zampa Cookie Policy');
        $this->description = $this->l('Activate the cookie policy banner');
        $this->confirmUninstall = $this->l('Are you sure you want to uninstall this module?');

        // Inizializza i controller solo dopo il parent constructor
        $this->initializeControllers();
    }

    /**
     * Inizializza i controller del modulo
     */
    private function initializeControllers()
    {
        try {
            $this->moduleController = new ModuleController($this, $this->name, $this->_path);
        } catch (Exception $e) {
            // Log dell'errore per debug
            error_log("Errore inizializzazione controller: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Ottiene il widget controller, inizializzandolo se necessario
     */
    private function getModuleController(): ModuleController
    {
        if (!$this->moduleController) {
            $this->initializeControllers();
        }
        return $this->moduleController;
    }

    public function install()
    {
        return parent::install() &&
            $this->registerHook('actionShowCookiePolicyBanner') &&
            $this->registerHook('displayHeader') && // Per includere CSS/JS
            $this->registerHook('displayFooter') &&
            $this->registerHook('displayFooterAfter') && // Aggiungiamo questo hook
            $this->registerHook('displayBeforeBodyClosingTag'); // E questo come fallback
    }

    public function uninstall()
    {
        return parent::uninstall();
    }

    /**
     * Hook per aggiungere CSS e JS nel header
     */
    public function hookDisplayHeader($params)
    {
        return $this->getModuleController()->handleDisplayHeader();
    }

    /**
     * Hook per mostrare il banner cookie policy
     */
    public function hookActionShowCookiePolicyBanner($params)
    {
        // Verifica che il controller sia inizializzato
        if (!$this->moduleController) {
            $this->initializeControllers();
        }
        
        // Gestisci qui la logica del banner cookie
        return $this->getModuleController()->handleCookieBanner();
    }

    public function hookShowCookiePolicyBanner($params)
    {
        // Rimuovi questo metodo o fallo puntare al metodo corretto
        return $this->hookActionShowCookiePolicyBanner($params);
    }
    public function hookDisplayFooter($params)
    {
        return $this->getModuleController()->handleDisplayFooter();
    }

    /**
     * Configurazione del modulo
     */
    public function getContent()
    {
        return $this->getModuleController()->handleConfiguration();
    }

    public function hookDisplayFooterAfter($params)
    {
        // Debug
        PrestaShopLogger::addLog('Cookie Banner: Rendering template');
        
        // Assegna le variabili al template
        $this->context->smarty->assign([
            'description' => $this->l('Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito.'),
            'cookie_needed_description' => $this->l('Questi cookie sono essenziali per il funzionamento del sito.'),
            'cookie_analytics_description' => $this->l('Ci aiutano a capire come utilizzi il sito.'),
            'cookie_marketing_description' => $this->l('Utilizzati per mostrarti contenuti personalizzati.'),
            'cookie_custom_description' => $this->l('Cookie per le tue preferenze di navigazione.')
        ]);

        return $this->display(__FILE__, 'views/templates/hook/cookie_banner.tpl');
    }

    // Fallback hook
    public function hookDisplayBeforeBodyClosingTag($params)
    {
        return $this->hookDisplayFooterAfter($params);
    }
}