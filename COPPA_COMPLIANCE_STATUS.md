# COPPA Compliance Implementation Status

## Overview
This document tracks the implementation of COPPA (Children's Online Privacy Protection Act) compliance for MotivTrack.

**COPPA Deadline:** April 22, 2026
**Current Status:** In Progress

---

## ✅ Completed

### 1. Database Schema Updates
- **User Model:**
  - Added `tosAcceptedAt` (DateTime?) - Timestamp when user accepted Terms of Service
  - Added `privacyPolicyAcceptedAt` (DateTime?) - Timestamp when user accepted Privacy Policy
  
- **ChildProfile Model:**
  - Added `coppaConsentGivenAt` (DateTime?) - Timestamp when parent gave COPPA consent for child under 13

- **Migration:** `20260319205026_add_legal_consent_fields` applied successfully

### 2. Age Validation
- Added mandatory age field validation in onboarding Step 1
- Age must be between 1-18
- Clear error message for COPPA compliance requirement

---

## 🚧 In Progress / To Do

### 1. Registration Flow Updates
**Priority: HIGH**
- [ ] Add Terms of Service checkbox to registration form
- [ ] Add Privacy Policy checkbox to registration form
- [ ] Add "I am 18+ years old" checkbox
- [ ] Update auth service to save consent timestamps
- [ ] Prevent registration without consent checkboxes

**Files to modify:**
- `frontend/src/pages/Login.jsx` (registration form)
- `backend/src/services/auth.service.ts` (save consent timestamps)
- `backend/src/api/controllers/auth.controller.ts`

### 2. Onboarding Flow Updates
**Priority: HIGH**
- [ ] Add conditional COPPA consent in Step 1 (after age entry)
- [ ] Show COPPA notice if child is under 13
- [ ] Require explicit checkbox consent for COPPA
- [ ] Update child profile service to save COPPA consent timestamp
- [ ] Prevent profile creation without COPPA consent (for under-13)

**COPPA Notice Content Needed:**
```
Your child is under 13 years old. Federal law (COPPA) requires us to obtain 
your consent before collecting personal information from children under 13.

We collect the following information from your child:
- Name
- Age
- Grade level
- School name
- Task completion data
- Points and rewards earned

We use this information to:
- Provide the MotivTrack service
- Track task completion and rewards
- Generate progress reports

We do NOT:
- Sell or share your child's information with third parties
- Use information for advertising
- Collect more information than necessary for the service

☐ I consent to MotivTrack collecting and using my child's information as described above
```

**Files to modify:**
- `frontend/src/pages/ParentOnboarding.jsx` (Step 1 component)
- `backend/src/services/childProfile.service.ts` (save COPPA consent)

### 3. Legal Documents
**Priority: HIGH - Required before launch**
- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Draft COPPA Notice/Disclosure
- [ ] Create `/legal/terms` page
- [ ] Create `/legal/privacy` page
- [ ] Create `/legal/coppa` page

**Key sections needed in Privacy Policy:**
- What information we collect from children
- How we use children's information
- How we protect children's information
- Parental rights (access, delete, revoke consent)
- Contact information for privacy questions

### 4. Parental Rights Implementation
**Priority: MEDIUM**
- [ ] Add "View my child's data" feature
- [ ] Add "Delete my child's data" feature
- [ ] Add "Revoke COPPA consent" feature (archives child profile)
- [ ] Add "Export my child's data" feature (CCPA requirement)

### 5. Backend API Updates
**Priority: HIGH**
- [ ] Update registration endpoint to accept and save consent
- [ ] Update child profile creation to handle COPPA consent
- [ ] Add validation to prevent operations without proper consent
- [ ] Add API endpoint to revoke consent

---

## 📋 COPPA Compliance Checklist

### Notice Requirements
- [ ] Clear notice of information collection practices
- [ ] Notice provided before collecting child information
- [ ] Notice includes: what info collected, how used, disclosure practices

### Parental Consent
- [ ] Obtain verifiable parental consent before collecting child info
- [ ] Consent mechanism is clear and conspicuous
- [ ] Consent timestamp recorded in database

### Parental Rights
- [ ] Parents can review child's personal information
- [ ] Parents can request deletion of child's information
- [ ] Parents can revoke consent (stops further collection)

### Data Protection
- [ ] Reasonable security measures for child data
- [ ] Retain child data only as long as necessary
- [ ] No conditioning participation on unnecessary data collection

### Ongoing Compliance
- [ ] Privacy policy easily accessible
- [ ] Contact information for privacy questions
- [ ] Process for handling parental requests

---

## 🎯 Next Steps (Priority Order)

1. **Create Legal Documents** (can be done in parallel with dev work)
   - Draft Terms of Service
   - Draft Privacy Policy
   - Draft COPPA Notice

2. **Update Registration Flow**
   - Add consent checkboxes
   - Save consent timestamps
   - Block registration without consent

3. **Update Onboarding Step 1**
   - Add conditional COPPA consent UI
   - Implement consent logic
   - Save COPPA consent timestamp

4. **Create Legal Pages**
   - `/legal/terms`
   - `/legal/privacy`
   - `/legal/coppa`

5. **Implement Parental Rights Features**
   - View data
   - Delete data
   - Revoke consent
   - Export data

6. **Testing**
   - Test full registration → onboarding flow
   - Test under-13 vs 13+ paths
   - Test consent revocation
   - Test data deletion

---

## 📝 Notes

- All consent must be obtained BEFORE collecting personal information
- COPPA applies to children under 13
- Parents must be able to review and delete child data at any time
- Consent can be revoked at any time
- We must not condition service on collecting more info than necessary

---

## 🔗 Resources

- [COPPA Rule](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)
- [FTC COPPA FAQs](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [COPPA Compliance Checklist](https://www.ftc.gov/tips-advice/business-center/guidance/childrens-online-privacy-protection-rule-six-step-compliance)
