import "regenerator-runtime/runtime";
import React from "react"
import { render } from "react-dom"
import Main from "./components/Main"

const mainElement = document.createElement("div")
mainElement.setAttribute("id", "root")
document.body.appendChild(mainElement)
const metaEl = document.createElement("meta")
metaEl.setAttribute("http-equiv", "Content-Security-Policy")
metaEl.setAttribute("content", "script-src 'self'")
document.head.appendChild(metaEl)

const App = () => {
	return (
		<React.StrictMode >
			<Main />
		</React.StrictMode>
	)
}

render(<App />, mainElement)
