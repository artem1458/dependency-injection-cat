rm -rf ./dist &&
tsc --p tsconfig.production.json &&
#dts-bundle-generator --o ./dist/index.d.ts --no-check --no-banner ./src/index.ts &&
node ./scripts/beforePublish.js
