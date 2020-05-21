const fs = require('fs'),
    PNG = require('pngjs').PNG;
const biCubic = require("./app/biCubicInterpolate");
const util = require("./app/util");

async function loadFile(filePath) {
    return new Promise(function (resolve, reject) {
        let readStream;
        try {
            readStream = fs.createReadStream(filePath);
        } catch (e) {
            reject(e);
            return;
        }

        readStream.pipe(
            new PNG({
                filterType: 4,
            })
        ).on("parsed", function () {
            resolve(this);
        }).on("error", function (err) {
            reject(err)
        })
    });
}

async function writeFile(png, filePath) {

    png.pack().pipe(fs.createWriteStream(filePath));
}

function resize(sourcePNG, width, height, algoName) {
    let sourceWidth = sourcePNG.width;
    let sourceHeight = sourcePNG.height;
    let algo;

    switch (algoName) {
        case "BiCubic":
            algo = biCubic;
            break;
        default:
            algo = biCubic;
    }


    var png = new PNG({
        width: width,
        height: height,
        filterType: -1
    });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let _x = x * sourceWidth / width;
            let _y = y * sourceHeight / height;

            var idx = ((width) * y + x) * 4;
            png.data[idx] = util.clamp(Math.floor(algo(sourcePNG.data, _x, _y, sourceWidth, sourceHeight, 4, 0)), 0, 255);
            png.data[idx + 1] = util.clamp(Math.floor(algo(sourcePNG.data, _x, _y, sourceWidth, sourceHeight, 4, 1)), 0, 255);
            png.data[idx + 2] = util.clamp(Math.floor(algo(sourcePNG.data, _x, _y, sourceWidth, sourceHeight, 4, 2)), 0, 255);
            png.data[idx + 3] = util.clamp(Math.floor(algo(sourcePNG.data, _x, _y, sourceWidth, sourceHeight, 4, 3)), 0, 255);
        }
    }
    return png;
}

function crop(sourcePNG, x, y, width, height) {
    if (typeof sourcePNG !== "object")
        throw new TypeError("sourcePNG has to be of type object");

    if (typeof sourcePNG.width !== "number" ||
        typeof sourcePNG.height !== "number")
        throw new TypeError("sourcePNG has to contain properties width and height");

    if (width < 1 || height < 1)
        throw new Error("width and height can't be less than 1");
    if (sourcePNG.width < width || sourcePNG.height < height)
        throw new Error("width and height can't exceed image dimensions");

    var png = new PNG({
        width: width,
        height: height,
        filterType: -1
    });

    for (let _y = 0; _y < height; _y++) {
        for (let _x = 0; _x < width; _x++) {
            for (let i = 0; i < 4; i++) {
                png.data[(_y * width + _x) * 4 + i] = sourcePNG.data[((_y + y) * sourcePNG.width + _x + x) * 4 + i];
            }
        }
    }

    return png;
}

function insert(sourcePNG, targetPNG, x, y) {
    if (typeof sourcePNG !== "object")
        throw new TypeError("sourcePNG has to be of type object");

    if (typeof sourcePNG.width !== "number" ||
        typeof sourcePNG.height !== "number")
        throw new TypeError("sourcePNG has to contain properties width and height");

    if (typeof targetPNG !== "object")
        throw new TypeError("targetPNG has to be of type object");

    if (typeof targetPNG.width !== "number" ||
        typeof targetPNG.height !== "number")
        throw new TypeError("targetPNG has to contain properties width and height");

    if (x < 1 || y < 1)
        throw new Error("x or y can't be less than 1");
    if (x + sourcePNG.width > targetPNG.width && y + sourcePNG.height > targetPNG.height)
        throw new Error("width or height of the source image exceed the dimensions of the target image");

    for (let _y = 0; _y < sourcePNG.height; _y++) {
        for (let _x = 0; _x < sourcePNG.width; _x++) {
            for (let i = 0; i < 4; i++) {
                targetPNG.data[((_y + y) * targetPNG.width + _x + x) * 4 + i] = sourcePNG.data[((_y) * sourcePNG.width + _x) * 4 + i];
            }
        }
    }
    return targetPNG;
}

module.exports = {
    resize,
    loadFile,
    writeFile,
    crop,
    insert
};