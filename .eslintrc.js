module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb',
    'next/core-web-vitals',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    gtag: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  'settings': {
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.jsx'],
        'paths': ['.'],
      },
    },
    'import/extensions': [
      '.js',
      '.jsx',
    ],
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/label-has-associated-control': ['error', { 'assert': 'either' }],
    'no-param-reassign': 0,
    'no-loop-func': 0,
    'object-curly-newline': 0,
    'react/destructuring-assignment': 0,
    'react/jsx-one-expression-per-line': 0,
  },
};
