# Gráficos das Sessões de Fisioterapia do Victus Exergame

Visualize e analise os dados das sessões de fisioterapia do jogo sério **Victus Exergame**. A aplicação permite que fisioterapeutas acompanhem a evolução dos pacientes por meio de gráficos interativos e relatórios.

---

## Principais Tecnologias

<p align="left">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=fff" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=fff" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=fff" />
  <img src="https://img.shields.io/badge/MUI-7.x-007FFF?logo=mui&logoColor=fff" />
  <img src="https://img.shields.io/badge/Firebase-10.x-FFCA28?logo=firebase&logoColor=fff" />
  <img src="https://img.shields.io/badge/Chart.js-4.x-FF6384?logo=chartdotjs&logoColor=fff" />
  <img src="https://img.shields.io/badge/ApexCharts-3.x-00A8E8?logo=apexcharts&logoColor=fff" />
</p>

---

## Funcionalidades

- Autenticação de usuário (Firebase)
- Listagem e seleção de pacientes
- Visualização de gráficos das sessões
- Filtros por sessão/data
- Relatórios em PDF
- Interface responsiva para desktop e mobile
- Gerenciamento de temas (claro/escuro)

---

## Estrutura do Projeto

```
src/
 ├─ components/         # Componentes reutilizáveis (gráficos, filtros, cabeçalhos, etc)
 ├─ routes/             # Páginas principais (home, login, notFound)
 ├─ firestore/          # Integração com Firebase (pacientes, fisioterapeutas)
 ├─ contexts/           # Contextos globais (tema, autenticação)
 ├─ utils/              # Utilitários e constantes
 ├─ assets/             # Imagens e recursos estáticos
 ├─ main.tsx            # Ponto de entrada da aplicação
 └─ firebase.ts         # Configuração do Firebase
```

---

## Como Executar

1. **Pré-requisitos:**  
   - Node.js (v18+)
   - npm

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o projeto em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

