export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 检查 R2 绑定
        if (!env.MY_BUCKET) {
            return new Response(JSON.stringify({ error: "R2 bucket (MY_BUCKET) not found" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        // 🌟 1. 获取前端传来的目录参数，并设置默认值防错
        const model = formData.get('model') || 'common';
        const channel = formData.get('channel') || 'default';

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
        }

        // 🌟 2. 生成唯一文件名 (这个值是要存进数据库的纯文件名)
        const fileName = `${Date.now()}-${file.name}`;

        // 🌟 3. 拼接 R2 中的完整存储路径 (Object Key)
        // 例如：games/gz/1700000000000-cover.webp
        const objectKey = `${model}/${channel}/${fileName}`;

        // 🌟 4. 将文件写入到拼接好的路径下
        await env.MY_BUCKET.put(objectKey, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        // 🌟 5. 重点：只返回纯 fileName 给前端！
        // 因为前端的 getFullUrl() 会自动根据当前页面环境补齐 model 和 channel
        return new Response(JSON.stringify({
            success: true,
            fileName: fileName,
            message: "上传成功"
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}