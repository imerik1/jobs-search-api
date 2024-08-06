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
- Optional:
  - Create a new App in [Linkedin Developer](https://developer.linkedin.com/) to authentication
  - Add the following products:
    - Sign In with LinkedIn using OpenID Connect

# Rules

- Always use res.send or res.json to set a body
- Always use res.status to set a status
