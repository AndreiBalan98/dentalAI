const axios = require('axios');
const systemPrompt = require('../config/systemPrompt');

class AIService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.model = 'microsoft/mai-ds-r1:free';
    }
    
    async getResponse(conversation) {
        try {
            const messages = [
                { role: 'system', content: systemPrompt.getSystemPrompt() },
                ...conversation.messages
            ];
            
            // Dacă nu există mesaje anterioare, AI-ul va genera mesajul de bun venit
            if (conversation.messages.length === 0) {
                messages.push({ 
                    role: 'user', 
                    content: 'START_CONVERSATIE' 
                });
            }
            
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: this.model,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
                    'X-Title': 'DentalAI - Clinica Dinti de Fier'
                }
            });
            
            return response.data.choices[0].message.content;
            
        } catch (error) {
            console.error('❌ Eroare AI:', error.response?.data || error.message);
            throw error;
        }
    }
    
    isConversationEnding(message) {
        const endingPhrases = [
            'la revedere',
            'o zi bună',
            'o zi frumoasă',
            'toate cele bune',
            'cu drag',
            'vă mulțumesc pentru apel',
            'vă așteptăm la clinică',
            'ne vedem la programare'
        ];
        
        const lowerMessage = message.toLowerCase();
        return endingPhrases.some(phrase => lowerMessage.includes(phrase));
    }
    
    extractAppointmentDetails(conversation) {
        const messages = conversation.messages.map(m => m.content).join('\n');
        
        // Caută pattern-uri pentru programare
        const datePattern = /(\d{1,2})\s*(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)/i;
        const timePattern = /ora\s*(\d{1,2}):?(\d{2})?/i;
        const servicePattern = /(consultație|detartraj|plombă|extracție|control)/i;
        
        const dateMatch = messages.match(datePattern);
        const timeMatch = messages.match(timePattern);
        const serviceMatch = messages.match(servicePattern);
        
        if (dateMatch || timeMatch) {
            return {
                date: dateMatch ? `${dateMatch[1]} ${dateMatch[2]}` : null,
                time: timeMatch ? `${timeMatch[1]}:${timeMatch[2] || '00'}` : null,
                service: serviceMatch ? serviceMatch[1] : 'Consultație generală',
                confirmed: messages.toLowerCase().includes('confirmat') || 
                          messages.toLowerCase().includes('v-am programat')
            };
        }
        
        return null;
    }
}

module.exports = new AIService();