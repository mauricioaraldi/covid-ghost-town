module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
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
  rules: {
    "class-methods-use-this": 0,
    "no-use-before-define": ["error", { functions: false }],
    "no-param-reassign": 0,
    "no-loop-func": 0,
    "max-len": [
      "error",
      {
        code: 100,
        tabWidth: 2,
      },
    ],
    "react-hooks/exhaustive-deps": 0,
    "object-curly-newline": 0,
    "import/no-absolute-path": 0,
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
      },
    ],
  },
};
