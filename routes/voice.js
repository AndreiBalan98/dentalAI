const logger = require('../services/logger');
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const conversationManager = require('../services/conversationManager');
const aiService = require('../services/aiService');
const smsService = require('../services/smsService');

// Rută pentru apeluri noi și continuarea conversației
router.post('/', async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const callSid = req.body.CallSid;
    const speechResult = req.body.SpeechResult;
    
    try {
        let conversation = conversationManager.getConversation(callSid);
        
        if (!conversation) {
            // Conversație nouă
            conversation = conversationManager.createConversation(callSid, 'voice', req.body.From);
            const welcomeMessage = await aiService.getResponse(conversation);
            
            conversation.messages.push({
                role: 'assistant',
                content: welcomeMessage
            });

            conversationManager.logMessage(callSid, 'AI_VOICE', aiResponse);
            
            twiml.say({
                voice: 'Polly.Carmen',
                language: 'ro-RO'
            }, welcomeMessage);
        } else if (speechResult) {
            // Continuarea conversației
            conversation.messages.push({
                role: 'user',
                content: speechResult
            });

            conversationManager.logMessage(callSid, 'USER_VOICE', speechResult);
            
            const aiResponse = await aiService.getResponse(conversation);
            
            conversation.messages.push({
                role: 'assistant',
                content: aiResponse
            });

            conversationManager.logMessage(callSid, 'AI_VOICE', aiResponse);
            
            twiml.say({
                voice: 'Polly.Carmen',
                language: 'ro-RO'
            }, aiResponse);
            
            // Verifică dacă conversația s-a încheiat
            if (aiService.isConversationEnding(aiResponse)) {
                // Trimite SMS cu detaliile programării dacă există
                const appointmentDetails = aiService.extractAppointmentDetails(conversation);
                if (appointmentDetails) {
                    await smsService.sendAppointmentConfirmation(req.body.From, appointmentDetails);
                }
                
                conversationManager.endConversation(callSid);
                twiml.hangup();
            }
        }
        
        // Dacă conversația continuă, ascultă următoarea replică
        if (!aiService.isConversationEnding(conversation.messages[conversation.messages.length - 1].content)) {
            twiml.gather({
                input: 'speech',
                language: 'ro-RO',
                timeout: 2,
                speechTimeout: 'auto',
                action: '/voice'
            });
        }
        
    } catch (error) {
        console.error('❌ Eroare în /voice:', error);
        twiml.say({
            voice: 'Polly.Carmen',
            language: 'ro-RO'
        }, 'Îmi pare rău, am întâmpinat o problemă tehnică. Vă rog să ne sunați din nou.');
        twiml.hangup();
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;