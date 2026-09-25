# BBD Student Fee & Details Scraper Web App

A modern, fast web application and API to scrape student profile details, roll numbers, registration numbers, academic status, and fee breakdown from the official Babu Banarasi Das portal: [`https://mybbd.in/fee-payment`](https://mybbd.in/fee-payment).

## 🚀 Features

- **Automated CSRF & Session Handshake**: Seamlessly fetches the Laravel `_token` and `bbd_mycampus_session` cookies required by `mybbd.in`.
- **Institution Code Mapping & Aliases**: Supports all institutions under BBD Group with code auto-resolution:
  - `BBDU` (Babu Banarasi Das University, ID: `1`)
  - `BBDITM` / `BBDNITM` (BBD Institute of Technology and Management, ID: `2`)
  - `BBDNIIT` (BBD Northern India Institute of Technology, ID: `3`)
  - `BBDEC` (BBD Engineering College, ID: `4`)
  - `VIROHAN` (Virohan Institute of Health & Management Sciences, ID: `7`)
- **Rich Student Card**: Renders verified student identity with Univ Roll No, Regn No, Program/Branch, Admission Type, Seat, and Category.
- **Detailed Fee Breakdown**: Extracts exact fee heads, amounts, merchant IDs, and academic sessions.
- **Export & Utility Tools**:
  - One-click sample test data (Shivanshu Shukla, BBDITM, 6306808581)
  - Copy JSON output to clipboard
  - Download structured `.json` file
  - Print-friendly student receipt view
  - cURL commands generator for easy API consumption
- **REST API Endpoint**: Programmatically fetch details via `POST` or `GET` at `/api/scrape-fee-details`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTML Extraction**: Cheerio
- **Icons**: Lucide React

---

## 🏃 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run at `http://127.0.0.1:3456`.

3. Build for production:
   ```bash
   npm run build
   npm run start
   ```

---

## 📡 API Usage

### `POST /api/scrape-fee-details`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "college": "BBDITM",
  "name": "Shivanshu Shukla",
  "mobile": "6306808581"
}
```

**Response Example (200 OK):**
```json
{
  "success": true,
  "found": true,
  "studentId": "234275",
  "customerName": "SHIVANSHU SHUKLA",
  "mobile": "6306808581",
  "email": "shivanshushukla1010@gmail.com",
  "organizationId": "2",
  "organizationCode": "BBDITM",
  "organizationName": "BBD Institute of Technology and Management",
  "academicDetails": {
    "fullName": "SHIVANSHU SHUKLA",
    "guardianName": "JITENDRA NATH SHUKLA",
    "program": "B.Tech - CSE-AI&ML - 2nd Year",
    "univRollNo": "2500541530140",
    "regnNo": "BBDITM/BT-CSE(AI-ML)/2025/00014",
    "type": "Regular",
    "status": "Regular",
    "seat": "Counseling",
    "category": "GEN"
  },
  "fees": [
    {
      "id": "[4][1]",
      "name": "Academic",
      "label": "Academic Fee (BBDITM)",
      "amount": 92643,
      "formattedAmount": "₹ 92,643",
      "organizationName": "BBDITM",
      "sfsId": "200623",
      "mid": "L892704"
    }
  ],
  "sourceUrl": "https://mybbd.in/fee-payment/details",
  "timestamp": "2026-09-25T22:16:25.100Z"
}
```

### `GET /api/scrape-fee-details`
```bash
curl "http://127.0.0.1:3456/api/scrape-fee-details?college=BBDITM&name=Shivanshu+Shukla&mobile=6306808581"
```
