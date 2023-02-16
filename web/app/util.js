function euclDist (x, y, a, b) {
  return Math.sqrt((x-a)**2+(y-b)**2);
}

function makeArr(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

function isInteract(click, obj) {
  centroid = obj.centroid;
  if (obj.size == 'big')
    threshold = 50;
  else if (obj.size == 'medium')
    threshold = 25;
  else if (obj.size == 'small')
    threshold = 10;
  if (
    euclDist(click[0],click[1],centroid[0],centroid[1]) <= threshold
  )
    return true;
}

