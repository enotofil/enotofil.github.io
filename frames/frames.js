"use strict";

/// Профиль, содержащий wCount ширин, hCount высот и остаток remain
class Profile {
    constructor(length, w, wMaxCount, h, hMaxCount) {
        this.remain = Infinity;
        this.wCount = 0;
        this.hCount = 0;
        for (let c1 = 0; c1 <= wMaxCount; c1++) {
            for (let c2 = 0; c2 <= hMaxCount; c2++) {
                let remain = length - (w * c1 + h * c2);
                if ((remain >= 0) && (remain < this.remain)) {
                    this.remain = remain;
                    this.wCount = c1;
                    this.hCount = c2
                }
            }
        }
    }
}

/// Решение, содержащее массив заполненных профилей и общий остаток в т.ч. %
class Solution {
    constructor(profLength, frameSize, framesCount) {
        this.framesCount = framesCount;

        let wLeft = framesCount * 2; // ширины, которые осталось разместить
        let hLeft = framesCount * 2; // длины

        this.profiles = [];
        let totalLength = 0;
        this.materialLost = 0;

        while (true) {
            let p = new Profile(profLength, frameSize[0], wLeft, frameSize[1], hLeft);
            if (p.wCount + p.hCount == 0) {
                break;
            }
            this.profiles.push(p);
            wLeft -= p.wCount;
            hLeft -= p.hCount;
            totalLength += profLength;
            this.materialLost += p.remain;
        }
        if (wLeft + hLeft != 0) {
            // невозможно разместить, стороны рамки больше профиля
            this.profiles = [];
            this.materialLost = 0;
        }
        this.materialLostPrc = (100 * this.materialLost / totalLength).toFixed(1);
    }
}
