export interface IBREInput {
  dob: string | Date;
  salary: number;
  pan: string;
  employmentMode: string;
}

export interface IBREResult {
  isEligible: boolean;
  rejectionReason?: string;
}

export const runBRE = (input: IBREInput): IBREResult => {
  const { dob, salary, pan, employmentMode } = input;

  // 1. Validate PAN format
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan.toUpperCase())) {
    return {
      isEligible: false,
      rejectionReason: "Invalid PAN format. Must be 10 characters: 5 uppercase letters, 4 digits, 1 uppercase letter."
    };
  }

  // 2. Validate Employment Mode
  if (employmentMode.toLowerCase() === "unemployed") {
    return {
      isEligible: false,
      rejectionReason: "Unemployed applicants are not eligible for a loan."
    };
  }

  // 3. Validate Age (23 to 50)
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 23 || age > 50) {
    return {
      isEligible: false,
      rejectionReason: `Applicant age must be between 23 and 50 years. Current calculated age is ${age}.`
    };
  }

  // 4. Validate Monthly Salary
  if (salary < 25000) {
    return {
      isEligible: false,
      rejectionReason: "Monthly salary must be at least ₹25,000."
    };
  }

  return {
    isEligible: true
  };
};
