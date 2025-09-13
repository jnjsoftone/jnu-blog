# 기술 요구사항 정의서
## JNU-Blog: 블로그 플랫폼 통합 라이브러리

### 📋 문서 정보
- **문서 유형**: 기술 요구사항 정의서 (TRD)
- **버전**: 1.0
- **최종 업데이트**: 2025-08-30
- **대상 독자**: 개발자, 아키텍트, DevOps 엔지니어

---

## 1. 시스템 아키텍처

### 1.1 전체 시스템 구조
```
JNU-Blog Library
├── Platform Integration Layer
│   ├── WordPress Client
│   ├── Tistory Client (planned)
│   ├── Naver Blog Client (planned)
│   └── Medium Client (planned)
├── Content Processing Layer
│   ├── Markdown Parser
│   ├── HTML Converter
│   ├── Media Handler
│   └── Metadata Extractor
├── Abstraction Layer
│   ├── Unified Blog Interface
│   ├── Content Normalizer
│   └── Response Formatter
└── Utility Layer
    ├── Authentication Manager
    ├── Error Handler
    └── Configuration System
```

### 1.2 모듈 설계

#### WordPress 통합 모듈 (`src/wordpress.ts`)
- **목적**: WordPress REST API v2 클라이언트 구현
- **책임**: 인증, CRUD 작업, 오류 처리
- **의존성**: axios (HTTP 클라이언트), Basic 인증

#### 콘텐츠 처리 모듈 (계획됨)
- **목적**: 마크다운 콘텐츠를 플랫폼별 형식으로 변환
- **책임**: 파싱, 변환, 최적화
- **의존성**: marked (마크다운 파서), gray-matter (front matter)

#### 유틸리티 모듈 (`src/types.ts`)
- **목적**: 공통 타입 정의 및 인터페이스
- **책임**: 타입 안전성, 구조 정의
- **확장성**: 새로운 플랫폼 타입 추가

---

## 2. WordPress 통합 세부사항

### 2.1 인증 아키텍처

#### Basic 인증 구현
```typescript
interface WordPressConfig {
  baseURL: string;      // WordPress 사이트 URL
  username: string;     // 사용자명 또는 이메일
  password: string;     // 애플리케이션 패스워드
}
```

#### 클라이언트 초기화
- **인증 방식**: HTTP Basic Authentication
- **헤더 구성**: Authorization 및 Content-Type 설정
- **기본 URL**: WordPress REST API 엔드포인트 (`/wp-json/wp/v2/`)

### 2.2 API 엔드포인트 매핑

#### 게시물 관리
```typescript
// 엔드포인트 구조
GET    /wp/v2/posts           // 게시물 목록 조회
GET    /wp/v2/posts/{id}      // 특정 게시물 조회
POST   /wp/v2/posts           // 새 게시물 생성
PUT    /wp/v2/posts/{id}      // 게시물 수정
DELETE /wp/v2/posts/{id}      // 게시물 삭제
```

#### 요청/응답 형식
```typescript
interface WordPressPost {
  id?: number;
  title: {
    rendered?: string;    // 렌더링된 제목 (읽기 전용)
    raw?: string;        // 원시 제목 (편집 가능)
  };
  content: {
    rendered?: string;    // 렌더링된 내용
    raw?: string;        // 원시 HTML 내용
  };
  status?: string;       // draft, publish, private, pending
  date?: string;         // ISO 8601 형식 게시 날짜
  modified?: string;     // 수정 날짜
}
```

### 2.3 오류 처리 메커니즘

#### HTTP 상태 코드 처리
- **200 OK**: 성공적인 요청
- **201 Created**: 게시물 생성 성공
- **400 Bad Request**: 잘못된 요청 데이터
- **401 Unauthorized**: 인증 실패
- **403 Forbidden**: 권한 부족
- **404 Not Found**: 게시물 또는 엔드포인트 없음
- **500 Internal Server Error**: 서버 오류

#### 재시도 로직
```typescript
const retryableErrors = [408, 429, 500, 502, 503, 504];
const maxRetries = 3;
const baseDelay = 1000; // 1초
```

---

## 3. 콘텐츠 처리 시스템

### 3.1 마크다운 처리 파이프라인

#### 파싱 단계
```
마크다운 입력
    ↓
Front Matter 추출
    ↓
메타데이터 파싱
    ↓
마크다운 본문 파싱
    ↓
HTML 변환
    ↓
플랫폼별 최적화
    ↓
최종 콘텐츠 출력
```

#### 지원 Front Matter 형식
```yaml
---
title: "게시물 제목"
date: "2025-08-30"
tags: ["기술", "블로그", "개발"]
categories: ["프로그래밍"]
excerpt: "게시물 요약"
featured_image: "https://example.com/image.jpg"
status: "publish"
---
```

### 3.2 콘텐츠 변환 시스템

#### 마크다운 to HTML 변환
- **파서**: marked.js 사용
- **확장**: GitHub Flavored Markdown 지원
- **코드 블록**: 구문 강조 지원
- **표**: 테이블 렌더링 최적화

#### 플랫폼별 최적화
```typescript
interface PlatformOptimizer {
  optimizeForWordPress(content: string): string;
  optimizeForTistory(content: string): string;
  optimizeForNaver(content: string): string;
}
```

---

## 4. 데이터 흐름 및 처리

### 4.1 게시물 업로드 흐름
```
마크다운 파일 입력
    ↓
Front Matter 파싱
    ↓
콘텐츠 변환 (MD → HTML)
    ↓
플랫폼 클라이언트 선택
    ↓
인증 및 권한 확인
    ↓
API 요청 전송
    ↓
응답 검증 및 처리
    ↓
결과 반환 및 로깅
```

### 4.2 배치 처리 흐름
```
여러 게시물 입력
    ↓
병렬 처리를 위한 작업 분할
    ↓
각 게시물에 대해 개별 처리
    ↓
결과 수집 및 집계
    ↓
실패한 작업 재시도
    ↓
최종 결과 보고서 생성
```

### 4.3 동기화 흐름
```
소스 플랫폼에서 콘텐츠 가져오기
    ↓
로컬 콘텐츠와 비교
    ↓
변경 사항 감지
    ↓
대상 플랫폼별 변환
    ↓
업데이트 또는 생성 작업
    ↓
동기화 결과 로깅
```

---

## 5. 인증 및 보안

### 5.1 WordPress 인증

#### 애플리케이션 패스워드
- **권장 방식**: WordPress 애플리케이션 패스워드 사용
- **보안 장점**: 메인 계정 패스워드와 분리
- **권한 제어**: 특정 작업에만 권한 부여
- **폐기 가능**: 필요 시 개별 패스워드 폐기

#### Basic 인증 구현
```typescript
const createAuthHeader = (username: string, password: string): string => {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
};
```

### 5.2 데이터 보안
- **전송 암호화**: HTTPS 전용 통신
- **자격 증명 관리**: 환경 변수 저장
- **로깅 보안**: 패스워드 및 토큰 로그 제외
- **메모리 보안**: 민감한 데이터 즉시 해제

### 5.3 입력 검증
```typescript
interface ValidationRules {
  title: {
    required: true;
    maxLength: 200;
    sanitize: true;
  };
  content: {
    required: true;
    maxLength: 1000000; // 1MB
    allowedTags: string[];
  };
  status: {
    enum: ['draft', 'publish', 'private', 'pending'];
  };
}
```

---

## 6. 성능 및 확장성

### 6.1 HTTP 클라이언트 최적화

#### 연결 관리
```typescript
const axiosConfig = {
  timeout: 30000,           // 30초 타임아웃
  maxRedirects: 5,         // 최대 리다이렉션
  keepAlive: true,         // 연결 유지
  maxSockets: 10,          // 동시 연결 제한
};
```

#### 요청 최적화
- **연결 풀링**: HTTP 연결 재사용
- **압축**: gzip 응답 압축 지원
- **캐싱**: 반복 요청 결과 캐싱
- **배칭**: 가능한 경우 요청 결합

### 6.2 메모리 관리
- **스트리밍**: 대용량 콘텐츠 스트림 처리
- **청킹**: 큰 배치를 작은 단위로 분할
- **가비지 컬렉션**: 처리 후 메모리 해제
- **메모리 제한**: 최대 메모리 사용량 제한

### 6.3 동시 처리
```typescript
interface ConcurrencyConfig {
  maxConcurrentRequests: number;    // 최대 동시 요청 (기본값: 5)
  requestDelay: number;            // 요청 간 지연 (기본값: 100ms)
  batchSize: number;               // 배치 크기 (기본값: 10)
}
```

---

## 7. 품질 보증

### 7.1 테스트 전략
- **단위 테스트**: 모든 함수 및 클래스
- **통합 테스트**: WordPress API 연동
- **E2E 테스트**: 전체 워크플로우
- **성능 테스트**: 부하 및 스트레스 테스트

### 7.2 코드 품질
- **TypeScript**: 엄격한 타입 검사
- **ESLint**: 코드 스타일 일관성
- **Prettier**: 자동 코드 형식화
- **Husky**: pre-commit 훅으로 품질 검사

### 7.3 보안 검사
- **의존성 감사**: npm audit 정기 실행
- **취약성 스캔**: Snyk 또는 유사 도구
- **코드 분석**: 정적 보안 분석
- **침투 테스트**: 인증 및 권한 테스트

---

## 8. 배포 및 운영

### 8.1 빌드 시스템
- **컴파일러**: SWC (고속 TypeScript 컴파일)
- **출력 형식**: CommonJS, ES Modules, TypeScript 선언 파일
- **번들 크기**: 최적화된 크기 (<200KB)
- **트리 셰이킹**: 미사용 코드 제거

### 8.2 패키지 배포
```bash
# 빌드 스크립트
npm run build          # 전체 빌드
npm run build:types    # TypeScript 선언 파일
npm run build:cjs      # CommonJS 빌드
npm run build:esm      # ES Modules 빌드
```

### 8.3 환경 지원
- **Node.js**: 16.0+ (LTS 버전 권장)
- **TypeScript**: 4.9.5+ 완전 지원
- **런타임**: 서버 환경 (브라우저는 CORS 제한으로 제한적)

---

## 9. 모니터링 및 로깅

### 9.1 로깅 시스템
```typescript
interface BlogLogEntry {
  timestamp: string;
  platform: string;
  operation: string;
  post_id?: number;
  success: boolean;
  duration_ms: number;
  error?: string;
}
```

### 9.2 성능 메트릭
- **응답 시간**: API 호출별 응답 시간 측정
- **성공률**: 플랫폼별 성공/실패 비율
- **처리량**: 시간당 처리된 게시물 수
- **오류율**: 오류 타입별 발생 빈도

### 9.3 운영 메트릭
- **업로드 통계**: 일별/월별 게시물 업로드 수
- **플랫폼 사용률**: 각 플랫폼 사용 빈도
- **콘텐츠 크기**: 게시물 크기 분포
- **사용자 활동**: 활성 사용자 및 사용 패턴

---

## 10. 외부 의존성 및 통합

### 10.1 핵심 의존성

#### HTTP 및 네트워킹
```json
{
  "axios": "^1.7.9"
}
```

#### 콘텐츠 처리
```json
{
  "marked": "^15.0.7",
  "gray-matter": "^4.0.3"
}
```

#### WordPress SDK
```json
{
  "wpapi": "^1.2.2"
}
```

#### 환경 관리
```json
{
  "dotenv": "^16.4.7"
}
```

### 10.2 개발 의존성
```json
{
  "@swc/cli": "^0.5.1",
  "@swc/core": "^1.9.3",
  "@types/jest": "^29.5.11",
  "@types/node": "^22.9.4",
  "concurrently": "^9.1.0",
  "jest": "^29.7.0",
  "typescript": "^4.9.5"
}
```

---

## 11. API 명세 및 인터페이스

### 11.1 WordPress API 함수

#### 클라이언트 생성
```typescript
function createWPClient(config: WordPressConfig): AxiosInstance;
```

#### CRUD 작업
```typescript
function getPosts(client: AxiosInstance, params?: QueryParams): Promise<WordPressPost[]>;
function getPost(client: AxiosInstance, postId: number): Promise<WordPressPost>;
function createPost(client: AxiosInstance, post: WordPressPost): Promise<WordPressPost>;
function updatePost(client: AxiosInstance, postId: number, post: WordPressPost): Promise<WordPressPost>;
function deletePost(client: AxiosInstance, postId: number): Promise<WordPressPost>;
```

### 11.2 쿼리 매개변수
```typescript
interface QueryParams {
  page?: number;           // 페이지 번호
  per_page?: number;       // 페이지당 항목 수 (최대 100)
  search?: string;         // 검색 키워드
  author?: number;         // 작성자 ID
  categories?: number[];   // 카테고리 ID 배열
  tags?: number[];         // 태그 ID 배열
  status?: string[];       // 게시물 상태 배열
  order?: 'asc' | 'desc'; // 정렬 순서
  orderby?: string;        // 정렬 기준
}
```

---

## 12. 확장성 및 플러그인 아키텍처

### 12.1 플러그인 인터페이스
```typescript
interface BlogPlatformPlugin {
  name: string;
  version: string;
  
  // 필수 메서드
  authenticate(config: any): Promise<any>;
  createPost(post: BlogPost): Promise<BlogPost>;
  updatePost(id: string, post: BlogPost): Promise<BlogPost>;
  deletePost(id: string): Promise<void>;
  getPost(id: string): Promise<BlogPost>;
  getPosts(params?: QueryParams): Promise<BlogPost[]>;
  
  // 선택적 메서드
  uploadMedia?(file: Buffer, filename: string): Promise<MediaFile>;
  getCategories?(): Promise<Category[]>;
  getTags?(): Promise<Tag[]>;
}
```

### 12.2 미들웨어 시스템
```typescript
interface BlogMiddleware {
  beforeCreate?: (post: BlogPost) => BlogPost | Promise<BlogPost>;
  afterCreate?: (post: BlogPost, result: BlogPost) => void | Promise<void>;
  beforeUpdate?: (id: string, post: BlogPost) => BlogPost | Promise<BlogPost>;
  afterUpdate?: (id: string, result: BlogPost) => void | Promise<void>;
  onError?: (error: Error, context: OperationContext) => void | Promise<void>;
}
```

### 12.3 플랫폼 추가 가이드
1. **인터페이스 구현**: `BlogPlatformPlugin` 인터페이스 구현
2. **인증 로직**: 플랫폼별 인증 메커니즘 구현
3. **타입 정의**: 플랫폼별 데이터 타입 정의
4. **오류 처리**: 플랫폼별 오류 코드 매핑
5. **테스트**: 단위 및 통합 테스트 작성

---

*문서 버전: 1.0*  
*최종 업데이트: 2025-08-30*  
*다음 검토: 2025-09-30*