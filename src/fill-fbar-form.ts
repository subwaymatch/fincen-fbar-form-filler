import puppeteer, { type Page as PuppeteerPage } from "puppeteer-core";
import config from "config";
import { getAccounts } from "@get-accounts";
import { getProfile } from "@get-profile";
import dayjs from "dayjs";
import { waitForTimeout } from "@utils/browser-page";

const profile = await getProfile();
console.log(profile);

const accounts = await getAccounts();
console.log(accounts);

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
  await waitForTimeout(delay);
}

async function fillHomeTab(page: PuppeteerPage) {
  const filingName = `${profile.firstName.toUpperCase()} ${profile.lastName.toUpperCase()} FBAR ${
    reportYear
  }`;

  await fillInput(page, '[name="home.filingName"]', filingName);
}

async function fillFilerInformationTab(page: PuppeteerPage) {
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

async function fillAccountInformationTab(page: PuppeteerPage) {
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

  // add financial account(s) owned separately
  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
    await separateAccountAddBtn.click();
    await waitForTimeout(100);

    const account = accounts[accountIndex];

    await fillInput(
      page,
      `#separateAccounts\\[${accountIndex}\\]\\.country`,
      account.institution.country,
      true,
    );

    await fillInput(
      page,
      `[name="separateAccounts[${accountIndex}].maximumAccountValue"]`,
      String(account.maxAccountValueInUSD),
    );

    await fillInput(
      page,
      `#separateAccounts\\[${accountIndex}\\]\\.typeOfAccount`,
      account.accountType,
      true,
    );

    await fillInput(
      page,
      `[name="separateAccounts[${accountIndex}].financialInstituteName"]`,
      account.institution.institutionName,
    );

    await fillInput(
      page,
      `[name="separateAccounts[${accountIndex}].accountNumber"]`,
      account.accountNumber,
    );

    await fillInput(
      page,
      `[name="separateAccounts[${accountIndex}].address"]`,
      account.institution.address,
    );

    await fillInput(
      page,
      `[name="separateAccounts[${accountIndex}].city"]`,
      account.institution.city,
    );

    await fillInput(
      page,
      `[name="separateAccounts[${accountIndex}].zipCode"]`,
      account.institution.postalCode,
    );
  }
}

async function fillSubmitTab(page: PuppeteerPage) {
  // Navigate to "Filer Information" page
  const submitTabBtn = await page.$('[data-testid="label-button-4"]');
  if (!submitTabBtn) throw new Error("label-button-4 not found");
  await submitTabBtn.click();
  await waitForTimeout(100);

  await fillInput(page, '[data-testid="email-address-input"]', profile.email);
  await fillInput(
    page,
    '[data-testid="confirm-email-address-input"]',
    profile.email,
  );

  await fillInput(page, '[name="firstName"]', profile.firstName);
  await fillInput(page, '[name="lastName"]', profile.lastName);
  await fillInput(
    page,
    '[name="phone"]',
    profile.phoneNumber.replace(/\D/g, ""),
  );
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

  await fillHomeTab(page);

  await fillFilerInformationTab(page);

  await fillAccountInformationTab(page);

  await fillSubmitTab(page);
}
