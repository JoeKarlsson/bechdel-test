module.exports = {
    'extends': 'airbnb',
    ecmaFeatures: {
      'jsx': true,
      'modules': true,
    },
    'plugins': [
      'react'
    ],
    'env': {
      'browser': true,
      'node': true,
      'mocha': true,
      'mongo': true,
    },
    'rules': {
      'no-underscore-dangle': 'off',
    },
};