module.exports = {
    extends: 'eslint:recommended',
    env: {
        node: true,
        mocha: true,
        es6: true
    },

    parserOptions: {
        ecmaVersion: 2017
    },

    rules: {
        // General
        'indent': ['error', 4],
        'no-mixed-spaces-and-tabs': 'error',
        'no-multi-spaces': 'error',
        'no-trailing-spaces': 'error',
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
        'eol-last': 'error',
        'max-len': ['error', { code: 120, tabWidth: 4, ignoreUrls: true }],

        // Codestyle
        'one-var': ['error', 'never'],
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        'quote-props': ['error', 'consistent-as-needed'],
        'comma-style': ['error', 'last'],
        'comma-dangle': 'error',
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        'no-lonely-if': 'error',
        'no-else-return': 'error',
        'operator-assignment': ['error', 'always'],

        // Codestyle: spaces
        'no-spaced-func': 'error',
        'keyword-spacing': ['error', { before: true, after: true, overrides: {} }],
        'comma-spacing': 'error',
        'key-spacing': 'error',
        'semi-spacing': ['error', { before: false, after: true }],
        'block-spacing': ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'spaced-comment': ['error', 'always'],
        'space-before-function-paren': ['error', { anonymous: "never", named: "never", asyncArrow: "always" }],
        'space-before-blocks': 'error',
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': 'error',
        'space-unary-ops': 'error',
        'padded-blocks': ['error', 'never'],

        // Codestyle: newlines
        'newline-after-var': 'error',
        'newline-before-return': 'error',

        // Codestyle: naming
        'camelcase': 'error',
        'valid-jsdoc': ['error', {
            requireParamDescription: false,
            requireReturnDescription: false,
            prefer: {
                return: 'returns'
            }
        }],

        // Errors
        'no-console': 'off',
        'complexity': ['error', 11],
        'no-use-before-define': ['error', 'nofunc'],
        'no-dupe-keys': 'error',
        'no-cond-assign': ['error', 'except-parens'],
        'no-shadow': 'error',
        'yoda': 'error',
        'no-extra-bind': 'error',

        // Node
        'no-mixed-requires': ['error', true],
        'callback-return': 'error',

        // ES2015
        'prefer-arrow-callback': 'error',
        'arrow-parens': ['error', 'always'],
        'arrow-spacing': ['error', { before: true, after: true }],
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-template': 'error',
        'computed-property-spacing': ['error', 'never'],
        'template-curly-spacing': ['error', 'never'],
        'object-shorthand': ['error', 'always']
    }
};
