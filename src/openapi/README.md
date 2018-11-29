# Openapi Schematic

This schematic generates Angular services and Data Transfer Object to communicate with an API.

All you need is a valid OpenAPI json.

See https://swagger.io/resources/open-api/ for specifications.

## Code generated
It creates `api` directory in app source code and generates code into it

### API Models
Models are generated from the `definitions` part of the API : they are put in the `models/` directory

### API Services
API services are generated form tags and fonction definitions. One service per tag is created.

A special service named `ApiUrlService`is created. Its purpose is to store the URL to the API. Other API services use this to build the URLs to call.

They are put in the `services/` directory

### API Enum
Enum are generated from function schema definitions : they are put in the `enum/` directory

## How to use
`ng g --collection ngx-smart-schematics ngx-smart-schematics:openapi --api=/path/to/api.json`

### Options
**path** 

Want to generate code in another location than `api` ? Just do it :

`ng g --collection ngx-smart-schematics ngx-smart-schematics:openapi --api=/path/to/api.json --path=/path/to/generate/code`

**lintFix** 

Need to lintFix generated files to fit your lint rules ? Just do it :

`ng g --collection ngx-smart-schematics ngx-smart-schematics:openapi --api=/path/to/api.json --lintFix`

## Make a quick test

Download json from (petstore.swagger.io)[https://petstore.swagger.io/]

Generate API `ng g --collection ngx-smart-schematics ngx-smart-schematics:openapi --api=/path/to/swagger.json`

