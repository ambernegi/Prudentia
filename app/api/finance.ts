import { NextRequest, NextResponse } from "next/server";

function getAllocation(investments: any) {
  const total =
    (investments?.gold || 0) +
    (investments?.realEstate || 0) +
    (investments?.rsu || 0) +
    (investments?.esops || 0) +
    (investments?.other || 0) +
    (investments?.mutualFunds?.reduce((sum: number, mf: any) => sum + (mf.amount || 0), 0) || 0);
  if (!total) return null;
  return {
    gold: ((investments.gold || 0) / total) * 100,
    realEstate: ((investments.realEstate || 0) / total) * 100,
    mutualFunds: ((investments.mutualFunds?.reduce((sum: number, mf: any) => sum + (mf.amount || 0), 0) || 0) / total) * 100,
    rsu: ((investments.rsu || 0) / total) * 100,
    esops: ((investments.esops || 0) / total) * 100,
    other: ((investments.other || 0) / total) * 100,
  };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Received finance data:", data);

    let recommendation = "";
    let persona = "";
    let idealStrategy = "";
    let comparison = "";
    let currentAllocation = null;
    let idealAllocation = null;
    let idealInstruments = [];
    let idealStory = "";

    if (data.riskQuiz) {
      const { ageGroup, answers } = data.riskQuiz;
      currentAllocation = getAllocation(data.investments);
      // Persona logic based on allocation
      if (currentAllocation) {
        if (currentAllocation.gold > 40) {
          persona = "Gold Heavy Conservative";
        } else if (currentAllocation.mutualFunds > 50) {
          persona = "Balanced Mutual Fund Investor";
        } else if (currentAllocation.rsu + currentAllocation.esops > 30) {
          persona = "Equity-Linked Aggressive";
        } else if (currentAllocation.realEstate > 40) {
          persona = "Real Estate Focused";
        } else {
          persona = "Diversified Moderate";
        }
      } else {
        persona = "No Significant Investments";
      }
      // Ideal persona and allocation
      if (ageGroup === '18-25') {
        idealAllocation = {
          largeCap: 30,
          smallCap: 25,
          midCap: 45,
        };
        idealInstruments = [
          { name: "Large Cap Mutual Funds", desc: "Consistent SIPs in top-performing large cap funds." },
          { name: "Mid Cap Mutual Funds", desc: "Exposure to high-growth mid cap companies." },
          { name: "Small Cap Mutual Funds", desc: "Small allocation for higher risk/reward." },
        ];
        idealStory = "Started early with SIPs in diversified equity mutual funds, rebalanced annually, and avoided overexposure to gold/real estate.";
      } else if (ageGroup === '26-35') {
        idealAllocation = {
          equity: 60,
          debt: 20,
          gold: 10,
          realEstate: 10,
        };
        idealInstruments = [
          { name: "Index Funds", desc: "Low-cost, broad market exposure." },
          { name: "ELSS", desc: "Tax-saving equity funds." },
          { name: "PPF/EPF", desc: "Safe, long-term debt instruments." },
        ];
        idealStory = "Maximized equity exposure, used ELSS for tax savings, and maintained a small gold/real estate allocation.";
      } else {
        idealAllocation = {
          equity: 40,
          debt: 40,
          gold: 10,
          realEstate: 10,
        };
        idealInstruments = [
          { name: "Balanced Advantage Funds", desc: "Dynamic allocation between equity and debt." },
          { name: "PPF/EPF", desc: "Safe, long-term debt instruments." },
          { name: "REITs", desc: "Real estate exposure with liquidity." },
        ];
        idealStory = "Maintained a balanced portfolio, rebalanced annually, and avoided concentration in any one asset class.";
      }
      // Ideal persona
      const idealPersona = ageGroup === '18-25' ? "Young High-Growth Investor" : ageGroup === '26-35' ? "Growth-Oriented Professional" : "Balanced Wealth Builder";
      // Recommendation
      recommendation = `Compare your current allocation to the ideal for your profile. Consider shifting towards: ${Object.entries(idealAllocation).map(([k, v]) => `${v}% ${k}`).join(', ')}.`;
      // Comparison
      comparison = `Your current persona: ${persona}. Ideal persona: ${idealPersona}.`;
      idealStrategy = `Ideal instruments: ${idealInstruments.map(i => i.name).join(', ')}. How they did it: ${idealStory}`;
    } else {
      recommendation = "Please complete the risk assessment quiz for personalized recommendations.";
      persona = "Unknown";
      idealStrategy = "Unknown";
      comparison = "Unknown";
    }

    return NextResponse.json({
      success: true,
      recommendation: recommendation || "No recommendation generated.",
      persona: persona || "Unknown",
      idealStrategy: idealStrategy || "Unknown",
      comparison: comparison || "Unknown"
    });
  } catch (err) {
    console.error("Error in /api/finance:", err);
    return NextResponse.json({
      success: false,
      recommendation: "An error occurred while generating your recommendation.",
      persona: "Unknown",
      idealStrategy: "Unknown",
      comparison: "Unknown"
    }, { status: 500 });
  }
} 