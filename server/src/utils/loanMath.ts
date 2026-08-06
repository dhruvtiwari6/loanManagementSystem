export interface ILoanCalcResult {
  principal: number;
  tenureDays: number;
  interestRate: number; // 12% (stored as 12)
  simpleInterest: number;
  totalRepayment: number;
}

export const calculateLoanTerms = (principal: number, tenureDays: number): ILoanCalcResult => {
  const interestRate = 12; // 12% fixed p.a.
  const rateFraction = interestRate / 100;
  
  // Simple Interest: P * R * T / 365
  const interestRaw = (principal * rateFraction * tenureDays) / 365;
  const simpleInterest = Math.round(interestRaw * 100) / 100;
  const totalRepayment = Math.round((principal + simpleInterest) * 100) / 100;

  return {
    principal,
    tenureDays,
    interestRate,
    simpleInterest,
    totalRepayment
  };
};
