const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
            payment_method: 'pm_card_visa',
            capture_method: "manual",
        });
        res.send({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.capturePayment = async (req, res) => {
    const { paymentIntentId } = req.body;
    try {
        // Confirm the PaymentIntent
        let paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: 'pm_card_visa',
            return_url: 'http://localhost:3001'
        });

        // Check if the status is now "requires_capture"
        if (paymentIntent.status === 'requires_capture') {
            // Capture the PaymentIntent
            paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
            res.send({ success: true, paymentIntent });
        } else {
            res.status(400).send({ error: `Cannot capture PaymentIntent with status ${paymentIntent.status}` });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


exports.refundPayment = async (req, res) => {
    const { paymentIntentId, amount } = req.body;
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount,
        });
        res.send({ success: true, refund });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.createPayout = async (req, res) => {
    const { amount, currency, freelancerBankAccountId } = req.body;
    try {
        const payout = await stripe.transfers.create({
            amount,
            currency,
            destination: freelancerBankAccountId,
        });
        res.send({ success: true, payout });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};