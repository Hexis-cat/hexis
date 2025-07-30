# Hexis.cat Backend


## How to Develop with Database

1. fix `./prisma/schema.prisma` 
2. run `pnpm db:migrate` (만약 문제가 있다면 .wrangler 를 삭제하고 다시 시도)
3. run `pnpm dev` -> 개발 및 테스트

*모든 스키마 변경에 대해서는 pnpm db:migrate 를 실행해야 한다. 스키마 변경 후 반드시 실행해야 한다.*

## How to Deploy

1. run `pnpm db:migrate:prod` in local
2. git push

`pnpm db:migrate:prod` 는 프로덕션 DB 의 스키마를 로컬에 동기화하는 명령어이다. 이 명령어는 프로덕션 DB 의 스키마를 로컬에 동기화하는 용도로 사용된다. (프로덕션용)
