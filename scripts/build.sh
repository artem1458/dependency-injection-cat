rm -rf ./dist &&
tsc --p tsconfig.production.json &&
dts-bundle-generator --o ./dist/index.d.ts --no-check --no-banner ./src/index.ts &&
dts-bundle-generator --o ./dist/external/ContextPool.d.ts --no-check --no-banner ./src/external/ContextPool.ts &&
dts-bundle-generator --o ./dist/external/RealCatContext.d.ts --no-check --no-banner ./src/external/RealCatContext.ts &&
node ./scripts/beforePublish.js
