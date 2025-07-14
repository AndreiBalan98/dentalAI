const logger = require('./logger');

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
        logger.info(`CONV_START | ${type.toUpperCase()} | ID: ${id} | Phone: ${phoneNumber}`);
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
            logger.info(`CONV_END | ID: ${id} | Duration: ${Math.round((new Date() - conversation.startTime) / 1000)}s`);
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

    logMessage(conversationId, sender, message) {
        const conversation = this.conversations.get(conversationId);
        if (conversation) {
            logger.info(`${sender} | ID: ${conversationId} | "${message}"`);
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