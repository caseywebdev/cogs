BIN=node_modules/.bin/
ISTANBUL=$(BIN)istanbul
MOCHA=$(BIN)_mocha

test:
	$(ISTANBUL) cover $(MOCHA) -- -R spec

.PHONY: test
