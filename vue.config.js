module.exports = {
  indexPath: 'main.html',
  filenameHashing: false,
  css: {
	extract: true
  },
  configureWebpack: config => {
    config.entry = {
      app: [
        './frontend/main.js'
      ]
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        // PHP built-in server closes the connection immediately after a 204
        // response, which confuses Node's http-proxy (HPE_CLOSED_CONNECTION).
        // Apache handles this correctly in production; this handler papers over
        // the dev-only quirk.
        onError(err, req, res) {
          if (err.code === 'HPE_CLOSED_CONNECTION') {
            if (!res.headersSent) res.writeHead(204)
            res.end()
          }
        },
      },
      '/download': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    }
  }
}
