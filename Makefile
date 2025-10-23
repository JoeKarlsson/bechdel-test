.PHONY: help install dev prod test lint clean deploy docker-up docker-down reset-db fresh

# Default target
help:
	@echo "Bechdel Test - Available Make Commands"
	@echo "======================================="
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server with hot reload"
	@echo "  make test         - Run test suite with coverage"
	@echo "  make lint         - Run all linters (JS, CSS, MD)"
	@echo "  make lint-fix     - Auto-fix linting issues"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build production assets"
	@echo "  make prod         - Build and run production server"
	@echo "  make deploy       - Deploy to production (Proxmox)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up    - Start all Docker services"
	@echo "  make docker-down  - Stop all Docker services"
	@echo "  make reset-db     - Reset database (destroy and recreate)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Clean build artifacts and coverage"
	@echo "  make fresh        - Fresh install (clean + install)"
	@echo ""

# Development commands
install:
	npm install --legacy-peer-deps

dev:
	npm run start:dev

test:
	npm test

lint:
	npm run lint

lint-fix:
	npm run lint:fix

# Production commands
build:
	npm run build

prod: build
	npm run runProd

deploy:
	npm run deploy

# Docker commands
docker-up:
	docker compose up -d

docker-down:
	docker compose down

reset-db:
	docker compose down -v
	docker compose up mongodb -d

# Maintenance commands
clean:
	rm -rf dist coverage node_modules/.cache

fresh: clean
	rm -rf node_modules package-lock.json
	npm install --legacy-peer-deps
