all:
	./node_modules/.bin/coffee -cb -o dist lib

watch:
	./node_modules/.bin/coffee -cbw -o dist lib

test:
	./node_modules/.bin/mocha

.PHONY: test watch
