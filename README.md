# 起点读书图片算色演示

上传图片，提取原始主色，并按提供的起点读书色彩规则生成 FantasyColor、ColorFont Light 和 ColorFont Dark 共 30 个颜色 Token。

## 使用

直接打开 `index.html` 可使用上传和算色功能。完整源码预览建议启动静态服务器：

```sh
python3 -m http.server 8000
```

访问 http://localhost:8000 。无需安装依赖。图片仅在浏览器中处理。

## 功能

- 图片上传、拖放、六个候选色、手动 HEX 试色
- 原始 RGB / HSL / HEX 和三组色阶
- 单个 Token 的计算过程与浅色、深色阅读预览
- CSS、JSON、JavaScript 代码展示，JSON 导出与源码下载

## 规则与约定

附件未提供主色提取算法。本 Demo 将图片缩小至最长边 160px，以每通道 16 桶量化 RGB，取最大桶内的真实 RGB 均值；忽略 alpha < 128 的像素，不排除黑白色。

色相分组采用四舍五入后的整数 H，91–210 为高明度组，其余为中明度组；0°等同360°。输出保留原始 H。每档从原始主色独立计算，S≤5 时加6，其余按规则表阈值处理，L 按表固定。

ColorFont Light 700 高明度分支按原表执行：S≥40 时取45。

## 文件

- `color-engine.js`：RGB/HSL 转换、主色提取及色阶规则
- `app.js`：界面交互、预览与导出
- `style.css`：响应式样式
- `index.html`：页面结构
