// PUBLIC DEMO REPO — this file is committed with NO sensitive values.
// The local dev copy on the team's machines (where the real GDS PCC lives)
// is gitignored separately. For the demo deploy the build replaces this file
// with environment.demo.ts via the file-replacement rule in angular.json.
export const environment = {
  production: false,
  demoMode: false,
  agency_pcc: '',                          // never expose a real GDS PCC publicly
  apiUrl: 'http://localhost:5000/api/',
  siteUrl: 'http://localhost:4200',

  address: 'Colombo, Sri Lanka',
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
