// ai-assistant.js

// ai-assistant.js
// This file handles the entire functionality of the Emergency AI Assistant across the application.
// It is injected into every page automatically to provide an AI chat interface.

function initAiAssistant() {
    // Feature: Duplicate Prevention
    // This checks if the AI wrapper has already been added to the page to prevent creating multiple chat boxes.
    if (document.querySelector('.ai-assistant-wrapper')) return;

    // Feature: Dynamic HTML Injection
    // 1. Inject HTML Layout directly via JavaScript
    // This avoids the need to copy-paste the HTML into every individual page.
    const assistantWrapper = document.createElement("div");
    assistantWrapper.className = "ai-assistant-wrapper";
    assistantWrapper.innerHTML = `
        <div class="ai-panel" id="globalAiPanel">
            <!-- Glow Effect Layer for aesthetic visual feedback -->
            <div class="ai-panel-glow"></div>
            
            <!-- Inner Content wrapper containing header, chat area, and footer -->
            <div class="ai-panel-inner">
                <div class="ai-panel-header">
                    <h3>Emergency Assistant</h3>
                    <button class="ai-close-btn" id="globalAiCloseBtn">
                        <i data-lucide="x" size="20"></i>
                    </button>
                </div>
                
                <!-- Chat Area where messages will be appended -->
                <div class="ai-chat-area" id="globalAiChatArea">
                    <div class="ai-typing-indicator" id="globalAiTyping">Analyzing...</div>
                </div>
                
                <!-- Footer with the input field and send button -->
                <div class="ai-panel-footer">
                    <input type="text" id="globalAiInput" placeholder="Describe emergency...">
                    <button class="ai-send-btn" id="globalAiSendBtn">
                        <i data-lucide="send" size="18"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Floating Action Button (FAB) that opens the AI Assistant panel -->
        <button class="ai-fab" id="globalAiFab">
            <i data-lucide="message-square" size="24"></i>
        </button>
    `;
    
    // Add the generated HTML to the webpage's body
    document.body.appendChild(assistantWrapper);

    // Feature: Icon Rendering
    // Initialize Lucide icons for the newly injected HTML elements so they display properly
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Elements & Logic
    // Grab references to the HTML elements we just injected so we can interact with them
    const fab = document.getElementById("globalAiFab");
    const panel = document.getElementById("globalAiPanel");
    const closeBtn = document.getElementById("globalAiCloseBtn");
    const sendBtn = document.getElementById("globalAiSendBtn");
    const inputField = document.getElementById("globalAiInput");
    const chatArea = document.getElementById("globalAiChatArea");
    const typingIndicator = document.getElementById("globalAiTyping");

    // Feature: State Persistence across Page Navigation
    // Retrieve the panel state (open or closed) from the browser's sessionStorage
    let isPanelOpen = sessionStorage.getItem('resq_ai_isOpen') === 'true';
    let thinkingInterval = null;
    
    // Retrieve past chat history from sessionStorage so messages don't disappear when moving between pages
    let chatHistory = JSON.parse(sessionStorage.getItem('resq_ai_history')) || [];

    // Feature: Render Initial State
    // If the panel was open on the previous page, make sure it stays open on the current page immediately
    if (isPanelOpen) {
        gsap.set(panel, { autoAlpha: 1, y: 0 });
    }

    // Feature: Render Chat History
    // A function to recreate the conversation bubbles from the saved history array
    function renderHistory() {
        chatHistory.forEach(msg => {
            const bubble = document.createElement("div");
            bubble.className = `chat-bubble ${msg.sender}`;
            const safeText = String(msg.text || "");
            bubble.innerHTML = safeText.replace(/\n/g, '<br>');
            chatArea.insertBefore(bubble, typingIndicator);
        });
        chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
    }
    renderHistory(); // Run history rendering as soon as script starts

    // Feature: Dynamic Loading Animation
    // Text array to cycle through while the AI is "thinking"
    const thinkingTexts = ["Analyzing...", "Thinking...", "Formulating...", "Connecting..."];
    let thinkingIndex = 0;

    // Feature: Toggle Panel
    // Opens the AI panel when the Floating Action Button is clicked
    fab.addEventListener("click", () => {
        if (!isPanelOpen) {
            // GSAP is a popular animation library. Here we animate the panel sliding up and becoming visible.
            gsap.to(panel, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" });
            isPanelOpen = true;
            sessionStorage.setItem('resq_ai_isOpen', 'true'); // Save state
        } else {
            // Animate panel closing
            gsap.to(panel, { autoAlpha: 0, y: 20, duration: 0.3, ease: "power2.in" });
            isPanelOpen = false;
            sessionStorage.setItem('resq_ai_isOpen', 'false'); // Save state
        }
    });

    // Close button inside the panel logic
    closeBtn.addEventListener("click", () => {
        gsap.to(panel, { autoAlpha: 0, y: 20, duration: 0.3, ease: "power2.in" });
        isPanelOpen = false;
        sessionStorage.setItem('resq_ai_isOpen', 'false');
    });

    // Feature: Core AI Chat Logic
    // Handles what happens when a message is sent
    async function handleChat() {
        const userText = inputField.value.trim();
        if (!userText) return; // Prevent empty messages

        // 1. Add User Message Bubble to the chat
        appendMessage(userText, 'user');
        inputField.value = ""; // Clear input field

        // 2. UI Loading State (Activates border lighting effect & cycling text)
        panel.classList.add("loading");
        chatArea.appendChild(typingIndicator); // Move indicator to bottom
        chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll to bottom

        thinkingIndex = 0;
        typingIndicator.innerText = thinkingTexts[thinkingIndex];
        
        // Cycle the loading text every 800ms
        thinkingInterval = setInterval(() => {
            thinkingIndex = (thinkingIndex + 1) % thinkingTexts.length;
            typingIndicator.innerText = thinkingTexts[thinkingIndex];
        }, 800);

        // Feature: AI Personality Definition
        // System prompt instructs the Puter.js AI on how to behave
        const SYSTEM_PROMPT = `
You are an emergency assistant.

Rules:
- Give short answers only
- Maximum 5 bullet points
- No explanation
- No extra text
- No greetings

Only give immediate action steps.
`;

        try {
            // 3. Make AI API Call
            if (typeof puter === 'undefined') {
                throw new Error("Puter AI is not loaded.");
            }

            // Send request to Puter AI using the system prompt and the user's message
            const response = await puter.ai.chat(SYSTEM_PROMPT + "\nSituation: " + userText);

            let aiText = "";
            if (typeof response === "string") {
                aiText = response;
            } else if (response?.message) {
                aiText = response.message;
            } else if (response?.text) {
                aiText = response.text;
            } else if (Array.isArray(response) && response[0]?.generated_text) {
                aiText = response[0].generated_text;
            } else {
                aiText = JSON.stringify(response); // fallback
            }
            
            // 4. Success handling: Stop loading and append the AI's response
            stopLoading();
            appendMessage(aiText, 'ai');
        } catch (err) {
            // Error handling: Stop loading and show error message
            stopLoading();
            appendMessage("Error: " + err.message, 'ai', false); // don't save errors to history
        }
    }

    // Helper function to turn off the loading animation state
    function stopLoading() {
        panel.classList.remove("loading");
        clearInterval(thinkingInterval);
    }

    // Helper function to physically create a message bubble on the screen and save it to history
    function appendMessage(text, sender, save = true) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${sender}`;
        
        // Convert plain text newlines (\n) to HTML line breaks (<br>) so formatting is preserved
        const safeText = String(text || "");
        bubble.innerHTML = safeText.replace(/\n/g, '<br>');
        
        // Insert message right above the typing indicator
        chatArea.insertBefore(bubble, typingIndicator);
        chatArea.scrollTop = chatArea.scrollHeight;

        // If the save flag is true, add to chatHistory and update sessionStorage
        if (save) {
            chatHistory.push({ text, sender });
            sessionStorage.setItem('resq_ai_history', JSON.stringify(chatHistory));
        }
    }

    // Feature: Event Listeners for sending messages
    // Send message on Send Button click
    sendBtn.addEventListener("click", handleChat);
    
    // Send message on Enter key press
    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleChat();
    });
}

// Feature: Intelligent Initialization
// Checks if the document is still loading. If it is, wait until DOMContentLoaded.
// If it has already loaded (e.g. script placed at the bottom), run initialization immediately.
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initAiAssistant);
} else {
    initAiAssistant();
}
