import { Util } from '../util.js';

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

export { Player }