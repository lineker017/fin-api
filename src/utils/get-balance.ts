import { Statement } from '../types/customer'

export function getBalance(statements: Statement[]): number {
  const balance = statements.reduce((accumulator, statement) => {
    if (statement.type === 'credit') {
      return accumulator + statement.amount
    } else {
      return accumulator - statement.amount
    }
  }, 0)

  return balance
}
