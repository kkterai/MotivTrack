import { useState } from 'react';
import { Button, Card, Input } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * BehaviorRatingForm - Teacher behavior rating submission form
 * Preserves exact styling from original TeacherFormView
 * 
 * @param {Object} teacher - Teacher object
 * @param {Array} expectations - Array of school expectation objects
 * @param {Array} children - Array of child objects (if teacher has multiple students)
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onLogout - Callback to return to teacher selection
 */
export default function BehaviorRatingForm({ 
  teacher, 
  expectations, 
  children = [],
  onSubmit, 
  onLogout 
}) {
  const [selectedChild, setSelectedChild] = useState(children.length === 1 ? children[0] : null);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const SCALE = [
    { value: 1, label: 'Needs Work', emoji: '😟', color: COLORS.error },
    { value: 2, label: 'Getting There', emoji: '😐', color: COLORS.highlight },
    { value: 3, label: 'Good', emoji: '🙂', color: COLORS.accent },
    { value: 4, label: 'Great', emoji: '😊', color: COLORS.primary },
    { value: 5, label: 'Excellent', emoji: '🌟', color: COLORS.primary },
  ];

  const handleSubmit = async () => {
    if (!selectedChild) return;
    
    // Validate all expectations are rated
    const allRated = expectations.every(exp => ratings[exp.id] !== undefined);
    if (!allRated) {
      alert('Please rate all expectations before submitting');
      return;
    }

    setSubmitting(true);
    
    const report = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      childId: selectedChild.id,
      childName: selectedChild.name,
      ratings: expectations.map(exp => ({
        expectationId: exp.id,
        expectation: exp.label,
        rating: ratings[exp.id],
      })),
      feedback: feedback.trim(),
      submittedAt: new Date().toISOString(),
    };

    await onSubmit(report);
    
    // Reset form
    setRatings({});
    setFeedback('');
    setSubmitting(false);
    
    // If multiple children, stay on form for next child
    if (children.length > 1) {
      setSelectedChild(null);
    }
  };

  // Step 1: Child Selection (if multiple children)
  if (children.length > 1 && !selectedChild) {
    return (
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button variant="outline" onClick={onLogout} style={{ marginBottom: '16px' }}>
            ← Back
          </Button>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.textPrimary }}>
            Select Student
          </h2>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
            Choose which student to rate today
          </p>
        </div>

        {/* Child Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {children.map(child => (
            <Card
              key={child.id}
              hoverable
              onClick={() => setSelectedChild(child)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: COLORS.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white',
                    fontWeight: '700',
                  }}
                >
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
                  {child.name}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Rating Form
  return (
    <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          variant="outline" 
          onClick={() => children.length > 1 ? setSelectedChild(null) : onLogout()}
          style={{ marginBottom: '16px' }}
        >
          ← Back
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px' }}>👩‍🏫</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.textPrimary }}>
              Behavior Report
            </h2>
            <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
              {teacher.name} → {selectedChild?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Expectations Rating */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: COLORS.textPrimary,
          marginBottom: '16px',
        }}>
          Rate Today's Behavior
        </h3>

        {expectations.map(expectation => (
          <Card key={expectation.id} style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', fontSize: '15px', color: COLORS.textPrimary }}>
                {expectation.label}
              </div>
              {expectation.description && (
                <div style={{ fontSize: '13px', color: COLORS.textSecondary, marginTop: '4px' }}>
                  {expectation.description}
                </div>
              )}
            </div>

            {/* Rating Scale */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SCALE.map(scale => (
                <button
                  key={scale.value}
                  onClick={() => setRatings({ ...ratings, [expectation.id]: scale.value })}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '60px',
                    padding: '8px',
                    background: ratings[expectation.id] === scale.value ? scale.color : COLORS.background,
                    color: ratings[expectation.id] === scale.value ? 'white' : COLORS.textPrimary,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{scale.emoji}</span>
                  <span>{scale.label}</span>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Feedback */}
      <div style={{ marginBottom: '24px' }}>
        <Input
          label="Additional Feedback (Optional)"
          type="textarea"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Any additional comments or observations..."
          style={{ minHeight: '100px' }}
        />
      </div>

      {/* Submit Button */}
      <Button
        variant="success"
        fullWidth
        onClick={handleSubmit}
        disabled={submitting || expectations.some(exp => ratings[exp.id] === undefined)}
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </Button>

      {/* Info */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: COLORS.background,
          borderRadius: '8px',
          fontSize: '13px',
          color: COLORS.textSecondary,
          textAlign: 'center',
        }}
      >
        💡 This report will notify the student and parents
      </div>
    </div>
  );
}
