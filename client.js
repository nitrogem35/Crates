import * as fs from 'fs';
let cratesEngine;
if (fs.existsSync('./lib/crates-engine.node')) {
    cratesEngine = await import('./lib/crates-engine.node');
} else {
    console.log("Fallback to JS engine");
    cratesEngine = await import('./lib/crates-engine.js');
}
const { util, connectToServer, Util } = cratesEngine;
//General configuration
const APIBase = "index.gats.io/api";
util.setAPIBase(APIBase);

//Setup game UI stuff
const ingame = false;
const loadout = [Util.guns.indexOf("sniper"), Util.armors.indexOf("no_armor"), Util.colors.indexOf("green")];

//When launched, we should just connect to the best server
await util.grabServers();
await util.testAllPing();
let world = await connectToServer(util.serverList.sort((a, b) => a.ping - b.ping)[0].url);
let { controller } = world;

world.emitter.on("socketOpened", () => {
    console.log("Spawning in")
    controller.joinGame(loadout[0], loadout[1], loadout[2]);
});

world.emitter.on("socketClosed", () => {
    if (ingame) {
        ingame = false;
    }
});