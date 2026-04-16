import ExcelJS from "exceljs";
import config from "config";
import { IBankAccount } from "@type-definitions/bank-accounts";
import { getInstitutionInformation } from "@institutions";
import { glob } from "glob";
import path from "path";

export function krwToUsd(amount: number) {
  const exchangeRate = config.get("usdToKrwExchangeRate") as number;

  return Math.round(amount / exchangeRate);
}

export async function getAccounts(): Promise<IBankAccount[]> {
  const inputDirectoryPath = config.get("inputDataDirectoryPath") as string;
  const excelFilesGlobPattern = path
    .join(inputDirectoryPath, "/*.xlsx")
    .replaceAll("\\", "/");
  const excelFiles = await glob(excelFilesGlobPattern);

  if (excelFiles.length === 0) {
    throw new Error(`No excel file found in ${inputDirectoryPath}`);
  }

  const excelFilePath = excelFiles[0];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFilePath);

  // grab the last worksheet
  const worksheet = workbook.worksheets[workbook.worksheets.length - 1];

  const accounts: IBankAccount[] = [];

  worksheet.eachRow((row) => {
    const isAccountNumberFormat = /[\d-]+/.test(row.getCell(4).text);

    if (
      row.getCell(3).value == null ||
      !isAccountNumberFormat ||
      row.getCell(5).value == null
    ) {
      return;
    }

    const institutionName = String(row.getCell(3).value);
    const institution = getInstitutionInformation(institutionName);
    if (!institution) {
      throw new Error(`Unsupported institution: ${institutionName}`);
    }

    const account: IBankAccount = {
      institution,
      accountNumber: String(row.getCell(4).text).replace(/\D/g, ""),
      accountType: "Bank",
      maxAccountValueInUSD: krwToUsd(Number(row.getCell(7).value)),
    };

    accounts.push(account);
  });

  return accounts;
}
