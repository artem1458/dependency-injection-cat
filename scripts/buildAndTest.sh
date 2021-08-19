yarn run build &&
cd ./tests &&
yarn upgrade dependency-injection-cat mock_node_module &&
yarn run test:ttypescript
