# Request Desk — 공통 명세 v1

합성 데이터만 사용하는 작은 요청 관리 웹앱. Python 표준 라이브러리 HTTP server와 순수 HTML/CSS/JS를 사용한다. 패키지 설치/빌드 불필요.

## 사용자 기능

- TASK1: `/create`에서 제목(Title, 1–80자)과 연락 담당자(Contact, 1–60자)를 입력해 등록한다. 버튼명 `Create request`. 성공 메시지와 목록으로 가는 링크를 보여준다. 잘못된 입력은 사용자에게 오류를 보여준다.
- TASK2: `/requests`에서 모든 요청의 제목과 담당자를 보고, `Search` 입력과 `Search` 버튼으로 제목/담당자 부분 문자열을 대소문자 구분 없이 검색한다. 검색 결과가 없으면 의미 있는 빈 상태를 보여준다.
- 등록한 항목은 서버가 살아 있는 동안 다른 페이지/새로고침에서도 유지된다. 디스크 영속성·인증·삭제·배포는 범위 밖.
- 입력의 HTML을 실행하지 않는다. 키보드로 form/링크/버튼을 사용할 수 있고 label을 연결한다.

## 공통 API/data 계약

- `POST /api/requests` body `{title: string, contact: string}`. 성공 201 `{request: {id: string, title: string, contact: string}}`. validation 실패 422 `{error: string}`. ID는 서버 측에서 생성한다.
- `GET /api/requests?q=<string>` 결과 200 `{requests: Request[]}`. `q`가 없거나 빈 문자열이면 전체. 제목/담당자 부분 문자열 검색.
- scaffold는 `features/create_api.py`의 `create(payload, records)`와 `features/list_api.py`의 `list_requests(query, records)`를 호출한다. `records`는 mutable list, `query`는 `parse_qs` 결과 dict[str,list[str]]. 둘 다 `(HTTP_status, JSON_serializable_dict)`를 반환한다.
- seed: `{id:'seed-1',title:'Review welcome copy',contact:'Mina Park'}`, `{id:'seed-2',title:'Check mobile menu',contact:'Jun Lee'}`.

## 웹 공통 UI 요구 (두 조건 동일)

- 앱 이름 `Request Desk`와 동일한 header/shell. nav에는 `New request`(`/create`), `Requests`(`/requests`)가 있고 현재 위치를 구분한다.
- main max-width 960px, 화면 가운데 정렬. system UI font, 기본 본문 16px. 섹션/그룹 간24px, 모바일 바깥 여백16px 허용.
- input/button/card의 두 화면 스타일을 통일한다. primary 색 #2563eb, 모서리8px, 버튼 높이40px 이상. 1280×800, 390×844에서 가로 overflow가 없어야 한다.
- 색·여백 외의 시각적 세부 표현은 자유롭게 결정한다. baseline 화면 선행 구현은 A에서 선택, B에서 필수이며 제품 요구는 같다.

## 작업 경계

- TASK1 소유: `features/create_api.py`, `web/create.html`, `web/create.js`, `tests/test_create.py`, 필요하면 `web/create.css`.
- TASK2 소유: `features/list_api.py`, `web/requests.html`, `web/requests.js`, `tests/test_list.py`, 필요하면 `web/requests.css`.
- main 소유/조정: `server.py`, `seed.json`, `web/shared.css`, `web/shared.js`, 공통 UI preview, 계약/명세/통합 문서. 필요한 shared 수정은 main에게 요청한다.
- read-only 공통 API/data 계약을 소비하므로 처음부터 한 기능이 다른 기능의 구현 산출물에 의존하지 않는다. shared 변경이 필요해지면 main이 조정한다.

## 실행/초기 검증

`python3 server.py --port <배정-port>`; 테스트 `python3 -m unittest discover -s tests -v`. 현재 scaffold에서 feature 미구현 API는501이며 초기 unittest는0개다. 이는 테스트 통과를 구현 완료로 주장하지 않기 위한 명시적 빈 기반이다.

v1 첫 실행 가능한 후보를 commit하고 main에 보고한 뒤 공통 barrier에서 멈춘다. 아직 최종 review/integration 단계로 넘어가지 않는다. 이 시점에 양쪽 동일한 변경 요청을 받는다.
