export type PremiumCarValuationResponse = {
    root: {
      RegistrationDate: Date;
      RegistrationYear: number;
      RegistrationMonth: number;
      ValuationPrivateSaleMinimum: number;
      ValuationPrivateSaleMaximum: number;
      ValuationDealershipMinimum: number;
      ValuationDealershipMaximum: number;
    };
};
