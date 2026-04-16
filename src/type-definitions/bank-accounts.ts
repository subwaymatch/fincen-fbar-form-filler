export interface IBankAccount {
  accountHolderName: string;
  institution: IInstitutionInformation;
  accountNumber: string;
  openedYear: number;
  closedYear: number | null;
  accountType: AccountTypeOptionValueEnum;
  maxAccountValueInUSD: number;
}

export interface IInstitutionInformation {
  institutionName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export enum AccountTypeOptionValueEnum {
  BANK = "A",
  SECURITIES = "B",
  OTHER = "Z",
}
