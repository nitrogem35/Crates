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

export { Controller }