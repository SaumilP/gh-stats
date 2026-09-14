import js from "@eslint/js";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: [".next/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { process: "readonly", console: "readonly", fetch: "readonly", URL: "readonly", URLSearchParams: "readonly", AbortSignal: "readonly" } },
    rules: { "@typescript-eslint/no-explicit-any": "off", "@typescript-eslint/no-require-imports": "off", "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }], "no-empty": ["error", { allowEmptyCatch: true }] },
  },
  { files: ["app/**/*.tsx"], plugins: { "react-hooks": hooks }, rules: { "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn" } },
);
