import { EventEmitter } from 'node:events';

//What gats.io should've been
import { Util } from './classes/util.js';

import { NetworkAbstractor } from './classes/network/network-abstractor.js';
import { Controller } from './classes/network/controller.js';

import { Player } from './classes/entities/player.js';
import { Bullet } from './classes/entities/bullet.js';
import { Crate } from './classes/entities/crate.js';
import { Explosive } from './classes/entities/explosive.js';

class World {
    static totalOnline = 0;
    constructor(socket) {
        this.network = new NetworkAbstractor(socket, this);
        this.controller = new Controller(this.handlePlayerInput);
        this.emitter = new EventEmitter();
        this.fillObjectPools();
        this.mapSize = {w: 0, h: 0};
        this.selfAttrs = {
            viewbox: {w: 0, h: 0},
            id: null,
            spawned: false
        };
    }

    handleStateUpdate = (packets) => {
        for (let packet of packets) {
            switch(packet.type) {
                case "selfJoin":
                    this.selfAttrs.spawned = true;
                    this.selfAttrs.id = packet.id;
                    Player.pool[packet.id].activate(packet, true);
            }
        }
    }

    handlePlayerInput = (inputObject) => {
        this.network.sendPlayerInput(inputObject);
    }

    fillObjectPools() {
        for(var i = 0; i < Player.MAX_PLAYERS; ++i) {
            Player.pool[i] = new Player(i, this);
        } for(var i = 0; i < Bullet.MAX_BULLETS; ++i) {
            Bullet.pool[i] = new Bullet(i);
        } for(var i = 0; i < Crate.MAX_CRATES; ++i) {
            Crate.pool[i] = new Crate(i);
        } for(var i = 0; i < Explosive.MAX_EXPLOSIVES; ++i) {
            Explosive.pool[i] = new Explosive(i);
        }
    }
}

function connectToServer(url) {
    let gameSocket = Util.buildConnection(url);
    gameSocket.binaryType = 'arraybuffer';
    let currentWorld = new World(gameSocket);
    //Inject the current server if we can deduce it
    currentWorld.server = Util.serverList.find(s => s.url == url);
    return currentWorld;
}

export { Util, connectToServer }