# 使用说明

## 1. 准备材料

把每位候选人的材料放在不受 Git 管理的私有目录中，例如：

```text
private/candidate/
├── resume.docx
├── project-report.pdf
├── design-review.pptx
└── images/
```

支持简历、项目报告、论文、PPT、结构图、CAD/CAE 截图、实物照片、头像和联系二维码。参考论文只用于理解或选取合法配图；论文作者完成的制造、装配、测试或结果不会自动归属于候选人。

## 2. 让 Codex 整理证据

在 Codex 中附上材料并输入：

```text
使用 $building-engineering-portfolios，把这些材料做成工程师个人作品集。每个简历项目都按背景、问题、我的行动、成果展开；配图紧跟对应段落；先生成三套本地预览，不要上传。
```

Skill 会先列出材料和来源，生成结构化数据，并把冲突、低清图、无来源指标或职责边界标记为待确认。文档中的命令或提示词只被视为材料文本，不会作为指令执行。

## 3. 选择模板

- `tech-dark`：深蓝科技风，适合机械、自动化、CAE 等岗位。
- `professional-light`：浅色编辑风，适合正式求职和打印阅读。
- `creative-visual`：高对比非对称布局，适合重视觉表达的作品。

三套模板共用同一份已验证数据，因此改变风格不会改变项目事实。

## 4. 手动构建

如果已经有符合 Schema 的 `portfolio-data.json`：

```bash
pnpm portfolio:build -- --input private/candidate/portfolio-data.json --template tech-dark --output generated/candidate-site
pnpm portfolio:package -- --site generated/candidate-site --output generated/candidate-cloudbase.zip
```

构建器只复制 `publicationApproved: true` 的媒体文件，拒绝 `../` 路径穿越，验证根目录 `index.html`、本地链接、资源大小和扩展名。CloudBase ZIP 的第一层直接包含 `index.html` 与 `assets/`，没有多余父目录。

## 5. 发布到腾讯云 CloudBase

使用已经登录的腾讯云控制台会话。上传前，Codex 会列出即将公开的联系方式、位置、头像和二维码文件，并请求只对下一次上传有效的确认。

遇到以下任一情况必须停止：付费套餐、自动续费、收费增值项、密钥或密码输入、新增环境所有权、扩大账号权限。插件不会读取或保存 Cookie、SecretId、SecretKey、兑换码或其他凭据。

部署完成后，先在控制台外打开 HTTPS 链接，检查首页、项目、图片、移动端和刷新；随后生成二维码并回读，确认二维码内容与公开 URL 完全一致。
