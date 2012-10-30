BIN=node_modules/.bin/
COFFEE=$(BIN)coffee
MOCHA=$(BIN)mocha

all:
	npm install
	$(COFFEE) -cbo dist lib

dev:
	$(COFFEE) -cbwo dist lib

test:
	$(MOCHA)

.PHONY: test
