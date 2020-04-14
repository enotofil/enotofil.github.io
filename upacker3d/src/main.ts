"use strict";

let boxPresets: Record<string, number[]> = {
    MICRO: [175, 145, 145],
    MINI: [330, 175, 200],
    MIDI: [380, 285, 304],
    MAXI: [630, 340, 320]
};

let boxPresetEl = <HTMLElement>document.getElementById("box-presets");

for (var preset in boxPresets) {
    let size = boxPresets[preset];
    let presetStr = '<a class="dropdown-item" href="#" onclick="setBoxPreset(\'' +
        preset + '\')">' + preset + ": " +
        size[0] + ' x ' + size[1] + ' x ' + size[2] + '</a>';
    boxPresetEl.insertAdjacentHTML('beforeend', presetStr);
};

boxPresetEl.insertAdjacentHTML('beforeend', `
        <a class="dropdown-item" href="#" onclick="countAllPresets()">
            Считать все
        </a>`);

window.addEventListener('resize', resizeAllCanvas);


function readXYZInput(id: string): Vec3 {
    let x = <HTMLInputElement>document.getElementById(id + "-x");
    let y = <HTMLInputElement>document.getElementById(id + "-y");
    let z = <HTMLInputElement>document.getElementById(id + "-z");
    return new Vec3(x.valueAsNumber, y.valueAsNumber, z.valueAsNumber);
}

function setXYZInput(id: string, size: Vec3) {
    let x = <HTMLInputElement>document.getElementById(id + "-x");
    x.value = size.x.toString();
    let y = <HTMLInputElement>document.getElementById(id + "-y");
    y.value = size.y.toString();
    let z = <HTMLInputElement>document.getElementById(id + "-z");
    z.value = size.z.toString();
}

function resizeAllCanvas() {
    let canvas1 = <HTMLCanvasElement>document.getElementById('render-area-box');
    canvas1.height = 1
    let canvas2 = <HTMLCanvasElement>document.getElementById('render-area-count');
    canvas2.height = 1
}