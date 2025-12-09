const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF buffer
 */
const extractTextFromPdf = async (pdfBuffer) => {
    try {
        const data = await pdf(pdfBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

/**
 * Extract text from DOCX buffer
 */
const extractTextFromDocx = async (docxBuffer) => {
    try {
        const result = await mammoth.extractRawText({ buffer: docxBuffer });
        return result.value;
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Failed to extract text from Word document');
    }
};

/**
 * Extract text from various document formats
 */
const extractText = async (fileBuffer, mimeType) => {
    switch (mimeType) {
        case 'application/pdf':
            return await extractTextFromPdf(fileBuffer);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return await extractTextFromDocx(fileBuffer);
        case 'text/plain':
            return fileBuffer.toString('utf-8');
        default:
            throw new Error(`Unsupported file type: ${mimeType}`);
    }
};

module.exports = {
    extractTextFromPdf,
    extractTextFromDocx,
    extractText
};
