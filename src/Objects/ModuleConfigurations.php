<?php
namespace MlabPs\CookiePolicyModule\Objects;

use Configuration;
use MlabPs\CookiePolicyModule\Traits\Config;

final class ModuleConfigurations implements \MlabPs\CookiePolicyModule\Objects\ConfigurationModuleInterface
{
    use Config;
    private const ALLOWED_CONFIGURATIONS = [
        self::CONFIG_COOKIE_URL_COOKIE_POLICY,
        self::CONFIG_COOKIE_URL_PRIVACY_POLICY,
        self::CONFIG_COOKIE_DESCRIPTION_COOKIE_POLICY
    ];

    public const CONFIG_COOKIE_URL_COOKIE_POLICY = 'MLAB_COOKIE_URL_COOKIE_POLICY';
    public const CONFIG_COOKIE_URL_PRIVACY_POLICY = 'MLAB_COOKIE_URL_PRIVACY_POLICY';
    public const CONFIG_COOKIE_DESCRIPTION_COOKIE_POLICY = 'MLAB_COOKIE_DESCRIPTION_COOKIE_POLICY';


    public ?string $cookieUrlCookiePolicy;
    public ?string $cookieUrlPrivacyPolicy;
    public ?string $cookieDescriptionCookiePolicy;

    private function __construct(array $configs)
    {
        $this->cookieUrlCookiePolicy = $configs[self::CONFIG_COOKIE_URL_COOKIE_POLICY] ?? null;
        $this->cookieUrlPrivacyPolicy = $configs[self::CONFIG_COOKIE_URL_PRIVACY_POLICY] ?? null;
        $this->cookieDescriptionCookiePolicy = $configs[self::CONFIG_COOKIE_DESCRIPTION_COOKIE_POLICY] ?? null;

    }

    /**
     * Retrieves the module configurations from PrestaShop's Configuration.
     *
     * @return array Associative array of configuration keys and their values
     */
    public static function getConfigurations(): self
    {
        return new self([
            self::CONFIG_COOKIE_URL_COOKIE_POLICY => Configuration::get(self::CONFIG_COOKIE_URL_COOKIE_POLICY, null, null, null, null),
            self::CONFIG_COOKIE_URL_PRIVACY_POLICY => Configuration::get(self::CONFIG_COOKIE_URL_PRIVACY_POLICY, null, null, null, null),
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_POLICY => Configuration::get(self::CONFIG_COOKIE_DESCRIPTION_COOKIE_POLICY, null, null, null, null),
        ]);
    }

    public function toArray(): array
    {
        return [
            self::CONFIG_COOKIE_URL_COOKIE_POLICY => $this->cookieUrlCookiePolicy,
            self::CONFIG_COOKIE_URL_PRIVACY_POLICY => $this->cookieUrlPrivacyPolicy,
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_POLICY => $this->cookieDescriptionCookiePolicy,
        ];
    }
}