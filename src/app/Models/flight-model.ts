// flight.model.ts

export interface FlightDetail {
  id: string;
  distance: number;
  departure: DepartureDetail;
  arrival: ArrivalDetail;
}

export interface DepartureDetail {
  location: string;
  date: string;
  time: string;
}

export interface ArrivalDetail {
  terminal: string;
  location: string;
  date: string;
  time: string;
}

export interface BaggageAllowanceDetail {
  url: string;
  passengerTypeCodes: string[];
  baggageType: string;
  validatingAirlineCode: string;
  productRef: string[];
  baggageItem: BaggageItem[];
  segmentSequenceList: number[];
  text: string[];
}

export interface BaggageItem {
  measurement: Measurement[];
  text: string;
}

export interface Measurement {
  measurementType: string;
  unit: string;
  value: number;
}

export interface PenaltyAmount {
  amount: {
    value: number;
  };
}

export interface ChangePermitted {
  penaltyTypes: string[];
  penaltyAppliesTo: string;
  penalty: PenaltyAmount[];
}

export interface CancelPermitted {
  penaltyTypes: string[];
  penaltyAppliesTo: string;
  penalty: PenaltyAmount[];
}

export interface Penalties {
  change: ChangePermitted[];
  cancel: CancelPermitted[];
  passengerTypeCodes: string[];
}

export interface TermsAndConditionsID {
  baggageAllowance: BaggageAllowanceDetail[];
  validatingAirline: ValidatingAirline[];
  ticketingAgency: TicketingAgency[];
  paymentTimeLimit: string;
  penalties: Penalties[];
}

export interface ValidatingAirline {
  validatingAirline: string;
}

export interface TicketingAgency {
  code: string;
  productRef: string[];
}

export interface BestCombinablePriceDetail {
  currencyCode: string;
  base: number;
  totalTaxes: number;
  totalPrice: number;
  priceBreakdown: PriceBreakdownAir[];
}

export interface PriceBreakdownAir {
  quantity: number;
  requestedPassengerType: string;
  amount: Amount;
}

export interface Amount {
  currencyCode: string;
  base: number;
  taxes: TaxesDetail;
  fees: FeesDetail;
  total: number;
}

export interface TaxesDetail {
  totalTaxes: number;
}

export interface FeesDetail {
  totalFees: number;
}

export interface CatalogProductOffering {
  id: string;
  sequence: number;
  departure: string;
  arrival: string;
  productBrandOptions: ProductBrandOptions[];
}

export interface ProductBrandOptions {
  flightRefs: FlightDetail[];
  productBrandOffering: ProductBrandOffering[];
}

export interface ProductBrandOffering {
  product: ProductID[];
  termsAndConditions: TermsAndConditionsID;
  combinabilityCode: string[];
  bestCombinablePrice: BestCombinablePriceDetail;
  contentSource: string;
}

export interface ProductID {
  productRef: ProductAir;
}

export interface ProductAir {
  id: string;
  flightSegment: FlightSegment[];
  passengerFlight: PassengerFlight[];
}

export interface FlightSegment {
  flightRef: string;
}

export interface PassengerFlight {
  passengerQuantity: number;
  passengerTypeCode: string;
  flightProduct: FlightProduct[];
}

export interface FlightProduct {
  segmentSequence: number[];
  classOfService: string;
  cabin: string;
}
