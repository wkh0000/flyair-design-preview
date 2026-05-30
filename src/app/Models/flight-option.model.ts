// models/flight-option.model.ts
export interface FlightOption {
  id: string;
  departure: string;
  arrival: string;
  airline: string;
  flightnumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  basePrice: number;
  totalPrice: number;
  baggageAllowance: {
    checked: string;
    carryOn: string;
  };
  penalties: {
    changeFee: string;
    cancelFee: string;
  };
}
