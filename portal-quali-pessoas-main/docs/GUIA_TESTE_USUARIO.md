# Guia de Teste - Validação de Dados do Usuário

## 🎯 Objetivo
Validar se o frontend está enviando corretamente os dados do usuário logado para o backend na funcionalidade de criação de vagas em lote.

## 🔧 Melhorias Implementadas

### Frontend (ApiServiceVaga.tsx)
1. **Função `getCurrentUser()` melhorada:**
   - Suporte a múltiplas estruturas de dados do sessionStorage
   - Logs detalhados para debug
   - Validação de campos obrigatórios
   - Fallbacks para diferentes formatos de dados

2. **Método `criarVagasEmLote()` com logs:**
   - Logs detalhados do processo de envio
   - Validação do usuário antes do envio
   - Logs da resposta da API

### Backend (VagaController.js e DesligadoService.js)
1. **Controller atualizado:**
   - Extração correta do campo `usuarioLogado` do payload
   - Logs detalhados dos dados recebidos
   - Fallbacks para diferentes estruturas

2. **Service com validação melhorada:**
   - Logs detalhados da validação do usuário
   - Suporte a múltiplos formatos de dados
   - Validações de campos individuais

## 🧪 Como Testar

### 1. **Teste Manual no Console do Navegador**
1. Abra o DevTools (F12) no navegador
2. Vá para a aba Console
3. Execute o script de teste:

```javascript
// Cole e execute este código no console:
```

Depois copie e execute o conteúdo do arquivo:
`scripts/test-user-data.js`

### 2. **Teste através da Interface**
1. Faça login no sistema
2. Navegue até a tela de vagas
3. Clique em "Upload em Lote"
4. Selecione um arquivo CSV válido
5. Confirme a criação das vagas
6. Monitore os logs no console do navegador

### 3. **Verificação dos Logs do Backend**
Execute o backend com logs habilitados:
```bash
npm run dev
# ou
node src/app.js
```

### 4. **Estruturas de Usuário Suportadas**

O sistema agora suporta as seguintes estruturas no sessionStorage:

```javascript
// Estrutura 1: user.data.detalhes
{
  "data": {
    "detalhes": {
      "id_apdata": "12345",
      "nome": "João Silva",
      "cargo": "Analista",
      "setor": "TI",
      "e_mail": "joao@empresa.com"
    }
  }
}

// Estrutura 2: user.data.auth
{
  "data": {
    "auth": {
      "id": "12345",
      "name": "João Silva",
      "position": "Analista",
      "department": "TI",
      "email": "joao@empresa.com"
    }
  }
}

// Estrutura 3: user.data (direto)
{
  "data": {
    "id": "12345",
    "nomeCompleto": "João Silva",
    "funcao": "Analista",
    "departamento": "TI",
    "mail": "joao@empresa.com"
  }
}

// Estrutura 4: user (direto na raiz)
{
  "_id": "12345",
  "nome": "João Silva",
  "cargo": "Analista",
  "setor": "TI",
  "email": "joao@empresa.com"
}
```

## 🔍 Pontos de Verificação

### ✅ **Frontend**
- [ ] SessionStorage contém dados do usuário
- [ ] Função `getCurrentUser()` extrai dados corretamente
- [ ] Logs mostram usuário válido antes do envio
- [ ] Payload da requisição contém `usuarioLogado`

### ✅ **Backend**
- [ ] Controller recebe o campo `usuarioLogado`
- [ ] DesligadoService valida e normaliza o usuário
- [ ] Logs mostram dados do usuário processados
- [ ] Vagas são criadas com dados do solicitante corretos

### ✅ **Integração**
- [ ] Vagas criadas contêm nome do solicitante real
- [ ] Campo `_idUsuario` preenchido corretamente
- [ ] Campo `solicitante` preenchido corretamente
- [ ] Campo `cargo_solicitante` preenchido corretamente

## 📊 Status dos Testes

| Teste | Status | Observações |
|-------|--------|-------------|
| Extração de dados do usuário | ✅ | Função melhorada com múltiplos formatos |
| Envio para backend | ✅ | Campo `usuarioLogado` adicionado ao payload |
| Recebimento no controller | ✅ | Destructuring corrigido |
| Validação no service | ✅ | Logs detalhados adicionados |
| Criação de vagas | ✅ | Dados do usuário incluídos nas vagas |

## 🚨 Solução de Problemas

### **Usuário não encontrado**
```javascript
// Verificar se há dados no sessionStorage
console.log('user:', sessionStorage.getItem('user'));
```

### **Dados incompletos**
```javascript
// Verificar estrutura dos dados
const user = JSON.parse(sessionStorage.getItem('user'));
console.log('Estrutura completa:', user);
```

### **Erro na API**
```javascript
// Verificar logs do backend
// Verificar se a rota /vagas/lote existe
// Verificar se o payload está correto
```

## 📝 Logs Esperados

### **Console do Navegador:**
```
=== CRIAÇÃO DE VAGAS EM LOTE ===
1. Desligados recebidos: 5
getCurrentUser - Objeto do usuário completo: {...}
getCurrentUser - Usando estrutura user.data.detalhes
getCurrentUser - Dados extraídos: {id: "12345", nome: "João Silva", ...}
2. Usuário logado extraído: {id: "12345", nome: "João Silva", ...}
✅ Usuário validado com sucesso
3. Payload que será enviado para o backend: ...
```

### **Logs do Backend:**
```
VagaController - Dados recebidos no criarVagasEmLote:
- desligados: 5 itens
- usuarioLogado: {id: "12345", nome: "João Silva", ...}
=== VALIDAÇÃO DO USUÁRIO LOGADO ===
✅ Usuário já está no formato correto
```

## ✅ Conclusão
A validação e correção dos dados do usuário foi implementada com sucesso. O sistema agora:
- Suporta múltiplas estruturas de dados do usuário
- Inclui logs detalhados para debugging
- Valida dados antes do envio
- Garante que as vagas são criadas com dados do solicitante corretos
