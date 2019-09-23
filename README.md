# NGX SMART SCHEMATICS

A very useful schematics collection to save you time and focus on what matters !

| Schematic | What it does | Readme |
| ------ | ------ | ----- |
| openapi | Generates services and model Data Transfer Objects to communicate with an API | [README](./src/openapi/README.md) |

## How to install
`npm install ngx-smart-schematics --save-dev`

### Install Peer Dependencies

If you don't have all package dependencies, install them :

`npm install @schematics/angular @types/node typescript swagger-parser`

## How to use

Each schematic has its own README. Please refer to the table above.

### Quick Start

#### Want to generate code to communicate with an API ?

`ng g ngx-smart-schematics:openapi --api=/path/to/api.json`
