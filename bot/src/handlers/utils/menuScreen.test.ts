import { describe, it, expect, vi } from 'vitest';
import { sendHomeScreen, WELCOME_TEXT } from './menuScreen';

describe('menuScreen', () => {
  it('sends two messages on forceNew: true (banner with reply keyboard + menu message)', async () => {
    const mockCache = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    const sendPhoto = vi.fn().mockResolvedValue({ message_id: 101 });
    const sendMessage = vi.fn().mockResolvedValue({ message_id: 102 });
    const deleteMessage = vi.fn().mockResolvedValue(true);

    const ctx = {
      from: { id: 12345 },
      chat: { id: 12345 },
      api: {
        sendPhoto,
        sendMessage,
        deleteMessage,
      },
    };

    await sendHomeScreen(ctx, mockCache as any, WELCOME_TEXT, { forceNew: true });

    // Should send photo banner with persistent reply keyboard
    expect(sendPhoto).toHaveBeenCalledTimes(1);
    expect(sendPhoto.mock.calls[0][2].reply_markup).toBeDefined();

    // Should send inline menu as second message
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage.mock.calls[0][1]).toBe('<b>Разделы:</b>');
    expect(sendMessage.mock.calls[0][2].reply_markup).toBeDefined();

    // Should save both photo and menu message IDs in KV cache
    expect(mockCache.put).toHaveBeenCalledWith('last_photo:12345', '101', expect.any(Object));
    expect(mockCache.put).toHaveBeenCalledWith('last_message:12345', '102', expect.any(Object));
  });

  it('edits message in-place on return without resending photo when messages exist', async () => {
    const mockCache = {
      get: vi.fn((key: string) => {
        if (key === 'last_photo:12345') return Promise.resolve('101');
        if (key === 'last_message:12345') return Promise.resolve('102');
        return Promise.resolve(null);
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };

    const editMessageText = vi.fn().mockResolvedValue(true);
    const sendPhoto = vi.fn();
    const sendMessage = vi.fn();

    const ctx = {
      from: { id: 12345 },
      chat: { id: 12345 },
      api: {
        editMessageText,
        sendPhoto,
        sendMessage,
      },
    };

    await sendHomeScreen(ctx, mockCache as any, WELCOME_TEXT);

    // Should edit message 102 in place
    expect(editMessageText).toHaveBeenCalledWith(
      12345,
      102,
      '<b>Разделы:</b>',
      expect.objectContaining({ parse_mode: 'HTML' }),
    );

    // Should NOT resend photo or send new message
    expect(sendPhoto).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
