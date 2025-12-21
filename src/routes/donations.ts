import { Router, Request, Response } from 'express';

const router = Router();

// 1. Donation Homepage Data (Partner View)
router.get('/home', (req: Request, res: Response) => {
  // TODO
  res.status(501).json({ message: 'Not implemented' });
});

// 2. Get All Donation Projects
router.get('/projects', (req: Request, res: Response) => {
  // TODO
  res.status(501).json({ message: 'Not implemented' });
});

// 3. Submit Donation Application
router.post('/applications', (req: Request, res: Response) => {
  // TODO
  res.status(501).json({ message: 'Not implemented' });
});

// 4. Get Partner’s Donation History (Past / Ongoing)
router.get('/partners/donations', (req: Request, res: Response) => {
  // TODO
  res.status(501).json({ message: 'Not implemented' });
});

// 5. Donation Detail (Review / Complete Page)
router.get('/:donationId', (req: Request, res: Response) => {
  // TODO
  res.status(501).json({ message: 'Not implemented' });
});

// 6. Download Receipt & Thank-You Note
router.get('/:donationId/receipt', (req: Request, res: Response) => {
  // TODO
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
