'use client';

import { useEffect, useRef, useState } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { AttendanceLogWithStudent } from '@/types';

// ── Live Clock Hook ──────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function formatTime(d: Date) {
  const h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${pad(h12)} : ${pad(d.getMinutes())} : ${pad(d.getSeconds())} ${ampm}`;
}

function formatDate(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatLogTime(timeStr?: string) {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${pad(h12)}:${pad(d.getMinutes())} ${ampm}`;
}

// ── Audio Beep Sound via Web Audio API ───────────────────────────────────────
function playScanSound(status: 'IN' | 'OUT') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(status === 'IN' ? 880 : 587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(status === 'IN' ? 1760 : 440, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

// ── Recent Scan Item Card ───────────────────────────────────────────────────
function ScanCard({ log }: { log?: AttendanceLogWithStudent }) {
  const student = log?.Student;
  const photo = student?.profile_photo;
  const time = formatLogTime(log?.scan_time || log?.createdAt);

  return (
    <div style={{
      background: log ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
      border: '2px solid rgba(255, 255, 255, 0.18)',
      borderRadius: 12,
      overflow: 'hidden',
      padding: '8px 6px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      position: 'relative',
      boxShadow: log ? '0 4px 12px rgba(0,0,0,0.25)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {log && student ? (
        <>
          {photo ? (
            <img
              src={photo}
              alt={student.name}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #f8c22e',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          ) : (
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a2f7a, #c0504d)',
              border: '2px solid #f8c22e',
              display: 'grid',
              placeItems: 'center',
              fontSize: 20,
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {student.name ? student.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}

          <div style={{
            fontSize: 11,
            color: '#ffffff',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.1,
            maxHeight: 24,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
          }}>
            {student.name}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              background: log.status === 'IN' ? '#10b981' : '#ef4444',
              color: 'white',
              borderRadius: 4,
              padding: '1px 6px',
              letterSpacing: 0.5,
            }}>
              {log.status === 'IN' ? 'IN' : 'OUT'}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              {time}
            </span>
          </div>

          <div style={{
            width: '80%',
            height: 2,
            background: 'linear-gradient(90deg, #f8c22e, #f0a500)',
            borderRadius: 2,
            marginTop: 2,
          }} />
        </>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.3,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '2px dashed rgba(255,255,255,0.3)',
          }} />
          <div style={{ width: 50, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
        </div>
      )}
    </div>
  );
}

// ── Main Monitor Page ────────────────────────────────────────────────────────
export default function MonitorPage() {
  const now = useClock();
  const { data: logs = [], isLoading } = useAttendance(1000); // 1-second interval
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Latest scan drives the primary spotlight
  const latest = logs[0] ?? null;
  const recentScans = logs.slice(0, 6);

  // Flash animation & audio alert on new tap
  const prevIdRef = useRef<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (latest && String(latest.id) !== prevIdRef.current) {
      prevIdRef.current = String(latest.id);
      setFlash(true);
      if (soundEnabled) {
        playScanSound(latest.status);
      }
      const t = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(t);
    }
  }, [latest, soundEnabled]);

  const student = latest?.Student ?? null;
  const profilePhoto = student?.profile_photo ?? null;

  // Course or Grade/Section display formatting
  const courseOrYear = student?.course
    ? student.course.toUpperCase()
    : student
      ? [student.student_level, student.grade_level, student.section]
          .filter(Boolean)
          .join(' - ')
          .toUpperCase()
      : null;

  const rfidUid = student?.rfid_tag_uid || (latest as any)?.student_id || '—';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Hide dashboard layout when in fullscreen mode
  useEffect(() => {
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    
    if (isFullscreen) {
      if (sidebar) sidebar.style.display = 'none';
      if (mainContent) {
        mainContent.style.marginLeft = '0';
      }
    } else {
      if (sidebar) sidebar.style.display = 'flex';
      if (mainContent) {
        mainContent.style.marginLeft = '';
      }
    }
  }, [isFullscreen]);

  return (
    <div style={{
      position: isFullscreen ? 'fixed' : 'relative',
      inset: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, #1e3a8a 0%, #0f172a 70%, #020617 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, #1e1b4b 0%, #831843 50%, #78350f 100%)',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '4px solid #f8c22e',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}>
        {/* Logo & School Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img
            src="/bc-logo.png?v=2"
            alt="Benedicto College Logo"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
            style={{
              width: 58,
              height: 58,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
            }}
          />
          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              lineHeight: 1.1,
            }}>
              BENEDICTO COLLEGE
            </div>
            <div style={{
              fontSize: 12,
              color: '#f8c22e',
              fontWeight: 700,
              letterSpacing: 1,
              marginTop: 2,
            }}>
              RFID STUDENT MONITORING SYSTEM
            </div>
          </div>
        </div>

        {/* Live Indicator & Quick Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(v => !v)}
            title={soundEnabled ? "Mute audio beep" : "Unmute audio beep"}
            style={{
              background: soundEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${soundEnabled ? '#10b981' : 'rgba(255,255,255,0.3)'}`,
              color: 'white',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span>{soundEnabled ? '🔔 Sound ON' : '🔕 Muted'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(248, 194, 46, 0.2)',
              border: '1px solid #f8c22e',
              color: '#f8c22e',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
          </button>

          {/* Live Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,0,0,0.3)',
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#10b981' }}>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* ── Content Grid ──────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 0,
        minHeight: 0,
      }}>
        {/* ── Left Side: Main Student Spotlight ───────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 36px',
          gap: 40,
          background: flash ? 'rgba(248, 194, 46, 0.12)' : 'transparent',
          transition: 'background 0.3s ease',
          position: 'relative',
        }}>
          {/* Photo & Name Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            minWidth: 260,
          }}>
            {/* Student Photo Frame */}
            <div style={{
              width: 220,
              height: 250,
              background: 'rgba(15, 23, 42, 0.8)',
              border: flash ? '5px solid #f8c22e' : '4px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: flash
                ? '0 0 40px rgba(248, 194, 46, 0.8)'
                : '0 12px 36px rgba(0,0,0,0.6)',
              transition: 'all 0.3s ease',
            }}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={student?.name ?? 'Student Photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : isLoading ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 48 }}>⏳</div>
              ) : student ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 72,
                  fontWeight: 900,
                  color: '#f8c22e',
                  textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}>
                  {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 56 }}>👤</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Tap RFID Card</span>
                </div>
              )}
            </div>

            {/* Student Name & Course */}
            <div style={{ textAlign: 'center', maxWidth: 320 }}>
              <div style={{
                fontSize: 26,
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                lineHeight: 1.2,
                marginBottom: 8,
                letterSpacing: 0.5,
              }}>
                {student?.name ?? (isLoading ? 'Loading...' : 'Ready for Scan')}
              </div>

              {courseOrYear && (
                <div style={{
                  background: 'linear-gradient(90deg, #f8c22e, #f0a500)',
                  color: '#0f172a',
                  fontWeight: 900,
                  fontSize: 14,
                  padding: '6px 16px',
                  borderRadius: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  boxShadow: '0 4px 12px rgba(248,194,46,0.3)',
                  display: 'inline-block',
                }}>
                  {courseOrYear}
                </div>
              )}

              {latest && (
                <div style={{
                  marginTop: 10,
                  display: 'inline-block',
                  background: latest.status === 'IN'
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: 15,
                  padding: '5px 22px',
                  borderRadius: 20,
                  boxShadow: `0 0 16px ${latest.status === 'IN' ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)'}`,
                  letterSpacing: 1,
                }}>
                  {latest.status === 'IN' ? '✓ CHECKED IN' : '← CHECKED OUT'}
                </div>
              )}
            </div>
          </div>

          {/* ID Box & Clock Panel */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            minWidth: 320,
          }}>
            {/* ID Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #1e3a8a, #831843)',
                padding: '8px 20px',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: 'white',
                letterSpacing: 2,
              }}>
                ID NO.
              </div>
              <div style={{
                padding: '16px 28px',
                textAlign: 'center',
                fontSize: 32,
                fontWeight: 900,
                color: '#f8c22e',
                letterSpacing: 3,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                {rfidUid}
              </div>
            </div>

            {/* Day & Live Clock Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #1e3a8a, #831843)',
                padding: '8px 20px',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: 'white',
                letterSpacing: 2,
              }}>
                {DAYS[now.getDay()]}
              </div>
              <div style={{
                padding: '16px 28px',
                textAlign: 'center',
                fontSize: 32,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: 2,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}>
                {formatTime(now)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Side: Recent Scans Panel ───────────────────────────────── */}
        <div style={{
          background: 'rgba(2, 6, 23, 0.4)',
          borderLeft: '2px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(8px)',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px 8px',
            fontSize: 12,
            fontWeight: 800,
            color: '#f8c22e',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            RECENT SCANS
          </div>

          {/* 6 Grid Slots (2x3) */}
          <div style={{
            flex: 1,
            padding: 12,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            alignContent: 'start',
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ScanCard key={i} log={recentScans[i]} />
            ))}
          </div>

          {/* Date Footer */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            {formatDate(now)}
          </div>
        </div>
      </div>

      {/* ── Bottom Status Bar ─────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(2, 6, 23, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '10px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: 600,
      }}>
        <span>
          Total Scans Today: <strong style={{ color: '#f8c22e', fontSize: 14 }}>{logs.length}</strong>
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          ⚡ Auto-syncing real-time RFID reader logs
        </span>
        <span>
          Checked In: <strong style={{ color: '#10b981', fontSize: 14 }}>{logs.filter(l => l.status === 'IN').length}</strong>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          Checked Out: <strong style={{ color: '#ef4444', fontSize: 14 }}>{logs.filter(l => l.status === 'OUT').length}</strong>
        </span>
      </div>
    </div>
  );
}