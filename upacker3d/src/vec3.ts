class Vec3 {
    constructor(
        public x: number,
        public y: number,
        public z: number
    ) { }

    static zero = new Vec3(0, 0, 0);

    static add(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(
            v1.x + v2.x, v1.y + v2.y, v1.z + v2.z
        )
    }

    static mul(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(
            v1.x * v2.x, v1.y * v2.y, v1.z * v2.z
        )
    }

    isValid(): boolean {
        if (isNaN(this.x) || isNaN(this.y) || isNaN(this.z)) {
            return false;
        }
        if (this.x <= 0 || this.y <= 0 || this.z <= 0) {
            return false;
        }
        return true;
    }

    toString(): string {
        return this.x + " x " + this.y + " x " + this.z;
    }

    get vol() {
        return this.x * this.y * this.z;
    }

    get rotations() {
        return [
            new Vec3(this.x, this.y, this.z),
            new Vec3(this.x, this.z, this.y),
            new Vec3(this.y, this.x, this.z),
            new Vec3(this.y, this.z, this.x),
            new Vec3(this.z, this.x, this.y),
            new Vec3(this.z, this.y, this.x)
        ];
    }
}


