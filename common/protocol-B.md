# B — A + 세 보완 규칙

`protocol-A.md` 전체를 동일하게 적용하고 다음만 추가한다.

1. **TASK0 선행:** 기능 구현자 dispatch 전에 공통 shell/nav/960px width/type/spacing/design tokens와 input/button/card를 shared CSS/JS로 구현한다. 실제 server로 `/baseline` 화면을 열 수 있어야 한다. 실행 근거와 baseline commit을 기록하고 두 기능이 이를 소비하도록 packet에 전달한다.
2. **명세 변경 영향 관리:** spec version/contract version/base commit/담당자/소유 파일/상태/제출 revision을 task registry에 기록한다. 변경 수신 시 영향 task를 식별하고 일단 멈춰 checkpoint를 보존한다. main이 계약/공통 자산을 갱신하고 영향 task의 packet과 base를 갱신한 뒤 재개한다. 작업이 이미 멈춘 barrier이면 그 사실을 기록한다. 구버전 제출을 v2 검토/병합 대상으로 승인하지 않는다. base나 candidate HEAD가 바뀌면 기존 증거가 새 상태에도 유효한지 재평가하고 필요하면 다시 실행한다. 사용자 변경과 비영향 작업을 보존한다.
3. **통합 실사용 검증:** main이 기능들을 integration branch에 합친 정확한 HEAD에서 server를 실행하고 브라우저로 등록→이동→검색→새로고침, 오류·빈 상태·HTML 입력, desktop/mobile의 UI6개 항목을 확인한다. 단위 테스트나 정적 diff만으로 실제 사용자 흐름 완료를 선언하지 않는다. 발견한 이슈는 피드백/수정/재검토 후 해당 통합 HEAD에서 재검증한다.

추가 관리 문서/commit/시간도 비용으로 기록한다. 원래 A와 동일한 기능·동시 슬롯·예산을 사용한다. B가 좋다는 결론을 목표로 하지 않는다.
