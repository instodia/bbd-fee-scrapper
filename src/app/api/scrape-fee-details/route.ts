import { NextRequest, NextResponse } from "next/server";
import { resolveOrganization, ORGANIZATIONS } from "@/lib/types";
import { scrapeBbdFeeDetails, ScraperError } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const collegeInput = (body.college || body.organization || "").toString().trim();
    const studentName = (body.name || body.studentName || "").toString().trim();
    const mobile = (body.mobile || body.phone || body.phoneNumber || "").toString().trim();

    if (!collegeInput) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          error: "College name is required",
          message: "Please choose or provide a valid college (e.g. BBDITM, BBDU, BBDNIIT, BBDEC, VIROHAN)",
          availableColleges: ORGANIZATIONS.map((o) => ({
            id: o.id,
            code: o.code,
            name: o.name,
          })),
        },
        { status: 400 }
      );
    }

    const org = resolveOrganization(collegeInput);
    if (!org) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          error: `Unrecognized college: "${collegeInput}"`,
          message: `Could not identify college. Valid options are: ${ORGANIZATIONS.map((o) => o.code).join(", ")}`,
          availableColleges: ORGANIZATIONS.map((o) => ({
            id: o.id,
            code: o.code,
            name: o.name,
          })),
        },
        { status: 400 }
      );
    }

    if (!studentName) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          error: "Student name is required",
          message: "Please provide the student's full name as registered in BBD records.",
        },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          error: "Invalid phone number",
          message: `Phone number must be a 10-digit Indian mobile number (got "${mobile}").`,
        },
        { status: 400 }
      );
    }

    const result = await scrapeBbdFeeDetails(org, studentName, cleanMobile);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof ScraperError) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          error: err.name,
          message: err.message,
          isNotFound: err.isNotFound,
        },
        { status: err.statusCode }
      );
    }

    const errorMsg = err instanceof Error ? err.message : "An unexpected scraping error occurred";
    return NextResponse.json(
      {
        success: false,
        found: false,
        error: "InternalScraperError",
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const collegeInput = searchParams.get("college") || searchParams.get("organization") || "";
  const studentName = searchParams.get("name") || searchParams.get("studentName") || "";
  const mobile = searchParams.get("mobile") || searchParams.get("phone") || "";

  if (!collegeInput && !studentName && !mobile) {
    return NextResponse.json({
      message: "BBD Fee Payment Scraper API",
      endpoint: "/api/scrape-fee-details",
      methods: ["GET", "POST"],
      usage: "Pass query params ?college=BBDITM&name=Shivanshu+Shukla&mobile=6306808581 or POST JSON",
      organizations: ORGANIZATIONS,
    });
  }

  const fakeReq = new NextRequest(req.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      college: collegeInput,
      name: studentName,
      mobile,
    }),
  });

  return POST(fakeReq);
}
