// const canvas = $('canvas');

const $ = document.querySelector.bind(document);
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');


const outputImageEl = $('.output-image');

const loadImageByURL = (url,onLoad)=>{
    loadingStart();
    const img = new Image();
    img.onload = ()=>onLoad(img);
    img.crossOrigin = 'anonymous';
    img.src = url;
};
const loadCaptureImageURL = url=>{
    loadImageByURL(url,img=>{
        config.captureImage = img;

        // 判断截图图片的宽高比，以确定合成图片的方向
        const { naturalWidth, naturalHeight } = img;
        const rate = naturalWidth / naturalHeight;
        setDirection(rate < 1 ? 'horizontal' : 'vertical');
        
        // drawMergeImage();
    });
};
const loadCameraImageURL = url=>{
    loadImageByURL(url,img=>{
        config.cameraImage = img;
        drawMergeImage();
    });
}


const config = {
    captureImage: null,
    cameraImage: null,
    height: 1080,
    margin: 0,
    direction: 'vertical', // vertical | horizontal
    background: '#EEEEEE',
};

const htmlEl = document.documentElement;
const loadingStart = ()=>{
    htmlEl.setAttribute('data-loading','true');
};
const loadingStop = ()=>{
    htmlEl.setAttribute('data-loading','false');
};

// 生成图片链接
const generateImage = ()=>{
    const url = getCanvasURL();
    outputImageEl.src = url;
}


const outputEl = outputImageEl; // canvas

const drawMergeImage = ()=>{
    if(!config.captureImage){
        alert('截图图片不能为空');
        return;
    }

    loadingStart();

    // console.log(captureImage);
    const { naturalWidth, naturalHeight } = config.captureImage;

    const rate = naturalWidth / naturalHeight;

    const { direction } = config;

    let captureWidth, captureHeight, outputWidth, outputHeight;

    if (direction === 'vertical') {
        captureWidth = config.height * rate;
        captureHeight = config.height;
        outputWidth = captureWidth + config.margin * 2;
        outputHeight = captureHeight * 2 + config.margin * 3;
    } else {
        captureWidth = config.height;
        captureHeight = config.height / rate;
        outputWidth = captureWidth * 2 + config.margin * 3;
        outputHeight = captureHeight + config.margin * 2;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    outputEl.style.aspectRatio = outputWidth / outputHeight;

    ctx.fillStyle = config.background;
    ctx.fillRect(0,0,outputWidth,outputHeight);

    // 绘制截图

    ctx.drawImage(
        config.captureImage,
        config.margin,
        config.margin,
        captureWidth,
        captureHeight,
    );


    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(148, 128, 128, 0.3)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
        '巡礼对比图生成器 lab.magiconch.com/image-merge/',
        config.margin + 12,
        captureHeight + config.margin - 10
    );


    if(!config.cameraImage){
        ctx.font = '48px sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let drawTextLeft, drawTextTop;
        if (direction === 'vertical') {
            drawTextLeft = outputWidth / 2;
            drawTextTop = outputHeight * 0.75;
        } else {
            drawTextLeft = outputWidth * 0.75;
            drawTextTop = outputHeight / 2;
        }
        
        ctx.fillText(
            '点选或拖拽上传照片',
            drawTextLeft,
            drawTextTop
        );

        loadingStop();
        generateImage();
        return;
    }

    const {
        naturalWidth : cameraImageNaturalWidth,
        naturalHeight: cameraImageNaturalHeight
    } = config.cameraImage;



    const imageRate = cameraImageNaturalWidth / cameraImageNaturalHeight;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imageRate > rate) {
        drawWidth = cameraImageNaturalHeight * rate;
        drawHeight = cameraImageNaturalHeight;
        offsetX = (cameraImageNaturalWidth - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = cameraImageNaturalWidth;
        drawHeight = cameraImageNaturalWidth / rate;
        offsetX = 0;
        offsetY = (cameraImageNaturalHeight - drawHeight) / 2;
    }

    let drawImageLeft, drawImageTop;
    if (direction === 'vertical') {
        drawImageLeft = config.margin;
        drawImageTop = captureHeight + config.margin * 2;
    } else {
        drawImageLeft = captureWidth + config.margin * 2;
        drawImageTop = config.margin;
    }

    ctx.drawImage(
        config.cameraImage,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
        drawImageLeft,
        drawImageTop,
        captureWidth,
        captureHeight
    );

    loadingStop();
    generateImage();
};



outputEl.addEventListener('click',e=>{
    if(e.button!=0) return;
    console.log(e);

    const { clientX, clientY } = e;

    const rect = outputEl.getBoundingClientRect();

    let isCapture = false;
    if(config.direction === 'vertical'){ // 竖直方向
        const top = clientY - rect.top;
        isCapture = (rect.height / 2 - top) > 0;
    }else{
        const left = clientX - rect.left;
        isCapture = (rect.width / 2 - left) > 0;
    }

    chooseFile(file=>{
        console.log(file);
        getSrcByFile(file,src=>{
            if(isCapture){
                loadCaptureImageURL(src);
            }else{
                loadCameraImageURL(src);
            }
        });
    })
});


const throttle = (fn,wait)=>{
    let timer = null;
    return (...args)=>{
        if(timer) return;
        timer = setTimeout(()=>{
            fn(...args);
            timer = null;
        }
        ,wait);
    };
};

const inputRangeMarginEl = $('.input-range-margin');
const inputRangeValueEl = $('.config-margin-value');
inputRangeMarginEl.addEventListener('input',throttle(e=>{
    const v = +e.target.value;
    config.margin = v;
    inputRangeValueEl.innerText = v;

    drawMergeImage();
},300));

const inputBGColorEl = $('.input-background-color');
const inputColorValueEl = $('.config-background-color');
inputBGColorEl.addEventListener('input',throttle(e=>{
    const v = e.target.value;
    config.background = v;
    inputColorValueEl.innerText = v;
    drawMergeImage();
},10));




const form = document.createElement('form');
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
form.appendChild(input);
const chooseFile = (onOver)=>{
    form.reset();
    input.click();
    input.oninput = e=>{
        const file = input.files[0];
        if(!file) return;
        onOver(file);
    };
};


const getSrcByFile = (file,onOver)=>{
    return onOver(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = e=>{
        const src = reader.result;
        onOver(src);
    };
    reader.readAsDataURL(file);
};


const urlParams = new URLSearchParams(window.location.search)
loadCaptureImageURL(urlParams.get('url') || '7eyih3xg.jpg');


const getCanvasImageFile = onOver=>{
    canvas.toBlob(onOver,'image/jpeg',0.9);
};

const getCanvasURL = ()=>{
    return canvas.toDataURL('image/jpeg',0.9);
};
const getFileName = ()=>{
    const unix = +new Date();
    const uuid = unix.toString(36);
    return `[神奇海螺][对比图生成器][${uuid}].jpg`;
};

const saveImage = ()=>{
    const src = getCanvasURL();
    const fileName = getFileName();
    downloadBtn.download = fileName;
    downloadBtn.href = src;
};


const downloadBtn = $('.download-btn');
downloadBtn.addEventListener('click',saveImage);


const shareBtn = $('.share-btn');

if(!navigator.share){
    shareBtn.style.display = 'none';
}
shareBtn.addEventListener('click',async ()=>{
    const fileName = getFileName();
    getCanvasImageFile(async blob=>{

        if(!navigator.canShare) return;
        const file = new File([blob],fileName,{
            type: 'image/jpeg'
        });
        console.log(file)
        const files = [file];
        const canShare = navigator.canShare({ files });
        console.log(file,canShare);
        if(!canShare) return;

        navigator.share({
            title: fileName,
            files
        });
    })
});

// 阻止浏览器默认的文件拖拽行为
document.addEventListener('dragover', e => {
    e.preventDefault();
});

// 拖拽文件进入拖拽区域时的样式变化
document.addEventListener('dragenter', e => {
    document.body.style.backgroundColor = 'lightgray';
});

// 拖拽文件离开拖拽区域时的样式恢复
document.addEventListener('dragleave', e => {
    document.body.style.backgroundColor = '';
});

// 拖拽文件放下时的处理函数
document.addEventListener('drop', e => {
    e.preventDefault();
    document.body.style.backgroundColor = '';

    const file = e.dataTransfer.files[0];
    if(!file) return;


    const { clientX, clientY } = e;

    const rect = outputEl.getBoundingClientRect();
    
    let isCapture = false;
    if(config.direction === 'vertical'){ // 竖直方向
        const top = clientY - rect.top;
        isCapture = (rect.height / 2 - top) > 0;
    } else {
        const left = clientX - rect.left;
        isCapture = (rect.width / 2 - left) > 0;
    }

    console.log(clientY,rect,isCapture)

    getSrcByFile(file, src => {
        if (isCapture) {
            loadCaptureImageURL(src);
        } else {
            loadCameraImageURL(src);
        }
    });
});



const updateDirection = ()=>{
    const tabEls = document.querySelectorAll('.ui-tab[v-model="config.direction"]');
    tabEls.forEach(el=>{
        const value = el.getAttribute('value');
        el.setAttribute('data-checked',value === config.direction);
    });
};
updateDirection();
const setDirection = value=>{
    config.direction = value;
    updateDirection();
    drawMergeImage();
}

const setDirectionByEl = el=>{
    const value = el.getAttribute('value');
    setDirection(value);
}