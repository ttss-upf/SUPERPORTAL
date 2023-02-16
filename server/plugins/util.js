function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function lerp(a, b, f) {
  return a * (1 - f) + b * f;
}

function isIntersect(click, exit) {
  //console.log(click,exit);
  if (Math.abs(click[0] - exit[0]) <= 10 && Math.abs(click[1] - exit[1]) <= 10)
    return true;
}

function isClose(pos, target) {
  //console.log(pos,target);
  if (Math.abs(pos - target) <= 15) return true;
}

module.exports = { clamp, lerp, isIntersect, isClose };
