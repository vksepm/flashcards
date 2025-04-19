/**
 * Modern Flashcard App
 * A sleek, interactive web-based flashcard application
 */

// Main module for the flashcard application
const FlashcardApp = (function() {
    // Private variables
    let flashcards = [];
    let originalFlashcards = [];
    let currentCardIndex = 0;
    
    // DOM Elements - will be initialized when app starts
    let elements = {
        flashcardElement: null,
        questionContent: null,
        answerContent: null,
        progressElement: null,
        prevButton: null,
        nextButton: null,
        shuffleToggle: null,
        fullscreenToggle: null,
        progressBar: null,
        cardCounter: null
    };

    /**
     * Initialize the application
     */
    function init() {
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                // Try to fetch the content.md file first
                const response = await fetch('content.md');
                if (response.ok) {
                    const markdownContent = await response.text();
                    flashcards = processMarkdownToFlashcards(markdownContent);
                    initFlashcardApp(flashcards);
                } else {
                    // If content.md is not available, show upload interface
                    showContentUploadInterface();
                }
            } catch (error) {
                console.error('Error loading flashcards:', error);
                showContentUploadInterface();
            }
        });
    }

    /**
     * Show the content upload interface
     */
    function showContentUploadInterface() {
        // Hide the flashcard back to prevent it showing through
        document.querySelector('.flashcard-back').style.display = 'none';
          
        // Display upload interface in the question content area
        document.getElementById('question-content').innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center p-6" id="upload-container">
                <h2 class="text-xl font-bold text-gray-700 mb-4">Upload Flashcard Content</h2>
                <div class="w-full max-w-md mb-6">
                    <label class="block mb-2 text-sm font-medium text-gray-700">
                        Upload a markdown file
                    </label>
                    <input type="file" id="file-upload" accept=".md,.txt" 
                        class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                        file:rounded-full file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 
                        cursor-pointer border rounded-lg p-2">
                </div>
                  
                <div class="w-full max-w-md mb-6">
                    <p class="text-sm font-medium text-gray-700 mb-2">
                        Or paste content directly on this page (Ctrl+V) and press Ctrl+Enter to load
                    </p>
                    <div class="w-full h-full" id="paste-container">
                        <textarea id="content-paste" rows="20" 
                            class="w-full h-96 md:h-[30rem] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Your pasted flashcard content will appear here..."></textarea>
                        <p class="text-xs text-gray-500 mt-2 text-center">Press Ctrl+Enter to load flashcards</p>
                    </div>
                </div>
                
                <div class="text-xs text-gray-500 mt-4">
                    <p><strong>Format Example:</strong></p>
                    <pre class="bg-gray-100 p-3 rounded text-left overflow-auto">Question: 1
What is the capital of France?
Answer: Paris is the capital of France.

Question: 2
What is the largest planet in our solar system?
Answer: Jupiter is the largest planet.</pre>
                </div>
                
                <div class="hidden">
                    <button id="load-content-btn">Load Flashcards</button>
                </div>
            </div>
        `;
        
        // Event listeners for content loading
        document.getElementById('file-upload').addEventListener('change', handleFileUpload);
        document.getElementById('load-content-btn').addEventListener('click', handleContentLoad);
        
        // Add Ctrl+Enter support for the textarea
        document.getElementById('content-paste').addEventListener('keydown', function(e) {
            // Check if Ctrl/Cmd+Enter was pressed
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleContentLoad();
            }
        });
        
        // Listen for paste events on the document
        document.addEventListener('paste', function(e) {
            const pasteContainer = document.getElementById('paste-container');
            const contentPaste = document.getElementById('content-paste');
            
            // Get pasted text from clipboard
            const clipboardData = e.clipboardData || window.clipboardData;
            const pastedText = clipboardData.getData('text');
            
            if (pastedText) {
                // Show the textarea and set its value to the pasted content
                pasteContainer.classList.remove('hidden');
                contentPaste.value = pastedText;
                
                // Focus the textarea so user can edit if needed
                contentPaste.focus();
                
                // Prevent the default paste behavior
                e.preventDefault();
            }
        });
    }

    /**
     * Handle file uploads
     * @param {Event} event - The file input change event
     */
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('content-paste').value = e.target.result;
                // Automatically load content when file is uploaded
                handleContentLoad();
            };
            reader.readAsText(file);
        }
    }

    /**
     * Handle the content loading
     */
    function handleContentLoad() {
        const contentText = document.getElementById('content-paste').value.trim();
        
        if (contentText) {
            try {
                // Reset any hidden elements
                document.querySelector('.flashcard-back').style.display = '';
                
                // Process the content and initialize the app
                const parsedCards = processMarkdownToFlashcards(contentText);
                
                if (parsedCards.length > 0) {
                    flashcards = parsedCards;
                    initFlashcardApp(flashcards);
                } else {
                    showNoFlashcardsError();
                }
            } catch (error) {
                console.error("Error processing flashcards:", error);
                showNoFlashcardsError();
            }
        } else {
            alert('Please enter or upload some content first.');
        }
    }

    /**
     * Show error when no valid flashcards are found
     */
    function showNoFlashcardsError() {
        document.getElementById('question-content').innerHTML = `
            <div class="text-red-500 font-bold">Error: No valid flashcards found</div>
            <p>Please check your content format and try again.</p>
            <button id="back-to-upload" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Back to Upload
            </button>
        `;
        document.getElementById('back-to-upload').addEventListener('click', showContentUploadInterface);
    }

    /**
     * Process markdown content into flashcards
     * @param {string} markdownContent - The markdown content to process
     * @returns {Array} - Array of flashcard objects
     */
    function processMarkdownToFlashcards(markdownContent) {
        if (!markdownContent || typeof markdownContent !== 'string') {
            console.error("Invalid markdown content provided");
            return [];
        }

        const flashcards = [];
        
        try {
            // Split by "Question:" to separate individual cards
            const sections = markdownContent.split(/Question:\s+/);
            
            // Skip the first empty section if it exists
            for (let i = 1; i < sections.length; i++) {
                const section = sections[i].trim();
                
                if (!section) continue;
                
                // Extract the question number
                const questionNumberMatch = section.match(/^(\d+)/);
                const questionNumber = questionNumberMatch ? questionNumberMatch[1] : i;
                
                // Split by "Answer:" to separate question and answer
                const parts = section.split(/Answer:\s+/);
                
                if (parts.length >= 2) {
                    const questionText = parts[0].trim();
                    const answerText = parts[1].trim();
                    
                    flashcards.push({
                        id: questionNumber,
                        question: `Question: ${questionText}`,
                        answer: answerText
                    });
                }
            }
        } catch (error) {
            console.error("Error processing markdown content:", error);
        }
        
        return flashcards;
    }

    /**
     * Initialize the flashcard app with the parsed flashcards
     * @param {Array} cards - Array of flashcard objects
     */
    function initFlashcardApp(cards) {
        if (!cards || cards.length === 0) {
            document.getElementById('question-content').innerHTML = 'No flashcards found in content.md';
            return;
        }
        
        // Cache DOM elements for better performance
        cacheElements();
        
        // Initialize variables
        currentCardIndex = 0;
        originalFlashcards = [...cards]; // Keep a copy of the original order
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize with the first card
        updateCard();
    }

    /**
     * Cache DOM elements for better performance
     */
    function cacheElements() {
        elements = {
            flashcardElement: document.getElementById('flashcard'),
            questionContent: document.getElementById('question-content'),
            answerContent: document.getElementById('answer-content'),
            progressElement: document.getElementById('progress'),
            prevButton: document.getElementById('prev-btn'),
            nextButton: document.getElementById('next-btn'),
            shuffleToggle: document.getElementById('shuffle-toggle'),
            fullscreenToggle: document.getElementById('fullscreen-toggle'),
            progressBar: document.getElementById('progress-bar'),
            cardCounter: document.getElementById('card-counter')
        };
    }

    /**
     * Set up event listeners for the app
     */
    function setupEventListeners() {
        // Event handler for flipping the card
        elements.flashcardElement.addEventListener('click', function() {
            elements.flashcardElement.classList.toggle('flipped');
        });
        
        // Event handlers for navigation buttons
        elements.prevButton.addEventListener('click', function() {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                updateCard();
            }
        });
        
        elements.nextButton.addEventListener('click', function() {
            if (currentCardIndex < flashcards.length - 1) {
                currentCardIndex++;
                updateCard();
            }
        });
        
        // Add event listener for fullscreen toggle
        elements.fullscreenToggle.addEventListener('change', toggleFullscreen);
        
        // Listen for fullscreen change events to keep toggle in sync
        document.addEventListener('fullscreenchange', function() {
            elements.fullscreenToggle.checked = !!document.fullscreenElement;
        });
        document.addEventListener('webkitfullscreenchange', function() {
            elements.fullscreenToggle.checked = !!document.webkitFullscreenElement;
        });
        document.addEventListener('msfullscreenchange', function() {
            elements.fullscreenToggle.checked = !!document.msFullscreenElement;
        });
        
        // Add event listener for shuffle toggle
        elements.shuffleToggle.addEventListener('change', function() {
            if (this.checked) {
                shuffleFlashcards();
            } else {
                // Restore original order
                flashcards = [...originalFlashcards];
                currentCardIndex = 0;
                updateCard();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
        
        // Touch swipe support
        setupTouchSwipeSupport();
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - The keyboard event
     */
    function handleKeyboardNavigation(e) {
        // Spacebar to flip
        if (e.code === 'Space') {
            e.preventDefault();
            elements.flashcardElement.classList.toggle('flipped');
        }
        
        // Left arrow for previous card
        else if (e.code === 'ArrowLeft' && currentCardIndex > 0) {
            currentCardIndex--;
            updateCard();
        }
        
        // Right arrow for next card
        else if (e.code === 'ArrowRight' && currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            updateCard();
        }
    }

    /**
     * Setup touch swipe support for mobile devices
     */
    function setupTouchSwipeSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            
            // Swipe right to left (next)
            if (touchStartX - touchEndX > swipeThreshold && currentCardIndex < flashcards.length - 1) {
                currentCardIndex++;
                updateCard();
            }
            
            // Swipe left to right (previous)
            else if (touchEndX - touchStartX > swipeThreshold && currentCardIndex > 0) {
                currentCardIndex--;
                updateCard();
            }
        }
    }

    /**
     * Toggle fullscreen mode
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
                document.documentElement.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    }

    /**
     * Shuffle the flashcards using Fisher-Yates algorithm
     */
    function shuffleFlashcards() {
        // Fisher-Yates shuffle algorithm
        for (let i = flashcards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
        }
        currentCardIndex = 0;
        updateCard();
    }

    /**
     * Update the displayed card
     */
    function updateCard() {
        if (!flashcards || flashcards.length === 0) {
            console.error("No flashcards available to display");
            return;
        }
        
        const card = flashcards[currentCardIndex];
        
        // Use marked.js to render markdown content
        elements.questionContent.innerHTML = marked.parse(card.question);
        elements.answerContent.innerHTML = marked.parse(card.answer);
        
        // Update progress text
        elements.progressElement.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
        
        // Update progress bar and counter
        const progressPercentage = ((currentCardIndex + 1) / flashcards.length) * 100;
        elements.progressBar.style.width = `${progressPercentage}%`;
        elements.cardCounter.textContent = `${currentCardIndex + 1}/${flashcards.length}`;
        
        // Update button states
        elements.prevButton.disabled = currentCardIndex === 0;
        elements.nextButton.disabled = currentCardIndex === flashcards.length - 1;
        
        // Ensure card is showing front side
        elements.flashcardElement.classList.remove('flipped');
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize the application
FlashcardApp.init();
