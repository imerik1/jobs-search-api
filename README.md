# jobs-search-api

Jobs Search API

# Setup your application

- Install NVM for Windows or nvm
- On your terminal, inside your project folder
  - Write `nvm use`
  - Write `npm install -g pnpm@9.6.0`
- Create a [database MySQL on aiven.io](https://aiven.io/)
  - Create in North America to a better performance
  - Choose do-sfo as region
  - Download certificate and put in root directory (DO NOT COMMIT THIS FILE)
    - jobs-search-api/ca.pem
- Use any provider with support to SMTP to send email
  - MailTrap
  - Gmail
  - Outlook
- Create a new App in [Linkedin Developer](https://developer.linkedin.com/) to authentication
- Add the following products:
  - Sign In with LinkedIn using OpenID Connect
  - Add URLs callback eg. http://localhost:8080/api/v1/auth/sso/callback?provider=linkedin
    - Provide your production domain too, if you have one
- Generate two new environment variables JWT_SECRET and CRYPTO_SECRET for your application using the following command:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
