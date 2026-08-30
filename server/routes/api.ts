import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Baseline Status Route
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    product: 'ResumeSync (Resume Intelligence Copilot)',
    checkpoint: '01 - Foundation',
    timestamp: new Date().toISOString()
  });
});

export default router;
