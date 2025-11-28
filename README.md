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
