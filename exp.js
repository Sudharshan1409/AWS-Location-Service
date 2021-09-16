let zz = [];

function permutations(arr, r = []) {
  if (arr.length === 0) {
    zz.push(r);
  } else {
    const first = arr[0];
    for (let i = 0; i <= r.length; i++) {
      permutations(
        arr.slice(1),
        r.slice(0, i).concat([first]).concat(r.slice(i))
      );
    }
  }
}

permutations(["C", "D", "E"]);

console.log(zz);
