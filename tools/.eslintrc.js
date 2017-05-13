module.exports = {
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "env": {
        "es6": true,
        "browser": true,
        "node": true
    },
    "globals": {
        "PLATFORM_EDGE": false,
        "PLATFORM_OPERA": false,
        "PLATFORM_CHROME": false,
        "PLATFORM_FIREFOX": false,
        "browser": false,
        "chrome": true,
    },
    "extends": "eslint:recommended",
    "rules": { // http://eslint.org/docs/rules/
        "indent": "off",
        "linebreak-style": "off",
        "quotes": ["warn", "single"],
        "semi": ["error", "always"],
        "no-console": "off",
        "no-var": "error", // require let or const instead of var
        "prefer-arrow-callback": "error", // suggest using arrow functions as callbacks
        "prefer-const": "error", // suggest using const declaration for variables that are never modified after declared
        "prefer-rest-params": "error", // suggest using the rest parameters instead of arguments
        "prefer-spread": "error", // suggest using the spread operator instead of .apply().
        "prefer-template": "error" // suggest using template literals instead of strings concatenation
    }
};
