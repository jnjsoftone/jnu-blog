# 사용자 가이드
## JNU-Blog: 블로그 플랫폼 통합 라이브러리

### 📋 목차
1. [시작하기](#시작하기)
2. [설치 및 설정](#설치-및-설정)
3. [WordPress 통합](#wordpress-통합)
4. [게시물 관리](#게시물-관리)
5. [마크다운 지원](#마크다운-지원)
6. [배치 작업](#배치-작업)
7. [고급 사용법](#고급-사용법)
8. [모범 사례](#모범-사례)
9. [문제해결](#문제해결)

---

## 🚀 시작하기

JNU-Blog는 다양한 블로그 플랫폼을 위한 통합 TypeScript 인터페이스를 제공합니다:
- **WordPress**: REST API를 통한 완전한 블로그 관리
- **Tistory**: API 연동 (계획됨)
- **Naver Blog**: API 통합 (계획됨)
- **Medium**: Publication API (계획됨)

### 빠른 시작
```typescript
import { createWPClient, createPost } from 'jnu-blog';

// WordPress 클라이언트 생성
const wpClient = createWPClient({
  baseURL: 'https://your-site.com/wp-json',
  username: 'your-username',
  password: 'your-app-password'
});

// 새 게시물 생성
const newPost = await createPost(wpClient, {
  title: { raw: '내 첫 번째 게시물' },
  content: { raw: '<p>안녕하세요, 이것은 테스트 게시물입니다.</p>' },
  status: 'publish'
});
```

---

## 📦 설치 및 설정

### 설치
```bash
npm install jnu-blog
```

### 환경 구성
WordPress 자격 증명으로 `.env` 파일을 생성하세요:

```bash
# WordPress 설정
WP_BASE_URL=https://your-site.com/wp-json
WP_USERNAME=your-username
WP_PASSWORD=your-application-password

# Tistory 설정 (향후 지원)
TISTORY_CLIENT_ID=your-client-id
TISTORY_CLIENT_SECRET=your-client-secret
TISTORY_ACCESS_TOKEN=your-access-token

# Naver Blog 설정 (향후 지원)
NAVER_CLIENT_ID=your-client-id
NAVER_CLIENT_SECRET=your-client-secret
```

### TypeScript 설정
```typescript
// types.d.ts
declare module 'jnu-blog' {
  // 더 나은 IDE 지원을 위한 타입 임포트
}
```

---

## 📝 WordPress 통합

### WordPress 클라이언트 설정
```typescript
import { createWPClient, WordPressConfig } from 'jnu-blog';

const wpConfig: WordPressConfig = {
  baseURL: process.env.WP_BASE_URL!,
  username: process.env.WP_USERNAME!,
  password: process.env.WP_PASSWORD!
};

const wpClient = createWPClient(wpConfig);
```

### WordPress 애플리케이션 패스워드 생성
1. WordPress 관리자 → 사용자 → 프로필
2. '애플리케이션 패스워드' 섹션에서 새 패스워드 생성
3. 생성된 패스워드를 환경 변수에 저장

---

## 📄 게시물 관리

### 게시물 조회

#### 모든 게시물 목록
```typescript
import { getPosts } from 'jnu-blog';

// 모든 게시물 가져오기
const allPosts = await getPosts(wpClient);

// 검색 조건으로 게시물 가져오기
const recentPosts = await getPosts(wpClient, {
  per_page: 10,
  order: 'desc',
  orderby: 'date',
  status: ['publish']
});

// 특정 카테고리 게시물
const techPosts = await getPosts(wpClient, {
  categories: [1, 2],  // 카테고리 ID
  per_page: 5
});
```

#### 특정 게시물 조회
```typescript
import { getPost } from 'jnu-blog';

// 게시물 ID로 조회
const post = await getPost(wpClient, 123);
console.log(`제목: ${post.title.rendered}`);
console.log(`내용: ${post.content.rendered}`);
```

### 게시물 생성

#### 기본 게시물 생성
```typescript
import { createPost, WordPressPost } from 'jnu-blog';

const newPost: WordPressPost = {
  title: {
    raw: 'TypeScript로 블로그 API 사용하기'
  },
  content: {
    raw: `
      <h2>TypeScript의 장점</h2>
      <p>TypeScript는 다음과 같은 장점이 있습니다:</p>
      <ul>
        <li>타입 안전성</li>
        <li>더 나은 IDE 지원</li>
        <li>리팩토링 용이성</li>
      </ul>
    `
  },
  status: 'publish'
};

const createdPost = await createPost(wpClient, newPost);
console.log(`게시물 생성됨: ID ${createdPost.id}`);
```

#### 메타데이터와 함께 게시물 생성
```typescript
const advancedPost: WordPressPost = {
  title: { raw: '고급 WordPress 활용법' },
  content: { raw: '이것은 고급 사용법에 대한 게시물입니다.' },
  status: 'draft',  // 초안으로 저장
  date: '2025-09-01T10:00:00',  // 예약 게시
  // 추가 메타데이터는 WordPress API 확장을 통해 지원
};
```

### 게시물 수정
```typescript
import { updatePost } from 'jnu-blog';

// 게시물 제목 수정
await updatePost(wpClient, 123, {
  title: { raw: '수정된 제목' }
});

// 게시물 상태 변경 (초안 → 게시)
await updatePost(wpClient, 123, {
  status: 'publish'
});

// 내용 수정
await updatePost(wpClient, 123, {
  content: { raw: '<p>새로운 내용입니다.</p>' }
});
```

### 게시물 삭제
```typescript
import { deletePost } from 'jnu-blog';

// 게시물 삭제 (휴지통으로 이동)
const deletedPost = await deletePost(wpClient, 123);
console.log(`게시물 삭제됨: ${deletedPost.title.rendered}`);
```

---

## 📝 마크다운 지원

### Front Matter를 포함한 마크다운
```typescript
// markdown-post.md 파일 예제
const markdownContent = `---
title: "마크다운으로 블로그 작성하기"
date: "2025-08-30"
tags: ["마크다운", "블로그", "자동화"]
categories: ["기술"]
status: "publish"
---

# 마크다운의 장점

마크다운은 다음과 같은 장점이 있습니다:

## 1. 간단한 문법
- **굵게** 및 *기울임* 텍스트
- 목록 및 링크
- 코드 블록

\`\`\`typescript
const hello = "World";
console.log(\`Hello, \${hello}!\`);
\`\`\`

## 2. 플랫폼 독립성
마크다운은 어떤 플랫폼에서도 동일하게 작동합니다.
`;
```

### 마크다운 처리 (향후 구현)
```typescript
import { parseMarkdown, convertToWordPress } from 'jnu-blog';

// 마크다운 파싱
const { frontMatter, content } = parseMarkdown(markdownContent);

// WordPress 형식으로 변환
const wpPost = convertToWordPress(frontMatter, content);

// 게시물 생성
const publishedPost = await createPost(wpClient, wpPost);
```

---

## 🔄 배치 작업

### 여러 게시물 동시 처리
```typescript
class BlogBatchProcessor {
  constructor(private client: AxiosInstance) {}

  async createMultiplePosts(posts: WordPressPost[]): Promise<WordPressPost[]> {
    const results = await Promise.allSettled(
      posts.map(post => createPost(this.client, post))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<WordPressPost>).value);
  }

  async updateMultiplePosts(updates: Array<{id: number, data: WordPressPost}>): Promise<WordPressPost[]> {
    const results = await Promise.allSettled(
      updates.map(update => updatePost(this.client, update.id, update.data))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<WordPressPost>).value);
  }
}

// 사용법
const batchProcessor = new BlogBatchProcessor(wpClient);
const posts = [
  { title: { raw: '게시물 1' }, content: { raw: '내용 1' }, status: 'publish' },
  { title: { raw: '게시물 2' }, content: { raw: '내용 2' }, status: 'draft' }
];

const createdPosts = await batchProcessor.createMultiplePosts(posts);
```

### 예약 게시 시스템 (향후 구현)
```typescript
class ScheduledPublisher {
  async schedulePost(post: WordPressPost, publishDate: Date) {
    const scheduledPost = {
      ...post,
      status: 'draft',
      date: publishDate.toISOString()
    };

    return await createPost(wpClient, scheduledPost);
  }

  async publishScheduledPosts() {
    const now = new Date();
    const scheduledPosts = await getPosts(wpClient, {
      status: ['draft'],
      // 예약된 게시물 필터링 로직
    });

    for (const post of scheduledPosts) {
      if (new Date(post.date!) <= now) {
        await updatePost(wpClient, post.id!, { status: 'publish' });
      }
    }
  }
}
```

---

## 🛠️ 고급 사용법

### 콘텐츠 관리 시스템
```typescript
class BlogCMS {
  constructor(private wpClient: AxiosInstance) {}

  async publishFromMarkdown(markdownFile: string) {
    // 마크다운 파일 읽기 (향후 구현)
    // const { frontMatter, content } = await this.parseMarkdownFile(markdownFile);
    
    // WordPress 게시물로 변환
    const post: WordPressPost = {
      title: { raw: "마크다운에서 변환된 게시물" },
      content: { raw: "변환된 HTML 내용" },
      status: 'publish'
    };

    return await createPost(this.wpClient, post);
  }

  async backupAllPosts(): Promise<WordPressPost[]> {
    let allPosts: WordPressPost[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const posts = await getPosts(this.wpClient, {
        page,
        per_page: perPage,
        status: ['publish', 'draft', 'private']
      });

      if (posts.length === 0) break;

      allPosts = allPosts.concat(posts);
      page++;
    }

    return allPosts;
  }

  async migrateToNewSite(targetClient: AxiosInstance) {
    const allPosts = await this.backupAllPosts();
    
    for (const post of allPosts) {
      const { id, date, modified, ...postData } = post;
      await createPost(targetClient, postData);
    }
  }
}
```

### 멀티 사이트 관리
```typescript
class MultiSiteBlogManager {
  private sites: Map<string, AxiosInstance> = new Map();

  addSite(name: string, config: WordPressConfig) {
    this.sites.set(name, createWPClient(config));
  }

  async publishToAllSites(post: WordPressPost) {
    const results = new Map<string, WordPressPost | Error>();

    for (const [siteName, client] of this.sites) {
      try {
        const result = await createPost(client, post);
        results.set(siteName, result);
        console.log(`✅ ${siteName}에 게시 성공`);
      } catch (error) {
        results.set(siteName, error as Error);
        console.error(`❌ ${siteName} 게시 실패:`, error);
      }
    }

    return results;
  }

  async syncPostAcrossSites(sourcePost: WordPressPost) {
    return await this.publishToAllSites(sourcePost);
  }
}

// 사용법
const multiSite = new MultiSiteBlogManager();
multiSite.addSite('main', mainSiteConfig);
multiSite.addSite('backup', backupSiteConfig);

await multiSite.publishToAllSites({
  title: { raw: '멀티 사이트 게시물' },
  content: { raw: '<p>모든 사이트에 동시 게시됩니다.</p>' },
  status: 'publish'
});
```

---

## 📊 콘텐츠 분석 및 관리

### 게시물 통계
```typescript
class BlogAnalyzer {
  constructor(private client: AxiosInstance) {}

  async getPostStats() {
    const allPosts = await getPosts(this.client, {
      per_page: 100,
      status: ['publish', 'draft']
    });

    const stats = {
      total: allPosts.length,
      published: allPosts.filter(p => p.status === 'publish').length,
      drafts: allPosts.filter(p => p.status === 'draft').length,
      avgContentLength: 0,
      recentActivity: this.getRecentActivity(allPosts)
    };

    const totalContentLength = allPosts.reduce(
      (sum, post) => sum + (post.content.rendered?.length || 0), 
      0
    );
    stats.avgContentLength = Math.round(totalContentLength / allPosts.length);

    return stats;
  }

  private getRecentActivity(posts: WordPressPost[]) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return posts.filter(post => 
      new Date(post.date!) > thirtyDaysAgo
    ).length;
  }
}
```

### 콘텐츠 검색 및 필터링
```typescript
class ContentSearcher {
  constructor(private client: AxiosInstance) {}

  async searchPosts(keyword: string) {
    return await getPosts(this.client, {
      search: keyword,
      per_page: 20,
      status: ['publish']
    });
  }

  async getPostsByCategory(categoryId: number) {
    return await getPosts(this.client, {
      categories: [categoryId],
      order: 'desc',
      orderby: 'date'
    });
  }

  async getPostsByAuthor(authorId: number) {
    return await getPosts(this.client, {
      author: authorId,
      status: ['publish'],
      order: 'desc'
    });
  }

  async getDraftPosts() {
    return await getPosts(this.client, {
      status: ['draft'],
      order: 'desc',
      orderby: 'modified'
    });
  }
}
```

---

## ✅ 모범 사례

### 오류 처리
```typescript
async function robustBlogOperation() {
  try {
    const post = await createPost(wpClient, {
      title: { raw: '테스트 게시물' },
      content: { raw: '<p>테스트 내용</p>' },
      status: 'publish'
    });
    return post;
  } catch (error) {
    console.error('게시물 생성 실패:', error);
    
    // 자세한 오류 정보
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
    
    throw error;
  }
}
```

### 인증 검증
```typescript
async function validateWordPressAuth(client: AxiosInstance) {
  try {
    // 간단한 요청으로 인증 테스트
    await getPosts(client, { per_page: 1 });
    console.log('✅ WordPress 인증이 유효합니다');
    return true;
  } catch (error) {
    console.error('❌ WordPress 인증 실패:', error.message);
    return false;
  }
}

// 사용법
const isValid = await validateWordPressAuth(wpClient);
if (!isValid) {
  console.log('인증 정보를 확인해주세요.');
}
```

### 콘텐츠 백업
```typescript
class BlogBackup {
  constructor(private client: AxiosInstance) {}

  async backupToPosts(): Promise<void> {
    const posts = await this.getAllPosts();
    const backup = {
      timestamp: new Date().toISOString(),
      site: 'my-wordpress-site',
      posts: posts
    };

    // JSON 파일로 저장
    const fs = await import('fs/promises');
    await fs.writeFile(
      `backup-${Date.now()}.json`,
      JSON.stringify(backup, null, 2)
    );

    console.log(`${posts.length}개 게시물이 백업되었습니다.`);
  }

  private async getAllPosts(): Promise<WordPressPost[]> {
    let allPosts: WordPressPost[] = [];
    let page = 1;

    while (true) {
      const posts = await getPosts(this.client, {
        page,
        per_page: 100,
        status: ['publish', 'draft', 'private', 'pending']
      });

      if (posts.length === 0) break;
      allPosts = allPosts.concat(posts);
      page++;
    }

    return allPosts;
  }
}
```

### 성능 최적화
```typescript
class OptimizedBlogClient {
  private requestQueue: Promise<any>[] = [];
  private maxConcurrent = 5;

  constructor(private client: AxiosInstance) {}

  async queuedRequest<T>(operation: () => Promise<T>): Promise<T> {
    // 동시 요청 수 제한
    while (this.requestQueue.length >= this.maxConcurrent) {
      await Promise.race(this.requestQueue);
      this.requestQueue = this.requestQueue.filter(p => p);
    }

    const promise = operation();
    this.requestQueue.push(promise);

    try {
      return await promise;
    } finally {
      const index = this.requestQueue.indexOf(promise);
      if (index > -1) {
        this.requestQueue.splice(index, 1);
      }
    }
  }

  async createPostsWithLimit(posts: WordPressPost[]) {
    return Promise.all(
      posts.map(post => 
        this.queuedRequest(() => createPost(this.client, post))
      )
    );
  }
}
```

---

## 🔧 문제해결

### 일반적인 문제

#### 인증 오류
```typescript
// 애플리케이션 패스워드 확인
async function troubleshootAuth() {
  console.log('인증 문제 해결 단계:');
  
  console.log('1. 애플리케이션 패스워드 확인');
  console.log('   - WordPress 관리자 → 사용자 → 프로필');
  console.log('   - 애플리케이션 패스워드 섹션 확인');
  
  console.log('2. 사용자 권한 확인');
  console.log('   - 게시물 작성/수정 권한 필요');
  console.log('   - 편집자 또는 관리자 역할 필요');
  
  console.log('3. REST API 활성화 확인');
  console.log('   - WordPress 5.0+ 필요');
  console.log('   - Permalink 설정 확인');
}
```

#### 네트워크 오류 처리
```typescript
async function retryableRequest<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 지수 백오프
        console.log(`재시도 ${i + 1}/${maxRetries}: ${delay}ms 후 재시도`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// 사용법
const post = await retryableRequest(() => 
  createPost(wpClient, {
    title: { raw: '재시도 테스트' },
    content: { raw: '<p>네트워크 오류 복구 테스트</p>' },
    status: 'publish'
  })
);
```

#### 콘텐츠 형식 문제
```typescript
// HTML 콘텐츠 정리
function sanitizeContent(content: string): string {
  // 기본적인 HTML 정리
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // 스크립트 제거
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // 아이프레임 제거
    .trim();
}

// 제목 정리
function sanitizeTitle(title: string): string {
  return title
    .replace(/[<>]/g, '') // HTML 태그 제거
    .trim()
    .substring(0, 200); // 길이 제한
}

// 안전한 게시물 생성
async function createSafePost(rawPost: WordPressPost) {
  const safePost: WordPressPost = {
    title: { raw: sanitizeTitle(rawPost.title.raw || '') },
    content: { raw: sanitizeContent(rawPost.content.raw || '') },
    status: rawPost.status || 'draft'
  };

  return await createPost(wpClient, safePost);
}
```

### 디버그 모드
```typescript
// 디버그 로깅 활성화
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(operation: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG:WordPress] ${operation}`, data || '');
  }
}

// WordPress 작업에서 사용법
async function debuggedCreatePost(post: WordPressPost) {
  debugLog('게시물 생성 시작', { title: post.title.raw });
  
  try {
    const result = await createPost(wpClient, post);
    debugLog('게시물 생성 성공', { 
      id: result.id, 
      status: result.status 
    });
    return result;
  } catch (error) {
    debugLog('게시물 생성 실패', { error: error.message });
    throw error;
  }
}
```

---

*최종 업데이트: 2025-08-30*  
*버전: 1.0*