# 🍞 Guia Prático: Como Hospedar o Site da Forno & Grão na Vercel

Este guia foi elaborado passo a passo com linguagem simples para que qualquer pessoa consiga colocar o site no ar sem dificuldades.

---

## 📌 O que você vai precisar antes de começar
1. Uma conta gratuita no **[GitHub](https://github.com)** (onde o código do site fica guardado).
2. Uma conta gratuita na **[Vercel](https://vercel.com)** (a plataforma que vai manter o site no ar na internet).

---

## Passo 1: Enviar o código para o GitHub

Se você já usa o GitHub Desktop ou Git no terminal, siga estas instruções:

1. Abra seu terminal (ou Git Bash) na pasta do projeto (`c:\temp\isaque\forno_grao`).
2. Digite os comandos abaixo, um por um:
   ```bash
   git add .
   git commit -m "Site Forno e Grao pronto para deploy"
   ```
3. No site do [GitHub](https://github.com), clique no botão **New** (Novo Repositório).
4. Dê o nome de `forno-grao` e selecione **Private** (Privado) ou **Public** (Público).
5. Copie o endereço do repositório gerado e vincule no seu terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/forno-grao.git
   git push -u origin main
   ```

---

## Passo 2: Conectar o projeto na Vercel

1. Acesse **[vercel.com](https://vercel.com)** e faça login (recomendamos escolher a opção **"Continue with GitHub"**).
2. Na tela principal (Dashboard), clique no botão **"Add New..."** no canto superior direito e selecione **"Project"**.
3. Você verá uma lista com os seus repositórios do GitHub. Encontre o projeto **`forno-grao`** e clique em **"Import"** ao lado dele.

---

## Passo 3: Configurar as Variáveis de Ambiente (MUITO IMPORTANTE ⚠️)

Antes de clicar em Deploy, você precisa informar as chaves do site na seção **"Environment Variables"**:

Na mesma página de importação, desça até o campo chamado **"Environment Variables"** e adicione as seguintes variáveis:

### 1ª Variável (Telefone do WhatsApp onde os pedidos vão cair):
- **Key (Nome):** `NEXT_PUBLIC_WHATSAPP_PHONE`
- **Value (Valor):** `5514997071115`
- Clique em **Add**.

### 2ª Variável (Senha de acesso ao Painel da Equipe):
- **Key (Nome):** `ADMIN_PASSWORD`
- **Value (Valor):** *(crie uma senha forte só sua)*
- Clique em **Add**.

*(Opcional futuro)*: Se mais tarde você quiser o botão nativo do Google OAuth, poderá adicionar também a variável `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Se não colocar, o site já funciona normalmente com o login seguro automático!

---

## Passo 4: Publicar o site

1. Clique no botão azul **"Deploy"** no rodapé da página.
2. Aguarde cerca de 1 a 2 minutos enquanto a Vercel prepara seu site.
3. Quando aparecer a chuva de confetes 🎉, seu site já estará no ar!
4. A Vercel vai gerar um link oficial gratuito (exemplo: `https://forno-grao.vercel.app`).

---

## 📱 Como usar o site no dia a dia

- **Para os clientes:** Eles entram no link, escolhem os pães, bolos e cafés, clicam em *Conectar com o Google* e finalizam o pedido com envio direto para o seu WhatsApp com mensagem personalizada!
- **Para a equipe da padaria:** Basta acessar `/admin` no final do endereço (exemplo: `https://forno-grao.vercel.app/admin`), digitar a senha e acompanhar os pedidos em tempo real com som de sino quando cair pedido novo, além de ver todos os clientes que entraram pelo Google!
