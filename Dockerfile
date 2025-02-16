FROM node:lts

ENV APP_USER=app
ENV APP_DIR=/opt/app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y \
    vim \
    postgresql && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install --ignore-scripts --global --fund=false --loglevel=error pnpm

WORKDIR ${APP_DIR}

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY package.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run --loglevel=error build:server
RUN pnpm run --loglevel=error build:client
RUN pnpm prune --prod

RUN useradd -m ${APP_USER}
RUN chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

USER ${APP_USER}

CMD ["./scripts/entrypoint.sh"]
