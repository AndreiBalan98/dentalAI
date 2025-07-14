class ConversationManager {
    constructor() {
        this.conversations = new Map();
    }
    
    createConversation(id, type, phoneNumber) {
        const conversation = {
            id,
            type,
            phoneNumber,
            messages: [],
            startTime: new Date(),
            appointmentData: null
        };
        
        this.conversations.set(id, conversation);
        console.log(`📞 Conversație nouă creată: ${id} (${type})`);
        return conversation;
    }
    
    getConversation(id) {
        return this.conversations.get(id);
    }
    
    getConversationByPhone(phoneNumber, type) {
        for (const [_, conversation] of this.conversations) {
            if (conversation.phoneNumber === phoneNumber && conversation.type === type) {
                return conversation;
            }
        }
        return null;
    }
    
    updateConversation(id, updates) {
        const conversation = this.conversations.get(id);
        if (conversation) {
            Object.assign(conversation, updates);
        }
        return conversation;
    }
    
    endConversation(id) {
        const conversation = this.conversations.get(id);
        if (conversation) {
            console.log(`🔚 Conversație încheiată: ${id}`);
            console.log(`📝 Istoric conversație:`, conversation.messages);
            this.conversations.delete(id);
        }
    }
    
    // Curăță conversațiile vechi (mai mult de 30 minute)
    cleanupOldConversations() {
        const now = new Date();
        const maxAge = 30 * 60 * 1000; // 30 minute
        
        for (const [id, conversation] of this.conversations) {
            if (now - conversation.startTime > maxAge) {
                this.endConversation(id);
            }
        }
    }
}

// Singleton
const conversationManager = new ConversationManager();

// Curăță conversațiile vechi la fiecare 10 minute
setInterval(() => {
    conversationManager.cleanupOldConversations();
}, 10 * 60 * 1000);

module.exports = conversationManager;