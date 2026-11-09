# EcoRota RMR - Navegação Multimodal Sustentável

Aplicação **Full-Stack** desenvolvida como projeto acadêmico para a disciplina de Análise, Projeto e Complexidade de Algoritmos (**APCA**), com foco na otimização de rotas multimodais na Região Metropolitana do Recife (RMR) e incentivo ao uso de meios de transporte sustentáveis.

---

## 🌟 Principais Funcionalidades

1. **Arquitetura Full-Stack Segura**: 
   - **Backend (Node.js + Express)**: Gerencia as requisições, protege as credenciais sensíveis e comunica-se de forma segura com os serviços da Google.
   - **Frontend (HTML5, CSS3, JavaScript)**: Interface moderna e responsiva. A chave de API do mapa é solicitada dinamicamente pelo servidor (`/api/maps-key`), evitando a exposição de credenciais no repositório de código.
2. **Modo Claro / Escuro (Dark/Light Mode)**: 
   - Botão de alternância instantânea no canto superior direito do cabeçalho.
   - Preferência de tema salva automaticamente no navegador (`localStorage`).
3. **Acessibilidade para Idosos (Design Inclusivo)**:
   - Tipografia ampliada (fontes base de 18px a 32px), contraste otimizado em ambos os temas e botões/elementos de toque maiores para facilitar a usabilidade.
4. **Integração com Google Maps Routes API v2**:
   - Traçado real sobre as vias, avenidas, e linhas de transporte da RMR com cálculo preciso de distância e tempo.
   - Decodificação dos passos multimodais (`steps` e `transitDetails`), indicando pontos exatos de embarque, desembarque e baldeações (ônibus, metrô, BRT e caminhada).
5. **Modelagem Ecológica Avançada (Emissão Marginal Zero)**:
   - Considera que o transporte público (ônibus e metrô) possui **emissão marginal nula** para o passageiro (o veículo roda independentemente da presença do usuário), não adicionando $\text{CO}_2$ extra em comparação ao transporte individual.
   - **Opção de Bicicleta**: Modo ativo com custo financeiro zero (`R$ 0,00`) e emissão zero.
   - **Comparativo de Impacto**: Cálculo em tempo real da quantidade em gramas de $\text{CO}_2$ evitada em comparação com um veículo particular a gasolina (~120g $\text{CO}_2$/km).
6. **Perfis de Otimização e Pesos Personalizados**:
   - Alternância entre perfis pré-configurados (*Transporte Público*, *Bicicleta*, *Econômica*, *Mais Rápida*) ou *Personalizada* (com *sliders* interativos para ajustar os pesos de Distância, Tempo, Custo e Pegada de Carbono).

---

## 📂 Estrutura do Projeto

```text
Rotas RMR/
│
├── public/                # Frontend estático
│   ├── css/
│   │   └── styles.css     # Estilos globais e variáveis CSS para Modo Claro/Escuro
│   ├── js/
│   │   └── app.js         # Lógica de interface, eventos, requisições e integração Leaflet/Google
│   └── index.html         # Página principal da aplicação
│
├── src/                   # Backend Node.js
│   ├── route-service.js   # Comunicação via Fetch com a Google Routes API v2
│   └── server.js          # Servidor Express, rotas da API e entrega segura de ativos
│
├── .env.example           # Modelo de variáveis de ambiente
├── .gitignore             # Arquivos ignorados pelo Git (incluindo .env e node_modules)
└── package.json           # Dependências e scripts do projeto
```

---

## ⚙️ Pré-requisitos e Instalação

Certifique-se de ter o **Node.js (versão 18 ou superior)** instalado em sua máquina.

1. Clone o repositório ou extraia a pasta do projeto.
2. Abra o terminal na raiz do projeto e instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo chamado `.env` na raiz do projeto (baseando-se no `.env.example`) e insira a sua chave da Google Cloud:
   ```env
   GOOGLE_API_KEY=sua_chave_aqui_da_google_cloud
   PORT=3000
   ```
   *(Nota: No Google Cloud Console, certifique-se de que a **Routes API**, a **Maps JavaScript API** e a **Places API** estejam ativadas para a sua chave).*

---

## 🚀 Como Executar

Para iniciar o servidor localmente, execute o comando:

```bash
npm start
```

O servidor será iniciado na porta configurada (padrão `3000`). Abra o seu navegador e acesse:

```text
http://localhost:3000
```

---

## 🔒 Segurança no Controle de Chaves (GitHub Safe)

O projeto foi estruturado seguindo boas práticas de segurança de software:
- A chave privada do Google reside exclusivamente no arquivo `.env` no servidor backend.
- O arquivo `.env` está listado no `.gitignore` e **nunca** será versionado ou enviado para o GitHub.
- O front-end obtém a chave de acesso ao mapa de forma controlada através do endpoint interno do servidor (`/api/maps-key`).