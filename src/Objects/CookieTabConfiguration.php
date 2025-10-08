<?php
namespace MlabPs\CookiePolicyModule\Objects;

use Configuration;
use MlabPs\CookiePolicyModule\Traits\Config;

final class CookieTabConfiguration implements \MlabPs\CookiePolicyModule\Objects\ConfigurationModuleInterface
{
    use Config;
    private const ALLOWED_CONFIGURATIONS = [
        self::CONFIG_COOKIE_DESCRIPTION_COOKIE_NEEDED,
        self::CONFIG_COOKIE_DESCRIPTION_COOKIE_ANALYTICS,
        self::CONFIG_COOKIE_DESCRIPTION_COOKIE_MARKETING,
        self::CONFIG_COOKIE_DESCRIPTION_COOKIE_CUSTOM
    ];

    public const CONFIG_COOKIE_DESCRIPTION_COOKIE_NEEDED = 'MLAB_COOKIE_DESCRIPTION_COOKIE_NEEDED';
    public const CONFIG_COOKIE_DESCRIPTION_COOKIE_ANALYTICS = 'MLAB_COOKIE_DESCRIPTION_COOKIE_ANALYTICS';
    public const CONFIG_COOKIE_DESCRIPTION_COOKIE_MARKETING = 'MLAB_COOKIE_DESCRIPTION_COOKIE_MARKETING';
    public const CONFIG_COOKIE_DESCRIPTION_COOKIE_CUSTOM = 'MLAB_COOKIE_DESCRIPTION_COOKIE_CUSTOM';



    public string $cookieDescriptionCookieNeeded;
    public string $cookieDescriptionCookieAnalytics;
    public string $cookieDescriptionCookieMarketing;
    public string $cookieDescriptionCookieCustom;
    private function __construct(array $configs)
    {
        $this->cookieDescriptionCookieNeeded = $configs[self::CONFIG_COOKIE_DESCRIPTION_COOKIE_NEEDED] ?? 'Questi cookie sono essenziali per il funzionamento del sito e non possono essere disabilitati nei nostri sistemi.';
        $this->cookieDescriptionCookieAnalytics = $configs[self::CONFIG_COOKIE_DESCRIPTION_COOKIE_ANALYTICS] ?? 'Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito, raccogliendo e segnalando informazioni in forma anonima.';
        $this->cookieDescriptionCookieMarketing = $configs[self::CONFIG_COOKIE_DESCRIPTION_COOKIE_MARKETING] ?? 'Questi cookie vengono utilizzati per fornire annunci pubblicitari più pertinenti per te e i tuoi interessi.';
        $this->cookieDescriptionCookieCustom = $configs[self::CONFIG_COOKIE_DESCRIPTION_COOKIE_CUSTOM] ?? 'Questi cookie sono impostati da terze parti per migliorare la tua esperienza di navigazione.';
    }

    /**
     * Retrieves the module configurations from PrestaShop's Configuration.
     *
     * @return array Associative array of configuration keys and their values
     */
    public static function getConfigurations(): self
    {
        return new self([
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_NEEDED => Configuration::get(self::CONFIG_COOKIE_DESCRIPTION_COOKIE_NEEDED, null, null, null, 'Questi cookie sono essenziali per il funzionamento del sito e non possono essere disabilitati nei nostri sistemi.'),
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_ANALYTICS => Configuration::get(self::CONFIG_COOKIE_DESCRIPTION_COOKIE_ANALYTICS, null, null, null, 'Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito, raccogliendo e segnalando informazioni in forma anonima.'),
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_MARKETING => Configuration::get(self::CONFIG_COOKIE_DESCRIPTION_COOKIE_MARKETING, null, null, null, 'Questi cookie vengono utilizzati per fornire annunci pubblicitari più pertinenti per te e i tuoi interessi.'),
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_CUSTOM => Configuration::get(self::CONFIG_COOKIE_DESCRIPTION_COOKIE_CUSTOM, null, null, null, 'Questi cookie sono impostati da terze parti per migliorare la tua esperienza di navigazione.'),
        ]);
    }

    public function toArray(): array
    {
        return [
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_NEEDED => $this->cookieDescriptionCookieNeeded,
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_ANALYTICS => $this->cookieDescriptionCookieAnalytics,
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_MARKETING => $this->cookieDescriptionCookieMarketing,
            self::CONFIG_COOKIE_DESCRIPTION_COOKIE_CUSTOM => $this->cookieDescriptionCookieCustom,
        ];
    }
}