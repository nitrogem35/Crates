import WebSocket from 'ws';
import UserAgent from 'user-agents';

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
    static serverList = [];
    static APIBase = "https://index.gats.io/api";
    static setAPIBase(base) {
        Util.APIBase = base;
    }
    static async grabServers(custom = false) {
        try {
            let res = await fetch(`${Util.APIBase}/find_instances`, {
                "headers": {
                    "content-type": "application/json"
                },
                "body": `{"custom":${custom}}`,
                "method": "POST"
            });
            let json = await res.json();
            Util.serverList = json;
        } catch (e) {
            Util.serverList = [];
        }
        return Util.serverList;
    }
    static async testAllPing() {
        const timeout = 3000;
        for (let server of Util.serverList) {
            //check ping to every server but do it sync
            await (new Promise(resolve => {
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
            return Util.guestNames[parseInt(user.substr(1)) - 1] || "Mystery Creature";
        }
        return user;
    }
}

export { Util }