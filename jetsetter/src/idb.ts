// @ts-nocheck
import { openDB } from "idb";

export const createDatabase = async () => {
    await openDB("jetsetter", 1, {
        upgrade(db) {
            db.createObjectStore("items", {
                keyPath: "id",
                autoIncrement: true,
            });
        },
    });
};

export const idb = {
    async getAll() {
        const db = await openDB("jetsetter", 1);
        return db.transaction("items").objectStore("items").getAll();
    },
    async add(item) {
        const db = await openDB("jetsetter", 1);
        const tx = db.transaction("items", "readwrite");
        tx.objectStore("items").add(item);
        await tx.done;
    },
    async update(item) {
        const db = await openDB("jetsetter", 1);
        const tx = db.transaction("items", "readwrite");
        tx.objectStore("items").put(item);
        await tx.done;
    },
    async markAllAsUnpacked() {
        const db = await openDB("jetsetter", 1);
        let items = await this.getAll();
        items = items.map((item) => ({ ...item, packed: false }));
        const tx = db.transaction("items", "readwrite");
        for (const item of items) {
            tx.objectStore("items").put(item);
        }
        await tx.done
    },
    async delete(item) {
        const db = await openDB("jetsetter", 1);
        const tx = db.transaction("items", "readwrite");
        tx.objectStore("items").delete(item.id);
        await tx.done;
    },
    async deleteUnpackedItems() {
        const db = await openDB("jetsetter", 1);
        const items = await this.getAll();
        const unpackedItems = items.filter((item) => !item.packed);

        const tx = db.transaction("items", "readwrite");
        for (const item of unpackedItems) {
            tx.objectStore("items").delete(item.id);
        }
        // must waiting the transaction finished, otherwise the remove button will not refreshed
        await tx.done;
    },
};
