import { createClient, getPosts } from '../esm/wp.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: './.env' });

const { WP_ENDPOINT, WP_USERNAME, WP_PASSWORD } = process.env;

const main = async () => {
  try {
    // 직접 API 호출로 테스트
    console.log('게시물 목록을 조회합니다...');
    const response = await axios.get(`${WP_ENDPOINT}/posts`, {
      auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD,
      },
      params: {
        per_page: 5,
        status: 'publish',
      },
    });

    const posts = response.data;

    // 결과 출력
    console.log('\n=== 게시물 목록 ===');
    posts.forEach((post) => {
      console.log(`\n제목: ${post.title.rendered}`);
      console.log(`ID: ${post.id}`);
      console.log(`상태: ${post.status}`);
      console.log(`작성일: ${post.date}`);
      console.log('------------------------');
    });
  } catch (error) {
    console.error('오류 발생:', error.response?.data || error);
  }
};

main();
