all:
	./node_modules/.bin/coffee -cb -o dist lib

dev:
	./node_modules/.bin/coffee -cbw -o dist lib

test:
	./node_modules/.bin/mocha

.PHONY: all test watch
