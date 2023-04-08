import puppeteer from "puppeteer-core";
import config from "config";
import { getAccountsFromExcelFile } from "@get-accounts";
import { getProfile } from "@get-profile";
import dayjs from "dayjs";
import { waitForTimeout } from "@utils/browser-page";

export async function fillFBARForm() {
  const accounts = await getAccountsFromExcelFile();
  console.log(accounts);

  const profile = await getProfile();
  console.log(profile);

  const browser = await puppeteer.launch({
    executablePath: config.get("puppeteerConfig.chromeExecutablePath"),
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  await page.goto(
    "https://bsaefiling1.fincen.treas.gov/lc/content/xfaforms/profiles/htmldefault.html",
    { waitUntil: "domcontentloaded" }
  );
  await waitForTimeout(1000);

  const today = dayjs();
  const dateOfBirth = dayjs(profile.DOB);

  const nameValueMap: Record<string, string> = {
    Email_5: profile.email,
    ConfirmedEmail_6: profile.email,
    FirstName_7: profile.firstName,
    LastName_8: profile.lastName,
    PhoneNumber_9: profile.phoneNumber.replace(/\D/g, ""),
    FilingName_23: `${profile.firstName.toUpperCase()} ${profile.lastName.toUpperCase()} FBAR ${
      today.year() - 1
    }`,
    CalYear_55: String(today.year() - 1),
    TIN_65: profile.SSN.replace(/\D/g, ""),
    LastName_78: profile.lastName,
    FirstName_83: profile.firstName,
    MiddleName_84: profile.middleName,
    Address_86: profile.address,
    City_87: profile.city,
    ZIP_89: profile.ZIP,
  };

  for (const inputName in nameValueMap) {
    await page.type(`[name="${inputName}"]`, nameValueMap[inputName]);
  }

  const selectNameValueMap: Record<string, string> = {
    FilerType_62: "A",
    TINTYPE_66: "B",
    month_80: dateOfBirth.format("MM"),
    day_81: dateOfBirth.format("DD"),
    year_79: dateOfBirth.format("YYYY"),
  };

  for (const selectName in selectNameValueMap) {
    await page.select(`[name="${selectName}"]`, selectNameValueMap[selectName]);
    await waitForTimeout(100);
  }

  // manually handle country and state
  await page.click('[name="CountryIndividual_90"]');
  await waitForTimeout(200);
  await page.keyboard.press("Escape");
  await waitForTimeout(200);

  await page.select(`[name="CountryIndividual_90"]`, "US ");
  await waitForTimeout(1000);

  await page.click('[name="State_88"]');
  await waitForTimeout(200);
  await page.keyboard.press("Escape");
  await waitForTimeout(200);

  await page.select(`[name="State_88"]`, `${profile.state} `);
  await waitForTimeout(200);

  const clickToCheckEls = [
    "InterestIn25OrMoreNo_94",
    "SigAuthIn25OrMoreNo_101",
  ];

  for (const checkboxName of clickToCheckEls) {
    await page.click(`[name="${checkboxName}"]`);
  }

  // add financial account(s) owned separately
  for (let i = 0; i < accounts.length - 1; i++) {
    await page.click(`[name="Addpart2_108"]`);
    await waitForTimeout(100);
  }

  const subformEls = await page.$$(".subform.Part2");

  // verify that the number of subforms are correct
  if (subformEls.length !== accounts.length) {
    throw new Error(
      "Number of subforms for accounts should match the number of accounts"
    );
  }

  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
    const account = accounts[accountIndex];
    const subformEl = subformEls[accountIndex];

    const subformNameIncludesValueMap: Record<string, string> = {
      "Maximum account value": String(account.maxAccountValueInUSD),
      "Financial institution name": account.institution.institutionName,
      "Account number or other designation": account.accountNumber,
      Address: account.institution.address,
      City: account.institution.city,
      "Foreign postal code": account.institution.postalCode,
    };

    for (const inputName in subformNameIncludesValueMap) {
      const targetEl = await subformEl.$(`[aria-label*="${inputName}"]`);

      await targetEl?.type(subformNameIncludesValueMap[inputName]);
    }

    const accountTypeSelectEl = await subformEl.$(
      `[aria-label*="Type of account"]`
    );

    await accountTypeSelectEl?.select("A");
    await waitForTimeout(100);

    const countrySelectEl = await subformEl.$(`select[name^="Country"]`);

    countrySelectEl?.select(`${account.institution.country} `);
    await waitForTimeout(100);
  }
}
