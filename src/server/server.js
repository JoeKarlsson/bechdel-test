const express = require('express');
const helmet = require('helmet');
const historyApiFallback = require('connect-history-api-fallback');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const partials = require('express-partials');
const film = require('./routes/film');
const { router: statusRouter, sendStatusUpdate } = require('./routes/status');
const cleanupManager = require('./helper/cleanupManager');
const prodResponse = require('./helper/responseProd');
const handleListen = require('./helper/handleListen');
const log = require('./helper/log');
const meta = require('./helper/meta');

// Only import webpack-related modules in development
let webpackHotMiddleware, webpackDevConfig;
if (meta.isDeveloping) {
	webpackHotMiddleware = require('webpack-hot-middleware');
	webpackDevConfig = require('./helper/webpackDevConfig');
}

const app = express();

// Configure helmet with CSP that allows webpack development mode
const helmetConfig = meta.isDeveloping ? {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'", "ws:", "wss:"],
		},
	},
} : {};

app.use(helmet(helmetConfig));
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

app.use('/api/film', film);
app.use('/api/status', statusRouter);

// Set up SSE callback for cleanup manager
cleanupManager.setStatusUpdateCallback(sendStatusUpdate);

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || 'development',
	});
});

if (meta.isDeveloping) {
	app.set('host', 'http://localhost');
	app.use(webpackDevConfig.middleware);
	app.use(webpackHotMiddleware(webpackDevConfig.compiler));
	app.use(historyApiFallback());
	app.use(webpackDevConfig.middleware);
} else {
	app.use(express.static('dist'));
	app.get('*', prodResponse);
}

if (!module.parent) {
	app.listen(meta.port, handleListen(meta.port, log));
}

module.exports = app;
