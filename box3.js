"use strict";

class Box3 {
    constructor(size) {
        this.pos = [0, 0, 0]; // [X, Y, Z]
        this.size = [size[0], size[1], size[2]];
        this.content = []; // boxes inside this box
        this.descr = [];
    }

    fillWith(itemSize) {
        // 6 возможных ориентаций предмета
        let rotations = [
            [0, 1, 2],
            [0, 2, 1],
            [1, 0, 2],
            [1, 2, 0],
            [2, 0, 1],
            [2, 1, 0]
        ];
        let bestRotation = [];
        let maxCount = 0;
        let bestRows = [];
        let maxAddCount = 0;
        let bestAddBox = new Box3([]);
        // определяем, при какой ориентации больше вмещается
        rotations.forEach((r) => {
            let rows = [
                Math.floor(this.size[0] / itemSize[r[0]]),
                Math.floor(this.size[1] / itemSize[r[1]]),
                Math.floor(this.size[2] / itemSize[r[2]])
            ];
            let count = rows[0] * rows[1] * rows[2];
            if (count > maxCount) {
                maxCount = count;
                bestRotation = r;
                bestRows = rows;
            }
        });

        if (maxCount == 0) {
            this.descr = [["предмет", "больше", "контейнера"]];
            // выход из рекурсии при размещении в оставшемся объеме
            return;
        }

        // размещаем повернутые предметы
        let rotatedItemSize = [
            itemSize[bestRotation[0]],
            itemSize[bestRotation[1]],
            itemSize[bestRotation[2]]];
        for (let rowX = 0; rowX < bestRows[0]; rowX++) {
            for (let rowY = 0; rowY < bestRows[1]; rowY++) {
                for (let rowZ = 0; rowZ < bestRows[2]; rowZ++) {
                    let item = new Box3(rotatedItemSize);
                    item.pos = [
                        rowX * rotatedItemSize[0],
                        rowY * rotatedItemSize[1],
                        rowZ * rotatedItemSize[2]
                    ];
                    this.content.push(item);
                }
            }
        }
        this.descr.push([
            `${rotatedItemSize[0]} x ${rotatedItemSize[2]} x ${rotatedItemSize[1]}`,
            `${bestRows[0]} x ${bestRows[2]} x ${bestRows[1]}`,
            this.content.length
        ]);

        // размещение в оставшемся свободном объеме
        // oпределяем оставшиеся области по 3 осям
        let remainX = new Box3([
            this.size[0] - rotatedItemSize[0] * bestRows[0],
            this.size[1],
            this.size[2]
        ]);
        remainX.pos = [rotatedItemSize[0] * bestRows[0], 0, 0];

        let remainY = new Box3([
            this.size[0],
            this.size[1] - rotatedItemSize[1] * bestRows[1],
            this.size[2]
        ]);
        remainY.pos = [0, rotatedItemSize[1] * bestRows[1], 0];

        let remainZ = new Box3([
            this.size[0],
            this.size[1],
            this.size[2] - rotatedItemSize[2] * bestRows[2]
        ]);
        remainZ.pos = [0, 0, rotatedItemSize[2] * bestRows[2]];

        // определяем, в какую из 3х вмещается больше предметов
        [remainX, remainY, remainZ].forEach(function (addBox) {
            addBox.fillWith(itemSize); //, allowDiffDir);
            if (maxAddCount < addBox.content.length) {
                bestAddBox = addBox;
                maxAddCount = addBox.content.length;
            }

        });
        // добавляем дополнительно размещенные предметы к основным
        bestAddBox.content.forEach((addItem) => {
            addItem.pos[0] += bestAddBox.pos[0];
            addItem.pos[1] += bestAddBox.pos[1];
            addItem.pos[2] += bestAddBox.pos[2];
            this.content.push(addItem);
        });
        // this.descr += bestRows[0] + " * " + bestRows[1] + " * " + bestRows[2];
        if (maxAddCount > 0) {
            this.descr = this.descr.concat(bestAddBox.descr);
        }
    }

    // ------------------------------------------ render

    draw(canvas) {
        let w = canvas.width;
        let h = canvas.height;

        let ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let bounds = this.renderBounds;
        let boxW = bounds.x2 - bounds.x1;
        let boxH = bounds.y2 - bounds.y1;
        let centerX = bounds.x1 + boxW / 2;
        let centerY = bounds.y1 + boxH / 2;
        let scale = Math.min(w * 0.96 / boxW, h * 0.96 / boxH);
        let x = w / 2 - centerX * scale;
        let y = h / 2 - centerY * scale;

        ctx.setTransform(scale, 0, 0, -scale, x, y);

        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1;
        let sideColors = [
            'rgb(205, 205, 180)',
            'rgb(250, 250, 220)',
            'rgb(255, 255, 255)'
        ];
        this.content.forEach(function (item) {
            item.drawPaths.forEach(function (path, i) {
                path.closePath();
                ctx.fillStyle = sideColors[i];
                ctx.fill(path);
                ctx.stroke(path);
            });
        });

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.drawPaths.forEach(function (path) {
            path.closePath();
            ctx.stroke(path);
        });
    }

    // ---------------------------end render

    get renderBounds() {
        let s30 = Math.sin(Math.PI / 6);
        let c30 = Math.cos(Math.PI / 6);
        return {
            x1: -this.size[2] * c30,
            y1: -this.size[1],
            x2: this.size[0] * c30,
            y2: (this.size[0] + this.size[2]) * s30
        }
    }

    get drawPaths() {
        let x = this.pos[0];
        let y = this.pos[1];
        let z = this.pos[2];
        let dx = this.size[0];
        let dy = this.size[1];
        let dz = this.size[2];
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

    get sizeStr() {
        return this.size[0] + " x " + this.size[2] + " x " + this.size[1];
    }
}

