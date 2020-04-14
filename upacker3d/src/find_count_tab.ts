"use strict";

// Расчет максимального количества для заданного контейнера -------------------
function onFindCountClick(wipeTable: boolean = true) {

    let mainContainer = <HTMLElement>document.getElementById("main-container");
    let tableHeader = <HTMLInputElement>document.getElementById("table-header-count");
    let tableBody = <HTMLInputElement>document.getElementById("table-body-count");
    let canvas = <HTMLCanvasElement>document.getElementById('render-area-count');


    // resize canvas
    canvas.width = mainContainer.clientWidth;
    canvas.height = Math.min(window.innerHeight * 0.8, canvas.width);

    let itemSize = readXYZInput('item2');
    let boxSize = readXYZInput('box');
    if (!itemSize.isValid() || !boxSize.isValid()) {
        console.log("Bad input!");
        tableHeader.innerHTML =
            `<tr class="table-danger">
                <th colspan="3">Ошибка ввода</th>        
            </tr>`;
        tableBody.innerHTML = '';
        canvas.height = 1;
        return;
    }

    let mainBox = new Box3(boxSize);
    mainBox.fillWithItems(itemSize);

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
            <td colspan="2">Предмет больше коробки</td>
            <td><b>${mainBox.content.length}</b></td>
        </tr>`);
        canvas.height = 1;
    } else {
        tableBody.insertAdjacentHTML('beforeend', `<tr class="table-secondary">
            <td colspan="2">Итого предметов в коробке ${mainBox.size.toString()}:</td>
            <td><b>${mainBox.content.length}</b></td>
        </tr>`);

        if (wipeTable) mainBox.draw(canvas);
        else canvas.height = 1;
    }
}

///////////////////////////////////////////////////////////////////////////////////////

function setBoxPreset(presetName: string, wipeTable: boolean = true) {
    let boxLabel = <HTMLElement>document.getElementById('box-label');
    boxLabel.innerHTML = "Коробка " + presetName;

    let preset = boxPresets[presetName];
    let boxSize = new Vec3(preset[0], preset[1], preset[2]);
    setXYZInput('box', boxSize);
    onFindCountClick(wipeTable);
}

function countAllPresets() {
    let tableBody = <HTMLInputElement>document.getElementById("table-body-count");

    tableBody.innerHTML = "";
    for (var presetName in boxPresets) {
        let size = boxPresets[presetName];

        tableBody.insertAdjacentHTML('beforeend', `
                    <tr></tr>
                    <tr>
                        <td colspan="3"><b>` +
            presetName + ': ' + size[0] + ' x ' + size[1] + ' x ' + size[2] +
            `</b></td>
                    </tr>
            `);

        setBoxPreset(presetName, false);
    }
}

function onBoxChange() {
    let boxLabel = <HTMLElement>document.getElementById('box-label');
    boxLabel.innerHTML = "Коробка";
}