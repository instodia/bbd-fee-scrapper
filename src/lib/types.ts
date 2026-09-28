export interface Organization {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  aliases: string[];
}

export const ORGANIZATIONS: Organization[] = [
  {
    id: "1",
    code: "BBDU",
    name: "Babu Banarasi Das University",
    subtitle: "State Private University, Lucknow",
    aliases: ["BBDU", "BBD UNIVERSITY", "BABU BANARASI DAS UNIVERSITY", "BBD UNIVERSITY LUCKNOW"],
  },
  {
    id: "2",
    code: "BBDITM",
    name: "BBD Institute of Technology and Management",
    subtitle: "AKTU Affiliated Engineering Institute (College Code: 054)",
    aliases: [
      "BBDITM",
      "BBDNITM",
      "BBD ITM",
      "BBD NITM",
      "BBD INSTITUTE OF TECHNOLOGY AND MANAGEMENT",
      "BABU BANARASI DAS INSTITUTE OF TECHNOLOGY AND MANAGEMENT",
    ],
  },
  {
    id: "3",
    code: "BBDNIIT",
    name: "BBD Northern India Institute of Technology",
    subtitle: "AKTU Affiliated Institute (College Code: 056)",
    aliases: [
      "BBDNIIT",
      "BBD NIIT",
      "BBD NORTHERN INDIA INSTITUTE OF TECHNOLOGY",
      "BABU BANARASI DAS NORTHERN INDIA INSTITUTE OF TECHNOLOGY",
    ],
  },
  {
    id: "4",
    code: "BBDEC",
    name: "BBD Engineering College",
    subtitle: "AKTU Affiliated Engineering College (College Code: 508)",
    aliases: [
      "BBDEC",
      "BBD EC",
      "BBD ENGINEERING COLLEGE",
      "BABU BANARASI DAS ENGINEERING COLLEGE",
    ],
  },
  {
    id: "7",
    code: "VIROHAN",
    name: "Virohan Institute of Health & Management Sciences",
    subtitle: "Healthcare & Paramedical Education Partner",
    aliases: [
      "VIROHAN",
      "VIROHAN INSTITUTE",
      "VIROHAN BBD",
      "VIROHAN LUCKNOW",
      "VIROHAN INSTITUTE OF HEALTH & MANAGEMENT SCIENCES",
    ],
  },
];

export function resolveOrganization(input: string): Organization | undefined {
  if (!input) return undefined;
  const cleanInput = input.trim().toUpperCase();

  // 1. Direct ID match
  const byId = ORGANIZATIONS.find((org) => org.id === cleanInput);
  if (byId) return byId;

  // 2. Direct code match
  const byCode = ORGANIZATIONS.find((org) => org.code.toUpperCase() === cleanInput);
  if (byCode) return byCode;

  // 3. Exact alias match
  const byAlias = ORGANIZATIONS.find((org) =>
    org.aliases.some((alias) => alias.toUpperCase() === cleanInput)
  );
  if (byAlias) return byAlias;

  // 4. Substring / Fuzzy match
  const bySubstring = ORGANIZATIONS.find(
    (org) =>
      cleanInput.includes(org.code.toUpperCase()) ||
      org.name.toUpperCase().includes(cleanInput) ||
      org.aliases.some((alias) => cleanInput.includes(alias.toUpperCase()))
  );
  if (bySubstring) return bySubstring;

  return undefined;
}

export interface FeeItem {
  id: string;
  name: string;
  label: string;
  amount: number;
  formattedAmount: string;
  organizationName?: string;
  dueDate?: string;
  sfsId?: string;
  mid?: string;
  rawTypeAmount?: string;
}

export interface AcademicYearOption {
  value: string;
  label: string;
}

export interface StudentAcademicDetails {
  fullName: string;
  guardianName?: string;
  rawNameString?: string;
  program: string;
  univRollNo: string;
  regnNo: string;
  type: string;
  status: string;
  seat: string;
  category: string;
}

export interface ScrapedStudentDetails {
  success: true;
  found: true;
  studentId: string;
  customerName: string;
  mobile: string;
  email: string;
  organizationId: string;
  organizationCode: string;
  organizationName: string;
  consumerId: string;
  txnIdPrefix: string;
  academicDetails: StudentAcademicDetails;
  fees: FeeItem[];
  academicYears: AcademicYearOption[];
  sourceUrl: string;
  timestamp: string;
}

export interface MultiCollegeSearchResult {
  success: boolean;
  found: boolean;
  studentName: string;
  mobile: string;
  totalFound: number;
  records: ScrapedStudentDetails[];
  searchedColleges: {
    id: string;
    code: string;
    name: string;
    found: boolean;
    error?: string;
  }[];
  timestamp: string;
}

export interface ScrapeErrorResponse {
  success: false;
  found: false;
  error: string;
  message: string;
  details?: unknown;
}
