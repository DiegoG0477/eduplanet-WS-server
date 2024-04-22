"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketHandler = void 0;
/**
 * Class representing a WebSocket handler.
 */
class WebSocketHandler {
    /**
     * Creates an instance of WebSocketHandler.
     * @param {Server} io - The Socket.IO server instance.
     */
    constructor(io) {
        this.io = io;
        this.packetBuffer = [];
        this.isProcessing = false;
        /**
         * Handles the connection event for a WebSocket client.
         * @param {Socket} socket - The Socket.IO socket instance.
         */
        this.handleConnection = (socket) => {
            var _a;
            const userId = (_a = socket.handshake.headers) === null || _a === void 0 ? void 0 : _a.userId;
            console.log('Client connected.');
            if (userId) {
                socket.join(userId);
            }
            socket.on('order:processed', (data) => {
                this.enqueuePacket({ event: 'notification:order_response', data });
                this.processNextPacket();
            });
            socket.on("connect_error", (err) => {
                // the reason of the error, for example "xhr poll error"
                console.log(err.message);
                // some additional description, for example the status code of the initial HTTP response
                console.log(err.description);
                // some additional context, for example the XMLHttpRequest object
                console.log(err.context);
            });
        };
        this.io.on('connection', this.handleConnection);
    }
    /**
     * Enqueues a packet to the packet buffer.
     * @param {any} packet - The packet to enqueue.
     */
    enqueuePacket(packet) {
        this.packetBuffer.push(packet);
    }
    /**
     * Processes the next packet in the packet buffer.
     */
    processNextPacket() {
        if (this.packetBuffer.length > 0 && !this.isProcessing) {
            this.isProcessing = true;
            const packet = this.packetBuffer.shift();
            this.handlePacket(packet);
        }
    }
    /**
     * Handles a packet by emitting the event and data to all connected clients.
     * @param {any} packet - The packet to handle.
     */
    handlePacket(packet) {
        const { event, data } = packet;
        console.log(`Processing event ${event} with data:`, data);
        this.io.emit(event, data);
        this.isProcessing = false;
        this.processNextPacket();
    }
}
exports.WebSocketHandler = WebSocketHandler;
