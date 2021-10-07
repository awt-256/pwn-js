const PwnDuplex = require("./PwnDuplex");
const { execFile } = require("child_process");

class Process extends PwnDuplex {
    constructor(command) {
        const childProcess = execFile(command);

        super(childProcess.stdout, childProcess.stdin);

        this.childProcess = childProcess;
    }

    static create(command) {
        return new Process(command);
    }
}

module.exports = Process;