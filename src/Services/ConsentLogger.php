<?php

namespace MlabPs\CookiePolicyModule\Services;

/**
 * Servizio per il logging del consenso cookie.
 * Salva i dati in forma anonimizzata: IP e user agent vengono hashati con SHA-256.
 */
class ConsentLogger
{
    private static string $tableName = 'mlab_cookie_consent_log';

    public static function createTable(): bool
    {
        $sql = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . self::$tableName . '` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `consent_id` VARCHAR(36) NOT NULL,
            `ip_hash` VARCHAR(64) NOT NULL,
            `user_agent_hash` VARCHAR(64) NOT NULL,
            `policy_version` VARCHAR(20) NOT NULL,
            `action` VARCHAR(20) NOT NULL,
            `necessary` TINYINT(1) NOT NULL DEFAULT 1,
            `analytics` TINYINT(1) NOT NULL DEFAULT 0,
            `marketing` TINYINT(1) NOT NULL DEFAULT 0,
            `preferences` TINYINT(1) NOT NULL DEFAULT 0,
            `consent_date` DATETIME NOT NULL,
            PRIMARY KEY (`id`),
            INDEX `idx_consent_id` (`consent_id`),
            INDEX `idx_consent_date` (`consent_date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';

        return \Db::getInstance()->execute($sql);
    }

    public static function dropTable(): bool
    {
        return \Db::getInstance()->execute(
            'DROP TABLE IF EXISTS `' . _DB_PREFIX_ . self::$tableName . '`'
        );
    }

    /**
     * @param string $consentId UUID v4 generato lato client
     * @param string $ipAddress IP grezzo (verrà hashato, non salvato)
     * @param string $userAgent User agent grezzo (verrà hashato, non salvato)
     * @param string $policyVersion Versione della policy al momento del consenso
     * @param string $action 'accept_all' | 'reject_all' | 'custom'
     */
    public static function log(
        string $consentId,
        string $ipAddress,
        string $userAgent,
        string $policyVersion,
        string $action,
        bool $necessary,
        bool $analytics,
        bool $marketing,
        bool $preferences
    ): bool {
        if (!in_array($action, ['accept_all', 'reject_all', 'custom'], true)) {
            $action = 'custom';
        }

        return \Db::getInstance()->insert(self::$tableName, [
            'consent_id'       => pSQL($consentId),
            'ip_hash'          => hash('sha256', $ipAddress),
            'user_agent_hash'  => hash('sha256', $userAgent),
            'policy_version'   => pSQL($policyVersion),
            'action'           => pSQL($action),
            'necessary'        => 1,
            'analytics'        => (int) $analytics,
            'marketing'        => (int) $marketing,
            'preferences'      => (int) $preferences,
            'consent_date'     => date('Y-m-d H:i:s'),
        ]);
    }
}
