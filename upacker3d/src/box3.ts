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

    constructor(
        public size: Vec3 = new Vec3(),
        public pos: Vec3 = new Vec3(),
        public name: string = '') {

        this.content = [];
        this.descr = [];
    }

    // Расчет оптимального (мин. сумма сторон) контейнера для заданного кол-ва
    static createBoxForItems(itemSize: Vec3, itemCount: number): Box3 {
        let minDimensionSum = Number.MAX_VALUE;

        let bestFit = new Vec3(); // комбинации рядов Ш/В/Г с меньшей суммой сторон 

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
    placeMaxItemCount(itemSize: Vec3) {
        this.fillWithItems(itemSize);

        // размещение в оставшемся свободном объеме
        // повторяем, пока добавляется хоть 1 предмет
        while (true) {

            // определение заполненного объема
            let filledSpace = new Vec3();
            this.content.forEach(function(item) {
                let itemMaxPoint = Vec3.add(item.pos, item.size)
                if (itemMaxPoint.x > filledSpace.x) filledSpace.x = itemMaxPoint.x;
                if (itemMaxPoint.y > filledSpace.y) filledSpace.y = itemMaxPoint.y;
                if (itemMaxPoint.z > filledSpace.z) filledSpace.z = itemMaxPoint.z;
            });

            // oпределяем незаполненные области по 3м осям
            let remainX = new Box3(
                new Vec3(this.size.x - filledSpace.x, this.size.y, this.size.z),
                new Vec3(filledSpace.x, 0, 0)
            );

            let remainY = new Box3(
                new Vec3(this.size.x, this.size.y - filledSpace.y, this.size.z),
                new Vec3(0, filledSpace.y, 0)
            );

            let remainZ = new Box3(
                new Vec3(this.size.x, this.size.y, this.size.z - filledSpace.z),
                new Vec3(0, 0, filledSpace.z)
            );

            // определяем, в какую из 3х вмещается больше предметов
            let maxAddCount = 0;
            let bestAddBox = new Box3();
            [remainX, remainY, remainZ].forEach(function(addBox) {
                addBox.fillWithItems(itemSize);
                if (maxAddCount < addBox.content.length) {
                    bestAddBox = addBox;
                    maxAddCount = addBox.content.length;
                }
            });

            if (maxAddCount == 0) break; // больше ничего не лезет, выходим

            this.content = this.content.concat(bestAddBox.content);
            this.descr = this.descr.concat(bestAddBox.descr);
        }
    }

    // поиск оптимальной ориентации предмета и заполнение объема
    fillWithItems(itemSize: Vec3) {
        let bestRotation = new Vec3();
        let maxCount = 0;
        let bestRows = new Vec3();
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
            return;
        }

        // размещаем повернутые предметы       
        for (let rowX = 0; rowX < bestRows.x; rowX++) {
            for (let rowY = 0; rowY < bestRows.y; rowY++) {
                for (let rowZ = 0; rowZ < bestRows.z; rowZ++) {
                    let item = new Item3(bestRotation);
                    item.pos = new Vec3(
                        this.pos.x + rowX * bestRotation.x,
                        this.pos.y + rowY * bestRotation.y,
                        this.pos.z + rowZ * bestRotation.z
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

        this.content.forEach(function(item) {
            if (item.isFlat()) {
                // чтобы не было черноты
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            } else {
                ctx.strokeStyle = 'black';
            }
            item.drawPaths.forEach(function(path, i) {
                path.closePath();
                ctx.fillStyle = sideColors[i];
                ctx.fill(path);
                ctx.stroke(path);
            });
        });

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';

        let boxItem = new Item3(this.size);
        boxItem.drawPaths.forEach(function(path) {
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

