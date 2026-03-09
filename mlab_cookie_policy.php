<?php

/**
 * Prestashop Module to manage cookie policy banner
 * @author mlabfactory <tech@mlabfactory.com>
 * MlabPs - Cookie Policy Module
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

// Carica l'autoloader di Composer PRIMA di qualsiasi use statement
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    // Autoloader alternativo manuale - CORRETTO IL NAMESPACE
    spl_autoload_register(function ($className) {
        $prefix = 'MlabPs\\CookiePolicyModule\\';
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

// IMPORTANTE: use statement DOPO l'autoloader
use MlabPs\CookiePolicyModule\Controllers\ModuleController;
use MlabPs\CookiePolicyModule\Services\ConsentLogger;


class Mlab_Cookie_Policy extends Module
{
    private $moduleController;

    public function __construct()
    {
        $this->name = 'mlab_cookie_policy';
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

        $this->displayName = $this->l('MLab Cookie Policy');
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
        if (!ConsentLogger::createTable()) {
            $this->_errors[] = $this->l('Impossibile creare la tabella del log consensi nel database.');
            return false;
        }

        \Configuration::updateValue('COOKIE_POLICY_VERSION', '1.0');
        \Configuration::updateValue('COOKIE_DURATION_DAYS', '365');

        return parent::install() &&
            $this->registerHook('displayHeader') &&
            $this->registerHook('displayFooter') &&
            $this->registerHook('displayFooterAfter');
    }

    public function uninstall()
    {
        ConsentLogger::dropTable();
        \Configuration::deleteByName('COOKIE_POLICY_VERSION');
        \Configuration::deleteByName('COOKIE_DURATION_DAYS');
        \Configuration::deleteByName('COOKIE_CONTROLLER_NAME');
        \Configuration::deleteByName('COOKIE_CONTROLLER_EMAIL');
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
     * Hook per mostrare il banner nel footer
     */
    public function hookDisplayFooter($params)
    {
        return $this->getModuleController()->handleDisplayFooter();
    }

    /**
     * Hook per mostrare il banner dopo il footer
     */
    public function hookDisplayFooterAfter($params)
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
}