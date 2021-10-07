const EventEmitter = require("events");

class PwnDuplex extends EventEmitter {
    buffer = Buffer.from(new ArrayBuffer(0));
    pos = 0;

    constructor(readStream, writeStream) {
        super();

        this.readStream = readStream;
        this.writeStream = writeStream;

        readStream.on("close", () => this.emit("close"));
        writeStream.on("error", (error) => this.emit("error", error));
        readStream.on("error", (error) => this.emit("error", error));
        readStream.on("data", (data) => {
            this.buffer = Buffer.concat([this.buffer, Buffer.isBuffer(data) ? buffer : Buffer.from(data)]);
            this.emit("data", data);
        });
    }

    write(data) {
        if (!Buffer.isBuffer(data)) data = Buffer.from(data);

        return new Promise(r => this.writeStream.write(Uint8Array.from(data), r));
    }

    onceLinesAsync(count) {
        return new Promise((res, rej) => {
            const offset = this.pos;
            let lineCount = 0;

            const awaiter = (data) => {
                data.forEach(b => b === 0x0A && (lineCount += 1));

                if (lineCount >= count) {
                    this.off("error", rej);
                    this.off("data", awaiter);
                    
                    let i = 0;
                    while (i++ < lineCount) this.pos = this.buffer.indexOf(0x0A, this.pos + 1);

                    res(this.buffer.slice(offset).toString().split("\n").slice(0, count));
                }
            }

            this.once("error", rej); 
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
                    this.off("error", rej);
                    this.off("data", awaiter);

                    this.pos = index + data.byteLength;

                    res(index);
                }
            }

            this.once("error", rej);
            this.on("data", awaiter);

            awaiter();
        });
    }

    pipeStdout() {
        this.readStream.pipe(process.stdout);
    }

    pipeStdin() {
        process.stdin.pipe(this.writeStream);
    }
}

module.exports = PwnDuplex;