import React, { useEffect } from 'react'
import "./index.scss"
import { getSecrets } from '@api/secrets';

export type SecretsComponentProps = {

}

const SecretsComponent: React.FC<SecretsComponentProps> = () => {

	useEffect(() => {

		(async () => {
			console.log("secrets: ", await getSecrets())
		})()

		return () => {

		};
	}, []);

	return (<div className="secrets">
		Secrets
		<b>WIP</b>
	</div>)
}

export const config = {
	label: 'Secrets',
	component: React.memo(SecretsComponent),
	extraLabel: false,
	sidebarBottom: true
} satisfies App
export default SecretsComponent