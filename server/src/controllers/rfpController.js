const Rfp = require('../models/Rfp');

exports.getAllRfps = async (req, res) => {
  try {
    const rfps = await Rfp.find().sort({ createdAt: -1 });
    res.json(rfps);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.createRfp = async (req, res) => {
  try {
    const newRfp = new Rfp(req.body);
    const rfp = await newRfp.save();
    res.json(rfp);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getRfpById = async (req, res) => {
  try {
    const rfp = await Rfp.findById(req.params.id);
    if (!rfp) return res.status(404).json({ msg: 'RFP not found' });
    res.json(rfp);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};