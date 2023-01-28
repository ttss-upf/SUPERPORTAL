function hexadecimalToRgb(color){
    color = color.toLowerCase();
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (color && reg.test(color)) {
        if (color.length === 4) {
            var result = "#";
            for (var i = 1; i < 4; i += 1) {
                result += color.slice(i, i + 1).concat(color.slice(i, i + 1));
            }
            color = result;
        }
        var colorChange = [];
        for (var i = 1; i < 7; i += 2) {
            colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
        }
        return colorChange
    }
    return color;
};

function getTime() {
    let date = new Date();
    let createAt = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return createAt;
}

function testLink(str) {
    let reg = /https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))/
    let res1 = reg.test(str);
    let res2 = (str.search(/\?/) == -1) && (str.search(/\&/) == -1)
    let res = res1 && res2;
    return res;
}