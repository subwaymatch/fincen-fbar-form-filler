import { IInstitutionInformation } from "@type-definitions/bank-accounts";

export const institutions: Record<string, IInstitutionInformation> = {
  신한은행: {
    institutionName: "Shinhan Bank",
    address: "20, Sejong-Daero 9-Gil, Jung-Gu",
    city: "Seoul",
    postalCode: "04513",
    country: "Korea, Republic Of",
  },
  우리은행: {
    institutionName: "Woori Bank",
    address: "51 Sogong-Ro, Jung-Gu",
    city: "Seoul",
    postalCode: "04632",
    country: "Korea, Republic Of",
  },
  국민은행: {
    institutionName: "KB Kookmin Bank",
    address: "84 Namdaemun-Ro, Jung-Gu",
    city: "Seoul",
    postalCode: "04534",
    country: "Korea, Republic Of",
  },
  카카오뱅크: {
    institutionName: "Kakao Bank",
    address: "Pangyoyeok-Ro , 231 H-Square S-Dong Floor 5 Bundang-Gu",
    city: "Seongnam-si",
    postalCode: "13494",
    country: "Korea, Republic Of",
  },
  미래에셋증권: {
    institutionName: "Mirae Asset Securities",
    address: "26, Eulji-Ro 5-Gil, Jung-Gu",
    city: "Seoul",
    postalCode: "04539",
    country: "Korea, Republic Of",
  },
};
