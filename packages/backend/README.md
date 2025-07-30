# Hexis.cat Backend


## How to Develop with Database

1. fix ./prisma/schema.prisma
2. run `pnpm db:migrate` in local (만약 문제가 있다면 run `pnpm prisma migrate reset` 하면 마지막 마이그레이션 상태로 dev.db 를 초기화 할 수 있다.)
3. run `pnpm dev` -> 개발 및 테스트


`pnpm db:migrate` 는 로컬에서 마이그레이션을 진행하는 명령어이다. 이 명령어는 로컬의 dev.db 파일을 변경하며, .wrangler/state/v3/d1/~.db 의 스키마와 동기화하는 용도로 사용된다. (로컬용)


**dev.db 은 자동으로 변경되는 것 외에 절대 건들지 말것. 이 파일은 로컬과 프로덕션 DB 의 스키마를 동기화하는 용도로 사용되며, 로컬에서 마이그레이션을 진행할 때 사용된다.**

## How to Deploy

1. run `pnpm db:migrate:prod` in local
2. git push

`pnpm db:migrate:prod` 는 프로덕션 DB 의 스키마를 로컬에 동기화하는 명령어이다. 이 명령어는 프로덕션 DB 의 스키마를 로컬에 동기화하는 용도로 사용된다. (프로덕션용)


전반적인 흐름

로컬에서 schema.prisma 변경
dev.db 에 마이그레이션 반영
