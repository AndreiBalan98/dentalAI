const axios = require('axios');
require('dotenv').config();

// Funcția de test
async function testOpenRouter() {
    console.log('Testăm conexiunea cu OpenRouter...');
    
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
                    content: 'Aș vrea să fac o programare pentru control'
                }
            ],
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://clinica-dentara.com',
                'X-Title': 'Asistent Clinica Dentara'
            }
        });
        
        console.log('✅ Succes! Răspuns de la AI:');
        console.log(response.data.choices[0].message.content);
        console.log('\n📊 Detalii despre request:');
        console.log('Model folosit:', response.data.model);
        console.log('Tokeni folosiți:', response.data.usage);
        
    } catch (error) {
        console.error('❌ Eroare:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

// Rulăm testul
testOpenRouter();