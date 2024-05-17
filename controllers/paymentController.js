const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Project = require("../models/project");

exports.createPaymentIntent = async (req, res) => {
  const { amount, projectId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: "pm_card_visa",
      capture_method: "manual",
    });

    const currentProject = await Project.findOne({ _id: projectId });

    if (currentProject) {
      currentProject.paymentIntentId = paymentIntent.id;
      currentProject.amount = paymentIntent.amount;
      currentProject.currency = paymentIntent.currency;
      currentProject.status = paymentIntent.status;

      await currentProject.save();
    }

    res.send({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.transferFunds = async (req, res) => {
  const { projectId } = req.body;

  const currentProject = await Project.findOne({ _id: projectId }).populate({
    path: "selectedTeam", // Populate the 'selectedTeam' from the Project model
    populate: {
      path: "owner", // Further populate the 'owner' from the Team model
      select: "email", // We only want to retrieve the 'email' field of the owner
    },
  });

  const email = currentProject.selectedTeam.owner.email;

  try {
    // Attempt to create or retrieve the Stripe connected account
    let account = await stripe.accounts.create({
      type: "express",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Perform the transfer to the connected account
    const transfer = await stripe.transfers.create({
      amount: currentProject.amount,
      currency: currentProject.currency,
      destination: account.id,
    });

    res.status(201).json({
      success: true,
      message: "Funds transferred successfully",
      transferId: transfer.id,
    });
  } catch (error) {
    console.error("Error in account creation or transferring funds:", error);
    if (error.type === "StripeInvalidRequestError") {
      res.status(400).json({
        success: false,
        message:
          "Stripe Connect is not set up. Please set up Stripe Connect to create accounts and transfer funds.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};

exports.capturePayment = async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    // Confirm the PaymentIntent
    let paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: "pm_card_visa",
      return_url: "http://localhost:3001",
    });

    // Check if the status is now "requires_capture"
    if (paymentIntent.status === "requires_capture") {
      // Capture the PaymentIntent
      paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
      res.send({ success: true, paymentIntent });
    } else {
      res.status(400).send({
        error: `Cannot capture PaymentIntent with status ${paymentIntent.status}`,
      });
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
