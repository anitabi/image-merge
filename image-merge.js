const canvas = document.querySelector('canvas');




let captureImage;
let captureImageURL = '7eyih3xg.jpg';

const loadImageByURL = (url,onLoad)=>{
    const img = new Image();
    img.onload = ()=>onLoad(img);;
    img.crossOrigin = 'anonymous';
    img.src = url;
};
const loadCaptureImageURL = url=>{
    loadImageByURL(url,img=>{
        captureImage = img;
        drawMergeImage();
    });
};


loadCaptureImageURL(captureImageURL);

const height = 1080;

const drawMergeImage = ()=>{
    if(!captureImage){
        alert('截图图片不能为空');
        return;
    }

    // console.log(captureImage);
    const { naturalWidth, naturalHeight } = captureImage;

    const rate = naturalWidth / naturalHeight;

    const outputWidth = height * rate;
    const outputHeight = height * 2;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

}