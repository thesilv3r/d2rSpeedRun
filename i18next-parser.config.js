module.exports = {
  contextSeparator: '_',
  defaultNamespace: 'translation',
  defaultValue: '',
  indentation: 2,
  keepRemoved: false,
  keySeparator: false,
  lexers: {
    ts: ['JavascriptLexer'],
    tsx: ['JsxLexer'],
    default: ['JavascriptLexer']
  },
  lineEnding: 'auto',
  locales: ['en', 'pl'],
  namespaceSeparator: false,
  output: 'locale/$LOCALE.json',
  pluralSeparator: '_',
  input: ['src/**'],
  sort: false,
  skipDefaultValues: false,
  useKeysAsDefaultValue: true,
  verbose: false,
  failOnWarnings: false,
  failOnUpdate: false,
  customValueTemplate: null,
  resetDefaultValueLocale: null,
  i18nextOptions: null
}

