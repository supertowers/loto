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

  return (
    <View className="counter">
      <Text className="label">Count :{count}</Text>
      <Pressable onPress={increment}>
        <Text className="buttonText">+</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  counter: {
    backgroundColor: "#f4f4f4",
    padding: 12,
  },
  label: {
    fontSize: 18,
  },
  buttonText: {
    color: "white",
    backgroundColor: "blue",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
};

export default Counter;