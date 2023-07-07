// @ts-nocheck
import React, {useState, useEffect} from "react";
import {createRoot} from "react-dom/client";
import Items from "./Items";
import NewItem from "./NewItem";
import {createDatabase, idb} from "../idb";
import database from "../database";


const Application = () => {
    const [items, setItems] = useState([]);

    useEffect( () => {
        createDatabase().then(() => fetchItems());
    }, []);

    async function fetchItems() {
        // const database = await window.api.getDatabase()
        // setItems(database);
        setItems(await idb.getAll())
    }

    const addItem = async (item) => {
        // await window.api.insertRecord(item);
        await idb.add(item)
        await fetchItems()
    };

    const markAsPacked = async (item) => {
        // await window.api.updatePacked(item)
        const updatedItem = { ...item, packed: !item.packed };
        await idb.update(updatedItem)
        await fetchItems()
    };

    const markAllAsUnpacked = async () => {
        // await window.api.markAllUnpacked()
        await idb.markAllAsUnpacked()
        await fetchItems()
    };

    const deleteItem = async (item) => {
        // await window.api.deleteRecord(item)
        await idb.delete(item)
        await fetchItems()
    }

    const deleteUnpackedItems = async () => {
        // await window.api.deleteUnpacked()
        await idb.deleteUnpackedItems()
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
