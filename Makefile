BIN=node_modules/.bin/
COFFEE=$(BIN)coffee
MOCHA=$(BIN)mocha

all:
	npm install
	$(COFFEE) -c -o dist lib

dev:
	$(COFFEE) -cw -o dist lib

test:
	$(MOCHA)

.PHONY: all test
