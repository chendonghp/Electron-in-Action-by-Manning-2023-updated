import React, { useState } from 'react';
import Items from './Items';
import NewItem from './NewItem';
import { render } from 'react-dom';

const Application = () => {
  const [items, setItems] = useState([{ value: 'Pants', id: Date.now(), packed: false }]);

  const addItem = (item) => {
    setItems([item, ...items]);
  }

  const markAsPacked = (item) => {
    const otherItems = items.filter(other => other.id !== item.id);
    const updatedItem = { ...item, packed: !item.packed };
    setItems([updatedItem, ...otherItems]);
  }

  const markAllAsUnpacked = () => {
    const newItems = items.map(item => ({ ...item, packed: false }));
    setItems(newItems);
  }

  const unpackedItems = items.filter(item => !item.packed);
  const packedItems = items.filter(item => item.packed);

  return (
    <div className="Application">
      <NewItem onSubmit={addItem} />
      <Items
        title="Unpacked Items"
        items={unpackedItems}
        onCheckOff={markAsPacked}
      />
      <Items
        title="Packed Items"
        items={packedItems}
        onCheckOff={markAsPacked}
      />
      <button
        className="button full-width"
        onClick={markAllAsUnpacked}
      >
        Mark All As Unpacked
      </button>
    </div>
  );
}

render(<Application/>, document.getElementById('application'))

