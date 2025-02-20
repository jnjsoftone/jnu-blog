// Import AREA
import WPAPI from 'wpapi';
import dotenv from 'dotenv';

dotenv.config();

// Types AREA
export interface WPConfig {
  endpoint: string;
  username: string;
  password: string;
}

export interface WPPost {
  id?: number;
  title: string;
  content: string;
  status?: 'publish' | 'draft' | 'private' | 'pending' | 'future';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  excerpt?: string;
  slug?: string;
}

export interface WPMedia {
  id?: number;
  title: string;
  caption?: string;
  alt_text?: string;
  description?: string;
  source_url?: string;
}

export interface WPCategory {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  parent?: number;
}

export interface WPTag {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
}

// Functions AREA
/**
 * WordPress API 클라이언트를 생성합니다.
 * @param config - WordPress 설정
 * @returns WordPress API 클라이언트
 */
export const createClient = (config: WPConfig): WPAPI => {
  return new WPAPI({
    endpoint: config.endpoint,
    username: config.username,
    password: config.password
  });
};

/**
 * 게시물 목록을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @param params - 검색 파라미터
 * @returns 게시물 목록
 */
export const getPosts = async (wp: WPAPI, params?: any): Promise<WPPost[]> => {
  try {
    const query = wp.posts();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        query.param(key, value);
      });
    }
    return await query;
  } catch (error) {
    console.error('게시물 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 게시물을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @param id - 게시물 ID
 * @returns 게시물 정보
 */
export const getPost = async (wp: WPAPI, id: number): Promise<WPPost> => {
  try {
    return await wp.posts().id(id);
  } catch (error) {
    console.error('게시물 조회 실패:', error);
    throw error;
  }
};

/**
 * 새 게시물을 생성합니다.
 * @param wp - WordPress API 클라이언트
 * @param post - 게시물 데이터
 * @returns 생성된 게시물 정보
 */
export const createPost = async (wp: WPAPI, post: WPPost): Promise<WPPost> => {
  try {
    return await wp.posts().create(post);
  } catch (error) {
    console.error('게시물 생성 실패:', error);
    throw error;
  }
};

/**
 * 게시물을 수정합니다.
 * @param wp - WordPress API 클라이언트
 * @param id - 게시물 ID
 * @param post - 수정할 게시물 데이터
 * @returns 수정된 게시물 정보
 */
export const updatePost = async (wp: WPAPI, id: number, post: WPPost): Promise<WPPost> => {
  try {
    return await wp.posts().id(id).update(post);
  } catch (error) {
    console.error('게시물 수정 실패:', error);
    throw error;
  }
};

/**
 * 게시물을 삭제합니다.
 * @param wp - WordPress API 클라이언트
 * @param id - 게시물 ID
 * @returns 삭제된 게시물 정보
 */
export const deletePost = async (wp: WPAPI, id: number): Promise<WPPost> => {
  try {
    return await wp.posts().id(id).delete();
  } catch (error) {
    console.error('게시물 삭제 실패:', error);
    throw error;
  }
};

/**
 * 미디어 파일을 업로드합니다.
 * @param wp - WordPress API 클라이언트
 * @param file - 파일 데이터
 * @param title - 미디어 제목
 * @returns 업로드된 미디어 정보
 */
export const uploadMedia = async (wp: WPAPI, file: Buffer, title: string): Promise<WPMedia> => {
  try {
    return await wp.media().file(file).create({
      title: title
    });
  } catch (error) {
    console.error('미디어 업로드 실패:', error);
    throw error;
  }
};

/**
 * 카테고리 목록을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @returns 카테고리 목록
 */
export const getCategories = async (wp: WPAPI): Promise<WPCategory[]> => {
  try {
    return await wp.categories();
  } catch (error) {
    console.error('카테고리 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 태그 목록을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @returns 태그 목록
 */
export const getTags = async (wp: WPAPI): Promise<WPTag[]> => {
  try {
    return await wp.tags();
  } catch (error) {
    console.error('태그 목록 조회 실패:', error);
    throw error;
  }
};

// Export AREA
export {
  WPAPI
};
