---
title: "السيناريوهات العملية واستكشاف الأخطاء"
description: "سيناريوهات الهوية الواقعية، وأدلة استكشاف وحل الأخطاء الشائعة، وكتيبات الاستجابة لحوادث الهوية الأمنية."
---
<!-- verified 2026-09-17 -->

# السيناريوهات العملية واستكشاف الأخطاء (Scenarios & Troubleshooting)

يحول هذا القسم المفاهيم النظرية إلى واقع تشغيلي ملموس. تتابع [السيناريوهات التشغيلية](01-onboarding.md) دورة حياة هوية واحدة عبر مراحلها: التهيئة والانضمام، وتغيير المسمى والأدوار، وإنهاء الخدمة، والوصول المميّز، وحملات التدقيق، وتكامل تطبيقات SaaS. وتغطي [أدلة استكشاف الأخطاء](08-troubleshooting-ldap.md) المشاكل التقنية التي تولد النسبة العظمى من تذاكر الدعم مع تفصيل الأعراض والسبب الجذري والحل والوقاية. بينما تقدم [كتيبات الاستجابة للحوادث](15-incident-compromised-privileged-account.md) إجراءات صارمة للتعامل مع أسوأ سيناريوهات الاختراق.

---

## أقسام هذا الدليل

### 1. السيناريوهات التشغيلية (Scenarios)
1. **[تهيئة الموظف الجديد (Joiner)](01-onboarding.md)**: خط أنابيب التزويد التلقائي من نظام الموارد البشرية إلى اليوم الأول.
2. **[تغيير الدور الوظيفي (Mover)](02-role-change.md)**: انتقال الصلاحيات مع الدور وسحب الصلاحيات السابقة لمنع التراكم.
3. **[إنهاء الخدمة (Leaver)](03-termination.md)**: إجراءات الإلغاء القياسية وإلغاء التفعيل الفوري لحالات الطوارئ.
4. **[طلب الوصول المميّز](04-privileged-access-request.md)**: دورة الطلب والاعتماد والمنح المؤقت والتدقيق.
5. **[حملة مراجعة وتوثيق الصلاحيات](05-certification-campaign.md)**: تنفيذ حملة IGA لمراجعة الصلاحيات وفق جدول زمني دقيق.
6. **[تسجيل واستعادة المصادقة المتعددة (MFA)](06-mfa-enrollment-recovery.md)**: التسجيل الأول، وفقدان الأجهزة، وخطوات الاستعادة الآمنة.
7. **[ربط تطبيقات SaaS](07-saas-sso-integration.md)**: دمج تطبيق سحابي جديد عبر SAML 2.0 و SCIM 2.0 خطوة بخطوة.
8. **[إدارة حسابات الطوارئ (Break-Glass)](18-break-glass-access.md)**: تصميم وتأمين حسابات الطوارئ المعزولة لمواجهة كوارث IdP.
9. **[إدارة وصول الموردين الخارجيين](19-vendor-external-access.md)**: حوكمة وصول الموردين والمقاولين الخارجيين عبر وسيط PAM وجلسات JIT.
10. **[الدفاع ضد التصيد بالوسيط الاحتيالي (AiTM)](20-aitm-phishing-defense.md)**: مواجهة خوادم Evilginx وسرقة جلسات العمل وإلغاء الرموز.
11. **[دمج الهويات أثناء الاندماج والاستحواذ (M&A)](21-mergers-acquisitions-identity.md)**: دمج الدلائل، وتصفية SID، والمزامنة السحابية المتقاطعة.
12. **[هندسة طبقات Active Directory وهجمات ADCS](22-active-directory-tiering-migration.md)**: الانتقال لنموذج Enterprise Access Model وحماية قوالب الشهادات.

### 2. أدلة استكشاف الأخطاء (Troubleshooting)
- **[أخطاء ربط LDAP](08-troubleshooting-ldap.md)**: فك رموز الخطأ الشهير Error 49 والأكواد الفرعية لـ Active Directory.
- **[أخطاء الشهادات الرقمية (Certificates)](09-troubleshooting-certificates.md)**: عدم تطابق الأسماء، وانتهاء الصلاحية، وانقطاع سلسلة الثقة، وفروق التوقيت.
- **[أخطاء جلسات ودمج أنظمة PAM](10-troubleshooting-pam.md)**: انقطاع الجلسات، وفشل تدوير الخزينة، ومشاكل وكلاء الخوادم.
- **[أخطاء سياسات AWS IAM](11-troubleshooting-aws-iam.md)**: تشريح رسائل Access Denied، وحدود الصلاحيات، وتضارب السياسات.
- **[أخطاء إفادات SAML 2.0](12-troubleshooting-saml.md)**: فشل توقيع الشهادات، ومشاكل Audience، ومطابقة السمات.
- **[انحراف توقيت MFA وفقدان المفاتيح](13-troubleshooting-mfa.md)**: انحراف ساعات TOTP ومعالجة الحالات المستعصية.
- **[أخطاء مزامنة وتزويد SCIM](14-troubleshooting-scim.md)**: تشخيص توقف المزامنة الصامت واستكشاف تعارض السمات.

### 3. كتيبات الاستجابة للحوادث (Incident Response Playbooks)
- **[اختراق حساب مميّز (Compromised Privileged Account)](15-incident-compromised-privileged-account.md)**: الاحتواء الفوري، وحفظ الأدلة الجنائية، والتدوير الشامل.
- **[مراجعة الجلسات للتهديدات الداخلية (Insider Threat)](16-incident-insider-threat-session-review.md)**: ما يمكن لتسجيلات الفيديو إثباته وما تعجز عنه.
- **[التدوير الطارئ للاعتمادات أثناء هجمات الفدية](17-incident-ransomware-credential-rotation.md)**: استراتيجية تدوير كلمات السر دفعة واحدة على مستوى المنظمة.

## تقييم القسم

import SectionQuiz from '@site/src/components/SectionQuiz';
import { QUIZZES_AR } from '@site/src/data/quizzes.ar';

<SectionQuiz title={QUIZZES_AR['scenarios'].title} questions={QUIZZES_AR['scenarios'].questions} passingScore={3} sectionKey="scenarios-ar" />
