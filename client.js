import * as fs from 'fs';
import chalk from 'chalk';
let cratesEngine;
if (fs.existsSync('./lib/crates-engine.node')) {
    cratesEngine = await import('./lib/crates-engine.node');
} else {
    //Fallback to JS engine
    cratesEngine = await import('./lib/crates-engine.js');
}
const { connectToServer, Util } = cratesEngine;
//General configuration
const APIBase = "https://index.gats.io/api";
Util.setAPIBase(APIBase);

//Setup game variables
const ingame = false;
const loadout = [Util.guns.indexOf("sniper"), Util.armors.indexOf("no_armor"), Util.colors.indexOf("green")];
let world = {};
let controller = {};

//Logging funcs
const log = {
    neutral(msg) {
        console.log(msg);
    },
    maybe(msg) {
        console.log(chalk.green(msg));
    },
    good(msg) {
        console.log(chalk.greenBright(msg));
    },
    warning(msg) {
        console.log(chalk.yellow(msg));
    },
    error(msg) {
        console.log(chalk.red(msg));
    },
    catastrophic(msg) {
        console.log(chalk.hex('#FF1493')(msg));
    }
}

//When launched, we should just connect to the best server
log.neutral('Getting server list');
await Util.grabServers();
if (Util.serverList.length == 0) {
    log.error("No servers found, can't autoconnect");
} else {
    log.neutral(`Testing ping to (${Util.serverList.length}) servers`);
    await Util.testAllPing();
    log.maybe("Connecting to server with lowest latency");
    setupConnection("", true);
}

async function setupConnection(url, auto) {
    if (auto) url = Util.serverList.sort((a, b) => a.ping - b.ping)[0].url;

    //Note that we are not yet connected, we need to wait for socketOpened
    world = connectToServer(url);

    controller = world.controller;
    
    world.emitter.on("socketOpened", () => {
        log.good(`Built connection to ${url}`);
        controller.joinGame(loadout[0], loadout[1], loadout[2]);
    });
    
    world.emitter.on("socketClosed", () => {
        log.warning(`WebSocket connection to ${url} closed`);
        if (ingame) {
            ingame = false;
        }
    });

    world.emitter.on("socketErrored", (e) => {
        log.error(`WebSocket connection to ${url} errored out:\n${e}`);
    });
}