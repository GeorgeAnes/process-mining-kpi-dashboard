.PHONY: install-backend test-backend run-backend install-frontend test-frontend build-frontend run-frontend

install-backend:
	pip install -r backend/requirements.txt

test-backend:
	python -m pytest

run-backend:
	python -m uvicorn backend.app.main:app --reload --port 8020

install-frontend:
	cd frontend && npm.cmd install

test-frontend:
	cd frontend && npm.cmd test

build-frontend:
	cd frontend && npm.cmd run build

run-frontend:
	cd frontend && npm.cmd run dev
