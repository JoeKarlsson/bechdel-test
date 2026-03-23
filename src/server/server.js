const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Rate limiting configuration
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: { error: 'Too many requests, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
});

const uploadLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10, // Limit each IP to 10 uploads per hour
	message: { error: 'Too many uploads, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
});

// Only import webpack-related modules in development
let webpackHotMiddleware; let webpackDevConfig;
if (meta.isDeveloping) {
	webpackHotMiddleware = require('webpack-hot-middleware');
	webpackDevConfig = require('./helper/webpackDevConfig');
}

const app = express();

// Configure helmet with CSP that allows webpack development mode and external images
const helmetConfig = {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: meta.isDeveloping ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"] : ["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: meta.isDeveloping ? ["'self'", "ws:", "wss:"] : ["'self'", "https://cloudflareinsights.com"],
			upgradeInsecureRequests: null, // Disable HTTPS upgrade for local development
		},
	},
};

app.use(helmet(helmetConfig));
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// Apply rate limiting to API routes
app.use('/api/film', apiLimiter, film);
app.use('/api/status', apiLimiter, statusRouter);

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
