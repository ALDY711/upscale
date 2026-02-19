document.addEventListener('DOMContentLoaded', () => {
    // GANTI URL INI DENGAN URL HUGGING FACE SPACE ANDA SETELAH DEPLOY
    // Contoh: const API_BASE_URL = 'https://username-space-name.hf.space';
    // Untuk testing lokal, gunakan 'http://localhost:7860'
    const API_BASE_URL = 'http://localhost:7860';

    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const upscaleBtn = document.getElementById('upscale-btn');
    const modelSelect = document.getElementById('model-select');
    const scaleSelect = document.getElementById('scale-select');
    const loadingOverlay = document.getElementById('loading');
    const resultArea = document.getElementById('result-area');
    const originalImage = document.getElementById('original-image');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');

    let selectedFile = null;

    // Drag and Drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('dragover');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            selectedFile = files[0];
            upscaleBtn.disabled = false;

            const reader = new FileReader();
            reader.onload = function (e) {
                console.log('File selected:', selectedFile.name);
            }
            reader.readAsDataURL(selectedFile);
        }
    }

    upscaleBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('model', modelSelect.value);
        formData.append('scale', scaleSelect.value);

        loadingOverlay.style.display = 'flex';
        upscaleBtn.disabled = true;

        try {
            // Updated fetch to use absolute URL if needed (handled by API_BASE_URL)
            const fetchUrl = `${API_BASE_URL}/upscale`;

            const response = await fetch(fetchUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upscaling failed');
            }

            const data = await response.json();

            // Update UI with results
            // Backend now returns absolute URLs, so we strictly use them
            originalImage.src = data.original_url;
            resultImage.src = data.result_url;
            downloadBtn.href = data.result_url;

            resultArea.style.display = 'block';

            // Scroll to results
            resultArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during upscaling. Please try again.');
        } finally {
            loadingOverlay.style.display = 'none';
            upscaleBtn.disabled = false;
        }
    });
});
