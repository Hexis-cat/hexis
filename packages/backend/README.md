# Hexis.cat Backend


## How to Develop with Database

1. fix ./prisma/schema.prisma
2. run `pnpm db:migrate`
3. run `pnpm dev` -> 개발 및 테스트

### Warning
dev.db 은 절대 건들지 말것. 이 파일은 로컬과 프로덕션 DB 의 스키마를 동기화하는 용도로 사용되며, 로컬에서 마이그레이션을 진행할 때 사용된다.

## How to Deploy

1. run `pnpm db:migrate:prod` in local
2. git push



