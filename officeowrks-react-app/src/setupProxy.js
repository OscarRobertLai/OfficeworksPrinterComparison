const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api', // This is the API endpoint to be proxied
        createProxyMiddleware({
            target: 'https://www.officeworks.com.au', // Base URL of Officeworks API
            changeOrigin: true,
        })
    );
};
