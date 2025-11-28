## Finance Sage – Overview

Finance Sage is a Next.js app that guides Indian investors from raw financial data (income, expenses, debt, investments) to a clear **persona‑driven financial plan**.

The main entry point is `app/page.tsx`, which contains:

- A multi‑step intake flow (income, debt, expenses, investments, SIPs)
- A dashboard that computes key metrics (DTI, net worth, savings rate, asset mix)
- A **risk & behaviour quiz** that feeds into a persona engine and strategy planner

Run the dev server with:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Risk Quiz & Persona Model

The risk / behaviour quiz lives in `app/page.tsx` as the `RiskQuiz` component.  
It asks a **minimal, high‑signal set of questions** and returns a structured result:

- **Age / life stage** (`ageGroup`)
- **Self‑rated knowledge** + **products used** → `knowledge` (`Minimal | Moderate | Advanced`)
- **Goal, horizon, volatility comfort** → `behaviour` (`Cautious | Moderate | Aggressive`)
- **Reaction to a 20% drawdown** → `reaction` (`Sell | Hold | Buy More | Unsure | Sell/Unsure`)

These are wrapped in:

- `QuizPersonaSummary` (ageGroup, knowledge, behaviour, reaction)
- `QuizResult` (the summary + raw quiz answers)

`QuizResult` is passed back to `Home` and then into the `Dashboard` component as `quizResult`.  
The dashboard also calculates **DTI buckets** from actual numbers:

- `<36%`, `36–43%`, `43–50%`, `≥50%`

The persona engine in `utils/persona.ts` exposes:

- `getUserPersona(input: PersonaInput): PersonaResult`

Where `PersonaInput` includes:

- `ageGroup`
- `dti`
- `knowledge`
- `behaviour`
- `reaction`

The dashboard combines **quiz‑derived behaviour** and **dashboard‑derived DTI/income/loans** to produce a final persona.

### Persona Dimensions Table

The persona used by `getUserPersona` is determined by five dimensions. The table below shows how each dimension is populated:

| **Dimension** | **Type / Values** | **Source** | **Meaning** |
| --- | --- | --- | --- |
| `ageGroup` | String; e.g. `18–25 years (Early Career)`, `26–35 years (Emerging Accumulator)`, `36–50 years (Established Professional)`, `51–65 years (Pre-Retirement)`, `Over 65 years (Retiree or Late Stage)` | Risk quiz (Q1) | Captures life stage and typical financial context. |
| `dti` | `'<36%' \| '36–43%' \| '43–50%' \| '≥50%'` | Dashboard calculation (total debt ÷ annual income) | Measures leverage and repayment pressure. Lower is healthier. |
| `knowledge` | `'Minimal' \| 'Moderate' \| 'Advanced'` | Risk quiz (self‑rated knowledge + products used) | Investor’s understanding of instruments and comfort managing them. |
| `behaviour` | `'Cautious' \| 'Moderate' \| 'Aggressive'` | Risk quiz (goals, time horizon, volatility comfort) | How much risk the investor is willing to take to pursue returns. |
| `reaction` | `'Sell' \| 'Hold' \| 'Buy More' \| 'Unsure' \| 'Sell/Unsure' \| 'Hold/Buy More'` | Risk quiz (20% drawdown reaction) | Emotional/behavioural response to drawdowns and volatility. |

Internally, `getUserPersona` maps these dimensions into **age‑banded persona codes** (e.g. `A1`–`A12` for 18–25, `B1`–`B10` for 26–35, etc.), each with a label and description such as:

| **Code (example)** | **Typical profile** | **High‑level description** |
| --- | --- | --- |
| `A1` | Young, low debt, conservative, just starting | “You are starting your financial journey with low debt and a conservative approach.” |
| `B3` | 26–35, low DTI, moderate/advanced knowledge, aggressive | “Financially strong, confident investor.” |
| `C1` | 36–50, stable income, moderate knowledge, prudent | “Stable earner with prudent risk management.” |
| `D1` | 51–65, low DTI, conservative | “Conservative, solid finances, prepping for retirement.” |
| `E1` | 65+, low/no debt, very risk‑averse | “Low or no debt, avoids risk, focuses on preserving capital.” |

All persona codes in `utils/persona.ts` follow the pattern: **age band (A–E)** × **DTI band** × **knowledge** × **behaviour** × **reaction**, resulting in a concise label and narrative description that the dashboard can surface next to the strategy plan.

### Persona Code Mapping (Full Table)

The table below enumerates all persona codes currently defined in `utils/persona.ts`, along with the input combination that produces each code.

| **Code** | **Age band** | **DTI** | **Knowledge** | **Behaviour** | **Reaction** | **Label (summary)** |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | 18–25 | `<36%` | Minimal | Cautious | Sell or Unsure | Low debt, conservative, just starting out. |
| A2 | 18–25 | `36–43%` | Minimal | Moderate | Hold | Student/saver, balances small loan & risk. |
| A3 | 18–25 | `43–50%` | Moderate | Cautious | Hold | Somewhat high debt, careful but informed. |
| A4 | 18–25 | `≥50%` | Moderate | Aggressive | Buy More | High debt, but aggressive risk taker. |
| A5 | 18–25 | `<36%` | Advanced | Aggressive | Buy More | Rare case, high skill and low debt. |
| A6 | 18–25 | `≥50%` | Minimal or Moderate | Cautious | Sell or Unsure | Financially stretched, struggles with volatility. |
| A7 | 18–25 | `<36%` | Minimal | Moderate | Hold or Unsure | Low debt, learning, open to moderate risk. |
| A8 | 18–25 | `<36%` | Moderate | Moderate | Hold | Low debt, some experience, steady approach. |
| A9 | 18–25 | `36–43%` | Minimal | Cautious | Sell or Unsure | Moderate debt, cautious, needs guidance. |
| A10 | 18–25 | `43–50%` | Minimal | Aggressive | Buy More | High risk, low knowledge, vulnerable. |
| A11 | 18–25 | `≥50%` | Advanced | Aggressive | Buy More | Exceptionally rare, high risk, high skill, high leverage. |
| A12 | 18–25 | `43–50%` | Advanced | Moderate | Hold or Buy More | Young, skilled, but over‑leveraged. |
| B1 | 26–35 | `≥50%` | Minimal | Cautious | Sell | Young family, heavy loans, low risk appetite. |
| B2 | 26–35 | `43–50%` | Moderate | Moderate | Hold | Growing family, higher loans, decent control. |
| B3 | 26–35 | `<36%` | Moderate | Aggressive | Buy More | Financially strong, confident investor. |
| B4 | 26–35 | `36–43%` | Advanced | Aggressive | Buy More | Entrepreneur, high income, accepts risk & leverage. |
| B5 | 26–35 | `≥50%` | Advanced | Aggressive | Hold or Buy More | High risk, skilled, at credit limits. |
| B6 | 26–35 | `36–43%` | Minimal | Moderate | Hold or Unsure | Moderate debt, learning, open to risk. |
| B7 | 26–35 | `43–50%` | Minimal | Aggressive | Buy More | Risky, low knowledge, high leverage. |
| B8 | 26–35 | `<36%` | Advanced | Cautious | Hold or Unsure | Expert, but prefers safety. |
| B9 | 26–35 | `≥50%` | Moderate | Aggressive | Buy More | High leverage, moderate skill, aggressive. |
| B10 | 26–35 | `43–50%` | Advanced | Cautious | Sell or Unsure | High debt, skilled but cautious. |
| C1 | 36–50 | `<36%` | Moderate | Moderate | Hold | Stable earner, prudent risk management. |
| C2 | 36–50 | `36–43%` | Advanced | Aggressive | Buy More | Professional, tactically uses debt for wealth creation. |
| C3 | 36–50 | `43–50%` | Advanced | Moderate | Hold | High DTI, but experience helps manage risk. |
| C4 | 36–50 | `≥50%` | Moderate or Advanced | Cautious | Sell or Unsure | Stressed, at risk of financial strain, cautious. |
| C5 | 36–50 | `<36%` | Minimal | Cautious | Hold or Unsure | Low debt, cautious, prefers stability. |
| C6 | 36–50 | `36–43%` | Minimal | Moderate | Hold or Unsure | Moderate debt, learning, open to risk. |
| C7 | 36–50 | `43–50%` | Minimal | Aggressive | Buy More | Risky, low knowledge, high leverage. |
| C8 | 36–50 | `≥50%` | Advanced | Aggressive | Buy More | Exceptionally rare, high risk, high skill, high leverage. |
| C9 | 36–50 | `43–50%` | Advanced | Cautious | Sell or Unsure | High debt, skilled but cautious. |
| D1 | 51–65 | `<36%` | Moderate | Cautious | Hold | Conservative, solid finances, prepping for retirement. |
| D2 | 51–65 | `36–43%` | Advanced | Moderate | Hold or Buy More | Still optimizing, but aware of limits. |
| D3 | 51–65 | `≥50%` | Minimal or Moderate | Cautious | Sell | Late‑career, high DTI, prioritizes stability. |
| D4 | 51–65 | `<36%` | Advanced | Cautious | Hold or Unsure | Expert, but prefers safety. |
| D5 | 51–65 | `36–43%` | Minimal | Moderate | Hold or Unsure | Moderate debt, learning, open to risk. |
| D6 | 51–65 | `43–50%` | Minimal | Aggressive | Buy More | Risky, low knowledge, high leverage. |
| D7 | 51–65 | `≥50%` | Advanced | Aggressive | Buy More | Exceptionally rare, high risk, high skill, high leverage. |
| D8 | 51–65 | `43–50%` | Advanced | Cautious | Sell or Unsure | High debt, skilled but cautious. |
| E1 | 65+ | `<36%` | Minimal | Cautious | Sell | Low/no debt, avoids risk, preserves capital. |
| E2 | 65+ | `36–43%` | Moderate | Cautious | Hold or Unsure | Light debt, manages with care, income focus. |
| E3 | 65+ | `≥50%` | Advanced | Moderate | Hold or Buy More | Exceptionally financially active, takes measured risks. |
| E4 | 65+ | `36–43%` | Minimal | Moderate | Hold or Unsure | Moderate debt, learning, open to risk. |
| E5 | 65+ | `43–50%` | Minimal | Aggressive | Buy More | Risky, low knowledge, high leverage. |
| E6 | 65+ | `<36%` | Advanced | Cautious | Hold or Unsure | Expert, but prefers safety. |
| E7 | 65+ | `≥50%` | Advanced | Aggressive | Buy More | Exceptionally rare, high risk, high skill, high leverage. |
| E8 | 65+ | `43–50%` | Advanced | Cautious | Sell or Unsure | High debt, skilled but cautious. |

## Strategy Plan Generation

Inside the `Dashboard` function in `app/page.tsx`, we take:

- Persona inputs (ageGroup, dti, knowledge, behaviour, reaction)
- Core metrics from the dashboard:
  - `totalIncome`, `totalMonthlyExpenses`, `monthlySavings`, `savingsRate`
  - `totalDebt`, `totalInvestments`

and build a **three‑phase strategy plan** via `buildStrategyPlan()`:

- **Foundation Builder Plan**
  - Triggered when knowledge is minimal, DTI is high, or savings are low/negative
  - Focus: stabilise cash flow, reduce high‑cost debt, and start simple low‑volatility investing
- **Disciplined Accumulator Plan**
  - Default for moderate knowledge, moderate DTI, and reasonable savings rate
  - Focus: emergency buffer, goal‑aligned SIPs, steady periodic reviews
- **Confident Optimizer Plan**
  - Triggered when knowledge is advanced, DTI is low, and savings rate is strong
  - Focus: diversification (including international), tax efficiency, and controlled “satellite” risk

Each plan has:

- A `name` and `headline`
- Three **phases**, each with:
  - `title`
  - `summary`
  - Concrete bullet‑point actions (often parameterised by the user’s actual savings rate and monthly surplus)

This `strategyPlan` is rendered in the dashboard as a **“Strategy Plan”** card with three columns (one per phase).

## Extending the Model

- To adjust persona logic, edit `utils/persona.ts` and/or the mapping inside `RiskQuiz`.
- To tweak strategy thresholds (e.g. what counts as “high” DTI or “strong” savings), edit `buildStrategyPlan` in `app/page.tsx`.
- To add more nuanced personas, you can:
  - Introduce additional quiz questions
  - Map more granular reactions into the existing `Reaction` union
  - Add more rows to the `getUserPersona` decision table.
