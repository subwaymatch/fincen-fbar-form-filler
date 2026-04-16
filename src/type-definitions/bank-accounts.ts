export interface IBankAccount {
  institution: IInstitutionInformation;
  accountNumber: string;
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
