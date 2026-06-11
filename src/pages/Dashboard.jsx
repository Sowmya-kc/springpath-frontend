import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [topics, setTopics] = useState([])
  const [progress, setProgress] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [topicsRes, progressRes, statsRes] = await Promise.all([
        api.get('/api/topics'),
        api.get('/api/progress'),
        api.get('/api/progress/stats'),
      ])
      setTopics(topicsRes.data)
      setProgress(progressRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }

  const getTopicStatus = (topicId) => {
    const p = progress.find((p) => p.topicId === topicId)
    return p ? p.status : 'NOT_STARTED'
  }

  const handleStatusChange = async (topicId, status) => {
    try {
      await api.post('/api/progress', { topicId, status })
      fetchData()
    } catch (err) {
      console.error('Failed to update progress', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const statusColor = {
    NOT_STARTED: '#6b7280',
    IN_PROGRESS: '#d97706',
    COMPLETED: '#16a34a',
  }

  const statusLabel = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  }

  const difficultyColor = {
    BEGINNER: '#16a34a',
    INTERMEDIATE: '#d97706',
    ADVANCED: '#dc2626',
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading your roadmap...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navLogo}>🌱 SpringPath</h1>
        <div style={styles.navRight}>
          <span style={styles.navUser}>Hi, {user?.name} 👋</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Stats Bar */}
      {stats && (
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.completedTopics}</span>
            <span style={styles.statLabel}>Completed</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.inProgressTopics}</span>
            <span style={styles.statLabel}>In Progress</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.totalTopics}</span>
            <span style={styles.statLabel}>Total Topics</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>
              {stats.totalTopics > 0
                ? Math.round((stats.completedTopics / stats.totalTopics) * 100)
                : 0}%
            </span>
            <span style={styles.statLabel}>Complete</span>
          </div>
        </div>
      )}

      {/* Topics */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Your Spring Boot Roadmap</h2>
        <div style={styles.topicsList}>
          {topics.map((topic) => {
            const status = getTopicStatus(topic.id)
            return (
              <div key={topic.id} style={styles.topicCard}>

                <div style={styles.topicHeader}>
                  <div style={styles.topicLeft}>
                    <span style={styles.orderBadge}>#{topic.orderIndex}</span>
                    <span
                      style={{
                        ...styles.difficultyBadge,
                        backgroundColor: difficultyColor[topic.difficulty] + '20',
                        color: difficultyColor[topic.difficulty],
                      }}
                    >
                      {topic.difficulty}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      color: statusColor[status],
                      backgroundColor: statusColor[status] + '15',
                    }}
                  >
                    {statusLabel[status]}
                  </span>
                </div>

               <h3
  style={{...styles.topicTitle, cursor: 'pointer', color: '#16a34a'}}
  onClick={() => navigate(`/topic/${topic.id}`)}
>
  {topic.title} →
</h3>
                <p style={styles.topicDescription}>{topic.description}</p>

                <div style={styles.whySection}>
                  <p style={styles.whyTitle}>💡 Why learn this?</p>
                  <p style={styles.whyText}>{topic.whyLearn}</p>
                </div>

                <div style={styles.whereSection}>
                  <p style={styles.whereTitle}>🔧 Where it's used</p>
                  <p style={styles.whereText}>{topic.whereUsed}</p>
                </div>

                <div style={styles.topicActions}>
                  <button
                    style={{
                      ...styles.actionBtn,
                      backgroundColor: status === 'IN_PROGRESS' ? '#fef3c7' : 'white',
                      borderColor: '#d97706',
                      color: '#d97706',
                    }}
                    onClick={() => handleStatusChange(topic.id, 'IN_PROGRESS')}
                  >
                    In Progress
                  </button>
                  <button
                    style={{
                      ...styles.actionBtn,
                      backgroundColor: status === 'COMPLETED' ? '#dcfce7' : 'white',
                      borderColor: '#16a34a',
                      color: '#16a34a',
                    }}
                    onClick={() => handleStatusChange(topic.id, 'COMPLETED')}
                  >
                    ✓ Mark Complete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9fafb' },
  loadingContainer: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  navbar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 32px',
    backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  navLogo: { color: '#16a34a', fontSize: '22px', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { fontSize: '14px', color: '#374151' },
  logoutBtn: {
    padding: '8px 16px', backgroundColor: 'white',
    border: '1px solid #d1d5db', borderRadius: '8px',
    cursor: 'pointer', fontSize: '14px', color: '#374151',
  },
  statsBar: {
    display: 'flex', gap: '16px', padding: '24px 32px',
    backgroundColor: 'white', borderBottom: '1px solid #e5e7eb',
  },
  statCard: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '12px 24px',
    backgroundColor: '#f0fdf4', borderRadius: '10px', minWidth: '100px',
  },
  statNumber: { fontSize: '28px', fontWeight: '700', color: '#16a34a' },
  statLabel: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  content: { padding: '32px' },
  sectionTitle: { fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' },
  topicsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  topicCard: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
  },
  topicHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  topicLeft: { display: 'flex', gap: '8px', alignItems: 'center' },
  orderBadge: {
    fontSize: '12px', fontWeight: '600', color: '#6b7280',
    backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px',
  },
  difficultyBadge: {
    fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
  },
  statusBadge: {
    fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px',
  },
  topicTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' },
  topicDescription: { fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '16px' },
  whySection: { backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', marginBottom: '10px' },
  whyTitle: { fontSize: '13px', fontWeight: '600', color: '#92400e', margin: '0 0 4px 0' },
  whyText: { fontSize: '13px', color: '#78350f', margin: 0, lineHeight: '1.5' },
  whereSection: { backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  whereTitle: { fontSize: '13px', fontWeight: '600', color: '#1e40af', margin: '0 0 4px 0' },
  whereText: { fontSize: '13px', color: '#1e3a8a', margin: 0, lineHeight: '1.5' },
  topicActions: { display: 'flex', gap: '10px' },
  actionBtn: {
    padding: '8px 16px', border: '1.5px solid',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
  },
}

export default Dashboard