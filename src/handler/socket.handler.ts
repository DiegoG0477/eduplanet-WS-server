import { Server, Socket } from 'socket.io';

/**
 * Class representing a WebSocket handler.
 */
export class WebSocketHandler {
  private packetBuffer: any[] = [];
  private isProcessing = false;
  private clientId = "";

  /**
   * Creates an instance of WebSocketHandler.
   * @param {Server} io - The Socket.IO server instance.
   */
  constructor(private io: Server) {
    this.io.on('connection', this.handleConnection);
  }

  /**
   * Handles the connection event for a WebSocket client.
   * @param {Socket} socket - The Socket.IO socket instance.
   */
  private handleConnection = (socket: Socket) => {
    const userId = socket.handshake.auth.userId;
    console.log('Client connected.');
    console.log('User ID subscription:', userId);

    if (userId !== undefined) {
      socket.join(userId);
    }

    socket.on('order:processed', (data) => {
      this.clientId = data.userId;
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

  

  /**
   * Enqueues a packet to the packet buffer.
   * @param {any} packet - The packet to enqueue.
   */
  private enqueuePacket(packet: any) {
    this.packetBuffer.push(packet);
  }

  /**
   * Processes the next packet in the packet buffer.
   */
  private processNextPacket() {
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
  private handlePacket(packet: any) {
    const { event, data } = packet;
    console.log('to:', this.clientId);
    console.log(`Processing event ${event} with data:`, data);
    this.io.to(this.clientId).emit(event, data);
    this.isProcessing = false;
    this.processNextPacket(); 
  }
}
