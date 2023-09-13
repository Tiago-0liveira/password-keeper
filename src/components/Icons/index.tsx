import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBars, faClipboardList, faEye, faEyeSlash, faMinus, faPencilAlt, faTimes, faWindowRestore } from "@fortawesome/free-solid-svg-icons"
import { faSquare } from "@fortawesome/free-regular-svg-icons"
import React from "react"
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import clsx from 'clsx'

const data = {
	main: {
		bars: <FontAwesomeIcon icon={faBars} size="lg" />,
		minimize: <FontAwesomeIcon icon={faMinus} size="2x" />,
		maximize: {
			maximized: <FontAwesomeIcon icon={faWindowRestore} size="2x" />,
			not: <FontAwesomeIcon icon={faSquare} size="2x" />,
		},
		exit: <FontAwesomeIcon icon={faTimes} size="2x" />,
		sidebarArrow: <FontAwesomeIcon icon={faArrowRight} size="1x" />
	},
	row: {
		clipboard: <FontAwesomeIcon icon={faClipboardList}  size="lg" />,
		eye: {
			on: <FontAwesomeIcon fixedWidth icon={faEyeSlash} size="lg"/>,
			off: <FontAwesomeIcon fixedWidth icon={faEye} size="lg"/>
		},
		update: <FontAwesomeIcon fixedWidth icon={faPencilAlt} size="lg" />,
		delete: <FontAwesomeIcon fixedWidth icon={faTimes} size="lg" />
	},
	global: {
		google: (...classNames: string[]) => <FontAwesomeIcon className={clsx(classNames)} fixedWidth icon={faGoogle} size = "lg" />
	}
}

export default data
