BIN=node_modules/.bin/
COFFEE=$(BIN)coffee
MOCHA=$(BIN)mocha

all: clean
	npm install
	$(COFFEE) -cbo dist lib

dev: clean
	$(COFFEE) -cbwo dist lib

clean:
	rm -fr dist

test:
	$(MOCHA)

.PHONY: test
