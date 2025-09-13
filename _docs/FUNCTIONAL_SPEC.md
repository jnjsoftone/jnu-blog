# 기능 명세서
## JNU-Blog: 블로그 플랫폼 통합 라이브러리

### 📋 문서 정보
- **문서 유형**: 기능 명세서
- **버전**: 1.0
- **최종 업데이트**: 2025-08-30
- **대상 독자**: 개발자, 통합 엔지니어, API 소비자

---

## 1. 개요 및 범위

### 1.1 라이브러리 목적
JNU-Blog는 WordPress, Tistory, Naver Blog, Medium을 포함한 주요 블로그 플랫폼과 통합하기 위한 통합 TypeScript 인터페이스를 제공합니다. 플랫폼 간 타입 안전성과 일관된 오류 처리를 유지하면서 플랫폼별 구현 세부 사항을 추상화합니다.

### 1.2 지원 플랫폼
- **WordPress**: REST API v2를 통한 완전한 CRUD 지원
- **Tistory**: API 연동 (계획됨)
- **Naver Blog**: 블로그 API 통합 (계획됨)
- **Medium**: Publication API 지원 (계획됨)
- **GitHub Pages**: Jekyll/Hugo 정적 사이트 (계획됨)

### 1.3 통합 패턴
- **통합 API**: 플랫폼 간 일관된 함수 시그니처
- **타입 안전성**: 모든 작업에 대한 완전한 TypeScript 정의
- **오류 처리**: 재시도 메커니즘이 포함된 표준화된 오류 응답
- **인증**: 모든 플랫폼에 대한 안전한 자격 증명 관리

---

## 2. WordPress 통합 모듈

### 2.1 클라이언트 관리

#### 2.1.1 함수: `createWPClient(config: WordPressConfig): AxiosInstance`
**목적**: 인증된 WordPress REST API 클라이언트를 초기화합니다.

**입력 명세**:
- `config: WordPressConfig` - WordPress 사이트 구성 및 인증 정보

**WordPressConfig 인터페이스**:
```typescript
interface WordPressConfig {
  baseURL: string;      // WordPress REST API 기본 URL
  username: string;     // 사용자명 또는 이메일
  password: string;     // 애플리케이션 패스워드
}
```

**출력 명세**:
- 반환값 `AxiosInstance` - 인증 헤더가 구성된 axios 클라이언트
- Basic 인증 헤더 자동 설정
- JSON Content-Type 헤더 포함
- WordPress REST API 엔드포인트에 최적화

**동작**:
- 사용자명과 패스워드를 Base64로 인코딩
- Authorization 헤더에 Basic 인증 정보 설정
- axios 인스턴스 생성 및 기본 구성 적용
- 모든 WordPress API 호출에 재사용 가능

**보안 고려사항**:
- 애플리케이션 패스워드 사용 권장
- HTTPS 연결 필수
- 자격 증명은 환경 변수에서 로드

### 2.2 게시물 조회 작업

#### 2.2.1 함수: `getPosts(client: AxiosInstance, params?: QueryParams): Promise<WordPressPost[]>`
**목적**: WordPress 사이트에서 게시물 목록을 조회합니다.

**입력 명세**:
- `client: AxiosInstance` - 인증된 WordPress 클라이언트
- `params?: QueryParams` - 선택적 쿼리 매개변수

**QueryParams 인터페이스**:
```typescript
interface QueryParams {
  page?: number;           // 페이지 번호 (기본값: 1)
  per_page?: number;       // 페이지당 항목 수 (최대: 100)
  search?: string;         // 검색 키워드
  author?: number;         // 작성자 ID
  categories?: number[];   // 카테고리 ID 배열
  tags?: number[];         // 태그 ID 배열
  status?: string[];       // 게시물 상태 배열
  order?: 'asc' | 'desc'; // 정렬 순서 (기본값: 'desc')
  orderby?: string;        // 정렬 기준 (기본값: 'date')
}
```

**출력 명세**:
- 반환값 `Promise<WordPressPost[]>` - 게시물 객체 배열
- 각 게시물에는 ID, 제목, 내용, 메타데이터 포함
- 빈 배열 반환 시 조건에 맞는 게시물 없음

**동작**:
- `/wp/v2/posts` 엔드포인트에 GET 요청
- 쿼리 매개변수를 URL 파라미터로 변환
- 응답 데이터를 WordPressPost 배열로 파싱
- 페이지네이션 지원으로 대량 데이터 처리

#### 2.2.2 함수: `getPost(client: AxiosInstance, postId: number): Promise<WordPressPost>`
**목적**: 특정 ID의 게시물 상세 정보를 조회합니다.

**입력 명세**:
- `client: AxiosInstance` - 인증된 WordPress 클라이언트
- `postId: number` - 조회할 게시물의 고유 ID

**출력 명세**:
- 반환값 `Promise<WordPressPost>` - 단일 게시물 객체
- 완전한 게시물 데이터 (제목, 내용, 메타데이터)
- 존재하지 않는 ID에 대해 404 오류 발생

**동작**:
- `/wp/v2/posts/{postId}` 엔드포인트에 GET 요청
- 응답 데이터를 WordPressPost 객체로 변환
- 권한 검사 (비공개 게시물 접근 제한)

### 2.3 게시물 생성 및 수정

#### 2.3.1 함수: `createPost(client: AxiosInstance, post: WordPressPost): Promise<WordPressPost>`
**목적**: 새로운 WordPress 게시물을 생성합니다.

**입력 명세**:
- `client: AxiosInstance` - 인증된 WordPress 클라이언트
- `post: WordPressPost` - 생성할 게시물 데이터

**WordPressPost 인터페이스**:
```typescript
interface WordPressPost {
  id?: number;              // 게시물 ID (읽기 전용)
  title: {
    rendered?: string;      // 렌더링된 제목 (읽기 전용)
    raw?: string;          // 편집 가능한 원시 제목
  };
  content: {
    rendered?: string;      // 렌더링된 HTML (읽기 전용)
    raw?: string;          // 편집 가능한 원시 HTML
  };
  status?: string;          // draft, publish, private, pending
  date?: string;           // ISO 8601 형식 게시 날짜
  modified?: string;       // 수정 날짜 (읽기 전용)
}
```

**출력 명세**:
- 반환값 `Promise<WordPressPost>` - 생성된 게시물 (ID 포함)
- WordPress에서 할당한 고유 ID 포함
- 생성 타임스탬프 및 메타데이터 포함
- 게시물은 즉시 접근 가능 (상태에 따라)

**동작**:
- `/wp/v2/posts` 엔드포인트에 POST 요청
- 게시물 데이터를 JSON으로 직렬화
- 서버에서 ID 및 타임스탬프 자동 생성
- 생성된 게시물 전체 데이터 반환

**검증 규칙**:
- 제목 또는 내용 중 하나는 필수
- 상태는 유효한 WordPress 상태여야 함
- 날짜는 ISO 8601 형식이어야 함
- HTML 내용은 WordPress에서 허용하는 태그만 포함

#### 2.3.2 함수: `updatePost(client: AxiosInstance, postId: number, post: WordPressPost): Promise<WordPressPost>`
**목적**: 기존 WordPress 게시물을 수정합니다.

**입력 명세**:
- `client: AxiosInstance` - 인증된 WordPress 클라이언트
- `postId: number` - 수정할 게시물 ID
- `post: WordPressPost` - 수정할 데이터 (부분 업데이트 지원)

**출력 명세**:
- 반환값 `Promise<WordPressPost>` - 수정된 게시물 객체
- 지정된 필드만 업데이트됨
- 수정 타임스탬프 자동 업데이트
- 수정 권한 검증 후 실행

**동작**:
- `/wp/v2/posts/{postId}` 엔드포인트에 PUT 요청
- 부분 업데이트 지원 (지정된 필드만 변경)
- 수정 권한 자동 검증
- 원자적 업데이트 (전체 성공 또는 실패)

**권한 요구사항**:
- 게시물 작성자 또는 편집자 권한 필요
- 다른 사용자의 게시물 수정 시 편집자 권한 필요
- 비공개 게시물은 소유자만 수정 가능

#### 2.3.3 함수: `deletePost(client: AxiosInstance, postId: number): Promise<WordPressPost>`
**목적**: WordPress 게시물을 삭제합니다.

**입력 명세**:
- `client: AxiosInstance` - 인증된 WordPress 클라이언트
- `postId: number` - 삭제할 게시물 ID

**출력 명세**:
- 반환값 `Promise<WordPressPost>` - 삭제된 게시물 정보
- 게시물은 휴지통으로 이동 (완전 삭제 아님)
- 삭제 전 게시물 상태 반환

**동작**:
- `/wp/v2/posts/{postId}` 엔드포인트에 DELETE 요청
- 게시물을 휴지통 상태로 변경 (status: 'trash')
- 완전 삭제는 WordPress 관리자에서 수동 실행
- 삭제 권한 자동 검증

**삭제 정책**:
- 일반 삭제: 휴지통으로 이동
- 복구 가능: 휴지통에서 복원 가능
- 완전 삭제: WordPress 관리자를 통해서만 가능

---

## 3. 콘텐츠 처리 시스템 (계획됨)

### 3.1 마크다운 파싱

#### 3.1.1 함수: `parseMarkdown(content: string): ParsedMarkdown`
**목적**: 마크다운 콘텐츠를 파싱하여 메타데이터와 본문을 분리합니다.

**입력 명세**:
- `content: string` - Front matter가 포함된 마크다운 콘텐츠

**출력 명세**:
```typescript
interface ParsedMarkdown {
  frontMatter: BlogMetadata;
  content: string;
  excerpt?: string;
}

interface BlogMetadata {
  title?: string;
  date?: string;
  tags?: string[];
  categories?: string[];
  status?: string;
  excerpt?: string;
  featured_image?: string;
}
```

#### 3.1.2 함수: `convertToHTML(markdown: string): string`
**목적**: 마크다운 콘텐츠를 HTML로 변환합니다.

**동작**:
- GitHub Flavored Markdown 지원
- 코드 블록 구문 강조
- 표 및 작업 목록 지원
- 안전한 HTML 생성 (XSS 방지)

### 3.2 플랫폼별 최적화

#### 3.2.1 함수: `optimizeForWordPress(content: string): string`
**목적**: HTML 콘텐츠를 WordPress에 최적화합니다.

**최적화 작업**:
- WordPress Gutenberg 블록 호환성
- 임베드 코드 최적화
- 이미지 크기 및 속성 조정
- SEO 메타태그 추가

---

## 4. 오류 처리 명세

### 4.1 표준화된 오류 응답

#### 4.1.1 BlogError 인터페이스
```typescript
interface BlogError {
  platform: 'wordpress' | 'tistory' | 'naver' | 'medium';
  type: 'network' | 'auth' | 'validation' | 'permission' | 'server';
  message: string;
  code?: string | number;
  retryable: boolean;
  originalError?: Error;
  context?: {
    postId?: number;
    operation?: string;
    endpoint?: string;
  };
}
```

**오류 범주**:
- **network**: 연결 실패, 타임아웃, DNS 문제
- **auth**: 인증 실패, 잘못된 자격 증명
- **validation**: 잘못된 입력 데이터, 형식 오류
- **permission**: 권한 부족, 접근 거부
- **server**: 플랫폼 서버 오류, 서비스 사용 불가

### 4.2 WordPress 오류 처리

#### 4.2.1 HTTP 상태 코드 매핑
- **400 Bad Request**: 잘못된 게시물 데이터 또는 매개변수
- **401 Unauthorized**: 잘못된 사용자명 또는 패스워드
- **403 Forbidden**: 게시물 작성/수정 권한 부족
- **404 Not Found**: 존재하지 않는 게시물 또는 엔드포인트
- **429 Too Many Requests**: 속도 제한 초과
- **500-503 Server Errors**: WordPress 서버 오류

#### 4.2.2 WordPress 특정 오류
```typescript
interface WordPressErrorResponse {
  code: string;
  message: string;
  data: {
    status: number;
    params?: any;
  };
}
```

**일반적인 WordPress 오류 코드**:
- `rest_cannot_create`: 게시물 생성 권한 없음
- `rest_cannot_edit`: 게시물 수정 권한 없음
- `rest_post_invalid_id`: 잘못된 게시물 ID
- `rest_invalid_param`: 잘못된 매개변수
- `rest_forbidden`: 접근 금지

### 4.3 재시도 로직 및 복구

#### 4.3.1 자동 재시도 조건
- 네트워크 타임아웃 및 연결 실패
- 서버 오류 (500, 502, 503, 504)
- 속도 제한 (429)
- 일시적 서비스 사용 불가

#### 4.3.2 지수 백오프 전략
```typescript
const retryDelays = [1000, 2000, 4000, 8000, 16000]; // 밀리초
```
- 1초 후 초기 재시도
- 이후 각 재시도마다 지연 시간 두 배
- 최대 5회 재시도 시도
- 재시도 불가능한 오류는 즉시 실패

---

## 5. 데이터 모델 및 타입

### 5.1 WordPress 게시물 모델

#### 5.1.1 완전한 WordPressPost 인터페이스
```typescript
interface WordPressPost {
  // 기본 필드
  id?: number;
  date?: string;
  date_gmt?: string;
  guid?: { rendered: string };
  modified?: string;
  modified_gmt?: string;
  slug?: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type?: string;
  link?: string;
  
  // 콘텐츠 필드
  title: {
    rendered?: string;
    raw?: string;
  };
  content: {
    rendered?: string;
    raw?: string;
    protected?: boolean;
  };
  excerpt?: {
    rendered?: string;
    raw?: string;
    protected?: boolean;
  };
  
  // 관계 필드
  author?: number;
  featured_media?: number;
  comment_status?: 'open' | 'closed';
  ping_status?: 'open' | 'closed';
  sticky?: boolean;
  template?: string;
  format?: string;
  
  // 분류 필드
  categories?: number[];
  tags?: number[];
  
  // 메타데이터
  meta?: Record<string, any>;
}
```

### 5.2 응답 타입

#### 5.2.1 API 응답 래퍼
```typescript
interface BlogAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: BlogError;
  metadata?: {
    platform: string;
    timestamp: string;
    request_id?: string;
  };
}
```

#### 5.2.2 배치 작업 응답
```typescript
interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{
    input: any;
    error: BlogError;
  }>;
  summary: {
    total: number;
    success_count: number;
    failure_count: number;
    success_rate: number;
  };
}
```

---

## 6. 성능 및 확장성

### 6.1 요청 최적화

#### 연결 풀링
```typescript
const axiosConfig = {
  timeout: 30000,
  maxRedirects: 5,
  headers: {
    'User-Agent': 'JNU-Blog/1.0',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate'
  }
};
```

#### 요청 배칭
- **병렬 요청**: 독립적 작업 동시 실행
- **순차 요청**: 의존성이 있는 작업 순서 보장
- **제한된 동시성**: 서버 부하 방지를 위한 동시 요청 제한

### 6.2 캐싱 전략

#### 메타데이터 캐싱
```typescript
interface CacheConfig {
  enabled: boolean;
  ttl: number;              // Time to live (초)
  maxSize: number;          // 최대 캐시 항목 수
  strategy: 'lru' | 'fifo'; // 캐시 제거 전략
}
```

### 6.3 메모리 관리
- **스트리밍**: 대용량 콘텐츠 처리
- **페이지네이션**: 대량 게시물 조회 시 페이지 단위 처리
- **가비지 컬렉션**: 사용 후 리소스 즉시 해제

---

## 7. 보안 및 검증

### 7.1 입력 검증

#### 콘텐츠 검증
```typescript
interface ContentValidation {
  validateTitle(title: string): ValidationResult;
  validateContent(content: string): ValidationResult;
  validateStatus(status: string): ValidationResult;
  sanitizeHTML(html: string): string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### HTML 살균
- **허용된 태그**: 안전한 HTML 태그만 허용
- **속성 필터링**: 위험한 속성 제거
- **스크립트 차단**: JavaScript 코드 완전 제거
- **링크 검증**: 외부 링크 보안 검사

### 7.2 권한 관리
```typescript
interface PermissionCheck {
  canCreatePost(user: WordPressUser): boolean;
  canEditPost(user: WordPressUser, post: WordPressPost): boolean;
  canDeletePost(user: WordPressUser, post: WordPressPost): boolean;
  canPublishPost(user: WordPressUser): boolean;
}
```

---

## 8. 미래 확장 계획

### 8.1 Tistory 통합 (계획됨)

#### API 구조
```typescript
interface TistoryPost {
  id?: string;
  title: string;
  content: string;
  visibility: 'public' | 'protected' | 'private';
  category: string;
  tags: string[];
  publishTime?: string;
}

interface TistoryConfig {
  blogName: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
}
```

### 8.2 Naver Blog 통합 (계획됨)

#### API 구조
```typescript
interface NaverBlogPost {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  isOpen: boolean;
  publishDate?: string;
}
```

### 8.3 통합 인터페이스 (계획됨)
```typescript
interface UniversalBlogPost {
  title: string;
  content: string;
  status: 'draft' | 'published' | 'private';
  tags: string[];
  categories: string[];
  publishDate?: Date;
  metadata?: Record<string, any>;
}

// 플랫폼 독립적 함수
async function publishToAllPlatforms(
  post: UniversalBlogPost,
  platforms: BlogPlatform[]
): Promise<PublishResult[]>;
```

---

*문서 버전: 1.0*  
*최종 업데이트: 2025-08-30*  
*다음 검토: 2025-09-30*