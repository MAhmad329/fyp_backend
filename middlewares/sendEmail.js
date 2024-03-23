const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {

  var transporter = nodeMailer.createTransport({
    service:'gmail',
    auth: {
      user: "ahmadmuhdpk@gmail.com",
      pass: process.env.MAIL_PASS
    }
  });
  

  const mailOptions = {
    from: "OutsourcePro <no-reply@outsourcepro.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //console.log(mailOptions);
  await transporter.sendMail(mailOptions);
};