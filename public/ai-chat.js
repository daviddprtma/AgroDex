class AIChat {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.rateLimiter = new RateLimiter(5, 60000); // 5 messages per minute
        this.init();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    init() {
        this.createChatWidget();
        this.loadStyles();
        this.bindEvents();
    }

    createChatWidget() {
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'ai-chat-container';
        chatContainer.innerHTML = `
            <button class="ai-chat-toggle" aria-label="Toggle AI Chat">
                <svg class="chat-icon" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                </svg>
                <svg class="close-icon" viewBox="0 0 24 24" width="24" height="24" style="display:none;">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
            <div class="ai-chat-window" style="display:none;">
                <div class="ai-chat-header">
                    <h3>AI Assistant</h3>
                    <span class="ai-chat-status">Online</span>
                </div>
                <div class="ai-chat-messages">
                    <div class="message bot-message">
                        Hello! I'm your AgroDex AI assistant. How can I help you today?
                    </div>
                </div>
                <div class="ai-chat-input-container">
                    <textarea class="ai-chat-input" placeholder="Type your message..." rows="1"></textarea>
                    <button class="ai-chat-send" disabled>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
                <div class="ai-chat-rate-limit" style="display:none;">
                    Rate limit reached. Please wait before sending another message.
                </div>
            </div>
        `;
        document.body.appendChild(chatContainer);
    }

    loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/ai-chat.css';
        document.head.appendChild(link);
    }

    bindEvents() {
        const toggle = document.querySelector('.ai-chat-toggle');
        const sendBtn = document.querySelector('.ai-chat-send');
        const input = document.querySelector('.ai-chat-input');
        const messagesContainer = document.querySelector('.ai-chat-messages');

        toggle.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('input', () => {
            this.adjustTextareaHeight(input);
            sendBtn.disabled = !input.value.trim();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.querySelector('.ai-chat-window');
        const chatIcon = document.querySelector('.chat-icon');
        const closeIcon = document.querySelector('.close-icon');
        
        window.style.display = this.isOpen ? 'flex' : 'none';
        chatIcon.style.display = this.isOpen ? 'none' : 'block';
        closeIcon.style.display = this.isOpen ? 'block' : 'none';
        
        if (this.isOpen) {
            document.querySelector('.ai-chat-input').focus();
        }
    }

    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const input = document.querySelector('.ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Check rate limit
        if (!this.rateLimiter.canSend()) {
            this.showRateLimitWarning();
            return;
        }

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';
        document.querySelector('.ai-chat-send').disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.fetchAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            this.rateLimiter.incrementCount();
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot error');
            console.error('AI Chat error:', error);
        }
    }

    addMessage(text, type) {
        const messagesContainer = document.querySelector('.ai-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.querySelector('.ai-chat-messages');
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        indicator.id = 'typing-indicator';
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showRateLimitWarning() {
        const warning = document.querySelector('.ai-chat-rate-limit');
        warning.style.display = 'block';
        setTimeout(() => {
            warning.style.display = 'none';
        }, 3000);
    }

    async fetchAIResponse(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: this.sessionId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        return data.response;
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
});