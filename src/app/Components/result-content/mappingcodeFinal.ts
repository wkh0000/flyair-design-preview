// ngOnInit(): void {
//   if (
//     this.searchResults.CatalogProductOfferingsResponse.Result['@type'] ===
//     'Result'
//   ) {
//     console.log('raw data', this.searchResults);
//     const catalogProductOfferings =
//       this.searchResults.CatalogProductOfferingsResponse
//         .CatalogProductOfferings?.CatalogProductOffering || [];
//     this.transactionId =
//       this.searchResults.CatalogProductOfferingsResponse.transactionId;
//     this.identifier =
//       this.searchResults.CatalogProductOfferingsResponse.CatalogProductOfferings?.Identifier?.value;

//     const brandReferenceList =
//       this.searchResults?.CatalogProductOfferingsResponse.ReferenceList?.[3]
//         ?.Brand || [];
//     const ReferenceTermsList =
//       this.searchResults?.CatalogProductOfferingsResponse.ReferenceList?.[2]
//         ?.TermsAndConditions || [];
//     const ReferenceProductList =
//       this.searchResults?.CatalogProductOfferingsResponse.ReferenceList?.[1]
//         ?.Product || [];

//     catalogProductOfferings.forEach((CatalogProductOffering: any) => {
//       const productBrandOptions =
//         CatalogProductOffering.ProductBrandOptions || [];
//       if (Array.isArray(productBrandOptions)) {
//         productBrandOptions.forEach((option) => {
//           if (option.flightRefs) {
//             const flightRefs = option?.flightRefs || [];
//             const referenceListFlight =
//               this.searchResults.CatalogProductOfferingsResponse
//                 .ReferenceList?.[0]?.Flight || [];
//             const matchedFlights = Array.isArray(flightRefs)
//               ? flightRefs.map((ref: any) =>
//                   referenceListFlight.find((flight: any) => flight.id === ref)
//                 )
//               : [];
//             option.flightRefs = matchedFlights;
//             matchedFlights.forEach((flight: any) => {
//               if (flight?.operatingCarrierName) {
//                 if (!this.carriers.includes(flight.operatingCarrierName)) {
//                   this.carriers.push(flight.operatingCarrierName);
//                 }
//               } else {
//                 const carrierName = flight?.carrier || 'Unknown Carrier';
//                 if (!this.carriers.includes(carrierName)) {
//                   this.carriers.push(carrierName);
//                 }
//               }
//             });
//           }
//         });

//         const productBrandOfferings =
//           CatalogProductOffering?.ProductBrandOptions || [];

//         if (Array.isArray(productBrandOfferings)) {
//           productBrandOfferings.forEach((BrandOffering: any) => {
//             const BrandReff = BrandOffering?.ProductBrandOffering || [];

//             if (Array.isArray(BrandReff)) {
//               BrandReff.forEach((brand: any) => {
//                 if (brand?.Brand) {
//                   const brandmapref = brand.Brand.BrandRef || 'b0';
//                   const matchedBrand = Array.isArray(brandmapref)
//                     ? brandmapref.map((ref: any) =>
//                         brandReferenceList.find((b: any) => b.id === ref)
//                       )
//                     : brandReferenceList.find(
//                         (b: any) => b.id === brandmapref
//                       );
//                   brand.Brand.BrandRef = Array.isArray(matchedBrand)
//                     ? matchedBrand
//                     : [matchedBrand];
//                 }

//                 if (brand?.TermsAndConditions) {
//                   const TermsRef =
//                     brand.TermsAndConditions.termsAndConditionsRef || [];
//                   const matchedTerm = Array.isArray(TermsRef)
//                     ? TermsRef.map((ref: any) =>
//                         ReferenceTermsList.find(
//                           (term: any) => term.id === ref
//                         )
//                       )
//                     : ReferenceTermsList.find(
//                         (term: any) => term.id === TermsRef
//                       );
//                   brand.TermsAndConditions.termsAndConditionsRef =
//                     matchedTerm;
//                 }

//                 if (Array.isArray(brand?.Product) && brand.Product[0]) {
//                   const ProductRef = brand.Product[0].productRef || null;
//                   const matchedProduct = Array.isArray(ProductRef)
//                     ? ProductRef.map((ref: any) =>
//                         ReferenceProductList.find(
//                           (prod: any) => prod.id === ref
//                         )
//                       )
//                     : ReferenceProductList.find(
//                         (prod: any) => prod.id === ProductRef
//                       );
//                   brand.Product[0].productRef = matchedProduct;
//                 }
//               });
//             }
//           });
//         }
//       }

//       if (CatalogProductOffering.sequence === 1) {
//         this.sequenceOneOfferings = [
//           ...(this.sequenceOneOfferings || []),
//           CatalogProductOffering,
//         ];
//       } else if (CatalogProductOffering.sequence === 2) {
//         this.sequenceTwoOfferings = [
//           ...(this.sequenceTwoOfferings || []),
//           CatalogProductOffering,
//         ];
//       }
//     });
//     this.allFlights = [
//       ...(this.sequenceOneOfferings || []),
//       ...(this.sequenceTwoOfferings || []),
//     ];

//     this.flightOptions = this.searchResults;
//     console.log('Final data after processing:', this.flightOptions);
//     console.log('Sequence 1 Offerings:', this.sequenceOneOfferings);
//     console.log('Sequence 2 Offerings:', this.sequenceTwoOfferings);
//     // this.filterService.setFlights(this.sequenceOneOfferings, this.sequenceTwoOfferings);  // Save original flights in FilterService
//   } else {
//     alert('No Flight Results for your Requirements');
//   }
// }

