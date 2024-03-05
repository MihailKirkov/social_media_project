export const isImage = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const extension = filename.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
};

export const isVideo = (filename) => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv'];
    const extension = filename.split('.').pop().toLowerCase();
    return videoExtensions.includes(extension);
};