# AI Rules for MotivTrack

## Tech Stack

- **React 18+** - Core framework using functional components and hooks
- **Inline Styles** - All styling done via JavaScript style objects (no CSS files, no Tailwind, no CSS-in-JS libraries)
- **Local State Management** - React useState hooks only (no Redux, Zustand, or other state libraries)
- **No Routing** - Single-page application with view switching via state
- **No UI Libraries** - Custom components built from scratch (no shadcn/ui, no Material-UI, no component libraries)
- **Pure Frontend** - No backend, no databases, no API calls (localStorage for persistence if needed)
- **Vanilla JavaScript** - No TypeScript, no build configuration beyond standard React

## Styling Rules

### Color System
Always use the predefined color constants at the top of the file:
- `P = "#20A464"` - Primary green
- `Y = "#F5BA14"` - Yellow/warning
- `G = "#20A464"` - Success green (same as primary)
- `O = "#EDA306"` - Orange
- `MU = "#6B7A6B"` - Muted text
- `BD = "#C8EDD8"` - Border color

### Style Guidelines
- **NEVER** add external CSS files or CSS modules
- **NEVER** use className attributes
- **ALWAYS** use inline style objects
- Use gradient backgrounds for headers: `background:"linear-gradient(135deg,#146735,#20A464)"`
- Maintain consistent border radius values: 10-18px for cards, 8-12px for buttons
- Use box shadows sparingly: `boxShadow:"0 4px 20px rgba(32,164,100,0.08)"`

## Component Architecture

### File Structure
- Keep everything in a single file unless the file exceeds 1000 lines
- Component order: Helper functions → Child components → Parent components → Main App export
- Each view component should be self-contained (ChildView, ParentView, TeacherLoginView, TeacherFormView)

### State Management
- **NEVER** introduce external state management libraries
- Use useState at the App level for shared state
- Pass state and setters as props to child components
- Use local useState within components for UI-only state (expanded panels, form inputs, etc.)

### Component Patterns
- Use functional components exclusively
- Destructure props in function parameters
- Keep components focused on a single responsibility
- Use inline event handlers for simple logic
- Extract complex logic into separate functions within the component

## Data Patterns

### State Shape
Maintain these exact state structures:
- `tasks` - Array of task objects with id, label, pts, status, icon, desc, tips, done, extraWellDone
- `rewards` - Array of reward objects with id, label, pts, icon, category, buyLink, needsScheduling
- `dateRequests` - Array of scheduling requests with id, reward, status, proposedDate, parentNote
- `teacherReports` - Array of daily reports with teacherId, date, ratings, comments, totalPts

### ID Generation
- Use `Date.now()` for generating unique IDs
- Never use array indices as IDs

### Date Handling
- Use `todayKey` format: `new Date().toLocaleDateString("en-CA")` (YYYY-MM-DD)
- Use `today` format: `new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })`
- Store dates as strings, not Date objects

## UI/UX Rules

### Icons
- Use emoji for all icons (no icon libraries)
- Keep emoji consistent with their semantic meaning
- Common patterns: 🦊 for child, 👨‍👧 for parent, 🏫 for teacher, ✅ for approved, ⏳ for pending

### Responsive Design
- Set max-width: 440px on main containers
- Use flexbox for layouts
- Avoid fixed widths except for icons/avatars
- Use `flex:1` for flexible content areas

### Feedback & Animations
- Use simple CSS transitions: `transition:"width 0.5s cubic-bezier(.34,1.56,.64,1)"`
- Show temporary success states with setTimeout (1500-2000ms)
- Use transform for subtle hover/active effects: `transform:"scale(1.02)"`

## Feature Development Rules

### Adding New Features
1. **Always** maintain the three-view structure (child, parent, teacher)
2. **Never** break existing functionality when adding features
3. Add new state at the App level if it needs to be shared across views
4. Keep the single-file structure unless absolutely necessary to split

### Modifying Existing Features
1. Preserve the exact data structure of existing state
2. Maintain backward compatibility with existing data
3. Don't change color constants or core styling patterns
4. Keep the inline styling approach consistent

### Points System
- Task points: 1-5 range
- Reward costs: 5-15 range typically
- Extra well done bonus: always +0.5 pts
- Teacher ratings: 1→0pts, 2→0.5pts, 3→1pt, 4→1.5pts per expectation

## Code Quality

### Formatting
- Use 2-space indentation
- Keep lines under 120 characters when possible
- Use descriptive variable names (avoid single letters except for common iterators)

### Comments
- Add comments only for complex logic
- Prefer self-documenting code over comments
- Use section comments to separate major blocks: `// ─── SECTION NAME ───`

### Performance
- Avoid unnecessary re-renders by using proper dependency arrays
- Use `prev => ...` pattern for state updates that depend on previous state
- Don't create new objects/arrays in render unless necessary

## What NOT to Do

❌ **NEVER** add these:
- TypeScript
- CSS files or CSS modules
- Tailwind CSS or any CSS framework
- Component libraries (Material-UI, Ant Design, etc.)
- State management libraries (Redux, MobX, Zustand)
- Routing libraries (React Router)
- Backend integrations
- Database connections
- API calls to external services
- Build tools beyond standard Create React App

✅ **ALWAYS** do these:
- Keep it simple and maintainable
- Use inline styles exclusively
- Manage state with React hooks
- Build custom components from scratch
- Test in all three views (child, parent, teacher)
- Maintain the existing color scheme and design patterns
- Keep the single-file structure