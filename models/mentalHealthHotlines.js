const HOTLINE_ASSETS = Object.freeze({
  phone: "../assets/doll-phone.svg",
  text: "../assets/doll-telephone.svg",
  lgbt: "../assets/doll-lgbt.svg",
  security: "../assets/doll-security.svg",
});

export const DEFAULT_HOTLINE_COUNTRY = "portugal";

const HOTLINE_COUNTRIES = Object.freeze({
  portugal: {
    label: "Portugal",
    flag: "🇵🇹",
    subtitle: "Apoio gratuito e confidencial - 24h",
    sections: [
      {
        title: "Immediate help - phone",
        items: [
          {
            name: "Linha Nacional de Apoio Psicológico",
            value: "1411",
            asset: HOTLINE_ASSETS.phone,
          },
          {
            name: "SNS24",
            value: "808 24 24 24",
            asset: HOTLINE_ASSETS.phone,
          },
        ],
      },
      {
        title: "Immediate help - text",
        items: [
          {
            name: "SOS Voz Amiga",
            value: "sosvozamiga.org",
            asset: HOTLINE_ASSETS.text,
          },
        ],
      },
      {
        title: "LGBTQ+ support",
        items: [
          {
            name: "ILGA Portugal",
            value: "927 247 468",
            asset: HOTLINE_ASSETS.lgbt,
          },
        ],
      },
      {
        title: "Sexual assault support",
        items: [
          {
            name: "APAV - Apoio a Vitima",
            value: "116 006",
            asset: HOTLINE_ASSETS.security,
          },
        ],
      },
    ],
  },
  unitedKingdom: {
    label: "United Kingdom",
    flag: "🇬🇧",
    subtitle: "Free, confidential support - 24/7",
    sections: [
      {
        title: "Immediate help - phone",
        items: [
          { name: "NHS Mental Health", value: "111", asset: HOTLINE_ASSETS.phone },
          { name: "Samaritans", value: "116 123", asset: HOTLINE_ASSETS.phone },
        ],
      },
      {
        title: "Immediate help - text",
        items: [
          {
            name: "Shout Crisis Text Line",
            value: "85258",
            detail: "Text SHOUT",
            asset: HOTLINE_ASSETS.text,
          },
        ],
      },
      {
        title: "LGBTQ+ support",
        items: [
          {
            name: "Switchboard LGBT+",
            value: "0300 330 0630",
            asset: HOTLINE_ASSETS.lgbt,
          },
        ],
      },
      {
        title: "Sexual assault support",
        items: [
          {
            name: "Rape Crisis England & Wales",
            value: "0808 500 2222",
            asset: HOTLINE_ASSETS.security,
          },
        ],
      },
    ],
  },
  germany: {
    label: "Germany",
    flag: "🇩🇪",
    subtitle: "Kostenlose, vertrauliche Unterstutzung - 24/7",
    sections: [
      {
        title: "Immediate help - phone",
        items: [
          {
            name: "TelefonSeelsorge",
            value: "0800 111 0111",
            asset: HOTLINE_ASSETS.phone,
          },
          {
            name: "TelefonSeelsorge",
            value: "0800 111 0222",
            asset: HOTLINE_ASSETS.phone,
          },
        ],
      },
      {
        title: "Immediate help - text",
        items: [
          { name: "Krisenchat", value: "krisenchat.de", asset: HOTLINE_ASSETS.text },
        ],
      },
      {
        title: "Sexual assault support",
        items: [
          {
            name: "Hilfetelefon Gewalt gegen Frauen",
            value: "08000 116 016",
            asset: HOTLINE_ASSETS.security,
          },
        ],
      },
    ],
  },
  brazil: {
    label: "Brazil",
    flag: "🇧🇷",
    subtitle: "Apoio gratuito e confidencial - 24h",
    sections: [
      {
        title: "Immediate help - phone",
        items: [{ name: "CVV", value: "188", asset: HOTLINE_ASSETS.phone }],
      },
      {
        title: "Immediate help - text",
        items: [
          { name: "CVV online chat", value: "cvv.org.br", asset: HOTLINE_ASSETS.text },
        ],
      },
      {
        title: "LGBTQ+ support",
        items: [
          {
            name: "Switchboard LGBT+",
            value: "0300 330 0630",
            asset: HOTLINE_ASSETS.lgbt,
          },
        ],
      },
      {
        title: "Sexual assault support",
        items: [
          {
            name: "Central de Atendimento a Mulher",
            value: "180",
            asset: HOTLINE_ASSETS.security,
          },
        ],
      },
    ],
  },
});

export function getHotlineCountry(countryId = DEFAULT_HOTLINE_COUNTRY) {
  return HOTLINE_COUNTRIES[countryId] || HOTLINE_COUNTRIES[DEFAULT_HOTLINE_COUNTRY];
}

export function getHotlineCountries() {
  return Object.entries(HOTLINE_COUNTRIES).map(([id, country]) => ({
    id,
    label: country.label,
    flag: country.flag,
  }));
}
