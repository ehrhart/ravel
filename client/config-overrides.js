const {
  override,
  fixBabelImports,
  addLessLoader,
} = require('customize-cra');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd', libraryDirectory: 'es', style: true // change importing css to less
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        '@primary-color': '#1DA57A',
        '@layout-header-background': '#fff'
      }
    }
  })
);
