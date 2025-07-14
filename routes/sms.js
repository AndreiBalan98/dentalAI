const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const conversationManager = require('../services/conversationManager');
const aiService = require('../services/aiService');
const smsService = require('../services/smsService');

router.post('/', async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const messageSid = req.body.MessageSid;
    const from = req.body.From;
    const body = req.body.Body;
    
    try {
        let conversation = conversationManager.getConversationByPhone(from, 'sms');
        
        if (!conversation) {
            // Conversație nouă
            conversation = conversationManager.createConversation(messageSid, 'sms', from);
        }
        
        // Adaugă mesajul utilizatorului
        conversation.messages.push({
            role: 'user',
            content: body
        });
        
        // Obține răspunsul AI
        const aiResponse = await aiService.getResponse(conversation);
        
        conversation.messages.push({
            role: 'assistant',
            content: aiResponse
        });
        
        // Trimite răspunsul
        twiml.message(aiResponse);
        
        // Verifică dacă s-a făcut o programare
        if (aiService.isConversationEnding(aiResponse)) {
            const appointmentDetails = aiService.extractAppointmentDetails(conversation);
            if (appointmentDetails) {
                // Trimite mesaj de confirmare separat
                setTimeout(async () => {
                    await smsService.sendAppointmentConfirmation(from, appointmentDetails);
                }, 2000);
            }
            
            conversationManager.endConversation(messageSid);
        }
        
    } catch (error) {
        console.error('❌ Eroare în /sms:', error);
        twiml.message('Îmi pare rău, am întâmpinat o problemă. Vă rog să încercați din nou.');
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;