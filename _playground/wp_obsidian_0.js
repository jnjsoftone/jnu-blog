// npm i wpapi gray-matter marked

import dotenv from 'dotenv';
import axios from 'axios';
import { loadFile } from 'jnu-abc';

dotenv.config({ path: './.env' });

const { WP_BASE_URL, WP_ATTACHMENT_PATH, WP_USERNAME, WP_PASSWORD } = process.env;

import fs from 'fs';
import path from 'path';
import WPAPI from 'wpapi';
import matter from 'gray-matter';
import * as marked from 'marked';

// WordPress API 설정
const wp = new WPAPI({
  endpoint: `${WP_BASE_URL}/wp-json`,
  username: WP_USERNAME,
  password: WP_PASSWORD,
});

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
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error);
    return null;
  }
}

// 마크다운 내용에서 이미지 경로 추출 및 업로드 후 URL 교체
async function processMarkdownImages(mdContent, basePath) {
  // 마크다운 이미지 구문 정규식: ![대체텍스트](이미지경로)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  let processedContent = mdContent;
  const uploadedImages = {};

  while ((match = imageRegex.exec(mdContent)) !== null) {
    const altText = match[1];
    const imagePath = match[2];

    // 이미 처리한 이미지는 건너뛰기
    if (uploadedImages[imagePath]) {
      continue;
    }

    // 상대 경로인 경우 절대 경로로 변환
    let fullImagePath = imagePath;
    if (!path.isAbsolute(imagePath) && !imagePath.startsWith('http')) {
      fullImagePath = path.resolve(basePath, imagePath);
    }

    // 외부 URL인 경우 건너뛰기
    if (imagePath.startsWith('http')) {
      console.log(`외부 이미지 URL은 처리하지 않습니다: ${imagePath}`);
      continue;
    }

    // 이미지 업로드
    const uploadedImage = await uploadImageToWordPress(fullImagePath);

    if (uploadedImage) {
      // 마크다운 내용에서 이미지 경로를 업로드된 URL로 교체
      const originalImageMarkdown = match[0];
      const newImageMarkdown = `![${altText}](${uploadedImage.source_url})`;
      processedContent = processedContent.replace(originalImageMarkdown, newImageMarkdown);

      // 처리한 이미지 기록
      uploadedImages[imagePath] = uploadedImage.source_url;
    }
  }

  return processedContent;
}

// 카테고리 이름으로 ID 조회 함수
async function getCategoryIdByName(categoryName) {
  try {
    const categories = await wp.categories().search(categoryName);

    // 정확히 일치하는 카테고리 찾기
    const exactMatch = categories.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase());

    if (exactMatch) {
      return exactMatch.id;
    }

    // 정확히 일치하는 것이 없으면 첫 번째 결과 반환
    if (categories.length > 0) {
      console.log(
        `정확히 일치하는 카테고리가 없습니다. 가장 유사한 '${categories[0].name}'(ID: ${categories[0].id})를 사용합니다.`
      );
      return categories[0].id;
    }

    // 카테고리가 없으면 새로 생성
    console.log(`카테고리 '${categoryName}'을(를) 찾을 수 없어 새로 생성합니다.`);
    const newCategory = await wp.categories().create({
      name: categoryName,
    });
    console.log(`카테고리 '${categoryName}'이(가) 생성되었습니다. ID: ${newCategory.id}`);
    return newCategory.id;
  } catch (error) {
    console.error(`카테고리 '${categoryName}' 조회/생성 중 오류 발생:`, error);
    return null;
  }
}

// 태그 이름으로 ID 조회 함수
async function getTagIdByName(tagName) {
  try {
    const tags = await wp.tags().search(tagName);

    // 정확히 일치하는 태그 찾기
    const exactMatch = tags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase());

    if (exactMatch) {
      return exactMatch.id;
    }

    // 정확히 일치하는 것이 없으면 첫 번째 결과 반환
    if (tags.length > 0) {
      console.log(`정확히 일치하는 태그가 없습니다. 가장 유사한 '${tags[0].name}'(ID: ${tags[0].id})를 사용합니다.`);
      return tags[0].id;
    }

    // 태그가 없으면 새로 생성
    console.log(`태그 '${tagName}'을(를) 찾을 수 없어 새로 생성합니다.`);
    const newTag = await wp.tags().create({
      name: tagName,
    });
    console.log(`태그 '${tagName}'이(가) 생성되었습니다. ID: ${newTag.id}`);
    return newTag.id;
  } catch (error) {
    console.error(`태그 '${tagName}' 조회/생성 중 오류 발생:`, error);
    return null;
  }
}

// 카테고리/태그 이름 배열을 ID 배열로 변환하는 함수
async function convertCategoriesToIds(categoryNames) {
  if (!categoryNames || !Array.isArray(categoryNames)) return [];

  const categoryIds = [];
  for (const name of categoryNames) {
    // 이미 ID인 경우 그대로 사용
    if (typeof name === 'number') {
      categoryIds.push(name);
      continue;
    }

    // 숫자 문자열인 경우 변환
    const numId = parseInt(name);
    if (!isNaN(numId)) {
      categoryIds.push(numId);
      continue;
    }

    // 이름으로 ID 조회
    const id = await getCategoryIdByName(name);
    if (id) categoryIds.push(id);
  }

  return categoryIds;
}

async function convertTagsToIds(tagNames) {
  if (!tagNames || !Array.isArray(tagNames)) return [];

  const tagIds = [];
  for (const name of tagNames) {
    // 이미 ID인 경우 그대로 사용
    if (typeof name === 'number') {
      tagIds.push(name);
      continue;
    }

    // 숫자 문자열인 경우 변환
    const numId = parseInt(name);
    if (!isNaN(numId)) {
      tagIds.push(numId);
      continue;
    }

    // 이름으로 ID 조회
    const id = await getTagIdByName(name);
    if (id) tagIds.push(id);
  }

  return tagIds;
}

async function convertAndPost(mdFilePath) {
  try {
    // 마크다운 파일 읽기
    const fileContent = loadFile(mdFilePath);

    // 마크다운 파일의 디렉토리 경로 (상대 경로 이미지 처리용)
    const mdFileDir = path.dirname(mdFilePath);

    // front matter 파싱
    const { data, content } = matter(fileContent);

    // 이미지 처리 및 업로드
    const processedContent = await processMarkdownImages(content, mdFileDir);

    // 마크다운을 HTML로 변환
    const htmlContent = marked.parse(processedContent);

    // WordPress에 포스트 생성할 데이터 준비
    const postData = {
      title: data.title || path.basename(mdFilePath, '.md'),
      content: htmlContent,
      status: data.status || 'draft',
    };

    // 카테고리와 태그 이름을 ID로 변환
    if (data.categories) {
      postData.categories = await convertCategoriesToIds(data.categories);
    }

    if (data.tags) {
      postData.tags = await convertTagsToIds(data.tags);
    }

    // 대표 이미지(featured image) 설정
    if (data.featured_image) {
      let featuredImagePath = data.featured_image;

      // 상대 경로인 경우 절대 경로로 변환
      if (!path.isAbsolute(featuredImagePath) && !featuredImagePath.startsWith('http')) {
        featuredImagePath = path.resolve(mdFileDir, featuredImagePath);
      }

      // 외부 URL이 아닌 경우에만 업로드
      if (!featuredImagePath.startsWith('http')) {
        const uploadedImage = await uploadImageToWordPress(featuredImagePath);
        if (uploadedImage) {
          postData.featured_media = uploadedImage.id;
        }
      }
    }

    // WordPress에 포스트 생성
    const post = await wp.posts().create(postData);

    console.log(`포스트가 성공적으로 생성되었습니다. ID: ${post.id}`);
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

const mdFilePath = 'G:/내 드라이브/Obsidian/JnJsoft/31. PROJECT/Blog/w01/from obsidian 2.md';
// const content = loadFile(mdFilePath);
// console.log(content);

await convertAndPost(mdFilePath);
