const { replyMessage, sendTextMessage } = require('./feishu');
const { executeQwenCode } = require('./qwen');

// 已处理的消息 ID 集合（防重复）
const processedMessages = new Set();

/**
 * 处理飞书事件
 */
async function handleEvent(event) {
  if (event.message) {
    const { message } = event;
    const messageId = message.message_id;

    // 检查是否已处理过
    if (processedMessages.has(messageId)) {
      console.log(`跳过重复消息: ${messageId}`);
      return;
    }

    // 标记为已处理
    processedMessages.add(messageId);

    // 限制集合大小，防止内存泄漏
    if (processedMessages.size > 1000) {
      const first = processedMessages.values().next().value;
      processedMessages.delete(first);
    }

    const content = JSON.parse(message.content);
    const text = content.text || '';
    const openId = event.sender?.sender_id?.open_id;

    console.log(`收到消息: ${text}`);

    // 异步处理，不阻塞响应
    processMessage(messageId, openId, text);
  }
}

/**
 * 异步处理消息（先回复"处理中"，执行完再发结果）
 */
async function processMessage(messageId, openId, text) {
  try {
    // 1. 先快速回复，让用户知道收到了
    await replyMessage(messageId, '⏳ 正在处理...');

    // 2. 执行 qwen
    const result = await executeQwenCode(text);

    // 3. 发送执行结果（新消息）
    // 截断过长的结果
    const truncatedResult = result.length > 4000
      ? result.substring(0, 4000) + '\n... (结果过长已截断)'
      : result;

    if (openId) {
      await sendTextMessage(openId, truncatedResult);
    } else {
      await replyMessage(messageId, truncatedResult);
    }
  } catch (error) {
    console.error('执行错误:', error);
    await replyMessage(messageId, `❌ 执行失败: ${error.message}`);
  }
}

module.exports = { handleEvent };
