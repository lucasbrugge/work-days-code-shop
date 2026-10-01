<?php

class NotImplementedController
{
    public static function handle(
        string $endpoint
    ): never {
        jsonResponse(
            "Endpoint {$endpoint} ainda não implementado",
            501
        );
    }
}
