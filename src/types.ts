
export type UnitID =  "adult" | "child" | "senior" | "infant"
export type ContactField= "fullName" | "emailAddress" | "phoneNumber"


export interface ValidateJWT {
    valid: boolean
    payload?: any
  }

export interface Product{
    id: string,
    name: string,
    options: Option[]
    defaultCurrency: string, // "EUR
    availableCurrencies: string[] // ["EUR", "USD"]
}

export type Option = {
    id: string,
    default: boolean,
    name: string,
    requiredContactFields: ContactField[],
    units: Unit[]
}

export type Unit = {
    id: UnitID
    name: string,
    pricing: Pricing[]
}

export type Pricing = {
    currency: string,
    currencyPrecision: number,
    price: number,
}
