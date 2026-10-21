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
      // Catch-all: forward any other URL that looks like a file path to PHP
      // so that direct download links (e.g. http://localhost:8080/report.pdf)
      // work the same way they do in production behind Apache.
      // The bypass function keeps webpack/HMR infrastructure and compiled
      // assets served locally; everything else is forwarded to PHP's
      // NOT_FOUND → DownloadController route.
      '/': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass(req) {
          const url = req.url
          // Webpack dev-server infrastructure (HMR WebSocket etc.)
          if (url.startsWith('/sockjs-node') || url.startsWith('/__webpack')) return url
          // Compiled frontend assets
          if (url.startsWith('/js/') || url.startsWith('/css/') ||
              url.startsWith('/fonts/') || url.startsWith('/img/')) return url
          // SPA entry points and root path — served by the dev-server
          if (url === '/' || url.startsWith('/?') ||
              url === '/main.html' || url === '/index.html' ||
              url === '/favicon.ico') return url
          // Any other path (e.g. /report.pdf, /subdir/black.html) → PHP
        },
      },
    }
  }
}
