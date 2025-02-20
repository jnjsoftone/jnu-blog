// Import AREA
import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Types AREA
interface WordPressPost {
  id?: number;
  title: {
    rendered?: string;
    raw?: string;
  };
  content: {
    rendered?: string;
    raw?: string;
  };
  status?: string;
  date?: string;
  modified?: string;
}

interface WordPressConfig {
  baseURL: string;
  username: string;
  password: string;
}

// Functions AREA
const createWPClient = (config: WordPressConfig): AxiosInstance => {
  const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
  return axios.create({
    baseURL: config.baseURL,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * WordPress 게시물 목록을 가져옵니다.
 * @param client - WordPress API 클라이언트
 * @param params - 검색 파라미터 (페이지, 검색어 등)
 * @returns 게시물 목록
 */
const getPosts = async (client: AxiosInstance, params?: any): Promise<WordPressPost[]> => {
  try {
    const response = await client.get('/wp/v2/posts', { params });
    return response.data;
  } catch (error) {
    console.error('게시물 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * WordPress 게시물을 가져옵니다.
 * @param client - WordPress API 클라이언트
 * @param postId - 게시물 ID
 * @returns 게시물 정보
 */
const getPost = async (client: AxiosInstance, postId: number): Promise<WordPressPost> => {
  try {
    const response = await client.get(`/wp/v2/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('게시물 조회 실패:', error);
    throw error;
  }
};

/**
 * WordPress 게시물을 생성합니다.
 * @param client - WordPress API 클라이언트
 * @param post - 게시물 데이터
 * @returns 생성된 게시물 정보
 */
const createPost = async (client: AxiosInstance, post: WordPressPost): Promise<WordPressPost> => {
  try {
    const response = await client.post('/wp/v2/posts', post);
    return response.data;
  } catch (error) {
    console.error('게시물 생성 실패:', error);
    throw error;
  }
};

/**
 * WordPress 게시물을 수정합니다.
 * @param client - WordPress API 클라이언트
 * @param postId - 게시물 ID
 * @param post - 수정할 게시물 데이터
 * @returns 수정된 게시물 정보
 */
const updatePost = async (client: AxiosInstance, postId: number, post: WordPressPost): Promise<WordPressPost> => {
  try {
    const response = await client.put(`/wp/v2/posts/${postId}`, post);
    return response.data;
  } catch (error) {
    console.error('게시물 수정 실패:', error);
    throw error;
  }
};

/**
 * WordPress 게시물을 삭제합니다.
 * @param client - WordPress API 클라이언트
 * @param postId - 게시물 ID
 * @returns 삭제된 게시물 정보
 */
const deletePost = async (client: AxiosInstance, postId: number): Promise<WordPressPost> => {
  try {
    const response = await client.delete(`/wp/v2/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('게시물 삭제 실패:', error);
    throw error;
  }
};

// Export AREA
export {
  WordPressPost,
  WordPressConfig,
  createWPClient,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
