// Higiene do front (não é o gate de CONTEÚDO da oficina): aponta erros mecânicos de JS/React.
// Nunca decide passa/falha de norma. Flat config (ESLint 9) p/ React 18 + Vite.
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // React 18 automatic runtime: dispensa import React
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      // Sem PropTypes/TypeScript no projeto (app pequeno, autor jurista): validar props daria
      // só ruído. Os dados vêm tipados do backend (dominios/) e cobertos por pytest.
      'react/prop-types': 'off',
    },
  },
  prettier, // desliga regras de estilo que conflitam com o Prettier (Prettier é a autoridade)
]
