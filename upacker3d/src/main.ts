
let boxPresets: Record<string, number[]> = {
    MICRO: [175, 145, 145],
    MINI: [330, 175, 200],
    MIDI: [380, 285, 304],
    MAXI: [630, 340, 320]
};

// let mainBox: Box3 | null;

let canvas = <HTMLCanvasElement>document.getElementById('render_area');
let boxDescr = <HTMLElement>document.getElementById("box-descr");

let itemSizeX = <HTMLInputElement>document.getElementById("item-x");
let itemSizeY = <HTMLInputElement>document.getElementById("item-y");
let itemSizeZ = <HTMLInputElement>document.getElementById("item-z");

let boxSizeX = <HTMLInputElement>document.getElementById("box-x");
let boxSizeY = <HTMLInputElement>document.getElementById("box-y");
let boxSizeZ = <HTMLInputElement>document.getElementById("box-z");

let itemCountEl = <HTMLInputElement>document.getElementById("item-count");

let tableHeader = <HTMLInputElement>document.getElementById("table-header");
let tableBody = <HTMLInputElement>document.getElementById("table-body");

let boxPresetsEl = <HTMLElement>document.getElementById("box-presets");
for (var preset in boxPresets) {
    let size = boxPresets[preset];
    let presetStr = '<a class="dropdown-item" href="#" onclick="setBoxPreset(\'' +
        preset + '\')">' + preset + ": " +
        size[0] + ' x ' + size[1] + ' x ' + size[2] + '</a>';
    boxPresetsEl.insertAdjacentHTML('beforeend', presetStr);
};
boxPresetsEl.insertAdjacentHTML('beforeend', `
    <a class="dropdown-item" href="#" onclick="countAllPresets()">
        Считать все
    </a>`);

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

function setBoxPreset(presetName: string, wipeTable: boolean = true) {
    let preset = boxPresets[presetName];
    let boxSize = new Vec3(preset[0], preset[1], preset[2]);
    setBoxInput(boxSize);
    onCalcItemCountClick(wipeTable);
}

function countAllPresets() {
    tableBody.innerHTML = "";
    for (var presetName in boxPresets) {

        let preset = boxPresets[presetName];
        let boxSize = new Vec3(preset[0], preset[1], preset[2]);

        tableBody.insertAdjacentHTML('beforeend', `
                <tr></tr>
                <tr>
                    <td colspan="3"><b>` +
            presetName + ': ' + boxSize.toString() +
            `</b></td>
                </tr>
        `);

        setBoxInput(boxSize);
        onCalcItemCountClick(false);
    }
    resizeCanvas();
}

function resizeCanvas() {
    let mainConteiner = <HTMLElement>document.getElementById("main-container");
    canvas.width = mainConteiner.clientWidth;// * 0.8;
    canvas.height = Math.min(window.innerHeight * 0.8, canvas.width);
}

// Расчет оптимального (мин. сумма сторон) контейнера для заданного количества
function onCalcBoxSizeClick() {
    resizeCanvas();

    let itemSize = readItemInput();
    let itemCount = itemCountEl.valueAsNumber;
    if (isNaN(itemCount) || itemCount <= 0 || !itemSize.isValid()) {
        console.log("Bad input!");
        tableHeader.innerHTML =
            `<tr class="table-danger">
                <th colspan="3">Ошибка ввода</th>        
            </tr>`;
        tableBody.innerHTML = '';
        return;
    }

    let mainBox = Box3.createBoxForItems(itemSize, itemCount);
    setBoxInput(mainBox.size);

    tableHeader.innerHTML =
        `<tr class="table-secondary">
            <th scope="col">контейнер</th>
            <th scope="col">предмет</th>
            <th scope="col">ряды</th>
            <th scope="col">кол. (макс.)</th>
        </tr>`;

    if (mainBox.content.length == 0) {
        tableBody.innerHTML =
            `<tr class="table-danger">
                <td colspan="3">Предмет больше контейнера:</td>
                <td><b>${mainBox.content.length}</b></td>
            </tr>`;
    } else {
        tableBody.innerHTML =
            `<tr>
            <td><b>${mainBox.size.toString()}</b></td>
            <td>${itemSize.toString()}</td>            
            <td>${mainBox.descr[0].rows?.toString()}</td>
            <td>${itemCount + ' (' + mainBox.descr[0].rows?.vol + ')'}</td>
        </tr>`;

        mainBox.draw(canvas);
    }
}

// Расчет максимального количества для заданного контейнера -------------------
function onCalcItemCountClick(wipeTable: boolean = true) {
    resizeCanvas();

    let itemSize = readItemInput();
    let boxSize = readBoxInput();
    if (!itemSize.isValid() || !boxSize.isValid()) {
        console.log("Bad input!");
        tableHeader.innerHTML =
            `<tr class="table-danger">
                <th colspan="3">Ошибка ввода</th>        
            </tr>`;
        tableBody.innerHTML = '';
        return;
    }

    let mainBox = new Box3(boxSize);
    mainBox.fillWithItems(itemSize);

    itemCountEl.value = mainBox.content.length.toString();

    tableHeader.innerHTML =
        `<tr class="table-secondary">
            <th scope="col">предмет</th>
            <th scope="col">ряды</th>
            <th scope="col">кол.</th>
        </tr>`;

    if (wipeTable) tableBody.innerHTML = "";

    mainBox.descr.forEach(row => {
        let tableRow = `<tr>
            <td>${row.item?.toString()}</td>
            <td>${row.rows?.toString()}</td>
            <td>${row.count}</td>
        </tr>`
        tableBody.insertAdjacentHTML('beforeend', tableRow);
    });

    if (mainBox.content.length == 0) {
        tableBody.insertAdjacentHTML('beforeend', `<tr class="table-danger">
            <td colspan="2">Предмет больше контейнера:</td>
            <td><b>${mainBox.content.length}</b></td>
        </tr>`);
    } else {
        tableBody.insertAdjacentHTML('beforeend', `<tr class="table-secondary">
            <td colspan="2">Итого предметов в контейнере ${mainBox.size.toString()}:</td>
            <td><b>${mainBox.content.length}</b></td>
        </tr>`);

        mainBox.draw(canvas);
    }
}

function readItemInput(): Vec3 {
    return new Vec3(
        itemSizeX.valueAsNumber,
        itemSizeY.valueAsNumber,
        itemSizeZ.valueAsNumber
    );
}

function readBoxInput(): Vec3 {
    return new Vec3(
        boxSizeX.valueAsNumber,
        boxSizeY.valueAsNumber,
        boxSizeZ.valueAsNumber
    );
}

function setBoxInput(size: Vec3) {
    boxSizeX.value = size.x.toString();
    boxSizeY.value = size.y.toString();
    boxSizeZ.value = size.z.toString();
}
