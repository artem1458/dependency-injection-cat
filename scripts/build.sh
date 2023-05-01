rm -rf ./dist &&
concurrently "ttsc --p tsconfig.production.json" \
  "dts-bundle-generator --o ./dist/index.d.ts --no-check --no-banner ./src/index.ts" \
  "dts-bundle-generator --o ./dist/external/InternalCatContext.d.ts --no-check --no-banner ./src/external/InternalCatContext.ts" \
  "dts-bundle-generator --o ./dist/plugins/webpack/index.d.ts --no-check --no-banner ./src/plugins/webpack/index.ts" &&
node ./scripts/beforePublish.js
