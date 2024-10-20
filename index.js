import * as fs from 'fs';
let cratesEngine;
if (fs.existsSync('./lib/crates-engine.node')) {
    cratesEngine = await import('./lib/crates-engine.node');
} else {
    console.log("Fallback to JS engine");
    cratesEngine = await import('./lib/crates-engine.js');
}
const API_BASE = "index.gats.io/api";

let servers = cratesEngine.grabServers(API_BASE);

cratesEngine.init('wss://us-e-1.gats.io/6b474b93-7181-4733-90b3-a50c71d33433', socketCallback);