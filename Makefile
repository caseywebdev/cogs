BIN=node_modules/.bin/
ISTANBUL=$(BIN)istanbul
MOCHA=$(BIN)mocha
_MOCHA=$(BIN)_mocha

test:
	$(MOCHA) -R spec -c test/lib/**/*.js

test-w:
	watchy -w lib,test -- exec make test

cover:
	$(ISTANBUL) cover $(_MOCHA) -- -R spec -c

.PHONY: test
