import { PacketDecoder } from './packet-decoder.js';

class NetworkAbstractor {
    constructor(socket, parent) {
        this.socket = socket;
        this.parent = parent;
        this.socket.onopen = () => this.onopen();
        this.socket.onmessage = (evt) => this.onmessage(evt.data);
        this.socket.onclose = () => this.onclose();
        this.socket.onerror = (e) => this.onerror(e);
        this.ping = 0;
        this.pingSentTime = Date.now();
        this.pingReceivedTime = Date.now();
        this.pingTimeoutLoop = setInterval(() => {
            this.checkPingTimeout();
        }, 1000);
    }

    onopen() {
        this.sendPing();
        this.parent.emitter.emit("socketOpened");
    }

    onmessage(msg) {
        let packets = PacketDecoder.decode(msg);
        if (packets.length == 1 && packets[0].type == "ping") {
            this.pingReceivedTime = Date.now();
	        this.ping = this.pingReceivedTime - this.pingSentTime;
            this.sendPing();
        } else {
            this.parent.handleStateUpdate(packets);
        }
    }

    onclose() {
        clearInterval(this.pingTimeoutLoop);
        this.parent.emitter.emit("socketClosed");
    }

    onerror(e) {
        this.parent.emitter.emit("socketErrored", e);
    }

    sendRaw(msg) {
        this.socket.send(msg);
    }

    sendPing() {
        this.sendRaw(new TextEncoder().encode("."));
        this.pingSentTime = Date.now();
    }

    sendPlayerInput(inputObject) {
        let packet = [inputObject.opcode, ...inputObject.vars].join(",");
        this.sendRaw(packet);
    }

    checkPingTimeout() {
        if (this.readyState == 1 && Date.now() - this.pingSentTime > 3000) {
            this.sendPing();
        }
    }
}

export { NetworkAbstractor }