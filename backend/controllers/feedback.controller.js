import { sendFeedbackEmail } from '../services/email.service.js';

export const submitFeedback = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Please log in to send feedback' });
        }

        const { message } = req.body;

        // Validate message
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: 'Feedback message cannot be empty' });
        }

        if (message.length > 2000) {
            return res.status(400).json({ message: 'Feedback message is too long (max 2000 characters)' });
        }

        // Get user details
        const userName = req.user.name || 'Anonymous User';
        const userEmail = req.user.email || 'no-email@example.com';

        // Send feedback email to admin
        await sendFeedbackEmail(userName, userEmail, message.trim());

        res.status(200).json({ message: 'Thank you for your feedback!' });
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ message: 'Failed to send feedback. Please try again later.' });
    }
};
