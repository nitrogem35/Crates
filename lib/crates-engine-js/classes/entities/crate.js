class Crate {
    static pool = [];
    static MAX_CRATES = 2000;
    constructor(i) {
        Crate.pool[i] = this;
    }
}

export { Crate }