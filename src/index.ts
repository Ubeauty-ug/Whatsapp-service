import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { config } from './config';
import { WhatsAppService } from './services/whatsapp';

// --- Webhook Types ---
interface WhatsAppWebhookBody {
    object: string;
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts?: Array<{
                    profile: { name: string };
                    wa_id: string;
                }>;
                messages?: Array<{
                    from: string;
                    id: string;
                    timestamp: string;
                    text?: { body: string };
                    type: string;
                    context?: {
                        from: string;
                        id: string;
                        group_id?: string;
                    };
                }>;
                statuses?: Array<{
                    id: string;
                    status: string;
                    timestamp: string;
                    recipient_id: string;
                }>;
            };
            field: string;
        }>;
    }>;
}

const app = new Elysia()
    .use(swagger({
        documentation: {
            info: {
                title: 'Ubeauty WhatsApp Service API',
                version: '1.0.0',
                description: 'Professional WhatsApp Business API integration service.'
            },
            tags: [
                { name: 'Webhook', description: 'Meta Webhook Handshake and Events' },
                { name: 'Messaging', description: 'Send messages and templates' },
                { name: 'Health', description: 'Service status' }
            ]
        }
    }))
    .use(cors())

    // Root status check
    .get('/', () => ({
        status: 'online',
        service: 'Ubeauty WhatsApp Service',
        timestamp: new Date().toISOString()
    }), { detail: { tags: ['Health'] } })

    // WhatsApp Webhook Handshake & Events
    .group('/webhook', (group) => group
        // Handshake (GET)
        .get('', ({ query, set }) => {
            const mode = query['hub.mode'];
            const token = query['hub.verify_token'];
            const challenge = query['hub.challenge'];

            if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
                console.log("✅ Webhook verified successfully!");
                return challenge;
            }

            console.error("❌ Webhook verification failed: Invalid token");
            set.status = 403;
            return 'Forbidden';
        }, {
            query: t.Object({
                'hub.mode': t.Optional(t.String()),
                'hub.verify_token': t.Optional(t.String()),
                'hub.challenge': t.Optional(t.String())
            }),
            detail: { tags: ['Webhook'], summary: 'Verify Webhook Handshake' }
        })

        // Event Receiver (POST)
        .post('', async ({ body, set }) => {
            const payload = body as WhatsAppWebhookBody;

            // Check if it's a whatsapp_business_account event
            if (payload.object !== 'whatsapp_business_account') {
                return "Not a WhatsApp event";
            }

            try {
                const changes = payload.entry?.[0]?.changes?.[0]?.value;

                // 1. Handle Status Updates (Sent, Delivered, Read)
                if (changes?.statuses?.[0]) {
                    const status = changes.statuses[0];
                    console.log(`📊 Message ${status.id} status update: ${status.status} for ${status.recipient_id}`);
                }

                // 2. Handle Incoming Messages
                const message = changes?.messages?.[0];
                if (message) {
                    const from = message.from;
                    const contactName = changes.contacts?.[0]?.profile.name || 'Unknown';
                    const text = message.text?.body || '';
                    const isGroup = message.context?.group_id ? `GROUP (${message.context.group_id})` : "INDIVIDUAL";

                    console.log(`📩 [${isGroup}] New message from ${contactName} (${from}): ${text}`);

                    // Mark message as read
                    await WhatsAppService.markAsRead(message.id);

                    // --- PLUG YOUR LOGIC HERE ---
                    // e.g., Send to your main server, save to DB, or trigger auto-reply
                }

                return "OK";
            } catch (error) {
                console.error("❌ Error processing webhook:", error);
                set.status = 200; // Always return 200 to Meta to avoid retries
                return "Error handled";
            }
        }, { detail: { tags: ['Webhook'], summary: 'Receive WhatsApp Events' } })
    )

    // Messaging Endpoints
    .group('/api', (group) => group
        .post('/send-message', async ({ body, set }) => {
            try {
                const result = await WhatsAppService.sendMessage(body.to, body.text);
                return result;
            } catch (error: any) {
                set.status = 500;
                return { error: error.message };
            }
        }, {
            body: t.Object({
                to: t.String({ description: 'Phone number with country code (e.g., 254...)' }),
                text: t.String({ description: 'Message content' })
            }),
            detail: { tags: ['Messaging'], summary: 'Send direct text message' }
        })

        .post('/send-template', async ({ body, set }) => {
            try {
                const result = await WhatsAppService.sendTemplate(body.to, body.templateName, body.languageCode);
                return result;
            } catch (error: any) {
                set.status = 500;
                return { error: error.message };
            }
        }, {
            body: t.Object({
                to: t.String({ description: 'Phone number with country code' }),
                templateName: t.String({ description: 'Approved template name' }),
                languageCode: t.Optional(t.String({ default: 'en_US' }))
            }),
            detail: { tags: ['Messaging'], summary: 'Send template message' }
        })
    )

    .listen(config.port);

console.log(`
🚀 Ubeauty WhatsApp Service is running!
📡 Webhook URL: http://localhost:${config.port}/webhook
📖 API Docs: http://localhost:${config.port}/swagger
`);
