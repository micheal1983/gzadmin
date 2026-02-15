export async function onRequest(context) {
    return new Response("Cloudflare Functions 运行正常！绑定状态：" + (context.env.MY_BUCKET ? "已绑定" : "未绑定"));
}