<?php

namespace Dolcezampa\CookiePolicyModule\Objects;

interface ConfigurationModuleInterface
{
    public static function getConfigurations(): self;

    public function toArray(): array;

    public static function updateConfiguration(string $key, $value): bool;

    public static function createConfiguration(string $key, $value): bool;

    public static function deleteConfiguration(string $key): bool;


}