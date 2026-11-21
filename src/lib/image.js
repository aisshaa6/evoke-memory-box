// Phone cameras routinely produce 3–10MB photos, so instead of rejecting them
// we downscale to MAX px and re-encode as JPEG. Only absurdly large files are refused.
export const MAX_PHOTO_MB = 25;
const MAX = 1200;

export function readImageFile(file) {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB <= 1) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ dataUrl: reader.result, compressed: false });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
            if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.75), compressed: true });
        };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
    });
}
