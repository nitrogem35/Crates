class Explosive {
    static pool = [];
    static MAX_EXPLOSIVES = 500;
    constructor(i) {
        Explosive.pool[i] = this;
    }
}

export { Explosive }