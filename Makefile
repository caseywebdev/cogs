BIN=node_modules/.bin/
ISTANBUL=$(BIN)istanbul
_MOCHA=$(BIN)_mocha
WATCHY=$(BIN)watchy

test-w:
	$(WATCHY) -w src,test -- make test

test:
	$(ISTANBUL) cover $(_MOCHA) 'test/src/**/*.js' -- -R spec -c -t 5000

.PHONY: test
