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

import React, { useState } from 'react';

function Counter({ start = 0 }) {
  const [count, setCount] = useState(start);

  const increment = () => {
    setCount(count + 1);
  };

  return null;
}

export default Counter;