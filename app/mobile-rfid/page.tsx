'use client'

import { useState, useEffect } from 'react'
import styles from './MobileRFID.module.css'

interface ScanResult {
  success: boolean
  data?: {
    student: {
      id: number
      first_name: string
      middle_name: string | null
      last_name: string
      rfid_tag_uid: string
    }
    log: {
      id: number
      status: 'IN' | 'OUT'
      scan_time: string
    }
  }
  error?: string
}

interface AttendanceLog {
  studentName: string
  action: 'entry' | 'exit'
  timestamp: string
  cardId: string
}

export default function MobileRFIDPage() {
  const [isNFCSupported, setIsNFCSupported] = useState<boolean>(false)
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('Checking NFC support...')
  const [recentLogs, setRecentLogs] = useState<AttendanceLog[]>([])
  const [apiKey, setApiKey] = useState<string>('')
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  useEffect(() => {
    // Check if Web NFC API is supported
    if ('NDEFReader' in window) {
      setIsNFCSupported(true)
      setStatus('NFC Ready! Tap "Start Scanning" to begin')
    } else {
      setIsNFCSupported(false)
      setStatus('❌ Web NFC not supported. Use Chrome on Android.')
    }

    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('rfid_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setIsApiKeySet(true)
    }

    // Load recent logs from localStorage
    const savedLogs = localStorage.getItem('rfid_recent_logs')
    if (savedLogs) {
      setRecentLogs(JSON.parse(savedLogs))
    }
  }, [])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('rfid_api_key', apiKey.trim())
      setIsApiKeySet(true)
      setShowSettings(false)
      setStatus('✅ API Key saved! Ready to scan.')
    } else {
      alert('Please enter a valid API key')
    }
  }

  const sendToBackend = async (cardId: string): Promise<ScanResult> => {
    try {
      // Fetch API URL from server-side config endpoint
      const configResponse = await fetch('/api/config')
      if (!configResponse.ok) {
        console.error('Config fetch failed:', configResponse.status)
        return {
          success: false,
          error: 'Failed to get API configuration'
        }
      }
      
      const config = await configResponse.json()
      const backendUrl = config.apiUrl
      
      console.log('[Mobile RFID] Backend URL:', backendUrl)
      console.log('[Mobile RFID] Scanning card:', cardId)
    
      const response = await fetch(`${backendUrl}/rfid/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          rfid_tag_uid: cardId
        })
      })

      const data = await response.json()
      console.log('[Mobile RFID] Response:', data)
      return data
    } catch (error) {
      console.error('[Mobile RFID] Backend error:', error)
      return {
        success: false,
        error: `Failed to connect to server: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  const addToRecentLogs = (log: AttendanceLog) => {
    const updated = [log, ...recentLogs].slice(0, 10) // Keep last 10
    setRecentLogs(updated)
    localStorage.setItem('rfid_recent_logs', JSON.stringify(updated))
  }

  const startScanning = async () => {
    if (!isApiKeySet) {
      setStatus('⚠️ Please set API Key in settings first')
      setShowSettings(true)
      return
    }

    try {
      setIsScanning(true)
      setStatus('📱 Hold your RFID card near the phone...')

      // @ts-ignore - Web NFC API types not yet in TypeScript
      const ndef = new NDEFReader()
      await ndef.scan()

      setStatus('✅ Scanning active! Tap your card now...')

      ndef.addEventListener('reading', async ({ serialNumber }: any) => {
        // Format serial number (remove colons, make uppercase)
        const cardId = serialNumber.replace(/:/g, '').toUpperCase()
        
        setStatus(`🔄 Card detected: ${cardId}\nProcessing...`)

        // Vibrate for feedback
        if (navigator.vibrate) {
          navigator.vibrate(200)
        }

        // Send to backend
        const result = await sendToBackend(cardId)

        if (result.success && result.data) {
          const studentName = `${result.data.student.first_name} ${result.data.student.middle_name || ''} ${result.data.student.last_name}`.trim()
          const action = result.data.log.status === 'IN' ? 'entry' : 'exit'
          
          setStatus(`✅ Success!\n${studentName}\nAction: ${result.data.log.status}\nTime: ${new Date(result.data.log.scan_time).toLocaleTimeString()}`)

          // Add to recent logs
          addToRecentLogs({
            studentName,
            action,
            timestamp: result.data.log.scan_time,
            cardId
          })

          // Success vibration pattern
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
          }
        } else {
          setStatus(`❌ Error: ${result.error || 'Unknown error'}\nCard: ${cardId}`)
          
          // Error vibration
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200])
          }
        }

        // Auto-reset after 3 seconds
        setTimeout(() => {
          setStatus('✅ Scanning active! Tap your card now...')
        }, 3000)
      })

      ndef.addEventListener('readingerror', () => {
        setStatus('❌ Reading error. Try again.')
        setIsScanning(false)
      })

    } catch (error: any) {
      console.error('NFC Error:', error)
      
      if (error.name === 'NotAllowedError') {
        setStatus('❌ NFC permission denied. Please allow NFC access.')
      } else {
        setStatus(`❌ Error: ${error.message}`)
      }
      
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    setStatus('Scanning stopped. Tap "Start Scanning" to resume.')
  }

  const clearLogs = () => {
    if (confirm('Clear all recent logs?')) {
      setRecentLogs([])
      localStorage.removeItem('rfid_recent_logs')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📱 Mobile RFID Scanner</h1>
        <button 
          className={styles.settingsBtn}
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className={styles.settings}>
          <h3>Settings</h3>
          <label>
            API Key:
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className={styles.input}
            />
          </label>
          <button onClick={saveApiKey} className={styles.saveBtn}>
            Save API Key
          </button>
          <small>Get your API key from the backend .env file</small>
        </div>
      )}

      <div className={styles.statusCard}>
        <div className={styles.statusText}>
          {status.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      {!isNFCSupported ? (
        <div className={styles.notSupported}>
          <h2>⚠️ Web NFC Not Supported</h2>
          <p>Please use Chrome browser on Android device</p>
          <p>iOS Safari does not support Web NFC API yet</p>
        </div>
      ) : (
        <div className={styles.controls}>
          {!isScanning ? (
            <button 
              onClick={startScanning}
              className={`${styles.scanBtn} ${styles.start}`}
              disabled={!isApiKeySet}
            >
              🎯 Start Scanning
            </button>
          ) : (
            <button 
              onClick={stopScanning}
              className={`${styles.scanBtn} ${styles.stop}`}
            >
              ⏹️ Stop Scanning
            </button>
          )}
        </div>
      )}

      {recentLogs.length > 0 && (
        <div className={styles.logsSection}>
          <div className={styles.logsHeader}>
            <h3>Recent Scans</h3>
            <button onClick={clearLogs} className={styles.clearBtn}>
              Clear
            </button>
          </div>
          
          <div className={styles.logsList}>
            {recentLogs.map((log, index) => (
              <div key={index} className={styles.logItem}>
                <div className={styles.logIcon}>
                  {log.action === 'entry' ? '🟢' : '🔴'}
                </div>
                <div className={styles.logDetails}>
                  <div className={styles.logName}>{log.studentName}</div>
                  <div className={styles.logMeta}>
                    {log.action.toUpperCase()} • {new Date(log.timestamp).toLocaleString()}
                  </div>
                  <div className={styles.logCard}>Card: {log.cardId}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <p>📋 Instructions:</p>
        <ol>
          <li>Set your API key in settings</li>
          <li>Tap "Start Scanning"</li>
          <li>Hold RFID card near phone back</li>
          <li>Wait for confirmation</li>
        </ol>
        <p className={styles.note}>
          💡 Works best on Android Chrome with HTTPS connection
        </p>
      </div>
    </div>
  )
}
