import * as cheerio from "cheerio";
import {
  FeeItem,
  AcademicYearOption,
  ScrapedStudentDetails,
  StudentAcademicDetails,
  Organization,
} from "./types";

const BASE_URL = "https://mybbd.in";
const FEE_PAYMENT_URL = `${BASE_URL}/fee-payment`;
const DETAILS_URL = `${BASE_URL}/fee-payment/details`;

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export class ScraperError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public isNotFound: boolean = false
  ) {
    super(message);
    this.name = "ScraperError";
  }
}

/**
 * Parses cookies from Set-Cookie headers into a Cookie header string
 */
function extractCookieHeader(responseHeaders: Headers): string {
  // node-fetch / undici may provide getSetCookie
  let setCookies: string[] = [];
  if (typeof (responseHeaders as unknown as { getSetCookie?: () => string[] }).getSetCookie === "function") {
    setCookies = (responseHeaders as unknown as { getSetCookie: () => string[] }).getSetCookie();
  } else {
    const raw = responseHeaders.get("set-cookie");
    if (raw) setCookies = [raw];
  }

  const cookieMap: Record<string, string> = {};
  for (const cookieStr of setCookies) {
    const parts = cookieStr.split(";");
    if (parts.length > 0) {
      const [key, ...vals] = parts[0].trim().split("=");
      if (key) {
        cookieMap[key.trim()] = vals.join("=");
      }
    }
  }

  return Object.entries(cookieMap)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

/**
 * Step 1: Fetches the fee-payment page to get CSRF token and session cookies
 */
export async function getCsrfTokenAndSession(): Promise<{
  token: string;
  cookies: string;
}> {
  const resp = await fetch(FEE_PAYMENT_URL, {
    method: "GET",
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new ScraperError(
      `Failed to connect to mybbd.in (${resp.status} ${resp.statusText})`,
      502
    );
  }

  const cookies = extractCookieHeader(resp.headers);
  const html = await resp.text();
  const $ = cheerio.load(html);

  const token = $('input[name="_token"]').val()?.toString();
  if (!token) {
    throw new ScraperError(
      "Could not retrieve CSRF security token from mybbd.in",
      502
    );
  }

  return { token, cookies };
}

/**
 * Step 2: Submits the search form and parses student details
 */
export async function scrapeBbdFeeDetails(
  org: Organization,
  studentName: string,
  mobile: string
): Promise<ScrapedStudentDetails> {
  const cleanName = studentName.trim();
  const cleanMobile = mobile.trim().replace(/\D/g, "");

  if (!cleanName) {
    throw new ScraperError("Student name is required", 400);
  }

  if (cleanMobile.length !== 10) {
    throw new ScraperError(
      `Mobile number must be exactly 10 digits (received ${cleanMobile.length} digits: ${cleanMobile})`,
      400
    );
  }

  // 1. Get token and initial session cookies
  const { token, cookies } = await getCsrfTokenAndSession();

  // 2. Submit POST request to /fee-payment/details
  const formParams = new URLSearchParams();
  formParams.append("_token", token);
  formParams.append("organization", org.id);
  formParams.append("name", cleanName);
  formParams.append("mobile", cleanMobile);

  const postResp = await fetch(DETAILS_URL, {
    method: "POST",
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: FEE_PAYMENT_URL,
      Origin: BASE_URL,
      Cookie: cookies,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    body: formParams.toString(),
    cache: "no-store",
  });

  if (postResp.status === 419) {
    throw new ScraperError("Portal session expired (419). Please try again.", 502);
  }

  if (!postResp.ok) {
    throw new ScraperError(
      `Portal returned unexpected response (${postResp.status} ${postResp.statusText})`,
      502
    );
  }

  const detailsHtml = await postResp.text();
  const $ = cheerio.load(detailsHtml);

  // Check if student was not found
  if (detailsHtml.includes("Your details does not matched") || detailsHtml.includes("alert-danger")) {
    const errorText = $(".alert-danger").text().trim().replace(/\s+/g, " ") ||
      "Your details do not match the college records. Please verify the college name, full name, and mobile number.";
    throw new ScraperError(errorText, 404, true);
  }

  // If Univ. Roll. No. is absent, check whether any student table exists
  if (!detailsHtml.includes("Univ. Roll. No.") && !$('input[name="student_id"]').length) {
    throw new ScraperError(
      "No student record found for the provided details. Please check the inputs.",
      404,
      true
    );
  }

  // Parse Academic Table
  let rawName = "";
  let fullName = "";
  let guardianName = "";
  let program = "";
  let univRollNo = "";
  let regnNo = "";
  let type = "Regular";
  let status = "Regular";
  let seat = "Counseling";
  let category = "GEN";

  // Parse table rows
  $("table.table tr").each((_, tr) => {
    const tds = $(tr).find("td");
    const rowText = $(tr).text().trim();

    if (rowText.includes("Name")) {
      const nameCol = $(tds).last().text().trim();
      rawName = nameCol;
      if (nameCol.includes("c/o")) {
        const parts = nameCol.split("c/o");
        fullName = parts[0].trim();
        guardianName = parts.slice(1).join("c/o").trim();
      } else {
        fullName = nameCol;
      }
    }

    if (rowText.includes("Program")) {
      program = $(tds).last().text().trim();
    }

    if (rowText.includes("Univ. Roll. No.")) {
      // Typically: <td>Univ. Roll. No.</td><td>2500541530140</td><td>Regn. No.</td><td>...</td>
      $(tds).each((idx, td) => {
        const text = $(td).text().trim();
        if (text.includes("Univ. Roll. No.")) {
          univRollNo = $(tds[idx + 1]).text().trim();
        }
        if (text.includes("Regn. No.")) {
          regnNo = $(tds[idx + 1]).text().trim();
        }
      });
    }

    if (rowText.includes("Type:") || rowText.includes("Status:") || rowText.includes("Seat:") || rowText.includes("Category:")) {
      $(tds).each((_, td) => {
        const text = $(td).text().trim();
        if (text.includes("Type:")) type = text.replace("Type:", "").trim();
        if (text.includes("Status:")) status = text.replace("Status:", "").trim();
        if (text.includes("Seat:")) seat = text.replace("Seat:", "").trim();
        if (text.includes("Category:")) category = text.replace("Category:", "").trim();
      });
    }
  });

  // Extract hidden input fields from paymentForm
  const studentId = $('input[name="student_id"]').val()?.toString() || "";
  const customerName = $('input[name="customerName"]').val()?.toString() || fullName;
  const returnedMobile = $('input[name="mobileNumber"]').val()?.toString() || cleanMobile;
  const email = $('input[name="email"]').val()?.toString() || "";
  const consumerId = $('input[name="consumerId"]').val()?.toString() || studentId;
  const txnIdPrefix = $('input[name="txnId"]').val()?.toString() || "";

  // Parse Fee Types from select#organization
  const fees: FeeItem[] = [];
  $('select#organization option[value!=""]').each((_, opt) => {
    const $opt = $(opt);
    const value = $opt.attr("value") || "";
    const rawAmount = $opt.attr("data-fee_amount") || "0";
    const amountNum = parseFloat(rawAmount) || 0;
    const feeName = $opt.attr("data-fee_name") || "Fee";
    const orgName = $opt.attr("data-orgnization_name") || org.code;
    const dueDate = $opt.attr("data-due_date") || "";
    const sfsId = $opt.attr("data-sfs_id") || "";
    const mid = $opt.attr("data-mid") || "";
    const feeTypeAmount = $opt.attr("data-fee_type_amount") || "";
    const label = $opt.text().trim() || `${feeName} (${orgName})`;

    fees.push({
      id: value,
      name: feeName,
      label,
      amount: amountNum,
      formattedAmount: `₹ ${amountNum.toLocaleString("en-IN")}`,
      organizationName: orgName,
      dueDate,
      sfsId,
      mid,
      rawTypeAmount: feeTypeAmount,
    });
  });

  // Parse Academic Years
  const academicYears: AcademicYearOption[] = [];
  $('select[name="academic_year"] option').each((_, opt) => {
    const $opt = $(opt);
    const val = $opt.attr("value") || "";
    const label = $opt.text().trim();
    if (val && label) {
      academicYears.push({ value: val, label });
    }
  });

  const academicDetails: StudentAcademicDetails = {
    fullName: fullName || customerName || cleanName,
    guardianName: guardianName || undefined,
    rawNameString: rawName || undefined,
    program: program || "N/A",
    univRollNo: univRollNo || "N/A",
    regnNo: regnNo || "N/A",
    type: type || "Regular",
    status: status || "Regular",
    seat: seat || "Counseling",
    category: category || "GEN",
  };

  return {
    success: true,
    found: true,
    studentId,
    customerName: customerName || fullName || cleanName,
    mobile: returnedMobile,
    email,
    organizationId: org.id,
    organizationCode: org.code,
    organizationName: org.name,
    consumerId,
    txnIdPrefix,
    academicDetails,
    fees,
    academicYears,
    sourceUrl: DETAILS_URL,
    timestamp: new Date().toISOString(),
  };
}
