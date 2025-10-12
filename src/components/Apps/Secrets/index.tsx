import React, { useEffect, useState, useCallback, useRef } from 'react'
import "./index.scss"
import { getSecrets, insertOne, updateSecret, deleteSecret } from '@api/secrets';
import ModernSecretItem from './ModernSecretItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faKey, faShieldAlt, faSearch } from "@fortawesome/free-solid-svg-icons";

export type SecretsComponentProps = {}

const SecretsComponent: React.FC<SecretsComponentProps> = () => {
	const [secrets, setSecrets] = useState<Secret[]>([])
	const [filteredSecrets, setFilteredSecrets] = useState<Secret[]>([])
	const [newSecret, setNewSecret] = useState({ name: '', secret: '' })
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [page, setPage] = useState(0)
	const [isAdding, setIsAdding] = useState(false)

	const observer = useRef<IntersectionObserver>()
	const lastSecretRef = useCallback((node: HTMLDivElement) => {
		if (isLoading) return
		if (observer.current) observer.current.disconnect()
		observer.current = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && hasMore) {
				loadMoreSecrets()
			}
		})
		if (node) observer.current.observe(node)
	}, [isLoading, hasMore])

	const SECRETS_PER_PAGE = 50

	useEffect(() => {
		fetchSecrets()
	}, [])

	useEffect(() => {
		filterSecrets()
	}, [secrets, searchQuery])

	const fetchSecrets = async () => {
		try {
			setIsLoading(true)
			const fetchedSecrets = await getSecrets()
			console.log(fetchedSecrets, 'fetchedSecrets')
			setSecrets(fetchedSecrets)
			setFilteredSecrets(fetchedSecrets.slice(0, SECRETS_PER_PAGE))
			setHasMore(fetchedSecrets.length > SECRETS_PER_PAGE)
			setPage(1)
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const loadMoreSecrets = () => {
		if (!hasMore || isLoading) return

		const nextPage = page + 1
		const startIndex = nextPage * SECRETS_PER_PAGE
		const endIndex = startIndex + SECRETS_PER_PAGE

		const newFilteredSecrets = filteredSecrets.filter(secret =>
			!searchQuery ||
			secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			secret.secret.toLowerCase().includes(searchQuery.toLowerCase())
		)

		const nextBatch = newFilteredSecrets.slice(0, endIndex)
		setFilteredSecrets(nextBatch)
		setPage(nextPage)
		setHasMore(endIndex < newFilteredSecrets.length)
	}

	const filterSecrets = () => {
		if (!searchQuery) {
			const paginatedSecrets = secrets.slice(0, SECRETS_PER_PAGE)
			setFilteredSecrets(paginatedSecrets)
			setHasMore(secrets.length > SECRETS_PER_PAGE)
			setPage(1)
		} else {
			const filtered = secrets.filter(secret =>
				secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				secret.secret.toLowerCase().includes(searchQuery.toLowerCase())
			)
			const paginatedFiltered = filtered.slice(0, SECRETS_PER_PAGE)
			setFilteredSecrets(paginatedFiltered)
			setHasMore(filtered.length > SECRETS_PER_PAGE)
			setPage(1)
		}
	}

	const handleCreateSecret = async () => {
		if (newSecret.name && newSecret.secret) {
			try {
				setIsAdding(true)
				const secretToAdd = {
					uuid: -1,
					name: newSecret.name,
					secret: newSecret.secret
				}
				const createdSecret = await insertOne(secretToAdd)
				setSecrets([createdSecret, ...secrets])
				setNewSecret({ name: '', secret: '' })
				filterSecrets()
			} catch (err) {
				console.error(err)
			} finally {
				setIsAdding(false)
			}
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			handleCreateSecret()
		}
	}

	const handleDeleteSecret = async (uuid: number) => {
		try {
			await deleteSecret(uuid)
			setSecrets(secrets.filter(secret => secret.uuid !== uuid))
			filterSecrets()
		} catch (err) {
			console.error('Failed to delete secret:', err)
		}
	}

	const handleUpdateSecret = async (updatedSecret: Secret) => {
		try {
			await updateSecret(updatedSecret)
			setSecrets(secrets.map(secret =>
				secret.uuid === updatedSecret.uuid ? updatedSecret : secret
			))
			filterSecrets()
		} catch (err) {
			console.error('Failed to update secret:', err)
		}
	}

	return (
		<div className="ModernSecretsComponent">
			<div className="secrets-header">
				<div className="header-content">
					<div className="title-section">
						<FontAwesomeIcon icon={faShieldAlt} className="title-icon" />
						<div>
							<h1>Secrets Vault</h1>
							<p className="subtitle">Securely store your sensitive information</p>
						</div>
					</div>
					<div className="search-section">
						<div className="search-input-wrapper">
							<FontAwesomeIcon icon={faSearch} className="search-icon" />
							<input
								type="text"
								placeholder="Search secrets..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="search-input"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="new-secret-section">
				<div className="new-secret-card">
					<div className="input-group">
						<div className="input-wrapper">
							<FontAwesomeIcon icon={faKey} className="input-icon" />
							<input
								type="text"
								placeholder="Secret name..."
								value={newSecret.name}
								onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
								onKeyDown={handleKeyPress}
								className="name-input"
								disabled={isAdding}
							/>
						</div>
						<div className="input-wrapper">
							<FontAwesomeIcon icon={faShieldAlt} className="input-icon" />
							<input
								type="password"
								placeholder="Secret value..."
								value={newSecret.secret}
								onChange={(e) => setNewSecret({ ...newSecret, secret: e.target.value })}
								onKeyDown={handleKeyPress}
								className="secret-input"
								disabled={isAdding}
							/>
						</div>
					</div>
					<button
						onClick={handleCreateSecret}
						disabled={!newSecret.name || !newSecret.secret || isAdding}
						className="add-button"
					>
						<FontAwesomeIcon icon={faPlus} className={isAdding ? 'spinning' : ''} />
						{isAdding ? 'Adding...' : 'Add Secret'}
					</button>
				</div>
			</div>

			<div className="secrets-list">
				{filteredSecrets.length === 0 && !isLoading && (
					<div className="empty-state">
						<FontAwesomeIcon icon={faShieldAlt} className="empty-icon" />
						<h3>No secrets found</h3>
						<p>
							{searchQuery ? 'Try adjusting your search terms' : 'Add your first secret to get started'}
						</p>
					</div>
				)}

				{filteredSecrets.length > 0 && (
					<>
						<div className="secrets-grid">
							{filteredSecrets.map((secret, index) => (
								<div
									key={secret.uuid}
									ref={index === filteredSecrets.length - 5 ? lastSecretRef : undefined}
									className="secret-item-wrapper"
								>
									<ModernSecretItem
										{...secret}
										onDelete={handleDeleteSecret}
										onUpdate={handleUpdateSecret}
									/>
								</div>
							))}
						</div>

						{isLoading && (
							<div className="loading-state">
								<div className="spinner"></div>
								<p>Loading more secrets...</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export const config = {
	label: 'Secrets',
	component: React.memo(SecretsComponent),
	extraLabel: false,
	sidebarBottom: true
} satisfies App
export default SecretsComponent