// Persona decision tree and mapping for user financial profiles

export type DTILevel = '<36%' | '36–43%' | '43–50%' | '≥50%';
export type KnowledgeLevel = 'Minimal' | 'Moderate' | 'Advanced';
export type Behaviour = 'Cautious' | 'Moderate' | 'Aggressive';
export type Reaction = 'Sell' | 'Hold' | 'Buy More' | 'Unsure' | 'Sell/Unsure' | 'Hold/Buy More';

export interface PersonaInput {
  ageGroup: string; // e.g., '18–25 years (Early Career)'
  dti: DTILevel;
  knowledge: KnowledgeLevel;
  behaviour: Behaviour;
  reaction: Reaction;
}

export interface PersonaResult {
  code: string;
  label: string;
  description: string;
}

export function getUserPersona(input: PersonaInput): PersonaResult {
  const { ageGroup, dti, knowledge, behaviour, reaction } = input;
  // Age group mapping
  let ageKey = '';
  if (ageGroup.startsWith('18')) ageKey = 'A';
  else if (ageGroup.startsWith('26')) ageKey = 'B';
  else if (ageGroup.startsWith('36')) ageKey = 'C';
  else if (ageGroup.startsWith('51')) ageKey = 'D';
  else if (ageGroup.startsWith('Over') || ageGroup.startsWith('65')) ageKey = 'E';

  // Table mapping logic
  // A: 18–25
  if (ageKey === 'A') {
    if (dti === '<36%' && knowledge === 'Minimal' && behaviour === 'Cautious' && (reaction === 'Unsure' || reaction === 'Sell')) {
      return { code: 'A1', label: 'Low debt, conservative, just starting out.', description: 'You are starting your financial journey with low debt and a conservative approach.' };
    }
    if (dti === '36–43%' && knowledge === 'Minimal' && behaviour === 'Moderate' && reaction === 'Hold') {
      return { code: 'A2', label: 'Student/saver, balances small loan & risk.', description: 'You are balancing small loans and moderate risk as a student or early saver.' };
    }
    if (dti === '43–50%' && knowledge === 'Moderate' && behaviour === 'Cautious' && reaction === 'Hold') {
      return { code: 'A3', label: 'Somewhat high debt, careful but informed.', description: 'You have somewhat high debt but are careful and informed.' };
    }
    if (dti === '≥50%' && knowledge === 'Moderate' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'A4', label: 'High debt, but aggressive risk taker.', description: 'You have high debt but are an aggressive risk taker.' };
    }
    if (dti === '<36%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'A5', label: 'Rare case, high skill and low debt.', description: 'You are a rare case: highly skilled, aggressive, and with low debt.' };
    }
    if (dti === '≥50%' && (knowledge === 'Minimal' || knowledge === 'Moderate') && behaviour === 'Cautious' && (reaction === 'Sell' || reaction === 'Unsure')) {
      return { code: 'A6', label: 'Financially stretched, struggles with volatility.', description: 'You are financially stretched and may struggle with market volatility.' };
    }
    if (dti === '<36%' && knowledge === 'Minimal' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'A7', label: 'Low debt, learning, open to moderate risk.', description: 'You are starting out, learning, and open to moderate risk.' };
    }
    if (dti === '<36%' && knowledge === 'Moderate' && behaviour === 'Moderate' && reaction === 'Hold') {
      return { code: 'A8', label: 'Low debt, some experience, steady approach.', description: 'You have low debt and some experience, taking a steady approach.' };
    }
    if (dti === '36–43%' && knowledge === 'Minimal' && behaviour === 'Cautious' && (reaction === 'Sell' || reaction === 'Unsure')) {
      return { code: 'A9', label: 'Moderate debt, cautious, needs guidance.', description: 'You have moderate debt and are cautious, needing more guidance.' };
    }
    if (dti === '43–50%' && knowledge === 'Minimal' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'A10', label: 'High risk, low knowledge, vulnerable.', description: 'You are taking high risks with little knowledge and are financially vulnerable.' };
    }
    if (dti === '≥50%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'A11', label: 'Exceptionally rare, high risk, high skill, high leverage.', description: 'You are an outlier: high risk, high skill, and high leverage.' };
    }
    if (dti === '43–50%' && knowledge === 'Advanced' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Buy More')) {
      return { code: 'A12', label: 'Young, skilled, but over-leveraged.', description: 'You are young and skilled, but may be over-leveraged.' };
    }
  }
  // B: 26–35
  if (ageKey === 'B') {
    if (dti === '≥50%' && knowledge === 'Minimal' && behaviour === 'Cautious' && reaction === 'Sell') {
      return { code: 'B1', label: 'Young family, heavy loans, low risk appetite.', description: 'You have a young family, heavy loans, and a low risk appetite.' };
    }
    if (dti === '43–50%' && knowledge === 'Moderate' && behaviour === 'Moderate' && reaction === 'Hold') {
      return { code: 'B2', label: 'Growing family, higher loans, decent control.', description: 'You have a growing family, higher loans, and decent control.' };
    }
    if (dti === '<36%' && knowledge === 'Moderate' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'B3', label: 'Financially strong, confident investor.', description: 'You are financially strong and a confident investor.' };
    }
    if (dti === '36–43%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'B4', label: 'Entrepreneur, high income, accepts risk & leverage.', description: 'You are an entrepreneur with high income, accepting risk and leverage.' };
    }
    if (dti === '≥50%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && (reaction === 'Hold' || reaction === 'Buy More')) {
      return { code: 'B5', label: 'High risk, skills & awareness, but at credit limits.', description: 'You have high risk, skills, and awareness, but are at your credit limits.' };
    }
    if (dti === '36–43%' && knowledge === 'Minimal' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'B6', label: 'Moderate debt, learning, open to risk.', description: 'You have moderate debt and are learning, open to some risk.' };
    }
    if (dti === '43–50%' && knowledge === 'Minimal' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'B7', label: 'Risky, low knowledge, high leverage.', description: 'You are taking high risks with little knowledge and high leverage. Consider more education and risk management.' };
    }
    if (dti === '<36%' && knowledge === 'Advanced' && behaviour === 'Cautious' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'B8', label: 'Expert, but prefers safety.', description: 'You have advanced knowledge but prefer to play it safe.' };
    }
    if (dti === '≥50%' && knowledge === 'Moderate' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'B9', label: 'High leverage, moderate skill, aggressive.', description: 'You are highly leveraged, moderately skilled, and aggressive.' };
    }
    if (dti === '43–50%' && knowledge === 'Advanced' && behaviour === 'Cautious' && (reaction === 'Sell' || reaction === 'Unsure')) {
      return { code: 'B10', label: 'High debt, skilled but cautious.', description: 'You have high debt, are skilled, but remain cautious.' };
    }
  }
  // C: 36–50
  if (ageKey === 'C') {
    if (dti === '<36%' && knowledge === 'Moderate' && behaviour === 'Moderate' && reaction === 'Hold') {
      return { code: 'C1', label: 'Stable earner, prudent risk management.', description: 'You are a stable earner with prudent risk management.' };
    }
    if (dti === '36–43%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'C2', label: 'Professional, tactically uses debt for wealth creation.', description: 'You are a professional who tactically uses debt for wealth creation.' };
    }
    if (dti === '43–50%' && knowledge === 'Advanced' && behaviour === 'Moderate' && reaction === 'Hold') {
      return { code: 'C3', label: 'High DTI, but experience helps manage risk.', description: 'You have high DTI, but your experience helps you manage risk.' };
    }
    if (dti === '≥50%' && (knowledge === 'Moderate' || knowledge === 'Advanced') && behaviour === 'Cautious' && (reaction === 'Sell' || reaction === 'Unsure')) {
      return { code: 'C4', label: 'Stressed, at risk of financial strain and caution.', description: 'You are stressed, at risk of financial strain, and cautious.' };
    }
    if (dti === '<36%' && knowledge === 'Minimal' && behaviour === 'Cautious' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'C5', label: 'Low debt, cautious, prefers stability.', description: 'You have low debt and prefer stability.' };
    }
    if (dti === '36–43%' && knowledge === 'Minimal' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'C6', label: 'Moderate debt, learning, open to risk.', description: 'You have moderate debt and are learning, open to some risk.' };
    }
    if (dti === '43–50%' && knowledge === 'Minimal' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'C7', label: 'Risky, low knowledge, high leverage.', description: 'You are taking high risks with little knowledge and high leverage.' };
    }
    if (dti === '≥50%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'C8', label: 'Exceptionally rare, high risk, high skill, high leverage.', description: 'You are an outlier: high risk, high skill, and high leverage.' };
    }
    if (dti === '43–50%' && knowledge === 'Advanced' && behaviour === 'Cautious' && (reaction === 'Sell' || reaction === 'Unsure')) {
      return { code: 'C9', label: 'High debt, skilled but cautious.', description: 'You have high debt, are skilled, but remain cautious.' };
    }
  }
  // D: 51–65
  if (ageKey === 'D') {
    if (dti === '<36%' && knowledge === 'Moderate' && behaviour === 'Cautious' && reaction === 'Hold') {
      return { code: 'D1', label: 'Conservative, solid finances, prepping for retirement.', description: 'You are conservative, have solid finances, and are prepping for retirement.' };
    }
    if (dti === '36–43%' && knowledge === 'Advanced' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Buy More')) {
      return { code: 'D2', label: 'Still optimizing, but aware of limits.', description: 'You are still optimizing your finances, but are aware of your limits.' };
    }
    if (dti === '≥50%' && (knowledge === 'Minimal' || knowledge === 'Moderate') && behaviour === 'Cautious' && reaction === 'Sell') {
      return { code: 'D3', label: 'Late-career, high DTI, prioritizes stability.', description: 'You are late-career, have high DTI, and prioritize stability.' };
    }
    if (dti === '<36%' && knowledge === 'Advanced' && behaviour === 'Cautious' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'D4', label: 'Expert, but prefers safety.', description: 'You have advanced knowledge but prefer to play it safe.' };
    }
    if (dti === '36–43%' && knowledge === 'Minimal' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'D5', label: 'Moderate debt, learning, open to risk.', description: 'You have moderate debt and are learning, open to some risk.' };
    }
    if (dti === '43–50%' && knowledge === 'Minimal' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'D6', label: 'Risky, low knowledge, high leverage.', description: 'You are taking high risks with little knowledge and high leverage.' };
    }
    if (dti === '≥50%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'D7', label: 'Exceptionally rare, high risk, high skill, high leverage.', description: 'You are an outlier: high risk, high skill, and high leverage.' };
    }
    if (dti === '43–50%' && knowledge === 'Advanced' && behaviour === 'Cautious' && (reaction === 'Sell' || reaction === 'Unsure')) {
      return { code: 'D8', label: 'High debt, skilled but cautious.', description: 'You have high debt, are skilled, but remain cautious.' };
    }
  }
  // E: 65+
  if (ageKey === 'E') {
    if (dti === '<36%' && knowledge === 'Minimal' && behaviour === 'Cautious' && reaction === 'Sell') {
      return { code: 'E1', label: 'Low/no debt, avoids risk, preserves capital.', description: 'You have low or no debt, avoid risk, and focus on preserving capital.' };
    }
    if (dti === '36–43%' && knowledge === 'Moderate' && behaviour === 'Cautious' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'E2', label: 'Light debt, manages with care, income focus.', description: 'You have light debt, manage with care, and focus on income.' };
    }
    if (dti === '≥50%' && knowledge === 'Advanced' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Buy More')) {
      return { code: 'E3', label: 'Exceptionally financially active, takes measured risks.', description: 'You are exceptionally financially active and take measured risks.' };
    }
    if (dti === '36–43%' && knowledge === 'Minimal' && behaviour === 'Moderate' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'E4', label: 'Moderate debt, learning, open to risk.', description: 'You have moderate debt and are learning, open to some risk.' };
    }
    if (dti === '43–50%' && knowledge === 'Minimal' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'E5', label: 'Risky, low knowledge, high leverage.', description: 'You are taking high risks with little knowledge and high leverage.' };
    }
    if (dti === '<36%' && knowledge === 'Advanced' && behaviour === 'Cautious' && (reaction === 'Hold' || reaction === 'Unsure')) {
      return { code: 'E6', label: 'Expert, but prefers safety.', description: 'You have advanced knowledge but prefer to play it safe.' };
    }
    if (dti === '≥50%' && knowledge === 'Advanced' && behaviour === 'Aggressive' && reaction === 'Buy More') {
      return { code: 'E7', label: 'Exceptionally rare, high risk, high skill, high leverage.', description: 'You are an outlier: high risk, high skill, and high leverage.' };
    }
    if (dti === '43–50%' && knowledge === 'Advanced' && behaviour === 'Cautious' && (reaction === 'Sell' || reaction === 'Unsure')) {
      return { code: 'E8', label: 'High debt, skilled but cautious.', description: 'You have high debt, are skilled, but remain cautious.' };
    }
  }
  // Default fallback
  return { code: 'GEN', label: 'General Persona', description: 'Your profile is unique. Consider a custom financial plan.' };
} 