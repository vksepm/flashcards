# 📚 Modern Flashcard App - Technical Diagrams ✨

This document contains the technical diagrams for the Modern Flashcard App, including component structure, event handling, and class relationships.

## 📊 Component Diagram

```mermaid
graph TD
    %% Main Application Module
    FlashcardApp[Flashcard App Module]
    
    %% Core Components
    FC[Flashcard Component]
    Q[Question Content]
    A[Answer Content]
    Nav[Navigation Controls]
    Progress[Progress Indicator]
    Settings[Settings Panel]
    Upload[Content Upload Interface]
    
    %% Navigation Components
    Prev[Previous Button]
    Next[Next Button]
    Counter[Card Counter]
    ProgressBar[Progress Bar]
    
    %% Settings Components
    Shuffle[Shuffle Toggle]
    SeedInput[Seed Input]
    DarkMode[Dark Theme Toggle]
    Fullscreen[Fullscreen Button]
    
    %% Upload Components
    FileUpload[File Upload]
    PasteArea[Paste Area]
    FormatInfo[Format Information]
    
    %% Core Component Relationships
    FlashcardApp --> FC
    FlashcardApp --> Nav
    FlashcardApp --> Progress
    FlashcardApp --> Settings
    FlashcardApp --> Upload
    
    FC --> Q
    FC --> A
    
    %% Navigation Relationships
    Nav --> Prev
    Nav --> Next
    Nav --> Counter
    Nav --> ProgressBar
    
    %% Settings Relationships
    Settings --> Shuffle
    Settings --> SeedInput
    Settings --> DarkMode
    Settings --> Fullscreen
    Shuffle --> SeedInput
    
    %% Upload Relationships
    Upload --> FileUpload
    Upload --> PasteArea
    Upload --> FormatInfo
```

## 🔄 Event Handling Diagram

```mermaid
sequenceDiagram
    participant User
    participant FC as Flashcard
    participant Nav as Navigation
    participant Settings as Settings
    participant Upload as Content Upload
    
    User->>Upload: Upload File/Paste Content
    Upload->>FC: Process Content & Initialize
    
    User->>FC: Click Card
    FC->>FC: Toggle Flip State
    
    User->>Nav: Click Next
    Nav->>FC: Increment Card Index
    FC->>FC: Update Card Content
    FC->>Nav: Update Progress
    
    User->>Nav: Click Previous
    Nav->>FC: Decrement Card Index
    FC->>FC: Update Card Content
    FC->>Nav: Update Progress
    
    User->>Settings: Toggle Shuffle
    Settings->>FC: Shuffle Cards/Restore Order
    FC->>FC: Update Card Content
    FC->>Nav: Update Progress
    
    User->>Settings: Enter Seed
    Settings->>FC: Reshuffle with Seed
    
    User->>Settings: Toggle Dark Mode
    Settings->>FC: Update Theme
    
    User->>Settings: Click Fullscreen
    Settings->>FC: Toggle Fullscreen Mode
    
    User->>FC: Press Space Key
    FC->>FC: Toggle Flip State
    
    User->>FC: Press Arrow Keys
    FC->>FC: Navigate Cards/Scroll Content
    FC->>Nav: Update Progress
    
    User->>FC: Swipe Left/Right
    FC->>FC: Navigate Cards
    FC->>Nav: Update Progress
```

## 📊 Class Diagram

```mermaid
classDiagram
    class FlashcardApp {
        -flashcards: Array
        -originalFlashcards: Array
        -currentCardIndex: Number
        -currentSeed: String
        -elements: Object
        +init()
        +showContentUploadInterface()
        +handleFileUpload(event)
        +handleContentLoad()
        +showNoFlashcardsError()
        +processMarkdownToFlashcards(markdownContent)
        +initFlashcardApp(cards)
        +cacheElements()
        +setupEventListeners()
        +handleKeyboardNavigation(e)
        +setupTouchSwipeSupport()
        +toggleFullscreen()
        +updateFullscreenButtonIcon()
        +updateCard()
        +updateProgress()
        +shuffleFlashcards()
    }

    class FlashcardComponent {
        -question: String
        -answer: String
        -isFlipped: Boolean
        +flipCard()
        +setContent(question, answer)
    }

    class NavigationControls {
        -prevButton: HTMLElement
        -nextButton: HTMLElement
        -cardCounter: HTMLElement
        -progressBar: HTMLElement
        +goToPrevious()
        +goToNext()
        +updateCounter(current, total)
        +updateProgressBar(percentage)
    }

    class SettingsPanel {
        -shuffleToggle: HTMLElement
        -seedInput: HTMLElement
        -darkThemeToggle: HTMLElement
        -fullscreenButton: HTMLElement
        +toggleShuffle(isEnabled)
        +setSeed(seed)
        +toggleDarkTheme(isDark)
        +toggleFullscreen()
    }

    class ContentUploadInterface {
        -fileInput: HTMLElement
        -pasteArea: HTMLElement
        -formatInfo: HTMLElement
        +handleFileUpload(file)
        +handlePaste(content)
        +processContent()
    }

    class Flashcard {
        -id: String
        -question: String
        -answer: String
        +constructor(id, question, answer)
        +getQuestion()
        +getAnswer()
    }

    class TouchHandler {
        -startX: Number
        -startY: Number
        -handleTouchStart(e)
        -handleTouchMove(e)
        -handleTouchEnd(e)
    }

    FlashcardApp --> FlashcardComponent : manages
    FlashcardApp --> NavigationControls : manages
    FlashcardApp --> SettingsPanel : manages
    FlashcardApp --> ContentUploadInterface : manages
    FlashcardApp --> Flashcard : contains many
    FlashcardApp --> TouchHandler : uses
    
    FlashcardComponent ..> Flashcard : displays
    NavigationControls ..> FlashcardApp : updates
    SettingsPanel ..> FlashcardApp : configures
    ContentUploadInterface ..> FlashcardApp : provides data
```

## 🧩 Component Descriptions

### Main Components
- **Flashcard Component**: The core component that displays questions and answers
- **Navigation Controls**: Buttons and indicators for moving between cards
- **Progress Indicator**: Visual representation of progress through the deck
- **Settings Panel**: Controls for shuffle, dark mode, and fullscreen features
- **Content Upload Interface**: Interface for loading flashcard content

### Event Handling
- **Card Flipping**: Triggered by clicking the card or pressing space
- **Navigation**: Triggered by buttons, arrow keys, or swipe gestures
- **Shuffle Management**: Handles shuffling cards with optional seed-based consistency
- **Theme Switching**: Toggles between light and dark themes
- **Fullscreen Mode**: Manages entering and exiting fullscreen mode
- **Content Loading**: Processes uploaded files or pasted content
