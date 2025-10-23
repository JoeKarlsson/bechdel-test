module.exports = {
  extends: [
    "airbnb",
    "prettier",
  ],
  rules: {
    "import/no-named-as-default": 0,
    "no-underscore-dangle": "off",
    "no-console": 0,
    "space-in-parens": 0,
    "no-plusplus": 0,
    "no-use-before-define": 0,
    "padded-blocks": 0,
    "no-param-reassign": 0,
    "consistent-return": 0,
    "no-bitwise": 0,
    "no-shadow": 0,
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "arrow-body-style": 0,
    "no-tabs": 0,
    indent: ["error", "tab"],
    "react/jsx-indent": [2, "tab"],
    "react/jsx-indent-props": [2, "tab"],
    "function-paren-newline": ["error", "consistent"],
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        components: [],
        specialLink: [],
        aspects: ["noHref", "invalidHref", "preferButton"]
      }
    ],
    // Modern React rules
    "react/function-component-definition": [
      "warn",
      {
        "namedComponents": "arrow-function",
        "unnamedComponents": "arrow-function"
      }
    ],
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    // Downgrade some rules to warnings for existing code
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "react/forbid-prop-types": ["warn"],
    "react/no-array-index-key": ["warn"],
    "react/no-unstable-nested-components": ["warn"],
    "no-restricted-exports": ["off"],
    "react/no-unescaped-entities": ["warn"],
    "no-unsafe-optional-chaining": ["warn"],
    "import/extensions": ["warn", "ignorePackages", { "js": "never", "jsx": "never" }],
    "global-require": ["warn"],
    "camelcase": ["warn"],
    "jsx-a11y/click-events-have-key-events": ["warn"],
    "jsx-a11y/no-static-element-interactions": ["warn"],
    "react/button-has-type": ["warn"],
    "react/prop-types": ["warn"],
    "jsx-a11y/label-has-associated-control": ["warn"],
    "no-restricted-syntax": ["warn"],
    "class-methods-use-this": ["warn"],
    "no-useless-escape": ["warn"],
    "no-lonely-if": ["warn"],
    "no-control-regex": ["warn"],
    "no-unused-expressions": ["warn"],
    "react/jsx-no-constructed-context-values": ["warn"],
    "import/no-extraneous-dependencies": ["warn", { "devDependencies": true }],
    "react/react-in-jsx-scope": ["warn"],
    "jsx-a11y/role-supports-aria-props": ["warn"],
    "no-nested-ternary": ["warn"],
    "no-promise-executor-return": ["warn"],
    "no-await-in-loop": ["warn"],
    "no-restricted-globals": ["warn"],
    "no-setter-return": ["warn"],
    "no-loop-func": ["warn"],
    "no-return-await": ["warn"],
    "import/order": ["warn"],
    "prefer-destructuring": ["warn"],
  },
  env: {
    browser: true,
    node: true,
    jest: true,
    mocha: true,
    mongo: true,
    es2022: true
  },
  plugins: [
    "import",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  }
};
