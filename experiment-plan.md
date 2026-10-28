# Spec Orchestra: 작은 비교 실험 (사전 고정)

고정 시점: 구현 에이전트를 시작하기 전. 본 파일의 SHA-256을 기록한다.

## 질문과 두 조건

동일한 합성 웹앱에서 기존 worktree 병렬 개발에 세 규칙을 더하면 결과와 비용이 어떻게 달라지는가?

- A: wan-huiyan/subagent-driven-development의 worktree 병렬 모드를 원문에 근거해 재현한다. task별 구현, 명세 검토 후 코드 품질 검토, 수정/재검토, 전체 변경 검토, 메인 측 로컬 병합을 유지한다.
- B: A에 (1) 병렬 구현 전 실행 가능한 공통 UI 기준 화면, (2) 명세/계약 버전과 변경 영향 task의 중지·갱신·재개 및 오래된 제출 차단, (3) 병합한 상태에서 브라우저 실사용 흐름/UI 검증을 필수로 추가한다.
- 원본 플러그인을 설치하거나 실행하는 비교가 아닌, 지침 기반 워크플로 재현이다. A도 필요한 공통화, 변경 처리, 브라우저 검증을 자율적으로 수행할 수 있다. 실패를 주입하거나 금지하지 않는다.

## 공통 조건

- 앱: 합성 요청 관리. TASK1=요청 등록 UI+POST API, TASK2=검색 목록 UI+GET API. 같은 사전 명세와 같은 작은 Python 표준 라이브러리 scaffold에서 시작한다.
- 각 조건: main coordinator 1명 + 동시에 최대 구현자 2명. main과 구현자 모두 요청 모델 `gpt-6.1-sol`, reasoning `high`. 실제 모델 수락 여부를 기록한다. root 실험자는 공통 fixture와 독립 최종 평가만 담당한다.
- 구현자는 각자 별도 Git branch/worktree에서 작업하고 메인에게 로컬 제출한다. 구현자 push/PR/병합 금지. 검토자는 구현자와 분리하고 검토 슬롯은 구현자 종료 후 사용한다. main은 실제 diff를 읽고 판단하며 최종 병합한다.
- 각 조건의 활성 작업 예산 25분, 구현자 동시 슬롯 2, 수정 라운드 최대 2회. 공통 barrier 대기/평가 도구 인프라 대기는 별도 집계한다. 초과하면 미완료로 보고하고 결과를 숨기지 않는다.
- 기능별 v1 최초 후보가 양쪽 모두 준비되고 아직 최종 검토·통합되기 전 공통 barrier에서 동일한 v2 변경을 전달한다. 이는 중간 변경을 같은 논리적 시점에 주는 장치이다. v1 후보를 v2 제출로 위장하거나 인위적으로 늦게 전달하지 않는다.
- fixture·명세·평가 기준은 공통. 양쪽 구현/중간 결과를 상대에게 전달하지 않는다. 아키텍처/UI 해법은 각 main이 결정한다.
- localhost만 사용. 합성 이름/이메일, 외부 의존성 없는 앱, 기존 설치 Playwright/Chromium만 사용. GitHub 생성/게시, 외부 배포, 유료 API, 자격증명/보안 설정 변경 없음.

## 고정 제품 성공 기준

v2의 API·브라우저 상세 기준은 `common/spec-v2.md`에서 변경 전달 시 공개한다. 기능 요구 자체는 두 조건에 동일하게 전달한다.

1. 유효한 요청 등록 → 목록으로 이동 → 검색해서 새 요청 확인 → 페이지 새로고침 후 유지.
2. 잘못된/누락 이메일 등록 실패와 의미 있는 오류, 구형 payload 거부, GET 결과는 새 필드 구조.
3. 초기 합성 요청 조회·검색이 계속 정상, 빈 결과 표시, HTML이 포함된 입력은 텍스트로 안전하게 렌더링.
4. desktop 1280×800 / mobile 390×844에서 가로 overflow 없이 사용 가능.
5. UI 6개 항목: 공통 shell/header, 같은 navigation/현재 위치, main max-width=960px, system font/본문16px, 공통24px spacing(모바일 외곽16px 허용), 공통 input/button/card 스타일(버튼 높이40px 이상·radius8px·primary #2563eb).

## 측정 정의 (결과를 보기 전 고정)

| 지표 | 계산 |
|---|---|
| 기능/API/browser 성공 | 독립 root 평가의 사전 정의 assertion 통과/전체 및 실패 이유 |
| UI 일관성 | 위 6항목을 두 화면에서 computed style와 screenshot으로 평가, 0/1씩 총6 |
| stale 제출 | v2 통지 이후 v1 기준 후보를 최종 승인 요청한 횟수. 최초 v1 barrier 산출물은 제외 |
| stale 유입 | 구형 명세/계약 구현을 v2 통합 브랜치에 승인·병합한 횟수. 제출 횟수와 구분 |
| 회귀/통합 결함 | 최초 main 완료 선언 시 독립 평가에서 확인한 고유 결함. 실패 assertion을 중복 결함으로 세지 않음 |
| 재작업 | 정상 v2 요구 구현 commit과 구별해, review/evaluation 피드백 후 수정 라운드·commit·변경량 기록 |
| 시간 | 시작·TASK0 완료·v1 barrier·변경 통지·최초 완료·수정 완료 UTC. 총 경과와 barrier 제외 활성 경과를 함께 기록 |
| 운영 복잡성 | agent 시작 수, main 검토/피드백 수, 관리 문서 수·줄 수, shared 수정 수, 충돌·base 변경 처리 기록 |
| 비용 | agent 실행 시간 proxy, invocation 수, 코드/관리 변경량. token/금액이 노출되지 않으면 추정하지 않고 미측정으로 표시 |

## 판정과 한계

단일 비맹검 소규모 사례이며 일반적 우월성이나 통계적 유의성을 주장하지 않는다. 같은 결과/비용 증가도 그대로 보고한다. 두 조건은 독립 무작위 모델 출력이므로 차이를 세 보완 규칙 각각의 인과 효과로 분리할 수 없다. 공통 barrier와 작은 API scaffold가 실제 프로젝트의 변경 경쟁/복잡성을 줄일 수 있다. root 최종 평가 뒤 수정이 있으면 최초 결과와 수정 후 결과를 모두 보존한다.

참조 원문: https://github.com/wan-huiyan/subagent-driven-development/blob/3a020dd96a45ef791f7009f95710fc3bdaadea2d/plugins/subagent-driven-development/SKILL.md
