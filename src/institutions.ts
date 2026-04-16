import { institutions } from "@constants/institutions";
import { IInstitutionInformation } from "@type-definitions/bank-accounts";

export function getInstitutionInformation(
  key: string
): IInstitutionInformation | null {
  return Object.hasOwn(institutions, key) ? institutions[key] : null;
}
