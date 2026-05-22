# KT_AIVLE_MiniProject4

# 🌐 Git-flow

- **main**: 프로젝트가 최종적으로 배포되는 브랜치
- **develop**: 다음 출시 버전을 개발하는 브랜치
- **feature**: 기능을 개발하는 브랜치

# 📌 Git branch 규칙

- 개인 작업은 꼭 feature 브랜치에서 하기
- 모든 작업 시작 전 develop에서 pull 받은 후 feature 브랜치에서 작업 시작
- 작업 완료 후 feature 브랜치에서 PR로 develop에 merge
- 프로젝트 완료 후 main으로 merge

# 📝 Feature Branch 네이밍

- feature/이름-기능제목#이슈번호
- 예: feature/krong-login#1
- develop merge 전 PR reviewers 팀원 1명 이상 설정 후 approve
- PR 후 팀원 공지

# 🎯 Commit Convention

- 커밋 메시지: #issue number + 깃모지 + 소문자 태그: 메시지

## Commit Tags

🎉 start: Start New Project [:tada:]  
✨ feat: 새로운 기능 추가 [:sparkles:]  
🐛 fix: 버그 수정 [:bug:]  
🎨 design: CSS/UI 디자인 변경 [:art:]  
♻️ refactor: 코드 리팩토링 [:recycle:]  
🔧 settings: 설정 파일 변경 [:wrench:]  
🗃️ comment: 주석 추가/변경 [:card_file_box:]  
➕ dependency/plugin: 라이브러리/플러그인 추가 [:heavy_plus_sign:]  
📝 docs: 문서 수정 [:memo:]  
🔀 merge: 브랜치 병합 [:twisted_rightwards_arrows:]  
🚀 deploy: 배포 [:rocket:]  
🚚 rename: 파일/폴더명 수정/이동 [:truck:]  
🔥 remove: 파일 삭제 [:fire:]  
⏪️ revert: 이전 버전으로 롤백 [:rewind:]
