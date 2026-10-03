
<h1 align="center">🏋️‍♂️ Diário Fit</h1>
<h2 align="center">Aplicação para contagem de calorias e exercícios</h2>
<p align="center">
<img src="http://img.shields.io/static/v1?label=STATUS&message=FINALIZADO&color=191970&style=for-the-badge"/>
</p>
<h1></h1>
Esta é uma aplicação web moderna <b>mobile-first</b> voltada para o acompanhamento de rotinas de exercícios, treinos e saúde. 
O projeto foi construído focando em performance, escalabilidade e uma excelente experiência de desenvolvimento, utilizando as ferramentas mais recentes do ecossistema <b>JavaScript/TypeScript</b>.
<h1></h1>
<div align="center">
  <img width="50%" alt="Animação" src="https://github.com/user-attachments/assets/d7486479-aa60-481a-a078-185a58b99029" />
</div>
<h4>Na tela inicial é possível criar e deletar exercícios. Para adicionar um exercício é preciso informar seu nome, grupo muscular, quantidade de séries, repetições e carga. Ao clicar em buscar, o aplicativo autocompleta o nome do exercício e seu respectivo grupo muscular.</h4>
<h1></h1>
<br>
<div align="center">
<img width="537" height="586" alt="Animação2" src="https://github.com/user-attachments/assets/1a40ac8a-478f-4fbc-9f8f-ddb99953b703" />
</div>
<h4>Para adicionar uma refeição, vá para a aba "Refeições" e clique no botão de adicionar. Precisará informar o nome da comida, o momento da refeição, as calorias e proteínas. Se a comida existir na base de dados, aparecerá como sugestão para autocompletar, informando sua respectiva quantidade de calorias e proteínas por 100g.</h4>
<br>
<br>

## 🚀 Tecnologias Utilizadas

Este projeto utiliza uma stack moderna e robusta:

*   **Gerenciador de Pacotes:** [Bun](https://bun.sh/)
*   **Framework Frontend:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Roteamento:** [TanStack Router](https://tanstack.com/router/latest) (Roteamento Type-Safe baseado em arquivos)
*   **Estilização & UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
*   **Backend as a Service (BaaS):** [Supabase](https://supabase.com/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Ferramentas de IA**: Estrutura base e scaffold de UI gerados com [Lovable](https://lovable.dev).


## ✨ Funcionalidades

*   **Registro de Treinos:** Acompanhamento da progressão de cargas na musculação e outros exercícios.
*   **Dieta e Nutrição:** Controle de ingestão de macronutrientes, auxiliando no acompanhamento do consumo de proteínas diárias.
*   **Autenticação e Banco de Dados:** Sincronização de dados em tempo real utilizando Supabase.

## 🔌 API e Dados

O projeto expõe endpoints internos e utiliza bases de dados estruturadas para alimentar o frontend de forma eficiente:

*   **Rotas de Exercícios (`/api/exercise`):** Endpoint dedicado ao fornecimento e gerenciamento dos dados de treinos, permitindo buscar exercícios e seus respectivos grupos musculares trabalhados utilizando a <b>API Ninjas</b>.
*   **Tabela TACO (`taco.json`):** O projeto inclui os dados da Tabela Brasileira de Composição de Alimentos embarcados estaticamente, garantindo consultas rápidas e precisas de valores nutricionais sem depender de APIs externas.

## 🛠️ Como Executar o Projeto (Desenvolvimento Local)

Prefere rodar localmente? Você vai precisar do [Bun](https://bun.sh/) instalado na sua máquina.

```sh
git clone <url-do-seu-repositorio>
cd diario-fit
bun install
bun run dev
```
## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
