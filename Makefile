BIN=node_modules/.bin/
MOCHA=$(BIN)mocha

test:
	$(MOCHA)

.PHONY: test
