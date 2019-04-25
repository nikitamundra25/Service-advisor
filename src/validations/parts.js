import { ValidationTypes } from "js-object-validation";

export const PartValidations = {
  partDescription: {
    [ValidationTypes.REQUIRED]: true,
    [ValidationTypes.MINLENGTH]: 5,
    [ValidationTypes.MAXLENGTH]: 80
  },
  cost: {
    [ValidationTypes.NUMERIC]: true,
    [ValidationTypes.MINVALUE]: 1,
    [ValidationTypes.MAXLENGTH]: 8
  },
  price: {
    [ValidationTypes.NUMERIC]: true,
    [ValidationTypes.MINVALUE]: 1,
    [ValidationTypes.MAXLENGTH]: 8
  },
  note: {
    [ValidationTypes.MAXLENGTH]: 120
  }
};

export const PartValidationMessages = {
  partDescription: {
    [ValidationTypes.REQUIRED]: "Please enter part description.",
    [ValidationTypes.MINLENGTH]:
      "Description should be of at least 5 characters.",
    [ValidationTypes.MAXLENGTH]:
      "Description can not have more than 80 characters."
  },
  cost: {
    [ValidationTypes.NUMERIC]: "Cost should be numeric.",
    [ValidationTypes.MINVALUE]: "Cost should be greater than 0",
    [ValidationTypes.MAXLENGTH]: "Cost can not have more than 8 digits."
  },
  price: {
    [ValidationTypes.NUMERIC]: "Retails price should be numeric.",
    [ValidationTypes.MINVALUE]: "Retails price should be greater than 0",
    [ValidationTypes.MAXLENGTH]:
      "Retails price can not have more than 8 digits."
  },
  note: {
    [ValidationTypes.MAXLENGTH]: "Note can not have more than 120 digits."
  }
};
