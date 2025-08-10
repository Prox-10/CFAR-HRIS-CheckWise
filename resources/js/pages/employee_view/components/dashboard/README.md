# Employee Dashboard Components

This folder contains the modular components for the employee dashboard view, designed to match the CheckWise HRIS employee portal design.

## Component Structure

### Core Components

- **`index.tsx`** - Main dashboard component that combines all other components
- **`employee-header.tsx`** - Top header bar with CheckWise branding and employee info
- **`employee-sidebar.tsx`** - Left navigation sidebar with logo and menu items
- **`welcome-banner.tsx`** - Green welcome banner with employee greeting

### Dashboard Cards

- **`metrics-card.tsx`** - Reusable metrics card component with specific implementations:
    - `LeaveBalanceCard` - Shows current leave balance
    - `AbsenceCountCard` - Shows absence count for the month
    - `EvaluationRatingCard` - Shows performance evaluation rating
    - `AssignedAreaCard` - Shows current work assignment

### Content Sections

- **`recent-activities.tsx`** - Recent activities list with status indicators
- **`performance-overview.tsx`** - Performance metrics with star ratings and progress bars

## Usage

```tsx
import { EmployeeDashboard } from './components/dashboard';

<EmployeeDashboard employee={employeeData} onLogout={handleLogout} />;
```

## Design Features

- **Responsive Layout**: Adapts to different screen sizes
- **Modern UI**: Clean, professional design with green accent colors
- **Modular Components**: Each section is a separate, reusable component
- **Type Safety**: Full TypeScript support with proper interfaces
- **Accessibility**: Proper ARIA labels and semantic HTML

## Color Scheme

- **Primary Green**: `bg-green-600` for main accents and active states
- **Background**: `bg-gray-50` for main background
- **Cards**: `bg-white` with subtle shadows
- **Text**: Various gray shades for hierarchy
- **Status Colors**: Green (approved), Yellow (pending), Gray (completed)
