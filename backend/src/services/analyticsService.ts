import * as ss from 'simple-statistics';

export interface ProductionData {
  date: string;
  actual: number;
  target: number;
  efficiency: number;
  shift: string;
  machineId?: string;
  productId?: string;
}

export interface ForecastResult {
  predictions: Array<{
    date: string;
    predicted: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
  }>;
  accuracy: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
  recommendations: string[];
}

export class AnalyticsService {
  // Linear regression for production forecasting
  public forecastProduction(data: ProductionData[], daysAhead: number = 7): ForecastResult {
    if (data.length < 3) {
      throw new Error('Insufficient data for forecasting (minimum 3 data points required)');
    }

    // Prepare data for linear regression
    const numericData = data.map((d, index) => [index, d.actual]);
    
    try {
      // Calculate linear regression
      const regression = ss.linearRegression(numericData);
      const regressionLine = ss.linearRegressionLine(regression);
      
      // Calculate R-squared for accuracy
      const predictions = data.map((d, index) => regressionLine(index));
      const actualValues = data.map(d => d.actual);
      const rSquared = ss.rSquared(actualValues, predictions);
      
      // Generate future predictions
      const futurePredictions = [];
      const lastIndex = data.length - 1;
      
      for (let i = 1; i <= daysAhead; i++) {
        const futureIndex = lastIndex + i;
        const predicted = regressionLine(futureIndex);
        
        // Calculate confidence intervals (simplified)
        const standardError = this.calculateStandardError(actualValues, predictions);
        const marginOfError = 1.96 * standardError; // 95% confidence interval
        
        futurePredictions.push({
          date: this.addDays(new Date(data[lastIndex].date), i).toISOString().split('T')[0],
          predicted: Math.max(0, predicted),
          confidence: Math.max(0, Math.min(100, rSquared * 100)),
          lowerBound: Math.max(0, predicted - marginOfError),
          upperBound: predicted + marginOfError
        });
      }
      
      // Determine trend
      const trend = this.determineTrend(regression[0]); // slope
      
      // Check for seasonality (simplified)
      const seasonality = this.detectSeasonality(data);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(data, trend, rSquared);
      
      return {
        predictions: futurePredictions,
        accuracy: Math.max(0, Math.min(100, rSquared * 100)),
        trend,
        seasonality,
        recommendations
      };
    } catch (error) {
      console.error('Error in forecasting:', error);
      throw new Error('Failed to generate forecast');
    }
  }

  // Calculate moving average
  public calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1);
      const average = ss.mean(window);
      result.push(average);
    }
    
    return result;
  }

  // Detect anomalies in production data
  public detectAnomalies(data: ProductionData[]): Array<{
    date: string;
    value: number;
    expected: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    if (data.length < 5) {
      return [];
    }

    const anomalies = [];
    const values = data.map(d => d.actual);
    const mean = ss.mean(values);
    const standardDeviation = ss.standardDeviation(values);
    
    data.forEach((point, index) => {
      const zScore = Math.abs((point.actual - mean) / standardDeviation);
      
      if (zScore > 2) { // More than 2 standard deviations from mean
        let severity: 'low' | 'medium' | 'high' = 'low';
        
        if (zScore > 3) {
          severity = 'high';
        } else if (zScore > 2.5) {
          severity = 'medium';
        }
        
        anomalies.push({
          date: point.date,
          value: point.actual,
          expected: mean,
          deviation: zScore,
          severity
        });
      }
    });
    
    return anomalies;
  }

  // Calculate efficiency trends
  public analyzeEfficiencyTrends(data: ProductionData[]): {
    trend: 'improving' | 'declining' | 'stable';
    averageEfficiency: number;
    bestEfficiency: number;
    worstEfficiency: number;
    recommendations: string[];
  } {
    if (data.length === 0) {
      return {
        trend: 'stable',
        averageEfficiency: 0,
        bestEfficiency: 0,
        worstEfficiency: 0,
        recommendations: []
      };
    }

    const efficiencies = data.map(d => d.efficiency);
    const averageEfficiency = ss.mean(efficiencies);
    const bestEfficiency = Math.max(...efficiencies);
    const worstEfficiency = Math.min(...efficiencies);
    
    // Determine trend using linear regression on efficiency data
    const numericData = data.map((d, index) => [index, d.efficiency]);
    const regression = ss.linearRegression(numericData);
    const slope = regression[0];
    
    let trend: 'improving' | 'declining' | 'stable';
    if (slope > 0.5) {
      trend = 'improving';
    } else if (slope < -0.5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }
    
    // Generate recommendations
    const recommendations = this.generateEfficiencyRecommendations(
      averageEfficiency,
      bestEfficiency,
      worstEfficiency,
      trend
    );
    
    return {
      trend,
      averageEfficiency,
      bestEfficiency,
      worstEfficiency,
      recommendations
    };
  }

  // Calculate production capacity utilization
  public calculateCapacityUtilization(data: ProductionData[]): {
    averageUtilization: number;
    peakUtilization: number;
    underutilizedDays: number;
    overutilizedDays: number;
    recommendations: string[];
  } {
    if (data.length === 0) {
      return {
        averageUtilization: 0,
        peakUtilization: 0,
        underutilizedDays: 0,
        overutilizedDays: 0,
        recommendations: []
      };
    }

    const utilizationRates = data.map(d => (d.actual / d.target) * 100);
    const averageUtilization = ss.mean(utilizationRates);
    const peakUtilization = Math.max(...utilizationRates);
    
    const underutilizedDays = utilizationRates.filter(rate => rate < 70).length;
    const overutilizedDays = utilizationRates.filter(rate => rate > 95).length;
    
    const recommendations = this.generateCapacityRecommendations(
      averageUtilization,
      underutilizedDays,
      overutilizedDays
    );
    
    return {
      averageUtilization,
      peakUtilization,
      underutilizedDays,
      overutilizedDays,
      recommendations
    };
  }

  // Helper methods
  private calculateStandardError(actual: number[], predicted: number[]): number {
    const errors = actual.map((a, i) => a - predicted[i]);
    const squaredErrors = errors.map(e => e * e);
    const meanSquaredError = ss.mean(squaredErrors);
    return Math.sqrt(meanSquaredError);
  }

  private determineTrend(slope: number): 'increasing' | 'decreasing' | 'stable' {
    if (slope > 1) {
      return 'increasing';
    } else if (slope < -1) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  private detectSeasonality(data: ProductionData[]): boolean {
    // Simple seasonality detection - check for weekly patterns
    if (data.length < 14) {
      return false;
    }

    const weeklyAverages = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
    
    data.forEach(point => {
      const date = new Date(point.date);
      const dayOfWeek = date.getDay();
      weeklyAverages[dayOfWeek] += point.actual;
      weeklyCounts[dayOfWeek]++;
    });
    
    // Calculate average for each day of week
    for (let i = 0; i < 7; i++) {
      if (weeklyCounts[i] > 0) {
        weeklyAverages[i] /= weeklyCounts[i];
      }
    }
    
    // Check if there's significant variation between days
    const overallAverage = ss.mean(data.map(d => d.actual));
    const variation = ss.standardDeviation(weeklyAverages);
    
    return variation > overallAverage * 0.2; // 20% variation threshold
  }

  private generateRecommendations(
    data: ProductionData[],
    trend: 'increasing' | 'decreasing' | 'stable',
    accuracy: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (trend === 'increasing') {
      recommendations.push('Production is trending upward. Consider increasing targets or adding capacity.');
    } else if (trend === 'decreasing') {
      recommendations.push('Production is declining. Investigate root causes and implement corrective actions.');
    }
    
    if (accuracy < 70) {
      recommendations.push('Forecast accuracy is low. Collect more historical data to improve predictions.');
    }
    
    const recentData = data.slice(-7);
    const recentAverage = ss.mean(recentData.map(d => d.actual));
    const targetAverage = ss.mean(recentData.map(d => d.target));
    
    if (recentAverage < targetAverage * 0.9) {
      recommendations.push('Recent production is below target. Review efficiency and resource allocation.');
    }
    
    return recommendations;
  }

  private generateEfficiencyRecommendations(
    average: number,
    best: number,
    worst: number,
    trend: 'improving' | 'declining' | 'stable'
  ): string[] {
    const recommendations: string[] = [];
    
    if (average < 85) {
      recommendations.push('Average efficiency is below 85%. Implement process optimization measures.');
    }
    
    if (trend === 'declining') {
      recommendations.push('Efficiency is declining. Conduct equipment maintenance checks and operator training.');
    }
    
    if (best - worst > 20) {
      recommendations.push('High efficiency variation detected. Standardize operating procedures.');
    }
    
    return recommendations;
  }

  private generateCapacityRecommendations(
    average: number,
    underutilizedDays: number,
    overutilizedDays: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (average < 75) {
      recommendations.push('Low capacity utilization. Consider consolidating shifts or reducing workforce.');
    } else if (average > 90) {
      recommendations.push('High capacity utilization. Monitor for burnout and consider capacity expansion.');
    }
    
    if (underutilizedDays > 3) {
      recommendations.push('Multiple underutilized days detected. Optimize production scheduling.');
    }
    
    if (overutilizedDays > 3) {
      recommendations.push('Frequent overutilization. Risk of quality issues - consider capacity planning.');
    }
    
    return recommendations;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

// Singleton instance
let analyticsService: AnalyticsService;

export const getAnalyticsService = (): AnalyticsService => {
  if (!analyticsService) {
    analyticsService = new AnalyticsService();
  }
  return analyticsService;
};
