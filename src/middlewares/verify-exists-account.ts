import { NextFunction, Request, Response } from 'express'

import { customers } from '../app'

// Middleware para verificar se existe um cliente com o CPF
export function verifyExistsAccount(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  // Captura o CPF do route params
  const { cpf } = request.params

  // Busca o cliente filtrando pelo CPF recebido no params
  const customer = customers.find((customer) => customer.cpf === cpf)
  // Verifica se customer existe, caso não, responde um erro para o cliente
  if (!customer) {
    return response.status(400).json({ message: 'Customer not found' })
  }

  request.customer = customer
  // Caso o cliente exista, o next faz com que o código continue executando normalmente
  next()
}
