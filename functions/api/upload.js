export async function onRequestPost(context) {
    const { request, env } = context;

    // 这里的 MY_BUCKET 就是你在绑定时设置的“变量名”
    if (!env.MY_BUCKET) {
        return new Response("R2 绑定未就绪", { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    const fileName = `${Date.now()}-${file.name}`;

    // 直接流式写入 R2
    await env.MY_BUCKET.put(fileName, file.stream(), {
        httpMetadata: { contentType: file.type }
    });

    return new Response(JSON.stringify({
        success: true,
        url: `https://你的R2域名/${fileName}`
    }), {
        headers: { "Content-Type": "application/json" }
    });
}