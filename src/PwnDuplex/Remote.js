const PwnDuplex = require("./PwnDuplex");
const net = require("net");

class Remote extends PwnDuplex {
    constructor() {
        const socket = new net.Socket();

        super(socket, socket);

        this.socket = socket;
        this.socket.on("connect", () => this.emit("connect"));
    }

    open(host, port) {
        this.socket.connect({ host, port });
    }

    send(data) {
        return super.write(data);
    }

    destroy() {
        this.socket.destroy()
    }

    static create(host, port) {
        const remote = new Remote();

        remote.open(host, port);

        return remote;
    }
}

module.exports = Remote;
