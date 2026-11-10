---
title: معمل 15 - أتمتة تزويد SCIM
description: "بناء عميل SCIM 2.0 بلغة Python يزوّد المستخدمين إلى تطبيق مستهدف، يدير عضوية المجموعات، ويعالج أحداث إلغاء التزويد. يشمل معالجة الأخطاء، والتكرارية، وخط أنابيب واقعي من HR إلى SaaS."
---

# معمل 15 - أتمتة تزويد SCIM

## ماذا يثبت هذا المعمل

SCIM (نظام إدارة الهوية عبر النطاقات) هو البروتوكول الذي ينقل بيانات الهوية بين الأنظمة: HR ينشئ مستخدمًا، ومزوّد الهوية يزوّده إلى كل تطبيق SaaS متصل، وعندما ينهي HR الموظف، إلغاء تزويد SCIM يلغي الوصول في كل مكان. هذا المعمل يبني عميل SCIM 2.0 عامل بلغة Python يزوّد المستخدمين، ويدير عضوية المجموعات، ويعالج إلغاء التزويد. العميل يتحدث SCIM حقيقيًا: يكتشف تكوين مزوّد الخدمة، ينشئ المستخدمين بمخططات صحيحة، يعين الخصائص، ويعالج استجابات الخطأ.

## البنية المعمارية

import Drawio from '@site/src/components/Drawio';
import scimProv from '!!raw-loader!@site/static/diagrams/lab-15-scim-provisioning.drawio';

<Drawio content={scimProv} />

[تحميل / تعديل هذا المخطط](/diagrams/lab-15-scim-provisioning.drawio)

التدفق: نظام HR (أو تصدير CSV) يطلق حدث تزويد (الخطوة 1)، عميل SCIM يرسل POST إلى نقطة نهاية `/Users` لمزوّد الخدمة (الخطوة 2)، مزوّد الخدمة ينشئ المستخدم ويعيد 201 مع معرف SCIM للمستخدم (الخطوة 3)، العميل يخزن التعيين بين معرف HR ومعرف SCIM (الخطوة 4)، وعند الإنهاء العميل يرسل PATCH لتعطيل المستخدم (الخطوة 5).

## المتطلبات الأساسية

- Python 3.10+ مع تثبيت `requests` (`pip install requests`).
- مزوّد خدمة SCIM. لهذا المعمل، استخدم خادم SCIM وهمي (مثل [scim-server](https://github.com/CleverTap/scim-server) أو تطبيق Flask بسيط) أو نقطة نهاية SCIM حقيقية من تجربة مزوّد هوية (Okta، Entra ID، أو Keycloak مع امتداد SCIM).
- مصدر بيانات المستخدمين: ملف CSV بأعمدة `employee_id, first_name, last_name, email, department, job_title, manager_id`.

## الخطوة 1 - اكتشاف تكوين مزوّد الخدمة

SCIM 2.0 يتطلب من العميل اكتشاف قدرات مزوّد الخدمة قبل إجراء الطلبات. نقطة الاكتشاف هي `/.well-known/scim-configuration` أو `/ServiceProviderConfig`.

```python
import requests

SCIM_BASE = "https://scim.example.com/v2"

def discover_service_provider(base_url):
    resp = requests.get(f"{base_url}/ServiceProviderConfig")
    resp.raise_for_status()
    config = resp.json()
    print(f"PATCH supported: {config['patch']['supported']}")
    print(f"Bulk supported: {config['bulk']['supported']}")
    print(f"Filter supported: {config['filter']['supported']}")
    return config

config = discover_service_provider(SCIM_BASE)
```

التكوين يخبر العميل بالعمليات المدعومة (PATCH، bulk، filter)، وطريقة المصادقة المستخدمة، والمخططات المتاحة.

## الخطوة 2 - إنشاء مستخدم

إنشاء مستخدم SCIM هو POST إلى `/Users` مع جسم JSON يحتوي على خصائص المستخدم. المخطط الأساسي هو `urn:ietf:params:scim:schemas:core:2.0:User`.

```python
def create_user(base_url, user_data):
    payload = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "externalId": user_data["employee_id"],
        "userName": user_data["email"],
        "name": {
            "givenName": user_data["first_name"],
            "familyName": user_data["last_name"],
        },
        "emails": [
            {
                "value": user_data["email"],
                "type": "work",
                "primary": True,
            }
        ],
        "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
            "department": user_data["department"],
            "manager": {"value": user_data["manager_id"]},
        },
    }
    resp = requests.post(
        f"{base_url}/Users",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 201:
        scim_user = resp.json()
        print(f"Created user: {scim_user['id']}")
        return scim_user
    else:
        print(f"Error: {resp.status_code} {resp.json()}")
        return None

user = create_user(SCIM_BASE, {
    "employee_id": "E1001",
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice.smith@example.com",
    "department": "Engineering",
    "job_title": "Software Engineer",
    "manager_id": "E1000",
})
```

`externalId` هو معرف الموظف في نظام HR. مزوّد الخدمة يخزنه ويستخدمه للتكرارية: إذا أرسل العميل نفس `externalId` مرتين، مزوّد الخدمة يعيد المستخدم الموجود بدلًا من إنشاء نسخة مكررة.

## الخطوة 3 - تعيين الخصائص ومعالجة الأخطاء

استجابات خطأ SCIM تتبع RFC 7644 القسم 3.12. الاستجابة تحتوي على `scimType` يصنف الخطأ.

```python
def handle_scim_error(response):
    error = response.json()
    scim_type = error.get("scimType", "unknown")
    detail = error.get("detail", "No detail provided")
    
    error_map = {
        "invalidSyntax": "Malformed request body",
        "invalidValue": "Invalid attribute value",
        "uniqueness": "Attribute value already exists",
        "mutability": "Attribute cannot be modified",
        "noTarget": "Target resource not found",
        "tooMany": "Too many results for filter",
    }
    
    description = error_map.get(scim_type, "Unknown error")
    print(f"SCIM Error ({scim_type}): {description} - {detail}")
    return scim_type

# Example: handle a uniqueness conflict
resp = requests.post(f"{SCIM_BASE}/Users", json=payload)
if resp.status_code == 400:
    scim_type = handle_scim_error(resp)
    if scim_type == "uniqueness":
        # User already exists, fetch by externalId
        resp = requests.get(
            f"{SCIM_BASE}/Users?filter=externalId eq '{user_data['employee_id']}'"
        )
        existing = resp.json()["Resources"][0]
        print(f"User already exists: {existing['id']}")
```

## الخطوة 4 - إدارة عضوية المجموعات

مجموعات SCIM هي موارد مع مصفوفة `members`. لإضافة مستخدم إلى مجموعة، PATCH مورد المجموعة.

```python
def add_user_to_group(base_url, group_id, user_id):
    payload = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [
            {
                "op": "add",
                "path": "members",
                "value": [{"value": user_id}],
            }
        ],
    }
    resp = requests.patch(
        f"{base_url}/Groups/{group_id}",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 200:
        print(f"Added user {user_id} to group {group_id}")
    else:
        handle_scim_error(resp)

def remove_user_from_group(base_url, group_id, user_id):
    payload = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [
            {
                "op": "remove",
                "path": "members",
                "value": [{"value": user_id}],
            }
        ],
    }
    resp = requests.patch(
        f"{base_url}/Groups/{group_id}",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 200:
        print(f"Removed user {user_id} from group {group_id}")
    else:
        handle_scim_error(resp)
```

## الخطوة 5 - إلغاء تزويد مستخدم

إلغاء التزويد هو PATCH يعيّن `active` إلى `false`. مورد المستخدم لا يُحذف؛ يتم تعطيله. هذا يحافظ على سجل التدقيق بينما يلغي الوصول.

```python
def deactivate_user(base_url, user_id):
    payload = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [
            {
                "op": "replace",
                "path": "active",
                "value": False,
            }
        ],
    }
    resp = requests.patch(
        f"{base_url}/Users/{user_id}",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 200:
        print(f"Deactivated user {user_id}")
    else:
        handle_scim_error(resp)

def delete_user(base_url, user_id):
    resp = requests.delete(f"{base_url}/Users/{user_id}")
    if resp.status_code == 204:
        print(f"Deleted user {user_id}")
    else:
        handle_scim_error(resp)
```

## الخطوة 6 - بناء خط الأنابيب الكامل

اجمع الخطوات في خط أنابيب تزويد يقرأ من CSV ويزوّد إلى SCIM.

```python
import csv
import json

def provision_from_csv(csv_path, scim_base):
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Check if user already exists
            resp = requests.get(
                f"{scim_base}/Users",
                params={"filter": f"externalId eq '{row['employee_id']}'"},
            )
            users = resp.json().get("Resources", [])
            
            if users:
                scim_user = users[0]
                print(f"User {row['email']} already exists: {scim_user['id']}")
            else:
                scim_user = create_user(scim_base, row)
                if scim_user is None:
                    continue
            
            # Store the mapping
            mapping = {
                "employee_id": row["employee_id"],
                "scim_id": scim_user["id"],
                "email": row["email"],
            }
            with open("provisioned_users.json", "a") as out:
                out.write(json.dumps(mapping) + "\n")

provision_from_csv("hr_export.csv", SCIM_BASE)
```

## الخطوة 7 - معالجة أحداث إلغاء التزويد

عندما ينهي HR موظفًا، يجب على خط الأنابيب تعطيل المستخدم في كل تطبيق متصل.

```python
def deprovision_user(employee_id, scim_base):
    # Find the user by externalId
    resp = requests.get(
        f"{scim_base}/Users",
        params={"filter": f"externalId eq '{employee_id}'"},
    )
    users = resp.json().get("Resources", [])
    
    if not users:
        print(f"User {employee_id} not found in SCIM")
        return
    
    scim_user = users[0]
    user_id = scim_user["id"]
    
    # Deactivate the user
    deactivate_user(scim_base, user_id)
    
    # Remove from all groups
    resp = requests.get(
        f"{scim_base}/Groups",
        params={"filter": f"members.value eq '{user_id}'"},
    )
    groups = resp.json().get("Resources", [])
    for group in groups:
        remove_user_from_group(scim_base, group["id"], user_id)
    
    print(f"Deprovisioned user {employee_id} (SCIM ID: {user_id})")

deprovision_user("E1001", SCIM_BASE)
```

## قائمة التحقق

- [ ] اكتشاف تكوين مزوّد الخدمة بنجاح.
- [ ] إنشاء مستخدم بمخطط SCIM صحيح و externalId.
- [ ] معالجة الإنشاء المكرر عبر البحث بـ externalId.
- [ ] إضافة مستخدم إلى مجموعة وإزالته عبر PATCH.
- [ ] تعطيل مستخدم (وليس حذفه) عند الإنهاء.
- [ ] تحليل استجابات الخطأ مع معالجة scimType.
- [ ] تشغيل خط أنابيب CSV إلى SCIM كامل من البداية للنهاية.

## الأخطاء الشائعة

- **فقدان externalId**: بدون `externalId`، لا يمكن لمزوّد الخدمة إزالة التكرار. عيّنه دائمًا إلى المعرف الفريد في النظام المصدر.
- **عدم تطابق المخطط**: قد يتطلب مزوّد الخدمة خصائص محددة أو يرفض الخصائص غير المعروفة. تحقق من مخطط مزوّد الخدمة قبل الإرسال.
- **PATCH مقابل PUT**: SCIM يدعم كلاً من PATCH (تحديث جزئي) و PUT (استبدال كامل). PATCH أكثر أمانًا للتحديثات؛ PUT يستبدل المورد بالكامل.
- **انحراف عضوية المجموعات**: إذا تباعد النظام المصدر وعضوية مجموعة SCIM، قد يزيل المزامنة التالية الوصول المشروع. استخدم استراتيجية مصالحة، وليس مجرد دفع أحادي الاتجاه.
- **تحديد المعدل**: نقاط نهاية SCIM غالبًا ما لها حدود معدل. طبق التراجع الأسي لاستجابات 429.

## ما يعلمه هذا المعمل

- SCIM هو الصلة بين أنظمة HR وتطبيقات SaaS: يوحد مخطط المستخدم، والعمليات، وتنسيق الخطأ.
- التكرارية مبنية في البروتوكول: `externalId` يمنع الإنشاء المكرر، وعمليات PATCH بطبيعتها تكرارية.
- إلغاء التزويد هو تغيير حالة، وليس حذفًا: `active=false` يحافظ على سجل التدقيق بينما يلغي الوصول.
- معالجة الأخطاء موحدة: فئات `scimType` تتيح للعميل التعامل برمجيًا مع أنماط الفشل المختلفة.
- عضوية المجموعات هي مورد SCIM من الدرجة الأولى: تُدار عبر عمليات PATCH على المجموعة، وليس على المستخدم.
