const EventEmitter = require("events");
const net = require("net");

class Remote extends EventEmitter {
    socket = null;
    buffer = Buffer.from(new ArrayBuffer(0));
    pos = 0;

    constructor() {
        super();

        this.socket = new net.Socket();

        this.socket.on("connect", () => this.emit("connect"));
        this.socket.on("close", () => this.emit("close"));
        this.socket.on("error", (error) => this.emit("error", error));
        this.socket.on("data", (data) => {
            this.buffer = Buffer.concat([this.buffer, data]);
            this.emit("data", data);
        });
    }

    open(host, port) {
        this.socket.connect({ host, port });
    }

    send(data) {
        if (!Buffer.isBuffer(data)) data = Buffer.from(data);

        return new Promise(r => this.socket.write(Uint8Array.from(data), r));
    }

    onceLinesAsync(count) {
        return new Promise((res, rej) => {
            const offset = this.pos;
            let lineCount = 0;

            const awaiter = (data) => {
                data.forEach(b => b === 0x0A && (lineCount += 1));

                if (lineCount >= count) {
                    this.socket.off("error", rej);
                    this.off("data", awaiter);
                    
                    let i = 0;
                    while (i++ < lineCount) this.pos = this.buffer.indexOf(0x0A, this.pos + 1);

                    res(this.buffer.slice(offset).toString().split("\n").slice(0, count));
                }
            }

            this.socket.once("error", rej); 
            this.on("data", awaiter); 

            awaiter(this.buffer.slice(this.pos));
        }); 
    }

    onceDataAsync(data) {
        if (!Buffer.isBuffer(data)) data = Buffer.from(data);
        const offset = this.pos;

        return new Promise((res, rej) => {
            const awaiter = () => {
                const index = this.buffer.indexOf(data, offset);

                if (index !== -1) {
                    this.socket.off("error", rej);
                    this.off("data", awaiter);

                    this.pos = index + data.byteLength;

                    res(index);
                }
            }

            this.socket.once("error", rej);
            this.on("data", awaiter);

            awaiter();
        });
    }

    destroy() {
        this.socket.destroy();
    }

    end(cb=()=>{}) {
        this.socket.end(cb);
    }

    pipeStdout() {
        this.socket.pipe(process.stdout);
    }

    pipeStdin() {
        process.stdin.pipe(this.socket);
    }

    static create(host, port) {
        const remote = new Remote();

        remote.open(host, port);

        return remote;
    }
}

module.exports = Remote;
