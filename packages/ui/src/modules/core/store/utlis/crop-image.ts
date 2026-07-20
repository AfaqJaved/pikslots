import type { CropArea } from 'svelte-easy-crop';

export async function getCroppedFile(file: File, crop: CropArea): Promise<File> {
	// Load the image
	const url = URL.createObjectURL(file);
	const image = await createImage(url);

	// Create a canvas the size of the crop
	const canvas = document.createElement('canvas');
	canvas.width = crop.width;
	canvas.height = crop.height;

	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Unable to get canvas context');
	}

	// Draw only the cropped portion of the image
	ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

	// Convert canvas to Blob
	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
				URL.revokeObjectURL(url);
			} else {
				reject(new Error('Failed to create image blob'));
			}
		}, file.type);
	});

	// Return a new File
	return new File([blob], file.name, {
		type: file.type,
		lastModified: Date.now()
	});
}

function createImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();

		image.onload = () => resolve(image);
		image.onerror = reject;

		image.src = url;
	});
}
