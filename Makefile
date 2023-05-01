.PHONY: dev build deps

deps:
	(cd app && npm i)

dev:
	(cd app && npm start)

build: deps
	(cd app && npm run build)
