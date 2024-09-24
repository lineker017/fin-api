export interface Statement {
  description: string
  amount: number
  type: 'credit' | 'debit'
  createdAT: Date
}

export interface Customer {
  id: string
  name: string
  cpf: string
  statement: Statement[]
}
