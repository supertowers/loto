// ---- Loto → JavaScript ----

// Runtime helpers
function print(value) {
  console.log(value);
}

function defined(value) {
  return value !== null && value !== undefined;
}

class User {
  constructor() {
    this.name = "test";
  }

}

function main() {
  user = new User();
  print("Done");
}

main();