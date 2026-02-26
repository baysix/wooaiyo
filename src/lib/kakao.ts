/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Kakao: any;
  }
}

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

export function initKakao() {
  if (typeof window === 'undefined' || !window.Kakao) return false;
  if (!KAKAO_APP_KEY) return false;

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_APP_KEY);
  }
  return window.Kakao.isInitialized();
}

export interface ShareParams {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  buttonText?: string;
}

export function shareToKakao({ title, description, imageUrl, link, buttonText = '글 보기' }: ShareParams) {
  if (!initKakao()) return false;

  const content: any = {
    title,
    description,
    link: {
      mobileWebUrl: link,
      webUrl: link,
    },
  };

  if (imageUrl) {
    content.imageUrl = imageUrl;
    content.imageWidth = 800;
    content.imageHeight = 400;
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content,
    buttons: [
      {
        title: buttonText,
        link: {
          mobileWebUrl: link,
          webUrl: link,
        },
      },
    ],
  });
  return true;
}

export function isKakaoAvailable() {
  return typeof window !== 'undefined' && !!window.Kakao && !!KAKAO_APP_KEY;
}

export async function copyLink(link: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    // fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = link;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

export async function webShare({ title, description, link }: ShareParams): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, text: description, url: link });
    return true;
  } catch {
    return false;
  }
}
