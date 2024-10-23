import { Util } from '../util.js';

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
                        id: parseInt(rawPacket[1]),
                        gun: Util.guns[rawPacket[2]],
                        color: Util.color_hexes[rawPacket[3]],
                        x: parseInt(rawPacket[4]),
                        y: parseInt(rawPacket[5]),
                        radius: parseInt(rawPacket[6]),
                        playerAngle: parseInt(rawPacket[7]),
                        armorAmount: parseInt(rawPacket[8]),
                        currentBullets: parseInt(rawPacket[9]),
                        maxBullets: parseInt(rawPacket[10]),
                        armor: parseInt(rawPacket[11]),
                        hp: parseInt(rawPacket[12]),
                        camera: { width: parseInt(rawPacket[13]), height: parseInt(rawPacket[14]) },
                        maxHp: parseInt(rawPacket[15]),
                        mapWidth: parseInt(rawPacket[16]),
                        mapHeight: parseInt(rawPacket[17]),
                        username: rawPacket[18],
                        invincible: parseInt(rawPacket[19]),
                        isLeader: parseInt(rawPacket[20]),
                        isPremiumMember: parseInt(rawPacket[21]),
                        teamCode: parseInt(rawPacket[22]),
                        //what bro
                        isolatedUsername: rawPacket[23]
                    };
                    break;
                case 'b':
                    parsedPacket = {
                        type: "playerUpdate",
                        id: parseInt(rawPacket[1]),
                        x: parseInt(rawPacket[2]),
                        y: parseInt(rawPacket[3]),
                        spdX: parseInt(rawPacket[4]),
                        spdY: parseInt(rawPacket[5]),
                        playerAngle: parseInt(rawPacket[6]),
                    };
                    break;
                case 'c':
                    parsedPacket = {
                        type: "miscPlayerUpdate",
                        id: parseInt(rawPacket[1]),
                        currentBullets: parseInt(rawPacket[2]),
                        shooting: parseInt(rawPacket[3]),
                        reloading: parseInt(rawPacket[4]),
                        hp: parseInt(rawPacket[5]),
                        beingHit: parseInt(rawPacket[6]),
                        armorAmount: parseInt(rawPacket[7]),
                        radius: parseInt(rawPacket[8]),
                        camo: parseInt(rawPacket[9]),
                        maxBullets: parseInt(rawPacket[10]),
                        invincible: parseInt(rawPacket[11]),
                        dashing: parseInt(rawPacket[12]),
                        chatBoxOpen: parseInt(rawPacket[13]),
                        isLeader: parseInt(rawPacket[14]),
                        color: Util.color_hexes[rawPacket[15]],
                        chatMessage: rawPacket[16],
                    };
                    break;
                case 'd':
                    parsedPacket = {
                        type: "playerJoin",
                        id: parseInt(rawPacket[1]),
                        gun: Util.guns[rawPacket[2]],
                        color: Util.color_hexes[rawPacket[3]],
                        x: parseInt(rawPacket[4]),
                        y: parseInt(rawPacket[5]),
                        radius: parseInt(rawPacket[6]),
                        playerAngle: parseInt(rawPacket[7]),
                        armorAmount: parseInt(rawPacket[8]),
                        hp: parseInt(rawPacket[9]),
                        maxBullets: parseInt(rawPacket[10]),
                        username: rawPacket[11],
                        camo: parseInt(rawPacket[12]),
                        invincible: parseInt(rawPacket[13]),
                        isLeader: parseInt(rawPacket[14]),
                        isPremiumMember: parseInt(rawPacket[15]),
                        teamCode: parseInt(rawPacket[16]),
                        chatBoxOpen: parseInt(rawPacket[17])
                    };
                    break;
                case 'e':
                    parsedPacket = {
                        type: "playerExit",
                        id: parseInt(rawPacket[1]),
                    };
                    break;
                case 'f':
                    parsedPacket = {
                        type: "selfUpdate",
                        currentBullets: parseInt(rawPacket[1]),
                        score: parseInt(rawPacket[2]),
                        kills: parseInt(rawPacket[3]),
                        rechargeTimer: parseInt(rawPacket[4]),
                        maxBullets: parseInt(rawPacket[5]),
                        camera: rawPacket[6],
                        thermal: parseInt(rawPacket[7]),
                        numExplosivesLeft: parseInt(rawPacket[8])
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
                                userId: Util.usernameFormat(row[0]),
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

export { PacketDecoder }