const cron = require('node-cron');
const { unlockWithdrawableEarnings } = require('../Controller/sellerEarningsController');

// Run daily at 12:00 AM to unlock earnings after 15 days
const startEarningsCron = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily earnings unlock job...');
        try {
            await unlockWithdrawableEarnings();
            console.log('Daily earnings unlock job completed successfully');
        } catch (error) {
            console.error('Daily earnings unlock job failed:', error);
        }
    });
    
    console.log('Earnings cron job scheduled to run daily at midnight');
};

module.exports = { startEarningsCron };