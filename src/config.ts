export const config = {
    whatsapp: {
        verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'my_secure_token',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
    },
    port: parseInt(process.env.PORT || '7000'),
};
