# nest 实现大文件分片上传

## 安装依赖

```bash
pnpm install
```

## 启动

前端代码由 nest 静态托管

```bash
pnpm run dev：start
```

## 访问
http://localhost:3000/client

## 大文件分片方案

- 把 1G 的大文件分割成 10 个 100M 的小文件，然后这些文件并行上传

- 然后等 10 个小文件都传完之后，再发一个请求把这 10 个小文件合并成原来的大文件。
