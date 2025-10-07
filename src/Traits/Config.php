<?php
namespace Dolcezampa\CookiePolicyModule\Traits;

use Configuration;

trait Config
{

    /**
     * Updates a specific configuration value.
     *
     * @param string $key The configuration key to update
     * @param mixed $value The new value for the configuration
     * @return bool True on success, false on failure
     */
    public static function updateConfiguration(string $key, $value): bool
    {
        if (!in_array($key, self::ALLOWED_CONFIGURATIONS, true)) {
            throw new \InvalidArgumentException("Configuration key '$key' is not allowed.");
        }

        return Configuration::updateValue($key, $value);
    }

    public static function createConfiguration(string $key, $value): bool
    {
        if (Configuration::hasKey($key)) {
            throw new \InvalidArgumentException("Configuration key '$key' already exists.");
        }
        return Configuration::updateValue($key, $value);
    }

    /**
     * Deletes a configuration value from the module's configurations
     *
     * @param string $key The configuration key to delete
     * @return bool True if the configuration was successfully deleted, false otherwise
     *
     * @throws \Exception If the configuration key doesn't exist or if there's a database error
     */
    public static function deleteConfiguration(string $key): bool
    {
        if (!in_array($key, self::ALLOWED_CONFIGURATIONS, true)) {
            throw new \InvalidArgumentException("Configuration key '$key' is not allowed.");
        }
        
        return Configuration::deleteByName($key);
    }
}