const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    let report = 'API CONNECTION TEST REPORT\n==========================\n\n';

    // Stripe
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const balance = await stripe.balance.retrieve();
        report += `[STRIPE]: SUCCESS (Object: ${balance.object})\n`;
    } catch (e) {
        report += `[STRIPE]: FAILED (${e.message})\n`;
    }

    // Supabase
    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { data, error } = await supabase.from('plans').select('*');
        if (error) throw error;
        report += `[SUPABASE]: SUCCESS (Plans Count: ${data.length})\n`;
    } catch (e) {
        report += `[SUPABASE]: FAILED (${e.message})\n`;
    }

    // Gemini
    if (process.env.GEMINI_API_KEY) {
        report += `[GEMINI]: API KEY PRESENT\n`;
    } else {
        report += `[GEMINI]: API KEY MISSING\n`;
    }

    fs.writeFileSync('api-test-result.txt', report);
    console.log('Test report saved to api-test-result.txt');
}

run();
