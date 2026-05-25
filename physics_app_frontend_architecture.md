# Kiến trúc Frontend Prototype - Physics Interactive Learning App

Tài liệu này định nghĩa toàn bộ kiến trúc frontend, UI/UX, Design System và lộ trình phát triển cho dự án Web App Học Vật lý Gamification dành cho học sinh THCS (Lớp 6-9).

---

## PHẦN 1 — APP STRUCTURE (Cấu trúc Ứng dụng)

### Cấu trúc Navigation & Routing
Ứng dụng sử dụng React Router với cấu trúc phân cấp:

- `(/)` **Main Layout** (Có Bottom Navigation trên Mobile / Sidebar trên Desktop)
  - `/home` - Bảng điều khiển chính, lộ trình học (Lesson tree).
  - `/lab` - Bản đồ các phòng thí nghiệm tự do (Sandbox).
  - `/missions` - Nhiệm vụ hàng ngày, bảng xếp hạng.
  - `/profile` - Hồ sơ học sinh, huy hiệu, kho đồ.
- `(/lesson)` **Immersive Layout** (Toàn màn hình, không có Bottom Nav)
  - `/lesson/:id` - Giới thiệu bài học.
  - `/simulation/:id` - Khu vực mô phỏng chính.
  - `/quiz/:id` - Thử thách trắc nghiệm.
  - `/achievement/:id` - Màn hình hoàn thành, cộng XP.

### Screen Flow (Luồng người dùng)
`Vào App` ➡️ `Home (Xem Streak, Lộ trình)` ➡️ `Chọn Bài học` ➡️ `Mô phỏng tương tác` ➡️ `Mascot giải thích` ➡️ `Làm Quiz Pop-up` ➡️ `Nhận XP / Huy hiệu` ➡️ `Quay lại Home`.

---

## PHẦN 2 — FOLDER STRUCTURE (Cấu trúc Thư mục)

Cấu trúc tối ưu cho dự án React + Vite (Scalable & Reusable):

```text
src/
├── assets/           # Hình ảnh, âm thanh, lottie animations, 3D models.
├── animations/       # Các file định nghĩa Framer Motion variants (spring, bounce, float).
├── components/       # UI Components tái sử dụng.
│   ├── common/       # Button, Card, ProgressBar, Avatar.
│   ├── layout/       # BottomNav, Header, Sidebar.
│   ├── gamification/ # XPPopup, Badge, StreakFlame.
│   └── physics/      # Slider, ToolDock, PhysicsObject.
├── data/             # Thư mục chứa Fake/Mock JSON data.
├── hooks/            # Custom hooks: usePhysics, useGamification, useAudio.
├── layouts/          # Chứa MainLayout, ImmersiveLayout.
├── screens/          # Các Page/Screen chính (Home, Simulation, Profile).
├── simulations/      # Các engine mô phỏng chia theo chủ đề.
│   ├── mechanics/    # Động lực học (Con lắc, lực kéo, rơi tự do).
│   ├── electricity/  # Điện học (Mạch điện, định luật Ohm).
│   └── optics/       # Quang học (Thấu kính, lăng kính).
├── store/            # Quản lý Global State (Zustand/Redux) cho XP, UserProgress.
├── styles/           # Tailwind custom classes, global.css.
├── utils/            # Helper functions, math formulas.
└── App.jsx           # Entry point & Routing setup.
```

---

## PHẦN 3 — DESIGN SYSTEM

Thiết kế hướng tới phong cách: **Playful, Colorful, Science-feeling, Startup style**.

### 1. Color Palette (Bảng màu Dopamine)
- **Primary (Vàng Năng Lượng):** `#FBBF24` -> `#F59E0B` (Sự sáng tạo, điện, năng lượng).
- **Secondary (Xanh Không Gian):** `#38BDF8` -> `#0284C7` (Bầu trời, khoa học, tương lai).
- **Success (Xanh Duolingo):** `#58CC02` (Hoàn thành bài, câu trả lời đúng).
- **Danger (Đỏ Cảnh Báo):** `#FF4B4B` (Lỗi sai, ngắn mạch).
- **Backgrounds:** `#F8FAFC` (Xám rất sáng), `#F0F9FF` (Xanh nhạt cho canvas mô phỏng).
- **Surface:** `#FFFFFF` (Trắng tinh cho Card).
- **Text:** `#1E293B` (Xám đậm, dịu mắt), `#64748B` (Cho phụ đề).

### 2. Typography
- **Font:** `Quicksand` (Primary) hoặc `Nunito` (Tròn trịa, siêu dễ đọc, thân thiện với học sinh).
- **Headers:** Font-weight 800 (Extrabold), tracking-tight.
- **Body:** Font-weight 600 (Semibold) cho nút bấm, 500 (Medium) cho văn bản.

### 3. Hình khối & Hiệu ứng (UI Style)
- **Border Radius:** `24px` đến `32px` (Bo góc rất lớn, an toàn, mềm mại).
- **Chunky Buttons:** Nút bấm 3D dạng khối (Có `border-bottom: 4px solid var(--shadow)`), khi bấm lún xuống.
- **Shadows:** Soft & Diffused. Ví dụ: `box-shadow: 0 10px 25px -5px rgba(0,0,0, 0.05)`.
- **Glassmorphism:** Dùng cho Tooltips, Popups (nền trắng trong suốt + backdrop blur).

---

## PHẦN 4 — SCREEN LIST & YÊU CẦU UX

1. **Splash/Onboarding:** Logo animation nảy lên. Chọn lớp học (6-9).
2. **Home (Dashboard):** Dạng "Sơ đồ cây" bài học (Lesson Map), có chóp cụt, rẽ nhánh. Bắt buộc vuốt dọc.
3. **Lesson Intro:** Màn hình bottom-sheet trượt lên, tóm tắt nhiệm vụ (vd: "Thắp sáng bóng đèn").
4. **Simulation Screen:** Rộng rãi, không bị cản tầm nhìn. Kéo thả vật lý thời gian thực.
5. **Quiz Screen:** Trắc nghiệm nhanh ngay trong màn hình mô phỏng, chọn sai nút rung lắc.
6. **Achievement Screen:** Rương phần thưởng mở ra, hạt vàng (particles) bay lả tả, âm thanh "Tada!".
7. **Profile/Progress Screen:** Avatar thay đổi được, bảng xếp hạng tuần (Leaderboard).

---

## PHẦN 5 — HOME SCREEN (Màn hình chính)

**UX Mục tiêu:** Tạo động lực ngay khi mở App (FOMO & Motivation).
- **Header:** Avatar + Lửa Streak (chuỗi ngày học) + Tổng điểm XP + Kim cương.
- **Body (Lesson Map):** Giống Candy Crush hoặc Duolingo. Các chặng (Node) được nối với nhau.
  - Nút xám: Chưa mở khóa.
  - Nút vàng đập thình thịch (Pulse animation): Đang học tới đây.
  - Nút xanh lá có vương miện: Đã hoàn thành xuất sắc.
- **Floating Box:** Cập nhật nhiệm vụ ngày (Daily Quests).

---

## PHẦN 6 — SIMULATION SCREEN (Trái tim của App)

**Layout:**
- **Mobile:**
  - Header nhỏ (Nút X, Progress Bar, Life/Heart).
  - Khung Canvas Mô phỏng (chiếm 50% màn hình, có pan/zoom).
  - Dock kéo thả linh kiện phía dưới màn hình (Draggable Items).
  - Control Panel (Thanh trượt, nút Play/Reset) nằm dạng Card dưới cùng.
- **Desktop/Tablet:**
  - Cột trái (60%): Chỉ để Mô phỏng.
  - Cột phải (40%): Controls + AI Tutor + Quiz.

**Tương tác:**
- Chạm + Giữ (Touch & Hold) để nhấc vật thể.
- Có hiệu ứng rung haptic feedback (rung điện thoại) khi nối đúng mạch/ghép đúng ngàm.

---

## PHẦN 7 — PHYSICS SIMULATION ARCHITECTURE

Hệ thống tái sử dụng cực cao:

- **`SimulationContext`**: Provider cung cấp `world`, `engine` (từ Matter.js/Custom logic), trạng thái `isRunning`.
- **`Entity`**: Component bọc ngoài các vật thể (Pin, Đèn, Quả tạ, Lăng kính). Gồm tọa độ X, Y, Góc xoay.
- **Hệ thống Hook:** 
  - `useDragPhysics(item)`: Xử lý kéo thả có va chạm.
  - `useCollisionObserver(itemA, itemB)`: Bắt sự kiện va chạm (Vd: Dây điện chạm cực Pin).

---

## PHẦN 8 — GAMIFICATION UI (Hệ thống Game hóa)

- **XP Burst:** Khi hoàn thành bài, số XP sinh ra từ giữa màn hình và bay về phía góc trên (nơi có ví XP).
- **Streak Flame:** Cháy bùng lên khi học sinh hoàn thành 1 bài học mỗi ngày.
- **Level Up:** Màn hình tối lại, một cái cúp khổng lồ xoay 3D (hoặc Lottie animation) xuất hiện, âm thanh "Level Up".
- **Dopamine Hits:** Bất cứ khi nào thao tác đúng (nối mạch thành công), UI phải có glow effect, âm thanh *ting*, và hạt (particles) nổ ra.

---

## PHẦN 9 — COMPONENT LIBRARY (Core Components)

1. **`ChunkyButton`**: Nút bấm 3D chính, props: `color`, `isPressed`, `onClick`.
2. **`AnimatedProgressBar`**: Thanh tiến trình bo tròn, có hiệu ứng "shimmer" (ánh kim) trượt qua.
3. **`PhysicsSlider`**: Thanh trượt to bản, núm xoay bự (Thumb size > 30px) dễ chạm.
4. **`MascotBubble`**: Component hiển thị nhân vật Cú/Robot, text chạy kiểu máy chữ (Typing effect).
5. **`DraggableItem`**: Component bọc ngoài dùng Framer Motion `<motion.div drag>` để kéo thả.

---

## PHẦN 10 — ANIMATION SYSTEM (Framer Motion)

- **Nảy (Spring/Bouncy):** Áp dụng cho các Popup và Button. 
  `transition={{ type: 'spring', stiffness: 300, damping: 15 }}`.
- **Lắc (Shake):** Khi làm sai Quiz.
- **Nhịp thở (Pulse):** Dùng cho nút kêu gọi hành động ("Chạy thử", "Bài học tiếp theo").
- **Page Transition:** Trượt ngang (Slide in) khi chuyển màn hình để giống Native App.

---

## PHẦN 11 — MOCK DATA STRUCTURE

Ví dụ cấu trúc JSON cho một bài học:

```json
{
  "id": "lesson_circuit_01",
  "title": "Mạch điện đơn giản",
  "grade": 7,
  "topic": "electricity",
  "xpReward": 50,
  "simulation": {
    "type": "circuit_builder",
    "requiredComponents": ["battery_1.5v", "bulb", "switch", "wire"],
    "successCondition": "circuit_closed"
  },
  "quiz": [
    {
      "question": "Dòng điện chỉ chạy khi nào?",
      "options": ["Mạch hở", "Mạch kín", "Không có dây dẫn"],
      "correctIndex": 1,
      "explanation": "Dòng điện cần một vòng khép kín để di chuyển từ cực dương sang cực âm."
    }
  ]
}
```

---

## PHẦN 12 — RESPONSIVE STRATEGY

1. **Mobile (Default):** Thiết kế tối ưu cho chạm bằng ngón cái (Thumb-zone). Nút bấm to (min 48x48px). Vuốt dọc. Cố định bottom nav.
2. **Tablet/Landscape:** Tự động chuyển UI Mô phỏng sang bên trái, UI Điều khiển sang bên phải. Mở rộng Canvas. Khóa cuộn trang (Ngăn ngừa việc kéo thả bị nhầm thành cuộn web).
3. **CSS:** Sử dụng Flexbox, CSS Grid và các Utility của Tailwind (`md:`, `lg:`).

---

## PHẦN 13 — LỘ TRÌNH MVP PRIORITY (Cần code trước)

Để nhanh chóng Impress người dùng / nhà đầu tư, hãy Code theo thứ tự sau:

1. **Phase 1: Thả thính (The Core Loop)** 
   - Code `App.jsx` cấu trúc Responsive.
   - Xây dựng Component tĩnh: `SimulationScreen` (Giao diện Mạch điện).
   - Code Interaction: Kéo thanh slider, bóng đèn sáng mờ/tỏ (Đã làm một phần).
2. **Phase 2: Game Feel (UI Hype)**
   - Thêm `Framer Motion` vào component `ChunkyButton` nhún nhảy.
   - Cài đặt animation Pop-up cho `QuizPopup` và `MascotBubble`.
3. **Phase 3: The Dashboard**
   - Code `HomeScreen` với lộ trình học tập (Lesson Tree) và thanh Streak.
4. **Phase 4: Lắp ghép**
   - Fake React Router để bấm từ Home -> Mạch điện -> Hoàn thành -> Hiện hộp quà XP -> Về Home.

---
*Tài liệu này đóng vai trò như Bản vẽ kỹ thuật (Blueprint). Đội ngũ dev chỉ cần dựa vào các spec Tailwind, Framer Motion và Cấu trúc thư mục này để tiến hành code MVP với tốc độ cao nhất.*
