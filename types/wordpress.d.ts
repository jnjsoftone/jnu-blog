import { AxiosInstance } from 'axios';
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
declare const createWPClient: (config: WordPressConfig) => AxiosInstance;
/**
 * WordPress 게시물 목록을 가져옵니다.
 * @param client - WordPress API 클라이언트
 * @param params - 검색 파라미터 (페이지, 검색어 등)
 * @returns 게시물 목록
 */
declare const getPosts: (client: AxiosInstance, params?: any) => Promise<WordPressPost[]>;
/**
 * WordPress 게시물을 가져옵니다.
 * @param client - WordPress API 클라이언트
 * @param postId - 게시물 ID
 * @returns 게시물 정보
 */
declare const getPost: (client: AxiosInstance, postId: number) => Promise<WordPressPost>;
/**
 * WordPress 게시물을 생성합니다.
 * @param client - WordPress API 클라이언트
 * @param post - 게시물 데이터
 * @returns 생성된 게시물 정보
 */
declare const createPost: (client: AxiosInstance, post: WordPressPost) => Promise<WordPressPost>;
/**
 * WordPress 게시물을 수정합니다.
 * @param client - WordPress API 클라이언트
 * @param postId - 게시물 ID
 * @param post - 수정할 게시물 데이터
 * @returns 수정된 게시물 정보
 */
declare const updatePost: (client: AxiosInstance, postId: number, post: WordPressPost) => Promise<WordPressPost>;
/**
 * WordPress 게시물을 삭제합니다.
 * @param client - WordPress API 클라이언트
 * @param postId - 게시물 ID
 * @returns 삭제된 게시물 정보
 */
declare const deletePost: (client: AxiosInstance, postId: number) => Promise<WordPressPost>;
export { WordPressPost, WordPressConfig, createWPClient, getPosts, getPost, createPost, updatePost, deletePost, };
//# sourceMappingURL=wordpress.d.ts.map