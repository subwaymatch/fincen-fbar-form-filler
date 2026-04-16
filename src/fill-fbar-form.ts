import puppeteer, { type Page as PuppeteerPage } from "puppeteer-core";
import config from "config";
import { getAccounts } from "@get-accounts";
import { getProfile } from "@get-profile";
import dayjs from "dayjs";
import { waitForTimeout } from "@utils/browser-page";

const accounts = await getAccounts();
const profile = await getProfile();
const dateOfBirth = dayjs(profile.DOB);
const today = dayjs();
const reportYear = today.year() - 1;

async function fillInput(
  page: PuppeteerPage,
  selector: string,
  value: string,
  hitEnter = false,
  delay = 100,
) {
  await page.waitForSelector(selector);
  await page.type(selector, value);
  if (hitEnter) {
    await page.keyboard.press("Enter");
  }
}

async function fillHomepage(page: PuppeteerPage) {
  const filingName = `${profile.firstName.toUpperCase()} ${profile.lastName.toUpperCase()} FBAR ${
    reportYear
  }`;

  await fillInput(page, '[name="home.filingName"]', filingName);
}

async function fillFilerInformation(page: PuppeteerPage) {
  // Navigate to "Filer Information" page
  const filerInformationBtn = await page.$('[data-testid="label-button-1"]');
  if (!filerInformationBtn) throw new Error("label-button-1 not found");
  await filerInformationBtn.click();
  await waitForTimeout(100);

  await fillInput(page, '[name="filerInfo.calendarYear"]', String(reportYear));

  await fillInput(page, "#filerInfo\\.filerType", "Individual", true);

  await fillInput(page, "#filerInfo\\.domesticTinType", "SSN/ITIN", true);

  await fillInput(
    page,
    '[name="filerInfo.domesticTin"]',
    profile.SSN.replace(/\D/g, ""),
  );

  await fillInput(
    page,
    '[name="filerInfo.lastNameOrOrgName"]',
    profile.lastName,
  );

  await fillInput(page, '[name="filerInfo.firstName"]', profile.firstName);

  if (
    profile.middleName &&
    typeof profile.middleName === "string" &&
    profile.middleName.trim() !== ""
  ) {
    await fillInput(page, '[name="filerInfo.middleName"]', profile.middleName);
  }

  await fillInput(page, "#filerInfo\\.dob", dateOfBirth.format("MM/DD/YYYY"));

  await fillInput(page, '[name="filerInfo.address"]', profile.address);

  await fillInput(page, '[name="filerInfo.city"]', profile.city);

  await fillInput(
    page,
    "#filerInfo\\.country",
    "United States of America",
    true,
  );

  await fillInput(page, "#filerInfo\\.state", profile.state, true);

  await fillInput(page, '[name="filerInfo.zipCode"]', profile.ZIP);

  const noInterestBtn = await page.$(
    'label[for="filerInfo.hasFinancialInterest.no"]',
  );
  if (!noInterestBtn) throw new Error("hasFinancialInterest.no not found");
  await noInterestBtn.click();
  await waitForTimeout(100);

  const noSignatureBtn = await page.$(
    'label[for="filerInfo.hasFinancialSignatureNoInterest.no"]',
  );
  if (!noSignatureBtn)
    throw new Error("hasFinancialSignatureNoInterest.no not found");
  await noSignatureBtn.click();
  await waitForTimeout(100);
}

async function fillAccountInformation(page: PuppeteerPage) {
  // Navigate to "Account Information" page
  await page.click('[data-testid="label-button-2"]');
  await waitForTimeout(100);

  await page.waitForSelector('[data-testid="seperate-account-add"]');
  console.log("Found 'Add Separate Account' button");
  await waitForTimeout(100);

  await page.$eval('[data-testid="seperate-account-add"]', (el) =>
    el.scrollIntoView({ block: "center", inline: "center" }),
  );
  await waitForTimeout(300);

  const separateAccountAddBtn = await page.$(
    '[data-testid="seperate-account-add"]',
  );
  if (!separateAccountAddBtn)
    throw new Error("seperate-account-add button not found");

  console.log(accounts);

  // add financial account(s) owned separately
  for (
    let accountIndex = 0;
    accountIndex < accounts.length - 1;
    accountIndex++
  ) {
    await separateAccountAddBtn.click();
    await waitForTimeout(100);

    const account = accounts[accountIndex];

    const subformNameIncludesValueMap: Record<string, string> = {
      "Maximum account value": String(account.maxAccountValueInUSD),
      "Financial institution name": account.institution.institutionName,
      "Account number or other designation": account.accountNumber,
      Address: account.institution.address,
      City: account.institution.city,
      country: account.institution.country,
      "Foreign postal code": account.institution.postalCode,
    };

    await fillInput(
      page,
      `[name="separateAccounts[${accountIndex}].maximumAccountValue"]`,
      String(account.maxAccountValueInUSD),
    );

    await waitForTimeout(100);
  }
}

export async function fillFBARForm() {
  const browser = await puppeteer.launch({
    executablePath: config.get("puppeteerConfig.chromeExecutablePath"),
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  await page.goto("https://bsaefiling.fincen.gov/file/fbar/html", {
    waitUntil: "domcontentloaded",
  });
  await waitForTimeout(1000);

  let clickEl = await page.$('[data-testid="agree-button"]');
  if (!clickEl) throw new Error("Agree button not found");
  await clickEl.click();

  await waitForTimeout(100);

  // await fillHomepage(page);

  // await fillFilerInformation(page);

  await fillAccountInformation(page);

  return;

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
      "Number of subforms for accounts should match the number of accounts",
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
      `[aria-label*="Type of account"]`,
    );

    await accountTypeSelectEl?.select("A");
    await waitForTimeout(100);

    const countrySelectEl = await subformEl.$(`select[name^="Country"]`);

    countrySelectEl?.select(`${account.institution.country} `);
    await waitForTimeout(100);
  }
}
