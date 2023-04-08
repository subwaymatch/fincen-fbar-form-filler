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
  country: CountryOptionValueEnum;
}

export enum AccountTypeOptionValueEnum {
  BANK = "A",
  SECURITIES = "B",
  OTHER = "Z",
}

// Only need S. Korea for now
// Add <option> values if accounts from other countries are required
export enum CountryOptionValueEnum {
  SOUTH_KOREA = "KR",
}
