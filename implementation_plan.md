# 강좌 수강 메뉴 추가, 후기 확인 버튼 및 모바일 접기 기능 구현 계획

사용자 피드백에 맞춰 랜딩 페이지(`app/page.js`)에 강좌 수강과 관련된 네비게이션을 강화하고, 모바일 화면에서의 콘텐츠 가독성을 위해 후기 섹션에 아코디언(접기/펼치기) 기능을 도입하는 계획입니다.

## User Review Required

> [!IMPORTANT]
> 1. **상단 네비게이션 메뉴 추가**:
>    * 데스크톱 헤더 및 모바일 메뉴의 **"주요기능"** 옆에 **"강좌 수강"** 메뉴를 추가하여 사용자가 곧바로 자격증 강좌 정보(`#course` 섹션)로 이동할 수 있게 합니다.
> 2. **강좌 후기 확인하기 버튼 추가**:
>    * `#course` 섹션 내의 **"강좌 수강 문의하기"** 버튼 옆에 **"강좌 후기 확인하기"** 버튼을 신설합니다.
>    * 클릭 시 후기 섹션(`#reviews`)으로 스크롤 이동합니다.
>    * 모바일 해상도를 고려해 버튼 배열이 세로로 예쁘게 정렬되도록 flex 반응형 레이아웃을 도입합니다.
> 3. **모바일 전용 후기 접기/펼치기 토글**:
>    * 모바일 화면(768px 미만)에서는 후기 목록이 접힌 상태(`max-h-0`, `opacity-0`)로 렌더링됩니다.
>    * **"수강생들이 증명하는 생생한 변화"** 제목 텍스트를 터치하면 아코디언 형태로 부드러운 애니메이션(`transition-all duration-500`)과 함께 후기 목록이 펼쳐집니다.
>    * 모바일 사용자의 직관적인 터치를 유도하기 위해 제목 옆에 동적인 힌트 텍스트(`▼ 후기 보기` / `▲ 접기`)를 제공합니다.
>    * 데스크톱(768px 이상)에서는 토글 없이 항상 후기가 전체 노출됩니다.

---

## Proposed Changes

### app/page.js

#### 1. React 상태 정의 및 모바일 토글 로직 추가
* 아코디언 토글을 제어하기 위한 `isReviewsExpanded` 상태 변수를 컴포넌트에 선언합니다:
  ```javascript
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  ```

#### 2. 헤더 및 모바일 서랍 메뉴 수정
* **데스크톱 헤더 (Line 145 부근)**:
  ```diff
    <Link className="hover:text-primary transition-colors" href="#features">주요기능</Link>
+   <Link className="hover:text-primary transition-colors" href="#course">강좌 수강</Link>
    <Link className="hover:text-primary transition-colors" href="/gallery">갤러리</Link>
  ```
* **모바일 서랍 메뉴 (Line 193 부근)**:
  ```diff
    <Link onClick={() => setIsMobileMenuOpen(false)} href="#features">주요기능</Link>
+   <Link onClick={() => setIsMobileMenuOpen(false)} href="#course">강좌 수강</Link>
    <Link onClick={() => setIsMobileMenuOpen(false)} href="/gallery">갤러리</Link>
  ```

#### 3. 강좌 수강 섹션 버튼 레이아웃 변경 (Line 550 부근)
* "강좌 수강 문의하기" 단독 링크 형태에서, "강좌 후기 확인하기" 버튼이 나란히 배치된 반응형 레이아웃으로 변경합니다:
  ```html
  <div className="mt-12 flex flex-col sm:flex-row gap-4">
      <Link 
          href="/appointment"
          className="inline-flex items-center justify-center gap-2 bg-[#2E7D32] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-[#1B5E20] transition-all shadow-lg text-center"
      >
          강좌 수강 문의하기
          <span className="material-symbols-outlined">arrow_forward</span>
      </Link>
      <Link 
          href="#reviews"
          className="inline-flex items-center justify-center gap-2 bg-white text-[#2E7D32] border-2 border-[#2E7D32] px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition-all text-center"
      >
          강좌 후기 확인하기
          <span className="material-symbols-outlined">visibility</span>
      </Link>
  </div>
  ```

#### 4. 후기 섹션 제목 및 목록 스타일 토글 구현 (Line 595 부근)
* 제목 영역에 클릭 이벤트 바인딩 및 모바일용 확장 힌트 아이콘 노출:
  ```html
  <div 
      className="text-center mb-16 cursor-pointer md:cursor-default" 
      onClick={() => {
          if (window.innerWidth < 768) {
              setIsReviewsExpanded(!isReviewsExpanded);
          }
      }}
  >
      <span className="text-[#2E7D32] font-bold text-lg mb-4 block">STUDENT REVIEWS</span>
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B5E20] flex items-center justify-center gap-2">
          수강생들이 증명하는 생생한 변화
          <span className="inline-block md:hidden text-sm font-normal text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full ml-2">
              {isReviewsExpanded ? '▲ 접기' : '▼ 후기 보기'}
          </span>
      </h2>
      <p className="text-gray-500 mt-4">정성껏 써주신 자필 강의 참여 후기입니다.</p>
  </div>
  ```
* 목록 컨테이너에 상태 기반 높이 및 불투명도 트랜지션 클래스 부여:
  ```html
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500 overflow-hidden ${
      isReviewsExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 md:max-h-[5000px] opacity-0 md:opacity-100'
  }`}>
      {reviewsData.map((review) => ( ... ))}
  </div>
  ```

---

## Verification Plan

### Automated/Build Verification
* `npm run build` 실행을 통해 JSX 마크업 및 React 상태 제어 문법 에러 여부를 사전에 스크리닝합니다.

### Manual Verification
1. **메뉴 이동 확인**: 상단 메뉴의 "강좌 수강" 버튼 클릭 시 정확히 자격증 강좌 설명 섹션으로 자연스럽게 스크롤링되는지 확인합니다.
2. **버튼 레이아웃 검증**: 강좌 수강 섹션 하단에 두 개의 버튼이 미려하게 배치되었는지, 특히 모바일 너비에서 수직으로 나란히 포개어지는지 검증합니다.
3. **모바일 후기 아코디언 검증**:
   - 모바일 개발자 도구(너비 768px 미만)로 세팅하여 초기 로드 시 후기 목록이 나타나지 않는 상태인지 확인합니다.
   - 제목 영역을 터치했을 때 부드럽게 펼쳐지며 우측 힌트 문구가 '▲ 접기'로 변경되는지 검증합니다.
   - 데스크톱 너비로 원복 시 제목을 눌러도 접히지 않고 전체 내용이 항상 드러나는지 확인합니다.
