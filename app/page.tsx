"use client";
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel, 
  Checkbox, 
  FormGroup, 
  Select, 
  MenuItem, 
  InputLabel, 
  Card, 
  CardContent, 
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Container,
  Stack,
  Avatar,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { 
  SelectChangeEvent 
} from '@mui/material/Select';
import {
  AccountBalance,
  TrendingUp,
  Assessment,
  Security,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  RadioButtonUnchecked,
  RadioButtonChecked,
  Add,
  Remove,
  Calculate,
  AttachMoney,
  Home as HomeIcon,
  School,
  LocalHospital,
  Celebration,
  Business,
  Person,
  FamilyRestroom,
  Elderly,
  ChildCare,
  Work,
  School as SchoolIcon,
  LocalHospital as HealthIcon,
  Celebration as WeddingIcon,
  Business as BusinessIcon,
  HealthAndSafety,
  Favorite,
  FavoriteBorder,
  Error as ErrorIcon
} from '@mui/icons-material';
import { getUserPersona, DTILevel, KnowledgeLevel, Behaviour, Reaction } from '../utils/persona';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Types for each step
interface IncomeData {
  inhandIncome: number | string;
  otherIncome: number | string;
}

interface InvestmentData {
  gold: number | string;
  realEstate: number | string;
  mutualFunds: { name: string; amount: number }[];
  rsu: number | string;
  esops: number | string;
  other: number | string;
  fd: number | string;
}

interface ExpensesData {
  monthlyExpenses: number | string;
}

interface RiskQuizData {
  knowledge: string;
  appetite: string;
}

interface SIP {
  name: string;
  amount: number;
}

interface FormData {
  income: IncomeData;
  investments: InvestmentData;
  expenses: ExpensesData;
  risk: RiskQuizData;
  debt: { hasDebt: string; loans: { type: string; principal: string; interest: string; tenure: string; tenureValue: string; tenureType: string }[] };
  savingsRate: string;
  recurringInvestments: SIP[];
}

const defaultForm: FormData = {
  income: { inhandIncome: '', otherIncome: '' },
  investments: {
    gold: '',
    realEstate: '',
    mutualFunds: [],
    rsu: '',
    esops: '',
    other: '',
    fd: '',
  },
  expenses: { monthlyExpenses: '' },
  risk: { knowledge: "", appetite: "" },
  debt: { hasDebt: '', loans: [] },
  savingsRate: '',
  recurringInvestments: [],
};

type Step = 0 | 1 | 2 | 3 | 4 | 5;

type ViewMode = "form" | "dashboard" | "riskQuiz";

// Pie chart helper
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  const radius = 48;
  const cx = 60, cy = 60;
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; percent: string; value: string } | null>(null);

  const handleMouseMove = (e: React.MouseEvent, i: number, percent: string, label: string, value: string) => {
    const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label,
        percent,
        value
      });
    }
    setHovered(i);
  };
  const handleMouseLeave = () => {
    setHovered(null);
    setTooltip(null);
  };

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {data.map((slice, i) => {
          const startAngle = (cumulative / total) * 2 * Math.PI;
          const endAngle = ((cumulative + slice.value) / total) * 2 * Math.PI;
          const x1 = cx + radius * Math.sin(startAngle);
          const y1 = cy - radius * Math.cos(startAngle);
          const x2 = cx + radius * Math.sin(endAngle);
          const y2 = cy - radius * Math.cos(endAngle);
          const largeArc = slice.value / total > 0.5 ? 1 : 0;
          const pathData = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
          const percent = total > 0 ? ((slice.value / total) * 100).toFixed(1) + '%' : '0%';
          const isHovered = hovered === i;
          const value = `₹${slice.value.toLocaleString()}`;
          cumulative += slice.value;
          return (
            <path
              key={i}
              d={pathData}
              fill={slice.color}
              stroke="#fff"
              strokeWidth={isHovered ? 3 : 1}
              style={{ cursor: 'pointer', opacity: isHovered ? 0.85 : 1 }}
              onMouseMove={e => handleMouseMove(e, i, percent, slice.label, value)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </svg>
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: '#222',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 13,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}
        >
          {tooltip.label}: {tooltip.percent} <br />{tooltip.value}
        </div>
      )}
    </div>
  );
}

// Add corpus calculation function
function calculateCorpus({ monthlyInvestment, years, rate }: { monthlyInvestment: number, years: number, rate: number }) {
  const n = years * 12;
  const r = rate / 12;
  // FV = P × [((1 + r)^n - 1) / r] × (1 + r)
  return monthlyInvestment * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

// Create a custom theme with Inter as the default font for body text
const theme = createTheme({
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
  },
});

export default function Home() {
  const [view, setView] = useState<ViewMode>("form");
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [mfName, setMfName] = useState("");
  const [mfAmount, setMfAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dashboardData, setDashboardData] = useState<FormData | null>(null);
  const [recommendation, setRecommendation] = useState<null | {
    recommendation: string;
    persona: string;
    idealStrategy: string;
    comparison: string;
    strategies?: any;
  }>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [quizData, setQuizData] = useState<{ ageGroup: string; answers: string[] } | null>(null);
  // Add state for mutual fund list
  const [mfList, setMfList] = useState<{schemeCode: string, schemeName: string}[]>([]);
  const [mfLoading, setMfLoading] = useState(false);
  const [mfError, setMfError] = useState<string | null>(null);
  // In the Home component, add state for income error:
  const [incomeError, setIncomeError] = useState<string | null>(null);
  // In the Home component, add state to track calculated EMIs and which are added to expenses:
  const [loanEMIs, setLoanEMIs] = useState<{ [idx: number]: number }>({});
  const [emiAdded, setEmiAdded] = useState<{ [idx: number]: boolean }>({});
  // In Home component, add state and handlers for SIPs:
  const [sipMfName, setSipMfName] = useState('');
  const [sipAmount, setSipAmount] = useState<number | ''>('');
  
  const addSip = () => {
    if (!sipMfName || !sipAmount || Number(sipAmount) <= 0) return;
    if (form.recurringInvestments.some(sip => sip.name === sipMfName)) return;
    setForm({
      ...form,
      recurringInvestments: [
        ...form.recurringInvestments,
        { name: sipMfName, amount: Number(sipAmount) },
      ],
    });
    setSipMfName('');
    setSipAmount('');
  };

  const removeSip = (idx: number) => {
    setForm({
      ...form,
      recurringInvestments: form.recurringInvestments.filter((_, i) => i !== idx),
    });
  };

  // Add missing state variables for RiskQuiz component
  const [demographics, setDemographics] = useState({
    ageGroup: ''
  });
  const [debt, setDebt] = useState({
    hasDebt: '',
    loans: []
  });
  const [knowledgeLevel, setKnowledgeLevel] = useState('');
  const [knowledgeAnswers, setKnowledgeAnswers] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [horizon, setHorizon] = useState('');
  const [savingsRate, setSavingsRate] = useState('');
  const [error, setError] = useState('');

  // Replace knowledgeQuestions and quiz structure with the new, rephrased set
  const demographicsQuestions = [
    {
      key: 'ageGroup',
      label: 'Age Group',
      type: 'radio',
      options: [
        '18–25 years (Early Career)',
        '26–35 years (Emerging Accumulator)',
        '36–50 years (Established Professional)',
        '51–65 years (Pre-Retirement)',
        'Over 65 years (Retiree or Late Stage)'
      ]
    }
  ];

  const debtQuestions = [
    {
      key: 'hasDebt',
      label: 'Do you currently have any outstanding debt or loans?',
      type: 'radio',
      options: ['No', 'Yes']
    }
    // If Yes, show loan details as before
  ];

  const knowledgeLevels = [
    'Minimal (Just starting, little experience)',
    'Moderate (Comfortable with basics, some experience)',
    'Advanced (Deep understanding; manage portfolio aggressively)'
  ];

  const minimalQuestions = [
    'Do you understand what mutual funds are?',
    'Have you ever invested in stocks or equity-related products?',
    'Do you know what SIP (Systematic Investment Plan) means?',
    'Are you aware of risks like market volatility, liquidity, and inflation?'
  ];

  const moderateQuestions = [
    {
      label: 'How do you typically select your investments?',
      type: 'radio',
      options: [
        'I rely on recommendations from friends/family.',
        'I follow advice from online research or financial news.',
        'I consult with a financial advisor.',
        'I use robo-advisors or online investment platforms.',
        'I make decisions independently, using my own research.'
      ]
    },
    {
      label: 'How often do you review your investment portfolio?',
      type: 'radio',
      options: [
        'Rarely or only when prompted.',
        'Once or twice a year.',
        'Quarterly.',
        'Monthly.',
        'Weekly or more often.'
      ]
    },
    {
      label: 'How comfortable are you with asset allocation and diversification principles?',
      type: 'radio',
      options: [
        'Not comfortable, I prefer to keep things simple.',
        'Somewhat comfortable, but I prefer expert advice.',
        'Comfortable, I apply these principles on my own.',
        'Very comfortable, I actively review and adjust allocation.'
      ]
    },
    {
      label: 'Which types of investments have you used?',
      type: 'checkbox',
      options: [
        'Bank deposits, FDs, RDs',
        'Mutual funds (equity, debt, hybrid)',
        'Direct stocks/equities',
        'Bonds',
        'Gold / Precious metals',
        'Real estate',
        'Alternative investments (REITs, crypto, P2P lending, etc.)'
      ]
    },
    {
      label: 'When markets are volatile, how do you typically react?',
      type: 'radio',
      options: [
        'I get worried and consider selling my investments.',
        'I wait and watch before making any decisions.',
        'I usually hold my current investments.',
        'I look for buying opportunities.'
      ]
    }
  ];

  const advancedQuestions = [
    {
      label: 'How do you manage your investment portfolio?',
      type: 'radio',
      options: [
        'Entirely by myself (DIY approach).',
        'With occasional help from professionals/consultants.',
        'With regular input from a financial advisor or wealth manager.',
        'Through automated/algorithmic platforms (e.g., robo-advisors).'
      ]
    },
    {
      label: 'Which advanced instruments have you invested in?',
      type: 'checkbox',
      options: [
        'Derivatives (options, futures, swaps)',
        'International equities, bonds, or funds',
        'PMS/AIFs (portfolio management/alternative investment funds)',
        'Startups (angel or VC investments)',
        'Real estate investment trusts (REITs, INVITs)',
        'Cryptocurrencies or digital assets',
        'Structured products'
      ]
    },
    {
      label: 'How frequently do you rebalance your portfolio?',
      type: 'radio',
      options: [
        'Rarely or never.',
        'Only when my advisor suggests.',
        'Once a year.',
        'Every 6 months.',
        'Quarterly or more frequently.'
      ]
    },
    {
      label: 'What is your primary consideration while making investment decisions?',
      type: 'radio',
      options: [
        'Maximizing returns, even with higher risk.',
        'Managing risk and return equally.',
        'Tax efficiency and long-term compounding.',
        'Diversification across asset classes and geographies.',
        'Sustainable/ESG investments.'
      ]
    },
    {
      label: 'How do you monitor investment performance?',
      type: 'radio',
      options: [
        'Regular reports/statements from platforms or advisors.',
        'Custom dashboards or spreadsheets.',
        'Real-time tracking using mobile or desktop apps.',
        'I rely on annual/semi-annual reviews only.'
      ]
    }
  ];

  const goalsQuestions = [
    {
      key: 'primaryObjective',
      label: 'What is your primary financial objective?',
      type: 'radio',
      options: [
        'Preserve Current Wealth (Stability, capital protection)',
        'Grow Wealth (Aggressive appreciation)',
        'Generate Income (Regular cashflow/dividends)',
        'Retirement Planning',
        'Funding Child\'s Education',
        'Major Purchase (Home/Auto)',
        'Other'
      ],
      other: true
    },
    {
      key: 'timeHorizon',
      label: 'What is your planned investment time horizon for major goals?',
      type: 'radio',
      options: [
        'Less than 1 year (Short Term)',
        '1–3 years (Short-Medium Term)',
        '3–5 years (Medium Term)',
        'More than 5 years (Long Term/Retirement)'
      ]
    },
    {
      key: 'savingsRate',
      label: 'What portion of your monthly income do you consistently save or invest?',
      type: 'radio',
      options: [
        'Less than 10%',
        '10%–20%',
        '20%–40%',
        'Over 40%',
        'It varies each month'
      ]
    },
    {
      key: 'marketDownturn',
      label: 'Suppose your investment dropped by 20% in a market downturn. What would you most likely do?',
      type: 'radio',
      options: [
        'Sell all investments to avoid further losses',
        'Sell a portion, wait for stabilization',
        'Do nothing, wait for recovery',
        'Invest more while prices are lower',
        'Unsure'
      ]
    },
    {
      key: 'investmentAttitude',
      label: 'Which statement best describes your investment attitude?',
      type: 'radio',
      options: [
        'I avoid risk and prefer guaranteed returns',
        'I can accept modest risk for slightly higher returns',
        'I am comfortable with significant risk for potentially higher returns',
        'My risk preference changes based on market/news'
      ]
    }
  ];

  const steps = ['Income', 'Debt/Liabilities', 'Investments', 'Expenses', 'Recurring Investments'];

  // Replace mfList and fetching logic with a static array:
  const staticMfList = [
    { name: 'DSP Large Cap Fund', category: 'Equity', type: 'Large Cap', oneY: '9.1%', fiveY: '20.26%', aum: '₹6,036 Cr', rating: 5 },
    { name: 'Kotak Bluechip Fund', category: 'Equity', type: 'Large Cap', oneY: '7.6%', fiveY: '20.22%', aum: '₹10,138 Cr', rating: 4 },
    { name: 'Aditya Birla SL Large Cap Fund', category: 'Equity', type: 'Large Cap', oneY: '7.5%', fiveY: '19.3%', aum: '₹29,858 Cr', rating: 4 },
    { name: 'ICICI Pru Large Cap Fund', category: 'Equity', type: 'Large Cap', oneY: '6.8%', fiveY: '23.7%', aum: '₹69,762 Cr', rating: 5 },
    { name: 'Invesco India Largecap Fund', category: 'Equity', type: 'Large Cap', oneY: '6.8%', fiveY: '21.05%', aum: '₹1,559 Cr', rating: 4 },
    { name: 'SBI Bluechip Fund', category: 'Equity', type: 'Large Cap', oneY: '6.5%', fiveY: '18.0%', aum: '₹52,251 Cr', rating: 4 },
    { name: 'Canara Robeco Large Cap Fund', category: 'Equity', type: 'Large Cap', oneY: '6.11%', fiveY: '17.5%', aum: '₹16,617 Cr', rating: 4 },
    { name: 'Nippon India Large Cap Fund', category: 'Equity', type: 'Large Cap', oneY: '5.3%', fiveY: '22.32%', aum: '₹41,750 Cr', rating: 5 },
    { name: 'Axis Large Cap Fund', category: 'Equity', type: 'Large Cap', oneY: '5.05%', fiveY: '17.04%', aum: '₹33,413 Cr', rating: 3 },
    { name: 'HDFC Large Cap Fund', category: 'Equity', type: 'Large Cap', oneY: '3.0%', fiveY: '19.94%', aum: '₹37,715 Cr', rating: 5 },
    { name: 'Invesco India Midcap Fund', category: 'Equity', type: 'Mid Cap', oneY: '16.60%', fiveY: '32.07%', aum: '₹6,641 Cr', rating: 5 },
    { name: 'Edelweiss Mid Cap Fund', category: 'Equity', type: 'Mid Cap', oneY: '9.6%', fiveY: '34.81%', aum: '₹10,028 Cr', rating: 5 },
    { name: 'HDFC Mid Cap Fund', category: 'Equity', type: 'Mid Cap', oneY: '8.4%', fiveY: '32.0%', aum: '₹79,717 Cr', rating: 5 },
    { name: 'Motilal Oswal Midcap Fund', category: 'Equity', type: 'Mid Cap', oneY: '8.1%', fiveY: '37.46%', aum: '₹30,401 Cr', rating: 5 },
    { name: 'Kotak Midcap Fund', category: 'Equity', type: 'Mid Cap', oneY: '6.37%', fiveY: '31.69%', aum: '₹53,464 Cr', rating: 4 },
    { name: 'Nippon India Growth Mid Cap Fund', category: 'Equity', type: 'Mid Cap', oneY: '6.39%', fiveY: '30.0%', aum: '₹36,836 Cr', rating: 4 },
    { name: 'ICICI Pru Midcap Fund', category: 'Equity', type: 'Mid Cap', oneY: '5.00%', fiveY: '31.01%', aum: '₹6,421 Cr', rating: 3 },
    { name: 'Mirae Asset Midcap Fund', category: 'Equity', type: 'Mid Cap', oneY: '4.52%', fiveY: '30.39%', aum: '₹16,337 Cr', rating: 3 },
    { name: 'Union Midcap Fund', category: 'Equity', type: 'Mid Cap', oneY: '4.45%', fiveY: '30.89%', aum: '₹1,440 Cr', rating: 4 },
    { name: 'Axis Midcap Fund', category: 'Equity', type: 'Mid Cap', oneY: '4.05%', fiveY: '29.0%', aum: '₹30,501 Cr', rating: 3 },
    { name: 'Bandhan Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '11.9%', fiveY: '38.06%', aum: '₹11,744 Cr', rating: 5 },
    { name: 'Invesco India Smallcap Fund', category: 'Equity', type: 'Small Cap', oneY: '10.7%', fiveY: '35.23%', aum: '₹7,435 Cr', rating: 5 },
    { name: 'Axis Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '7.13%', fiveY: '32.0%', aum: '₹25,062 Cr', rating: 4 },
    { name: 'DSP Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '6.64%', fiveY: '28.0%', aum: '₹16,304 Cr', rating: 3 },
    { name: 'Edelweiss Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '5.65%', fiveY: '35.94%', aum: '₹4,580 Cr', rating: 4 },
    { name: 'Kotak Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '5.0%', fiveY: '34.04%', aum: '₹17,329 Cr', rating: 3 },
    { name: 'HDFC Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '4.35%', fiveY: '35.09%', aum: '₹34,032 Cr', rating: 4 },
    { name: 'ITI Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '3.38%', fiveY: '30.46%', aum: '₹2,504 Cr', rating: 3 },
    { name: 'Tata Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '2.49%', fiveY: '35.70%', aum: '₹11,164 Cr', rating: 4 },
    { name: 'BOI Small Cap Fund', category: 'Equity', type: 'Small Cap', oneY: '0.77%', fiveY: '36.17%', aum: '₹1,819 Cr', rating: 4 },
    { name: 'Motilal Oswal Flexi Cap Fund', category: 'Equity', type: 'Flexi Cap', oneY: '16.98%', fiveY: '21.14%', aum: '₹13,894 Cr', rating: 5 },
    { name: 'Parag Parikh Flexi Cap Fund', category: 'Equity', type: 'Flexi Cap', oneY: '12.0%', fiveY: '25.7%', aum: '₹35,000 Cr', rating: 5 },
    { name: 'HDFC Flexi Cap Fund', category: 'Equity', type: 'Flexi Cap', oneY: '9.75%', fiveY: '30.13%', aum: '₹75,785 Cr', rating: 5 },
    { name: 'Franklin India Flexi Cap Fund', category: 'Equity', type: 'Flexi Cap', oneY: '5.14%', fiveY: '22.0%', aum: '₹18,679 Cr', rating: 4 },
    { name: 'Quant Flexi Cap Fund', category: 'Equity', type: 'Flexi Cap', oneY: '-7.23%', fiveY: '25.0%', aum: '₹7,326 Cr', rating: 5 },
    { name: 'SBI Healthcare Opportunities Fund', category: 'Equity', type: 'Sectoral/Thematic', oneY: '20.7%', fiveY: '25.0%', aum: '₹3,689 Cr', rating: 5 },
    { name: 'Sundaram Services Fund', category: 'Equity', type: 'Sectoral/Thematic', oneY: '16.89%', fiveY: '28.14%', aum: '₹4,161 Cr', rating: 4 },
    { name: 'Sundaram Financial Services Opp. Fund', category: 'Equity', type: 'Sectoral/Thematic', oneY: '8.20%', fiveY: '25.05%', aum: '₹1,548 Cr', rating: 4 },
    { name: 'Franklin India Technology Fund', category: 'Equity', type: 'Sectoral/Thematic', oneY: '5.02%', fiveY: '25.04%', aum: '₹1,862 Cr', rating: 4 },
    { name: 'ICICI Pru Infrastructure Fund', category: 'Equity', type: 'Sectoral/Thematic', oneY: '4.1%', fiveY: '38.05%', aum: '₹7,920 Cr', rating: 5 },
    // ELSS (Tax Saving) Funds
    { name: 'Parag Parikh ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '7.38%', fiveY: '24.0%', aum: '₹5,294 Cr', rating: 5 },
    { name: 'DSP ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '6.39%', fiveY: '26.39%', aum: '₹16,974 Cr', rating: 5 },
    { name: 'Axis ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '6.0%', fiveY: '23.0%', aum: '₹15,000 Cr', rating: 4 },
    { name: 'Motilal Oswal ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '5.56%', fiveY: '25.0%', aum: '₹4,359 Cr', rating: 5 },
    { name: 'Mirae Asset ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '5.5%', fiveY: '22.0%', aum: '₹8,500 Cr', rating: 4 },
    { name: 'SBI ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '4.1%', fiveY: '28.3%', aum: '₹29,667 Cr', rating: 5 },
    { name: 'BOI ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '-6.72%', fiveY: '26.36%', aum: '₹1,398 Cr', rating: 5 },
    { name: 'Quant ELSS Tax Saver Fund', category: 'Equity', type: 'ELSS', oneY: '-7.41%', fiveY: '33.98%', aum: '₹11,923 Cr', rating: 5 },
    // Multi Cap Funds
    { name: 'Bandhan Core Equity Fund', category: 'Equity', type: 'Multi Cap', oneY: '12.4%', fiveY: '28.0%', aum: '₹9,106 Cr', rating: 5 },
    { name: 'SBI Multi Cap Fund', category: 'Equity', type: 'Multi Cap', oneY: '4.8%', fiveY: '24.0%', aum: '₹15,800 Cr', rating: 4 },
    { name: 'Nippon India Multi Cap Fund', category: 'Equity', type: 'Multi Cap', oneY: '3.13%', fiveY: '32.74%', aum: '₹45,366 Cr', rating: 4 },
    { name: 'Kotak Multi Cap Fund', category: 'Equity', type: 'Multi Cap', oneY: '2.07%', fiveY: '25.0%', aum: '₹17,943 Cr', rating: 4 },
    { name: 'Axis Multi Cap Fund', category: 'Equity', type: 'Multi Cap', oneY: '1.07%', fiveY: '27.13%', aum: '₹7,782 Cr', rating: 5 },
    // Large & Mid Cap Funds
    { name: 'Motilal Oswal Large & Midcap Fund', category: 'Equity', type: 'Large & Mid Cap', oneY: '14.0%', fiveY: '31.41%', aum: '₹11,816 Cr', rating: 5 },
    { name: 'SBI Large & Midcap Fund', category: 'Equity', type: 'Large & Mid Cap', oneY: '7.01%', fiveY: '26.17%', aum: '₹31,296 Cr', rating: 3 },
    { name: 'Mirae Asset Large & Midcap Fund', category: 'Equity', type: 'Large & Mid Cap', oneY: '6.5%', fiveY: '28.0%', aum: '₹39,459 Cr', rating: 4 },
    { name: 'Edelweiss Large & Mid Cap Fund', category: 'Equity', type: 'Large & Mid Cap', oneY: '5.78%', fiveY: '26.38%', aum: '₹3,914 Cr', rating: 4 },
    // Hybrid Funds
    { name: 'ICICI Prudential Multi Asset Fund', category: 'Hybrid', type: 'Multi Asset Allocation', oneY: '11.36%', fiveY: '25.14%', aum: '₹59,452 Cr', rating: 3 },
    { name: 'ICICI Pru Equity & Debt Fund', category: 'Hybrid', type: 'Aggressive Hybrid', oneY: '9.20%', fiveY: '26.44%', aum: '₹43,159 Cr', rating: 5 },
    { name: 'SBI Equity Hybrid Fund', category: 'Hybrid', type: 'Aggressive Hybrid', oneY: '8.5%', fiveY: '24.0%', aum: '₹25,000 Cr', rating: 4 },
    { name: 'HDFC Balanced Advantage Fund', category: 'Hybrid', type: 'Dynamic Asset Allocation', oneY: '8.0%', fiveY: '20.0%', aum: '₹30,000 Cr', rating: 4 },
    { name: 'Mirae Asset Hybrid Equity Fund', category: 'Hybrid', type: 'Aggressive Hybrid', oneY: '7.8%', fiveY: '22.5%', aum: '₹18,000 Cr', rating: 4 },
    { name: 'SBI Arbitrage Opportunities Fund', category: 'Hybrid', type: 'Arbitrage', oneY: '7.54%', fiveY: '6.22%', aum: '₹33,759 Cr', rating: 4 },
    { name: 'ICICI Pru Balanced Advantage Fund', category: 'Hybrid', type: 'Dynamic Asset Allocation', oneY: '7.5%', fiveY: '19.0%', aum: '₹22,000 Cr', rating: 4 },
    { name: 'Nippon India Arbitrage Fund', category: 'Hybrid', type: 'Arbitrage', oneY: '7.5%', fiveY: '6.2%', aum: '₹14,511 Cr', rating: 4 },
    { name: 'BOI Mid & Small Cap Eq. & Debt Fund', category: 'Hybrid', type: 'Aggressive Hybrid', oneY: '2.19%', fiveY: '28.12%', aum: '₹1,198 Cr', rating: 5 },
    // Debt Funds
    { name: 'ICICI Pru Corporate Bond Fund', category: 'Debt', type: 'Corporate Bond', oneY: '9.40%', fiveY: '6.82%', aum: '₹33,109 Cr', rating: 5 },
    { name: 'Tata Money Market Fund', category: 'Debt', type: 'Money Market', oneY: '8.41%', fiveY: '6.34%', aum: '₹32,551 Cr', rating: 4 },
    { name: 'HDFC Money Market Fund', category: 'Debt', type: 'Money Market', oneY: '8.28%', fiveY: '6.16%', aum: '₹31,769 Cr', rating: 5 },
    { name: 'Kotak Money Market Fund', category: 'Debt', type: 'Money Market', oneY: '8.24%', fiveY: '6.11%', aum: '₹31,039 Cr', rating: 4 },
    { name: 'SBI Savings Fund', category: 'Debt', type: 'Money Market', oneY: '8.22%', fiveY: '6.14%', aum: '₹32,655 Cr', rating: 5 },
    { name: 'HDFC Short Term Debt Fund', category: 'Debt', type: 'Short Duration', oneY: '8.5%', fiveY: '7.0%', aum: '₹20,000 Cr', rating: 4 },
    { name: 'Axis Liquid Fund', category: 'Debt', type: 'Liquid', oneY: '7.30%', fiveY: '5.64%', aum: '₹33,529 Cr', rating: 4 },
    { name: 'Nippon India Liquid Fund', category: 'Debt', type: 'Liquid', oneY: '7.26%', fiveY: '5.63%', aum: '₹34,490 Cr', rating: 4 },
    // Index Funds
    { name: 'HDFC Index Fund - Nifty 50', category: 'Index', type: 'Nifty 50', oneY: '14.2%', fiveY: '19.0%', aum: '₹25,000 Cr', rating: 5 },
    { name: 'SBI Nifty Index Fund', category: 'Index', type: 'Nifty 50', oneY: '14.0%', fiveY: '18.5%', aum: '₹15,000 Cr', rating: 5 },
    { name: 'UTI Nifty Index Fund', category: 'Index', type: 'Nifty 50', oneY: '13.5%', fiveY: '18.0%', aum: '₹10,000 Cr', rating: 4 },
    { name: 'ICICI Pru Nifty Index Fund', category: 'Index', type: 'Nifty 50', oneY: '13.8%', fiveY: '17.8%', aum: '₹12,000 Cr', rating: 4 },
    { name: 'Motilal Oswal Nifty 50 Index Fund', category: 'Index', type: 'Nifty 50', oneY: '10.84%', fiveY: '17.5%', aum: '₹700 Cr', rating: 4 },
    // Gold Funds
    { name: 'HDFC Gold ETF FoF', category: 'Gold', type: 'Gold ETF', oneY: '30.7%', fiveY: '13.8%', aum: '₹2,500 Cr', rating: 5 },
    { name: 'Kotak Gold Fund', category: 'Gold', type: 'Gold ETF', oneY: '24.3%', fiveY: '13.7%', aum: '₹2,200 Cr', rating: 4 },
    // International Funds
    { name: 'Kotak Nasdaq 100 FOF', category: 'International', type: 'US Index Tracking', oneY: '14.7%', fiveY: '27.2%', aum: '₹3,800 Cr', rating: 5 },
    { name: 'ICICI Pru US Bluechip Equity Fund', category: 'International', type: 'US Bluechip Equity', oneY: '3.7%', fiveY: '15.4%', aum: '₹6,000 Cr', rating: 4 },
  ];

  // In Step 3 (Investments), use staticMfList for the dropdown, and when adding, store the full fund object (not just name) with the amount.
  // In addMutualFund, find the fund object by name and store it with the amount.
  const addMutualFund = () => {
    if (!mfName || mfAmount <= 0) return;
    if (form.investments.mutualFunds.some(mf => mf.name === mfName)) {
      alert('This mutual fund is already added.');
      return;
    }
    const fund = staticMfList.find(mf => mf.name === mfName);
    if (!fund) return;
      setForm({
        ...form,
        investments: {
          ...form.investments,
          mutualFunds: [
            ...form.investments.mutualFunds,
          { ...fund, amount: mfAmount },
          ],
        },
      });
    setMfName('');
      setMfAmount(0);
  };

  const removeMutualFund = (idx: number) => {
    setForm({
      ...form,
      investments: {
        ...form.investments,
        mutualFunds: form.investments.mutualFunds.filter((_, i) => i !== idx),
      },
    });
  };

  const handleExpenses = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      expenses: { monthlyExpenses: Number(e.target.value) },
    });
  };

  const handleRisk = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | SelectChangeEvent) => {
    setForm({
      ...form,
      risk: { ...form.risk, [e.target.name]: e.target.value },
    });
  };

  const handleSavingsRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      savingsRate: e.target.value,
    });
  };

  const handleDebt = (field: string, value: any) => {
    setForm({
      ...form,
      debt: { ...form.debt, [field]: value },
    });
  };

  const handleLoanChange = (idx: number, field: string, value: string) => {
    const updated = form.debt.loans.map((l, i) => i === idx ? { ...l, [field]: value } : l);
    setForm({ ...form, debt: { ...form.debt, loans: updated } });
  };

  const addLoan = () => {
    setForm({ ...form, debt: { ...form.debt, loans: [...form.debt.loans, { type: '', principal: '', interest: '', tenure: '', tenureValue: '', tenureType: 'months' }] } });
  };

  const removeLoan = (idx: number) => {
    setForm({ ...form, debt: { ...form.debt, loans: form.debt.loans.filter((_, i) => i !== idx) } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
  setDashboardData(form);
  setView("dashboard");
  };

  // Ensure these handlers are defined in the Home component:
  const handleIncome = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      income: { ...form.income, [name]: value },
    });
    if (name === 'inhandIncome') {
      setIncomeError(null);
    }
  };
  const handleInvestments = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      investments: { ...form.investments, [e.target.name]: Number(e.target.value) },
    });
  };

  // Calculate total EMI for all loans
  function calculateEMI(principal: number, annualRate: number, tenureMonths: number) {
    const r = annualRate / 12 / 100;
    const n = tenureMonths;
    if (r === 0) return principal / n;
    return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }
  const totalEMI = Object.entries(loanEMIs).reduce((sum, [idx, emi]) => emiAdded[Number(idx)] ? sum + (emi || 0) : sum, 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'var(--background-light)' }}>
      {/* Modern Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          color: 'white',
          py: 3,
          mb: 4,
          borderRadius: 0,
          px: { xs: 2, sm: 4, md: 8 },
          width: '100vw',
          minWidth: 0,
          left: 0,
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1600, mx: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <img
              src="/logo.png"
              alt="Finance Sage Logo"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                transition: 'transform 0.2s cubic-bezier(.4,2,.6,1)',
                cursor: 'pointer',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.3rem', sm: '2rem' } }}>
                Finance Sage
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                Your Personal Financial Planning Assistant
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
            {dashboardData && (
              <Button
                variant={view === "dashboard" ? "contained" : "outlined"}
                color="inherit"
                size="small"
                onClick={() => setView("dashboard")}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(255,255,255,0.6)',
                  bgcolor: view === "dashboard" ? 'rgba(0,0,0,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                    borderColor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                My Dashboard
              </Button>
            )}
            <Chip 
              label="India" 
              icon={<AccountBalance />} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
                fontSize: { xs: '0.8rem', sm: '1rem' },
                px: { xs: 1, sm: 2 },
                height: { xs: 32, sm: 40 },
              }} 
            />
          </Box>
        </Box>
      </Paper>

      <Container maxWidth="lg">
        {view === "dashboard" && dashboardData && (
          <Dashboard
            data={dashboardData}
            totalEMI={totalEMI}
            onBack={() => { setView("form"); setStep(0 as Step); }}
            onRecommend={() => setView("riskQuiz")}
            recommendation={recommendation}
            loadingRecommendation={loadingRecommendation}
          />
        )}
        {view === "riskQuiz" && dashboardData && (
          <RiskQuiz
            data={dashboardData}
            onBack={() => setView("dashboard")}
            onQuizComplete={async (quizResult) => {
              setQuizData(quizResult);
              setLoadingRecommendation(true);
              try {
                const res = await fetch("/api/finance", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...dashboardData, riskQuiz: quizResult }),
                });
                let data: any;
                try {
                  data = await res.json();
                } catch (jsonErr) {
                  data = {};
                }
                console.log('Backend recommendation response:', data);
                setRecommendation({
                  recommendation: data?.recommendation || "(No recommendation returned)",
                  persona: data?.persona || "Unknown",
                  idealStrategy: data?.idealStrategy || "Unknown",
                  comparison: data?.comparison || "Unknown",
                  strategies: data?.strategies
                });
              } catch (err) {
                setRecommendation({
                  recommendation: "Could not generate a recommendation. Please try again later.",
                  persona: "Unknown",
                  idealStrategy: "Unknown",
                  comparison: "Unknown"
                });
              } finally {
                setLoadingRecommendation(false);
                setView("dashboard");
              }
            }}
          />
        )}
        {view === "form" && (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Step Indicator */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Stepper activeStep={step} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel 
                      StepIconProps={{
                        sx: {
                          '&.Mui-completed': {
                            color: 'var(--success)',
                          },
                          '&.Mui-active': {
                            color: 'var(--primary)',
                          },
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {/* Form Content */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          {step === 0 && (
                <Box className="fade-in">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'var(--primary)', width: 40, height: 40 }}>
                      <AttachMoney />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Income Details
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Let's start by understanding your income sources. This helps us create a comprehensive financial plan.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Monthly Inhand Income (₹)"
                        name="inhandIncome"
                        type="number"
                        value={form.income.inhandIncome}
                        onChange={handleIncome}
                        InputProps={{
                          startAdornment: <span style={{ color: 'gray', marginRight: 4 }}>₹</span>,
                        }}
                        required
                        error={!!incomeError}
                        helperText={incomeError}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Other Sources of Income (₹)"
                        name="otherIncome"
                        type="number"
                        value={form.income.otherIncome}
                        onChange={handleIncome}
                        InputProps={{
                          startAdornment: <span style={{ color: 'gray', marginRight: 4 }}>₹</span>,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      disabled={step === 0}
                      onClick={() => setStep(Math.max(0, step - 1) as Step)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => {
                        if (!form.income.inhandIncome || Number(form.income.inhandIncome) <= 0) {
                          setIncomeError('Monthly Inhand Income is required and must be greater than zero.');
                          return;
                        }
                        setStep(1 as Step);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        '&:hover': {
                          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

          {step === 1 && (
                <Box className="fade-in">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'var(--warning)', width: 40, height: 40 }}>
                      <Assessment />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Debt & Liabilities
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Understanding your debt obligations helps us calculate your true financial position and monthly commitments.
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <FormLabel>Do you have any debts or loans?</FormLabel>
                    <RadioGroup
                      name="hasDebt"
                      value={form.debt.hasDebt}
                      onChange={(event) => handleDebt('hasDebt', event.target.value)}
                    >
                      <FormControlLabel value="No" control={<Radio />} label="No, I don't have any debts" />
                      <FormControlLabel value="Yes" control={<Radio />} label="Yes, I have debts/loans" />
                    </RadioGroup>
                  </FormControl>

                  {form.debt.hasDebt === 'Yes' && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calculate />
                        Loan Details
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addLoan}
                        sx={{ mb: 2 }}
                      >
                        Add Loan
                      </Button>

                      {form.debt.loans.map((loan, idx) => {
                        const p = parseFloat(loan.principal) || 0;
                        const rate = parseFloat(loan.interest) || 0;
                        const tenureValue = parseInt(loan.tenureValue) || 0;
                        const tenureType = loan.tenureType || 'months';
                        const totalTenureMonths = tenureType === 'years' ? tenureValue * 12 : tenureValue;
                        let emi = 0;
                        if (p > 0 && rate > 0 && totalTenureMonths > 0) {
                          const r = rate / 12 / 100;
                          emi = r === 0 ? p / totalTenureMonths : p * r * Math.pow(1 + r, totalTenureMonths) / (Math.pow(1 + r, totalTenureMonths) - 1);
                        }
                        
                        return (
                          <Card key={idx} sx={{ mt: 2, p: 3, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth>
                                  <InputLabel>Type of Loan</InputLabel>
                                  <Select
                                    value={loan.type}
                                    label="Type of Loan"
                                    onChange={e => handleLoanChange(idx, 'type', e.target.value)}
                                  >
                                    <MenuItem value="Loan Against Property">Loan Against Property</MenuItem>
                                    <MenuItem value="Car Loan">Car Loan</MenuItem>
                                    <MenuItem value="Home Loan">Home Loan</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <TextField
                                  fullWidth
                                  label="Principal Remaining (₹)"
                                  type="number"
                                  value={loan.principal}
                                  onChange={e => handleLoanChange(idx, 'principal', e.target.value)}
                                  InputProps={{
                                    startAdornment: <span style={{ color: 'gray', marginRight: 4 }}>₹</span>,
                                  }}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <TextField
                                  fullWidth
                                  label="Interest Rate (%)"
                                  type="number"
                                  value={loan.interest}
                                  onChange={e => handleLoanChange(idx, 'interest', e.target.value)}
                                  InputProps={{
                                    endAdornment: <Typography variant="caption">%</Typography>,
                                  }}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <TextField
                                    label="Remaining Tenure"
                                    type="number"
                                    value={loan.tenureValue || ''}
                                    onChange={e => handleLoanChange(idx, 'tenureValue', e.target.value)}
                                    sx={{ flex: 1 }}
                                  />
                                  <FormControl sx={{ minWidth: 100 }}>
                                    <InputLabel>Unit</InputLabel>
                                    <Select
                                      value={loan.tenureType || 'months'}
                                      label="Unit"
                                      onChange={e => handleLoanChange(idx, 'tenureType', e.target.value)}
                                    >
                                      <MenuItem value="months">Months</MenuItem>
                                      <MenuItem value="years">Years</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                              {emi > 0 && (
                                <Button
                                  variant={emiAdded[idx] ? 'contained' : 'outlined'}
                                  color={emiAdded[idx] ? 'success' : 'primary'}
                                  disabled={emiAdded[idx]}
                                  onClick={() => setEmiAdded(prev => ({ ...prev, [idx]: true }))}
                                  startIcon={emiAdded[idx] ? <CheckCircle /> : <Add />}
                                >
                                  {emiAdded[idx] ? 'Added to Expenses' : 'Add to Expenses'}
                                </Button>
                              )}
                              <IconButton
                                color="error"
                                onClick={() => removeLoan(idx)}
                                sx={{ ml: 'auto' }}
                              >
                                <Remove />
                              </IconButton>
                            </Box>
                            {emi > 0 && (
                              <Box sx={{ mt: 2, mb: 0 }}>
                                <Chip
                                  label={`EMI: ₹${Math.round(emi).toLocaleString()}/month`}
                                  color="primary"
                                  variant="filled"
                                />
                              </Box>
                            )}
                          </Card>
                        );
                      })}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => setStep(0)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => setStep(2)}
                      sx={{
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        '&:hover': {
                          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                  {/* EMI summary below navigation if any EMIs added */}
                  {Object.values(emiAdded).some(Boolean) && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>EMIs Added to Expenses:</Typography>
                      {form.debt.loans.map((loan, idx) => {
                        const p = parseFloat(loan.principal) || 0;
                        const rate = parseFloat(loan.interest) || 0;
                        const tenureValue = parseInt(loan.tenureValue) || 0;
                        const tenureType = loan.tenureType || 'months';
                        const totalTenureMonths = tenureType === 'years' ? tenureValue * 12 : tenureValue;
                        let emi = 0;
                        if (p > 0 && rate > 0 && totalTenureMonths > 0) {
                          const r = rate / 12 / 100;
                          emi = r === 0 ? p / totalTenureMonths : p * r * Math.pow(1 + r, totalTenureMonths) / (Math.pow(1 + r, totalTenureMonths) - 1);
                        }
                        return emiAdded[idx] ? (
                          <Typography key={idx} variant="body2">
                            {loan.type || 'Loan'}: ₹{Math.round(emi).toLocaleString()} / month
                          </Typography>
                        ) : null;
                      })}
                    </Box>
                  )}
                </Box>
              )}

              {step === 2 && (
                <Box className="fade-in">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'var(--success)', width: 40, height: 40 }}>
                      <TrendingUp />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Investment Portfolio
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Let's understand your current investment portfolio to assess your financial position.
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Gold Investments (₹)"
                      name="gold"
                      type="number"
                      value={form.investments.gold}
                      onChange={handleInvestments}
                    />
                    <TextField
                      fullWidth
                      label="Real Estate (₹)"
                      name="realEstate"
                      type="number"
                      value={form.investments.realEstate}
                      onChange={handleInvestments}
                    />
                    <TextField
                      fullWidth
                      label="RSU/ESOPs (₹)"
                      name="rsu"
                      type="number"
                      value={form.investments.rsu}
                      onChange={handleInvestments}
                    />
                    <TextField
                      fullWidth
                      label="Fixed Deposits (₹)"
                      name="fd"
                      type="number"
                      value={form.investments.fd}
                      onChange={handleInvestments}
                    />
                    <TextField
                      fullWidth
                      label="Other Investments (₹)"
                      name="other"
                      type="number"
                      value={form.investments.other}
                      onChange={handleInvestments}
                    />
                  </Box>

                  {/* Mutual Funds Section */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp />
                      Mutual Funds
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <FormControl sx={{ minWidth: 300 }}>
                        <InputLabel>Select Mutual Fund</InputLabel>
                        <Select
                          value={mfName}
                          label="Select Mutual Fund"
                          onChange={(e) => setMfName(e.target.value)}
                        >
                          {staticMfList.map((fund) => (
                            <MenuItem key={fund.name} value={fund.name}>
                              {fund.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Amount (₹)"
                        type="number"
                        value={mfAmount}
                        onChange={(e) => setMfAmount(Number(e.target.value))}
                        sx={{ minWidth: 150 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addMutualFund}
                      >
                        Add Fund
                      </Button>
                    </Box>

                    {form.investments.mutualFunds.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                {form.investments.mutualFunds.map((mf, idx) => (
                          <Card key={idx} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {mf.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ₹{mf.amount.toLocaleString()}
                                </Typography>
                              </Box>
                              <IconButton
                                color="error"
                                onClick={() => removeMutualFund(idx)}
                              >
                                <Remove />
                              </IconButton>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => setStep(3)}
                      sx={{
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        '&:hover': {
                          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

          {step === 3 && (
                <Box className="fade-in">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'var(--warning)', width: 40, height: 40 }}>
                      <Assessment />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Monthly Expenses
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Understanding your monthly expenses helps us calculate your savings potential and investment capacity.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Monthly Expenses (₹)"
                    name="monthlyExpenses"
                    type="number"
                    value={form.expenses.monthlyExpenses}
                    onChange={handleExpenses}
                    InputProps={{
                      startAdornment: <span style={{ color: 'gray', marginRight: 4 }}>₹</span>,
                    }}
                    sx={{ mb: 3 }}
                  />

                  {totalEMI > 0 && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        Total EMI from loans: ₹{totalEMI.toLocaleString()}/month
                      </Typography>
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => setStep(4)}
                      sx={{
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        '&:hover': {
                          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

          {step === 4 && (
                <Box className="fade-in">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'var(--success)', width: 40, height: 40 }}>
                      <TrendingUp />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Recurring Investments (SIPs)
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Add your Systematic Investment Plans (SIPs) to understand your regular investment commitments.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Fund Name"
                      value={sipMfName}
                      onChange={(e) => setSipMfName(e.target.value)}
                      sx={{ minWidth: 200 }}
                    />
                    <TextField
                      label="Monthly Amount (₹)"
                      type="number"
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      sx={{ minWidth: 150 }}
                      InputProps={{
                        startAdornment: <span style={{ color: 'gray', marginRight: 4 }}>₹</span>,
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addSip}
                    >
                      Add SIP
                    </Button>
                  </Box>

                  {form.recurringInvestments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {form.recurringInvestments.map((sip, idx) => (
                        <Card key={idx} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {sip.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ₹{sip.amount.toLocaleString()}/month
                              </Typography>
                            </Box>
                            <IconButton
                              color="error"
                              onClick={() => removeSip(idx)}
                            >
                              <Remove />
                            </IconButton>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => setStep(3)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<CheckCircle />}
                      onClick={handleSubmit}
                      sx={{
                        background: 'linear-gradient(135deg, var(--success), #4caf50)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2e7d32, var(--success))',
                        }
                      }}
                    >
                      Complete Assessment
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
    </ThemeProvider>
  );
}

// Dashboard component
function Dashboard({ data, totalEMI, onBack, onRecommend, recommendation, loadingRecommendation }: {
  data: FormData;
  totalEMI: number;
  onBack: () => void;
  onRecommend: () => void;
  recommendation?: {
    recommendation: string;
    persona: string;
    idealStrategy: string;
    comparison: string;
    strategies?: any;
  } | null;
  loadingRecommendation?: boolean;
}) {
  const totalIncome = Number(data.income.inhandIncome) + Number(data.income.otherIncome);
  const totalInvestments = Number(data.investments.gold) + Number(data.investments.realEstate) + 
    data.investments.mutualFunds.reduce((sum, mf) => sum + mf.amount, 0) + 
    Number(data.investments.rsu) + Number(data.investments.esops) + Number(data.investments.other) + Number(data.investments.fd);
  const totalMonthlyExpenses = Number(data.expenses.monthlyExpenses) + totalEMI;
  const monthlySavings = totalIncome - totalMonthlyExpenses;
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0;
  // Calculate total debt
  const totalDebt = (data.debt?.loans || []).reduce((sum, loan) => sum + (parseFloat(loan.principal) || 0), 0);
  // Calculate true net worth: total investments + (monthly savings * 12) - total debt
  const trueNetWorth = totalInvestments + (monthlySavings * 12) - totalDebt;

  // Calculate recurring EMIs for each loan
  const emiDetails = (data.debt?.loans || []).map(loan => {
    const p = parseFloat(loan.principal) || 0;
    const rate = parseFloat(loan.interest) || 0;
    const tenureValue = parseInt(loan.tenureValue) || 0;
    const tenureType = loan.tenureType || 'months';
    const totalTenureMonths = tenureType === 'years' ? tenureValue * 12 : tenureValue;
    let emi = 0;
    if (p > 0 && rate > 0 && totalTenureMonths > 0) {
      const r = rate / 12 / 100;
      emi = r === 0 ? p / totalTenureMonths : p * r * Math.pow(1 + r, totalTenureMonths) / (Math.pow(1 + r, totalTenureMonths) - 1);
    }
    return {
      ...loan,
      emi: Math.round(emi)
    };
  });

  // Group investments for pie chart
  const pieGroups = [
    { label: 'Gold', value: Number(data.investments.gold) || 0, color: '#FFD700' },
    { label: 'Real Estate', value: Number(data.investments.realEstate) || 0, color: '#8B5C2A' },
    { label: 'Mutual Funds', value: data.investments.mutualFunds.reduce((sum, mf) => sum + mf.amount, 0), color: '#4F8EF7' },
    { label: 'Fixed Deposits', value: Number(data.investments.fd) || 0, color: '#43B97F' },
    { label: 'Other', value: Number(data.investments.other) || 0 + Number(data.investments.rsu) || 0 + Number(data.investments.esops) || 0, color: '#A259FF' }
  ].filter(g => g.value > 0);

  // Calculate DTI (Debt-to-Income Ratio)
  const annualIncome = totalIncome * 12;
  const dtiRatio = annualIncome > 0 ? (totalDebt / annualIncome) : 0;
  let dti: DTILevel = '<36%';
  if (dtiRatio < 0.36) dti = '<36%';
  else if (dtiRatio < 0.43) dti = '36–43%';
  else if (dtiRatio < 0.5) dti = '43–50%';
  else dti = '≥50%';

  // Extract knowledge, behaviour, reaction from answers (example mapping, adjust as needed)
  // For demo, fallback to Moderate if not available
  let knowledge: KnowledgeLevel = 'Moderate';
  let behaviour: Behaviour = 'Moderate';
  let reaction: Reaction = 'Hold';
  if (data.risk && data.risk.knowledge) {
    if (data.risk.knowledge.toLowerCase().includes('minimal') || data.risk.knowledge.toLowerCase().includes('low')) knowledge = 'Minimal';
    else if (data.risk.knowledge.toLowerCase().includes('advanced') || data.risk.knowledge.toLowerCase().includes('high')) knowledge = 'Advanced';
    else knowledge = 'Moderate';
  }
  // For behaviour and reaction, you may want to map from quiz answers (customize as needed)
  // For now, use risk appetite for behaviour
  if (data.risk && data.risk.appetite) {
    if (data.risk.appetite.toLowerCase().includes('conservative') || data.risk.appetite.toLowerCase().includes('cautious')) behaviour = 'Cautious';
    else if (data.risk.appetite.toLowerCase().includes('aggressive')) behaviour = 'Aggressive';
    else behaviour = 'Moderate';
  }
  // For reaction, you may want to use a market downturn question from the quiz
  // For now, fallback to 'Hold'

  // Try to extract ageGroup from risk quiz answers or fallback to ''
  let ageGroup = '';
  // Try to extract from recommendation, risk, or fallback
  if (recommendation && (recommendation as any).ageGroup) {
    ageGroup = (recommendation as any).ageGroup;
  } else if (data.risk && (data.risk as any).ageGroup) {
    ageGroup = (data.risk as any).ageGroup;
  }
  const persona = getUserPersona({
    ageGroup,
    dti,
    knowledge,
    behaviour,
    reaction
  });

  // Risk Assessment Flow Section
  const [riskAssessmentDone, setRiskAssessmentDone] = useState(false);
  const [goalsFlowActive, setGoalsFlowActive] = useState(false);

  const startRiskAssessment = () => {
    setRiskAssessmentDone(false);
    setGoalsFlowActive(false);
  };

  const startGoalsFlow = () => {
    setGoalsFlowActive(true);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 3 } }}>
      {/* Modern Header */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)', color: '#222', boxShadow: 'var(--shadow-medium)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ bgcolor: '#757575', width: 64, height: 64, boxShadow: 2 }}>
              <TrendingUp fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-1px', fontSize: { xs: '1.5rem', sm: '2.2rem' }, color: '#222' }}>
                Your Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.92, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                Your personalized financial overview and insights
              </Typography>
            </Box>
          </Box>
          {recommendation && recommendation.persona && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, mt: { xs: 2, sm: 0 } }}>
              <Typography variant="overline" sx={{ display: 'block', color: '#424242' }}>
                Persona
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {recommendation.persona}
              </Typography>
            </Box>
          )}
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ 
              color: '#333', 
              borderColor: '#bdbdbd',
              fontWeight: 600,
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              borderRadius: 2,
              px: 3,
              py: 1.2,
              bgcolor: '#f5f5f5',
              '&:hover': { borderColor: '#757575', bgcolor: '#e0e0e0' }
            }}
          >
            Back to Form
          </Button>
        </Box>
        <Divider sx={{ borderColor: '#bdbdbd', my: 2 }} />
        <Typography variant="body2" sx={{ opacity: 0.85, fontSize: { xs: '0.98rem', sm: '1.08rem' }, fontWeight: 400, color: '#444' }}>
          Welcome! Here's a snapshot of your financial health, investments, and opportunities. Use the insights below to make informed decisions and track your progress.
        </Typography>
      </Paper>

      {/* Key Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(260px, 1fr))' }, gap: 4, mb: 4 }}>
        {[
          {
            icon: <AttachMoney />,
            label: 'Monthly Income',
            value: `₹${totalIncome.toLocaleString()}`,
            color: '#388e3c',
            sub: `Primary: ₹${Number(data.income.inhandIncome).toLocaleString()} | Other: ₹${Number(data.income.otherIncome).toLocaleString()}`
          },
          {
            icon: <Assessment />,
            label: 'Monthly Expenses',
            value: `₹${totalMonthlyExpenses.toLocaleString()}`,
            color: '#f57c00',
            sub: `Base: ₹${Number(data.expenses.monthlyExpenses).toLocaleString()} | EMI: ₹${totalEMI.toLocaleString()}`
          },
          {
            icon: <TrendingUp />,
            label: 'Monthly Savings',
            value: `₹${monthlySavings.toLocaleString()}`,
            color: '#1976d2',
            sub: `Savings Rate: ${savingsRate.toFixed(1)}%`
          },
          {
            icon: <AccountBalance />,
            label: 'Total Investments',
            value: `₹${totalInvestments.toLocaleString()}`,
            color: '#7b1fa2',
            sub: `${data.investments.mutualFunds.length} Mutual Funds`
          },
          {
            icon: <Calculate />,
            label: 'Total Debt',
            value: `₹${totalDebt.toLocaleString()}`,
            color: '#d32f2f',
            sub: ''
          },
          {
            icon: <AccountBalance />,
            label: 'True Net Worth',
            value: `₹${trueNetWorth.toLocaleString()}`,
            color: '#0288d1',
            sub: ''
          }
        ].map((card, i) => (
          <Card
            key={card.label}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              boxShadow: '0 4px 24px rgba(120,120,120,0.08)',
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s, color 0.18s',
              color: '#222',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: '0 8px 32px rgba(120,120,120,0.13)',
                background: card.color,
                borderColor: card.color,
                color: '#fff',
                '& .MuiAvatar-root': {
                  bgcolor: '#fff',
                  color: card.color,
                },
                '& .MuiTypography-h6': {
                  color: '#fff',
                },
                '& .MuiTypography-h4': {
                  color: '#fff',
                },
                '& .MuiTypography-body2': {
                  color: '#f3f3f3',
                },
              },
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              minHeight: 160
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#bdbdbd', width: 44, height: 44, color: '#333', transition: 'background 0.18s, color 0.18s' }}>{card.icon}</Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', transition: 'color 0.18s' }}>{card.label}</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 1, letterSpacing: '-1px', transition: 'color 0.18s' }}>{card.value}</Typography>
            {card.sub && <Typography variant="body2" sx={{ color: '#555', transition: 'color 0.18s' }}>{card.sub}</Typography>}
          </Card>
        ))}
      </Box>

      {/* Investment Breakdown */}
      <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--border-light)', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance />
          Investment Portfolio
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(200px, 1fr))' }, gap: 3 }}>
          {Number(data.investments.gold) > 0 && (
            <Box sx={{ p: 2, bgcolor: 'var(--background-light)', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Gold</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>₹{Number(data.investments.gold).toLocaleString()}</Typography>
            </Box>
          )}
          {Number(data.investments.realEstate) > 0 && (
            <Box sx={{ p: 2, bgcolor: 'var(--background-light)', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Real Estate</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>₹{Number(data.investments.realEstate).toLocaleString()}</Typography>
            </Box>
          )}
          {data.investments.mutualFunds.length > 0 && (
            <Box sx={{ p: 2, bgcolor: 'var(--background-light)', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Mutual Funds</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ₹{data.investments.mutualFunds.reduce((sum, mf) => sum + mf.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.investments.mutualFunds.length} funds
              </Typography>
            </Box>
          )}
          {Number(data.investments.fd) > 0 && (
            <Box sx={{ p: 2, bgcolor: 'var(--background-light)', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Fixed Deposits</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>₹{Number(data.investments.fd).toLocaleString()}</Typography>
            </Box>
          )}
        </Box>

        {data.recurringInvestments.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recurring Investments (SIPs)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.recurringInvestments.map((sip, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'var(--background-light)', borderRadius: 2 }}>
                  <Typography variant="body2">{sip.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹{sip.amount.toLocaleString()}/month
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Card>

      {/* Recurring EMIs Section */}
      {emiDetails.length > 0 && (
        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--border-light)', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate />
            Recurring EMIs
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {emiDetails.map((loan, idx) => (
              <Card key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--background-light)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{loan.type || 'Loan'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Principal: ₹{loan.principal} | Rate: {loan.interest}% | Tenure: {loan.tenureValue} {loan.tenureType}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--error)' }}>
                    EMI: ₹{loan.emi.toLocaleString()}/month
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Card>
      )}

      {/* Investment Pie Chart Section */}
      {pieGroups.length > 0 && (
        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--border-light)', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            Investment Allocation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <PieChart data={pieGroups} />
            <Box>
              {pieGroups.map((g, i) => (
                <Box key={g.label} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: g.color, borderRadius: 2, mr: 1 }} />
                  <Typography variant="body2">{g.label}: {((g.value / pieGroups.reduce((sum, g) => sum + g.value, 0)) * 100).toFixed(1)}% (₹{g.value.toLocaleString()})</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
      )}

      {/* Strategy recommendations from risk assessment */}
      {recommendation && (
        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--border-light)', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment />
            Strategy Recommendations
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Based on your risk assessment, here are tailored investment strategy ideas.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Model Strategy
            </Typography>
            <Typography variant="body2" sx={{ color: '#424242', whiteSpace: 'pre-line' }}>
              {recommendation.recommendation}
            </Typography>
          </Box>
          {recommendation.strategies?.primary && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Primary Strategy: {recommendation.strategies.primary.title}
              </Typography>
              {recommendation.strategies.primary.targetAllocation && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 1.5 }}>
                  {Object.entries(recommendation.strategies.primary.targetAllocation).map(
                    ([k, v]: [string, any]) => (
                      <Chip
                        key={k}
                        label={`${k}: ${v}%`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(25,118,210,0.08)',
                          borderRadius: 2,
                          fontSize: 12,
                        }}
                      />
                    )
                  )}
                </Box>
              )}
              {recommendation.strategies.primary.instruments && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Suggested instruments
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {recommendation.strategies.primary.instruments.map((inst: string) => (
                      <li key={inst} style={{ fontSize: 13, marginBottom: 2 }}>
                        {inst}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
              {recommendation.strategies.primary.narrative && (
                <Typography variant="body2" sx={{ color: '#424242', whiteSpace: 'pre-line' }}>
                  {recommendation.strategies.primary.narrative}
                </Typography>
              )}
            </Box>
          )}
          {recommendation.strategies?.implementationTips && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Implementation Tips
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {recommendation.strategies.implementationTips.map((tip: string) => (
                  <li key={tip} style={{ fontSize: 13, marginBottom: 2 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </Box>
          )}
          {recommendation.comparison && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Portfolio Comparison
              </Typography>
              <Typography variant="body2" sx={{ color: '#424242', whiteSpace: 'pre-line' }}>
                {recommendation.comparison}
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Show persona and allow to proceed to goals/finance only after risk assessment is done */}
      {riskAssessmentDone && (
        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--border-light)', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security />
            Your Risk Profile
          </Typography>
          {persona && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Persona Code: {persona.code}</Typography>
              <Typography variant="body2" color="text.secondary">{persona.label}</Typography>
              <Typography variant="body2" color="text.secondary">{persona.description}</Typography>
            </Box>
          )}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={startGoalsFlow}
            >
              Proceed to Personal Goals & Finance
            </Button>
          </Box>
        </Card>
      )}
      {/* Personal Goals & Finance Flow Section (hidden until risk assessment is done) */}
      {riskAssessmentDone && goalsFlowActive && (
        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--border-light)', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            Personal Goals & Finance
          </Typography>
          {/* ...existing goals/finance questions and recommendations UI... */}
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ px: 4, py: 1.5 }}
        >
          Back to Form
        </Button>
        
        <Button
          variant="contained"
          startIcon={loadingRecommendation ? <CircularProgress size={20} /> : <Security />}
          onClick={onRecommend}
          disabled={loadingRecommendation}
          sx={{
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            '&:hover': {
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
            }
          }}
        >
          {loadingRecommendation ? 'Generating...' : 'Get Risk Assessment'}
        </Button>
      </Box>
    </Box>
  );
}

// RiskQuiz component (custom, no MUI)
const firstQuestion = 'How would you describe your investment knowledge?';
const firstOptions = ['None', 'Basic', 'Moderate', 'Advanced'];
const branchQuestions: Record<string, string[]> = {
  None: [
    'Are you comfortable with basic savings accounts and FDs?',
    'Do you prefer guaranteed returns over higher but uncertain returns?',
    'How often do you review your finances?',
    'Would you like to learn more about investing?',
    'What is your main financial goal?',
    'How do you feel about taking any risk with your money?',
    'Do you have any debts or loans?'
  ],
  Basic: [
    'Have you invested in mutual funds or stocks before?',
    'How do you react to small losses in your investments?',
    'What is your preferred investment horizon?',
    'How much of your income do you save or invest monthly?',
    'Do you track your expenses and investments regularly?',
    'What is your main financial goal?',
    'Do you have any debts or loans?'
  ],
  Moderate: [
    'How do you diversify your investments?',
    'What percentage of your portfolio is in equities?',
    'How do you react to market volatility?',
    'What is your investment horizon?',
    'How much of your income do you invest monthly?',
    'Do you rebalance your portfolio regularly?',
    'Do you have any debts or loans?'
  ],
  Advanced: [
    'Do you invest in derivatives, international markets, or alternative assets?',
    'How do you manage risk in your portfolio?',
    'What is your annualized return expectation?',
    'How do you react to a 20% drawdown?',
    'What is your investment horizon?',
    'How often do you review and adjust your portfolio?',
    'Do you have any debts or loans?'
  ]
};
const branchOptions: Record<string, string[][]> = {
  None: [
    ['Yes', 'No'],
    ['Yes', 'No'],
    ['Rarely', 'Sometimes', 'Often'],
    ['Yes', 'No'],
    ['Wealth preservation', 'Growth', 'Income'],
    ['Not comfortable', 'Somewhat comfortable', 'Comfortable'],
    ['None', 'Low', 'Moderate', 'High']
  ],
  Basic: [
    ['Yes', 'No'],
    ['Sell immediately', 'Wait and watch', 'Buy more'],
    ['<1 year', '1-3 years', '3-5 years', '>5 years'],
    ['<10%', '10-20%', '20-40%', '>40%'],
    ['Yes', 'No'],
    ['Wealth preservation', 'Growth', 'Income'],
    ['None', 'Low', 'Moderate', 'High']
  ],
  Moderate: [
    ['Single asset', 'Multiple assets', 'Across asset classes'],
    ['<20%', '20-50%', '50-80%', '>80%'],
    ['Sell immediately', 'Wait and watch', 'Buy more', 'No reaction'],
    ['<1 year', '1-3 years', '3-5 years', '>5 years'],
    ['<10%', '10-20%', '20-40%', '>40%'],
    ['Yes', 'No'],
    ['None', 'Low', 'Moderate', 'High']
  ],
  Advanced: [
    ['Yes', 'No'],
    ['Hedging', 'Diversification', 'Stop-losses', 'All of these'],
    ['<8%', '8-12%', '12-20%', '>20%'],
    ['Sell immediately', 'Wait and watch', 'Buy more', 'No reaction'],
    ['<1 year', '1-3 years', '3-5 years', '>5 years'],
    ['Monthly', 'Quarterly', 'Annually', 'Never'],
    ['None', 'Low', 'Moderate', 'High']
  ]
};

function RiskQuiz({ data, onBack, onQuizComplete }: { data: FormData; onBack: () => void; onQuizComplete: (quizResult: any) => void }) {
  // New question arrays from previous step
  const demographicsQuestions = [
    {
      key: 'ageGroup',
      label: 'Age Group',
      type: 'radio',
      options: [
        '18–25 years (Early Career)',
        '26–35 years (Emerging Accumulator)',
        '36–50 years (Established Professional)',
        '51–65 years (Pre-Retirement)',
        'Over 65 years (Retiree or Late Stage)'
      ]
    }
  ];

  const debtQuestions = [
    {
      key: 'hasDebt',
      label: 'Do you currently have any outstanding debt or loans?',
      type: 'radio',
      options: ['No', 'Yes']
    }
    // If Yes, show loan details as before
  ];

  const knowledgeLevels = [
    'Minimal (Just starting, little experience)',
    'Moderate (Comfortable with basics, some experience)',
    'Advanced (Deep understanding; manage portfolio aggressively)'
  ];

  const minimalQuestions = [
    'Do you understand what mutual funds are?',
    'Have you ever invested in stocks or equity-related products?',
    'Do you know what SIP (Systematic Investment Plan) means?',
    'Are you aware of risks like market volatility, liquidity, and inflation?'
  ];

  const moderateQuestions = [
    {
      label: 'How do you typically select your investments?',
      type: 'radio',
      options: [
        'I rely on recommendations from friends/family.',
        'I follow advice from online research or financial news.',
        'I consult with a financial advisor.',
        'I use robo-advisors or online investment platforms.',
        'I make decisions independently, using my own research.'
      ]
    },
    {
      label: 'How often do you review your investment portfolio?',
      type: 'radio',
      options: [
        'Rarely or only when prompted.',
        'Once or twice a year.',
        'Quarterly.',
        'Monthly.',
        'Weekly or more often.'
      ]
    },
    {
      label: 'How comfortable are you with asset allocation and diversification principles?',
      type: 'radio',
      options: [
        'Not comfortable, I prefer to keep things simple.',
        'Somewhat comfortable, but I prefer expert advice.',
        'Comfortable, I apply these principles on my own.',
        'Very comfortable, I actively review and adjust allocation.'
      ]
    },
    {
      label: 'Which types of investments have you used?',
      type: 'checkbox',
      options: [
        'Bank deposits, FDs, RDs',
        'Mutual funds (equity, debt, hybrid)',
        'Direct stocks/equities',
        'Bonds',
        'Gold / Precious metals',
        'Real estate',
        'Alternative investments (REITs, crypto, P2P lending, etc.)'
      ]
    },
    {
      label: 'When markets are volatile, how do you typically react?',
      type: 'radio',
      options: [
        'I get worried and consider selling my investments.',
        'I wait and watch before making any decisions.',
        'I usually hold my current investments.',
        'I look for buying opportunities.'
      ]
    }
  ];

  const advancedQuestions = [
    {
      label: 'How do you manage your investment portfolio?',
      type: 'radio',
      options: [
        'Entirely by myself (DIY approach).',
        'With occasional help from professionals/consultants.',
        'With regular input from a financial advisor or wealth manager.',
        'Through automated/algorithmic platforms (e.g., robo-advisors).'
      ]
    },
    {
      label: 'Which advanced instruments have you invested in?',
      type: 'checkbox',
      options: [
        'Derivatives (options, futures, swaps)',
        'International equities, bonds, or funds',
        'PMS/AIFs (portfolio management/alternative investment funds)',
        'Startups (angel or VC investments)',
        'Real estate investment trusts (REITs, INVITs)',
        'Cryptocurrencies or digital assets',
        'Structured products'
      ]
    },
    {
      label: 'How frequently do you rebalance your portfolio?',
      type: 'radio',
      options: [
        'Rarely or never.',
        'Only when my advisor suggests.',
        'Once a year.',
        'Every 6 months.',
        'Quarterly or more frequently.'
      ]
    },
    {
      label: 'What is your primary consideration while making investment decisions?',
      type: 'radio',
      options: [
        'Maximizing returns, even with higher risk.',
        'Managing risk and return equally.',
        'Tax efficiency and long-term compounding.',
        'Diversification across asset classes and geographies.',
        'Sustainable/ESG investments.'
      ]
    },
    {
      label: 'How do you monitor investment performance?',
      type: 'radio',
      options: [
        'Regular reports/statements from platforms or advisors.',
        'Custom dashboards or spreadsheets.',
        'Real-time tracking using mobile or desktop apps.',
        'I rely on annual/semi-annual reviews only.'
      ]
    }
  ];

  const goalsQuestions = [
    {
      key: 'primaryObjective',
      label: 'What is your primary financial objective?',
      type: 'radio',
      options: [
        'Preserve Current Wealth (Stability, capital protection)',
        'Grow Wealth (Aggressive appreciation)',
        'Generate Income (Regular cashflow/dividends)',
        'Retirement Planning',
        'Funding Child\'s Education',
        'Major Purchase (Home/Auto)',
        'Other'
      ],
      other: true
    },
    {
      key: 'timeHorizon',
      label: 'What is your planned investment time horizon for major goals?',
      type: 'radio',
      options: [
        'Less than 1 year (Short Term)',
        '1–3 years (Short-Medium Term)',
        '3–5 years (Medium Term)',
        'More than 5 years (Long Term/Retirement)'
      ]
    },
    {
      key: 'savingsRate',
      label: 'What portion of your monthly income do you consistently save or invest?',
      type: 'radio',
      options: [
        'Less than 10%',
        '10%–20%',
        '20%–40%',
        'Over 40%',
        'It varies each month'
      ]
    },
    {
      key: 'marketDownturn',
      label: 'Suppose your investment dropped by 20% in a market downturn. What would you most likely do?',
      type: 'radio',
      options: [
        'Sell all investments to avoid further losses',
        'Sell a portion, wait for stabilization',
        'Do nothing, wait for recovery',
        'Invest more while prices are lower',
        'Unsure'
      ]
    },
    {
      key: 'investmentAttitude',
      label: 'Which statement best describes your investment attitude?',
      type: 'radio',
      options: [
        'I avoid risk and prefer guaranteed returns',
        'I can accept modest risk for slightly higher returns',
        'I am comfortable with significant risk for potentially higher returns',
        'My risk preference changes based on market/news'
      ]
    }
  ];

  // State for answers
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [knowledgeLevel, setKnowledgeLevel] = useState('');
  const [error, setError] = useState('');

  // Build the full question flow dynamically
  let questionFlow: any[] = [
    ...demographicsQuestions,
    ...debtQuestions
  ];
  // Insert loan details if needed
  if (answers.hasDebt === 'Yes') {
    // For simplicity, ask for one loan at a time (could be extended)
    questionFlow.push({
      key: 'loanDetails',
      label: 'Please provide details for your loan:',
      type: 'loan',
    });
  }
  // Knowledge level
  questionFlow.push({
    key: 'knowledgeLevel',
    label: 'How would you assess your investment knowledge?',
    type: 'radio',
    options: knowledgeLevels
  });
  // Branching for knowledge
  if (knowledgeLevel.startsWith('Minimal')) {
    minimalQuestions.forEach((q, i) => {
      questionFlow.push({
        key: `minimal_${i}`,
        label: q,
        type: 'radio',
        options: ['Yes', 'No']
      });
    });
  } else if (knowledgeLevel.startsWith('Moderate')) {
    moderateQuestions.forEach((q, i) => {
      questionFlow.push({
        key: `moderate_${i}`,
        label: q.label,
        type: q.type,
        options: q.options
      });
    });
  } else if (knowledgeLevel.startsWith('Advanced')) {
    advancedQuestions.forEach((q, i) => {
      questionFlow.push({
        key: `advanced_${i}`,
        label: q.label,
        type: q.type,
        options: q.options
      });
    });
  }
  // Goals and behavioral
  questionFlow = questionFlow.concat(goalsQuestions);

  // Render current question
  const currentQ = questionFlow[step];

  // Handlers
  const handleChange = (key: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [key]: value }));
    setError('');
    if (key === 'knowledgeLevel') setKnowledgeLevel(value);
  };

  const handleNext = () => {
    // Validation
    if (currentQ.type === 'radio' && !answers[currentQ.key]) {
      setError('Please select an option.');
      return;
    }
    if (currentQ.type === 'checkbox' && (!answers[currentQ.key] || answers[currentQ.key].length === 0)) {
      setError('Please select at least one option.');
      return;
    }
    if (currentQ.type === 'loan' && (!answers.loanType || !answers.loanPrincipal || !answers.loanInterest || !answers.loanTenure)) {
      setError('Please fill all loan details.');
      return;
    }
    setStep(step + 1);
  };
  const handleBack = () => setStep(Math.max(0, step - 1));
  const handleSubmit = () => {
    onQuizComplete(answers);
  };

  // Render logic for each question type
  let content = null;
  if (currentQ.type === 'radio') {
    const value = answers[currentQ.key] ?? '';
    content = (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>{currentQ.label}</Typography>
        {currentQ.options.map((opt: string) => (
          <label key={opt} style={{ display: 'block', marginBottom: 8 }}>
            <input
              type="radio"
              name={currentQ.key}
              value={opt}
              checked={value === opt}
              onChange={e => handleChange(currentQ.key, e.target.value)}
            /> {opt}
          </label>
        ))}
        {currentQ.other && (
          <TextField
            label="Other (please specify)"
            value={answers[`${currentQ.key}_other`] ?? ''}
            onChange={e => handleChange(`${currentQ.key}_other`, e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </>
    );
  } else if (currentQ.type === 'checkbox') {
    const value: string[] = Array.isArray(answers[currentQ.key]) ? answers[currentQ.key] : [];
    content = (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>{currentQ.label}</Typography>
        {currentQ.options.map((opt: string) => (
          <label key={opt} style={{ display: 'block', marginBottom: 8 }}>
            <input
              type="checkbox"
              name={currentQ.key}
              value={opt}
              checked={value.includes(opt)}
              onChange={e => {
                let newArr = value;
                if (e.target.checked) {
                  newArr = [...newArr, opt];
                } else {
                  newArr = newArr.filter((v: string) => v !== opt);
                }
                handleChange(currentQ.key, newArr);
              }}
            /> {opt}
          </label>
        ))}
        {currentQ.other && (
          <TextField
            label="Other (please specify)"
            value={answers[`${currentQ.key}_other`] ?? ''}
            onChange={e => handleChange(`${currentQ.key}_other`, e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </>
    );
  } else if (currentQ.type === 'loan') {
    content = (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>{currentQ.label}</Typography>
        <TextField label="Type of Loan" value={answers.loanType ?? ''} onChange={e => handleChange('loanType', e.target.value)} sx={{ mb: 2 }} fullWidth />
        <TextField label="Outstanding Principal Amount (₹)" value={answers.loanPrincipal ?? ''} onChange={e => handleChange('loanPrincipal', e.target.value)} sx={{ mb: 2 }} fullWidth />
        <TextField label="Interest Rate (% per annum)" value={answers.loanInterest ?? ''} onChange={e => handleChange('loanInterest', e.target.value)} sx={{ mb: 2 }} fullWidth />
        <TextField label="Remaining Tenure (Months/Years)" value={answers.loanTenure ?? ''} onChange={e => handleChange('loanTenure', e.target.value)} sx={{ mb: 2 }} fullWidth />
      </>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, var(--secondary), #ff6b9d)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
            <Security />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Risk Profile Assessment
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Let's understand your investment preferences and risk tolerance
            </Typography>
          </Box>
        </Box>
      </Paper>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--border-light)' }}>
        {content}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            disabled={step === 0}
            sx={{ px: 3, py: 1.5 }}
          >
            Back
          </Button>
          {step < questionFlow.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={handleNext}
              sx={{
                px: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<CheckCircle />}
              onClick={handleSubmit}
              sx={{
                px: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, var(--success), #4caf50)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2e7d32, var(--success))',
                }
              }}
            >
              Complete Assessment
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ px: 3, py: 1.5 }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

// Client-side only wrapper to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
