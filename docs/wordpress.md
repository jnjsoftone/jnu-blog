[Post Status](https://wordpress.org/documentation/article/post-status/)


Publish
Viewable by everyone. (publish)

Future
Scheduled to be published in a future date. (future)

Draft
Incomplete post viewable by anyone with proper user role. (draft)

Pending
Awaiting a user with the publish_posts capability (typically a user assigned the Editor role) to publish. (pending)

Private
Viewable only to WordPress users at Administrator level. (private)

Trash
Posts in the Trash are assigned the trash status. (trash)

Auto-Draft
Revisions that WordPress saves automatically while you are editing. (auto-draft)

Inherit


===



# WordPress 이미지 업로드 오류 해결 방법

WordPress에서 이미지 업로드 시 디렉토리 생성 권한 문제가 발생했습니다. 이 오류는 WordPress 서버의 `wp-content/uploads` 디렉토리에 쓰기 권한이 없어서 발생합니다.

## 해결 방법

다음과 같은 방법으로 문제를 해결할 수 있습니다:

```javascript:_playground/wp_obsidian.js
// 이미지 파일을 WordPress에 업로드하는 함수
async function uploadImageToWordPress(imagePath) {
  try {
    // 파일이 존재하는지 확인
    if (!fs.existsSync(imagePath)) {
      console.error(`이미지 파일이 존재하지 않습니다: ${imagePath}`);
      return null;
    }

    // 파일 정보 가져오기
    const fileStats = fs.statSync(imagePath);
    const fileName = path.basename(imagePath);

    // 파일 확장자로 MIME 타입 결정
    const extension = path.extname(imagePath).toLowerCase();
    let mimeType = 'application/octet-stream'; // 기본값

    if (extension === '.jpg' || extension === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (extension === '.png') {
      mimeType = 'image/png';
    } else if (extension === '.gif') {
      mimeType = 'image/gif';
    } else if (extension === '.webp') {
      mimeType = 'image/webp';
    } else if (extension === '.svg') {
      mimeType = 'image/svg+xml';
    }

    // 파일 내용 읽기
    const fileContent = fs.readFileSync(imagePath);

    // WordPress에 업로드
    console.log(`이미지 '${fileName}' 업로드 중...`);

    try {
      const media = await wp
        .media()
        .file(fileContent, fileName)
        .create({
          title: fileName,
          alt_text: fileName,
          caption: '',
          description: `Uploaded from ${imagePath}`,
        });

      console.log(`이미지 '${fileName}' 업로드 완료. ID: ${media.id}, URL: ${media.source_url}`);
      return media;
    } catch (uploadError) {
      // 업로드 실패 시 대체 URL 반환
      console.error('이미지 업로드 실패:', uploadError.message);
      console.log('이미지 업로드를 건너뛰고 계속 진행합니다.');
      
      // 이미지 업로드 실패 시 대체 이미지 URL 반환 (선택 사항)
      return {
        id: null,
        source_url: 'https://via.placeholder.com/800x600?text=Image+Upload+Failed',
        alt_text: fileName
      };
    }
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error);
    return null;
  }
}
```

## 근본적인 해결 방법

1. **WordPress 서버 권한 설정**:
   - WordPress 서버에 접속하여 `wp-content/uploads` 디렉토리의 권한을 확인하세요.
   - 일반적으로 이 디렉토리는 웹 서버 사용자(예: www-data, apache, nginx)에게 쓰기 권한이 있어야 합니다.
   - 권한 설정: `chmod 777 -R wp-content/uploads`

2. **WordPress 관리자 페이지에서 설정**:
   - WordPress 관리자 페이지 → 설정 → 미디어에서 업로드 디렉토리 설정을 확인하세요.
   - 업로드 경로가 올바르게 설정되어 있는지 확인하세요.

3. **대체 방법: 외부 이미지 URL 사용**:
   - 이미지를 다른 호스팅 서비스(예: Imgur, Cloudinary)에 업로드한 후 URL을 사용하는 방법도 있습니다.

## 임시 해결책

위 코드는 이미지 업로드 실패 시 대체 이미지 URL을 반환하여 포스트 작성은 계속 진행할 수 있도록 합니다. 이렇게 하면 이미지 업로드 오류가 발생해도 포스트 작성 과정은 중단되지 않습니다.

WordPress 서버의 권한 문제를 해결하는 것이 가장 좋은 방법이지만, 서버에 직접 접근할 수 없는 경우 이 임시 해결책을 사용할 수 있습니다.


===

# 페이지



워드프레스 pages에 글을 올리거나 수정하는 방법을 알려드리겠습니다:

1. **관리자 대시보드를 통한 방법**:
- 워드프레스 관리자 로그인
- 왼쪽 메뉴에서 "페이지(Pages)" 선택
- "새로 추가" 버튼 클릭 (새 페이지)
- 또는 기존 페이지 선택 (수정)

2. **REST API를 통한 방법**:
```javascript
// 새 페이지 생성
fetch('https://your-site.com/wp-json/wp/v2/pages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
        title: '페이지 제목',
        content: '페이지 내용',
        status: 'publish'
    })
});

// 페이지 수정
fetch('https://your-site.com/wp-json/wp/v2/pages/페이지ID', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
        title: '수정된 제목',
        content: '수정된 내용'
    })
});
```

3. **인증 방법**:
```javascript
// JWT 인증 토큰 받기
fetch('https://your-site.com/wp-json/jwt-auth/v1/token', {
    method: 'POST',
    body: JSON.stringify({
        username: '사용자이름',
        password: '비밀번호'
    })
});
```

4. **주요 API 엔드포인트**:
- 페이지 목록: `GET /wp-json/wp/v2/pages`
- 특정 페이지: `GET /wp-json/wp/v2/pages/{id}`
- 페이지 생성: `POST /wp-json/wp/v2/pages`
- 페이지 수정: `PUT /wp-json/wp/v2/pages/{id}`
- 페이지 삭제: `DELETE /wp-json/wp/v2/pages/{id}`

5. **필요한 플러그인**:
- JWT Authentication
- WP REST API
- Application Passwords (WordPress 5.6 이상)

참고: REST API 사용을 위해서는 워드프레스 설정에서 API 접근을 허용해야 합니다.


---



네, 페이지 생성 시 slug를 지정할 수 있습니다. REST API를 사용할 때 `slug` 파라미터를 추가하면 됩니다:

```javascript
// 페이지 생성 시 slug 지정
fetch('https://your-site.com/wp-json/wp/v2/pages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
        title: '페이지 제목',
        content: '페이지 내용',
        status: 'publish',
        slug: 'custom-page-slug'  // 원하는 slug 지정
    })
});

// 페이지 수정 시에도 slug 변경 가능
fetch('https://your-site.com/wp-json/wp/v2/pages/페이지ID', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
        slug: 'new-page-slug'  // slug 변경
    })
});
```

**주의사항**:
1. slug는 영문 소문자, 숫자, 하이픈(-)만 사용 가능
2. 이미 존재하는 slug를 사용하면 자동으로 번호가 붙음
3. slug를 지정하지 않으면 제목을 기반으로 자동 생성됨
4. 한글 slug는 자동으로 영문으로 변환됨


====

# 예약 발행

// 예약 발행 포스팅
fetch('https://your-site.com/wp-json/wp/v2/pages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
        title: '페이지 제목',
        content: '페이지 내용',
        status: 'future',  // 예약 발행은 'future' 상태 사용
        date: '2024-04-01T10:00:00',  // ISO 8601 형식 (GMT/UTC)
        slug: 'custom-page-slug'
    })
});




한국 시간(KST, UTC+9) 2024년 4월 1일 오전 10시를 UTC로 변환하면 2024년 4월 1일 오전 1시가 됩니다.

따라서 ISO 8601 형식의 UTC 문자열은:

```javascript
'2024-04-01T01:00:00'
```

계산 방법:
- KST (UTC+9) 10:00
- UTC로 변환: 10:00 - 9:00 = 01:00

반대로, UTC 시간을 KST로 변환하려면:
- UTC 01:00
- KST로 변환: 01:00 + 9:00 = 10:00

참고: JavaScript에서 시간대 변환을 쉽게 하려면 `moment.js` 또는 `date-fns` 같은 라이브러리를 사용하는 것이 좋습니다.
