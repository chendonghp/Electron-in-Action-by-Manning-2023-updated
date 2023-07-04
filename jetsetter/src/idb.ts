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
        // return tx.done
    },
    async update(item) {
        const db = await openDB("jetsetter", 1);
        const tx = db.transaction("items", "readwrite");
        tx.objectStore("items").put(item);
    },
    async markAllAsUnpacked() {
        const db = await openDB("jetsetter", 1);
        await this.getAll()
            .then((items) => items.map((item) => ({ ...item, packed: false })))
            .then((items) => {
                const tx = db.transaction("items", "readwrite");
                for (const item of items) {
                    tx.objectStore("items").put(item);
                }
            });
    },
    async delete(item) {
        const db = await openDB("jetsetter", 1);
        const tx = db.transaction("items", "readwrite");
        tx.objectStore("items").delete(item.id);
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
