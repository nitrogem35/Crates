import { Util } from '../util.js';

class Player {
    static pool = [];
    static MAX_PLAYERS = 81;
    constructor(i, worldRef) {
        Player.pool[i] = this;
        this.worldRef = worldRef;
        this.id = i;
        this.resetProps();
    }

    get position() {
        return {
            x: this.x,
            y: this.y,
            spdX: this.spdX,
            spdY: this.spdY
        };
    }

    activate(packet, isSelf) {
        this.gun = packet.gun;
        this.color = packet.color;
        this.x = packet.x;
        this.y = packet.y;
        this.radius = packet.radius;
        this.playerAngle = packet.playerAngle;
        this.hp = packet.hp;
        this.hpRadius = (this.hp * this.radius) / 100;
        this.armorAmount = packet.armorAmount;
        this.camo = packet.camo;
        this.maxBullets = packet.maxBullets;
        this.invincible = packet.invincible;
        this.username = Util.usernameFormat(packet.username);
        this.isLeader = packet.isLeader;
        this.isPremiumMember = packet.isPremiumMember;
        this.teamCode = packet.teamCode;
        this.chatBoxOpen = packet.chatBoxOpen;
    
        if(isSelf) {
            this.currentBullets = packet.currentBullets;
            this.maxBullets = packet.maxBullets;
            this.armor = packet.armor;
            this.camera = packet.camera;
            this.hpMax = packet.hpMax;
            this.numExplosivesLeft = 3;
    
            this.worldRef.mapSize.w = packet.mapWidth;
            this.worldRef.mapSize.h = packet.mapHeight;
        }
    
        this.activated = 1;
    }

    deactivate() {
        this.resetProps();
    }

    playerUpdate(packet) {
        if (!this.activated) return;
    
        this.x = packet.x;
        this.y = packet.y;
        this.spdX = packet.spdX;
        this.spdY = packet.spdY;
        if (packet.id != this.worldRef.selfAttrs.id){
            this.playerAngle = packet.playerAngle;
        } else {
            this.trueAngle = packet.playerAngle;
        }
    }

    miscPlayerUpdate(packet) {
        if (!this.activated) return;
    
        if (!isNaN(packet.currentBullets))
            this.currentBullets = packet.currentBullets; 
        if (!isNaN(packet.shooting))
            this.shooting = packet.shooting;
        if (!isNaN(packet.reloading))
            this.reloading = packet.reloading; 
        if (!isNaN(packet.hp))
            this.hp = packet.hp;
        if (!isNaN(packet.beingHit)) {
            if (packet.id == selfId){
                hudDamageImageTimer = 6;
            }
            this.beingHit = packet.beingHit; 
        }
        if (!isNaN(packet.armorAmount))
            this.armorAmount = packet.armorAmount;
        if (!isNaN(packet.radius))
            this.radius = packet.radius;
        if (!isNaN(packet.camo)) 
            this.camo = packet.camo; 
        if (!isNaN(packet.maxBullets))
            this.maxBullets = packet.maxBullets;
        if (!isNaN(packet.invincible))
            this.invincible = packet.invincible;
        if (!isNaN(packet.dashing))
            this.dashing = packet.dashing;
        if (!isNaN(packet.chatBoxOpen))
            this.chatBoxOpen = packet.chatBoxOpen;
        if (!isNaN(packet.color))
            this.color = packet.color;
        if (!isNaN(packet.isLeader))
            this.isLeader = packet.isLeader;
        if (packet.chatMessage !== undefined && packet.chatMessage != "") { 
            this.chatMessage = packet.chatMessage.replace(/~/g, ',');
            this.chatMessageTimer = 200;
        }
    }

    selfUpdate(packet) {
        if (!this.activated) return;

        if (!isNaN(packet.currentBullets))
            this.currentBullets = packet.currentBullets;
        if (!isNaN(packet.score))
            this.score = packet.score;
        if (!isNaN(packet.kills))
            this.kills = packet.kills;
        if (!isNaN(packet.rechargeTimer)) {
            this.worldRef.perkCooldown = {
                trigerred: Date.now(),
                finish: Date.now() + packet.rechargeTimer * 40
            };
        }
        if (!isNaN(packet.maxBullets))
            this.maxBullets = packet.maxBullets;
        if (!isNaN(packet.thermal))
            this.thermal = packet.thermal;
        if (!isNaN(packet.numExplosivesLeft))
            this.numExplosivesLeft = packet.numExplosivesLeft;
        if (packet.camera !== undefined && packet.camera != "") {
            //comes in as "<width>x<height>" for some weird reason
            let [width, height] = packet.camera.split("x");
            this.camera = { width: parseInt(width), height: parseInt(height) };
            //we should emit here to give the client a heads up about resizing
        }
    }

    extrapolate(fps) {
        this.updateRadiusByHP(fps);
        if (this.hp > 0) {
            this.x += Math.round(this.spdX / (fps / 25));
            this.y += Math.round(this.spdY / (fps / 25));
        }
    }

    updateRadiusByHP(fps) {
        //amount of hp we're expected to draw
        let targetRadius = Math.round((this.hp / 100) * (this.radius - this.armorAmount - 1));
        if (Math.abs(this.hpRadius - targetRadius) < 0.5 * (fps / 60)) {
            this.hpRadius = targetRadius;
        } else {
            this.hpRadius += Math.sign(this.targetRadius - this.hpRadius) * 0.5 * (fps / 60);
        }
        if (this.hpRadius < 1) this.hpRadius = 1;
    }

    resetProps() {
        this.gun = "";
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
        this.camo = 0;
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
}

export { Player }