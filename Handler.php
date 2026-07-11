{
    "message": "CSRF token mismatch.",
    "exception": "Symfony\\Component\\HttpKernel\\Exception\\HttpException",
    "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Exceptions/Handler.php",
    "line": 492,
    "trace": [
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Exceptions/Handler.php",
            "line": 463,
            "function": "prepareException",
            "class": "Illuminate\\Foundation\\Exceptions\\Handler",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/app/Exceptions/Handler.php",
            "line": 69,
            "function": "render",
            "class": "Illuminate\\Foundation\\Exceptions\\Handler",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Routing/Pipeline.php",
            "line": 51,
            "function": "render",
            "class": "App\\Exceptions\\Handler",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 188,
            "function": "handleException",
            "class": "Illuminate\\Routing\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php",
            "line": 121,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php",
            "line": 64,
            "function": "handleStatefulRequest",
            "class": "Illuminate\\Session\\Middleware\\StartSession",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Session\\Middleware\\StartSession",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php",
            "line": 37,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Cookie\\Middleware\\AddQueuedCookiesToResponse",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php",
            "line": 67,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Cookie\\Middleware\\EncryptCookies",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/sanctum/src/Http/Middleware/EnsureFrontendRequestsAreStateful.php",
            "line": 61,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 165,
            "function": "Laravel\\Sanctum\\Http\\Middleware\\{closure}",
            "class": "Laravel\\Sanctum\\Http\\Middleware\\EnsureFrontendRequestsAreStateful",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 119,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/sanctum/src/Http/Middleware/EnsureFrontendRequestsAreStateful.php",
            "line": 24,
            "function": "then",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Laravel\\Sanctum\\Http\\Middleware\\EnsureFrontendRequestsAreStateful",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 119,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Routing/Router.php",
            "line": 805,
            "function": "then",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Routing/Router.php",
            "line": 784,
            "function": "runRouteWithinStack",
            "class": "Illuminate\\Routing\\Router",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Routing/Router.php",
            "line": 748,
            "function": "runRoute",
            "class": "Illuminate\\Routing\\Router",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Routing/Router.php",
            "line": 737,
            "function": "dispatchToRoute",
            "class": "Illuminate\\Routing\\Router",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php",
            "line": 200,
            "function": "dispatch",
            "class": "Illuminate\\Routing\\Router",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 144,
            "function": "Illuminate\\Foundation\\Http\\{closure}",
            "class": "Illuminate\\Foundation\\Http\\Kernel",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php",
            "line": 21,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php",
            "line": 31,
            "function": "handle",
            "class": "Illuminate\\Foundation\\Http\\Middleware\\TransformsRequest",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Foundation\\Http\\Middleware\\ConvertEmptyStringsToNull",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php",
            "line": 21,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php",
            "line": 40,
            "function": "handle",
            "class": "Illuminate\\Foundation\\Http\\Middleware\\TransformsRequest",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Foundation\\Http\\Middleware\\TrimStrings",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ValidatePostSize.php",
            "line": 27,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Foundation\\Http\\Middleware\\ValidatePostSize",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php",
            "line": 99,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Foundation\\Http\\Middleware\\PreventRequestsDuringMaintenance",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php",
            "line": 62,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Http\\Middleware\\HandleCors",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php",
            "line": 39,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 183,
            "function": "handle",
            "class": "Illuminate\\Http\\Middleware\\TrustProxies",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php",
            "line": 119,
            "function": "Illuminate\\Pipeline\\{closure}",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php",
            "line": 175,
            "function": "then",
            "class": "Illuminate\\Pipeline\\Pipeline",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/laravel/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php",
            "line": 144,
            "function": "sendRequestThroughRouter",
            "class": "Illuminate\\Foundation\\Http\\Kernel",
            "type": "->"
        },
        {
            "file": "/home/u559531649/domains/api.crestapp.ng/public_html/index.php",
            "line": 51,
            "function": "handle",
            "class": "Illuminate\\Foundation\\Http\\Kernel",
            "type": "->"
        }
    ]
}