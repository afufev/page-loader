install:
	npm install
start:
	npx babel-node -- src/bin/page-loader.js https://hexlet.io/courses
build:
	rm -rf dist
	npm run build

publish:
	npm publish
lint:
	npx eslint .
test:
	npm test

debug:
	DEBUG='page-loader*' npm test

.PHONY: test
