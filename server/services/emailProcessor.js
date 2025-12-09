const emailService = require('./emailService');
const logger = require('../utils/logger');

class EmailProcessor {
    constructor() {
        this.imapConnection = null;
        this.isProcessing = false;
    }

    /**
     * Start the email processor
     */
    start() {
        if (this.imapConnection) {
            console.log('Email processor is already running');
            return;
        }

        console.log('Starting email processor...');
        
        // Set up the IMAP connection
        this.imapConnection = emailService.setupEmailReceiver(this.handleNewEmail.bind(this));
        
        // Handle process termination
        process.on('SIGINT', this.cleanup.bind(this));
        process.on('SIGTERM', this.cleanup.bind(this));
    }

    /**
     * Handle a new email
     * @param {Object} email - The email object
     */
    async handleNewEmail(email) {
        if (this.isProcessing) {
            console.log('Already processing an email, skipping...');
            return;
        }

        this.isProcessing = true;
        
        try {
            console.log(`Processing email from ${email.from} with subject: ${email.subject}`);
            
            // Try to process as RFP response
            const rfp = await emailService.processRFPResponse(email);
            
            if (rfp) {
                console.log(`Successfully processed RFP response for RFP ${rfp._id}`);
                // TODO: Add any additional processing or notifications here
            } else {
                console.log('Email was not an RFP response or no action needed');
            }
        } catch (error) {
            console.error('Error processing email:', error);
            // TODO: Add error handling and retry logic
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        console.log('Cleaning up email processor...');
        
        if (this.imapConnection) {
            this.imapConnection.end();
            this.imapConnection = null;
        }
        
        process.exit(0);
    }
}

// Create and export a singleton instance
const emailProcessor = new EmailProcessor();
module.exports = emailProcessor;
