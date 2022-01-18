module.exports = {
  useYarn: true,
  scenarios: [
    {
      command: 'tsc --noEmit --project type-tests/tsconfig-3.6.json',
      name: 'typescript-3.6',
      npm: {
        typescript: '~3.6',
      },
    },
    {
      command: 'tsc --noEmit --project type-tests/tsconfig-3.7.json',
      name: 'typescript-3.7',
      npm: {
        typescript: '~3.7',
      },
    },
    {
      command: 'tsc --noEmit --project type-tests/tsconfig-next.json',
      name: 'typescript-next',
      allowedToFail: true,
      npm: {
        devDependencies: {
          typescript: 'next',
        },
      },
    },
  ],
};
