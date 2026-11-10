---
title: معمل 17 - محاكاة الاستجابة للحوادث
description: "محاكاة حادث اختراق حساب خدمة في بيئة معمل محكومة. ممارسة الكشف والاحتواء والاستئصال والتعافي باستخدام أدوات AD الحقيقية و PowerShell."
---

# معمل 17 - محاكاة الاستجابة للحوادث

## ماذا يثبت هذا المعمل

الاستجابة للحوادث لاختراقات الهوية تتبع عملية منظمة: اكتشاف الشذوذ، احتواء التهديد، استئصال وصول المهاجم، والتعافي إلى حالة معروفة الجودة. هذا المعمل يحاكي اختراق حساب خدمة في بيئة AD محكومة، ويمر عبر دورة حياة IR كاملة باستخدام أدوات حقيقية (PowerShell، Event Viewer، سجلات تدقيق AD)، وينتج جدولًا زمنيًا للحادث يصمد في تحقيق حقيقي.

## البنية المعمارية

import Drawio from '@site/src/components/Drawio';
import irSim from '!!raw-loader!@site/static/diagrams/lab-17-ir-simulation.drawio';

<Drawio content={irSim} />

<a href="/diagrams/lab-17-ir-simulation.drawio" download>تحميل / تعديل هذا المخطط</a>

التدفق: حساب الخدمة يُظهر سلوكًا شاذًا (الخطوة 1)، فريق IR يكتشف الشذوذ عبر سجلات التدقيق (الخطوة 2)، يحتوي التهديد بتعطيل الحساب وإلغاء الجلسات (الخطوة 3)، يستأصل وصول المهاجم بتدوير بيانات الاعتماد وإزالة الثبات (الخطوة 4)، ويتعافى بإعادة إنشاء حساب الخدمة بضوابط مناسبة (الخطوة 5).

## المتطلبات الأساسية

- المعمل 1 مكتمل: `DC1` على `10.10.0.10` يخدم `corp.local`، مع `alice` كمستخدم نطاق.
- حساب خدمة في AD: `svc-app-01` بكلمة مرور معروفة.
- PowerShell مع وحدة AD مثبتة (`Import-Module ActiveDirectory`).
- وصول إلى Event Viewer على DC1.

## الخطوة 1 - محاكاة الاختراق

1. أنشئ حساب خدمة في AD:

   ```powershell
   New-ADUser -Name "svc-app-01" -SamAccountName "svc-app-01" `
     -UserPrincipalName "svc-app-01@corp.local" `
     -AccountPassword (ConvertTo-SecureString "P@ssw0rd123!" -AsPlainText -Force) `
     -Enabled $true -PasswordNeverExpires $true
   ```

2. محاكاة سلوك شاذ: حساب الخدمة يصادق من عنوان IP غير عادي في وقت غير عادي.

   ```powershell
   # Simulate a login event (in a real scenario, this would come from actual authentication)
   # For the lab, we create a fake security event
   $event = @{
     TimeCreated = Get-Date
     Id = 4624
     Message = "An account was successfully logged on."
     SubjectUserName = "svc-app-01"
     IpAddress = "203.0.113.50"
     LogonType = 3
   }
   Write-Host "Simulated login: $($event.SubjectUserName) from $($event.IpAddress) at $($event.TimeCreated)"
   ```

3. الشذوذ: `svc-app-01` عادة يصادق من `10.10.0.0/24` خلال ساعات العمل. تسجيل الدخول المحاكى هو من `203.0.113.50` (خارجي) في 02:00.

## الخطوة 2 - اكتشاف الشذوذ

1. على DC1، افتح Event Viewer وانتقل إلى **سجلات Windows → الأمان**.
2. فلتر لحدث 4624 (تسجيل دخول ناجح) مع اسم حساب الخدمة:

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4624
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Select-Object TimeCreated, Id, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[18].Value}}
   ```

3. حدد تسجيل الدخول الشاذ:
   - عادي: `svc-app-01` من `10.10.0.50` في 09:00.
   - شاذ: `svc-app-01` من `203.0.113.50` في 02:00.

4. اربط بأحداث أخرى:
   - تحقق من حدث 4672 (امتيازات خاصة معينة) لحساب الخدمة.
   - تحقق من حدث 4768 (طلب TGT لـ Kerberos) من IP الشاذ.
   - تحقق من حدث 4769 (طلب تذكرة خدمة Kerberos) من IP الشاذ.

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4768, 4769
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Select-Object TimeCreated, Id, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[18].Value}}
   ```

## الخطوة 3 - احتواء التهديد

1. عطّل حساب الخدمة المخترق:

   ```powershell
   Disable-ADAccount -Identity "svc-app-01"
   ```

2. ألغِ جميع الجلسات النشطة:
   - في AD، الحساب معطّل، لذا المصادقات الجديدة تفشل.
   - الجلسات الموجودة قد تستمر حتى تنتهي صلاحية التذكرة. فرض الإلغاء بإعادة تعيين كلمة مرور الحساب (الخطوة 4).

3. احظر عنوان IP الشاذ عند جدار الحماية:

   ```powershell
   # On a Windows host with firewall access
   New-NetFirewallRule -DisplayName "Block 203.0.113.50" `
     -Direction Inbound -RemoteAddress "203.0.113.50" -Action Block
   ```

4. احفظ الأدلة:
   - صدّر أحداث الأمان لحساب الخدمة إلى ملف.
   - التقط الحالة الحالية للحساب (عضوية المجموعات، SPNs، الأذونات).

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Export-Csv -Path "C:\IR\svc-app-01-events.csv" -NoTypeInformation

   Get-ADUser -Identity "svc-app-01" -Properties * |
     Export-Csv -Path "C:\IR\svc-app-01-state.csv" -NoTypeInformation
   ```

## الخطوة 4 - استئصال وصول المهاجم

1. أعد تعيين كلمة مرور حساب الخدمة:

   ```powershell
   $newPassword = ConvertTo-SecureString (New-Guid).Guid -AsPlainText -Force
   Set-ADAccountPassword -Identity "svc-app-01" -NewPassword $newPassword -Reset
   ```

2. أزل أي آليات ثبات:
   - تحقق من عضويات المجموعات غير المصرح بها:

     ```powershell
     Get-ADPrincipalGroupMembership -Identity "svc-app-01" |
       Select-Object Name, GroupCategory
     ```

   - تحقق من SPNs غير المصرح بها:

     ```powershell
     Get-ADUser -Identity "svc-app-01" -Properties ServicePrincipalNames |
       Select-Object -ExpandProperty ServicePrincipalNames
     ```

   - تحقق من الأذونات غير المصرح بها على الحساب:

     ```powershell
     (Get-Acl "AD:\CN=svc-app-01,CN=Users,DC=corp,DC=local").Access |
       Where-Object { $_.IdentityReference -notmatch "SYSTEM|Domain Admins|Enterprise Admins" }
     ```

3. افحص عن الحركة الجانبية:
   - تحقق من IP الشاذ في سجلات الأحداث الأخرى عبر البيئة.
   - تحقق من مصادقة حساب الخدمة إلى أنظمة أخرى.

   ```powershell
   # Check all domain controllers for the anomalous IP
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4624
   } | Where-Object { $_.Properties[18].Value -eq '203.0.113.50' } |
     Select-Object TimeCreated, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[18].Value}}
   ```

## الخطوة 5 - التعافي إلى حالة معروفة الجودة

1. أعد تفعيل حساب الخدمة بكلمة المرور الجديدة:

   ```powershell
   Enable-ADAccount -Identity "svc-app-01"
   ```

2. حدّث تكوين الخدمة بكلمة المرور الجديدة:
   - حدّث كلمة مرور حساب الخدمة في تكوين التطبيق.
   - أعد تشغيل الخدمة للمصادقة ببيانات الاعتماد الجديدة.

3. تحقق من أن الخدمة تعمل:

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4624
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Select-Object -First 5 TimeCreated, @{N='IP';E={$_.Properties[18].Value}}
   ```

4. نفّض ضوابط وقائية:
   - قيّد حساب الخدمة للمصادقة فقط من IPs محددة (عبر جدار الحماية أو قيود تسجيل الدخول في AD).
   - طبّق سياسة تدوير لكلمة مرور حساب الخدمة.
   - فعّل التنبيه لتسجيلات الدخول الشاذة (IP غير عادي، وقت غير عادي).

   ```powershell
   # Restrict logon to specific workstations
   Set-ADUser -Identity "svc-app-01" -LogonWorkstations "DC1,APP-SERVER-01"
   ```

## الخطوة 6 - إنتاج الجدول الزمني للحادث

وثّق الحادث لمراجعة ما بعد الحادث:

| الوقت | الحدث | المصدر |
|---|---|---|
| 02:00 | `svc-app-01` صادق من `203.0.113.50` | حدث الأمان 4624 |
| 02:01 | `svc-app-01` طلب TGT من `203.0.113.50` | حدث الأمان 4768 |
| 02:02 | `svc-app-01` طلب تذكرة خدمة لـ `HOST/APP-SERVER-01` | حدث الأمان 4769 |
| 02:05 | فريق IR اكتشف الشذوذ عبر مراجعة سجلات التدقيق | يدوي |
| 02:10 | الحساب معطّل، الجلسات ملغاة | تدقيق AD |
| 02:15 | إعادة تعيين كلمة المرور، الثبات مزال | تدقيق AD |
| 02:30 | الخدمة أعيد إنشاؤها ببيانات اعتماد جديدة | سجلات الخدمة |

## قائمة التحقق

- [ ] إنشاء حساب الخدمة ومحاكاة تسجيل الدخول الشاذ.
- [ ] اكتشاف الشذوذ عبر مراجعة سجلات التدقيق.
- [ ] تعطيل الحساب وإلغاء الجلسات.
- [ ] إعادة تعيين كلمة المرور وإزالة الثبات.
- [ ] إعادة إنشاء الخدمة ببيانات اعتماد جديدة.
- [ ] تنفيذ ضوابط وقائية.
- [ ] توثيق الجدول الزمني للحادث.

## الأخطاء الشائعة

- **الحذف بدل التعطيل**: حذف الحساب يدمر الأدلة. عطّل أولًا، احذف فقط بعد التحقيق.
- **نسيان الجلسات الموجودة**: تعطيل الحساب لا يلغي التذاكر الموجودة. أعد تعيين كلمة المرور لفرض إعادة المصادقة.
- **فقدان الحركة الجانبية**: المهاجم قد يكون وصل إلى أنظمة أخرى. افحص البيئة بأكملها بحثًا عن IP الشاذ والحساب.
- **عدم حفظ الأدلة**: صدّر السجلات وحالة الحساب قبل إجراء التغييرات. التحقيق يعتمد على الأدلة.
- **تخطي التحقق من التعافي**: بعد إعادة تفعيل الحساب، تحقق من أن الخدمة تعمل. خدمة معطلة هي حادث جديد.

## ما يعلمه هذا المعمل

- الاستجابة للحوادث عملية منظمة: اكتشف، احتوي، استأصل، تعافَ.
- سجلات التدقيق هي آلية الكشف الأساسية: أحداث 4624 و 4768 و 4769 تكشف شذوذ المصادقة.
- الاحتواء فوري: عطّل الحساب واحظر IP قبل التحقيق أكثر.
- الاستئصال شامل: أعد تعيين بيانات الاعتماد، أزل الثبات، افحص عن الحركة الجانبية.
- التعافي موثق: أعد تفعيل الحساب، حدّث الخدمة، وتأكد من الوظيفة.
- التوثيق ضروري: الجدول الزمني للحادث هو المخرج لمراجعة ما بعد الحادث.
