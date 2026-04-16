import puppeteer, { type Page as PuppeteerPage } from "puppeteer-core";
import config from "config";
import { getAccounts } from "@get-accounts";
import { getProfile } from "@get-profile";
import dayjs from "dayjs";
import { waitForTimeout } from "@utils/browser-page";
import { IBankAccount } from "@type-definitions/bank-accounts";
import IProfile from "@type-definitions/IProfile";

interface IFbarContext {
  accounts: IBankAccount[];
  dateOfBirth: dayjs.Dayjs;
  profile: IProfile;
  reportYear: number;
}

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

async function clickRequired(page: PuppeteerPage, selector: string, error: string) {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(error);
  }

  await element.click();
  await waitForTimeout(100);
}

async function fillHomeTab(page: PuppeteerPage, { profile, reportYear }: IFbarContext) {
  const filingName = `${profile.firstName.toUpperCase()} ${profile.lastName.toUpperCase()} FBAR ${reportYear}`;

  await fillInput(page, '[name="home.filingName"]', filingName);
}

async function fillFilerInformationTab(
  page: PuppeteerPage,
  { dateOfBirth, profile, reportYear }: IFbarContext,
) {
  await clickRequired(page, '[data-testid="label-button-1"]', "label-button-1 not found");

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

  await clickRequired(
    page,
    'label[for="filerInfo.hasFinancialInterest.no"]',
    "hasFinancialInterest.no not found",
  );

  await clickRequired(
    page,
    'label[for="filerInfo.hasFinancialSignatureNoInterest.no"]',
    "hasFinancialSignatureNoInterest.no not found",
  );
}

async function fillAccountInformationTab(
  page: PuppeteerPage,
  { accounts }: IFbarContext,
) {
  await clickRequired(page, '[data-testid="label-button-2"]', "label-button-2 not found");

  await page.waitForSelector('[data-testid="seperate-account-add"]');
  await waitForTimeout(100);

  // add financial account(s) owned separately
  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
    const account = accounts[accountIndex];
    await clickRequired(
      page,
      '[data-testid="seperate-account-add"]',
      "seperate-account-add button not found",
    );

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

async function fillSubmitTab(page: PuppeteerPage, { profile }: IFbarContext) {
  await clickRequired(page, '[data-testid="label-button-4"]', "label-button-4 not found");

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
  const profile = getProfile();
  const accounts = await getAccounts();
  const context: IFbarContext = {
    accounts,
    dateOfBirth: dayjs(profile.DOB),
    profile,
    reportYear: dayjs().year() - 1,
  };

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

  await fillHomeTab(page, context);

  await fillFilerInformationTab(page, context);

  await fillAccountInformationTab(page, context);

  await fillSubmitTab(page, context);
}
