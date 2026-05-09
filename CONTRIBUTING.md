# How To Contribute

This repo uses pnpm workspaces:

- `src/` contains the `ember-keyboard` addon source
- `docs/` is the documentation app for `ember-keyboard`
- `tests/` contains the test suite
- `demo-app/` contains demo components used by tests

## Installation

* `git clone https://github.com/adopted-ember-addons/ember-keyboard.git`
* `cd ember-keyboard`
* `pnpm install`

## Linting

* `pnpm lint`
* `pnpm lint:fix`

## Running tests

* `pnpm test` – Runs the test suite
* `pnpm start` – Starts the dev server in watch mode

## Running the documentation app

* `cd docs && pnpm start`
* Visit the documentation app at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
