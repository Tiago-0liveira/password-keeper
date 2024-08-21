import { app } from "electron"
import path from "path"
import sqlite3 from "sqlite3"

const DEBUG = process.env.NODE_ENV === "development"

export const dbFilePath = DEBUG ? "test.db" : path.join(app.getPath('userData'), "db.db")
export const DB = new sqlite3.Database(dbFilePath)
