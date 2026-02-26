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

interface KakaoShareParams {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  buttonText?: string;
}

export function shareToKakao({ title, description, imageUrl, link, buttonText = '글 보기' }: KakaoShareParams) {
  if (!initKakao()) {
    alert('카카오톡 공유를 사용할 수 없습니다.');
    return;
  }

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
}
