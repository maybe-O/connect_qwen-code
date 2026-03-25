const { exec } = require('child_process');

/**
 * 执行 qwen 命令
 * @param {string} prompt - 用户输入的命令/提示
 * @param {string} workDir - 工作目录
 * @returns {Promise<string>} - 执行结果
 */
async function executeQwenCode(prompt, workDir = process.cwd()) {
  return new Promise((resolve, reject) => {
    // 转义 prompt 中的特殊字符
    const escapedPrompt = prompt.replace(/"/g, '""');

    // 使用 exec 确保命令正确传递
    const command = `chcp 65001 >nul && qwen -p "${escapedPrompt}" -y`;

    console.log('========== 传给 qwen 的命令 ==========');
    console.log(command);
    console.log('======================================');

    exec(command, {
      cwd: workDir,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 120000, // 2分钟超时
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8'
      }
    }, (error, stdout, stderr) => {
      console.log('========== qwen 执行结果 ==========');
      if (error) {
        console.log('错误:', error.message);
        if (error.killed) {
          console.log('命令超时被终止');
        }
      }
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      console.log('====================================');

      if (error && !stdout) {
        resolve(`执行失败: ${error.message}`);
        return;
      }
      resolve(stdout || stderr || '执行完成，无输出');
    });
  });
}

module.exports = {
  executeQwenCode
};
