const twilio = require('twilio');

class SMSService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    }
    
    async sendAppointmentConfirmation(to, appointmentDetails) {
        if (!appointmentDetails || !appointmentDetails.confirmed) {
            return;
        }
        
        try {
            const message = this.formatAppointmentMessage(appointmentDetails);
            
            await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: to
            });
            
            console.log(`📱 SMS confirmare trimis către ${to}`);
            
        } catch (error) {
            console.error('❌ Eroare trimitere SMS:', error);
        }
    }
    
    formatAppointmentMessage(details) {
        let message = `🦷 Confirmare programare - Clinica Dinți de Fier\n\n`;
        
        if (details.date) {
            message += `📅 Data: ${details.date}\n`;
        }
        
        if (details.time) {
            message += `🕐 Ora: ${details.time}\n`;
        }
        
        message += `📋 Serviciu: ${details.service}\n\n`;
        message += `📍 Adresa: Str. Păcurari nr. 45, Iași\n`;
        message += `☎️ Pentru anulare/reprogramare: sunați la acest număr\n\n`;
        message += `Vă așteptăm! 😊`;
        
        return message;
    }
}

module.exports = new SMSService();