rm -rf ./dist &&
tsc --p tsconfig.production.json &&
dts-bundle-generator --o ./dist/index.d.ts --no-check --no-banner ./src/index.ts &&
dts-bundle-generator --o ./dist/external/ContextPool.d.ts --no-check --no-banner ./src/external/ContextPool.ts &&
dts-bundle-generator --o ./dist/external/InternalCatContext.d.ts --no-check --no-banner ./src/external/InternalCatContext.ts &&
dts-bundle-generator --o ./dist/test/index.d.ts --no-check --no-banner ./src/test/index.ts &&
node ./scripts/beforePublish.js
