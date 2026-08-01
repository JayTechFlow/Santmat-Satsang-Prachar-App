---
# Cover Page
**Project Name**: Santmat Satsang Prachar
**Project Version**: 1.0
**Document Type**: Client Requirement Document (CRD)
**Prepared Date**: 01-August-2026
**Revision**: 1.0
---

# 1. Project Introduction
यह दस्तावेज़ "Santmat Satsang Prachar" मोबाइल ऐप के लिए एक Professional UI Description है। इसका उद्देश्य डेवलपर को स्पष्ट UI और कार्यात्मक निर्देश प्रदान करना है।

# 2. Project Objective
ऐप का मुख्य उद्देश्य उपयोगकर्ताओं को भजन, स्तुति-विनती, प्रेरणादायक Quote, और आज का सुविचार उपलब्ध कराना है। यह एक Spiritual ऐप है जो Senior Citizens के लिए भी उपयोग में आसान होगा।

# 3. Target Users
- सामान्य उपयोगकर्ता / श्रोता (जो भजन और स्तुति सुनना चाहते हैं)
- Senior Citizens (वरिष्ठ नागरिक)
- Admin (जो ऐप में सामग्री अपलोड और प्रबंधित करेंगे)

# 4. Application Overview
यह एक Audio Streaming मोबाइल एप्लिकेशन है जिसमें भजनों और स्तुतियों की सूची, Audio Player, Search, Notifications, और Profile जैसी सुविधाएं होंगी। इसमें Background Play और Firebase Notifications की सुविधा भी होगी।

# 5. Complete Mobile Application Requirements

## 5.1 Home Screen
**Purpose**
यह ऐप का मुख्य पेज होगा।

**Features & UI Elements**
- App Logo
- App Name (संतमत सत्संग प्रचार)
- Search Bar
- Notification Icon
- Home Banner Image
- Share Button (Banner पर)
- "आज का सुविचार" Button (Banner के नीचे)
- Audio Card
- स्तुति-विनती Card
- प्रेरणादायक Quote
- Latest Bhajan List
- Bottom Navigation Bar

**Navigation**
- Home
- Audio
- स्तुति-विनती
- Notifications
- Profile

---

## 5.2 Audio Screen
**Purpose**
सभी भजनों की सूची।

**Features & UI Elements**
- Search Icon
- Bhajan Thumbnail
- Title
- Duration
- Play Button
- Mini Player Bottom
- Scrollable Audio List

**User Interaction & Expected Behaviour**
- User can tap any audio to open Audio Player.

---

## 5.3 Audio Player Screen
**Purpose**
भजन सुनने के लिए।

**Features & UI Elements**
- Large Thumbnail
- Bhajan Title
- Singer Name
- Play / Pause
- Previous
- Next
- Progress Bar
- Shuffle
- Repeat
- Favorite
- Share

**Expected Behaviour**
- Background Play
- Auto Play Next Audio
- No Download Button

**Below Player**
- Up Next
- Related Bhajans list

---

## 5.4 स्तुति-विनती Screen
**Purpose**
Morning and Evening Stuti.

**Features & UI Elements**
Two Cards:
- ☀️ प्रातःकालीन स्तुति
- 🌙 संध्याकालीन स्तुति

**Each Card contains:**
- Thumbnail
- Play Button
- Audio Wave Animation
- Favorite
- Share
- Description

**Expected Behaviour / User Interaction**
- Clicking Play starts audio immediately.
- No separate list.

---

## 5.5 Notifications Screen
**Purpose**
Show latest updates.

**Features & UI Elements**
- Notification Categories: सभी, Updates, विशेष
- Unread Notification Dot

**Display Rules**
- Latest notification on top.

**Examples of Notifications**
- नया भजन
- आज का विचार
- स्तुति-विनती अपडेट
- विशेष सूचना

---

## 5.6 Search Screen
**Purpose**
Search all content.

**Search Includes**
- Bhajan Title
- Singer Name
- Keywords

**Display Rules (Show)**
- Recent Searches
- Popular Searches

**User Interaction & Expected Behaviour**
- Tap result → Open directly.

---

## 5.7 Profile Screen
**Purpose**
User Profile.

**Features & UI Elements**
- Profile Photo
- Name
- Mobile Number
- Email

**Options / Lists**
- Personal Information
- Favorite Bhajans
- Listening History
- Notification Settings
- Language
- About App
- Logout

---

# 6. Theme Requirements
**Colors**
- Primary Color: Saffron (#E67E22)
- Background: Cream / White

**Style / UI**
- Modern
- Minimal
- Spiritual
- Rounded UI
- Soft Shadow

**Senior Citizen Friendly Requirements**
- Easy for Senior Citizens

---

# 7. Admin Panel Requirements
Admin can:
- Upload Audio
- Upload Thumbnail
- Enter Audio Title
- Edit Audio
- Delete Audio
- Upload Today's Thought Image
- Send Notifications

---

# 8. Functional Requirements
- **FR-001**: ऐप में Audio Streaming की सुविधा होनी चाहिए (Audio Streaming Only)।
- **FR-002**: ऐप में Background Play की सुविधा होनी चाहिए।
- **FR-003**: Firebase Notification का एकीकरण होना चाहिए।
- **FR-004**: Firebase Storage का उपयोग किया जाना चाहिए।
- **FR-005**: Share Banner की सुविधा होनी चाहिए।
- **FR-006**: Home Screen पर "आज का सुविचार" Button होना चाहिए।
- **FR-007**: Audio Screen पर Scrollable Audio List होनी चाहिए और किसी भी ऑडियो पर टैप करने से Audio Player खुलना चाहिए।
- **FR-008**: Audio Player में Play/Pause, Previous, Next, Shuffle, Repeat, Progress Bar और Favorite के विकल्प होने चाहिए।
- **FR-009**: Audio Player में Auto Play Next Audio की सुविधा होनी चाहिए।
- **FR-010**: स्तुति-विनती Screen पर "Clicking Play starts audio immediately" की कार्यक्षमता होनी चाहिए।
- **FR-011**: Notifications में Unread Notification Dot होना चाहिए और Latest notification सबसे ऊपर होना चाहिए।
- **FR-012**: Search Screen से Search result पर टैप करने पर परिणाम को सीधे खुलना चाहिए (Open directly)।
- **FR-013**: Admin Panel के माध्यम से Audio Upload, Edit, Delete और Thumbnail/Title दर्ज करने की सुविधा होनी चाहिए।
- **FR-014**: Admin Panel से Today's Thought Image अपलोड करने और Notifications भेजने की सुविधा होनी चाहिए।

---

# 9. UI Requirements
- UI Design पूरी तरह से Client द्वारा प्रदान किए गए डिज़ाइन के अनुसार होना चाहिए।
- ऐप को Responsive और Lightweight होना चाहिए।
- Smooth performance के लिए ऐप Optimized होना चाहिए।
- Theme Saffron (#E67E22) और Cream / White Background पर आधारित होना चाहिए।
- UI में Modern, Minimal, Rounded UI और Soft Shadow का उपयोग होना चाहिए।
- Home Screen पर App Logo और App Name होना चाहिए।
- Bottom Navigation Bar सभी मुख्य स्क्रीन्स पर उपलब्ध होना चाहिए।

---

# 10. Navigation Requirements
Bottom Navigation Bar के माध्यम से मुख्य Navigation होगा:
- Home
- Audio
- स्तुति-विनती
- Notifications
- Profile

अन्य Navigation:
- Audio Screen से किसी Audio पर टैप करने पर Audio Player Screen खुलेगा।
- Search Screen पर रिज़ल्ट पर टैप करने पर सीधे वह सामग्री खुलेगी।

---

# 11. Restrictions
- No Download Option / No Download Button (ऑडियो डाउनलोड करने की कोई सुविधा नहीं होगी)।
- केवल Audio Streaming उपलब्ध होगी (Audio Streaming Only)।
- Future Ready Architecture का पालन करना अनिवार्य है।

---

# 12. Developer Notes
- "The UI design provided by the client should be followed as closely as possible. Any functional changes should be discussed with the client before implementation. The application should be responsive, lightweight, and optimized for smooth performance."
- "प्रवीण जी, अब आपके पास लगभग पूरा प्रोजेक्ट तैयार है। इस दस्तावेज़, सभी UI स्क्रीन और SRS के आधार पर डेवलपर बिना किसी भ्रम के ऐप बनाना शुरू कर सकता है।"

---

# 13. Scope
**In Scope**:
- Home Screen, Audio Screen, Audio Player, स्तुति-विनती Screen, Notifications Screen, Search Screen, Profile Screen का विकास।
- Audio Streaming, Background Play।
- Firebase Notification और Firebase Storage का एकीकरण।
- Admin Panel के माध्यम से Audio, Image और Notifications का प्रबंधन।

**Out of Scope**:
- Audio Downloading (No Download Option)।

---

# 14. Missing Requirements (Client has NOT specified)
**Client has NOT specified:**
- Authentication (Login/Signup प्रक्रिया, OTP, या Password के विषय में कोई जानकारी नहीं दी गई है)।
- Database (Firebase Storage का उल्लेख है, परन्तु Database संरचना का विस्तृत विवरण नहीं है)।
- User Roles (Admin के अतिरिक्त अन्य किसी विशेष Role का उल्लेख नहीं है)।
- Offline Mode (चूंकि No Download है, इसलिए Offline Mode का स्पष्ट उल्लेख नहीं है)।
- Notification Settings (Profile Screen में इसका विकल्प है, परन्तु इसके अंदर क्या-क्या settings होंगी, यह नहीं बताया गया है)।
- Language Options (Profile Screen में Language का विकल्प है, परन्तु कौन-कौन सी भाषाएं होंगी, इसका उल्लेख नहीं है)।
- About App (इसमें क्या जानकारी होगी, यह निर्दिष्ट नहीं है)।
- Pagination / Infinite Scrolling (सूची में आइटम कैसे लोड होंगे, इसका तकनीकी उल्लेख नहीं है)।
- State Management / Architecture Pattern (केवल Future Ready Architecture कहा गया है)।
