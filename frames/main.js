
let mainBox = null;

function onCountClick() {
    let profLength = document.getElementById("prof-length").valueAsNumber;
    let profWidth = document.getElementById("prof-width").valueAsNumber;
    let frameWidth = document.getElementById("frame-width").valueAsNumber;
    let frameHeight = document.getElementById("frame-height").valueAsNumber;
    let rangeMin = document.getElementById("frames-min").valueAsNumber;
    let rangeMax = document.getElementById("frames-max").valueAsNumber;
    if ([profLength, profWidth, frameWidth, frameHeight, rangeMin, rangeMax].includes(NaN)) {
        $("#count-table > tr").remove();
        $("#outer-size").html("введены недопустимые значения");
        return;
    }
    let outerSize = [
        frameWidth + 2 * profWidth,
        frameHeight + 2 * profWidth,
    ];
    $("#outer-size").html("Внешние размеры изделия: ш = " + outerSize[0] + "; в = " + outerSize[1]);

    let solutions = [];
    for (i = rangeMin; i <= rangeMax; i++) {
        solutions.push(new Solution(profLength, outerSize, i));
    }
    fillTable(solutions);
}


function fillTable(solutions) {
    $("#count-table > tr").remove();
    solutions.forEach(s => {
        let spreadStr = "";
        s.profiles.forEach(p => {
            spreadStr += `${p.wCount}ш + ${p.hCount}в + ${p.remain}`;
            spreadStr += '\n';
        });
        if (s.profiles.length == 0) {
            spreadStr = "невозможно";
        }
        let tableRow = `<tr>
            <td>${s.framesCount}</td>
            <td>${s.profiles.length}</td>
            <td style="white-space:pre-wrap; word-wrap:break-word">${spreadStr}</td>
            <td>${s.materialLost} (${s.materialLostPrc}%)</td>
        </tr>`
        $("#count-table").append(tableRow);
    });
}
