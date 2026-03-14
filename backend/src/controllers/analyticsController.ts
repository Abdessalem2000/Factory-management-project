import { Request, Response, NextFunction } from 'express';
import { getAnalyticsService, ProductionData, ForecastResult } from '../services/analyticsService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Forecast request schema
const forecastRequestSchema = z.object({
  daysAhead: z.number().min(1).max(30).default(7),
  productId: z.string().optional(),
  machineId: z.string().optional(),
  shift: z.string().optional()
});

// Generate production forecast
export const generateForecast = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = forecastRequestSchema.parse(req.body);
    const analyticsService = getAnalyticsService();
    
    // Mock historical data - in real implementation, fetch from database
    const historicalData: ProductionData[] = [
      { date: '2026-03-01', actual: 1200, target: 1250, efficiency: 96.0, shift: 'A' },
      { date: '2026-03-02', actual: 1180, target: 1250, efficiency: 94.4, shift: 'A' },
      { date: '2026-03-03', actual: 1320, target: 1250, efficiency: 105.6, shift: 'A' },
      { date: '2026-03-04', actual: 1150, target: 1250, efficiency: 92.0, shift: 'A' },
      { date: '2026-03-05', actual: 1280, target: 1250, efficiency: 102.4, shift: 'A' },
      { date: '2026-03-06', actual: 1220, target: 1250, efficiency: 97.6, shift: 'A' },
      { date: '2026-03-07', actual: 1300, target: 1250, efficiency: 104.0, shift: 'A' },
      { date: '2026-03-08', actual: 1190, target: 1250, efficiency: 95.2, shift: 'A' },
      { date: '2026-03-09', actual: 1340, target: 1250, efficiency: 107.2, shift: 'A' },
      { date: '2026-03-10', actual: 1260, target: 1250, efficiency: 100.8, shift: 'A' },
      { date: '2026-03-11', actual: 1210, target: 1250, efficiency: 96.8, shift: 'A' },
      { date: '2026-03-12', actual: 1330, target: 1250, efficiency: 106.4, shift: 'A' },
      { date: '2026-03-13', actual: 1240, target: 1250, efficiency: 99.2, shift: 'A' },
      { date: '2026-03-14', actual: 1290, target: 1250, efficiency: 103.2, shift: 'A' }
    ];

    // Filter data based on request parameters
    let filteredData = historicalData;
    
    if (validatedData.productId) {
      // In real implementation, filter by product ID
      filteredData = filteredData.filter(d => d.productId === validatedData.productId);
    }
    
    if (validatedData.machineId) {
      // In real implementation, filter by machine ID
      filteredData = filteredData.filter(d => d.machineId === validatedData.machineId);
    }
    
    if (validatedData.shift) {
      filteredData = filteredData.filter(d => d.shift === validatedData.shift);
    }

    const forecast: ForecastResult = analyticsService.forecastProduction(
      filteredData,
      validatedData.daysAhead
    );

    res.json({
      success: true,
      data: {
        forecast,
        historicalData: filteredData,
        metadata: {
          dataPoints: filteredData.length,
          forecastPeriod: validatedData.daysAhead,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    next(error);
  }
};

// Detect production anomalies
export const detectAnomalies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query;
    
    const analyticsService = getAnalyticsService();
    
    // Mock data - in real implementation, fetch from database
    const productionData: ProductionData[] = [
      { date: '2026-02-13', actual: 1200, target: 1250, efficiency: 96.0, shift: 'A' },
      { date: '2026-02-14', actual: 1180, target: 1250, efficiency: 94.4, shift: 'A' },
      { date: '2026-02-15', actual: 1320, target: 1250, efficiency: 105.6, shift: 'A' },
      { date: '2026-02-16', actual: 1150, target: 1250, efficiency: 92.0, shift: 'A' },
      { date: '2026-02-17', actual: 1280, target: 1250, efficiency: 102.4, shift: 'A' },
      { date: '2026-02-18', actual: 800, target: 1250, efficiency: 64.0, shift: 'A' }, // Anomaly
      { date: '2026-02-19', actual: 1220, target: 1250, efficiency: 97.6, shift: 'A' },
      { date: '2026-02-20', actual: 1300, target: 1250, efficiency: 104.0, shift: 'A' },
      { date: '2026-02-21', actual: 1190, target: 1250, efficiency: 95.2, shift: 'A' },
      { date: '2026-02-22', actual: 1340, target: 1250, efficiency: 107.2, shift: 'A' },
      { date: '2026-02-23', actual: 1260, target: 1250, efficiency: 100.8, shift: 'A' },
      { date: '2026-02-24', actual: 1210, target: 1250, efficiency: 96.8, shift: 'A' },
      { date: '2026-02-25', actual: 1330, target: 1250, efficiency: 106.4, shift: 'A' },
      { date: '2026-02-26', actual: 1240, target: 1250, efficiency: 99.2, shift: 'A' },
      { date: '2026-02-27', actual: 1650, target: 1250, efficiency: 132.0, shift: 'A' }, // Anomaly
      { date: '2026-02-28', actual: 1290, target: 1250, efficiency: 103.2, shift: 'A' }
    ];

    const anomalies = analyticsService.detectAnomalies(productionData);

    res.json({
      success: true,
      data: {
        anomalies,
        summary: {
          totalAnomalies: anomalies.length,
          highSeverity: anomalies.filter(a => a.severity === 'high').length,
          mediumSeverity: anomalies.filter(a => a.severity === 'medium').length,
          lowSeverity: anomalies.filter(a => a.severity === 'low').length,
          analysisPeriod: `${days} days`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Analyze efficiency trends
export const analyzeEfficiency = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query;
    
    const analyticsService = getAnalyticsService();
    
    // Mock data - in real implementation, fetch from database
    const productionData: ProductionData[] = [
      { date: '2026-02-13', actual: 1200, target: 1250, efficiency: 96.0, shift: 'A' },
      { date: '2026-02-14', actual: 1180, target: 1250, efficiency: 94.4, shift: 'A' },
      { date: '2026-02-15', actual: 1320, target: 1250, efficiency: 105.6, shift: 'A' },
      { date: '2026-02-16', actual: 1150, target: 1250, efficiency: 92.0, shift: 'A' },
      { date: '2026-02-17', actual: 1280, target: 1250, efficiency: 102.4, shift: 'A' },
      { date: '2026-02-18', actual: 1220, target: 1250, efficiency: 97.6, shift: 'A' },
      { date: '2026-02-19', actual: 1300, target: 1250, efficiency: 104.0, shift: 'A' },
      { date: '2026-02-20', actual: 1190, target: 1250, efficiency: 95.2, shift: 'A' },
      { date: '2026-02-21', actual: 1340, target: 1250, efficiency: 107.2, shift: 'A' },
      { date: '2026-02-22', actual: 1260, target: 1250, efficiency: 100.8, shift: 'A' },
      { date: '2026-02-23', actual: 1210, target: 1250, efficiency: 96.8, shift: 'A' },
      { date: '2026-02-24', actual: 1330, target: 1250, efficiency: 106.4, shift: 'A' },
      { date: '2026-02-25', actual: 1240, target: 1250, efficiency: 99.2, shift: 'A' },
      { date: '2026-02-26', actual: 1290, target: 1250, efficiency: 103.2, shift: 'A' },
      { date: '2026-02-27', actual: 1270, target: 1250, efficiency: 101.6, shift: 'A' },
      { date: '2026-02-28', actual: 1310, target: 1250, efficiency: 104.8, shift: 'A' }
    ];

    const efficiencyAnalysis = analyticsService.analyzeEfficiencyTrends(productionData);

    res.json({
      success: true,
      data: {
        ...efficiencyAnalysis,
        metadata: {
          dataPoints: productionData.length,
          analysisPeriod: `${days} days`,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Analyze capacity utilization
export const analyzeCapacity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query;
    
    const analyticsService = getAnalyticsService();
    
    // Mock data - in real implementation, fetch from database
    const productionData: ProductionData[] = [
      { date: '2026-02-13', actual: 1200, target: 1250, efficiency: 96.0, shift: 'A' },
      { date: '2026-02-14', actual: 1180, target: 1250, efficiency: 94.4, shift: 'A' },
      { date: '2026-02-15', actual: 1320, target: 1250, efficiency: 105.6, shift: 'A' },
      { date: '2026-02-16', actual: 1150, target: 1250, efficiency: 92.0, shift: 'A' },
      { date: '2026-02-17', actual: 1280, target: 1250, efficiency: 102.4, shift: 'A' },
      { date: '2026-02-18', actual: 1220, target: 1250, efficiency: 97.6, shift: 'A' },
      { date: '2026-02-19', actual: 1300, target: 1250, efficiency: 104.0, shift: 'A' },
      { date: '2026-02-20', actual: 1190, target: 1250, efficiency: 95.2, shift: 'A' },
      { date: '2026-02-21', actual: 1340, target: 1250, efficiency: 107.2, shift: 'A' },
      { date: '2026-02-22', actual: 1260, target: 1250, efficiency: 100.8, shift: 'A' },
      { date: '2026-02-23', actual: 1210, target: 1250, efficiency: 96.8, shift: 'A' },
      { date: '2026-02-24', actual: 1330, target: 1250, efficiency: 106.4, shift: 'A' },
      { date: '2026-02-25', actual: 1240, target: 1250, efficiency: 99.2, shift: 'A' },
      { date: '2026-02-26', actual: 1290, target: 1250, efficiency: 103.2, shift: 'A' },
      { date: '2026-02-27', actual: 1270, target: 1250, efficiency: 101.6, shift: 'A' },
      { date: '2026-02-28', actual: 1310, target: 1250, efficiency: 104.8, shift: 'A' }
    ];

    const capacityAnalysis = analyticsService.calculateCapacityUtilization(productionData);

    res.json({
      success: true,
      data: {
        ...capacityAnalysis,
        metadata: {
          dataPoints: productionData.length,
          analysisPeriod: `${days} days`,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics dashboard data
export const getAnalyticsDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analyticsService = getAnalyticsService();
    
    // Mock comprehensive data
    const productionData: ProductionData[] = [
      { date: '2026-02-13', actual: 1200, target: 1250, efficiency: 96.0, shift: 'A' },
      { date: '2026-02-14', actual: 1180, target: 1250, efficiency: 94.4, shift: 'A' },
      { date: '2026-02-15', actual: 1320, target: 1250, efficiency: 105.6, shift: 'A' },
      { date: '2026-02-16', actual: 1150, target: 1250, efficiency: 92.0, shift: 'A' },
      { date: '2026-02-17', actual: 1280, target: 1250, efficiency: 102.4, shift: 'A' },
      { date: '2026-02-18', actual: 1220, target: 1250, efficiency: 97.6, shift: 'A' },
      { date: '2026-02-19', actual: 1300, target: 1250, efficiency: 104.0, shift: 'A' },
      { date: '2026-02-20', actual: 1190, target: 1250, efficiency: 95.2, shift: 'A' },
      { date: '2026-02-21', actual: 1340, target: 1250, efficiency: 107.2, shift: 'A' },
      { date: '2026-02-22', actual: 1260, target: 1250, efficiency: 100.8, shift: 'A' },
      { date: '2026-02-23', actual: 1210, target: 1250, efficiency: 96.8, shift: 'A' },
      { date: '2026-02-24', actual: 1330, target: 1250, efficiency: 106.4, shift: 'A' },
      { date: '2026-02-25', actual: 1240, target: 1250, efficiency: 99.2, shift: 'A' },
      { date: '2026-02-26', actual: 1290, target: 1250, efficiency: 103.2, shift: 'A' },
      { date: '2026-02-27', actual: 1270, target: 1250, efficiency: 101.6, shift: 'A' },
      { date: '2026-02-28', actual: 1310, target: 1250, efficiency: 104.8, shift: 'A' }
    ];

    // Generate all analytics
    const forecast = analyticsService.forecastProduction(productionData, 7);
    const anomalies = analyticsService.detectAnomalies(productionData);
    const efficiencyAnalysis = analyticsService.analyzeEfficiencyTrends(productionData);
    const capacityAnalysis = analyticsService.calculateCapacityUtilization(productionData);

    res.json({
      success: true,
      data: {
        forecast,
        anomalies,
        efficiencyAnalysis,
        capacityAnalysis,
        summary: {
          totalProduction: productionData.reduce((sum, d) => sum + d.actual, 0),
          averageEfficiency: efficiencyAnalysis.averageEfficiency,
          totalAnomalies: anomalies.length,
          forecastAccuracy: forecast.accuracy,
          capacityUtilization: capacityAnalysis.averageUtilization
        },
        metadata: {
          dataPoints: productionData.length,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
