import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filteredDepartureFlightsSubject = new BehaviorSubject<any[]>([]);
  private filteredReturnFlightsSubject = new BehaviorSubject<any[]>([]);

  filteredDepartureFlights$ = this.filteredDepartureFlightsSubject.asObservable();
  filteredReturnFlights$ = this.filteredReturnFlightsSubject.asObservable();
  private filtersSource = new BehaviorSubject<any>({});
  filters$ = this.filtersSource.asObservable();

  private selectedFiltersSubject = new BehaviorSubject<any>({
    airlines: [],
    destinations: [],
    departures: [],
    layoverCounts: [],
    layoverDestinations: [],
  });
  selectedFilters$ = this.selectedFiltersSubject.asObservable();
  constructor() {}

  Filters(filters: any) {
    this.filtersSource.next(filters);
  }

  updateFilters(updatedFilters: any) {
    const currentFilters = this.selectedFiltersSubject.value;

    // Merge current filters with the new filters (use this if you need to preserve existing selections)
    const newFilters = {
      ...currentFilters,
      ...updatedFilters,
    };
    // Set the new value for the filters
    this.selectedFiltersSubject.next(newFilters);
  }

  // Optionally, reset filters to default (clear selections)
  resetFilters() {
    this.selectedFiltersSubject.next({
      airlines: [],
      destinations: [],
      departures: [],
      layoverCounts: [],
      layoverDestinations: [],
    });
  }
}
