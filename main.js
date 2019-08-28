let boxPresets = {
    MICRO: [175, 145, 145],
    MINI: [330, 200, 175],
    MIDI: [380, 304, 285],
    MAXI: [630, 320, 340]
};

let dropdown = document.getElementById("box-presets");
for (var preset in boxPresets) {
    let size = boxPresets[preset];
    let presetStr = '<a class="dropdown-item" href="#" onclick="setBoxPreset(\'' +
        preset + '\')">' + preset + ": " +
        size[0] + ' x ' + size[1] + ' x ' + size[2] + '</a';
    dropdown.insertAdjacentHTML('beforeend', presetStr);
};

let mainBox = null;

let canvas = document.getElementById('render_area');

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

function resizeCanvas() {
    canvas.width = document.getElementById("main-container").clientWidth;// * 0.8;
    canvas.height = Math.min(window.innerHeight * 0.8, canvas.width);
    if (mainBox != null) {
        mainBox.draw(canvas);
    }
}

function onCountClick() {
    let boxInputs = ["box-x", "box-y", "box-z"];
    let boxSize = [0, 0, 0];
    let itemInputs = ["item-x", "item-y", "item-z"];
    let itemSize = [0, 0, 0];

    boxInputs.forEach((id, i) => {
        boxSize[i] = document.getElementById(id).valueAsNumber;
    });

    itemInputs.forEach((id, i) => {
        itemSize[i] = document.getElementById(id).valueAsNumber;
    });

    if (boxSize.includes(NaN) || itemSize.includes(NaN)) {
        console.log("Bad input!");
        return;
    }
    console.log("Processing: box size = ", boxSize, "item size = ", itemSize);

    mainBox = new Box3(boxSize);
    mainBox.fillWith(itemSize);
    fillTable(mainBox.descr);
    mainBox.draw(canvas);
}

function setBoxPreset(name) {
    let preset = boxPresets[name];
    ["box-x", "box-z", "box-y"].forEach((id, i) => {
        let el = document.getElementById(id);
        el.value = preset[i];
    });
}

function fillTable(descr) {
    let tbody = document.getElementById("item-table");
    tbody.innerHTML = "";
    descr.forEach(row => {
        let tableRow = `<tr>
            <td>${row[0]}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
        </tr>`
        tbody.insertAdjacentHTML('beforeend', tableRow);
    });
    tbody.insertAdjacentHTML('beforeend', `<tr class="table-secondary">
        <td colspan="2">Итого:</td>
        <td><b>${mainBox.content.length}</b></td>
    </tr>`);
}
