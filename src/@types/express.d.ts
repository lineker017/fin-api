import { Customer } from 'src/types/customer'

declare global {
  declare namespace Express {
    export interface Request {
      customer: Customer
    }
  }
}
