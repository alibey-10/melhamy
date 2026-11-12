<div dir="rtl">

# موقع محمد إلهامي

الموقع الرسمي للمؤرخ والكاتب **محمد إلهامي**، يجمع كتبه ومقالاته في مكان واحد. الموقع باللغة العربية ويدعم الكتابة من اليمين إلى اليسار، مع وضعين للمظهر: فاتح وداكن.

## أقسام الموقع

- **الكتب**: كتب المؤلف.
- **المدونة**: مقالاته وكتاباته.

## التقنيات المستخدمة

- [TanStack Start](https://tanstack.com/start) لبناء الموقع وتوجيه الصفحات.
- [Tailwind CSS](https://tailwindcss.com) و [shadcn/ui](https://ui.shadcn.com) للتصميم والمكونات.
- [Cloudflare Workers](https://workers.cloudflare.com) للاستضافة والنشر.
- [Vite+](https://viteplus.dev) لأدوات التطوير والتدقيق والاختبار.
- [Sanity](https://www.sanity.io) لإدارة المحتوى.

## تعديل المحتوى

- جميع نصوص الموقع موجودة في `src/content/ar.json`.
- جميع الروابط (الصفحات وحسابات التواصل) موجودة في `src/constants/urls.ts`.
- الكتب والمقالات تُدار من [Sanity](https://www.sanity.io) عبر لوحة التحرير على الرابط `/studio`.
- إعدادات الاتصال بـ Sanity في `src/sanity/env.ts`، وأنواع المحتوى في `src/sanity/schema`.

## التشغيل محليًا

</div>

```bash
bun install
bun run dev        # http://localhost:3000
bun run build
bun run deploy
```

<div dir="rtl">

لمعاينة أي تعديل دون المساس بالنسخة المنشورة:

</div>

```bash
bun run deploy:preview                            # https://<version>-melhamy.<subdomain>.workers.dev
bun run deploy:preview -- --preview-alias my-pr   # https://my-pr-melhamy.<subdomain>.workers.dev
```

<div dir="rtl">

لإضافة مكوّن من shadcn:

</div>

```bash
pnpm dlx shadcn@latest add button
```
