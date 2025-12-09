const { analyzeProposal } = require('../utils/aiHelper');

exports.analyzeRfpProposal = async (req, res) => {
  const { proposalText } = req.body;
  try {
    const result = await analyzeProposal(proposalText);
    res.json(result);
  } catch (err) {
    res.status(500).send('AI Service Error');
  }
};