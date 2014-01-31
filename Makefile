BIN=node_modules/.bin/
MOCHA=$(BIN)mocha

test:
	$(MOCHA) --reporter spec

.PHONY: test
