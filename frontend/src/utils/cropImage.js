// frontend/src/utils/cropImage.js

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // Избегаем проблем с CORS
        image.src = url;
    });

export default async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Устанавливаем размер холста равным размеру выделенной области
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Отрисовываем вырезанный кусок на холсте
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Превращаем холст обратно в файл (Blob) для отправки на сервер
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(new File([blob], 'cropped_avatar.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.95); // 0.95 - качество сжатия
    });
}