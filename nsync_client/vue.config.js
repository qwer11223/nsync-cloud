module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    share: {
      entry: 'src/pages/share/share.js',
      template: 'public/share.html'
    }
  },
  lintOnSave: false,
  publicPath: "./",
  assetsDir: "static",
  outputDir: 'dist',
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
}
