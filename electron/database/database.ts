import "core-js/stable";
import "regenerator-runtime/runtime";
import { PrismaClient, Row } from "./generated/client";
import type { TgetRows, TnewRow, TDeleteRow, TUpdateRow } from "../../src/types"

const prisma = new PrismaClient(process.env.NODE_ENV === "production" ? {
	__internal: {
		engine: {
			binaryPath: "../app.asar.unpacked/dist/"
		}
	}
} : {})

export const getRows: TgetRows = async () => {
	try {
		const res = await prisma.row.findMany()
		return { data: res, error: null }
	} catch (error) {
		return { data: null, error }
	}
}

export const newRow: TnewRow = async (data) => {
	try {
		const res = await prisma.row.create({ data: { ...data } })
		return { data: res, error: null }
	} catch (error) {
		return { data: null, error }
	}
}

export const deleteRow: TDeleteRow = async ({ uuid }) => {
	try {
		const res = await prisma.row.delete({ where: { uuid } })
		return { data: res, error: null }
	} catch (error) {
		return { data: null, error }
	}
}

export const updateRow: TUpdateRow = async ({ uuid, newRowData }) => {
	try {
		const res = await prisma.row.update({ where: { uuid }, data: { ...newRowData } })
		return { data: res, error: null }
	} catch (error) {
		return { data: null, error }
	}
}
