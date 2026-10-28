# Request Desk — 동일한 중간 변경 요청 v2

v1의 기능·UI·작업 경계·실행 방식은 유지한다. 다음 실제 데이터/API 변경을 두 task에 동일하게 적용한다.

## 변경 이유와 범위

담당자 이름만 있으면 동명이인을 구분할 수 없으므로 이름과 이메일을 분리한다.

- 구형 `contact: string` 필드를 제거하고 `requester: {name: string, email: string}`로 바꾼다. v1 payload의 `contact`만 보내는 요청은422로 거부한다. 새 응답/seed에는 `contact`가 없어야 한다.
- `POST /api/requests` body는 `{title: string, requester: {name: string, email: string}}`. 성공201 `{request: {id: string, title: string, requester: {name: string, email: string}}}`.
- `title`은 trim 후1–80자, `requester.name`은 trim 후1–60자. `requester.email`은 trim 후 공백 없고, 비어 있지 않은 local과 domain, domain에 점이 있는 기본 이메일 형태(예: `arin@example.test`)여야 한다. 정교한 RFC 전체 구현은 필요 없다. 누락/잘못된 타입/부정확한 기본 이메일은422 `{error: string}`.
- 등록 UI label은 `Title`, `Requester name`, `Requester email`, 버튼은 `Create request`. 성공 시 명확한 성공 상태와 목록으로 가는 방법을 제공한다. 오류는 inline error 또는 브라우저 native validation 등 사용자에게 의미 있게 표시한다.
- `GET /api/requests?q=...`는 제목·이름·이메일 부분 문자열을 대소문자 구분 없이 검색하고 v2 구조를 반환한다. 목록은 제목·이름·이메일을 표시한다. Search input/button 이름은 그대로 `Search`.
- main은 seed.json을 아래 동등한 합성 데이터로 갱신한다. 로컬 서버 상태만 사용하므로 별도 디스크 DB migration은 필요 없다. v1 테스트 데이터에만 의존하지 말고 v2로 갱신한다.

```json
[
  {"id":"seed-1","title":"Review welcome copy","requester":{"name":"Mina Park","email":"mina@example.test"}},
  {"id":"seed-2","title":"Check mobile menu","requester":{"name":"Jun Lee","email":"jun@example.test"}}
]
```

## 변경 후 동일 수락 기준

유효한 등록→목록 이동→이메일 검색→새로고침 후 유지, invalid/missing email·legacy payload 거부, 초기 요청 조회·이름/이메일 검색·빈 상태, HTML 입력 안전 표시. desktop1280×800/mobile390×844, v1에 명시된 공통 shell/nav/960px/type/24px spacing/components 유지.

이번 변경은 인위적 오류 주입이 아니라 두 조건에 같은 실제 필드/API 요구 변경이다. 기존 v1 barrier 후보는 정상 초기 작업이며 그 자체로 stale 제출 결함으로 집계하지 않는다.
