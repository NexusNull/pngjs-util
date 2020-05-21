const util = require("./util");

function cubicInterpolate(data, x, y, width, height, blockSize, offset) {
    let _x = x % 1;
    x = Math.floor(x);

    y = util.clamp(y, 0, height - 1);
    let min = y * width;
    let max = (y + 1) * width - 1;


    let i0 = util.clamp(min + x - 1, min, max) * blockSize + offset;
    let i1 = util.clamp(min + x, min, max) * blockSize + offset;
    let i2 = util.clamp(min + x + 1, min, max) * blockSize + offset;
    let i3 = util.clamp(min + x + 2, min, max) * blockSize + offset;

    return data[i1] + 0.5 * _x * (data[i1] - data[i0] + _x * (2.0 * data[i0] - 5.0 * data[i1] + 4.0 * data[i2] - data[i3] + _x * (3.0 * (data[i1] - data[i2]) + data[i3] - data[i0])));
}

function biCubicInterpolate(data, x, y, width, height, blockSize, offset) {
    let _y = y % 1;
    y = Math.floor(y);
    let arr = [];
    arr[0] = cubicInterpolate(data, x, y - 1, width, height, blockSize, offset);
    arr[1] = cubicInterpolate(data, x, y, width, height, blockSize, offset);
    arr[2] = cubicInterpolate(data, x, y + 1, width, height, blockSize, offset);
    arr[3] = cubicInterpolate(data, x, y + 2, width, height, blockSize, offset);

    return cubicInterpolate(arr, 1, _y, 4, 1, 1, 0);
}

module.exports = biCubicInterpolate;