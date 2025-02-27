FROM node:lts-alpine AS build
ENV NODE_ENV=production

RUN npm install --ignore-scripts --global --fund=false --loglevel=error pnpm

WORKDIR /app

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY package.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run --loglevel=error build:server
RUN pnpm run --loglevel=error build:client
RUN pnpm prune --prod


FROM node:lts-alpine
ENV APP_USER=app
ENV APP_DIR=/app

RUN addgroup -S ${APP_USER} && adduser -H -S ${APP_USER} -G ${APP_USER}

WORKDIR ${APP_DIR}
COPY --from=build ${APP_DIR}/node_modules ./node_modules
COPY --from=build ${APP_DIR}/scripts ./scripts
COPY --from=build ${APP_DIR}/dist ./dist

RUN chown -R ${APP_USER}:${APP_USER} ${APP_DIR}
USER ${APP_USER}

ENTRYPOINT [ "./scripts/entrypoint.sh" ]
