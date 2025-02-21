/// <reference types="node" />
/// <reference types="node" />
import WPAPI from 'wpapi';
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
/**
 * WordPress API 클라이언트를 생성합니다.
 * @param config - WordPress 설정
 * @returns WordPress API 클라이언트
 */
export declare const createClient: (config: WPConfig) => WPAPI;
/**
 * 게시물 목록을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @param params - 검색 파라미터
 * @returns 게시물 목록
 */
export declare const getPosts: (wp: WPAPI, params?: any) => Promise<WPPost[]>;
/**
 * 특정 게시물을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @param id - 게시물 ID
 * @returns 게시물 정보
 */
export declare const getPost: (wp: WPAPI, id: number) => Promise<WPPost>;
/**
 * 새 게시물을 생성합니다.
 * @param wp - WordPress API 클라이언트
 * @param post - 게시물 데이터
 * @returns 생성된 게시물 정보
 */
export declare const createPost: (wp: WPAPI, post: WPPost) => Promise<WPPost>;
/**
 * 게시물을 수정합니다.
 * @param wp - WordPress API 클라이언트
 * @param id - 게시물 ID
 * @param post - 수정할 게시물 데이터
 * @returns 수정된 게시물 정보
 */
export declare const updatePost: (wp: WPAPI, id: number, post: WPPost) => Promise<WPPost>;
/**
 * 게시물을 삭제합니다.
 * @param wp - WordPress API 클라이언트
 * @param id - 게시물 ID
 * @returns 삭제된 게시물 정보
 */
export declare const deletePost: (wp: WPAPI, id: number) => Promise<WPPost>;
/**
 * 미디어 파일을 업로드합니다.
 * @param wp - WordPress API 클라이언트
 * @param file - 파일 데이터
 * @param title - 미디어 제목
 * @returns 업로드된 미디어 정보
 */
export declare const uploadMedia: (wp: WPAPI, file: Buffer, title: string) => Promise<WPMedia>;
/**
 * 카테고리 목록을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @returns 카테고리 목록
 */
export declare const getCategories: (wp: WPAPI) => Promise<WPCategory[]>;
/**
 * 태그 목록을 조회합니다.
 * @param wp - WordPress API 클라이언트
 * @returns 태그 목록
 */
export declare const getTags: (wp: WPAPI) => Promise<WPTag[]>;
export { WPAPI };
//# sourceMappingURL=wp.d.ts.map