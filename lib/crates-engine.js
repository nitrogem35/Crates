import WebSocket from 'ws'
import UserAgent from 'user-agents';
import { EventEmitter } from 'node:events';

const LOGGING_ENABLED = 1;

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
                    log(Player.pool[packet.id]);
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
        log("Object pools filled");
    }
}

class Player {
    static pool = [];
    static MAX_PLAYERS = 81;
    constructor(i, worldRef) {
        Player.pool[i] = this;
        this.worldRef = worldRef;
        this.id = i;
        this.class = "";
        this.color = "";
        this.x = 0;
        this.y = 0;
        this.spdX = 0;
        this.spdY = 0;
        this.radius = 0;
        this.playerAngle = 0;
        this.hp = 0;
        this.hpRadius = 0;
        this.armorAmount = 0;
        this.shootingAnimation = null;
        this.beingHit = 0;
        this.shooting = 0;
        this.shootingFrame = 0;
        this.reloading = 0;
        this.reloadingFrame = 0;
        this.ghillie = 0;
        this.currentBullets = 0;
        this.maxBullets = 0;
        this.invincible = 0;
        this.username = "";
        this.thermal = 0;
        this.dashing = 0;
        this.isLeader = 0;
        this.isPremiumMember = 0;
        this.chatBoxOpen = 0;
        this.chatMessage = "";
        this.chatMessageTimer = 0;
        this.currentBullets = 0;
        this.maxBullets = 0;
        this.armor = 0;
        this.camera = 0;
        this.hpMax = 0;
        this.kills = 0;
        this.deaths = 0;
        this.score = 0;
        this.teamCode = 0;
        this.numExplosivesLeft = 0;
        this.activated = 0;
    }

    activate(packet, isSelf) {
        this.class = packet.class;
        this.color = packet.color;
        this.x = parseInt(packet.x);
        this.y = parseInt(packet.y);
        this.radius = parseInt(packet.radius);
        this.playerAngle = parseInt(packet.playerAngle);
        this.hp = parseInt(packet.hp);
        this.hpRadius = this.hp * this.radius / 100;
        this.armorAmount = parseInt(packet.armorAmount);
        this.ghillie = packet.ghillie;
        this.maxBullets = packet.maxBullets;
        this.invincible = packet.invincible;
        this.username = Util.usernameFormat(packet.username);
        this.isLeader = parseInt(packet.isLeader);
        this.isPremiumMember = parseInt(packet.isPremiumMember);
        this.teamCode = parseInt(packet.teamCode);
        this.chatBoxOpen = parseInt(packet.chatBoxOpen);
    
        if(isSelf) {
            this.currentBullets = parseInt(packet.currentBullets);
            this.maxBullets = parseInt(packet.maxBullets);
            this.armor = packet.armor;
            this.camera = packet.camera;
            this.hpMax = packet.hpMax;
            this.numExplosivesLeft = 3;
    
            this.worldRef.mapSize.w = parseInt(packet.mapWidth) / 10;
            this.worldRef.mapSize.h = parseInt(packet.mapHeight) / 10;
        }
    
        this.activated = 1;
    }
}

class Bullet {
    static pool = [];
    static MAX_BULLETS = 350;
    constructor(i) {
        Bullet.pool[i] = this;
    }
}

class Crate {
    static pool = [];
    static MAX_CRATES = 2000;
    constructor(i) {
        Crate.pool[i] = this;
    }
}

class Explosive {
    static pool = [];
    static MAX_EXPLOSIVES = 500;
    constructor(i) {
        Explosive.pool[i] = this;
    }
}

class NetworkAbstractor {
    constructor(socket, parent) {
        this.socket = socket;
        this.parent = parent;
        this.socket.onopen = () => this.onopen();
        this.socket.onmessage = (evt) => this.onmessage(evt.data);
        this.socket.onclose = () => this.onclose();
        this.ping = 0;
        this.pingSentTime = Date.now();
        this.pingReceivedTime = Date.now();
        this.pingTimeoutLoop = setInterval(() => {
            this.checkPingTimeout();
        }, 1000);
    }

    onopen() {
        log("Game socket opened");
        this.sendPing();
        this.parent.emitter.emit("socketOpened");
    }

    onmessage(msg) {
        let packets = PacketDecoder.decode(msg);
        if (packets.length == 1 && packets[0].type == "ping") {
            this.pingReceivedTime = Date.now();
	        this.ping = this.pingReceivedTime - this.pingSentTime;
            this.sendPing();
        } else {
            this.parent.handleStateUpdate(packets);
        }
    }

    onclose() {
        clearInterval(this.pingTimeoutLoop);
        this.parent.emitter.emit("socketClosed");
    }

    sendRaw(msg) {
        this.socket.send(msg);
    }

    sendPing() {
        this.sendRaw(new TextEncoder().encode("."));
        this.pingSentTime = Date.now();
    }

    sendPlayerInput(inputObject) {
        let packet = [inputObject.opcode, ...inputObject.vars].join(",");
        this.sendRaw(packet);
    }

    checkPingTimeout() {
        if (this.readyState == 1 && Date.now() - this.pingSentTime > 3000) {
            this.sendPing();
        }
    }
}

class Controller {
    static inputTypes = {
        "left": 0,
        "right": 1,
        "up": 2,
        "down": 3,
        "space": 5,
        "shoot": 6,
        "chatbox": 7
    };
    constructor(controlParserCallback) {
        this.callback = controlParserCallback;
    }

    encodeKey(inputType, active) {
        let packet = { opcode: null, vars: [] };
        if (inputType == "reset") {
            packet.opcode = "f";
        } else {
            packet.opcode = "k";
            packet.vars.push(Controller.inputTypes[inputType]);
            packet.vars.push(active ? 1 : 0);
        }
        return packet;
    }

    sendNetworkInput(inputType, active) {
        this.callback(this.encode(inputType, active));
    }

    joinGame(weapon, armor, color) {
        this.callback({ opcode: "s", vars: [weapon, armor, color] });
    }

    reset() {
        this.left = 0;
        this.right = 0;
        this.up = 0;
        this.down = 0;
        this.shooting = 0;
        this.space = 0;
        this.chatbox = 0;
        this.sendNetworkInput("reset");
    }
}

class PacketDecoder {
    static decode(rawPacket) {
        let plaintext = new TextDecoder().decode(rawPacket);
        let packetsRaw = plaintext.split("|");
        let packetsParsed = [];
        for (let i = 0; i < packetsRaw.length; i++) {
            let rawPacket = packetsRaw[i].split(",");
            let parsedPacket = {};
            let opcode = rawPacket[0];
            switch (opcode) {
                case '.':
                    parsedPacket = {
                        type: "ping"
                    };
                    break;
                case 'a':
                    parsedPacket = {
                        type: "selfJoin",
                        id: rawPacket[1],
                        gun: Util.guns[rawPacket[2]],
                        color: Util.color_hexes[rawPacket[3]],
                        x: rawPacket[4],
                        y: rawPacket[5],
                        radius: rawPacket[6],
                        playerAngle: rawPacket[7],
                        armorAmount: rawPacket[8],
                        currentBullets: rawPacket[9],
                        maxBullets: rawPacket[10],
                        armor: rawPacket[11],
                        hp: rawPacket[12],
                        camera: {width: rawPacket[13], height: rawPacket[14]},
                        hpMax: rawPacket[15],
                        mapWidth: rawPacket[16],
                        mapHeight: rawPacket[17],
                        username: rawPacket[18],
                        invincible: rawPacket[19],
                        isLeader: rawPacket[20],
                        isPremiumMember: parseInt(rawPacket[21]),
                        teamCode: parseInt(rawPacket[22]),
                        isolatedUsername: rawPacket[23]
                    };
                    break;
                case 'b':
                    parsedPacket = {
                        type: "playerUpdate",
                        id: rawPacket[1],
                        x: rawPacket[2],
                        y: rawPacket[3],
                        spdX: rawPacket[4],
                        spdY: rawPacket[5],
                        playerAngle: rawPacket[6],
                    };
                    break;
                case 'c':
                    parsedPacket = {
                        type: "playerAuxUpdate",
                        id: rawPacket[1],
                        currentBullets: rawPacket[2],
                        shooting: rawPacket[3],
                        reloading: rawPacket[4],
                        hp: rawPacket[5],
                        beingHit: rawPacket[6],
                        armorAmount: rawPacket[7],
                        radius: rawPacket[8],
                        ghillie: rawPacket[9],
                        maxBullets: rawPacket[10],
                        invincible: rawPacket[11],
                        dashing: rawPacket[12],
                        chatBoxOpen: rawPacket[13],
                        isLeader: rawPacket[14],
                        color: Util.color_hexes[rawPacket[15]],
                        chatMessage: rawPacket[16],
                    };
                    break;
                case 'd':
                    parsedPacket = {
                        type: "playerJoin",
                        id: rawPacket[1],
                        gun: Util.guns[rawPacket[2]],
                        color: Util.color_hexes[rawPacket[3]],
                        x: rawPacket[4],
                        y: rawPacket[5],
                        radius: rawPacket[6],
                        playerAngle: rawPacket[7],
                        armorAmount: rawPacket[8],
                        hp: rawPacket[9],
                        maxBullets: rawPacket[10],
                        username: rawPacket[11],
                        ghillie: rawPacket[12],
                        invincible: rawPacket[13],
                        isLeader: rawPacket[14],
                        isPremiumMember: rawPacket[15],
                        teamCode: rawPacket[16],
                        chatBoxOpen: parseInt(rawPacket[17])
                    };
                    break;
                case 'e':
                    parsedPacket = {
                        type: "playerExit",
                        id: rawPacket[1],
                    };
                    break;
                case 'f':
                    parsedPacket = {
                        type: "formUpdate",
                        currentBullets: rawPacket[1],
                        score: rawPacket[2],
                        kills: rawPacket[3],
                        rechargeTimer: rawPacket[4],
                        maxBullets: rawPacket[5],
                        camera: rawPacket[6],
                        thermal: rawPacket[7],
                        numExplosivesLeft: rawPacket[8]
                    };
                    break;
                case 'g':
                    parsedPacket = {
                        type: "bulletJoin",
                        id: rawPacket[1],
                        x: rawPacket[2],
                        y: rawPacket[3],
                        length: rawPacket[4],
                        width: rawPacket[5],
                        angle: rawPacket[6],
                        spdX: rawPacket[7],
                        spdY: rawPacket[8],
                        silenced: rawPacket[9],
                        isKnife: rawPacket[10],
                        isShrapnel: rawPacket[11],
                        ownerId: rawPacket[12],
                        teamCode: rawPacket[13]
                    };
                    break;
                case 'h':
                    parsedPacket = {
                        type: "bulletMove",
                        id: rawPacket[1],
                        x: rawPacket[2],
                        y: rawPacket[3],
                    };
                    break;
                case 'i':
                    parsedPacket = {
                        type: "bulletExit",
                        id: rawPacket[1],
                    };
                    break;
                case 'j':
                    parsedPacket = {
                        type: "crateJoin",
                        id: rawPacket[1],
                        type: Util.objectTypes[rawPacket[2]],
                        x: rawPacket[3],
                        y: rawPacket[4],
                        angle: rawPacket[5],
                        parentId: rawPacket[6],
                        hp: rawPacket[7],
                        maxHp: rawPacket[8],
                        isPremium: rawPacket[9]
                    };
                    break;
                case 'k':
                    parsedPacket = {
                        type: "crateUpdate",
                        id: rawPacket[1],
                        x: rawPacket[2],
                        y: rawPacket[3],
                        angle: rawPacket[4],
                        hp: rawPacket[5],
                    };
                    break;
                case 'l':
                    parsedPacket = {
                        type: "crateExit",
                        id: rawPacket[1],
                    };
                    break;
                case 'm':
                    parsedPacket = {
                        type: "explosiveJoin",
                        id: rawPacket[1],
                        type: getExplosiveTypeFromCode(rawPacket[2]),
                        x: rawPacket[3],
                        y: rawPacket[4],
                        spdX: rawPacket[5],
                        spdY: rawPacket[6],
                        travelTime: rawPacket[7],
                        emitting: rawPacket[8],
                        emissionRadius: rawPacket[9],
                        ownerId: rawPacket[10],
                        teamCode: rawPacket[11]
                    };
                    break;
                case 'n':
                    parsedPacket = {
                        type: "explosiveUpdate",
                        id: rawPacket[1],
                        x: rawPacket[2],
                        y: rawPacket[3],
                        exploding: rawPacket[4],
                        emitting: rawPacket[5],
                        emissionRadius: rawPacket[6],
                    };
                    break;
                case 'o':
                    parsedPacket = {
                        type: "explosiveExit",
                        id: rawPacket[1],
                    }
                case 'p':
                    parsedPacket = {
                        type: "upgradeAvailable",
                        level: rawPacket[1],
                    };
                    break;
                case 'q':
                    parsedPacket = {
                        type: "hitMarker",
                        x: rawPacket[1],
                        y: rawPacket[2],
                    };
                    break;
                case 'r':
                    parsedPacket = {
                        type: "serverNotif",
                        msgType: rawPacket[1],
                        content: rawPacket[2],
                    };
                    break;
                case 'reco':
                    parsedPacket = {
                        type: "reconnect"
                    };
                    break;
                case 's':
                    parsedPacket = {
                        type: "despawned",
                    };
                    break;
                case 't':
                    parsedPacket = {
                        type: "kicked",
                    };
                    break;
                case 'u':
                    parsedPacket = {
                        type: "score",
                    };
                    break;
                case 'sq':
                    parsedPacket = {
                        type: "scoreSquares",
                        squareOneTeam: rawPacket[1],
                        squareTwoTeam: rawPacket[2],
                        squareThreeTeam: rawPacket[3],
                        squareFourTeam: rawPacket[4],
                    };
                    break;
                case 'v':
                    parsedPacket = {
                        type: "leaderboard",
                        currentPlayers: rawPacket[1],
                        leaderboard: [],
                    }
                    for (let i in rawPacket){
                        if (i > 1) {
                            let row = rawPacket[i].split('.');
                            parsedPacket.leaderboard.push({
                                userId: formatUserName(row[0]),
                                isMember: parseInt(row[1]),
                                score: row[2], 
                                kills: row[3],
                                teamCode: row[4],
                            });
                        }
                    }
                    break;
                case 'w':
                    parsedPacket = {
                        type: "authSuccess",
                        username: rawPacket[1],
                        rememberCookie: rawPacket[2],
                        isPremiumMember: parseInt(rawPacket[3]),
                        isolatedUsername: rawPacket[4]
                    };
                    break;
                case 'x':
                    parsedPacket = {
                        type: "loginFailed",
                        error: rawPacket[1]
                    };
                    break;
                case 'y':
                    parsedPacket = {
                        type: "registerFailed",
                        username: rawPacket[1],
                        email: rawPacket[2],
                        password: rawPacket[3],
                    };
                    break;
                case 'z':
                    parsedPacket = {
                        type: "logout",
                        status: rawPacket[1],
                    };
                    break;
                case 'sz':
                    parsedPacket = {
                        type: "fogUpdate",
                        newSize: rawPacket[1],
                    };
                    break;
                case 'sta':
                    parsedPacket = {
                        type: "stats",
                        score: parseInt(rawPacket[1]),
                        kills: parseInt(rawPacket[2]),
                        time: parseInt(rawPacket[3]),
                        shotsFired: parseInt(rawPacket[4]),
                        shotsHit: parseInt(rawPacket[5]),
                        damageDealt: parseInt(rawPacket[6]),
                        damageReceived: parseInt(rawPacket[7]),
                        distanceCovered: parseInt(rawPacket[8]),
                        shooterUsername: rawPacket[9],
                        shooterIsPremiumMember: parseInt(rawPacket[10]),
                        shooterGun: Util.guns[rawPacket[11]],
                        shooterArmor: Util.armors[rawPacket[12]],
                        shooterColor: Util.color_hexes[rawPacket[13]],
                        shooterKills: parseInt(rawPacket[14]),
                        shooterScore: parseInt(rawPacket[15]),
                        shooterHp: parseInt(rawPacket[16]),
                        shooterArmorAmount: parseInt(rawPacket[17]),
                        shooterLevel1Perk: Util.perks[rawPacket[18]],
                        shooterLevel2Perk: Util.perks[rawPacket[19]],
                        shooterLevel3Perk: Util.perks[rawPacket[20]],
                    };
                    break;
                case 're': //Respawn button
                    parsedPacket = {
                        type: "respawnAvailable",
                    };
                    break;
                case 'version':
                    parsedPacket = {
                        type: "versionNum",
                        version: rawPacket[1],
                    };
                    break;
                case 'highScores':
                    parsedPacket = {
                        type: "highScores",
                        highScoresData: rawPacket[1],
                    };
                    break;
                case 'gameType':
                    parsedPacket = {
                        type: "gameType",
                        serverGameType: rawPacket[1],
                    };
                    break;
                case 'full':
                    parsedPacket = {
                        type: "gameFull",
                    };
                    break;
            }
            packetsParsed.push(parsedPacket);
        }
        return packetsParsed;
    }
}

class Util {
    static guestNames = [
        'Guest Ant', 'Guest Baboon', 'Guest Bat', 'Guest Bear',
        'Guest Bee', 'Guest Beetle', 'Guest Bison', 'Guest Buffalo',
        'Guest Cat', 'Guest Chicken', 'Guest Cow', 'Guest Crab',
        'Guest Crocodile', 'Guest Dog', 'Guest Eagle', 'Guest Elephant',
        'Guest Emu', 'Guest Fish', 'Guest Fly', 'Guest Fox',
        'Guest Frog', 'Guest Giraffe', 'Guest Goat', 'Guest Gorilla',
        'Guest Horse', 'Guest Kangaroo', 'Guest Koala', 'Guest Lion',
        'Guest Lizard', 'Guest Llama', 'Guest Lobster', 'Guest Mongoose',
        'Guest Monkey', 'Guest Moose', 'Guest Octopus', 'Guest Otter',
        'Guest Panther', 'Guest Pelican', 'Guest Penguin', 'Guest Pig',
        'Guest Platypus', 'Guest Porcupine', 'Guest Rabbit', 'Guest Raccoon',
        'Guest Rat', 'Guest Reindeer', 'Guest Rhino', 'Guest Scorpion',
        'Guest Seal', 'Guest Sheep', 'Guest Skunk', 'Guest Sloth',
        'Guest Snail', 'Guest Snake', 'Guest Spider', 'Guest Squid',
        'Guest Squirrel', 'Guest Tiger', 'Guest Walrus', 'Guest Weasel',
        'Guest Whale', 'Guest Wolf', 'Guest Wombat', 'Guest Zebra',
        'Guest Armadillo', 'Guest Beaver', 'Guest Civet', 'Guest Coyote',
        'Guest Deer', 'Guest Dingo', 'Guest Gazelle', 'Guest Gecko',
        'Guest Goanna', 'Guest Heron', 'Guest Iguana', 'Guest Jackal',
        'Guest Lemur', 'Guest Shark', 'Guest Stork', 'Guest Vulture',
        'Guest Wolverine'
    ];
    static guns = ['pistol', 'smg', 'shotgun', 'assault', 'sniper', 'lmg'];
    static armors = ['no_armor', 'light_armor', 'medium_armor', 'heavy_armor'];
    static colors = ['red', 'orange', 'yellow', 'green', 'blue', 'pink']; 
    static color_hexes = [
        {a: '#f26740', b: '#fcd9cf'}, 
        {a: '#f6803c', b: '#fddfce'},
        {a: '#fff133', b: '#fffccc'},
        {a: '#92cd8b', b: '#ddf0db'},
        {a: '#8dd8f8', b: '#cfeefc'},
        {a: '#f7b0c2', b: '#fde8ed'}
    ];
    static objectTypes = ['shield', 'crate', 'longCrate', 'userCrate', 'medkit', 'userMedkit'];
    static perks = [
        'bipod', 'optics', 'thermal', 'armorPiercing',
        'extended', 'grip', 'silencer', 'lightweight',
        'longRange', 'thickSkin', 'shield', 'firstAid',
        'grenade', 'knife', 'engineer', 'ghillie',
        'dash', 'gasGrenade', 'landMine', 'fragGrenade'
    ];
    constructor() {
        this.serverList = [];
    }
    setLogging(v = true) {
        LOGGING_ENABLED = v;
    }
    setAPIBase(base) {
        this.APIBase = base;
    }
    async grabServers(custom = false) {
        try {
            let res = await fetch(`https://${this.APIBase}/find_instances`, {
                "headers": {
                    "content-type": "application/json"
                },
                "body": `{"custom":${custom}}`,
                "method": "POST"
            });
            let json = await res.json();
            this.serverList = json;
            World.totalOnline = this.serverList.reduce((a, c) => a.players + c.players, 0);
        } catch (e) {
            this.serverList = [];
        }
        return this.serverList;
    }
    async testAllPing() {
        const timeout = 3000;
        for (let server of this.serverList) {
            await (new Promise(resolve => {
                log(`Build test connection for ${server.region} ${server.game_type}`);
                let ws = Util.buildConnection(server.url, true);
                let pings = 0;
                let times = [];
                ws.on('message', function() {
                    times.push(Date.now());
                    ws.send(".");
                    pings++;
                    if (pings == 3) {
                        ws.close();
                        server.ping = Math.round(((times.at(-1) - times[0]) / times.length));
                        clearTimeout(timeoutFunc);
                        resolve();
                    }
                });
                let timeoutFunc = setTimeout(() => {
                    ws.close();
                    server.ping = Infinity;
                    resolve();
                }, timeout);
            }));
        }
    }
    static buildConnection(url, pingMode, proxyAgent) {
        const connectTo = `wss://${url + (pingMode ? '/ping' : '')}`
        return new WebSocket(connectTo, {
            headers: {
                "Origin": 'https://gats.io',
                "User-Agent": new UserAgent().toString()
            },
            agent: proxyAgent,
        });
    }
    static usernameFormat(user) {
        if (user[0] == "#") {
            //It's a guest
            return Util.guestNames[parseInt(username.substr(1)) - 1] || "Mystery Creature";
        }
        return user;
    }
}

function connectToServer(url) {
    let gameSocket = Util.buildConnection(url);
    gameSocket.binaryType = 'arraybuffer';
    let currentWorld = new World(gameSocket);
    return currentWorld;
}

function log(msg, severity = 0) {
    if (LOGGING_ENABLED) {
        console.log(msg);
    }
}

const util = new Util();

export { util, Util, connectToServer }