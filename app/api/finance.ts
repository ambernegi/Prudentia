import { NextRequest, NextResponse } from "next/server";
import { getUserPersona, DTILevel, KnowledgeLevel, Behaviour, Reaction } from "../../utils/persona";

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
    total,
    gold: ((investments.gold || 0) / total) * 100,
    realEstate: ((investments.realEstate || 0) / total) * 100,
    mutualFunds: ((investments.mutualFunds?.reduce((sum: number, mf: any) => sum + (mf.amount || 0), 0) || 0) / total) * 100,
    rsu: ((investments.rsu || 0) / total) * 100,
    esops: ((investments.esops || 0) / total) * 100,
    other: ((investments.other || 0) / total) * 100,
  };
}

function normaliseAgeGroup(rawAgeGroup: string | undefined | null): string {
  if (!rawAgeGroup) return "";
  // The quiz uses labels like '18–25 years (Early Career)'
  if (rawAgeGroup.startsWith("18")) return "18–25";
  if (rawAgeGroup.startsWith("26")) return "26–35";
  if (rawAgeGroup.startsWith("36")) return "36–50";
  if (rawAgeGroup.startsWith("51")) return "51–65";
  if (rawAgeGroup.toLowerCase().startsWith("over") || rawAgeGroup.startsWith("65")) {
    return "65+";
  }
  return rawAgeGroup;
}

function deriveRiskProfileFromQuiz(riskQuiz: any): {
  riskBand: "Conservative" | "Balanced" | "Aggressive";
  knowledge: KnowledgeLevel;
  behaviour: Behaviour;
  reaction: Reaction;
  ageGroupLabel: string;
} {
  const ageGroupLabel = riskQuiz.ageGroup || "";

  // Map quiz knowledge level string into our enum
  let knowledge: KnowledgeLevel = "Moderate";
  const rawKnowledge: string = riskQuiz.knowledgeLevel || riskQuiz.knowledge || "";
  if (rawKnowledge.toLowerCase().includes("minimal")) knowledge = "Minimal";
  else if (rawKnowledge.toLowerCase().includes("advanced")) knowledge = "Advanced";

  // Map investment attitude into behavioural band
  let riskBand: "Conservative" | "Balanced" | "Aggressive" = "Balanced";
  const attitude: string = riskQuiz.investmentAttitude || "";
  if (attitude.includes("avoid risk") || attitude.includes("guaranteed")) {
    riskBand = "Conservative";
  } else if (attitude.includes("significant risk")) {
    riskBand = "Aggressive";
  } else {
    riskBand = "Balanced";
  }

  // Market downturn reaction → Reaction enum
  let reaction: Reaction = "Hold";
  const downturn: string = riskQuiz.marketDownturn || "";
  if (downturn.startsWith("Sell all")) reaction = "Sell";
  else if (downturn.startsWith("Sell a portion")) reaction = "Sell/Unsure";
  else if (downturn.startsWith("Do nothing")) reaction = "Hold";
  else if (downturn.startsWith("Invest more")) reaction = "Buy More";
  else if (downturn === "Unsure") reaction = "Unsure";

  // Behaviour – loosely tie to attitude + reaction
  let behaviour: Behaviour = "Moderate";
  if (riskBand === "Conservative") behaviour = "Cautious";
  else if (riskBand === "Aggressive") behaviour = "Aggressive";

  return {
    riskBand,
    knowledge,
    behaviour,
    reaction,
    ageGroupLabel,
  };
}

type StrategyBand = "Conservative" | "Balanced" | "Aggressive";

function buildStrategies(params: {
  riskBand: StrategyBand;
  ageGroup: string;
  allocation: ReturnType<typeof getAllocation> | null;
}) {
  const { riskBand, ageGroup, allocation } = params;

  // Base suggestions by band
  const base: Record<
    StrategyBand,
    {
      label: string;
      allocation: Record<string, number>;
      instruments: string[];
      notes: string;
    }
  > = {
    Conservative: {
      label: "Capital Protection & Income",
      allocation: { equity: 20, debt: 55, gold: 15, realEstate: 10 },
      instruments: [
        "Short‑duration debt funds / high‑quality bond funds",
        "PPF / EPF / SSY as applicable",
        "Target‑maturity gilt or PSU funds",
        "Gold ETFs or sovereign gold bonds for hedge",
      ],
      notes:
        "Focus on predictable income and capital protection. Equity is used mainly to beat inflation, not to maximise returns.",
    },
    Balanced: {
      label: "Balanced Growth",
      allocation: { equity: 50, debt: 30, gold: 10, realEstate: 10 },
      instruments: [
        "Broad‑market index funds (Nifty 50 / Sensex)",
        "Aggressive hybrid or balanced‑advantage funds",
        "PPF / EPF / high‑quality debt funds",
        "Gold ETFs and possibly REITs for diversification",
      ],
      notes:
        "A mix of equity and fixed‑income to balance growth and stability. Periodic rebalancing is key to staying on track.",
    },
    Aggressive: {
      label: "High‑Growth Compounding",
      allocation: { largeCap: 35, midCap: 30, smallCap: 20, debt: 10, gold: 5 },
      instruments: [
        "Large‑cap and flexi‑cap index funds",
        "Focused mid‑cap / small‑cap funds with SIPs",
        "A small satellite portfolio in factor / thematic funds",
        "Short‑duration debt funds for emergencies",
      ],
      notes:
        "Maximise long‑term equity exposure while controlling downside via diversification and a clear emergency corpus.",
    },
  };

  const core = base[riskBand];

  // Mild tilt based on age
  const isYoung = ageGroup === "18–25" || ageGroup === "26–35";
  const isOlder = ageGroup === "51–65" || ageGroup === "65+";

  const ageTiltNote =
    isYoung
      ? "Given your age, you can afford a higher allocation to growth assets (equity) provided your emergency and insurance needs are covered."
      : isOlder
      ? "Given your stage of life, gradually increase allocation to debt and income‑oriented products to protect capital."
      : "You are in a prime wealth‑accumulation phase; keep a balanced approach but avoid concentration in illiquid assets.";

  // Optional comparison to current portfolio if we have it
  let comparisonNote = "";
  if (allocation) {
    const currentEquity =
      (allocation.mutualFunds || 0) + (allocation.rsu || 0) + (allocation.esops || 0);
    const currentDebt = 0; // FDs could be treated as debt on the client side if needed
    const currentGold = allocation.gold || 0;
    const currentRE = allocation.realEstate || 0;

    comparisonNote =
      `Your current mix looks roughly like: ` +
      `${currentEquity.toFixed(1)}% in equity‑linked assets, ` +
      `${currentGold.toFixed(1)}% in gold, ` +
      `${currentRE.toFixed(1)}% in real estate. ` +
      `Compare this with the suggested model and adapt gradually over 12–24 months instead of all at once.`;
  }

  return {
    primary: {
      title: core.label,
      targetAllocation: core.allocation,
      instruments: core.instruments,
      narrative: `${core.notes} ${ageTiltNote}`,
    },
    implementationTips: [
      "Use monthly SIPs rather than lump‑sum investments unless you are rebalancing a very under‑allocated asset.",
      "Ring‑fence 6–12 months of expenses in liquid or ultra‑short‑term funds before adding risk.",
      "Review once a year; if any asset class drifts more than ±5–10% from target, rebalance slowly.",
    ],
    comparisonNote,
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
    let detailedStrategies: any = null;

    if (data.riskQuiz) {
      // The client currently posts `riskQuiz` as a flat object with all answers
      const riskQuiz = data.riskQuiz;

      currentAllocation = getAllocation(data.investments);

      // Derive risk band, behaviour, reaction & age group label from quiz answers
      const profileFromQuiz = deriveRiskProfileFromQuiz(riskQuiz);
      const ageGroupNormalized = normaliseAgeGroup(profileFromQuiz.ageGroupLabel);

      // Estimate simple DTI band from provided debt + income if available
      let dtiBand: DTILevel = "<36%";
      if (data.income && data.debt && Array.isArray(data.debt.loans)) {
        const monthlyIncome =
          (Number(data.income.inhandIncome) || 0) + (Number(data.income.otherIncome) || 0);
        const annualIncome = monthlyIncome * 12;
        const totalDebtOutstanding = data.debt.loans.reduce(
          (sum: number, loan: any) => sum + (Number(loan.principal) || 0),
          0
        );
        const ratio = annualIncome > 0 ? totalDebtOutstanding / annualIncome : 0;
        if (ratio < 0.36) dtiBand = "<36%";
        else if (ratio < 0.43) dtiBand = "36–43%";
        else if (ratio < 0.5) dtiBand = "43–50%";
        else dtiBand = "≥50%";
      }

      // Use shared persona engine for a richer label
      const personaResult = getUserPersona({
        ageGroup: profileFromQuiz.ageGroupLabel || ageGroupNormalized,
        dti: dtiBand,
        knowledge: profileFromQuiz.knowledge,
        behaviour: profileFromQuiz.behaviour,
        reaction: profileFromQuiz.reaction,
      });

      persona = `${personaResult.code} – ${personaResult.label}`;

      // Build strategy set from risk band + age + allocation
      detailedStrategies = buildStrategies({
        riskBand: profileFromQuiz.riskBand,
        ageGroup: ageGroupNormalized,
        allocation: currentAllocation,
      });

      // Backwards‑compatible summary strings
      recommendation =
        detailedStrategies?.primary?.narrative ||
        "Compare your current allocation to the suggested model and gradually rebalance over time.";

      const targetAllocSummary = detailedStrategies?.primary?.targetAllocation
        ? Object.entries(detailedStrategies.primary.targetAllocation)
            .map(([k, v]) => `${v}% ${k}`)
            .join(", ")
        : "";

      idealStrategy = `Suggested target allocation: ${targetAllocSummary}. Key instruments: ${
        detailedStrategies?.primary?.instruments?.join(", ") ?? ""
      }.`;

      comparison =
        detailedStrategies?.comparisonNote ||
        "Use this as a guiding model; adapt based on your cash‑flow needs and comfort.";
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
      comparison: comparison || "Unknown",
      strategies: detailedStrategies || undefined,
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