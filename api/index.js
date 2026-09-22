// ==============================================================================
// Vercel Serverless Function Bridge for THOS RepairTrack OS + CollectIQ
// Routes all incoming /api/* requests directly into the core request engine
// ==============================================================================

const { handleRequest } = require("../server/server");

module.exports = async (req, res) => {
  return handleRequest(req, res);
};
