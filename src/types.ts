
enum UnitID { "adult", "child", "senior", "infant" }
enum ContactField { "fullName", "emailAddress", "phoneNumber" }


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
export type Param = {
    name: string
    options: Option[]
    defaultCurrency: string,
    availableCurrencies: string[]
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
export type Contact = {
    fullName: string | null,
    emailAddress: string | null,
    phoneNumber: string | null,
}

export type Pricing = {
    currency: string,
    currencyPrecision: number,
    price: number,
}
export type UnitItem = {
    unitId: UnitID,
    quantity: number,
    price: number,
}
export type Booking = {
    id: string,
    productId: string,
    optionId: string,
    pricing: Pricing
    unitItems: UnitItem[],
    contact: Contact,
}