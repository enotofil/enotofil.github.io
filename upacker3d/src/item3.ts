// Предмет, имеющий Ш/В/Г и позицию в пространстве
class Item3 {
    pos: Vec3;

    constructor(public size: Vec3) {
        this.pos = Vec3.zero;
    }

    get drawPaths(): Path2D[] {
        let x = this.pos.x;
        let y = this.pos.y;
        let z = this.pos.z;
        let dx = this.size.x;
        let dy = this.size.y;
        let dz = this.size.z;
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