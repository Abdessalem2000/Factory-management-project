import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateFactoryAudit(factoryData) {
  const prompt = `
As an expert factory consultant, analyze this Algerian factory data and provide a comprehensive efficiency audit:

WORKFORCE DATA:
${JSON.stringify(factoryData.workers, null, 2)}

FINANCIAL DATA:
Incomes: ${JSON.stringify(factoryData.incomes, null, 2)}
Expenses: ${JSON.stringify(factoryData.expenses, null, 2)}

INVENTORY DATA:
Raw Materials: ${JSON.stringify(factoryData.rawMaterials, null, 2)}
Suppliers: ${JSON.stringify(factoryData.suppliers, null, 2)}

PRODUCTION DATA:
Orders: ${JSON.stringify(factoryData.productionOrders, null, 2)}

Please provide a detailed analysis covering:
1. Current Operational Efficiency Score (1-10)
2. Key Bottlenecks Identified
3. Cost Optimization Opportunities
4. Inventory Management Recommendations
5. Production Flow Improvements
6. Workforce Optimization
7. Technology Integration Suggestions
8. Immediate Action Items (Next 30 days)
9. Long-term Strategic Recommendations

Format as a professional report with clear sections and actionable insights.
Focus on practical improvements for an Algerian manufacturing context.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert factory operations consultant with deep knowledge of Algerian manufacturing environments. Provide practical, actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || "Unable to generate audit report"
  } catch (error) {
    console.error('OpenAI Error:', error)
    return "AI Audit temporarily unavailable. Please check your API key configuration."
  }
}
