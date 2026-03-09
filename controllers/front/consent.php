<?php

/**
 * Front controller AJAX per il logging del consenso cookie.
 * URL: /module/mlab_cookie_policy/consent
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

if (file_exists(dirname(__FILE__) . '/../../vendor/autoload.php')) {
    require_once dirname(__FILE__) . '/../../vendor/autoload.php';
} else {
    spl_autoload_register(function (string $className) {
        $prefix = 'MlabPs\\CookiePolicyModule\\';
        $baseDir = dirname(__FILE__) . '/../../src/';
        $len = strlen($prefix);
        if (strncmp($prefix, $className, $len) !== 0) {
            return;
        }
        $relativeClass = substr($className, $len);
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    });
}

use MlabPs\CookiePolicyModule\Services\ConsentLogger;

class MlabCookiePolicyConsentModuleFrontController extends ModuleFrontController
{
    public function postProcess(): void
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            die(json_encode(['success' => false, 'error' => 'Method not allowed']));
        }

        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);

        if (!is_array($input)) {
            http_response_code(400);
            die(json_encode(['success' => false, 'error' => 'Invalid JSON input']));
        }

        $consentId    = isset($input['consent_id']) ? (string) $input['consent_id'] : $this->generateUuid();
        $policyVersion = isset($input['policy_version']) ? substr((string) $input['policy_version'], 0, 20) : '1.0';
        $action        = isset($input['action']) ? (string) $input['action'] : 'custom';
        $prefs         = isset($input['preferences']) && is_array($input['preferences']) ? $input['preferences'] : [];

        // Valida il formato UUID per evitare injection
        if (!preg_match('/^[0-9a-f\-]{36}$/i', $consentId)) {
            $consentId = $this->generateUuid();
        }

        $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
        // In caso di proxy multipli prendi solo il primo IP
        if (strpos($ipAddress, ',') !== false) {
            $ipAddress = trim(explode(',', $ipAddress)[0]);
        }
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

        try {
            $success = ConsentLogger::log(
                $consentId,
                $ipAddress,
                $userAgent,
                $policyVersion,
                $action,
                true,
                !empty($prefs['analytics']),
                !empty($prefs['marketing']),
                !empty($prefs['preferences'])
            );

            die(json_encode(['success' => $success, 'consent_id' => $consentId]));
        } catch (\Exception $e) {
            \PrestaShopLogger::addLog(
                'Cookie Consent Log Error: ' . $e->getMessage(),
                3,
                null,
                'MlabPsCookiePolicy'
            );
            http_response_code(500);
            die(json_encode(['success' => false, 'error' => 'Server error']));
        }
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
