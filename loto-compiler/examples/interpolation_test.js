// ---- Loto → JavaScript ----

// Runtime helpers
function print(value) {
  // If the value has a print method, call it
  if (value && typeof value.print === "function") {
    console.log(value.print());
  } else {
    console.log(value);
  }
}

function defined(value) {
  return value !== null && value !== undefined;
}

class Test {
  constructor() {
    this.name = "Pablo";
  }

  show() {
    return `Hello ${@name}`;
  }

}

function main() {
  let test = new Test();
  let result = test.show();
  print(result);
}

main();