# fin API = Financeira

## Requisitos

- [X] Deve ser possível criar uma conta
- [X] Deve ser possível buscar o extrato bancário do cliente
- [X] Deve ser possível realizar um depósito
- [X] Deve ser possível realizar um saque
- [x] Deve ser possível realizar uma transferência via PIX
- [x] Deve ser possível buscar o extrato bancário do cliente por data
- [x] Deve ser possível atualizar dados da conta do cliente
- [x] Deve ser possível buscar balanço da conta do cliente
- [X] Deve ser possível obter os dados da conta do cliente
- [x] Deve ser possível deletar uma conta
- 

## Regras de negócio

- [X] Não deve ser possível cadastrar uma conta com CPF já existente
- [X] Não deve ser possível fazer um depósito em uma conta não existente
- [X] Não deve ser possível fazer um depósito menor que o depósito mínimo
- [x] Não deve ser possível fazer um depósito/saque menor que o depósito mínimo
- [x] Não deve ser possível buscar o extrato em uma conta não existente
- [x] Não deve ser possível fazer um saque em uma conta não existente
- [x] Não deve ser possível fazer um pix de/para uma conta não existente
- [x] Não deve ser possível excluir uma conta não existente
- [x] Não deve ser possível fazer um saque quando o saldo for insuficiente
- [x] Não deve ser possível fazer um pix para si mesmo
- [z] Não deve ser possível fazer um pix quand o saldo for insuficiente
- [x] Não deve ser possível fazer um pix acima do limite permitido
- [x] Não deve ser possível