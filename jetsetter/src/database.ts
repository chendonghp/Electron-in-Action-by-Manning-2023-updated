// @ts-nocheck
import "sqlite3";
import path from 'path'
import {app} from "electron";

import knex from "knex";

const userdataPath = path.join(
    app.getPath('userData'),
    'jetsetter-items.sqlite')
console.log(userdataPath)
const database = knex({
    client: "sqlite3",
    connection: {
        // filename: "./db.sqlite",
        filename: userdataPath
    },
    useNullAsDefault: true,
});

database.schema.hasTable("items").then((exists) => {
    if (!exists) {
        return database.schema.createTable("items", (t) => {
            t.increments("id").primary();
            t.string("value", 100);
            t.boolean("packed");
        });
    }
});
export default database;
