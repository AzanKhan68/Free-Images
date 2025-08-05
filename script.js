document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const ratioButtons = document.querySelectorAll('.ratio-btn');
    const referenceUpload = document.getElementById('reference-upload');
    const generateBtn = document.getElementById('generate-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const generatedImage = document.getElementById('generated-image');
    const downloadBtn = document.getElementById('download-btn');
    const errorMessage = document.getElementById('error-message');

    // Replace with your actual Hugging Face API Token.
    // This is a free token, but it's best practice to secure it.
    // For hosting on Vercel or similar platforms, use environment variables.
    // For this example, we'll keep it here for copy-paste functionality.
    const HUGGING_FACE_API_TOKEN = 'YOUR_HUGGING_FACE_API_TOKEN_HERE';
    const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

    let selectedRatio = '1:1';

    // Handle aspect ratio selection
    ratioButtons.forEach(button => {
        button.addEventListener('click', () => {
            ratioButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedRatio = button.getAttribute('data-ratio');
        });
    });

    // Handle image generation
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showError('Please enter a valid prompt.');
            return;
        }

        // Hide previous results and errors
        resultContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        try {
            const payload = {
                inputs: prompt,
                // Hugging Face API does not directly support aspect ratio parameters
                // but we can adjust resolution. Stable Diffusion XL supports various resolutions.
                // Here we set resolutions corresponding to the selected ratio.
                // NOTE: The model may not generate the exact size, but will be close.
                height: getResolution().height,
                width: getResolution().width,
            };

            const response = await fetch(
                API_URL, {
                    headers: {
                        Authorization: `Bearer ${HUGGING_FACE_API_TOKEN}`,
                    },
                    method: 'POST',
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                // If the response is not OK, it's an API error
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate image. Please try again.');
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            generatedImage.src = imageUrl;
            resultContainer.classList.remove('hidden');
        } catch (error) {
            console.error('API Error:', error);
            showError(`Failed to generate image. Please try again. Error: ${error.message}`);
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });

    // Function to get resolution based on selected ratio.
    // Aiming for at least 1080p equivalent.
    function getResolution() {
        switch (selectedRatio) {
            case '9:16':
                return {
                    width: 768,
                    height: 1360
                }; // Portrait
            case '16:9':
                return {
                    width: 1360,
                    height: 768
                }; // Landscape
            case '1:1':
            default:
                return {
                    width: 1024,
                    height: 1024
                }; // Square
        }
    }

    // Handle image download
    downloadBtn.addEventListener('click', () => {
        const imageUrl = generatedImage.src;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `azan-world-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Display error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});
