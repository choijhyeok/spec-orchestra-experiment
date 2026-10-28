# A — 기존 방식의 공정한 재현

원문: wan-huiyan/subagent-driven-development, commit 3a020dd96a45ef791f7009f95710fc3bdaadea2d. 원본 플러그인을 실행하지 않는다.

1. 명세를 읽고 TASK1/TASK2의 shared 파일·인터페이스·선행 의존성을 분석한다. 공유 변경은 main이 조정한다. 기존 사용자 승인은 이 로컬 실험의 병렬 실행을 포함한다.
2. 기능별 git worktree/branch에서 새로운 구현자를 동시에 시작한다. 구현자는 구현·검증·commit·self-review 후 main에 로컬 결과와 commit을 제출한다. GitHub PR/push/병합은 하지 않는다.
3. 양쪽 v1 후보가 갖춰진 공통 barrier에서 root의 변경 요청을 기다린다. 이는 두 조건의 실험 일정 제약이다.
4. 변경을 받은 뒤 작업/의존성을 합리적으로 다시 조정하고 완료한다. A의 좋은 판단이나 자발적 공통화/변경 관리/브라우저 검증을 금지하지 않는다.
5. 모든 구현 결과가 갖춰지면 task별 명세 준수 검토를 먼저, 코드 품질 검토를 그다음 수행한다. 구현자와 다른 검토자가 실제 코드를 읽고 이슈를 적는다. agent 슬롯은 구현자 종료 후 재사용할 수 있다. 같은 read-only 검토자에게 두 단계를 순서대로 맡겨도 되지만 별도 판정을 남긴다.
6. 이슈는 구현자에게 피드백하고 수정·재검토한다. main도 실제 diff와 실행 근거를 확인한다. 모든 task 전체의 cross-task 통합 검토를 수행한 뒤 main만 기능 branch들을 integration branch에 병합한다.
7. main이 완료 판단과 테스트 근거를 보고한다. 테스트·실제 동작에 필요한 추가 검증은 자율 판단한다. root는 이후 동일 독립 평가를 한다.

## 기록

arm 내부 `evidence/events.jsonl`에 UTC·event·task·commit·요약을 append한다. 시작, shared 변경, worker 시작/종료, barrier, 변경 수신, 제출, 리뷰, 피드백, 병합, 최초 완료를 기록한다. git diff와 테스트 stdout/stderr를 evidence에 보존한다. 시간/금액/token 수치를 추정해서 채우지 않는다. 최종 `evidence/arm-report.md`에 최초 완료 HEAD, 테스트, 수정 횟수, 미해결 항목, 선택한 추가 검증을 적는다.

이 문서는 원문을 약하게 만들기 위한 절차가 아니다. 호스트 tool 이름/슬롯에 맞춰 동일 역할을 재현하며, 실제 diff 검토와 수정 루프를 보존한다. root가 정한 예산/공통 barrier와 2단계 검토자의 슬롯 재사용은 원문 대비 실험적 조정으로 보고한다.
