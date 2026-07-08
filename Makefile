.PHONY: up down reset test test-unit test-e2e test-db

up: ## Sobe Supabase (Docker) + app (Docker Compose)
	npx supabase start
	docker compose up -d

down: ## Derruba app e Supabase
	docker compose down
	npx supabase stop

reset: ## Recria o banco a partir das migrations + seeds
	npx supabase db reset

test: test-unit test-db ## Testes unitários/componentes + banco (pgTAP)

test-unit:
	npm run test:unit

test-e2e:
	npm run test:e2e

test-db:
	npx supabase test db
