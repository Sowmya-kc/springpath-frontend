import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function TopicDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeQa, setActiveQa] = useState(null)
  const [progress, setProgress] = useState(null)
   // AI Tutor states
const [doubt, setDoubt] = useState('')
const [aiAnswer, setAiAnswer] = useState('')
const [aiLoading, setAiLoading] = useState(false)

// Coding Practice states
const [challenge, setChallenge] = useState('')
const [userCode, setUserCode] = useState('')
const [codeReview, setCodeReview] = useState('')
const [challengeLoading, setChallengeLoading] = useState(false)
const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    fetchTopic()
    fetchProgress()
  }, [id])

  const fetchTopic = async () => {
    try {
      const res = await api.get(`/api/topics/${id}`)
      setTopic(res.data)
    } catch (err) {
      console.error('Failed to fetch topic', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await api.get('/api/progress')
      const p = res.data.find((p) => p.topicId === parseInt(id))
      setProgress(p ? p.status : 'NOT_STARTED')
    } catch (err) {
      console.error('Failed to fetch progress', err)
    }
  }

  const handleStatusChange = async (status) => {
    try {
      await api.post('/api/progress', { topicId: parseInt(id), status })
      setProgress(status)
    } catch (err) {
      console.error('Failed to update progress', err)
    }
  }

  const parseQa = (qaString) => {
    try {
      return JSON.parse(qaString)
    } catch {
      return []
    }
  }

  
  const handleAskDoubt = async () => {
  if (!doubt.trim()) return
  setAiLoading(true)
  setAiAnswer('')
  try {
    const res = await api.post('/api/ai/doubt', {
      topicId: topic.id,
      question: doubt
    })
    setAiAnswer(res.data.answer)
  } catch (err) {
    setAiAnswer('Failed to get answer. Please try again.')
  } finally {
    setAiLoading(false)
  }
}

const handleGenerateChallenge = async () => {
  setChallengeLoading(true)
  setChallenge('')
  setCodeReview('')
  setUserCode('')
  try {
    const res = await api.post('/api/ai/challenge', {
      topicId: topic.id
    })
    setChallenge(res.data.challenge)
  } catch (err) {
    setChallenge('Failed to generate challenge. Please try again.')
  } finally {
    setChallengeLoading(false)
  }
}

const handleReviewCode = async () => {
  if (!userCode.trim()) return
  setReviewLoading(true)
  setCodeReview('')
  try {
    const res = await api.post('/api/ai/review', {
      topicId: topic.id,
      challenge: challenge,
      userCode: userCode
    })
    setCodeReview(res.data.review)
  } catch (err) {
    setCodeReview('Failed to review code. Please try again.')
  } finally {
    setReviewLoading(false)
  }
}


  if (loading) return <div style={styles.loading}>Loading topic...</div>
  if (!topic) return <div style={styles.loading}>Topic not found</div>

  const qaList = topic.interviewQa ? parseQa(topic.interviewQa) : []
  const difficultyColor = {
    BEGINNER: '#16a34a',
    INTERMEDIATE: '#d97706',
    ADVANCED: '#dc2626',
  }

  return (
    <div style={styles.container}>

        {/* AI Tutor Section */}
<div style={styles.section}>
  <div style={styles.sectionIcon}>🤖</div>
  <h2 style={styles.sectionTitle}>Ask AI Tutor</h2>
  <p style={styles.interviewSubtitle}>
    Have a doubt about {topic.title}? Ask your personal AI tutor.
  </p>
  <textarea
    style={styles.textarea}
    value={doubt}
    onChange={(e) => setDoubt(e.target.value)}
    placeholder={`Ask anything about ${topic.title}...`}
    rows={3}
  />
  <button
    style={aiLoading ? styles.aiButtonDisabled : styles.aiButton}
    onClick={handleAskDoubt}
    disabled={aiLoading}
  >
    {aiLoading ? '🤔 Thinking...' : '🤖 Ask AI Tutor'}
  </button>
  {aiAnswer && (
    <div style={styles.aiAnswer}>
      <p style={styles.aiAnswerLabel}>🤖 SpringPath AI Tutor:</p>
      <p style={styles.aiAnswerText}>{aiAnswer}</p>
    </div>
  )}
</div>

{/* Coding Practice Section */}
<div style={styles.section}>
  <div style={styles.sectionIcon}>💻</div>
  <h2 style={styles.sectionTitle}>Coding Practice</h2>
  <p style={styles.interviewSubtitle}>
    Practice what you learned with an AI-generated challenge.
    Submit your code and get instant feedback.
  </p>
  <button
    style={challengeLoading ? styles.aiButtonDisabled : styles.aiButton}
    onClick={handleGenerateChallenge}
    disabled={challengeLoading}
  >
    {challengeLoading ? '⚙️ Generating...' : '⚡ Generate Challenge'}
  </button>

  {challenge && (
    <div style={styles.challengeBox}>
      <pre style={styles.challengeText}>{challenge}</pre>
    </div>
  )}

  {challenge && (
    <>
      <p style={{...styles.aiAnswerLabel, marginTop: '16px'}}>
        ✍️ Write your solution:
      </p>
      <textarea
        style={styles.codeTextarea}
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        placeholder="// Write your Java code here..."
        rows={12}
        spellCheck={false}
      />
      <button
        style={reviewLoading ? styles.aiButtonDisabled : styles.reviewButton}
        onClick={handleReviewCode}
        disabled={reviewLoading}
      >
        {reviewLoading ? '🔍 Reviewing...' : '🚀 Submit for AI Review'}
      </button>
    </>
  )}

  {codeReview && (
    <div style={styles.reviewBox}>
      <p style={styles.aiAnswerLabel}>📋 AI Code Review:</p>
      <pre style={styles.reviewText}>{codeReview}</pre>
    </div>
  )}
</div>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to Roadmap
        </button>
        <h1 style={styles.navLogo}>🌱 SpringPath</h1>
        <div style={styles.estimatedTime}>
          ⏱ {topic.estimatedMinutes || 20} min read
        </div>
      </nav>

      <div style={styles.content}>

        {/* Topic Header */}
        <div style={styles.header}>
          <div style={styles.headerMeta}>
            <span style={styles.orderBadge}>Topic #{topic.orderIndex}</span>
            <span style={{
              ...styles.diffBadge,
              backgroundColor: difficultyColor[topic.difficulty] + '20',
              color: difficultyColor[topic.difficulty]
            }}>
              {topic.difficulty}
            </span>
          </div>
          <h1 style={styles.title}>{topic.title}</h1>
          <p style={styles.description}>{topic.description}</p>

          {/* Progress Actions */}
          <div style={styles.progressActions}>
            <span style={styles.progressLabel}>Your progress:</span>
            <button
              style={{
                ...styles.progressBtn,
                backgroundColor: progress === 'IN_PROGRESS' ? '#fef3c7' : 'white',
                borderColor: '#d97706', color: '#d97706'
              }}
              onClick={() => handleStatusChange('IN_PROGRESS')}
            >
              In Progress
            </button>
            <button
              style={{
                ...styles.progressBtn,
                backgroundColor: progress === 'COMPLETED' ? '#dcfce7' : 'white',
                borderColor: '#16a34a', color: '#16a34a'
              }}
              onClick={() => handleStatusChange('COMPLETED')}
            >
              ✓ Mark Complete
            </button>
          </div>
        </div>

        {/* Why Learn This */}
        <div style={styles.section}>
          <div style={styles.sectionIcon}>🤔</div>
          <h2 style={styles.sectionTitle}>Why should you learn this?</h2>
          <p style={styles.sectionText}>{topic.whyLearn}</p>
        </div>

        {/* Real World Analogy */}
        {topic.realWorldAnalogy && (
          <div style={{...styles.section, backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b'}}>
            <div style={styles.sectionIcon}>💡</div>
            <h2 style={styles.sectionTitle}>Real World Analogy</h2>
            <p style={styles.sectionText}>{topic.realWorldAnalogy}</p>
          </div>
        )}

        {/* Where It's Used */}
        <div style={{...styles.section, backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6'}}>
          <div style={styles.sectionIcon}>🔧</div>
          <h2 style={styles.sectionTitle}>Where is this used?</h2>
          <p style={styles.sectionText}>{topic.whereUsed}</p>
        </div>

        {/* Code Example */}
        {topic.codeExample && (
          <div style={styles.section}>
            <div style={styles.sectionIcon}>💻</div>
            <h2 style={styles.sectionTitle}>See it in code</h2>
            <pre style={styles.codeBlock}>{topic.codeExample}</pre>
            {topic.codeExplanation && (
              <div style={styles.codeExplanation}>
                <p style={styles.codeExplanationTitle}>What's happening here:</p>
                <p style={styles.sectionText}>{topic.codeExplanation}</p>
              </div>
            )}
          </div>
        )}

        {/* What Breaks */}
        <div style={{...styles.section, backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444'}}>
          <div style={styles.sectionIcon}>⚠️</div>
          <h2 style={styles.sectionTitle}>What breaks if you skip this?</h2>
          <p style={styles.sectionText}>{topic.whatBreaks}</p>
        </div>

        {/* Interview Q&A */}
        {qaList.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionIcon}>🎯</div>
            <h2 style={styles.sectionTitle}>Interview Mode</h2>
            <p style={styles.interviewSubtitle}>
              These are real questions interviewers ask. Click each to reveal the answer.
            </p>
            <div style={styles.qaList}>
              {qaList.map((qa, index) => (
                <div key={index} style={styles.qaCard}>
                  <button
                    style={styles.qaQuestion}
                    onClick={() => setActiveQa(activeQa === index ? null : index)}
                  >
                    <span style={styles.qaNumber}>Q{index + 1}</span>
                    <span style={styles.qaQuestionText}>{qa.question}</span>
                    <span style={styles.qaToggle}>
                      {activeQa === index ? '▲' : '▼'}
                    </span>
                  </button>
                  {activeQa === index && (
                    <div style={styles.qaAnswer}>
                      <p style={styles.qaAnswerLabel}>Model Answer:</p>
                      <p style={styles.qaAnswerText}>{qa.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={styles.navigation}>
          {topic.orderIndex > 1 && (
            <button
              style={styles.navBtn}
              onClick={() => navigate(`/topic/${topic.id - 1}`)}
            >
              ← Previous Topic
            </button>
          )}
          <button
            style={{...styles.navBtn, ...styles.navBtnPrimary}}
            onClick={() => navigate('/dashboard')}
          >
            Back to Roadmap
          </button>
          <button
            style={styles.navBtn}
            onClick={() => navigate(`/topic/${topic.id + 1}`)}
          >
            Next Topic →
          </button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9fafb' },
  loading: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', color: '#6b7280'
  },

  textarea: {
  width: '100%', padding: '12px',
  border: '1px solid #d1d5db', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'inherit',
  resize: 'vertical', outline: 'none',
  boxSizing: 'border-box', marginBottom: '12px',
},
codeTextarea: {
  width: '100%', padding: '16px',
  border: '1px solid #d1d5db', borderRadius: '8px',
  fontSize: '13px', fontFamily: 'monospace',
  resize: 'vertical', outline: 'none',
  boxSizing: 'border-box', marginBottom: '12px',
  backgroundColor: '#1e293b', color: '#e2e8f0',
  lineHeight: '1.6',
},
aiButton: {
  padding: '10px 20px', backgroundColor: '#7c3aed',
  color: 'white', border: 'none', borderRadius: '8px',
  cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  marginBottom: '16px',
},
aiButtonDisabled: {
  padding: '10px 20px', backgroundColor: '#c4b5fd',
  color: 'white', border: 'none', borderRadius: '8px',
  cursor: 'not-allowed', fontSize: '14px', fontWeight: '600',
  marginBottom: '16px',
},
reviewButton: {
  padding: '10px 20px', backgroundColor: '#16a34a',
  color: 'white', border: 'none', borderRadius: '8px',
  cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  marginBottom: '16px',
},
aiAnswer: {
  backgroundColor: '#faf5ff', border: '1px solid #e9d5ff',
  borderRadius: '10px', padding: '16px', marginTop: '8px',
},
aiAnswerLabel: {
  fontSize: '13px', fontWeight: '700',
  color: '#7c3aed', margin: '0 0 8px 0',
},
aiAnswerText: {
  fontSize: '14px', color: '#374151',
  lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap',
},
challengeBox: {
  backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '10px', padding: '16px', marginTop: '12px',
  marginBottom: '16px',
},
challengeText: {
  fontSize: '13px', color: '#374151',
  lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap',
  fontFamily: 'inherit',
},
reviewBox: {
  backgroundColor: '#f0fdf4', border: '1px solid #dcfce7',
  borderRadius: '10px', padding: '16px', marginTop: '8px',
},
reviewText: {
  fontSize: '13px', color: '#374151',
  lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap',
  fontFamily: 'inherit',
},

  navbar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 32px',
    backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  backBtn: {
    background: 'none', border: '1px solid #d1d5db',
    padding: '8px 16px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '14px', color: '#374151',
  },
  navLogo: { color: '#16a34a', fontSize: '20px', margin: 0 },
  estimatedTime: { fontSize: '13px', color: '#6b7280' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px' },
  header: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '32px', marginBottom: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  headerMeta: { display: 'flex', gap: '8px', marginBottom: '12px' },
  orderBadge: {
    fontSize: '12px', fontWeight: '600', color: '#6b7280',
    backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '20px',
  },
  diffBadge: {
    fontSize: '12px', fontWeight: '600',
    padding: '4px 10px', borderRadius: '20px',
  },
  title: {
    fontSize: '28px', fontWeight: '700',
    color: '#111827', margin: '0 0 12px 0',
  },
  description: {
    fontSize: '16px', color: '#4b5563',
    lineHeight: '1.7', margin: '0 0 24px 0',
  },
  progressActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  progressLabel: { fontSize: '14px', color: '#6b7280' },
  progressBtn: {
    padding: '8px 18px', border: '1.5px solid',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600',
  },
  section: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '28px', marginBottom: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sectionIcon: { fontSize: '24px', marginBottom: '8px' },
  sectionTitle: {
    fontSize: '18px', fontWeight: '700',
    color: '#111827', margin: '0 0 12px 0',
  },
  sectionText: {
    fontSize: '15px', color: '#374151',
    lineHeight: '1.8', margin: 0,
  },
  codeBlock: {
    backgroundColor: '#1e293b', color: '#e2e8f0',
    padding: '24px', borderRadius: '12px',
    fontSize: '13px', lineHeight: '1.7',
    overflow: 'auto', whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
  },
  codeExplanation: {
    backgroundColor: '#f8fafc', borderRadius: '8px',
    padding: '16px', marginTop: '16px',
  },
  codeExplanationTitle: {
    fontSize: '13px', fontWeight: '700',
    color: '#475569', margin: '0 0 8px 0',
  },
  interviewSubtitle: {
    fontSize: '14px', color: '#6b7280',
    marginBottom: '16px', marginTop: '-4px',
  },
  qaList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  qaCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px', overflow: 'hidden',
  },
  qaQuestion: {
    width: '100%', display: 'flex', alignItems: 'center',
    gap: '12px', padding: '16px', background: 'white',
    border: 'none', cursor: 'pointer', textAlign: 'left',
  },
  qaNumber: {
    fontSize: '12px', fontWeight: '700', color: '#16a34a',
    backgroundColor: '#dcfce7', padding: '2px 8px',
    borderRadius: '20px', flexShrink: 0,
  },
  qaQuestionText: {
    fontSize: '14px', fontWeight: '600',
    color: '#111827', flex: 1,
  },
  qaToggle: { fontSize: '12px', color: '#6b7280', flexShrink: 0 },
  qaAnswer: {
    padding: '16px 20px',
    backgroundColor: '#f0fdf4',
    borderTop: '1px solid #dcfce7',
  },
  qaAnswerLabel: {
    fontSize: '12px', fontWeight: '700',
    color: '#16a34a', margin: '0 0 8px 0',
  },
  qaAnswerText: {
    fontSize: '14px', color: '#374151',
    lineHeight: '1.7', margin: 0,
  },
  navigation: {
    display: 'flex', justifyContent: 'space-between',
    gap: '12px', marginTop: '32px',
  },
  navBtn: {
    padding: '12px 24px', border: '1px solid #d1d5db',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', backgroundColor: 'white', color: '#374151',
  },
  navBtnPrimary: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a', color: 'white',
  },
}

export default TopicDetail