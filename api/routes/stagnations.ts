import { Router, Request, Response } from 'express';
import * as umbrellaService from '../services/umbrellaService';
import { ApiResponse } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { resolved } = req.query;
    let resolvedBool: boolean | undefined;
    if (resolved !== undefined) {
      resolvedBool = resolved === 'true' || resolved === '1';
    }
    const stagnations = umbrellaService.getAllStagnations(resolvedBool);
    const response: ApiResponse<typeof stagnations> = {
      success: true,
      data: stagnations,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取停滞列表失败',
    };
    res.status(500).json(response);
  }
});

router.post('/:id/resolve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolutionNote } = req.body;
    if (!resolutionNote) {
      const response: ApiResponse<null> = {
        success: false,
        error: '请填写处理说明',
      };
      return res.status(400).json(response);
    }
    const stagnation = umbrellaService.resolveStagnation(id, resolutionNote);
    const response: ApiResponse<typeof stagnation> = {
      success: true,
      data: stagnation,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '解除停滞失败',
    };
    res.status(400).json(response);
  }
});

export default router;
