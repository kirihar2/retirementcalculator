# Multi-stage build for the backend.
#
# Stage 1: build a static binary.
# Stage 2: run it on a minimal base image.
#
# Cloud Run runs the container on the port set by the $PORT env var
# (default 8080), which the backend already honors.

FROM golang:1.22-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Build a static binary for Alpine. CGO_ENABLED=0 keeps it hermetic.
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /srv/backend .

FROM alpine:3.20
# ca-certificates is required for HTTPS calls to Google APIs.
RUN apk add --no-cache ca-certificates

WORKDIR /srv
COPY --from=build /srv/backend /srv/backend

# Cloud Run injects $PORT at runtime.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/srv/backend"]
