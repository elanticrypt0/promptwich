FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .

ENV PORT=5006
EXPOSE 5006

CMD ["bun", "run", "start"]
