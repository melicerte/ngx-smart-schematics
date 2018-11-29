#!/bin/bash
tsc -p tsconfig.json && \
cp -R src/http-service/files dist/http-service/ && \
cp -R src/http-service/schema.json dist/http-service/ && \
cp -R src/models/files dist/models/ && \
cp -R src/models/schema.json dist/models/ && \
cp -R src/openapi/files dist/openapi/ && \
cp -R src/openapi/files dist/openapi/ && \
cp -R src/openapi/schema.json dist/openapi/ && \
cp src/collection.json dist/ && \
cp package.json.dist dist/package.json && \
cp README.md.dist dist/README.md
