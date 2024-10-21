import * as fs from 'fs';
let cratesEngine;
if (fs.existsSync('./lib/crates-engine.node')) {
    cratesEngine = await import('./lib/crates-engine.node');
} else {
    console.log("Fallback to JS engine");
    cratesEngine = await import('./lib/crates-engine.js');
}
const { util, connectToServer } = cratesEngine;
//General configuration
const APIBase = "index.gats.io/api";
util.setAPIBase(APIBase);

//When launched, we should just connect to the best server
await util.grabServers();
await util.testAllPing();
let world = await connectToServer(util.serverList.sort((a, b) => a.ping - b.ping)[0].url);

