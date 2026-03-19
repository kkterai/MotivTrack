# Parent Dashboard Tasks & Rewards Display Fix

## Issue
Tasks and rewards created during the Parent Admin onboarding flow were not appearing in the Parent Dashboard, and reward details (name, description, points) were not displaying in Step 3 of onboarding.

## Root Causes

### 1. Missing Data Fetching
**Problem**: The ParentDashboard component never fetched tasks or rewards from the backend.

**Location**: `frontend/src/pages/ParentDashboard.jsx`

**Fix**: Added a `useEffect` hook that fetches tasks and rewards whenever `selectedChild` changes:

```javascript
// Fetch tasks and rewards when selected child changes
useEffect(() => {
  const loadChildData = async () => {
    if (!selectedChild) return;
    
    try {
      console.log('[ParentDashboard] Fetching tasks and rewards for child:', selectedChild);
      await Promise.all([
        fetchTasks(selectedChild),
        fetchRewards(selectedChild)
      ]);
      console.log('[ParentDashboard] Tasks and rewards loaded successfully');
    } catch (error) {
      console.error('[ParentDashboard] Error loading child data:', error);
    }
  };

  loadChildData();
}, [selectedChild, fetchTasks, fetchRewards]);
```

### 2. Missing childProfileId in Task/Reward Creation
**Problem**: The TasksTab and RewardsTab components were calling store methods directly, but those methods require `childProfileId` to be included in the data payload.

**Location**: `frontend/src/pages/ParentDashboard.jsx`

**Fix**: Created wrapper functions that inject the `selectedChild` ID into the data before calling store methods:

```javascript
// Wrapper functions to inject selectedChild into task/reward operations
const handleCreateTask = async (taskData) => {
  if (!selectedChild) {
    console.error('[ParentDashboard] No child selected');
    return;
  }
  return createTask({ ...taskData, childProfileId: selectedChild });
};

const handleCreateReward = async (rewardData) => {
  if (!selectedChild) {
    console.error('[ParentDashboard] No child selected');
    return;
  }
  return createReward({ ...rewardData, childProfileId: selectedChild });
};
```

Then updated the JSX to use these wrappers:
```javascript
{activeTab === 'tasks' && <TasksTab tasks={tasks} onCreateTask={handleCreateTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />}
{activeTab === 'rewards' && <RewardsTab rewards={rewards} onCreateReward={handleCreateReward} onUpdateReward={handleUpdateReward} onDeleteReward={handleDeleteReward} />}
```

### 3. Response Structure Understanding (CRITICAL)
**Problem**: Initial misunderstanding of the response unwrapping pattern.

**The Correct Pattern**:
1. Backend returns: `{ success: true, data: <actual data> }`
2. Axios interceptor in `api.js` returns `response.data`, which gives us: `{ success: true, data: <actual data> }`
3. Service methods must return `response.data` to extract the actual data

**Example Flow**:
```javascript
// Backend controller returns:
res.json({ success: true, data: reward })

// Axios interceptor unwraps response.data:
return response.data  // Now we have { success: true, data: reward }

// Service method extracts the actual data:
const response = await api.post('/rewards', data);
return response.data;  // Now we have the reward object
```

**Locations Fixed**: 
- `frontend/src/services/tasks.js` - All methods now correctly return `response.data`
- `frontend/src/services/rewards.js` - All methods now correctly return `response.data`
- `frontend/src/services/childProfiles.js` - Already correct

## Files Modified

1. **frontend/src/pages/ParentDashboard.jsx**
   - Added `useEffect` to fetch tasks/rewards when `selectedChild` changes
   - Added wrapper functions to inject `childProfileId` into create operations
   - Updated JSX to use wrapper functions instead of store methods directly

2. **frontend/src/services/tasks.js**
   - Confirmed correct pattern: returns `response.data` to unwrap backend's `{ success, data }` structure
   - Added comments explaining the response structure

3. **frontend/src/services/rewards.js**
   - Confirmed correct pattern: returns `response.data` to unwrap backend's `{ success, data }` structure
   - Added comments explaining the response structure

## Testing Checklist

- [ ] Complete Parent Admin onboarding flow and create tasks/rewards
- [ ] Verify reward name, description, and points display correctly in Step 3
- [ ] Verify tasks appear in the "Tasks" tab of Parent Dashboard
- [ ] Verify rewards appear in the "Rewards" tab of Parent Dashboard
- [ ] Create a new task from the Parent Dashboard
- [ ] Create a new reward from the Parent Dashboard
- [ ] Update an existing task
- [ ] Update an existing reward
- [ ] Verify console logs show successful data fetching

## Pattern to Remember

**IMPORTANT**: The backend wraps all responses in `{ success, data }`, so the correct pattern is:

```javascript
// ✅ CORRECT PATTERN
async someMethod() {
  const response = await api.get('/endpoint');
  // response = { success: true, data: actualData }
  return response.data; // Returns actualData
}

// ❌ WRONG PATTERN
async someMethod() {
  const response = await api.get('/endpoint');
  return response; // Returns { success: true, data: actualData } - wrong!
}
```

## Backend Response Structure

All backend controllers follow this pattern:

```typescript
// Success response
res.json({
  success: true,
  data: <actual data>
});

// Error response
res.json({
  success: false,
  error: <error message>
});
```

This is why service methods must access `response.data` after the axios interceptor unwraps `response.data` from the HTTP response.
