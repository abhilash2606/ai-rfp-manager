// server/services/emailService.js
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const mongoose = require('mongoose');
const config = require('../config');
const RFP = require('../models/RFP');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport(smtpTransport({
    service: config.email.service,
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
}));

/**
 * Send an email
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: `"RFP Manager" <${config.email.from}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

/**
 * Send RFP to vendor
 */
const sendRFPEmail = async ({ vendorEmail, vendorName, rfpTitle, rfpId, message }) => {
    const subject = `New RFP: ${rfpTitle} [RFP:${rfpId}]`;
    const text = `Dear ${vendorName},\n\n` +
        `You have been invited to submit a proposal for the following RFP:\n\n` +
        `Title: ${rfpTitle}\n` +
        `Message: ${message}\n\n` +
        `Please submit your proposal by following this link: ${config.appUrl}/rfp/${rfpId}/submit\n\n` +
        `Best regards,\n` +
        `The RFP Manager Team`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Dear ${vendorName},</p>
            <p>You have been invited to submit a proposal for the following RFP:</p>
            <h2>${rfpTitle}</h2>
            <p>${message}</p>
            <p>Please submit your proposal by clicking the button below:</p>
            <div style="margin: 25px 0;">
                <a href="${config.appUrl}/rfp/${rfpId}/submit" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                          text-align: center; text-decoration: none; display: inline-block; 
                          border-radius: 4px; font-weight: bold;">
                    Submit Proposal
                </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p>${config.appUrl}/rfp/${rfpId}/submit</p>
            <p>Best regards,<br>The RFP Manager Team</p>
        </div>
    `;

    return sendEmail({
        to: vendorEmail,
        subject,
        text,
        html
    });
};

/**
 * Set up IMAP email receiver
 */
const setupEmailReceiver = (onNewEmail) => {
    const imap = new Imap({
        user: config.email.user,
        password: config.email.password,
        host: config.email.imapHost || 'imap.gmail.com',
        port: config.email.imapPort || 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000
    });

    imap.once('ready', () => {
        console.log('IMAP connection established');
        imap.openBox('INBOX', false, (err, box) => {
            if (err) {
                console.error('Error opening inbox:', err);
                return;
            }
            console.log('Connected to INBOX');
            
            // Listen for new emails arriving in real-time
            imap.on('mail', () => {
                console.log('New email received event detected.');
                fetchUnreadEmails(imap, onNewEmail);
            });

            // Initial fetch of unread emails
            // We pass 'true' to indicate this is the initial startup fetch
            fetchUnreadEmails(imap, onNewEmail, true);
        });
    });

    imap.on('error', (err) => {
        console.error('IMAP error:', err);
    });

    imap.on('end', () => {
        console.log('IMAP connection ended');
        setTimeout(() => {
            try {
                imap.connect();
            } catch (e) {
                console.log("Reconnection failed", e);
            }
        }, 5000);
    });

    imap.connect();
    return imap;
};

/**
 * Fetch unread emails from IMAP
 * Updated to only fetch emails from TODAY to avoid backlog spam
 */
const fetchUnreadEmails = (imap, onNewEmail, isInitialLoad = false) => {
    
    // Create a date object for "Today at 00:00:00"
    const sinceDate = new Date();
    sinceDate.setHours(0, 0, 0, 0);

    const searchCriteria = [
        'UNSEEN',
        ['SINCE', sinceDate] // Only look for emails received SINCE today
    ];

    imap.search(searchCriteria, (err, results) => {
        if (err) {
            console.error('Error searching for emails:', err);
            return;
        }

        if (!results || results.length === 0) {
            if (isInitialLoad) console.log("No new unread emails from today.");
            return;
        }

        console.log(`Found ${results.length} unread emails from today.`);

        const fetch = imap.fetch(results, { bodies: '' });
        
        fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
                simpleParser(stream, async (err, mail) => {
                    if (err) {
                        console.error('Error parsing email:', err);
                        return;
                    }

                    try {
                        const processedEmail = {
                            from: mail.from?.value[0]?.address || 'unknown',
                            to: mail.to?.value?.map(addr => addr.address) || [],
                            subject: mail.subject || '', 
                            text: mail.text || '',       
                            html: mail.html || '',
                            date: mail.date,
                            messageId: mail.messageId
                        };

                        if (onNewEmail) {
                            await onNewEmail(processedEmail);
                        }

                        // Mark as read
                        const uid = msg.attributes?.uid || msg.seqno;
                        if (uid) {
                            imap.addFlags(uid, ['\\Seen'], (err) => {
                                if (err) console.error('Error marking email as read:', err);
                            });
                        }
                    } catch (error) {
                        console.error('Error processing email:', error);
                    }
                });
            });
        });
    });
};

/**
 * Process incoming RFP response email
 */
const processRFPResponse = async (email) => {
    try {
        const subject = email.subject || '';
        const text = email.text || '';

        // Extract RFP ID (looks for 24-char MongoDB ID)
        const rfpIdMatch = subject.match(/RFP[:\s]+([a-f0-9]{24})/i) || 
                          text.match(/RFP[:\s]+([a-f0-9]{24})/i);
        
        if (!rfpIdMatch) {
            return null; // Quietly ignore non-RFP emails
        }

        const rfpId = rfpIdMatch[1];
        
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(rfpId)) {
            return null;
        }

        // Find the RFP
        const rfp = await RFP.findById(rfpId);
        if (!rfp) {
            console.log(`RFP ${rfpId} not found in database`);
            return null;
        }

        const response = {
            vendorEmail: email.from,
            responseDate: new Date(),
            content: text,
            attachments: email.attachments || []
        };

        rfp.responses = rfp.responses || [];
        rfp.responses.push(response);
        
        if (rfp.status === 'sent') {
            rfp.status = 'in_review';
        }

        await rfp.save();
        console.log(`✅ Success! Response added to RFP ${rfpId}`);
        return rfp;
    } catch (error) {
        console.error('Error processing RFP response:', error);
        return null;
    }
};

module.exports = {
    sendEmail,
    sendRFPEmail,
    setupEmailReceiver,
    processRFPResponse
};