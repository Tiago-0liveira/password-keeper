import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCopy, faEdit, faTrash, faEye, faEyeSlash, faSave, faTimes, faKey } from "@fortawesome/free-solid-svg-icons"
import "./index.scss"

interface ModernSecretItemProps extends Secret {
	onDelete?: (uuid: number) => void
	onUpdate?: (secret: Secret) => void
}

const ModernSecretItem: React.FC<ModernSecretItemProps> = ({ uuid, name, secret, onDelete, onUpdate }) => {
	const [isSecretHidden, setIsSecretHidden] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [editName, setEditName] = useState(name)
	const [editSecret, setEditSecret] = useState(secret)
	
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	const handleDelete = async () => {
		if (onDelete) onDelete(uuid)
	}

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleSave = async () => {
		if (editName && editSecret) {
			try {
				const updatedSecret = { uuid, name: editName, secret: editSecret }
				if (onUpdate) onUpdate(updatedSecret)
				setIsEditing(false)
			} catch (err) {
				console.error('Failed to update secret:', err)
			}
		}
	}

	const handleCancel = () => {
		setEditName(name)
		setEditSecret(secret)
		setIsEditing(false)
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleCancel()
		} else if (e.key === 'Enter' && e.ctrlKey) {
			handleSave()
		}
	}

	return (
		<div className={`modern-secret-item ${isEditing ? 'editing' : ''}`}>
			<div className="secret-content">
				<div className="secret-icon">
					<FontAwesomeIcon icon={faKey} />
				</div>

				<div className="secret-details">
					{isEditing ? (
						<input
							type="text"
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							onKeyDown={handleKeyPress}
							className="edit-name-input"
							placeholder="Secret name"
							autoFocus
						/>
					) : (
						<h3 className="secret-name">{name}</h3>
					)}

					{isEditing ? (
						<div className="edit-secret-input-wrapper">
							<input
								type={isSecretHidden ? "password" : "text"}
								value={editSecret}
								onChange={(e) => setEditSecret(e.target.value)}
								onKeyDown={handleKeyPress}
								className="edit-secret-input"
								placeholder="Secret value"
							/>
							<button
								type="button"
								className="toggle-visibility"
								onClick={() => setIsSecretHidden(!isSecretHidden)}
								title={isSecretHidden ? "Show secret" : "Hide secret"}
							>
								<FontAwesomeIcon icon={isSecretHidden ? faEye : faEyeSlash} />
							</button>
						</div>
					) : (
						<div className="secret-value-wrapper">
							<span className="secret-value">
								{isSecretHidden ? '•'.repeat(Math.min(secret.length, 20)) : secret}
							</span>
						</div>
					)}
				</div>
				<div className="secret-controls">
					<div className="edit-controls">
						{isEditing ? (
							<>
								<button
									className="control-btn save-btn"
									onClick={handleSave}
									title="Save (Ctrl+Enter)"
								>
									<FontAwesomeIcon icon={faSave} />
								</button>
								<button
									className="control-btn cancel-btn"
									onClick={handleCancel}
									title="Cancel (Escape)"
								>
									<FontAwesomeIcon icon={faTimes} />
								</button>
							</>
						) : (
							<>
								<button
									className="control-btn edit-btn"
									onClick={handleEdit}
									title="Edit secret"
								>
									<FontAwesomeIcon icon={faEdit} />
								</button>
								<button
									className="control-btn delete-btn"
									onClick={handleDelete}
									title="Delete secret"
								>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</>
						)}
					</div>
					<div className="view-controls">
						{!isEditing && (
							<>
								<button
									className="control-btn toggle-btn"
									onClick={() => setIsSecretHidden(!isSecretHidden)}
									title={isSecretHidden ? "Show secret" : "Hide secret"}
								>
									<FontAwesomeIcon icon={isSecretHidden ? faEye : faEyeSlash} />
								</button>
								<button
									className="control-btn copy-btn"
									onClick={() => copyToClipboard(secret)}
									title="Copy to clipboard"
								>
									<FontAwesomeIcon icon={faCopy} />
								</button>
							</>
						)}
					</div>
				</div>
			</div>


		</div>
)}

export default React.memo(ModernSecretItem)