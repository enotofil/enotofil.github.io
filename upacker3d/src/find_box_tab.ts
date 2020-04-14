"use strict";

function onFindBoxClick() {

    let mainContainer = <HTMLElement>document.getElementById("main-container");
    let itemCountEl = <HTMLInputElement>document.getElementById("item-count");
    let tableHeader = <HTMLInputElement>document.getElementById("table-header-box");
    let tableBody = <HTMLInputElement>document.getElementById("table-body-box");
    let canvas = <HTMLCanvasElement>document.getElementById('render-area-box');

    // resize canvas
    canvas.width = mainContainer.clientWidth;
    canvas.height = Math.min(window.innerHeight * 0.8, canvas.width);

    let itemSize = readXYZInput('item1');
    let itemCount = itemCountEl.valueAsNumber;
    if (isNaN(itemCount) || itemCount <= 0 || !itemSize.isValid()) {
        console.log("Bad input!");
        tableHeader.innerHTML =
            `<tr class="table-danger">
            <th colspan="3">Ошибка ввода</th>        
        </tr>`;
        tableBody.innerHTML = '';
        canvas.height = 1;
        return;
    }

    let mainBox = Box3.createBoxForItems(itemSize, itemCount);

    tableHeader.innerHTML =
        `<tr class="table-secondary">
        <th scope="col">коробка</th>
        <th scope="col">предмет</th>
        <th scope="col">ряды</th>
        <th scope="col">кол. (макс.)</th>
    </tr>`;

    if (mainBox.content.length == 0) {
        tableBody.innerHTML =
            `<tr class="table-danger">
            <td colspan="3">Предмет больше коробки:</td>
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
