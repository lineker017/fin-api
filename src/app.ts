import { randomUUID } from 'crypto'
import express from 'express'

import { verifyExistsAccount } from './middlewares/verify-exists-account'
import { Customer, Statement } from './types/customer'
import { getBalance } from './utils/get-balance'

const app = express()

app.use(express.json())

// Banco de dados em memória
export const customers: Customer[] = []

const minAmountOfDeposit = 0.1
const minAmountOfWithdraw = 0.1
const minAmountOFPix = 0.1
const maxAmountOFPix = 5000

// ROTA: Cria um novo cliente
app.post('/account', (req, res) => {
  // Capturando parâmetros do body
  const { name, cpf } = req.body

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf,
  )

  if (customerAlreadyExists) {
    return res.status(400).json({ message: 'Customer already exists' })
  }

  // Criando objeto do customer
  const customer = {
    id: randomUUID(),
    name,
    cpf,
    statement: [],
  }

  // Adicionando customers a lista
  customers.push(customer)

  return res.status(201).json({
    message: 'Customer created ',
    data: customer,
  })
})

// Rota: Busca os dados de um cliente
app.get('/account/:cpf', verifyExistsAccount, (req, res) => {
  const { customer } = req
  return res.json({ data: customer })
})

// ROTA: Atualizar dado do cliente
app.put('/account/:cpf', verifyExistsAccount, (req, res) => {
  const { customer } = req
  const { name } = req.body as {
    name: string
  }

  // Reatribui o valor do nome com o valor vindo do body
  customer.name = name

  return res.json({ message: 'Account update' })
})

// Rota: Deleta um cliente
app.delete('/account/:cpf', verifyExistsAccount, (req, res) => {
  const { customer } = req

  const balance = getBalance(customer.statement)

  // Verifica se o saldo esta positivo
  if (balance > 0) {
    return res
      .status(400)
      .json({ message: 'You cannot delete an account having positve funds' })
  }

  // verifica se o saldo esta negativo
  if (balance < 0) {
    return res
      .status(400)
      .json({ message: 'You cannot delete an account having negative funds' })
  }

  const customerIndex = customers.findIndex((c) => c.cpf === customer.cpf)

  if (customerIndex !== -1) customers.splice(customerIndex, 1)

  return res.json({ message: 'Account delected' })
})

// Rota: Busca o extrato de um cliente
app.get('/statement/:cpf', verifyExistsAccount, (req, res) => {
  const { customer } = req
  return res.json({ data: customer.statement })
})

// ROTA: Busca o extrato de um cliente pela data
app.get('/statement/:cpf/date', verifyExistsAccount, (req, res) => {
  const { customer } = req
  const { date } = req.query as { date: string }

  // Formata a hora da data passada pra meia noite
  const formatDate = new Date(date + ' 00:00')
  // Filtra os extratos oela data, ignorando o tempo
  const statements = customer.statement.filter(
    (statement) =>
      new Date(statement.createdAT).toDateString() ===
      new Date(formatDate).toDateString(),
  )

  return res.json({ data: statements })
})

// Rota: Deposita um valor a um cliente
app.post('/deposit/:cpf', verifyExistsAccount, (req, res) => {
  const { customer } = req
  const { description, amount } = req.body as {
    description: string
    amount: number
  }

  if (amount < minAmountOfDeposit) {
    return res
      .status(400)
      .json({ message: 'Amount must be greater then the minimum amount' })
  }

  const statement: Statement = {
    description,
    amount,
    type: 'credit',
    createdAT: new Date(),
  }

  customer.statement.push(statement)

  return res.json({
    message: `Deposit worth ${amount} successfully made`,
  })
})

// Rota: Saca um valor de um cliente
app.post('/withdraw/:cpf', verifyExistsAccount, (req, res) => {
  const { customer } = req
  const { description, amount } = req.body as {
    description: string
    amount: number
  }

  if (amount < minAmountOfWithdraw) {
    return res
      .status(400)
      .json({ message: 'Amount must be greater then the minimum amount' })
  }

  const balance = getBalance(customer.statement)

  if (balance < amount) {
    return res.status(400).json({ message: 'Insufficient funds!' })
  }

  const statement: Statement = {
    description,
    amount,
    type: 'debit',
    createdAT: new Date(),
  }

  customer.statement.push(statement)

  return res.json({ message: 'Successfully withdraw' })
})

// ROTA: busca o saldo atual do cliente
app.get('/balance/:cpf', verifyExistsAccount, (req, res) => {
  const { customer } = req

  const balance = getBalance(customer.statement)

  return res.json({ data: { balance } })
})

// ROTA: realiza um pix de uma conta para outra
app.post('/pix/:cpf', verifyExistsAccount, (req, res) => {
  const { customer: sender } = req
  const { target, amount, description } = req.body as {
    target: string
    amount: number
    description: string
  }

  // verifica se o cpf do remetente e igual ao distinatario
  if (sender.cpf === target) {
    return res
      .status(400)
      .json({ message: 'you cannot send a pix to yourself' })
  }

  // verifica se o alvo do pix existe
  const targetCustomer = customers.find((customer) => customer.cpf === target)

  if (!targetCustomer) {
    return res.status(400).json({ message: 'Target customer not found' })
  }

  // verifica se o pix e maior que o limite min
  if (amount < minAmountOFPix) {
    return res
      .status(400)
      .json({ message: 'Amount must be greater the minimun amount' })
  }

  if (amount > maxAmountOFPix) {
    return res
      .status(400)
      .json({ message: 'Amount must be less then or equal to maximun amount' })
  }

  // verifica se o remetente tem saldo suficiente
  const senderBalance = getBalance(sender.statement)

  if (senderBalance < amount) {
    return res.status(400).json({ message: 'insufficient funds' })
  }

  const statementSender: Statement = {
    description,
    amount,
    type: 'debit',
    createdAT: new Date(),
  }

  const statementTarget: Statement = {
    description: `Pix recebido de ${sender.name}`,
    amount,
    type: 'credit',
    createdAT: new Date(),
  }

  // Adiciona a trnasaçao ao seu respectivo cliente
  sender.statement.push(statementSender)
  targetCustomer.statement.push(statementTarget)

  return res.json({ message: 'Pix sent successfully' })
})

export default app
