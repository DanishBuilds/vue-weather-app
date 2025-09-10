import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import * as parserVue from "vue-eslint-parser";
import configPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
  },

  js.configs.recommended,

  ...pluginVue.configs["flat/recommended"],

  {
    name: "app/vue-rules",
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        Event: "readonly",
        FocusEvent: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        HTMLInputElement: "readonly",
        Element: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        alert: "readonly",
        NodeJS: "readonly",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/component-name-in-template-casing": "off",
      "vue/require-default-prop": "off",
      "vue/no-required-prop-with-default": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },

  {
    name: "app/prettier",
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...configPrettier.rules,
      "prettier/prettier": "error",
    },
  },
];
