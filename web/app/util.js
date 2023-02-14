function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function lerp(a, b, f) {
  return a * (1 - f) + b * f;
}

function makeArr(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

function isIntersect(click, exit) {
    //console.log(click,exit);
  if (
    Math.abs(click[0] - exit[0]) <= 10 &&
    Math.abs(click[1] - exit[1]) <= 10
  )
    return true;
}

function isClose(pos, exit) {
  console.log(pos,exit);
if (
  Math.abs(pos - exit) <= 15
)
  return true;
}
