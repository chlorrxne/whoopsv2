// Import media configuration
import { mediaCategories, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from './media-config.js';

// Configuration
const CORRECT_PASSWORD = '11190812188'; // Change this to your desired password
const PHOTOS_DIRECTORY = 'photos/'; // Directory where photos are stored

// Debugging function
function debugLog(...messages) {
    console.log('[DEBUG]', ...messages);
}

// Ensure all DOM elements are loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM fully loaded and parsed');

    // Get DOM elements with extensive logging
    const loginContainer = document.getElementById('login-container');
    const galleryContainer = document.getElementById('gallery-container');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    const photoGrid = document.getElementById('photo-grid');
    const logoutBtn = document.getElementById('logout-btn');
    const categorySelector = document.getElementById('category-selector');

    // Log all retrieved elements
    debugLog('Login Container:', loginContainer);
    debugLog('Gallery Container:', galleryContainer);
    debugLog('Login Form:', loginForm);
    debugLog('Password Input:', passwordInput);
    debugLog('Error Message:', errorMessage);
    debugLog('Photo Grid:', photoGrid);
    debugLog('Logout Button:', logoutBtn);
    debugLog('Category Selector:', categorySelector);

    // Populate category selector
    if (categorySelector) {
        const categories = Object.keys(mediaCategories);
        debugLog('Available Categories:', categories);

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelector.appendChild(option);
        });

        // Add event listener to category selector
        categorySelector.addEventListener('change', () => {
            const selectedCategory = categorySelector.value;
            debugLog('Selected Category:', selectedCategory);
            loadMedia(selectedCategory);
        });
    }

    // Comprehensive login event listener
    function setupLoginListener() {
        if (!loginForm || !passwordInput || !errorMessage) {
            debugLog('ERROR: Missing login form elements');
            return;
        }

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            debugLog('Login Form Submitted');
            debugLog('Entered Password:', passwordInput.value);
            debugLog('Correct Password:', CORRECT_PASSWORD);

            // Clear any previous error messages
            errorMessage.textContent = '';
            
            if (passwordInput.value === CORRECT_PASSWORD) {
                debugLog('Password Correct');
                
                // Hide login container and show gallery
                if (loginContainer) {
                    loginContainer.style.display = 'none';
                    debugLog('Login Container Hidden');
                }
                
                if (galleryContainer) {
                    galleryContainer.style.display = 'block';
                    debugLog('Gallery Container Shown');
                }
                
                // Load media for the first category by default
                const firstCategory = Object.keys(mediaCategories)[0];
                debugLog('Loading First Category:', firstCategory);
                loadMedia(firstCategory);
            } else {
                debugLog('Password Incorrect');
                
                // Show error message for incorrect password
                errorMessage.textContent = 'Incorrect password. Please try again.';
                
                // Add shake animation
                errorMessage.classList.add('shake');
                setTimeout(() => {
                    errorMessage.classList.remove('shake');
                }, 500);
            }
        });
    }

    // Setup login listener
    setupLoginListener();

    // Logout event listener
    function setupLogoutListener() {
        if (!logoutBtn || !galleryContainer || !loginContainer) {
            debugLog('ERROR: Missing logout elements');
            return;
        }

        logoutBtn.addEventListener('click', function() {
            debugLog('Logout Clicked');
            
            galleryContainer.style.display = 'none';
            loginContainer.style.display = 'block';
            
            if (passwordInput) passwordInput.value = '';
            if (errorMessage) errorMessage.textContent = '';
            if (photoGrid) photoGrid.innerHTML = '';
        });
    }

    // Setup logout listener
    setupLogoutListener();
});

// Function to determine media type
function getMediaType(filename) {
    const ext = '.' + filename.split('.').pop().toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
    if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
    return 'unknown';
}

// Function to create media element
function createMediaElement(file) {
    const mediaType = getMediaType(file);
    let mediaElement;

    if (mediaType === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.src = `${PHOTOS_DIRECTORY}${file}`;
        mediaElement.alt = file;
    } else if (mediaType === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = `${PHOTOS_DIRECTORY}${file}`;
        mediaElement.alt = file;
        mediaElement.setAttribute('preload', 'metadata');
        mediaElement.setAttribute('playsinline', '');
    } else {
        console.log(`Unsupported media type for file: ${file}`);
        return null;
    }

    mediaElement.onerror = () => {
        console.log(`Could not load media: ${file}`);
        mediaElement.style.display = 'none';
    };

    return mediaElement;
}

// Function to load media for a specific category
function loadMedia(category) {
    console.log('Loading media for category:', category);
    console.log('Media files:', mediaCategories[category]);
    
    const photoGrid = document.getElementById('photo-grid');
    if (!photoGrid) {
        console.error('Photo grid element not found');
        return;
    }
    
    // Clear existing media
    photoGrid.innerHTML = '';
    
    // Load media for the selected category
    mediaCategories[category].forEach(file => {
        const mediaElement = createMediaElement(file);
        if (!mediaElement) return;

        // Add click event to maximize media
        mediaElement.addEventListener('click', () => {
            // Create or get existing maximized view container
            let maximizedView = document.getElementById('maximized-view');
            if (!maximizedView) {
                maximizedView = document.createElement('div');
                maximizedView.id = 'maximized-view';
                document.body.appendChild(maximizedView);
            }
            
            // Clear previous content and add new media
            maximizedView.innerHTML = '';
            
            // Clone the media element for maximized view
            const maximizedMedia = mediaElement.cloneNode(true);
            maximizedMedia.removeAttribute('style');
            
            // Add controls for video
            if (maximizedMedia.tagName.toLowerCase() === 'video') {
                maximizedMedia.setAttribute('controls', '');
                maximizedMedia.setAttribute('autoplay', '');
            }
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.classList.add('close-btn');
            
            // Close maximized view when clicking close button or outside the media
            closeBtn.addEventListener('click', () => {
                maximizedView.style.display = 'none';
                // Pause video if it's playing
                if (maximizedMedia.tagName.toLowerCase() === 'video') {
                    maximizedMedia.pause();
                }
            });
            maximizedView.addEventListener('click', (e) => {
                if (e.target === maximizedView) {
                    maximizedView.style.display = 'none';
                    // Pause video if it's playing
                    if (maximizedMedia.tagName.toLowerCase() === 'video') {
                        maximizedMedia.pause();
                    }
                }
            });
            
            maximizedView.appendChild(closeBtn);
            maximizedView.appendChild(maximizedMedia);
            maximizedView.style.display = 'flex';
        });
        
        photoGrid.appendChild(mediaElement);
    });
}

// Optional: Add keyboard support for login
const passwordInput = document.getElementById('password-input');
if (passwordInput) {
    passwordInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}
