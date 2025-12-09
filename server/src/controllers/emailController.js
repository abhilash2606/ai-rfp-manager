exports.sendInvite = async (req, res) => {
  const { vendorEmail, rfpTitle } = req.body;
  // Placeholder for Nodemailer logic
  console.log(`Sending email to ${vendorEmail} for RFP: ${rfpTitle}`);
  
  res.json({ msg: `Invite sent to ${vendorEmail}` });
};