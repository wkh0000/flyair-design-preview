/**
 * Demo build environment — used when the app is deployed to a public preview
 * (GitHub Pages). Backend URL is intentionally blank so any accidental fetch
 * fails fast and the page falls back to the baked-in defaults. The Travelport
 * PCC is scrubbed; nothing in this file should be considered sensitive.
 */
export const environment = {
  production: true,
  demoMode: true,                      // turns on the "Design preview" banner + disables live calls

  agency_pcc: 'DEMO',                  // scrubbed — no real GDS identifier in the public build
  apiUrl: '',                          // no backend in the preview
  siteUrl: 'https://wkh0000.github.io/flyair-design-preview',

  address: 'Colombo 03, Sri Lanka',
  phone: '0788 788 788',
  email: 'info@flyair.lk',
  logoUrl: 'assets/fav-logo-removebg-preview.png',
  location: 'Colombo, Sri Lanka',

  company: {
    company_id: 1,
    companyName: 'FlyAir',
    regNo: 'PV 00214561',
    iata: '',
    address: 'Colombo, Sri Lanka',
    city: 'Colombo',
    district: 'Colombo',
    country: 'Sri Lanka',
    email: 'info@flyair.lk',
    phone: '0788 788 788',
    logo: 'assets/fav-logo-removebg-preview.png',
  },
};
