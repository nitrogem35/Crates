class Bullet {
    static pool = [];
    static MAX_BULLETS = 350;
    constructor(i) {
        Bullet.pool[i] = this;
    }
}

export { Bullet }