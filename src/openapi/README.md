# Openapi Schematic

This schematic generates Angular services and Data Transfer Object to communicate with an API.

All you need is a valid OpenAPI json.

See https://swagger.io/resources/open-api/ for specifications.

It creates `api` directory in app source code and generates code into it.

## How to use
`ng g --collection ngx-smart-schematics ngx-smart-schematics:openapi --api=/path/to/api.json`

### Options
**path** 

Want to generate code in another location than `api` ? Just do it :

`ng g --collection ngx-smart-schematics ngx-smart-schematics:openapi --api=/path/to/api.json --path=/path/to/generate/code`

**lintFix** 

Need to lintFix generated files to fit your lint rules ? Just do it :

`ng g --collection ngx-smart-schematics ngx-smart-schematics:openapi --api=/path/to/api.json --lintFix`
