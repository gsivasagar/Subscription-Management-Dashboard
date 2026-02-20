const cron = require('node-cron');
const sgMail = require('@sendgrid/mail'); // CHANGED
const Subscription = require('./models/Subscription');
require('dotenv').config();

// 1. Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const startScheduler = () => {
    console.log('⏰ Scheduler Started: Checking for renewals daily at 9:00 AM.');

    cron.schedule('0 9 * * *', async () => {
        console.log('🔍 Checking for upcoming renewals...');
        
        try {
            // Calculate date 3 days from now
            const today = new Date();
            const threeDaysLater = new Date();
            threeDaysLater.setDate(today.getDate() + 3);
            const targetDate = threeDaysLater.toISOString().split('T')[0];

            // 2. Find subscriptions
            const upcomingSubs = await Subscription.findAll({
                where: { nextRenewalDate: targetDate }
            });

            if (upcomingSubs.length > 0) {
                console.log(`Found ${upcomingSubs.length} renewals.`);

                // 3. Loop through and email each user
                for (const sub of upcomingSubs) {
                    
                    const msg = {
                        to: sub.userEmail, // The user's email from the DB
                        from: process.env.SENDGRID_FROM_EMAIL, // Must be your Verified Sender
                        subject: `Your ${sub.serviceName} subscription renews soon!`,
                        text: `Hi there! Your subscription for ${sub.serviceName} ($${sub.cost}) is renewing on ${targetDate}. Log in to manage it.`,
                        html: `
                          <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="color: #4F46E5;">Subscription Renewal Alert</h2>
                            <p>Just a heads up that your <strong>${sub.serviceName}</strong> subscription is renewing soon.</p>
                            <ul>
                                <li><strong>Cost:</strong> $${sub.cost}</li>
                                <li><strong>Date:</strong> ${targetDate}</li>
                            </ul>
                            <a href="http://localhost:5173" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Subscriptions</a>
                          </div>
                        `,
                    };

                    try {
                        await sgMail.send(msg);
                        console.log(`✅ Email sent to ${sub.userEmail} for ${sub.serviceName}`);
                    } catch (error) {
                        console.error(`❌ Failed to email ${sub.userEmail}:`, error.response ? error.response.body : error);
                    }
                }
            } else {
                console.log('No renewals found for 3 days from now.');
            }

        } catch (error) {
            console.error('❌ Scheduler Error:', error);
        }
    });
};

module.exports = startScheduler;