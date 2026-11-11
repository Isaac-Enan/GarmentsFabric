.PHONY: help install dev test lint migrate seed up down logs clean frontend-install frontend-dev

VENV ?= .venv
PYTHON ?= $(shell if [ -f $(VENV)/bin/python ]; then echo $(VENV)/bin/python; else echo python3; fi)
PYTEST ?= $(shell if [ -f $(VENV)/bin/pytest ]; then echo $(VENV)/bin/pytest; else echo pytest; fi)
RUFF ?= $(shell if [ -f $(VENV)/bin/ruff ]; then echo $(VENV)/bin/ruff; else echo ruff; fi)
BLACK ?= $(shell if [ -f $(VENV)/bin/black ]; then echo $(VENV)/bin/black; else echo black; fi)
UV ?= uv

help:
	@echo "FabriLink Engineering Commands:"
	@echo "  make install         - Set up Python virtual environment and install backend dependencies using uv"
	@echo "  make frontend-install- Install frontend npm dependencies"
	@echo "  make migrate         - Run Django database migrations"
	@echo "  make seed            - Seed demo data (factories, buyers, rolls, orders)"
	@echo "  make dev             - Run Django development server locally"
	@echo "  make frontend-dev    - Run Vite frontend development server"
	@echo "  make test            - Run pytest test suite"
	@echo "  make lint            - Run ruff, black, and mypy checks"
	@echo "  make up              - Start entire stack with docker-compose"
	@echo "  make down            - Stop docker-compose stack"
	@echo "  make logs            - Tail docker-compose logs"

install:
	$(UV) venv .venv
	$(UV) pip install -r backend/requirements/development.txt

frontend-install:
	cd frontend && npm install

migrate:
	$(PYTHON) backend/manage.py migrate

seed:
	$(PYTHON) backend/manage.py seed_demo

dev:
	$(PYTHON) backend/manage.py runserver 0.0.0.0:8000

frontend-dev:
	cd frontend && npm run dev

test:
	$(PYTEST)

lint:
	$(RUFF) check backend && $(BLACK) --check backend

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
