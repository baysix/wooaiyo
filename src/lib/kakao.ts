/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Kakao: any;
  }
}

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
const KAKAO_TEMPLATE_ID = 129840;

function initKakao(): boolean {
  if (typeof window === 'undefined' || !window.Kakao || !KAKAO_APP_KEY) return false;
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_APP_KEY);
  }
  return window.Kakao.isInitialized();
}

// --- 타입 ---

export interface ShareParams {
  title: string;
  description: string;
  price?: string;
  imageUrl?: string;
  link: string;
}

// --- 공유 함수 ---

/** 카카오톡 메시지 템플릿 공유 */
export function shareKakao({ title, description, price, imageUrl, link }: ShareParams): boolean {
  if (!initKakao()) return false;

  const templateArgs: Record<string, string> = { title, description, link };
  if (price) templateArgs.price = price;
  if (imageUrl) templateArgs.imageUrl = imageUrl;

  window.Kakao.Share.sendCustom({
    templateId: KAKAO_TEMPLATE_ID,
    templateArgs,
  });
  return true;
}

/** 카카오톡 공유 가능 여부 */
export function canShareKakao(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.Kakao && !!KAKAO_APP_KEY;
}

/** 클립보드에 링크 복사 */
export async function copyLink(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

/** 네이티브 Web Share API */
export async function webShare({ title, description, link }: ShareParams): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, text: description, url: link });
    return true;
  } catch {
    return false;
  }
}
