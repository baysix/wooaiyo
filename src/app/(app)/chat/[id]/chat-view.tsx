'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendMessage, markChatAsRead } from '@/actions/chats';
import { approveOpenChatAccess } from '@/actions/open-chats';
import TransactionControls from '@/components/chat/transaction-controls';
import type { PostType, PostStatus } from '@/types/database';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_system: boolean;
  created_at: string;
}

interface PostInfo {
  id: string;
  title: string;
  images: string[];
  type: PostType;
  status: PostStatus;
  price: number | null;
  buyer_id: string | null;
}

interface ChatViewProps {
  chatRoomId: string;
  currentUserId: string;
  otherUser: { id: string; nickname: string; avatar_url: string | null };
  messages: Message[];
  openChat: { id: string; title: string; chat_type: string; creator_id: string } | null;
  isCreator: boolean;
  post: PostInfo | null;
  isSeller: boolean;
  buyerId: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h >= 12 ? '오후' : '오전'} ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m}`;
}

export default function ChatView({
  chatRoomId,
  currentUserId,
  otherUser,
  messages: initialMessages,
  openChat,
  isCreator,
  post,
  isSeller,
  buyerId,
}: ChatViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  // Supabase Realtime: message subscription + typing broadcast
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat:${chatRoomId}`)
      // Listen for new messages (postgres_changes)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => {
            if (newMsg.sender_id === currentUserId && !newMsg.is_system) {
              const withoutOptimistic = prev.filter(
                m => !(m.id.startsWith('temp-') && m.sender_id === currentUserId && m.content === newMsg.content)
              );
              if (withoutOptimistic.some(m => m.id === newMsg.id)) return withoutOptimistic;
              return [...withoutOptimistic, newMsg];
            }
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // If message is from the other user, mark as read
          if (newMsg.sender_id !== currentUserId) {
            setOtherTyping(false);
            markChatAsRead(chatRoomId);
          }
        }
      )
      // Listen for typing broadcast
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setOtherTyping(true);
          // Auto-hide after 3 seconds
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, currentUserId]);

  // Broadcast typing event (debounced)
  const lastTypingBroadcast = useRef(0);
  const broadcastTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingBroadcast.current < 2000) return; // Throttle to every 2s
    lastTypingBroadcast.current = now;
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId },
    });
  }, [currentUserId]);

  async function handleSend() {
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      content,
      is_system: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const result = await sendMessage(chatRoomId, content);
    if (result.error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }
    setSending(false);
  }

  async function handleApprove() {
    if (approving) return;
    setApproving(true);

    const result = await approveOpenChatAccess(chatRoomId);
    if (!result.success && result.error) {
      alert(result.error);
    }
    setApproving(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    if (e.target.value.trim()) {
      broadcastTyping();
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="flex h-10 w-10 items-center justify-center -ml-2"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-bold">{otherUser.nickname}</h1>
            {otherTyping ? (
              <p className="text-xs text-[#20C997] animate-pulse">입력 중...</p>
            ) : openChat ? (
              <p className="text-xs text-gray-400">{openChat.title}</p>
            ) : null}
          </div>
        </div>

        {isCreator && openChat?.chat_type === 'private' && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="rounded-lg bg-[#20C997] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {approving ? '전송 중...' : '인증'}
          </button>
        )}
      </header>

      {/* Transaction card (post chat rooms) */}
      {post && (
        <TransactionControls
          post={post}
          chatRoomId={chatRoomId}
          buyerId={buyerId}
          isSeller={isSeller}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">아직 메시지가 없습니다</p>
          </div>
        )}
        {messages.map((msg) => {
          if (msg.is_system) {
            // Try to parse as approval card
            let approvalData: { type: string; title: string; link: string | null; code: string | null } | null = null;
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed.type === 'approve') approvalData = parsed;
            } catch {
              // plain text system message
            }

            if (approvalData) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="w-[85%] max-w-xs rounded-2xl border border-[#20C997]/20 bg-white overflow-hidden shadow-sm">
                    <div className="bg-[#20C997]/5 px-4 py-3 text-center border-b border-[#20C997]/10">
                      <div className="text-lg mb-1">✅</div>
                      <p className="text-sm font-semibold text-gray-900">참여가 승인되었습니다</p>
                      <p className="text-xs text-gray-500 mt-0.5">{approvalData.title}</p>
                    </div>
                    <div className="px-4 py-3 space-y-3">
                      {approvalData.code && (
                        <div>
                          <p className="text-[10px] font-medium text-gray-400 mb-1">참여 코드</p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(approvalData.code!);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 active:bg-gray-100 transition-colors"
                          >
                            <span className="text-base font-bold tracking-widest text-gray-900">{approvalData.code}</span>
                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                          </button>
                          {copied && (
                            <p className="text-[10px] text-[#20C997] text-center mt-1">복사되었습니다!</p>
                          )}
                        </div>
                      )}
                      {approvalData.link && (
                        <a
                          href={approvalData.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#20C997] py-2.5 text-sm font-semibold text-white"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          채팅방 참여하기
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex justify-center">
                <div className="max-w-[85%] rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-xs text-gray-600 whitespace-pre-wrap text-center shadow-sm">
                  {msg.content}
                </div>
              </div>
            );
          }

          const isMine = msg.sender_id === currentUserId;

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-1.5 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    isMine
                      ? 'bg-[#20C997] text-white'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] text-gray-400">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#20C997] text-white disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
