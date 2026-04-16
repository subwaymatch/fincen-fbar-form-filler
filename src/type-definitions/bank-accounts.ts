export interface IBankAccount {
  accountHolderName: string;
  institution: IInstitutionInformation;
  accountNumber: string;
  openedYear: number;
  closedYear: number | null;
  accountType: string;
  maxAccountValueInUSD: number;
}

export interface IInstitutionInformation {
  institutionName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}
