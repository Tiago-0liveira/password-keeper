import React, { useReducer, createContext, Reducer, useEffect } from "react"
import {rowsDataDefault, rowsDataReducer} from "reducers/rowsDataReducer";

type RowsDataProviderProps = {
    
}

export const RowsContext = createContext<RowsContextT>({
    data: rowsDataDefault,
    dispatch: () => {}
})

const RowsDataProvider: React.FC<RowsDataProviderProps> = (props) => {
    const [rowsData, dispatch] = useReducer<Reducer<PasswordAppState, Action>>(rowsDataReducer, rowsDataDefault)
    
    return (<RowsContext.Provider value={{ data: rowsData, dispatch }}>
        {props.children}
    </RowsContext.Provider>)
}

export default RowsDataProvider;