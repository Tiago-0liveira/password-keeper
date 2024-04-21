//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowRight,
    faBars,
    faClipboardList,
    faCompress,
    faDownLeftAndUpRightToCenter,
    faExpand,
    faEye,
    faEyeSlash,
    faGear,
    faLock, faLockOpen,
    faMinus,
    faPassport,
    faPencilAlt,
    faTimes,
    faWindowMinimize,
    faWindowRestore,
	faXmark
} from "@fortawesome/free-solid-svg-icons"
import { faSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons"
import React from "react"
import { faGoogle, faPaypal, faSteamSquare, faSteamSymbol } from '@fortawesome/free-brands-svg-icons'
import clsx from 'clsx'

const data = {
	main: {
		bars: <FontAwesomeIcon icon={faBars} size="lg" />,
		minimize: <FontAwesomeIcon icon={faMinus} size="2x" />,
		maximize: {
			maximized: <FontAwesomeIcon icon={faExpand} size="2x" />,
			not: <FontAwesomeIcon icon={faSquare} size="2x" />,
		},
		exit: <FontAwesomeIcon icon={faXmark} size="2x" />,
		sidebarArrow: <FontAwesomeIcon className="arrow" icon={faArrowRight} size="1x" />
	},
	row: {
		clipboard: <FontAwesomeIcon icon={faClipboardList} size="lg" />,
		eye: {
			on: <FontAwesomeIcon fixedWidth icon={faEyeSlash} size="lg" />,
			off: <FontAwesomeIcon fixedWidth icon={faEye} size="lg" />
		},
		update: <FontAwesomeIcon fixedWidth icon={faPencilAlt} size="lg" />,
		delete: <FontAwesomeIcon fixedWidth icon={faTrashCan} size="lg" />
	},
	global: {
		google: (...classNames: string[]) => <FontAwesomeIcon className={clsx(classNames)} fixedWidth icon={faGoogle} size="lg" />
	},
	sidebar: {
		gear: <img src="/assets/svg/settings.svg" width={32} height={32} />,
		steam: <img src="/assets/svg/steam.svg" width={32} height={32} />,
		paypal: <img src="/assets/svg/paypal.svg" width={32} height={32} />,
		password: <img src="/assets/svg/locker.svg" width={32} height={32} />
	},
	passwordsComp: {
		lock: {
			closed: <FontAwesomeIcon fixedWidth icon={faLock} size="1x" />,
			open: <FontAwesomeIcon fixedWidth icon={faLockOpen} size="1x" />,
		}
	}
}

export default data
