# 飞书远程命令 - qwen-code

通过飞书机器人远程控制 qwen-code 执行命令。

## 项目简介

本项目是一个连接飞书机器人与 qwen-code 的中间件服务，允许用户通过飞书聊天界面远程调用 qwen-code 执行各种编程任务。

## 功能特性

- 接收飞书消息并转发给 qwen-code
- 支持文本消息处理
- 自动回复执行结果
- 支持超时控制（2分钟）

## 目录结构

```
connect_qwen-code/
├── src/
│   ├── index.js      # 入口文件，Express 服务
│   ├── handler.js    # 事件处理逻辑
│   ├── feishu.js     # 飞书 API 封装
│   └── qwen.js       # qwen 命令执行
├── .env              # 环境变量配置
├── package.json      # 项目依赖
└── README.md         # 本文件
```

## 快速开始

### 前置要求

- Node.js 16+
- npm
- qwen-code CLI 工具
- 飞书企业账号

### 1. 安装依赖

```bash
npm install
```

### 2. 安装 qwen-code

```bash
pip install qwen-code
# 或
npm install -g @anthropic-ai/claude-code
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，填入飞书应用配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

| 变量 | 说明 |
|------|------|
| `FEISHU_APP_ID` | 飞书应用的 App ID |
| `FEISHU_APP_SECRET` | 飞书应用的 App Secret |
| `PORT` | 服务端口（默认 3000） |

### 4. 启动内网穿透

使用 frp、ngrok 或 SakuraFrp 等工具将本地服务暴露到公网：

```bash
# frp 示例
frp -c frpc.ini

# ngrok 示例
ngrok http 3000
```

### 5. 配置飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 在「事件订阅」中配置 webhook 地址：
   ```
   https://your-domain.com/feishu/webhook
   ```
4. 开启「接收消息」权限
5. 发布应用版本

### 6. 启动服务

```bash
npm start
```

服务启动后输出：
```
飞书机器人服务已启动: http://localhost:3000
Webhook 地址: http://localhost:3000/feishu/webhook
```

## 使用方式

在飞书中给机器人发送任意消息，机器人会将其转发给 qwen-code 执行，并返回结果。

示例消息：
```
创建一个 hello.js 文件，输出 Hello World
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/feishu/webhook` | POST | 飞书事件回调 |
| `/health` | GET | 健康检查 |

## 飞书应用权限

需要在飞书开放平台配置以下权限：

- `im:message` - 获取与发送消息
- `im:message:send_as_bot` - 以应用身份发消息

## 常见问题

### qwen 命令卡住不响应

这是 qwen CLI 工具的已知问题。建议：
- 检查网络连接
- 尝试更新 qwen 版本
- 考虑使用 API 方式替代 CLI

### 收不到消息

1. 检查 webhook 地址是否正确
2. 确认内网穿透正常工作
3. 检查飞书应用权限配置

## 安全警告

本服务存在安全风险，请勿在公网环境直接暴露：

- 用户输入直接传递给 qwen-code 执行
- 缺乏身份验证和命令过滤
- 可能被利用进行远程代码执行

建议安全措施：
- 添加用户白名单
- 使用 verification_token 验证请求
- 在沙箱环境中运行
- 限制命令执行范围

## 相关文档

- [RCE 漏洞复现文档](./qwen-code_飞书机器人rce.md)
- [飞书开放平台文档](https://open.feishu.cn/document/)
- [qwen-code GitHub](https://github.com/QwenLM/qwen-code)

## License

MIT
