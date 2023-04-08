import { institutions } from "@constants/institutions";
import { IInstitutionInformation } from "@type-definitions/bank-accounts";

export function getInstitutionInformation(
  key: string
): IInstitutionInformation | null {
  institutions;
  return institutions.hasOwnProperty(key) ? institutions[key] : null;
}
