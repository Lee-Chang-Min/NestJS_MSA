<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
pnpm install
```


## HISTORY

MSA 멀티 모노레포 프로젝트 구조 선택이유 적자

과하게 폴더 구조화 하지 말고 최대한 직관적으로 구조화 하자.


토큰 userID 보안 강화 고민
토큰에 실제 식별자 대신 임의 식별자(JTI) 사용 혹은 완전한 암호화(JWE: JSON Web Encryption) 도입

Gateway Server 구현
RPC 패턴 선택 -> 이유
비동시식 로직이 많아질시 카프카나 래빗mq 고도화


스키마 설계 고민
데이터 유연성 및 확장성:
각 컬렉션이 명확한 책임을 가지므로 스키마 관리가 용이합니다.
보상 정보만 독립적으로 추가, 수정, 삭제, 조회하기 편리합니다. "보상 등록/조회" 요구사항을 충족하기에 더 적합합니다.
"모든 이벤트의 아이템 보상 목록 조회"와 같이 보상 중심의 다양한 쿼리가 용이합니다.
도큐먼트 크기 문제 회피: 각 도큐먼트가 작게 유지되므로 16MB 제한에 대한 걱정이 적습니다.
데이터 정규화: 보상 정보를 중앙에서 관리하므로 중복을 줄일 수 있습니다. (물론, 이 설계에서는 rewards가 eventId를 가지므로 특정 이벤트에 종속된 보상들입니다. 만약 여러 이벤트에서 "재사용 가능한 보상 템플릿" 개념이 있다면, rewardTemplates 컬렉션을 별도로 두고 이벤트와 다대다 관계로 연결하는 것도 고려할 수 있습니다.)


동시성 제어
