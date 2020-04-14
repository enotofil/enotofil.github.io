"use strict";
;
var Box3 = (function () {
    function Box3(size, name) {
        if (name === void 0) { name = ''; }
        this.size = size;
        this.name = name;
        this.content = [];
        this.descr = [];
        this.pos = Vec3.zero;
    }
    Box3.createBoxForItems = function (itemSize, itemCount) {
        var minDimensionSum = Number.MAX_VALUE;
        var bestFit = Vec3.zero;
        for (var rowX = 1; rowX <= itemCount; rowX++) {
            for (var rowY = 1; rowY <= Math.ceil(itemCount / rowX); rowY++) {
                var rowZ = Math.ceil(itemCount / rowX / rowY);
                var dimSum = itemSize.x * rowX + itemSize.y * rowY + itemSize.z * rowZ;
                if (dimSum < minDimensionSum) {
                    minDimensionSum = dimSum;
                    bestFit = new Vec3(rowX, rowY, rowZ);
                }
            }
        }
        var box = new Box3(Vec3.mul(bestFit, itemSize));
        var itemsLeft = itemCount;
        for (var rowX = 0; rowX < bestFit.x; rowX++) {
            for (var rowY = 0; rowY < bestFit.y; rowY++) {
                for (var rowZ = 0; rowZ < bestFit.z; rowZ++) {
                    if (itemsLeft == 0)
                        break;
                    var rowPos = new Vec3(rowX, rowY, rowZ);
                    var item = new Item3(itemSize);
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
    };
    Box3.prototype.fillWithItems = function (itemSize) {
        var _this = this;
        var bestRotation = Vec3.zero;
        var maxCount = 0;
        var bestRows = Vec3.zero;
        var maxAddCount = 0;
        var bestAddBox = new Box3(Vec3.zero);
        itemSize.rotations.forEach(function (r) {
            var rows = new Vec3(Math.floor(_this.size.x / r.x), Math.floor(_this.size.y / r.y), Math.floor(_this.size.z / r.z));
            var count = rows.vol;
            if (count > maxCount) {
                maxCount = count;
                bestRotation = r;
                bestRows = rows;
            }
        });
        if (maxCount == 0) {
            this.descr = [];
            return;
        }
        for (var rowX = 0; rowX < bestRows.x; rowX++) {
            for (var rowY = 0; rowY < bestRows.y; rowY++) {
                for (var rowZ = 0; rowZ < bestRows.z; rowZ++) {
                    var item = new Item3(bestRotation);
                    item.pos = new Vec3(rowX * bestRotation.x, rowY * bestRotation.y, rowZ * bestRotation.z);
                    this.content.push(item);
                }
            }
        }
        this.descr.push({
            item: bestRotation,
            rows: bestRows,
            count: this.content.length,
        });
        var remainX = new Box3(new Vec3(this.size.x - bestRotation.x * bestRows.x, this.size.y, this.size.z));
        remainX.pos = new Vec3(bestRotation.x * bestRows.x, 0, 0);
        var remainY = new Box3(new Vec3(this.size.x, this.size.y - bestRotation.y * bestRows.y, this.size.z));
        remainY.pos = new Vec3(0, bestRotation.y * bestRows.y, 0);
        var remainZ = new Box3(new Vec3(this.size.x, this.size.y, this.size.z - bestRotation.z * bestRows.z));
        remainZ.pos = new Vec3(0, 0, bestRotation.z * bestRows.z);
        [remainX, remainY, remainZ].forEach(function (addBox) {
            addBox.fillWithItems(itemSize);
            if (maxAddCount < addBox.content.length) {
                bestAddBox = addBox;
                maxAddCount = addBox.content.length;
            }
        });
        bestAddBox.content.forEach(function (addItem) {
            addItem.pos = Vec3.add(addItem.pos, bestAddBox.pos);
            _this.content.push(addItem);
        });
        if (maxAddCount > 0) {
            this.descr = this.descr.concat(bestAddBox.descr);
        }
    };
    Box3.prototype.draw = function (canvas) {
        var w = canvas.width;
        var h = canvas.height;
        var ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var bounds = this.renderBounds;
        var boxW = bounds.x2 - bounds.x1;
        var boxH = bounds.y2 - bounds.y1;
        var centerX = bounds.x1 + boxW / 2;
        var centerY = bounds.y1 + boxH / 2;
        var scale = Math.min(w * 0.96 / boxW, h * 0.96 / boxH);
        var x = w / 2 - centerX * scale;
        var y = h / 2 - centerY * scale;
        ctx.setTransform(scale, 0, 0, -scale, x, y);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        var sideColors = [
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
        var boxItem = new Item3(this.size);
        boxItem.drawPaths.forEach(function (path) {
            path.closePath();
            ctx.stroke(path);
        });
    };
    Object.defineProperty(Box3.prototype, "renderBounds", {
        get: function () {
            var s30 = Math.sin(Math.PI / 6);
            var c30 = Math.cos(Math.PI / 6);
            return {
                x1: -this.size.z * c30,
                y1: -this.size.y,
                x2: this.size.x * c30,
                y2: (this.size.x + this.size.z) * s30
            };
        },
        enumerable: true,
        configurable: true
    });
    return Box3;
}());
function onFindBoxClick() {
    var _a, _b;
    var mainContainer = document.getElementById("main-container");
    var itemCountEl = document.getElementById("item-count");
    var tableHeader = document.getElementById("table-header-box");
    var tableBody = document.getElementById("table-body-box");
    var canvas = document.getElementById('render-area-box');
    canvas.width = mainContainer.clientWidth;
    canvas.height = Math.min(window.innerHeight * 0.8, canvas.width);
    var itemSize = readXYZInput('item1');
    var itemCount = itemCountEl.valueAsNumber;
    if (isNaN(itemCount) || itemCount <= 0 || !itemSize.isValid()) {
        console.log("Bad input!");
        tableHeader.innerHTML =
            "<tr class=\"table-danger\">\n            <th colspan=\"3\">\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0432\u043E\u0434\u0430</th>        \n        </tr>";
        tableBody.innerHTML = '';
        canvas.height = 1;
        return;
    }
    var mainBox = Box3.createBoxForItems(itemSize, itemCount);
    tableHeader.innerHTML =
        "<tr class=\"table-secondary\">\n        <th scope=\"col\">\u043A\u043E\u0440\u043E\u0431\u043A\u0430</th>\n        <th scope=\"col\">\u043F\u0440\u0435\u0434\u043C\u0435\u0442</th>\n        <th scope=\"col\">\u0440\u044F\u0434\u044B</th>\n        <th scope=\"col\">\u043A\u043E\u043B. (\u043C\u0430\u043A\u0441.)</th>\n    </tr>";
    if (mainBox.content.length == 0) {
        tableBody.innerHTML =
            "<tr class=\"table-danger\">\n            <td colspan=\"3\">\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u0431\u043E\u043B\u044C\u0448\u0435 \u043A\u043E\u0440\u043E\u0431\u043A\u0438:</td>\n            <td><b>" + mainBox.content.length + "</b></td>\n        </tr>";
    }
    else {
        tableBody.innerHTML =
            "<tr>\n        <td><b>" + mainBox.size.toString() + "</b></td>\n        <td>" + itemSize.toString() + "</td>            \n        <td>" + ((_a = mainBox.descr[0].rows) === null || _a === void 0 ? void 0 : _a.toString()) + "</td>\n        <td>" + (itemCount + ' (' + ((_b = mainBox.descr[0].rows) === null || _b === void 0 ? void 0 : _b.vol) + ')') + "</td>\n    </tr>";
        mainBox.draw(canvas);
    }
}
function onFindCountClick(wipeTable) {
    if (wipeTable === void 0) { wipeTable = true; }
    var mainContainer = document.getElementById("main-container");
    var tableHeader = document.getElementById("table-header-count");
    var tableBody = document.getElementById("table-body-count");
    var canvas = document.getElementById('render-area-count');
    canvas.width = mainContainer.clientWidth;
    canvas.height = Math.min(window.innerHeight * 0.8, canvas.width);
    var itemSize = readXYZInput('item2');
    var boxSize = readXYZInput('box');
    if (!itemSize.isValid() || !boxSize.isValid()) {
        console.log("Bad input!");
        tableHeader.innerHTML =
            "<tr class=\"table-danger\">\n                <th colspan=\"3\">\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0432\u043E\u0434\u0430</th>        \n            </tr>";
        tableBody.innerHTML = '';
        canvas.height = 1;
        return;
    }
    var mainBox = new Box3(boxSize);
    mainBox.fillWithItems(itemSize);
    tableHeader.innerHTML =
        "<tr class=\"table-secondary\">\n            <th scope=\"col\">\u043F\u0440\u0435\u0434\u043C\u0435\u0442</th>\n            <th scope=\"col\">\u0440\u044F\u0434\u044B</th>\n            <th scope=\"col\">\u043A\u043E\u043B.</th>\n        </tr>";
    if (wipeTable)
        tableBody.innerHTML = "";
    mainBox.descr.forEach(function (row) {
        var _a, _b;
        var tableRow = "<tr>\n            <td>" + ((_a = row.item) === null || _a === void 0 ? void 0 : _a.toString()) + "</td>\n            <td>" + ((_b = row.rows) === null || _b === void 0 ? void 0 : _b.toString()) + "</td>\n            <td>" + row.count + "</td>\n        </tr>";
        tableBody.insertAdjacentHTML('beforeend', tableRow);
    });
    if (mainBox.content.length == 0) {
        tableBody.insertAdjacentHTML('beforeend', "<tr class=\"table-danger\">\n            <td colspan=\"2\">\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u0431\u043E\u043B\u044C\u0448\u0435 \u043A\u043E\u0440\u043E\u0431\u043A\u0438</td>\n            <td><b>" + mainBox.content.length + "</b></td>\n        </tr>");
        canvas.height = 1;
    }
    else {
        tableBody.insertAdjacentHTML('beforeend', "<tr class=\"table-secondary\">\n            <td colspan=\"2\">\u0418\u0442\u043E\u0433\u043E \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432 \u0432 \u043A\u043E\u0440\u043E\u0431\u043A\u0435 " + mainBox.size.toString() + ":</td>\n            <td><b>" + mainBox.content.length + "</b></td>\n        </tr>");
        if (wipeTable)
            mainBox.draw(canvas);
        else
            canvas.height = 1;
    }
}
function setBoxPreset(presetName, wipeTable) {
    if (wipeTable === void 0) { wipeTable = true; }
    var boxLabel = document.getElementById('box-label');
    boxLabel.innerHTML = "Коробка " + presetName;
    var preset = boxPresets[presetName];
    var boxSize = new Vec3(preset[0], preset[1], preset[2]);
    setXYZInput('box', boxSize);
    onFindCountClick(wipeTable);
}
function countAllPresets() {
    var tableBody = document.getElementById("table-body-count");
    tableBody.innerHTML = "";
    for (var presetName in boxPresets) {
        var size = boxPresets[presetName];
        tableBody.insertAdjacentHTML('beforeend', "\n                    <tr></tr>\n                    <tr>\n                        <td colspan=\"3\"><b>" +
            presetName + ': ' + size[0] + ' x ' + size[1] + ' x ' + size[2] +
            "</b></td>\n                    </tr>\n            ");
        setBoxPreset(presetName, false);
    }
}
function onBoxChange() {
    var boxLabel = document.getElementById('box-label');
    boxLabel.innerHTML = "Коробка";
}
var Item3 = (function () {
    function Item3(size) {
        this.size = size;
        this.pos = Vec3.zero;
    }
    Object.defineProperty(Item3.prototype, "drawPaths", {
        get: function () {
            var x = this.pos.x;
            var y = this.pos.y;
            var z = this.pos.z;
            var dx = this.size.x;
            var dy = this.size.y;
            var dz = this.size.z;
            var s30 = Math.sin(Math.PI / 6);
            var c30 = Math.cos(Math.PI / 6);
            var x2 = x + dx;
            var y2 = y + dy;
            var z2 = z + dz;
            var pathXY = new Path2D();
            pathXY.moveTo((x - z2) * c30, y - (x + z2) * s30);
            pathXY.lineTo((x2 - z2) * c30, y - (x2 + z2) * s30);
            pathXY.lineTo((x2 - z2) * c30, y2 - (x2 + z2) * s30);
            pathXY.lineTo((x - z2) * c30, y2 - (x + z2) * s30);
            var pathZY = new Path2D();
            pathZY.moveTo((-z + x2) * c30, y - (z + x2) * s30);
            pathZY.lineTo((-z2 + x2) * c30, y - (z2 + x2) * s30);
            pathZY.lineTo((-z2 + x2) * c30, y2 - (z2 + x2) * s30);
            pathZY.lineTo((-z + x2) * c30, y2 - (z + x2) * s30);
            var pathXZ = new Path2D();
            pathXZ.moveTo((x - z) * c30, y2 - (x + z) * s30);
            pathXZ.lineTo((x2 - z) * c30, y2 - (x2 + z) * s30);
            pathXZ.lineTo((x2 - z2) * c30, y2 - (x2 + z2) * s30);
            pathXZ.lineTo((x - z2) * c30, y2 - (x + z2) * s30);
            return [pathXY, pathZY, pathXZ];
        },
        enumerable: true,
        configurable: true
    });
    return Item3;
}());
var boxPresets = {
    MICRO: [175, 145, 145],
    MINI: [330, 175, 200],
    MIDI: [380, 285, 304],
    MAXI: [630, 340, 320]
};
var boxPresetEl = document.getElementById("box-presets");
for (var preset in boxPresets) {
    var size = boxPresets[preset];
    var presetStr = '<a class="dropdown-item" href="#" onclick="setBoxPreset(\'' +
        preset + '\')">' + preset + ": " +
        size[0] + ' x ' + size[1] + ' x ' + size[2] + '</a>';
    boxPresetEl.insertAdjacentHTML('beforeend', presetStr);
}
;
boxPresetEl.insertAdjacentHTML('beforeend', "\n        <a class=\"dropdown-item\" href=\"#\" onclick=\"countAllPresets()\">\n            \u0421\u0447\u0438\u0442\u0430\u0442\u044C \u0432\u0441\u0435\n        </a>");
window.addEventListener('resize', resizeAllCanvas);
function readXYZInput(id) {
    var x = document.getElementById(id + "-x");
    var y = document.getElementById(id + "-y");
    var z = document.getElementById(id + "-z");
    return new Vec3(x.valueAsNumber, y.valueAsNumber, z.valueAsNumber);
}
function setXYZInput(id, size) {
    var x = document.getElementById(id + "-x");
    x.value = size.x.toString();
    var y = document.getElementById(id + "-y");
    y.value = size.y.toString();
    var z = document.getElementById(id + "-z");
    z.value = size.z.toString();
}
function resizeAllCanvas() {
    var canvas1 = document.getElementById('render-area-box');
    canvas1.height = 1;
    var canvas2 = document.getElementById('render-area-count');
    canvas2.height = 1;
}
var Vec3 = (function () {
    function Vec3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vec3.add = function (v1, v2) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    };
    Vec3.mul = function (v1, v2) {
        return new Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    };
    Vec3.prototype.isValid = function () {
        if (isNaN(this.x) || isNaN(this.y) || isNaN(this.z)) {
            return false;
        }
        if (this.x <= 0 || this.y <= 0 || this.z <= 0) {
            return false;
        }
        return true;
    };
    Vec3.prototype.toString = function () {
        return this.x + " x " + this.y + " x " + this.z;
    };
    Object.defineProperty(Vec3.prototype, "vol", {
        get: function () {
            return this.x * this.y * this.z;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vec3.prototype, "rotations", {
        get: function () {
            return [
                new Vec3(this.x, this.y, this.z),
                new Vec3(this.x, this.z, this.y),
                new Vec3(this.y, this.x, this.z),
                new Vec3(this.y, this.z, this.x),
                new Vec3(this.z, this.x, this.y),
                new Vec3(this.z, this.y, this.x)
            ];
        },
        enumerable: true,
        configurable: true
    });
    Vec3.zero = new Vec3(0, 0, 0);
    return Vec3;
}());
