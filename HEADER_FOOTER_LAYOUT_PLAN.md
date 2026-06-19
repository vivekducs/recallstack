# RecallStack: Header, Footer & Layout Build Plan

---

## Overview

Current state: Homepage shows empty catalog because there's no structured layout wrapper. We need to build:

1. **Header** (Sticky, persists across all pages)
2. **Footer** (Static, at bottom)
3. **Main Layout Wrapper** (Contains header + content + footer)
4. **Sidebar** (Optional, for navigation)

---

## COMPONENT 1: HEADER

### Purpose
- Logo/brand
- Navigation links
- Search functionality
- User authentication indicator
- Admin access link

### Structure

```
┌─────────────────────────────────────────────────────┐
│ Logo    │ Nav Links        │ Search │ User   │ Menu │
│ Recall  │ Learn | Search   │ [  ]   │ @john │  ≡   │
│ Stack   │ My Notes         │  🔍    │ ▼     │      │
└─────────────────────────────────────────────────────┘
```

### Header Layout Rules

**Desktop (>1024px)**
- Fixed position (sticks to top)
- Full width, white background with subtle border bottom
- Horizontal arrangement: Logo | Navigation | Search | User
- Height: 56px
- Padding: 12px left/right

**Tablet (640-1024px)**
- Logo on left
- Navigation collapses to hamburger menu
- Search visible
- User menu present

**Mobile (<640px)**
- Logo and hamburger only
- Everything else in burger menu dropdown
- Height: 48px

### Header Sections

**Section 1: Logo & Brand**
- Text: "RecallStack" or just logo
- Size: Fit 40px height
- Clickable: Links to homepage
- Left padding: 16px

**Section 2: Navigation** (Desktop only)
- Links: "Learn" | "Search" | "My Notes" (if logged in)
- Admin link: "Manage" (if user is ADMIN)
- Spacing between links: 24px
- Hover: Underline appears
- Active page: Bold text

**Section 3: Search Bar** (Always visible)
- Input field: 36px height, 200px width
- Placeholder: "Search notes..."
- Icon: Magnifying glass on right
- Click to focus, submit on Enter
- Desktop: Visible inline
- Mobile: Click to expand to full width

**Section 4: User Menu** (Top right)
- If NOT logged in:
  - "Login" button (text)
  - "Sign Up" button (blue background)
- If logged in:
  - Username display
  - Dropdown arrow (▼)
  - On click, show dropdown:
    - User profile link
    - Preferences link
    - "Logout" button (red)
- If ADMIN:
  - Badge: "Admin" (blue)
  - Link to admin panel

**Section 5: Hamburger Menu** (Mobile/Tablet)
- Icon: Three horizontal lines (≡)
- Click toggles off-canvas menu
- Menu contains:
  - Navigation links (stacked vertically)
  - Search input
  - User profile/logout
  - Admin link (if applicable)

### Header Styling Details

**Colors**
- Background: White (#FFFFFF) light / #121212 dark
- Text: Dark gray (#1A1A1A)
- Border bottom: 1px solid #EEEEEE
- Links: Blue (#3B82F6) on hover
- Hover background: Light gray (#F5F5F5)

**Typography**
- Logo: 18px, 700 weight
- Navigation: 14px, 400 weight
- Labels: 12px, 400 weight

**Spacing**
- Logo padding: 8px left
- Nav link padding: 12px horizontal
- User menu padding: 12px right
- Vertical centering: 56px / 2 = 28px

**Sticky Positioning**
- `position: sticky; top: 0;`
- `z-index: 100` (above all content)
- Shadow on scroll (subtle, only when scrolling)

---

## COMPONENT 2: FOOTER

### Purpose
- Copyright notice
- Links (Privacy, Terms)
- Social links (optional)
- Newsletter signup (optional)
- Credits

### Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Company Links    │  Resources    │  Social         │
│  - Privacy        │  - API Docs   │  - GitHub       │
│  - Terms          │  - FAQ        │  - Twitter      │
│  - Contact        │  - Blog       │  - LinkedIn     │
│                   │               │                 │
│  © 2024 RecallStack. All rights reserved.           │
│  Built for developers. Learn once. Recall anytime.  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Footer Layout Rules

**Desktop (>1024px)**
- 3 columns: Left (Company) | Middle (Resources) | Right (Social)
- Separated by vertical dividers (light gray)
- Max width: Full width with padding

**Tablet/Mobile**
- Stack vertically: Company → Resources → Social → Copyright
- Single column, centered

**Height**
- Desktop: 160-180px
- Mobile: 200-240px (due to stacking)

### Footer Sections

**Section 1: Company/About**
- Heading: "RecallStack"
- Links:
  - Privacy Policy
  - Terms of Service
  - Contact Us
  - About
- Font: 13px

**Section 2: Resources** (Optional)
- Heading: "Resources"
- Links:
  - API Documentation
  - FAQ
  - Blog
  - Status Page
- Font: 13px

**Section 3: Social Links** (Optional)
- Heading: "Follow"
- Icons (clickable):
  - GitHub
  - Twitter/X
  - LinkedIn
  - Discord (optional)
- Size: 16px icons
- Color: Gray, blue on hover

**Section 4: Copyright & Legal**
- Text: "© 2024 RecallStack. All rights reserved."
- Tagline: "Learn once. Recall anytime."
- Font: 12px, gray

### Footer Styling Details

**Colors**
- Background: Light gray (#F5F5F5) light / #1F1F1F dark
- Text: Gray (#666666) light / #999999 dark
- Borders: #EEEEEE light / #333333 dark
- Links: Gray, blue on hover

**Typography**
- Heading: 14px, 600 weight
- Links: 13px, 400 weight
- Copyright: 12px, 400 weight

**Spacing**
- Padding: 32px top/bottom, 24px left/right
- Gap between columns: 48px
- Link spacing: 8px between items
- Vertical dividers: `border-left: 1px solid #EEEEEE`

**Position**
- Static (at bottom of page)
- Separating line above: 1px solid #EEEEEE
- Margin top: 64px

---

## COMPONENT 3: MAIN LAYOUT WRAPPER

### Purpose
Wraps all pages to provide consistent header/footer across entire app

### Structure

```
┌─────────────────────────────────────┐
│       HEADER (Sticky)               │
├─────────────────────────────────────┤
│                                     │
│  MAIN CONTENT (page-specific)       │
│  - Homepage                         │
│  - Learning path                    │
│  - Note reading                     │
│  - Admin panel                      │
│  - User profile                     │
│                                     │
├─────────────────────────────────────┤
│       FOOTER (Static)               │
└─────────────────────────────────────┘
```

### Layout Implementation

**Container Max-Width**
- Mobile: Full width (no padding edge-to-edge)
- Desktop: 1200px centered with padding 24px

**Content Padding**
- Top (below header): 32px
- Bottom (above footer): 64px
- Left/right: 16px (mobile), 24px (desktop)

**Header Stays Fixed**
- When scrolling down, header stays visible
- When scrolling up, header stays visible
- Content scrolls behind header

**Flex Layout**
- Root: `display: flex; flex-direction: column; min-height: 100vh;`
- Header: `flex-shrink: 0;` (doesn't collapse)
- Main content: `flex-grow: 1;` (expands to fill space)
- Footer: `flex-shrink: 0;` (stays at bottom)

---

## COMPONENT 4: SIDEBAR (OPTIONAL)

### Purpose
Quick navigation to subjects, improve discoverability

### Structure

```
┌──────────────────────┐
│ Subjects             │
│ ─────────────────── │
│ 📚 Data Structures   │
│    • Sorting         │
│    • DP              │
│ 🏗️  System Design    │
│    • Scalability     │
│ 💾 Databases         │
│                      │
│ [See all subjects]   │
└──────────────────────┘
```

### When to Show

**Desktop (>1024px)**
- Always visible on left side
- Width: 240px
- Sticky (scrolls with content)

**Tablet (640-1024px)**
- Hidden by default
- Click hamburger to show as overlay
- Closes on link click

**Mobile (<640px)**
- Hidden by default
- Hamburger menu (in header)

### Sidebar Sections

**Section 1: Subjects List**
- Heading: "Learning Paths"
- Icon + name for each subject
- Expandable: Click to show topics
- Active highlighting: Current subject bolded
- Max height: 400px, scrollable

**Section 2: Quick Links** (Optional)
- "My Notes" link
- "Bookmarks" link
- "Search" link

**Section 3: CTA** (Optional)
- "Explore All" button
- Links to full catalog page

### Sidebar Styling

**Colors**
- Background: White (#FFFFFF) light / #1F1F1F dark
- Border right: 1px solid #EEEEEE
- Hover background: Light gray

**Typography**
- Heading: 12px, 600 weight, gray
- Link: 13px, 400 weight
- Active: 13px, 600 weight, blue

**Spacing**
- Padding: 16px
- Gap between items: 8px
- Icon width: 20px, right margin: 8px

---

## Build Sequence (Order to Implement)

### Week 1: Core Layout

1. **Build Main Layout Wrapper**
   - Create root layout component
   - Implement flex container (header sticky, footer at bottom)
   - Ensure min-height: 100vh (full viewport)

2. **Build Header**
   - Logo clickable to home
   - Navigation links (Learn, Search, My Notes)
   - Search bar (placeholder only, no backend yet)
   - User menu (Login/Signup when not logged in, Logout when logged in)
   - Mobile hamburger menu
   - Sticky positioning

3. **Build Footer**
   - Company links (Privacy, Terms, Contact)
   - Copyright notice
   - Tagline
   - Responsive stacking

4. **Test on All Devices**
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1440px
   - Check no horizontal scroll

### Week 2: Enhancement

5. **Add Sidebar** (Desktop only)
   - Show subjects from API
   - Expandable topics
   - Active state highlighting

6. **Connect Search**
   - Search bar submits query
   - Navigates to search results page
   - Preserves query string

7. **User Authentication Indicator**
   - Show username when logged in
   - Dropdown menu on click
   - Admin badge if applicable

### Week 3: Polish

8. **Dark Mode**
   - Test dark mode colors
   - Adjust contrast
   - Verify readability

9. **Accessibility**
   - Keyboard navigation (Tab order)
   - Focus outlines visible
   - Screen reader labels

10. **Performance**
    - Minimize layout shift (CLS)
    - Lazy load sidebar subjects
    - Cache navigation state

---

## File Organization

### Suggested Structure

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── Header.jsx (main component)
│   │   │   ├── Navigation.jsx (nav links)
│   │   │   ├── SearchBar.jsx (search input)
│   │   │   ├── UserMenu.jsx (login/profile)
│   │   │   └── MobileMenu.jsx (hamburger menu)
│   │   ├── Footer/
│   │   │   ├── Footer.jsx (main component)
│   │   │   ├── CompanyLinks.jsx
│   │   │   ├── SocialLinks.jsx
│   │   │   └── Copyright.jsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx (main component)
│   │   │   ├── SubjectsList.jsx
│   │   │   └── SidebarToggle.jsx
│   │   └── Layout.jsx (root wrapper)
│   └── ... (other components)
└── app/
    └── layout.js (Next.js root layout)
```

---

## Key Technical Considerations

### Header
- Use `position: sticky; top: 0;` for sticky behavior
- `z-index: 100` to appear above content
- Add box-shadow on scroll (detect via scroll event listener)
- Mobile menu: Toggle boolean state on hamburger click

### Footer
- Use CSS Grid for 3-column layout on desktop
- Transform to flexbox column on mobile
- Separate from content with margin-top

### Sidebar
- Use `position: sticky; top: 56px;` (below header)
- Overflow-y: auto for scrolling
- Max-height: calc(100vh - 56px)
- Hidden on mobile (display: none)
- Transform to fixed overlay on tablet (position: fixed, z-index: 99)

### Responsive
- Use CSS media queries: @media (max-width: 768px)
- Or Tailwind breakpoints: md: sm: etc.
- Test all breakpoints before deploy

### State Management
- User logged-in state: Get from auth hook/context
- Mobile menu open: useState boolean
- Active page: usePathname() from Next.js
- Scroll position: useEffect listener (for shadow)

---

## Design Tokens to Use

### Colors (From Design System)
- Primary blue: #3B82F6
- Dark text: #1A1A1A
- Gray text: #666666
- Border: #EEEEEE
- Background: #FFFFFF / #121212

### Spacing
- Horizontal: 16px (mobile), 24px (desktop)
- Vertical: 32px (sections), 16px (elements)
- Gap: 16px

### Typography
- Heading: 18px, 700 weight
- Body: 14px, 400 weight
- Small: 12px, 400 weight

### Shadows
- Subtle: 0 1px 3px rgba(0,0,0,0.1)
- Medium: 0 4px 8px rgba(0,0,0,0.15)
- None on light backgrounds

### Border Radius
- Buttons: 4px
- Cards: 8px
- Inputs: 4px

---

## Validation Checklist

Before considering layout complete:

- [ ] Header appears on all pages
- [ ] Header stays sticky when scrolling
- [ ] Logo links to homepage
- [ ] Navigation links work
- [ ] Search bar is visible and functional
- [ ] User menu shows Login/Signup when not authenticated
- [ ] User menu shows username and Logout when authenticated
- [ ] Admin link appears for admin users
- [ ] Mobile hamburger menu works
- [ ] Sidebar shows subjects (if implemented)
- [ ] Sidebar hides on mobile
- [ ] Footer appears at bottom of every page
- [ ] Footer links are accessible
- [ ] No horizontal scroll on any device
- [ ] Dark mode colors are readable
- [ ] Tab navigation works through header/footer
- [ ] Focus outlines are visible
- [ ] Page loads without layout shift

---

## Next Steps After Completion

1. **Test on real devices**: Not just browser dev tools
2. **Collect user feedback**: Does navigation make sense?
3. **Monitor Core Web Vitals**: Largest Contentful Paint (LCP) < 2.5s
4. **Accessibility audit**: Run axe DevTools, WAVE
5. **Performance**: Lazy load sidebar, optimize images

