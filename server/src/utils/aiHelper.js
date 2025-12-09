// Mock AI for demonstration if no API key is present
// To use real OpenAI, import OpenAI from 'openai' and configure it.

const analyzeProposal = async (proposalText) => {
  // SIMULATION: In a real app, call OpenAI API here
  return {
    score: Math.floor(Math.random() * (100 - 70 + 1) + 70),
    analysis: "The proposal aligns well with requirements but budget is slightly high."
  };
};

const generateRfpSummary = async (description) => {
  return `Summary: ${description.substring(0, 50)}... (AI Generated)`;
};

module.exports = { analyzeProposal, generateRfpSummary };