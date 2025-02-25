const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const inputImage = document.getElementById('inputImage');
const dimensions = document.getElementById('dimensions');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const outputImage = document.getElementById('outputImage');
const formatSelect = document.getElementById('formatSelect');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const outputSection = document.getElementById('outputSection');
const inputPreview = document.getElementById('inputPreview'); // Add this

const qualitySliderContainer = document.getElementById('qualitySliderContainer');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const fileSizeEstimate = document.getElementById('fileSizeEstimate');

let originalImage = null;
const MAX_PREVIEW_SIZE = 400;

// Event listener for format change (unchanged)
formatSelect.addEventListener('change', () => {
    if (formatSelect.value === 'image/jpeg') {
        qualitySliderContainer.style.display = 'block';
    } else {
        qualitySliderContainer.style.display = 'none';
    }
});

// Drag and Drop Setup (unchanged)
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// Handle File Input with preview scaling and container visibility
function handleFile(file) {
    if (!file) {
        alert('No file selected!');
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            inputImage.src = originalImage.src = e.target.result;
            scaleImagePreview(inputImage, originalImage.width, originalImage.height);
            inputImage.hidden = false;
            inputPreview.hidden = false; // Show the input preview container
            dimensions.textContent = `Dimensions: ${originalImage.width}x${originalImage.height}`;
            outputSection.hidden = false;
            downloadBtn.disabled = true;
        };
        originalImage.onerror = () => {
            alert('Error loading image. It might be corrupted.');
            originalImage = null;
        };
        originalImage.src = e.target.result;
    };
    reader.onerror = () => alert('Error reading file!');
    reader.readAsDataURL(file);
}

// Helper function to scale image previews (unchanged)
function scaleImagePreview(imgElement, width, height) {
    const aspectRatio = width / height;
    if (width > MAX_PREVIEW_SIZE || height > MAX_PREVIEW_SIZE) {
        if (width > height) {
            imgElement.style.width = `${MAX_PREVIEW_SIZE}px`;
            imgElement.style.height = `${MAX_PREVIEW_SIZE / aspectRatio}px`;
        } else {
            imgElement.style.height = `${MAX_PREVIEW_SIZE}px`;
            imgElement.style.width = `${MAX_PREVIEW_SIZE * aspectRatio}px`;
        }
    } else {
        imgElement.style.width = `${width}px`;
        imgElement.style.height = `${height}px`;
    }
    imgElement.style.maxWidth = '100%';
}

// Quality slider update (unchanged)
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
});

// Convert Image with output scaling (unchanged)
convertBtn.addEventListener('click', () => {
    if (!originalImage) {
        alert('Please upload an image first!');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let width = parseInt(widthInput.value) || originalImage.width;
    let height = parseInt(heightInput.value) || originalImage.height;

    if (width < 1 || height < 1) {
        alert('Width and height must be at least 1 pixel!');
        return;
    }
    if (width > 10000 || height > 10000) {
        alert('Width and height cannot exceed 10,000 pixels!');
        return;
    }

    if (widthInput.value && !heightInput.value) {
        height = Math.round((width / originalImage.width) * originalImage.height);
        heightInput.value = height;
    } else if (heightInput.value && !widthInput.value) {
        width = Math.round((height / originalImage.height) * originalImage.width);
        widthInput.value = width;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(originalImage, 0, 0, width, height);

    const format = formatSelect.value;
    const quality = (format === 'image/jpeg') ? (parseInt(qualitySlider.value) / 100) : 1.0;
    const outputDataUrl = canvas.toDataURL(format, quality);
    outputImage.src = outputDataUrl;
    scaleImagePreview(outputImage, width, height);
    downloadBtn.disabled = false;

    const fileSizeKB = Math.round((outputDataUrl.length * 0.75) / 1024);
    dimensions.textContent = `Dimensions: ${width}x${height} | Approx. Size: ${fileSizeKB} KB`;
    fileSizeEstimate.textContent = `Estimated File Size: ${fileSizeKB} KB`;
});

// Download button (unchanged)
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = outputImage.src;
    const fileExtension = formatSelect.value.split('/')[1];
    link.download = `converted-image.${fileExtension}`;
    link.click();
});