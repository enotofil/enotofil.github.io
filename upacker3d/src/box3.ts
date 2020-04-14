"use strict";

// строка в таблице результатов вычислений
interface TableEntry {
    item?: Vec3;    // ориентированный предмет
    rows?: Vec3;    // ряды предметов по Ш/В/Г
    count?: number; // количество предметов
};

// Контейнер
class Box3 {
    content: Item3[]; // размещенные и ориентированные предметы
    descr: TableEntry[];
    pos: Vec3; // для помежуточных вычислений, в итоге Vec3.zero 

    constructor(public size: Vec3, public name: string = '') {
        this.content = [];
        this.descr = [];
        this.pos = Vec3.zero;
    }

    // Расчет оптимального (мин. сумма сторон) контейнера для заданного кол-ва
    static createBoxForItems(itemSize: Vec3, itemCount: number): Box3 {
        let minDimensionSum = Number.MAX_VALUE;

        let bestFit = Vec3.zero; // комбинации рядов Ш/В/Г с меньшей суммой сторон 

        // находим bestFit, перебирая все возможные варианты
        for (let rowX = 1; rowX <= itemCount; rowX++) {
            for (let rowY = 1; rowY <= Math.ceil(itemCount / rowX); rowY++) {
                let rowZ = Math.ceil(itemCount / rowX / rowY);
                let dimSum = itemSize.x * rowX + itemSize.y * rowY + itemSize.z * rowZ;
                if (dimSum < minDimensionSum) {
                    minDimensionSum = dimSum;
                    bestFit = new Vec3(rowX, rowY, rowZ);
                }
            }
        }

        let box = new Box3(Vec3.mul(bestFit, itemSize)); // контейнер определен

        let itemsLeft = itemCount;

        // размещает предметы в контейнере в соответствии с bestFit
        for (let rowX = 0; rowX < bestFit.x; rowX++) {
            for (let rowY = 0; rowY < bestFit.y; rowY++) {
                for (let rowZ = 0; rowZ < bestFit.z; rowZ++) {
                    if (itemsLeft == 0) break;

                    let rowPos = new Vec3(rowX, rowY, rowZ);

                    let item = new Item3(itemSize);
                    item.pos = Vec3.mul(rowPos, itemSize);
                    box.content.push(item);

                    itemsLeft--;
                }
            }
        }
        box.descr.push({
            item: itemSize,
            rows: bestFit,
            count: itemCount,
        });

        return box;
    }

    // Размещение максимального количества заданных предметов ----------------
    fillWithItems(itemSize: Vec3) {
        let bestRotation = Vec3.zero;
        let maxCount = 0;
        let bestRows = Vec3.zero;
        let maxAddCount = 0;
        let bestAddBox = new Box3(Vec3.zero);
        // определяем, при какой ориентации больше вмещается
        itemSize.rotations.forEach((r) => {
            let rows = new Vec3(
                Math.floor(this.size.x / r.x),
                Math.floor(this.size.y / r.y),
                Math.floor(this.size.z / r.z)
            );
            let count = rows.vol;
            if (count > maxCount) {
                maxCount = count;
                bestRotation = r;
                bestRows = rows;
            }
        });

        if (maxCount == 0) {
            this.descr = []; // предмет больше контейнера
            // выход из рекурсии при размещении в оставшемся объеме
            return;
        }

        // размещаем повернутые предметы       
        for (let rowX = 0; rowX < bestRows.x; rowX++) {
            for (let rowY = 0; rowY < bestRows.y; rowY++) {
                for (let rowZ = 0; rowZ < bestRows.z; rowZ++) {
                    let item = new Item3(bestRotation);
                    item.pos = new Vec3(
                        rowX * bestRotation.x,
                        rowY * bestRotation.y,
                        rowZ * bestRotation.z
                    );
                    this.content.push(item);
                }
            }
        }
        this.descr.push({
            item: bestRotation,
            rows: bestRows,
            count: this.content.length,
        });

        // размещение в оставшемся свободном объеме
        // oпределяем оставшиеся области по 3 осям
        let remainX = new Box3(new Vec3(
            this.size.x - bestRotation.x * bestRows.x,
            this.size.y,
            this.size.z
        ));
        remainX.pos = new Vec3(bestRotation.x * bestRows.x, 0, 0);

        let remainY = new Box3(new Vec3(
            this.size.x,
            this.size.y - bestRotation.y * bestRows.y,
            this.size.z
        ));
        remainY.pos = new Vec3(0, bestRotation.y * bestRows.y, 0);

        let remainZ = new Box3(new Vec3(
            this.size.x,
            this.size.y,
            this.size.z - bestRotation.z * bestRows.z
        ));
        remainZ.pos = new Vec3(0, 0, bestRotation.z * bestRows.z);

        // определяем, в какую из 3х вмещается больше предметов
        [remainX, remainY, remainZ].forEach(function (addBox) {
            addBox.fillWithItems(itemSize);
            if (maxAddCount < addBox.content.length) {
                bestAddBox = addBox;
                maxAddCount = addBox.content.length;
            }

        });
        // добавляем дополнительно размещенные предметы к основным
        bestAddBox.content.forEach((addItem) => {
            addItem.pos = Vec3.add(addItem.pos, bestAddBox.pos)
            this.content.push(addItem);
        });
        if (maxAddCount > 0) {
            this.descr = this.descr.concat(bestAddBox.descr);
        }

    }

    // ------------------------------------------ render

    draw(canvas: HTMLCanvasElement) {
        let w = canvas.width;
        let h = canvas.height;

        let ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
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

        let boxItem = new Item3(this.size);
        boxItem.drawPaths.forEach(function (path) {
            path.closePath();
            ctx.stroke(path);
        });
    }

    // ---------------------------end render

    get renderBounds() {
        let s30 = Math.sin(Math.PI / 6);
        let c30 = Math.cos(Math.PI / 6);
        return {
            x1: -this.size.z * c30,
            y1: -this.size.y,
            x2: this.size.x * c30,
            y2: (this.size.x + this.size.z) * s30
        }
    }
}

