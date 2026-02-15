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

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
        }

        // 生成唯一文件名
        const fileName = `${Date.now()}-${file.name}`;

        // 写入 R2
        await env.MY_BUCKET.put(fileName, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

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