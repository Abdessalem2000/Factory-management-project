import { Request, Response, NextFunction } from 'express';
import puppeteer from 'puppeteer';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Report generation schema
const reportSchema = z.object({
  type: z.enum(['production', 'financial', 'quality', 'maintenance', 'inventory']),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }),
  format: z.enum(['pdf', 'excel']).default('pdf'),
  filters: z.object({
    department: z.string().optional(),
    shift: z.string().optional(),
    product: z.string().optional()
  }).optional()
});

// Generate production report
export const generateProductionReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = reportSchema.parse(req.body);
    
    // Mock report data - in real implementation, fetch from database
    const reportData = {
      title: 'Production Report',
      dateRange: validatedData.dateRange,
      generatedBy: req.user!.email,
      generatedAt: new Date().toISOString(),
      summary: {
        totalProduction: 15420,
        target: 16000,
        efficiency: 96.4,
        downtime: 12.5,
        qualityScore: 98.2
      },
      details: [
        {
          date: '2026-03-14',
          shift: 'A',
          target: 2000,
          actual: 1950,
          efficiency: 97.5,
          downtime: 0.5
        },
        {
          date: '2026-03-14',
          shift: 'B',
          target: 2000,
          actual: 1880,
          efficiency: 94.0,
          downtime: 2.0
        },
        {
          date: '2026-03-13',
          shift: 'A',
          target: 2000,
          actual: 2050,
          efficiency: 102.5,
          downtime: 0
        }
      ],
      charts: {
        productionTrend: [1950, 1880, 2050, 2100, 1900],
        efficiencyTrend: [97.5, 94.0, 102.5, 105.0, 95.0]
      }
    };

    if (validatedData.format === 'pdf') {
      const pdfBuffer = await generatePDFReport(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="production-report-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } else {
      // Excel format would be implemented with a library like exceljs
      res.json({
        success: true,
        message: 'Excel report generation not yet implemented',
        data: reportData
      });
    }
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

// Generate PDF report
async function generatePDFReport(data: any): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const html = generateReportHTML(data);
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  return pdfBuffer;
}

// Generate HTML for PDF report
function generateReportHTML(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #2c3e50;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 14px;
        }
        .summary-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #3498db;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title}</h1>
        <p>Period: ${data.dateRange.start} to ${data.dateRange.end}</p>
        <p>Generated by: ${data.generatedBy} on ${new Date(data.generatedAt).toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card">
          <h3>Total Production</h3>
          <div class="value">${data.summary.totalProduction.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <h3>Target</h3>
          <div class="value">${data.summary.target.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <h3>Efficiency</h3>
          <div class="value">${data.summary.efficiency}%</div>
        </div>
        <div class="summary-card">
          <h3>Downtime</h3>
          <div class="value">${data.summary.downtime}h</div>
        </div>
        <div class="summary-card">
          <h3>Quality Score</h3>
          <div class="value">${data.summary.qualityScore}%</div>
        </div>
      </div>
      
      <h2>Detailed Production Data</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Shift</th>
            <th>Target</th>
            <th>Actual</th>
            <th>Efficiency</th>
            <th>Downtime (h)</th>
          </tr>
        </thead>
        <tbody>
          ${data.details.map((row: any) => `
            <tr>
              <td>${row.date}</td>
              <td>${row.shift}</td>
              <td>${row.target.toLocaleString()}</td>
              <td>${row.actual.toLocaleString()}</td>
              <td>${row.efficiency}%</td>
              <td>${row.downtime}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>This report was automatically generated by the Factory Management System.</p>
        <p>For questions or concerns, please contact the system administrator.</p>
      </div>
    </body>
    </html>
  `;
}

// Get available report types
export const getReportTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportTypes = [
      {
        id: 'production',
        name: 'Production Report',
        description: 'Daily, weekly, or monthly production metrics and analysis',
        permissions: ['view_production']
      },
      {
        id: 'financial',
        name: 'Financial Report',
        description: 'Revenue, costs, and profitability analysis',
        permissions: ['view_financial']
      },
      {
        id: 'quality',
        name: 'Quality Report',
        description: 'Quality control metrics and defect analysis',
        permissions: ['view_quality']
      },
      {
        id: 'maintenance',
        name: 'Maintenance Report',
        description: 'Equipment maintenance schedules and downtime analysis',
        permissions: ['view_maintenance']
      },
      {
        id: 'inventory',
        name: 'Inventory Report',
        description: 'Stock levels, turnover, and supply chain metrics',
        permissions: ['view_inventory']
      }
    ];

    res.json({
      success: true,
      data: { reportTypes }
    });
  } catch (error) {
    next(error);
  }
};

// Get report history
export const getReportHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Mock report history
    const reportHistory = [
      {
        id: 'rpt_001',
        type: 'production',
        title: 'Weekly Production Report',
        generatedAt: new Date(Date.now() - 86400000).toISOString(),
        generatedBy: req.user!.email,
        format: 'pdf',
        size: '2.3 MB'
      },
      {
        id: 'rpt_002',
        type: 'financial',
        title: 'Monthly Financial Summary',
        generatedAt: new Date(Date.now() - 172800000).toISOString(),
        generatedBy: 'manager@factory.com',
        format: 'pdf',
        size: '1.8 MB'
      }
    ];

    res.json({
      success: true,
      data: {
        reports: reportHistory,
        total: reportHistory.length
      }
    });
  } catch (error) {
    next(error);
  }
};
