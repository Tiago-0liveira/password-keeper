import { app } from 'electron'
import path from 'path'

export const ASSETS_PATH = app.isPackaged ?
	path.join(process.resourcesPath, 'assets') :
	path.join(app.getAppPath(), `public${path.sep}assets`);

//import MyImage from path.join(ASSETS_PATH, `images/my_image.png`);
export const steamICO = path.join(ASSETS_PATH, `images/Steam.ico`)
