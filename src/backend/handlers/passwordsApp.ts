import { ipcMain } from "electron";
import { getRows, newRow, deleteRow, updateRow } from "../database/passwordsApp";
import { validateNewRow } from "../helpers";

if (process.env.NODE_ENV === "development") {
	console.log(`ipcMain||init||passwordsApp`)
}

ipcMain.handle("requestGetRows", async (event, data: GetRowsData) => {
	const rows: Row[] = await getRows(data.query, data.sort)
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||getRows||${rows.length} rows`)
	}
	return rows
})

ipcMain.handle("requestNewRow", async (event, data: NewRowData) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||newRow||${JSON.stringify(data, null, 0)}`)
	}
	return await newRow(data)
})

ipcMain.handle("requestValidateNewRow", async (event, data: NewRowData) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestValidateNewRow`)
	}
	return validateNewRow(data)
})

ipcMain.handle("requestValidateAndNewRow", async (event, data: NewRowData) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||validateAndNewRow||${JSON.stringify(data, null, 0)}`)
	}
	const opt = validateNewRow(data as Row);
	if (opt.success) {
		return {success: true, value: await newRow(opt.value)}
	} else {
		return opt
	}
})

ipcMain.handle("requestValidateAndUpdateRow", async (event, data: Row) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||ValidateAndUpdateRow||${JSON.stringify(data, null, 0)}`)
	}
	const opt = validateNewRow(data);
	if (opt.success) {
		return {success: true, value: await updateRow(opt.value)}
	} else {
		return opt
	}
})

ipcMain.handle("requestDeleteRow", async (event, data: { uuid: number }) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||deleteRow||${JSON.stringify(data, null, 0)}`)
	}
	return await deleteRow({ uuid: data.uuid })
})

ipcMain.handle("requestUpdateRow", async (event, row: Row) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||updateRow||${JSON.stringify(row)}`)
	}
	return await updateRow(row)
})
