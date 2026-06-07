import { Router, Request, Response } from 'express';
import * as umbrellaService from '../services/umbrellaService';
import { ApiResponse } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const umbrellas = umbrellaService.getAllUmbrellas(
      status as string | undefined,
      search as string | undefined,
    );
    const response: ApiResponse<typeof umbrellas> = {
      success: true,
      data: umbrellas,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取伞号列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const umbrella = umbrellaService.getUmbrellaDetail(id);
    if (!umbrella) {
      const response: ApiResponse<null> = {
        success: false,
        error: '伞号不存在',
      };
      return res.status(404).json(response);
    }
    const response: ApiResponse<typeof umbrella> = {
      success: true,
      data: umbrella,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '获取伞号详情失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { umbrellaNo, plannedIntervalDays } = req.body;
    if (!umbrellaNo || !plannedIntervalDays) {
      const response: ApiResponse<null> = {
        success: false,
        error: '缺少必要参数',
      };
      return res.status(400).json(response);
    }
    const umbrella = umbrellaService.createUmbrella(umbrellaNo, plannedIntervalDays);
    const response: ApiResponse<typeof umbrella> = {
      success: true,
      data: umbrella,
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '创建伞号失败',
    };
    res.status(500).json(response);
  }
});

router.post('/:id/pasting', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pastingDate, wrinkleLength } = req.body;
    if (!pastingDate || wrinkleLength === undefined || wrinkleLength === null) {
      const response: ApiResponse<null> = {
        success: false,
        error: '缺少必要参数',
      };
      return res.status(400).json(response);
    }
    const result = umbrellaService.addPastingRecord(id, pastingDate, Number(wrinkleLength));
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '添加裱糊记录失败',
    };
    res.status(400).json(response);
  }
});

router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completedDate } = req.body;
    if (!completedDate) {
      const response: ApiResponse<null> = {
        success: false,
        error: '缺少完工日期',
      };
      return res.status(400).json(response);
    }
    const umbrella = umbrellaService.completeUmbrella(id, completedDate);
    const response: ApiResponse<typeof umbrella> = {
      success: true,
      data: umbrella,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : '登记完工失败',
    };
    res.status(400).json(response);
  }
});

export default router;
