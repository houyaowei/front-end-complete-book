import React from 'react';

function Counter(props) {
  return (
    <>
      <p>当前值: {props.count}</p>
      <button onClick={props.onIncrement}>增加</button>
      <button onClick={props.onDecrement}>减少</button>
    </>
  );
}

export default Counter
