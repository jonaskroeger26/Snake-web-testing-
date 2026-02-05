// api/get-skr-domain.js
// ZERO-dependency test handler to verify Vercel functions work

export default function handler(req, res) {
  const { wallet } = req.query || {};

  res.status(200).json({
    success: true,
    message: 'get-skr-domain NO-DEPS test function is working on Vercel (app/api).',
    wallet: wallet || null,
    note: 'If you see this, serverless functions are deploying correctly.'
  });
}
