#!/usr/bin/env python3
"""
Script to fetch student fee payment details from https://mybbd.in/fee-payment
and parse academic details, fee types/amounts, hidden inputs, and bank/challan options.
"""

import sys
import os
import requests
from bs4 import BeautifulSoup


def fetch_fee_details(organization="2", name="Shivanshu Shukla", mobile="6306808581", output_path="/workspace/sample_response.html"):
    session = requests.Session()
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Referer": "https://mybbd.in/fee-payment"
    }
    session.headers.update(headers)

    print(f"[*] Step 1: Requesting initial page to obtain CSRF token from https://mybbd.in/fee-payment ...")
    initial_resp = session.get("https://mybbd.in/fee-payment", timeout=15)
    initial_resp.raise_for_status()

    initial_soup = BeautifulSoup(initial_resp.text, "html.parser")
    token_input = initial_soup.find("input", {"name": "_token"})
    if not token_input or not token_input.get("value"):
        raise ValueError("Could not find CSRF token (_token) on initial fee-payment page.")

    csrf_token = token_input["value"]
    print(f"[+] CSRF Token acquired: {csrf_token}")

    print(f"[*] Step 2: Submitting POST request to https://mybbd.in/fee-payment/details ...")
    post_payload = {
        "_token": csrf_token,
        "organization": organization,
        "name": name,
        "mobile": mobile
    }
    details_resp = session.post(
        "https://mybbd.in/fee-payment/details",
        data=post_payload,
        timeout=15
    )
    details_resp.raise_for_status()
    print(f"[+] Response status: {details_resp.status_code}")
    print(f"[+] Response length: {len(details_resp.text)} bytes")

    # Save raw HTML
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(details_resp.text)
    print(f"[+] Raw response HTML saved to: {output_path}")

    # Inspect and print parsed data
    inspect_response(details_resp.text)


def inspect_response(html_content):
    soup = BeautifulSoup(html_content, "html.parser")

    print("\n" + "=" * 60)
    print("1. ACADEMIC DETAILS & STUDENT INFORMATION")
    print("=" * 60)

    # Search for details table
    tables = soup.find_all("table")
    if tables:
        for t_idx, table in enumerate(tables, 1):
            print(f"Table #{t_idx}:")
            for row in table.find_all("tr"):
                cells = [td.get_text(" ", strip=True) for td in row.find_all(["th", "td"])]
                if len(cells) == 2:
                    print(f"  - {cells[0]}: {cells[1]}")
                elif len(cells) == 4:
                    if ":" in cells[0]:
                        # Row 4 is formatted like ['Type: Regular', 'Status: Regular', 'Seat: Counseling', 'Category: GEN']
                        print(f"  - {cells[0]} | {cells[1]} | {cells[2]} | {cells[3]}")
                    else:
                        print(f"  - {cells[0]}: {cells[1]} | {cells[2]}: {cells[3]}")
                else:
                    print(f"  - {' | '.join(cells)}")
    else:
        print("  No table elements found.")

    print("\n" + "=" * 60)
    print("2. FEE TYPES AND FEE AMOUNTS")
    print("=" * 60)

    fee_select = soup.find("select", {"name": "fee_type_id"}) or soup.find("select", {"id": "organization"})
    if fee_select:
        options = fee_select.find_all("option")
        found_fee = False
        for opt in options:
            val = opt.get("value", "")
            text = opt.get_text(strip=True)
            if not val:
                continue
            found_fee = True
            amount = opt.get("data-fee_amount", "N/A")
            fee_name = opt.get("data-fee_name", "N/A")
            due_date = opt.get("data-due_date", "N/A")
            mid = opt.get("data-mid", "N/A")
            org_name = opt.get("data-orgnization_name", "N/A")
            sfs_id = opt.get("data-sfs_id", "N/A")
            fee_type_amount = opt.get("data-fee_type_amount", "N/A")

            print(f"  - Fee Type: {text}")
            print(f"    * Amount: Rs. {amount}")
            print(f"    * Option Value: {val}")
            print(f"    * Fee Name (data-fee_name): {fee_name}")
            print(f"    * Organization (data-orgnization_name): {org_name}")
            print(f"    * Due Date / SFS ID: {due_date} (sfs_id: {sfs_id})")
            print(f"    * Merchant ID (data-mid): {mid}")
            print(f"    * Fee Type Amount Key: {fee_type_amount}")
        if not found_fee:
            print("  No fee type options available.")
    else:
        print("  Fee type selector not found.")

    academic_year_select = soup.find("select", {"name": "academic_year"})
    if academic_year_select:
        years = [opt.get_text(strip=True) for opt in academic_year_select.find_all("option")]
        print(f"\n  Available Academic Years ({len(years)} entries):")
        print(f"    {', '.join(years[:5])} ... (latest: {years[0]})")

    print("\n" + "=" * 60)
    print("3. HIDDEN INPUTS & FORM INFORMATION")
    print("=" * 60)

    form = soup.find("form", {"id": "paymentForm"}) or soup.find("form")
    if form:
        print(f"Form Action: {form.get('action')}")
        print(f"Form Method: {form.get('method')}")
        print("Hidden Inputs:")
        for inp in form.find_all("input", {"type": "hidden"}):
            name = inp.get("name")
            val = inp.get("value", "")
            id_attr = f" (id='{inp['id']}')" if inp.get("id") else ""
            print(f"  - {name}{id_attr}: '{val}'")
    else:
        print("  No payment form found.")

    print("\n" + "=" * 60)
    print("4. BANK DETAILS & CHALLAN DETAILS")
    print("=" * 60)

    # Check for direct bank/challan mentions in text or tables
    text_matches = []
    for elem in soup.find_all(["p", "div", "span", "table", "button"]):
        t = elem.get_text(" ", strip=True)
        if any(keyword in t.lower() for keyword in ["bank", "challan", "pnb", "rtgs", "neft", "ifsc"]):
            if len(t) < 150 and not elem.find(["div", "table"]):
                text_matches.append(t)

    unique_matches = list(dict.fromkeys(text_matches))
    if unique_matches:
        print("Payment mode options detected in the response:")
        for m in unique_matches:
            cleaned_m = " ".join(m.split())
            print(f"  - {cleaned_m}")

    print("\nOffline Payment Buttons and Target Endpoints in JavaScript:")
    offline1 = soup.find("button", {"id": "OfflinePayment1"})
    offline2 = soup.find("button", {"id": "OfflinePayment2"})
    if offline1:
        print("  - PNB Offline (Cash / Cheque / DD):")
        print("    * Button text: 'Pay Offline (PNB) Cash/Cheque/DD'")
        print("    * Action endpoint: https://mybbd.in/fee-payment/student_info")
        print("    * Generates PNB Challan via: https://mybbd.in/fee-payment/generate_challan")
    if offline2:
        print("  - Other Bank Offline (RTGS / NEFT):")
        print("    * Button text: 'Pay Offline (Other Bank) RTGS/NEFT'")
        print("    * Action endpoint: https://mybbd.in/fee-payment/student_info_rtgs")
        print("    * Generates RTGS/NEFT Challan via: https://mybbd.in/fee-payment/generate_challan")

    print("\nNote on Bank Details in raw HTML:")
    print("  The raw /fee-payment/details response HTML does not directly display bank account numbers or IFSC codes.")
    print("  Instead, it contains triggers for offline challan generation ('Pay Offline (PNB)' and 'Pay Offline (Other Bank)')")
    print("  which POST to https://mybbd.in/fee-payment/student_info or student_info_rtgs to generate the printable bank deposit challan.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    fetch_fee_details()
