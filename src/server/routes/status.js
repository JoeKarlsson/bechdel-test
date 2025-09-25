const express = require('express');
const cleanupManager = require('../helper/cleanupManager');

const router = express.Router();

// Store active SSE connections
const activeConnections = new Map();

// Clean up inactive connections
const cleanupConnections = () => {
    const now = Date.now();
    for (const [processId, connection] of activeConnections.entries()) {
        if (now - connection.lastActivity > 300000) { // 5 minutes
            connection.res.end();
            activeConnections.delete(processId);
        }
    }
};

// Run cleanup every minute
setInterval(cleanupConnections, 60000);

/**
 * Server-Sent Events endpoint for real-time status updates
 * GET /api/status/:processId
 */
const handleStatusStream = (req, res) => {
    const { processId } = req.params;

    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({
        type: 'connected',
        processId,
        timestamp: Date.now()
    })}\n\n`);

    // Store the connection
    activeConnections.set(processId, {
        res,
        lastActivity: Date.now()
    });

    // Send current status if process exists
    const processInfo = cleanupManager.getProcessInfo(processId);
    if (processInfo) {
        console.log(`Sending initial status for process ${processId}:`, {
            stage: processInfo.stage,
            progress: processInfo.progress,
            message: processInfo.message
        });
        res.write(`data: ${JSON.stringify({
            type: 'status',
            processId,
            status: processInfo.status,
            stage: processInfo.stage,
            progress: processInfo.progress,
            message: processInfo.message,
            timestamp: Date.now()
        })}\n\n`);
    } else {
        console.log(`No process info found for processId: ${processId}`);
    }

    // Handle client disconnect
    req.on('close', () => {
        activeConnections.delete(processId);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
        if (activeConnections.has(processId)) {
            res.write(`data: ${JSON.stringify({
                type: 'ping',
                timestamp: Date.now()
            })}\n\n`);
        } else {
            clearInterval(keepAlive);
        }
    }, 30000); // Send ping every 30 seconds
};

/**
 * Send status update to specific process
 */
const sendStatusUpdate = (processId, update) => {
    console.log(`sendStatusUpdate called for processId ${processId}:`, update);
    const connection = activeConnections.get(processId);
    if (connection) {
        connection.lastActivity = Date.now();
        connection.res.write(`data: ${JSON.stringify({
            type: 'status',
            processId,
            ...update,
            timestamp: Date.now()
        })}\n\n`);
        console.log(`Status update sent to client for processId ${processId}`);
    } else {
        console.log(`No active connection found for processId ${processId}`);
    }
};

/**
 * Send status update to all connections
 */
const broadcastStatusUpdate = (update) => {
    for (const [processId, connection] of activeConnections.entries()) {
        connection.lastActivity = Date.now();
        connection.res.write(`data: ${JSON.stringify({
            type: 'status',
            processId,
            ...update,
            timestamp: Date.now()
        })}\n\n`);
    }
};

// Routes
router.get('/:processId', handleStatusStream);

module.exports = {
    router,
    sendStatusUpdate,
    broadcastStatusUpdate
};
