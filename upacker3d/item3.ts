// Предмет, имеющий Ш/В/Г и позицию в пространстве
class Item3 {

    constructor(public size: Vec3, public pos: Vec3 = new Vec3()) {}

    isFlat(): boolean {
        if (this.size.x < 2 || this.size.y < 2 || this.size.z < 2) return true;
        return false;
    }

    get drawPaths(): Path2D[] {
        let x = this.pos.x;
        let y = this.pos.y;
        let z = this.pos.z;
        let dx = this.size.x;
        // if (dx < 2) dx = 2;
        let dy = this.size.y;
        // if (dy < 2) dy = 2;
        let dz = this.size.z;
        // if (dz < 2) dz = 2;
        let s30 = Math.sin(Math.PI / 6);
        let c30 = Math.cos(Math.PI / 6);
        let x2 = x + dx;
        let y2 = y + dy;
        let z2 = z + dz;

        let pathXY = new Path2D();
        pathXY.moveTo((x - z2) * c30, y - (x + z2) * s30);
        pathXY.lineTo((x2 - z2) * c30, y - (x2 + z2) * s30);
        pathXY.lineTo((x2 - z2) * c30, y2 - (x2 + z2) * s30);
        pathXY.lineTo((x - z2) * c30, y2 - (x + z2) * s30);

        let pathZY = new Path2D();
        pathZY.moveTo((-z + x2) * c30, y - (z + x2) * s30);
        pathZY.lineTo((-z2 + x2) * c30, y - (z2 + x2) * s30);
        pathZY.lineTo((-z2 + x2) * c30, y2 - (z2 + x2) * s30);
        pathZY.lineTo((-z + x2) * c30, y2 - (z + x2) * s30);

        let pathXZ = new Path2D();
        pathXZ.moveTo((x - z) * c30, y2 - (x + z) * s30);
        pathXZ.lineTo((x2 - z) * c30, y2 - (x2 + z) * s30);
        pathXZ.lineTo((x2 - z2) * c30, y2 - (x2 + z2) * s30);
        pathXZ.lineTo((x - z2) * c30, y2 - (x + z2) * s30);

        return [pathXY, pathZY, pathXZ];
    }
}