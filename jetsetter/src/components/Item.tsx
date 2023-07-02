import React from "react";

const Item = ({ packed, _id, value, onCheckOff }) => {
  return (
    <article className="Item">
      <input type="checkbox" checked={packed} onChange={onCheckOff} id={_id} />
      <label>{value}</label>
    </article>
  );
};

export default Item;
