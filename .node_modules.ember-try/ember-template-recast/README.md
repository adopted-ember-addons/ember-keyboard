# ember-template-recast


With ember-template-recast, transform a template's AST and reprint it. Its
formatting will be preserved.

For instance, it is possible to change a component's property while preserving
its formatting:
```js
const recast = require('ember-template-recast');

const template = `
<Sidebar
  foo="bar"
     item={{hmmm}}
/>
`;

// parse
let ast = recast.parse(template);

// transform
ast.body[1].attributes[1].value.path = builders.path('this.hmmm');

// print
let ouput = recast.print(ast);

output === `
<Sidebar
  foo="bar"
     item={{this.hmmm}}
/>
`; // is true!
```
## Command Line Usage

ember-template-recast comes with a binary for running a transform across multiple
files, similar to jscodeshift.

```
npx ember-template-recast directory/of/templates -t transform.js
```

Example transform plugin:

```js
module.exports = (env) => {
  let { builders: b } = env.syntax;

  return {
    MustacheStatement() {
      return b.mustache(b.path('wat-wat'));
    },
  };
};
```

## APIs

### parse

Used to parse a given template string into an AST. Generally speaking, this AST
can be mutated and passed into `print` (docs below).

```js
const templateRecast = require('ember-template-recast');
const template = `
{{foo-bar
  baz="stuff"
}}
`;
let ast = templateRecast.parse(template);
// now you can work with `ast`
```

### print

Used to generate a new template string representing the provided AST.

```js
const templateRecast = require('ember-template-recast');
const template = `
{{foo-bar
  baz="stuff"
}}
`;
let ast = templateRecast.parse(template);
ast.body[0].hash[0].key = 'derp';

templateRecast.print(ast);

    {{foo-bar
      derp="stuff"
    }}
```

### transform

Used to easily traverse (and possibly mutate) a given template. Returns the
resulting AST and the printed template.

The plugin argument has roughly the following interface:

```ts
export interface Syntax {
  parse: typeof preprocess;
  builders: typeof builders;
  print: typeof print;
  traverse: typeof traverse;
  Walker: typeof Walker;
}

export interface TransformPluginEnv {
  syntax: Syntax;
  contents: string;
  filePath?: string;
  parseOptions: {
    srcName?: string;
  };
}

export interface TransformPluginBuilder {
  (env: TransformPluginEnv): NodeVisitor;
}
```

The list of known builders on the `env.syntax.builders` are [found
here](https://github.com/glimmerjs/glimmer-vm/blob/v0.62.4/packages/%40glimmer/syntax/lib/builders.ts#L547-L578).

Example:
```js
const { transform } = require('ember-template-recast');

const template = `
{{foo-bar
  baz="stuff"
}}
`;

let { code } = transform({
  template,
  plugin(env) {
    let { builders: b } = env.syntax;

    return {
      MustacheStatement() {
        return b.mustache(b.path('wat-wat'));
      },
    };
  }
});

console.log(code); // => {{wat-wat}}
```

## SemVer Policy

Due to usage of TypeScript and bundling external APIs this project has somewhat
unique SemVer commitments. A high level summary is:

### Major Version

The following are scenarios that would cause a major version (aka breaking change) release:

* Dropping support for Node versions (e.g. dropping Node 10 support)
* Non-additive changes to the underlying AST (which we bundle from `@glimmer/syntax`)
* Breaking changes to the `@glimmer/syntax` builder APIs

### Minor Version

The following are scenarios that would cause a minor version (aka new feature) release:

* Changes to TypeScript version used internally by `ember-template-recast`
* Changes to make the types used by `ember-template-recast` to be more accurate
  (e.g. narrowing / broadening of previously published types).
* Adding new features

### Patch Version

The following are scenarios that would cause a patch release:

* Bug fixes to internal re-writing logic
* Bug fix releases of `@glimmer/syntax`

## License

This project is distributed under the MIT license, see [LICENSE](./LICENSE) for details.
