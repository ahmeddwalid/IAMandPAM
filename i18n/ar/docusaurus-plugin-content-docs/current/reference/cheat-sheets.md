---
title: "أوراق المراجعة السريعة (Cheat Sheets)"
description: "مرجع سريع لبروتوكولات SAML وOAuth وOIDC وLDAP وKerberos وFIDO2 ومعايير NIST، بالإضافة إلى أوامر PowerShell الأساسية لمهام IAM."
---

# أوراق المراجعة السريعة (Cheat Sheets)

دليل مرجعي سريع لبنية البروتوكولات وأوامر سطر الأوامر التي يتعامل معها مهندس الهوية يومياً، بالإضافة إلى أوامر PowerShell لإدارة الهويات ومراقبة الأحداث الأمنية. للاطلاع على الشرح المعماري المفصل لكل موضوع، راجع الروابط المرفقة بكل قسم.

## 1. مرجع بروتوكول SAML 2.0 السريع

المسار التفصيلي الكامل متاح في [توثيق بروتوكول SAML](../protocols-iga/02-saml.md). العناصر البرمجية الأساسية في إعداد التكامل:

| العنصر | الوصف التقني والوظيفة |
|---|---|
| **البيانات الوصفية (Metadata)** | مستند XML ينشر معرف الكيان `entityID` ونقاط النهاية وشهادة التوقيع الرقمي لكلا الطرفين (IdP وSP). |
| `AuthnRequest` | طلب مصادقة يوجهه التطبيق (SP) إلى مزود الهوية (IdP) للتحقق من هوية المستخدم. |
| `Response` > `Assertion` | تأكيد الهوية الموقع تشفيرياً الذي يعيده IdP؛ ويتضمن كائن `Subject` والشروط `Conditions` وادعاءات السمات `AttributeStatement`. |
| **رابط ACS URL** | خدمة استهلاك التأكيد (Assertion Consumer Service): نقطة نهاية التطبيق التي تستقبل التأكيد عبر POST. الخطأ الأكثر شيوعاً في التكوين. |
| **معرف الاسم (Name ID)** | معرف المستخدم الأساسي داخل التأكيد، مثل `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`. |
| **التوقيع الرقمي (Signature)** | توقيع تشفيري (XML-DSig) على الاستجابة أو التأكيد؛ ويجب على التطبيق التحقق منه عبر شهادة IdP. |
| **تسجيل الخروج الموحد (SLO)** | بروتوكول لإنهاء جلسة العمل في كلا الطرفين (IdP والتطبيقات التابعة) بالتوازي. |

**قائمة تحقق التكامل السريع:** تطابق تام لـ `entityID`، اعتماد HTTPS لرابط ACS، تطابق صيغة NameID مع ما يطلبه التطبيق، ضبط سماحية انحراف التوقيت (Clock Skew) في نافذة الصلاحية، وتطابق بصمة شهادة التوقيع مع ميتاداتا مزود الهوية.

## 2. مرجع OAuth 2.0 وOpenID Connect (OIDC)

الشرح المفصل: [إطار عمل OAuth 2.0](../protocols-iga/03-oauth2.md) و[بروتوكول OIDC](../protocols-iga/04-oidc.md).

- **الأدوار:** مالك المورد (User)، التطبيق العميل (Client)، خادم التخويل (Authorization Server)، خادم الموارد (Resource Server).
- **نقاط النهاية (Endpoints):** نقطة المصادقة `/authorize`، نقطة الرموز `/token`، نقطة فحص الرمز `/introspect`، ونقطة الإلغاء `/revoke`، بالإضافة إلى نقاط OIDC: `/.well-known/openid-configuration` و`/userinfo`.

**مسار منح رمز التخويل القياسي (The Recommended Code Flow):**

```text
GET /authorize?response_type=code&client_id=webapp&redirect_uri=https%3A%2F%2Fapp.corp%2Fcb&scope=openid%20profile%20email&state=xyz&code_challenge=...&code_challenge_method=S256

POST /token
grant_type=authorization_code&code=...&redirect_uri=...&client_id=...&code_verifier=...
→ { "access_token": "...", "token_type": "Bearer", "expires_in": 3600, "refresh_token": "...", "id_token": "..." }
```

- **أنواع المنح:** رمز التخويل Authorization Code (مع مفتاح PKCE للتطبيقات العامة)، بيانات اعتماد العميل Client Credentials (بين الأنظمة)، وتدفق الأجهزة Device Code.
- **أنواع الرموز:** رمز الوصول Access Token (قصير الأجل يُرسل إلى API)، رمز التحديث Refresh Token (طويل الأجل في القناة الخلفية فقط)، ورمز التعريف ID Token (خاص بـ OIDC، بتنسيق JWT يحمل ادعاءات الهوية).
- **ادعاءات OIDC الأساسية:** `sub` (المعرف الفريد للمستخدم، وليس البريد)، `aud` (معرف التطبيق المستهدف)، `exp` (تاريخ الانتهاء)، `iss` (جهة الإصدار)، و`nonce` (لمنع هجمات إعادة الإرسال).

## 3. مرجع بروتوكول LDAP السريع

المسار التفصيلي الكامل متاح في [توثيق LDAP](../protocols-iga/01-ldap.md).

- **المنافذ القياسية:** منفذ 389 (LDAP غير مشفر)، منفذ 636 (LDAPS مشفر بـ TLS)، ومنافذ الفهرس الشامل (Global Catalog) 3268 و3269.
- **الأسماء المميزة (Distinguished Names - DN):** مسار هرمي يبدأ من الطرف الأدنى صعوداً إلى الجذر:
```ldap
cn=jsmith,ou=Employees,ou=People,dc=corp,dc=local
```

**صيغة مرشحات البحث (Search Filter Syntax - RFC 4515):**

| مرشح البحث | الوظيفة التقنية |
|---|---|
| `(cn=jsmith)` | مطابقة تامة (Equality) |
| `(cn=js*)` | مطابقة جزئية بالبادئة (Substring) |
| `(&(objectClass=user)(mail=*@corp.local))` | عملية AND المنطقية |
| `(\|(objectClass=user)(objectClass=contact))` | عملية OR المنطقية |
| `(!(userAccountControl:1.2.840.113556.1.4.803:=2))` | استعلام NOT مع مطابقة البتات الثنائية (استبعاد الحسابات المعطلة في AD) |
| `(memberOf:1.2.840.113556.1.4.1941:=cn=VPN Users,ou=Groups,dc=corp,dc=local)` | استعلام العضوية الهرمية المتداخلة في المجموعات (Recursive Membership) |

## 4. أوامر PowerShell لمهام إدارة الهوية (IAM)

الأوامر التنفيذية اليومية لإدارة Active Directory وMicrosoft Entra ID:

```powershell
# الاستعلام عن المستخدم ومجموعاته وتاريخ آخر تسجيل دخول
Get-ADUser -Identity jsmith -Properties memberOf, lastLogonTimestamp
Get-ADUser -Filter "Enabled -eq '$true'" -SearchBase "OU=People,DC=corp,DC=local"

# إنشاء مستخدم جديد بحالة معطلة ثم تعيين كلمة المرور والتفعيل
$secure = ConvertTo-SecureString "Temporary-Passw0rd!" -AsPlainText -Force
New-ADUser -Name "Jane Smith" -SamAccountName jsmith -UserPrincipalName "jsmith@corp.local" `
  -GivenName "Jane" -Surname "Smith" -Path "OU=People,DC=corp,DC=local" `
  -AccountPassword $secure -Enabled $false
Set-ADAccountPassword -Identity jsmith -NewPassword $secure -Reset
Enable-ADAccount -Identity jsmith

# إدارة وتعديل عضوية المجموعات
Add-ADGroupMember -Identity "VPN Users" -Members jsmith
Remove-ADGroupMember -Identity "VPN Users" -Members jsmith
Get-ADGroupMember -Identity "Domain Admins" | Select-Object SamAccountName

# حوكمة دورة الحياة والتدقيق الأمني
Disable-ADAccount -Identity jsmith
Unlock-ADAccount -Identity jsmith
Search-ADAccount -AccountDisabled | Select-Object Name, SamAccountName
Get-ADGroup -Filter 'name -like "*admin*"' | Select-Object Name, DistinguishedName
Move-ADObject -Identity "CN=jsmith,OU=People,DC=corp,DC=local" -TargetPath "OU=Leavers,DC=corp,DC=local"

# كشف وتدقيق الحسابات الإدارية المتداخلة عبر النطاق بالكامل
$adminGroups = Get-ADGroup -Filter 'name -like "*admins*"' | Select-Object -ExpandProperty DistinguishedName
$adminGroups | ForEach-Object { Get-ADGroupMember -Identity $_ -Recursive } |
  Select-Object -Unique SamAccountName
```

```powershell
# إدارة سحابة Entra ID عبر Microsoft Graph PowerShell
Connect-MgGraph -Scopes "User.Read.All","Group.Read.All","RoleManagement.Read.Directory"
Get-MgUser -UserId "jsmith@corp.local" | Select-Object Id, UserPrincipalName, CreatedDateTime
Get-MgUserMemberOf -UserId "jsmith@corp.local"
Get-MgDirectoryRole | Select-Object DisplayName, Id
```

**الأمر الحاسم لكشف تسرب الصلاحيات الدائمة:**
```powershell
Get-ADGroupMember -Identity "Domain Admins" -Recursive | Select-Object -ExpandProperty SamAccountName
```
إذا كانت النتيجة تحتوي على أكثر من 3 أسماء، فإن برنامج [أساسيات إدارة الوصول المميز (PAM)](../pam-core/01-what-is-pam.md) يمثل أولوية عاجلة لمنشأتك.

## 5. مرجع بروتوكول Kerberos السريع

المسار التفصيلي الكامل متاح في [توثيق كيربيروس](../protocols-iga/08-kerberos.md).

- **المنافذ:** منفذ 88 (KDC عبر TCP/UDP)، منفذ 464 (تغيير كلمة المرور).
- **القيم الافتراضية في AD:** صلاحية تذكرة TGT هي 10 ساعات، مهلة التجديد 7 أيام، وانحراف التوقيت المسموح به 5 دقائق.
- **أوامر العميل الأساسية:**
```powershell
klist          # عرض التذاكر المخزنة مؤقتاً وفحص تواريخ الصلاحية
klist purge    # مسح ذاكرة التذاكر (الحل الفوري عند تغيير كلمة المرور)
kinit user@CORP.LOCAL   # طلب تذكرة TGT جديدة في بيئات Linux/macOS
klist -li 0x3e7   # فحص تذاكر جلسة حساب النظام Local System (لحسابات الخدمات)
```

**معرفات أحداث الأمان في Windows لمراقبة كيربيروس والهويات:**

| معرف الحدث (Event ID) | المعنى والدلالة الأمنية |
|---|---|
| **4768** | إصدار تذكرة TGT (نجاح AS-REQ). راقب الإصدار في غير أوقات العمل أو لحسابات الخدمات. |
| **4769** | إصدار تذكرة خدمة (نجاح TGS-REQ). الارتفاع المفاجئ لحساب واحد مؤشر على هجوم **Kerberoasting**. |
| **4624 / 4625** | نجاح / فشل تسجيل الدخول. تكرار فشل 4625 لحسابات متعددة مؤشر على هجوم رش كلمات المرور. |
| **4742 / 4738** | تعديل حساب جهاز أو مستخدم. تعديل حساب `KRBTGT` أو حسابات الخدمة حدث حرج من الفئة Tier 0. |
| **4662** | الوصول لكائنات الدليل؛ ظهور نمط استدعاء DRSUAPI مؤشر على هجوم **DCSync**. |
| **4771** | فشل المصادقة المسبقة في كيربيروس؛ يتكرر عند حدوث انحراف في التوقيت الزمني. |

## 6. مرجع FIDO2 ومفاتيح المرور (Passkeys)

التفاصيل في [دليل المصادقة دون كلمات مرور](../fundamentals/08-passwordless.md).

- **WebAuthn:** واجهة برمجة تطبيقات المتصفح للتسجيل وتسجيل الدخول عبر أزواج المفاتيح العامة.
- **CTAP2:** بروتوكول الاتصال بين المتصفح ومفتاح الأمان الخارجي (عبر USB أو NFC أو BLE).
- **الطرف المعتمد (Relying Party - RP):** خادم التطبيق أو مزود الهوية الذي يطرح التحدي ويتحقق من صحة التوقيع.
- **إثبات الحيازة (Assertion):** توقيع تشفيري ينتجه المفتاح فوق التحدي ورابط النطاق الأصلي (Origin)، يثبت حيازة المفتاح الخاص دون تسريب أي أسرار.
- **مستويات ضمان المصادقة (NIST SP 800-63-4 AAL):**
  - **AAL1:** عامل أحادي (كلمة مرور أو OTP).
  - **AAL2:** عاملان ثنائيان مع إتاحة خيار مقاوم للتصيد (مفاتيح المرور المتزامنة مؤهلة هنا).
  - **AAL3:** مفتاح أمان عتادي بمفتاح غير قابل للتصدير (مفاتيح المرور السحابية المتزامنة مستبعدة من هذا المستوى).

## 7. مصفوفة هجمات الهوية وضوابط الدفاع

التفاصيل المعمارية في [صفحة الهجمات والدفاع](../pam-core/08-attack-defense.md).

| الهجوم | إشارة الرصد والإنذار (Detection Signal) | خط الدفاع الهندسي الأساسي |
|---|---|---|
| **رش كلمات المرور (Password Spray)** | تراكم الأحداث 4625 لحسابات متعددة في أوقات متقاربة. | تفعيل MFA الإلزامي، حظر كلمات المرور الشائعة، والمصادقة التكيفية القائمة على المخاطر. |
| **Kerberoasting** | كثافة طلبات التذاكر في الحدث 4769 لحسابات خدمات؛ وطلب تذاكر بتشفير RC4. | كلمات مرور معقدة (+25 حرفاً) لحسابات الخدمات، التدوير الدوري، وإلزام تشفير AES وحظر RC4. |
| **التذكرة الذهبية / الفضية** | تذاكر TGT أو تذاكر خدمات بمدد صلاحية غير طبيعية تفوق 10 ساعات. | حماية حساب `KRBTGT` كفئة Tier 0، تدوير مفتاحه مرتين سنوياً وعند الاشتباه. |
| **تمرير التجزئة / التذكرة (PtH / PtT)** | حركة اتصالات NTLM في بيئات يفترض خلوها منه؛ وتكرار حقن التذاكر. | تعطيل NTLM نهائياً، تفعيل Credential Guard، تقصير عمر التذاكر، وحظر التفويض غير المقيد. |
| **هجوم DCSync** | ظهور الحدث 4662 مع كود مزامنة DRSUAPI صادر من حاسوب ليس وحدة تحكم. | حصر صلاحيات مسؤولي النطاق على وحدات التحكم، ومراقبة واجهات DRSUAPI لحظياً. |
| **إجهاد المصادقة (MFA Fatigue)** | تكرار رفض إشعارات الدخول يليه قبول مفاجئ في أوقات متأخرة. | فرض مطابقة الأرقام (Number Matching)، تقييد معدل الإشعارات، وطلب التحقق الإضافي. |
| **التصيد الوسيط (AiTM Phishing)** | استخدام جلسة مسجلة من عنوان IP مختلف عن موقع المصادقة الأصلي. | فرض المصادقة المقاومة للتصيد عبر FIDO2، ومراقبة استقرار الجلسات عبر تقييم الوصول المستمر (CAEP). |
| **الاعتمادات الخفية (Shadow Credentials)** | تعديلات على السمة `msDS-KeyCredentialLink` في كائنات الدليل. | مراقبة عمليات الكتابة على سمات كائنات Active Directory وتقييد صلاحيات التعديل. |
