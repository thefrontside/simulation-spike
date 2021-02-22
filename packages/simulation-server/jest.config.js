// eslint-disable-next-line @typescript-eslint/no-var-requires
const { paths } = require('@cutting/devtools/tools/config/paths');
// eslint-disable-next-line @typescript-eslint/no-var-requires

module.exports = {
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  globals: {
    __DEV__: true,
    'ts-jest': {
      tsconfig: paths.tsConfig,
      isolatedModules: true,
    },
  },
  testMatch: ['<rootDir>/src/**/?(*.)(spec|test).ts?(x)'],
  transform: {
    '.(ts|tsx|js)$': require.resolve('ts-jest/dist'),
    '.(js|jsx|cjs|mjs)$': require.resolve('babel-jest'),
  },
  transformIgnorePatterns: ['[/\\\\](node_modules|dist)[/\\\\].+\\.(js|jsx)$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'csv', 'node'],
  moduleDirectories: ['node_modules', '../../node_modules'],
  modulePaths: ['<rootDir>', 'src'],
  resetMocks: true,
};
