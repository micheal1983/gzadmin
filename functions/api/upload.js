// functions/api/upload.js
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response('未发现文件', { status: 400 });
        }

        // 生成唯一文件名
        const fileName = `${Date.now()}-${file.name}`;

        // 使用绑定的 MY_BUCKET 直接写入 R2
        await env.MY_BUCKET.put(fileName, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        return new Response(JSON.stringify({
            success: true,
            url: `https://你的R2自定义域名.com/${fileName}`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}