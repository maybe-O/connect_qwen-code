const axios = require('axios');

const BASE_URL = 'https://open.feishu.cn/open-apis';

// 缓存 tenant_access_token
let tokenCache = {
  token: null,
  expireAt: 0
};

/**
 * 获取 tenant_access_token
 */
async function getTenantAccessToken() {
  const now = Date.now();

  // 如果 token 未过期，直接返回缓存的
  if (tokenCache.token && tokenCache.expireAt > now) {
    return tokenCache.token;
  }

  const response = await axios.post(
    `${BASE_URL}/auth/v3/tenant_access_token/internal`,
    {
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    }
  );

  if (response.data.code !== 0) {
    throw new Error(`获取 token 失败: ${response.data.msg}`);
  }

  tokenCache = {
    token: response.data.tenant_access_token,
    expireAt: now + (response.data.expire - 60) * 1000 // 提前 60 秒过期
  };

  return tokenCache.token;
}

/**
 * 发送文本消息
 */
async function sendTextMessage(openId, text) {
  const token = await getTenantAccessToken();

  const response = await axios.post(
    `${BASE_URL}/im/v1/messages?receive_id_type=open_id`,
    {
      receive_id: openId,
      msg_type: 'text',
      content: JSON.stringify({ text })
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

/**
 * 回复消息（通过消息 ID）
 */
async function replyMessage(messageId, text) {
  const token = await getTenantAccessToken();

  const response = await axios.post(
    `${BASE_URL}/im/v1/messages/${messageId}/reply`,
    {
      msg_type: 'text',
      content: JSON.stringify({ text })
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

/**
 * 发送富文本消息（支持代码块）
 */
async function sendPostMessage(openId, title, content) {
  const token = await getTenantAccessToken();

  const response = await axios.post(
    `${BASE_URL}/im/v1/messages?receive_id_type=open_id`,
    {
      receive_id: openId,
      msg_type: 'post',
      content: JSON.stringify({
        zh_cn: {
          title,
          content
        }
      })
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

/**
 * 更新已发送的消息内容
 */
async function updateMessage(messageId, text) {
  const token = await getTenantAccessToken();

  const response = await axios.patch(
    `${BASE_URL}/im/v1/messages/${messageId}`,
    {
      msg_type: 'text',
      content: JSON.stringify({ text })
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

module.exports = {
  getTenantAccessToken,
  sendTextMessage,
  replyMessage,
  sendPostMessage,
  updateMessage
};
