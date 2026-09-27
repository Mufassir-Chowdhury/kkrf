/**
 * Downscale a photo to `maxSide` px (longest side), convert to grayscale JPEG
 * and return it as a base64 string (no data: prefix).
 */
export async function compressImage(file, maxSide = 1600, quality = 0.7) {
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.src = url;
		await img.decode();

		const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(img.naturalWidth * scale);
		canvas.height = Math.round(img.naturalHeight * scale);

		const ctx = canvas.getContext('2d');
		ctx.filter = 'grayscale(1)';
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		return canvas.toDataURL('image/jpeg', quality).split(',')[1];
	} finally {
		URL.revokeObjectURL(url);
	}
}
