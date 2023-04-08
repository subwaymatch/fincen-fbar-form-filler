import {
  CountryOptionValueEnum,
  IInstitutionInformation,
} from "@type-definitions/bank-accounts";

export const institutions: Record<string, IInstitutionInformation> = {
  신한은행: {
    institutionName: "SHINHAN BANK",
    address: "20, SEJONG-DAERO 9-GIL, JUNG-GU",
    city: "SEOUL",
    postalCode: "04513",
    country: CountryOptionValueEnum.SOUTH_KOREA,
  },
  우리은행: {
    institutionName: "WOORI BANK",
    address: "51 SOGONG-RO, JUNG-GU",
    city: "SEOUL",
    postalCode: "04632",
    country: CountryOptionValueEnum.SOUTH_KOREA,
  },
  국민은행: {
    institutionName: "KB KOOKMIN BANK",
    address: "84 NAMDAEMUN-RO, JUNG-GU",
    city: "SEOUL",
    postalCode: "04534",
    country: CountryOptionValueEnum.SOUTH_KOREA,
  },
  카카오뱅크: {
    institutionName: "KAKAO BANK",
    address: "PANGYOYEOK-RO , 231 H-SQUARE S-DONG FLOOR 5 BUNDANG-GU",
    city: "SEONGNAM-SI",
    postalCode: "13494",
    country: CountryOptionValueEnum.SOUTH_KOREA,
  },
};
