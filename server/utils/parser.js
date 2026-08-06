// server/utils/parser.js
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
  trimValues: true,
});

function num(x) {
  if (x === null || x === undefined) return null;
  const n = Number(String(x).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function arrayify(x) {
  return Array.isArray(x) ? x : x ? [x] : [];
}

// Deep search helpers for fast-xml-parser objects
function deepFind(obj, key) {
  if (obj == null) return undefined;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const v = deepFind(item, key);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  if (typeof obj === "object") {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
    for (const k of Object.keys(obj)) {
      const v = deepFind(obj[k], key);
      if (v !== undefined) return v;
    }
  }
  return undefined;
}

function deepFindAll(obj, key, acc = []) {
  if (obj == null) return acc;
  if (Array.isArray(obj)) {
    for (const item of obj) deepFindAll(item, key, acc);
    return acc;
  }
  if (typeof obj === "object") {
    if (Object.prototype.hasOwnProperty.call(obj, key)) acc.push(obj[key]);
    for (const k of Object.keys(obj)) deepFindAll(obj[k], key, acc);
  }
  return acc;
}

function joinName(first, last) {
  const f = (first || "").toString().trim();
  const l = (last || "").toString().trim();
  const full = `${f}${f && l ? " " : ""}${l}`;
  return full || null;
}

function parseReport(xml) {
  const obj = parser.parse(xml);
  const top = Object.keys(obj)[0];
  const root = obj[top] || obj;

  // ===== Basic details (Experian: Current_Application/Current_Applicant_Details) =====
  const firstName = deepFind(root, "First_Name");
  const lastName = deepFind(root, "Last_Name");
  const mobile = deepFind(root, "MobilePhoneNumber");
  const pan =
    deepFind(root, "Income_TAX_PAN") || deepFind(root, "IT_PAN") || deepFind(root, "PAN");
  const bureauScore = num(deepFind(root, "BureauScore"));

  const basic = {
    name: joinName(firstName, lastName),
    phone: mobile || null,
    pan: pan || null,
    bureauScore: bureauScore ?? null,
  };

  // ===== Summary totals (Experian: CAIS_Summary -> Credit_Account / Total_Outstanding_Balance) =====
  // Accounts
  const totalAccounts = num(deepFind(root, "CreditAccountTotal"));
  const activeAccounts = num(deepFind(root, "CreditAccountActive"));
  const closedAccounts = num(deepFind(root, "CreditAccountClosed"));

  // Outstanding balances
  const securedAmount = num(deepFind(root, "Outstanding_Balance_Secured"));
  const unsecuredAmount = num(deepFind(root, "Outstanding_Balance_UnSecured"));

  // Enquiries last 7 days (CAPS / TotalCAPS)
  const enquiriesLast7Days =
    num(deepFind(root, "TotalCAPSLast7Days")) ?? num(deepFind(root, "CAPSLast7Days"));

  const summary = {
    totalAccounts,
    activeAccounts,
    closedAccounts,
    securedAmount,
    unsecuredAmount,
    enquiriesLast7Days,
  };

  // ===== Accounts (Experian: list of CAIS_Account_DETAILS) =====
  // There are many CAIS_Account_DETAILS nodes; the "account rows" are the ones having fields like Subscriber_Name/Account_Type/etc.
  const detailsNodesNested = deepFindAll(root, "CAIS_Account_DETAILS");
  const detailsNodes = [];
  // Flatten because deepFindAll returns values which may themselves be arrays
  for (const node of detailsNodesNested) {
    if (Array.isArray(node)) detailsNodes.push(...node);
    else detailsNodes.push(node);
  }

  const accountRows = detailsNodes.filter(
    (d) =>
      d &&
      typeof d === "object" &&
      (d.Subscriber_Name || d.Account_Type || d.Account_Status || d.Current_Balance)
  );

  const accounts = accountRows.map((a) => ({
    lender: a.Subscriber_Name || null,
    type: a.Account_Type || null,
    status: a.Account_Status || null,
    openedOn: a.Open_Date || null,
    closedOn: a.Date_Closed || null,
    creditLimit: num(a.Credit_Limit_Amount || a.Highest_Credit_or_Original_Loan_Amount),
    currentBalance: num(a.Current_Balance),
    overdue: num(a.Amount_Past_Due),
    emi: num(a.Scheduled_Monthly_Payment_Amount),
    portfolioType: a.Portfolio_Type || null,
  }));

  // ===== Enquiries (optional; not always detailed in this XML) =====
  const enquiries = []; // can be extended if your XML includes detailed enquiry nodes

  return {
    rootKey: top,
    basic,
    summary,
    accounts,
    enquiries,
  };
}

module.exports = { parseReport };
