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

function format(data) {
  return `${data} eur`;
}

class User {
}

class Wallet {
  constructor(owner, balance) {
    this.owner = owner;
    this.balance = balance;
    this.active = true;
  }

  burn() {
    this.active = false;
  }

  print() {
    return `Wallet: {${this.owner.name}} - ${format(@balance)}`;
  }

}

function main() {
  let user = new User();
  user.id = "0001";
  user.name = "Pablo";
  let wallet = new Wallet(user, 1000);
  print(wallet);
}

main();