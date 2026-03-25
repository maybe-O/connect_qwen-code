require('dotenv').config();
const express = require('express');
const { handleEvent } = require('./handler');

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 飞书事件回调 endpoint
app.post('/feishu/webhook', async (req, res) => {
  console.log('收到请求:', JSON.stringify(req.body));

  try {
    const { challenge, type, schema, event } = req.body;

    // URL 验证（首次配置时飞书会发送 challenge）
    if (type === 'url_verification') {
      console.log('URL 验证请求, challenge:', challenge);
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify({ challenge }));
    }

    // 处理飞书 2.0 事件格式
    if (schema === '2.0' && event) {
      console.log('收到事件:', JSON.stringify(event, null, 2));
      await handleEvent(event);
      return res.json({ code: 0, msg: 'success' });
    }

    // 处理旧版事件格式
    if (type === 'event_callback') {
      console.log('收到事件:', JSON.stringify(event, null, 2));
      await handleEvent(event);
      return res.json({ code: 0, msg: 'success' });
    }

    res.json({ code: 0, msg: 'ignored' });
  } catch (error) {
    console.error('处理请求错误:', error);
    res.status(500).json({ code: -1, msg: 'internal error' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`飞书机器人服务已启动: http://localhost:${PORT}`);
  console.log(`Webhook 地址: http://localhost:${PORT}/feishu/webhook`);
  console.log('\n请确保 frp 已配置并映射到此端口');
});
