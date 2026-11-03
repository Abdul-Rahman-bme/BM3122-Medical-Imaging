import ts from 'typescript-eslint';
export default [
 {ignores:['node_modules/**','.next/**','public/pdfjs/**','.test-data/**','test-results/**','playwright-report/**','next-env.d.ts']},
 {files:['**/*.{ts,tsx,mjs}'],languageOptions:{parser:ts.parser,parserOptions:{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}}},rules:{'no-debugger':'error','no-eval':'error','no-constant-condition':'error','no-unreachable':'error','eqeqeq':['error','always']}}
];
