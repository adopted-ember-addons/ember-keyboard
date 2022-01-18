module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['node', 'prettier', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
  env: {
    node: true,
  },
  rules: {
    'node/shebang': 'off',
  },
  overrides: [
    {
      env: { mocha: true },
      files: '**/*-test.ts',
      plugins: ['mocha'],
      extends: ['plugin:mocha/recommended'],
      rules: {
        'node/no-unpublished-require': 'off',
        'mocha/no-setup-in-describe': 'off',
        'mocha/no-hooks-for-single-case': 'off',
      },
    },
  ],
};
