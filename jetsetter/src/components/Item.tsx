// @ts-nocheck
import React from "react";

const Item = ({ packed, _id, value, onCheckOff, onDelete }) => {
  return (
    <article className="Item">
     
      <label> <input type="checkbox" checked={packed} onChange={onCheckOff} id={_id} />
      {value}</label>
        <button className="delete" onClick={onDelete}>Delete</button>
    </article>
  );
};

export default Item;
