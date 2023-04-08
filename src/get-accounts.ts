import ExcelJS from "exceljs";
import config from "config";
import {
  AccountTypeOptionValueEnum,
  IBankAccount,
  IInstitutionInformation,
} from "@type-definitions/bank-accounts";
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
    let isAccountNumberFormat = /[\d-]+/.test(row.getCell(4).text);

    if (
      row.getCell(2).value == null ||
      row.getCell(3).value == null ||
      !isAccountNumberFormat ||
      row.getCell(5).value == null
    ) {
      return;
    }

    const account: IBankAccount = {
      accountHolderName: String(row.getCell(2).value),
      institution: getInstitutionInformation(
        String(row.getCell(3).value)
      ) as IInstitutionInformation,
      accountNumber: String(row.getCell(4).text).replace(/\D/g, ""),
      openedYear: Number(row.getCell(5).value),
      closedYear:
        row.getCell(6).value === null ? null : Number(row.getCell(6).value),
      accountType: AccountTypeOptionValueEnum.BANK,
      maxAccountValueInUSD: krwToUsd(Number(row.getCell(7).value)),
    };

    accounts.push(account);
  });

  return accounts;
}
