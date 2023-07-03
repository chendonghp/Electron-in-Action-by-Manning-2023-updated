import React, {useState, useEffect} from "react";
import Items from "./Items";
import NewItem from "./NewItem";
import {createRoot} from "react-dom/client";
// import {window} from 'electron'


const Application = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        const database = await window.api.getDatabase()
        setItems(database);
    }

    const addItem = async (item) => {
        await window.api.insertRecord(item);
        await fetchItems()
    };

    const markAsPacked = async (item) => {
        await window.api.updatePacked(item)
        await fetchItems()
        // const otherItems = items.filter((other) => other.id !== item.id);
        // const updatedItem = {...item, packed: !item.packed};
        // setItems([updatedItem, ...otherItems]);
    };

    const markAllAsUnpacked = async () => {
        await window.api.markAllUnpacked()
        await fetchItems()
        // const newItems = items.map((item) => ({...item, packed: false}));
        // setItems(newItems);
    };

    const deleteItem = async (item) => {
        await window.api.deleteRecord(item)
        await fetchItems()
    }

    const deleteUnpackedItems = async () => {
        await window.api.deleteUnpacked()
        await fetchItems()
    }

    const unpackedItems = items?.filter((item) => !item.packed);
    const packedItems = items?.filter((item) => item.packed);

    return (
        <div className="Application">
            <NewItem onSubmit={addItem}/>
            <Items
                title="Unpacked Items"
                items={unpackedItems}
                onCheckOff={markAsPacked}
                onDelete={deleteItem}
            />
            <Items
                title="Packed Items"
                items={packedItems}
                onCheckOff={markAsPacked}
                onDelete={deleteItem}
            />
            <button className="button full-width" onClick={markAllAsUnpacked}>
                Mark All As Unpacked
            </button>
            <button
                className="button full-width secondary"
                onClick={deleteUnpackedItems}>
                Remove Unpacked Items
            </button>
        </div>
    );
};

// render(<Application />, document.getElementById("application"));

const renderApplication = async () => {
    const root = createRoot(document.getElementById("application"))
    root.render(
        <Application/>,
    );
};
renderApplication();
