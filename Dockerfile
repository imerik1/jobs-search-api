FROM public.ecr.aws/docker/library/node:20-alpine as build

COPY src src
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY pnpm-lock.yaml pnpm-lock.yaml

RUN corepack enable pnpm
RUN corepack install --global pnpm
RUN pnpm install
RUN pnpm build:prod

FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# COPY .env .env
# COPY ca.pem ca.pem
COPY --from=build node_modules node_modules
COPY --from=build dist .
COPY --from=build package.json package.json

EXPOSE 8080

ENTRYPOINT [ "npm", "run", "start:prod" ]