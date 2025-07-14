const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server-ul pentru asistent AI funcționează!');
});

app.post('/voice', async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    twiml.say({
        voice: 'Polly.Carmen',
        language: 'ro-RO'
    }, 'Bună ziua! Cu ce vă pot ajuta?');
    
    const gather = twiml.gather({
        input: 'speech',
        language: 'ro-RO',
        timeout: 3,
        action: '/process-speech'
    });
    
    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/process-speech', async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    const speechResult = req.body.SpeechResult;
    console.log('🎤 Persoana a spus:', speechResult);
    
    try {
        console.log('⏳ Cer răspuns de la AI...');
        const aiResponse = await getAIResponse(speechResult);
        console.log('🤖 AI a răspuns:', aiResponse);
        
        if (aiResponse && aiResponse.trim() !== '') {
            twiml.say({
                voice: 'Polly.Carmen',
                language: 'ro-RO'
            }, aiResponse);
        } else {
            console.log('⚠️ Răspuns gol de la AI!');
            twiml.say({
                voice: 'Polly.Carmen',
                language: 'ro-RO'
            }, 'Îmi pare rău, nu am înțeles. Puteți repeta?');
        }
        
    } catch (error) {
        console.error('💥 Eroare în process-speech:', error);
        twiml.say({
            voice: 'Polly.Carmen',
            language: 'ro-RO'
        }, 'Îmi pare rău, am întâmpinat o problemă.');
    }
    
    twiml.say({
        voice: 'Polly.Carmen',
        language: 'ro-RO'
    }, 'Vă mulțumesc pentru apel. La revedere!');
    
    console.log('📞 TwiML generat:', twiml.toString());
    
    res.type('text/xml');
    res.send(twiml.toString());
});

async function getAIResponse(userMessage) {
    console.log('📤 Trimit către OpenRouter:', userMessage);
    
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'microsoft/mai-ds-r1:free',
            messages: [
                {
                    role: 'system',
                    content: 'Ești un asistent AI prietenos pentru o clinică dentară. Răspunde scurt și la obiect în limba română.'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': '',
                'X-Title': 'dentalAI'
            }
        });
        
        console.log('✅ Răspuns complet de la OpenRouter:', JSON.stringify(response.data, null, 2));
        const aiMessage = response.data.choices[0].message.content;
        console.log('💬 Mesaj AI extras:', aiMessage);
        
        return aiMessage;
        
    } catch (error) {
        console.error('❌ Eroare OpenRouter:', error.response?.data || error.message);
        return 'Îmi pare rău, nu pot procesa cererea momentan.';
    }
}

app.listen(PORT, () => {
    console.log(`Serverul ascultă pe portul ${PORT}`);
});