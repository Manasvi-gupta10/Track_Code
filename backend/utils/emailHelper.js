const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (toEmail, userName) => {
    const mailOptions = {
        from: `"TrackCode" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Welcome to TrackCode! 🚀',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(to right, #d946ef, #06b6d4); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to TrackCode!</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>Hello ${userName || 'Coder'},</h2>
                    <p>We're thrilled to have you join our community of passionate developers!</p>
                    <p>With TrackCode, you can now:</p>
                    <ul>
                        <li>Track your progress across multiple coding platforms.</li>
                        <li>Analyze your strengths and weaknesses.</li>
                        <li>Maintain a consistent coding streak.</li>
                        <li>Share your developer-ready profile with recruiters.</li>
                    </ul>
                    <p>Ready to start your journey? Log in to your dashboard and connect your platforms!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://code-tracker-project-finl.onrender.com" style="background: #06b6d4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                    <p>If you have any questions, feel free to reply to this email.</p>
                    <p>Happy Coding!<br>The TrackCode Team</p>
                </div>
                <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                    &copy; 2026 TrackCode. All rights reserved.
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendWelcomeEmail };
