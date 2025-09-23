
export const saveFileWithPicker = async (content: string) => {
	try {
		if ('showSaveFilePicker' in window) {
			const options = {
				types: [
					{
						description: 'Text Files',
						accept: {
							'application/x-ms-dos-executable': ['.cmd'],
						},
					},
				],
				suggestedName: 'wt-setup.cmd', // Suggested filename
			};

			const fileHandle = await window.showSaveFilePicker(options);

			const blob = new Blob([content], { type: 'application/x-ms-dos-executable' });

			// Write to the file
			const writable = await fileHandle.createWritable();
			await writable.write(blob);
			await writable.close();

			console.log('File saved successfully!');
		} else {	
			alert('File System Access API not supported in this browser. Try Chrome or Edge.');
		}
	} catch (error) {
		// User canceled the save dialog
		if (error.name !== 'AbortError') {
			console.error('Error saving file:', error);
		}
	}
};