import { config } from '../config';

export class WhatsAppService {
    private static baseUrl = `https://graph.facebook.com/${config.whatsapp.apiVersion}`;

    static async sendMessage(to: string, text: string) {
        const url = `${this.baseUrl}/${config.whatsapp.phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.whatsapp.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'text',
                text: { body: text },
            }),
        });

        return this.handleResponse(response, 'sendMessage');
    }

    static async sendTemplate(to: string, templateName: string, languageCode: string = 'en_US') {
        const url = `${this.baseUrl}/${config.whatsapp.phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.whatsapp.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                },
            }),
        });

        return this.handleResponse(response, 'sendTemplate');
    }

    /**
     * Mark a message as read. 
     * This is important to stop the 'sent/delivered' status on the sender's phone.
     */
    static async markAsRead(messageId: string) {
        const url = `${this.baseUrl}/${config.whatsapp.phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.whatsapp.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            }),
        });

        return this.handleResponse(response, 'markAsRead');
    }

    static async sendImage(to: string, imageUrl: string, caption?: string) {
        const url = `${this.baseUrl}/${config.whatsapp.phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.whatsapp.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'image',
                image: {
                    link: imageUrl,
                    caption: caption
                },
            }),
        });

        return this.handleResponse(response, 'sendImage');
    }

    private static async handleResponse(response: Response, action: string) {
        if (!response.ok) {
            const error = await response.json();
            console.error(`❌ Failed to ${action}:`, error);
            throw new Error(`WhatsApp API Error (${action}): ${JSON.stringify(error)}`);
        }
        return await response.json();
    }
}
