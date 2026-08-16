/**
 * AI Financial Analysis Service
 * Modular service that generates structured financial insights & recommendations from aggregated user statistics.
 * Provider-swappable: Supports Gemini / OpenAI API if configured in process.env, with built-in intelligent fallback engine.
 */

const generateInsights = async (stats) => {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini API if key is present
  if (geminiApiKey) {
    try {
      const response = await callGeminiApi(stats, geminiApiKey);
      if (response) return response;
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent fallback engine:', err.message);
    }
  }

  // 2. Try OpenAI API if key is present
  if (openaiApiKey) {
    try {
      const response = await callOpenAiApi(stats, openaiApiKey);
      if (response) return response;
    } catch (err) {
      console.warn('OpenAI API call failed, using intelligent fallback engine:', err.message);
    }
  }

  // 3. Intelligent Rule-Based Financial Analysis Engine (Default / Fallback)
  return runRuleBasedAnalysis(stats);
};

/**
 * Call Google Gemini API
 */
const callGeminiApi = async (stats, apiKey) => {
  const prompt = `You are a Senior Financial Advisor AI. Analyze the following structured financial statistics and return ONLY valid JSON matching this exact JSON schema:
{
  "financialHealthSummary": "string",
  "healthScore": number (0-100),
  "healthStatus": "Excellent" | "Good" | "Needs Attention" | "Critical",
  "spendingAnalysis": ["string"],
  "positiveHabits": ["string"],
  "areasOfConcern": ["string"],
  "personalizedRecommendations": ["string"],
  "suggestedSavingsGoal": {
    "targetMonthlySavings": number,
    "description": "string"
  }
}

User Financial Statistics:
${JSON.stringify(stats, null, 2)}
Return pure JSON without markdown codeblock syntax.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
};

/**
 * Call OpenAI API
 */
const callOpenAiApi = async (stats, apiKey) => {
  const prompt = `You are a Senior Financial Advisor AI. Analyze the following structured financial statistics and return ONLY valid JSON matching this exact JSON schema:
{
  "financialHealthSummary": "string",
  "healthScore": number (0-100),
  "healthStatus": "Excellent" | "Good" | "Needs Attention" | "Critical",
  "spendingAnalysis": ["string"],
  "positiveHabits": ["string"],
  "areasOfConcern": ["string"],
  "personalizedRecommendations": ["string"],
  "suggestedSavingsGoal": {
    "targetMonthlySavings": number,
    "description": "string"
  }
}

User Financial Statistics:
${JSON.stringify(stats, null, 2)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
};

/**
 * Intelligent Rule-Based Financial Analysis Engine
 * Analyzes exact user statistics to generate personalized financial insights.
 */
const runRuleBasedAnalysis = (stats) => {
  const {
    totalIncome = 0,
    totalExpenses = 0,
    netBalance = 0,
    savingsRate = 0,
    monthlyBudget = null,
    currentMonthExpenses = 0,
    categoryBreakdown = [],
    highestCategory = null,
    monthlyTrends = [],
    categoryBudgets = [],
    savingsGoals = [],
    transactionCount = 0,
    forecast = null
  } = stats;

  let healthScore = 70;
  let healthStatus = 'Good';

  // Calculate Health Score
  if (savingsRate >= 30) {
    healthScore += 20;
  } else if (savingsRate >= 15) {
    healthScore += 10;
  } else if (savingsRate < 0) {
    healthScore -= 25;
  }

  if (monthlyBudget && monthlyBudget > 0) {
    const budgetUsage = (currentMonthExpenses / monthlyBudget) * 100;
    if (budgetUsage > 100) {
      healthScore -= 15;
    } else if (budgetUsage <= 80) {
      healthScore += 10;
    }
  }

  // Deduct for category budgets exceeded
  const exceededCategoryBudgets = categoryBudgets.filter((b) => b.usagePct >= 100);
  if (exceededCategoryBudgets.length > 0) {
    healthScore -= 10 * exceededCategoryBudgets.length;
  }

  // Forecast Impact on Health Score
  if (forecast) {
    if (forecast.forecastedBalance < 0) {
      healthScore -= 20;
    } else if (forecast.expectedExpenses > forecast.expectedIncome) {
      healthScore -= 10;
    }
  }

  if (totalIncome === 0 && totalExpenses > 0) {
    healthScore = 35;
    healthStatus = 'Needs Attention';
  } else if (healthScore >= 85) {
    healthStatus = 'Excellent';
  } else if (healthScore >= 65) {
    healthStatus = 'Good';
  } else if (healthScore >= 45) {
    healthStatus = 'Needs Attention';
  } else {
    healthStatus = 'Critical';
  }

  healthScore = Math.max(10, Math.min(100, healthScore));

  // 1. Financial Health Summary
  let summary = '';
  if (savingsRate > 20) {
    summary = `Your financial health is strong with a ${savingsRate}% savings rate. Your income of ₹${totalIncome.toLocaleString('en-IN')} comfortably covers your total expenses of ₹${totalExpenses.toLocaleString('en-IN')}.`;
  } else if (netBalance >= 0) {
    summary = `You are maintaining a positive net balance of ₹${netBalance.toLocaleString('en-IN')}, but your savings rate is ${savingsRate}%. Trimming high spending categories could accelerate your savings goals.`;
  } else {
    summary = `Your total expenses (₹${totalExpenses.toLocaleString('en-IN')}) exceed your recorded income by ₹${Math.abs(netBalance).toLocaleString('en-IN')}. Immediate expense reduction is recommended.`;
  }

  // 2. Spending Analysis
  const spendingAnalysis = [];
  if (highestCategory && highestCategory.amount > 0) {
    spendingAnalysis.push(
      `Your largest spending category is ${highestCategory.category}, accounting for ₹${highestCategory.amount.toLocaleString('en-IN')} (${highestCategory.percentage}% of total expenses).`
    );
  }

  if (forecast && forecast.expectedExpenses > 0 && forecast.recurringExpenseTotal > 0) {
    const recPct = Math.round((forecast.recurringExpenseTotal / forecast.expectedExpenses) * 100);
    spendingAnalysis.push(
      `Your recurring expenses (₹${forecast.recurringExpenseTotal.toLocaleString('en-IN')}) account for approximately ${recPct}% of your expected monthly expenses.`
    );
  }

  categoryBudgets.forEach((b) => {
    if (b.usagePct >= 75) {
      spendingAnalysis.push(
        `Your ${b.category} category budget is currently ${b.usagePct}% used (₹${b.spent.toLocaleString('en-IN')} spent of ₹${b.limit.toLocaleString('en-IN')} limit).`
      );
    }
  });

  if (monthlyTrends.length >= 2) {
    const lastMonth = monthlyTrends[monthlyTrends.length - 1];
    const prevMonth = monthlyTrends[monthlyTrends.length - 2];
    if (lastMonth && prevMonth && prevMonth.expense > 0) {
      const diff = lastMonth.expense - prevMonth.expense;
      const pctChange = ((diff / prevMonth.expense) * 100).toFixed(1);
      if (diff > 0) {
        spendingAnalysis.push(
          `Monthly expenses increased by ${pctChange}% in ${lastMonth.month} (₹${lastMonth.expense.toLocaleString('en-IN')}) compared to ${prevMonth.month}.`
        );
      } else if (diff < 0) {
        spendingAnalysis.push(
          `Great job! Monthly expenses decreased by ${Math.abs(pctChange)}% in ${lastMonth.month} compared to ${prevMonth.month}.`
        );
      }
    }
  }

  // 3. Positive Habits
  const positiveHabits = [];
  if (savingsRate > 15) {
    positiveHabits.push(`Consistently maintaining a high savings rate of ${savingsRate}%.`);
  }
  if (monthlyBudget && currentMonthExpenses <= monthlyBudget) {
    positiveHabits.push(
      `Keeping current month spending (₹${currentMonthExpenses.toLocaleString('en-IN')}) within your ₹${monthlyBudget.toLocaleString('en-IN')} monthly budget.`
    );
  }
  if (forecast && forecast.expectedSavings > 0) {
    positiveHabits.push(
      `Financial forecast projects positive monthly net savings of ₹${forecast.expectedSavings.toLocaleString('en-IN')} next month.`
    );
  }
  categoryBudgets.forEach((b) => {
    if (b.usagePct < 75) {
      positiveHabits.push(`Well-controlled ${b.category} budget (${b.usagePct}% utilized).`);
    }
  });
  savingsGoals.forEach((g) => {
    if (g.progressPct >= 50) {
      positiveHabits.push(`Significant progress (${g.progressPct}%) achieved towards target goal: ${g.name}.`);
    }
  });
  if (positiveHabits.length === 0) {
    positiveHabits.push('Tracking your transactions regularly to build financial clarity.');
  }

  // 4. Areas of Concern
  const areasOfConcern = [];
  if (forecast && forecast.warnings && forecast.warnings.length > 0) {
    forecast.warnings.forEach((w) => {
      areasOfConcern.push(w.message);
    });
  }
  categoryBudgets.forEach((b) => {
    if (b.usagePct >= 100) {
      areasOfConcern.push(
        `Over Budget Alert: ${b.category} category spending has exceeded limit by ₹${Math.abs(b.remaining).toLocaleString('en-IN')} (${b.usagePct}% used).`
      );
    } else if (b.usagePct >= 90) {
      areasOfConcern.push(
        `Warning: ${b.category} category budget is near limit at ${b.usagePct}% (only ₹${b.remaining.toLocaleString('en-IN')} remaining).`
      );
    }
  });
  if (highestCategory && Number(highestCategory.percentage) > 35) {
    areasOfConcern.push(
      `${highestCategory.category} represents ${highestCategory.percentage}% of your total spending.`
    );
  }
  if (netBalance < 0) {
    areasOfConcern.push(
      `Deficit spending detected: Expenses exceed income by ₹${Math.abs(netBalance).toLocaleString('en-IN')}.`
    );
  }
  if (areasOfConcern.length === 0) {
    areasOfConcern.push('No critical spending anomalies detected. Keep monitoring non-essential expenses.');
  }

  // 5. Personalized Recommendations
  const personalizedRecommendations = [];
  if (forecast && forecast.expectedSavings < 0) {
    personalizedRecommendations.push(
      'Your current forecast suggests you may need to reduce discretionary spending to stay on track with your financial targets.'
    );
  }
  savingsGoals.forEach((g) => {
    if (!g.isCompleted) {
      personalizedRecommendations.push(
        `To reach your "${g.name}" goal (₹${g.targetAmount.toLocaleString('en-IN')}), current progress is ${g.progressPct}% (₹${g.remainingAmount.toLocaleString('en-IN')} remaining).`
      );
    }
  });
  if (highestCategory) {
    personalizedRecommendations.push(
      `Reducing ${highestCategory.category} expenses by ₹${Math.round(highestCategory.amount * 0.15).toLocaleString('en-IN')}/month will help you fund your active savings goals faster.`
    );
  }
  if (!monthlyBudget) {
    personalizedRecommendations.push(
      'Configure an overall monthly expense budget in Settings to enable real-time limit tracking.'
    );
  }
  if (personalizedRecommendations.length < 3) {
    personalizedRecommendations.push(
      'Review small category expenses weekly to identify potential subscription or impulse savings.'
    );
  }

  // 6. Suggested Savings Goal
  const activeGoal = savingsGoals.find((g) => !g.isCompleted);
  const targetMonthlySavings = totalIncome > 0 ? Math.round(totalIncome * 0.25) : 5000;

  const suggestedSavingsGoal = activeGoal
    ? {
        targetMonthlySavings: activeGoal.targetAmount,
        description: `Active Goal "${activeGoal.name}": Target ₹${activeGoal.targetAmount.toLocaleString('en-IN')} (${activeGoal.progressPct}% completed, ₹${activeGoal.remainingAmount.toLocaleString('en-IN')} remaining).`
      }
    : {
        targetMonthlySavings,
        description: `Target saving ₹${targetMonthlySavings.toLocaleString('en-IN')} monthly (approx 25% of monthly income) based on your income and expense patterns.`
      };

  return {
    financialHealthSummary: summary,
    healthScore,
    healthStatus,
    spendingAnalysis,
    positiveHabits,
    areasOfConcern,
    personalizedRecommendations,
    suggestedSavingsGoal
  };
};

module.exports = {
  generateInsights
};
