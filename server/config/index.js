require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/rfp-manager',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    email: {
        // SMTP settings for sending emails
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'rfp-manager@example.com',
        
        // IMAP settings for receiving emails
        imapHost: process.env.EMAIL_IMAP_HOST || 'imap.gmail.com',
        imapPort: process.env.EMAIL_IMAP_PORT || 993,
        imapSecure: process.env.EMAIL_IMAP_SECURE !== 'false',
        
        // Email processing settings
        processInterval: parseInt(process.env.EMAIL_PROCESS_INTERVAL) || 300000, // 5 minutes
        maxEmailsPerCheck: parseInt(process.env.EMAIL_MAX_PER_CHECK) || 50
    },
    appUrl: process.env.APP_URL || 'http://localhost:3001',
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }
};
