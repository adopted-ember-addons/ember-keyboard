# release-it-lerna-changelog

This package is a [release-it](https://github.com/release-it/release-it) plugin
(using [`release-it`'s plugin
API](https://github.com/release-it/release-it/tree/master/docs/plugins)) that
integrates [lerna-changelog](https://github.com/lerna/lerna-changelog) into the
`release-it` pipeline.

## Usage

Installation using your projects normal package manager, for example:

```
# npm
npm install --save-dev release-it-lerna-changelog

# yarn add --dev release-it-lerna-changelog
```

Once installed, configure `release-it` to use the plugin. 

Either via `package.json`:

```json
{
  "release-it": {
    "plugins": {
      "release-it-lerna-changelog": {}
    }
  }
}
```

Or via `.release-it.json`:

```json
{
  "plugins": {
    "release-it-lerna-changelog": {}
  }
}
```

## Configuration

`release-it-lerna-changelog` supports one configuration option, `infile`. When
specified, this option represents the file name to prepend changelog
information to during a release.

For example, given the following configuration (in `package.json`):

```json
{
  "release-it": {
    "plugins": {
      "release-it-lerna-changelog": {
        "infile": "CHANGELOG.md",
        "launchEditor": true
      }
    }
  }
}
```

The two options that `release-it-lerna-changelog` is aware of are:

### `infile`

`infile` represents the file to prepend the generated changelog into.

### `launchEditor`

When specified, `release-it-lerna-changelog` will generate the changelog
then launch the configured editor with a temporary file. This allows the person
doing the release to customize the changelog before continuing.

There are a few valid values for `launchEditor`:

* `false` - Disables the feature.
* `true` - If present the `process.env.EDITOR` value will be used as the
  command to invoke, if `process.env.EDITOR` is not found `process.env.PATH`
  will be searched for a command named `editor` (which is commonly used on
  Debian / Ubuntu systems to point to the currently configured editor). The
  temporary file for editing is added as an argument (i.e.
  `$EDITOR /some/tmp/file`).
* any string - This string will be used as if it were a command. In order to
  interpolate the temporary file path in the string, you can use `${file}` in
  your configuration.

Each release will run `lerna-changelog` and prepend the results into `CHANGELOG.md`.

## License

This project is licensed under the [MIT License](LICENSE.md).
