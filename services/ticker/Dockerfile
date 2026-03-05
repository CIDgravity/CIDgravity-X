FROM golang:1.23-bookworm AS builder

ARG VERSION=dev

WORKDIR /build

COPY services/ticker/ /build/services/ticker/

WORKDIR /build/services/ticker

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build,id=gobuild-ticker \
    make build VERSION=${VERSION}

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/services/ticker/cidgravity-ticker /usr/local/bin/cidgravity-ticker

WORKDIR /app

EXPOSE 3047

ENTRYPOINT ["cidgravity-ticker"]
