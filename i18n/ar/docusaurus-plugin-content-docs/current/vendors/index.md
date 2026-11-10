---
title: "منظومة الموردين والتقنيات (Vendor Landscape)"
description: "المنتجات والتقنيات الرائدة في إدارة الهوية والوصول: CyberArk و Delinea و BeyondTrust ومنظومة Microsoft و IAM السحابي وحلول الحوكمة (IGA)."
---
<!-- verified 2026-09-17 -->

# منظومة الموردين والتقنيات (Vendor Landscape)

ينقسم سوق تقنيات الهوية والوصول إلى فئات متمايزة، تعالج كل منها جزءاً من التحديات التي يفصلها هذا المرجع في أقسام [أساسيات IAM](/docs/fundamentals/what-is-iam)، و[البروتوكولات](/docs/protocols-iga/ldap)، و[إدارة الوصول المميّز](/docs/pam-core/what-is-pam):

- **منصات PAM التخصصية**: CyberArk، Delinea، BeyondTrust. تركز منتجاتها الجوهرية على الخزائن الرقمية وإدارة الجلسات وحماية الامتيازات على محطات العمل (PEDM).
- **منظومة مايكروسوفت (Microsoft Identity Stack)**: الدليل النشط الداخلي (AD)، و Entra ID، وسياسات الوصول المشروط (Conditional Access)، وإدارة الهويات المميزة (PIM)، و MIM. تمثل المنصة الافتراضية لأغلب المنظمات.
- **إدارة الهوية السحابية الأصلية (Cloud IAM)**: خدمات الهوية الخاصة بـ AWS و Google Cloud و Azure. يمتلك كل موفر سحابي نموذج سياسات وترخيص خاص به، ويعد فهم الفروقات الدقيقة بينها مهارة وظيفية أساسية.
- **أدوات الحوكمة والإدارة (IGA)**: SailPoint و Okta Identity Governance و Saviynt. تختص بحملات مراجعة الصلاحيات، وهندسة الأدوار، والفصل بين المهام المتعارضة.
- **حلول PAM السحابية الحديثة**: Teleport و Boundary و StrongDM، القائمة على انعدام الصلاحيات الدائمة وتجاوز الخزائن التقليدية.

---

## صفحات هذا القسم

1. **[نظرة عامة على منظومة الموردين](01-major-vendors.md)**: خارطة ترابط الفئات وموقع كل عائلة برمجية.
2. **[منصة CyberArk](02-cyberark.md)**: المكونات المعمارية (Vault, CPM, PSM, PVWA, Conjur)، مسار الشهادات، وسيناريو تطبيقي عملي.
3. **[منصة Delinea](03-delinea.md)**: بنية Secret Server ثلاثية الطبقات و Privilege Manager.
4. **[منصة BeyondTrust](04-beyondtrust.md)**: بنية Password Safe وسحابة وسطاء الموارد (Resource Brokers).
5. **[منظومة هوية مايكروسوفت](05-microsoft-stack.md)**: الدليل النشط، Entra ID، الوصول المشروط، PIM، وبنية الهوية الهجينة (Hybrid Identity).
6. **[إدارة الهوية السحابية (Cloud IAM)](06-cloud-iam.md)**: المقارنة المعمارية بين AWS IAM و GCP IAM و Azure RBAC.
7. **[أدوات حوكمة الهوية (IGA)](07-governance-tools.md)**: مقارنة بين SailPoint و Saviynt و Okta IGA.
8. **[مصفوفة المقارنة والتقييم](08-vendor-comparison.md)**: معايير اختيار الأداة المناسبة لمتطلبات المنظمة.
9. **[حلول PAM السحابية الحديثة](09-modern-cloud-pam.md)**: البنية المعمارية لـ Teleport و HashiCorp Boundary و StrongDM.

## تقييم القسم

import SectionQuiz from '@site/src/components/SectionQuiz';
import { QUIZZES_AR } from '@site/src/data/quizzes.ar';

<SectionQuiz title={QUIZZES_AR['vendors'].title} questions={QUIZZES_AR['vendors'].questions} passingScore={3} sectionKey="vendors-ar" />
