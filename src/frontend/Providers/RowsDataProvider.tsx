import React, { useReducer, createContext, Reducer } from "react"
import {rowsDataDefault, rowsDataReducer} from "@reducers/rowsDataReducer";

type RowsDataProviderProps = {
    
}

export const RowsContext = createContext<RowsContextT>({
    data: JSON.parse(JSON.stringify(rowsDataDefault)),
    dispatch: () => {}
})

const RowsDataProvider: React.FC<RowsDataProviderProps> = (props) => {
    const [rowsData, dispatch] = useReducer<Reducer<PasswordAppState, PasswordAppAction>>(rowsDataReducer, JSON.parse(JSON.stringify(rowsDataDefault)))
    
    return (<RowsContext.Provider value={{ data: rowsData, dispatch }}>
        {props.children}
    </RowsContext.Provider>)
}

export default RowsDataProvider;