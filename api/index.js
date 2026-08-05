// Vercel serverless entry: de volledige Express-app als zelfstandige bundel.
// De bundel wordt gebouwd door het buildCommand in vercel.json.
const mod = require("../artifacts/api-server/dist/app.cjs");
module.exports = mod.default || mod;
