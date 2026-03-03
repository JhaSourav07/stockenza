'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../../lib/api';

function AuroraCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const N = 55;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));
    const tick = () => {
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2 + t * 0.25;
        const len = canvas.height * 1.5;
        const grd = ctx.createLinearGradient(canvas.width*0.5, canvas.height*0.25, canvas.width*0.5 + Math.cos(angle)*len, canvas.height*0.25 + Math.sin(angle)*len);
        const hue = 245 + Math.sin(t + i) * 25;
        grd.addColorStop(0, `hsla(${hue},75%,62%,0.045)`);
        grd.addColorStop(0.5, `hsla(${hue+15},65%,55%,0.02)`);
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(canvas.width*0.5, canvas.height*0.25);
        ctx.arc(canvas.width*0.5, canvas.height*0.25, len, angle - Math.PI/9, angle + Math.PI/9);
        ctx.closePath();
        ctx.fillStyle = grd; ctx.fill();
      }
      for (let i = 0; i < N; i++) {
        for (let j = i+1; j < N; j++) {
          const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120,119,198,${0.17*(1-d/120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(139,92,246,0.5)'; ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function GlassCard({ icon, label, value, trend, color, delay }) {
  return (
    <div className="relative flex items-center gap-4 px-5 py-4 rounded-2xl overflow-hidden"
      style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(20px)', animation:`cardSlide 0.65s cubic-bezier(0.16,1,0.3,1) ${delay} both` }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.04),transparent)' }} />
      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full" style={{ background:color }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background:`${color}18`, border:`1px solid ${color}28` }}>{icon}</div>
      <div className="flex-1">
        <p style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2 }}>{label}</p>
        <p style={{ fontSize:18, fontWeight:900, color:'white', letterSpacing:'-0.02em' }}>{value}</p>
      </div>
      <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:20, color, background:`${color}18`, border:`1px solid ${color}25` }}>{trend}</div>
    </div>
  );
}

function MagneticInput({ label, type='text', value, onChange, placeholder, required, IconSvg }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className="relative">
      <label style={{ position:'absolute', left:16, zIndex:10, pointerEvents:'none', fontFamily:'DM Mono,monospace', fontWeight:500, letterSpacing:lifted?'0.12em':'0.02em', textTransform:'uppercase', transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)', ...(lifted ? { top:10, fontSize:9, color:'#818cf8' } : { top:'50%', transform:'translateY(-50%)', fontSize:11, color:'rgba(255,255,255,0.22)' }) }}>
        {label}
      </label>
      <input type={type} value={value} onChange={onChange} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        required={required} placeholder={lifted ? placeholder : ''}
        style={{ width:'100%', paddingTop:28, paddingBottom:12, paddingLeft:16, paddingRight:44, fontSize:14, fontWeight:600, color:'white', background: focused?'rgba(99,102,241,0.075)':'rgba(255,255,255,0.04)', border: focused?'1px solid rgba(99,102,241,0.48)':'1px solid rgba(255,255,255,0.07)', borderRadius:12, outline:'none', boxShadow: focused?'0 0 0 3px rgba(99,102,241,0.1),inset 0 1px 0 rgba(255,255,255,0.05)':'none', transition:'all 0.25s', fontFamily:'inherit' }} />
      {IconSvg && (
        <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color: focused?'#818cf8':'rgba(255,255,255,0.15)', transition:'all 0.25s', transformOrigin:'center' }}>
          <IconSvg />
        </div>
      )}
      <div style={{ position:'absolute', bottom:0, left:'50%', transform:`translateX(-50%) scaleX(${focused?1:0})`, width:'90%', height:1.5, borderRadius:999, background:'linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)', transformOrigin:'center', transition:'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

const EmailIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LockIcon  = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem('stockenza_token')) {
      router.replace('/dashboard');
      return;
    }
    setTimeout(() => setMounted(true), 60);
  }, [router]);


  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setIsUnverified(false);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('stockenza_token', data.token);
      localStorage.setItem('stockenza_user', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message || 'Invalid credentials.';
      if (status === 403) {
        setIsUnverified(true);
        setError(message);
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true); setError(''); setIsUnverified(false);
      try {
        const { data } = await api.post('/auth/google', { access_token: tokenResponse.access_token });
        localStorage.setItem('stockenza_token', data.token);
        localStorage.setItem('stockenza_user', JSON.stringify(data));
        window.location.href = '/dashboard';
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    },
    flow: 'implicit',
  });

  const formReady = { opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(28px)', transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes cardSlide{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:translateX(0)}}
        @keyframes headIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes logoIn{from{opacity:0;transform:scale(0.75) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 30px rgba(99,102,241,0.45)}50%{box-shadow:0 0 55px rgba(99,102,241,0.7),0 0 80px rgba(139,92,246,0.3)}}
        @keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
      `}</style>
      <div style={{ minHeight:'100vh', display:'flex', overflow:'hidden', background:'#05050d', fontFamily:'Syne, sans-serif' }}>

        {/* LEFT PANEL */}
        <div className="hidden lg:flex" style={{ width:'54%', position:'relative', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 45% 28%,#0d0b2b 0%,#07071b 45%,#040410 100%)' }} />
          <AuroraCanvas />
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse at center,transparent 35%,rgba(4,4,14,0.72) 100%)' }} />
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.022, backgroundImage:'radial-gradient(circle,rgba(255,255,255,1) 1px,transparent 0)', backgroundSize:'28px 28px' }} />

          <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', height:'100%', padding:'44px 52px' }}>
            {/* Logo */}
            <div style={{ animation:'logoIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:14, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 28px rgba(99,102,241,0.7),inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <span style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em', color:'white' }}>
                Stock<span style={{ color:'#818cf8' }}>enza</span>
              </span>
            </div>

            <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:350 }}>
              <div style={{ animation:'headIn 0.5s 0.22s both', display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.24)', marginBottom:24, width:'fit-content' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#818cf8', display:'inline-block', animation:'pulse 2s infinite' }} />
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'#a5b4fc', letterSpacing:'0.14em', fontWeight:500 }}>LIVE INTELLIGENCE</span>
              </div>

              <h1 style={{ animation:'headIn 0.6s 0.32s both', fontSize:'clamp(2.1rem,3.4vw,2.9rem)', fontWeight:900, lineHeight:1.04, letterSpacing:'-0.035em', margin:'0 0 18px' }}>
                <span style={{ color:'white' }}>See every<br /></span>
                <span style={{ background:'linear-gradient(118deg,#a5b4fc 0%,#c084fc 50%,#818cf8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>dollar move.</span>
                <br /><span style={{ color:'rgba(255,255,255,0.28)' }}>In real time.</span>
              </h1>

              <p style={{ animation:'headIn 0.6s 0.42s both', color:'rgba(255,255,255,0.28)', fontSize:14, lineHeight:1.75, marginBottom:32, maxWidth:285 }}>
                Inventory, orders, and profit — tracked live so you make decisions that actually move the needle.
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <GlassCard icon="📈" label="Revenue Today"  value="$4,280" trend="↑ 18%"  color="#818cf8" delay="0.52s" />
                <GlassCard icon="📦" label="Units in Stock" value="1,204"  trend="3 low"  color="#34d399" delay="0.64s" />
                <GlassCard icon="💰" label="Net Profit MTD" value="$9,140" trend="68% GM" color="#f472b6" delay="0.76s" />
              </div>
            </div>

            <p style={{ animation:'headIn 0.5s 0.95s both', fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.1)', letterSpacing:'0.18em' }}>
              STOCKENZA © 2025 — ALL DATA ENCRYPTED AT REST
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 24px', position:'relative', background:'linear-gradient(155deg,#08080f 0%,#09090e 100%)' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 65% 55% at 50% 50%,rgba(99,102,241,0.052),transparent)' }} />
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.018, backgroundImage:'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)', backgroundSize:'44px 44px' }} />

          <div style={{ position:'relative', width:'100%', maxWidth:400, ...formReady }}>
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ marginBottom:40, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(99,102,241,0.5)' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <span style={{ fontSize:18, fontWeight:900, color:'white' }}>Stock<span style={{ color:'#818cf8' }}>enza</span></span>
            </div>

            <div style={{ marginBottom:32 }}>
              <h2 style={{ fontSize:'2rem', fontWeight:900, color:'white', letterSpacing:'-0.035em', lineHeight:1.1, margin:'0 0 8px' }}>Welcome back</h2>
              <p style={{ fontFamily:'DM Mono,monospace', color:'rgba(255,255,255,0.22)', fontSize:11, letterSpacing:'0.03em', margin:0 }}>Sign in to your workspace →</p>
            </div>

            {error && !isUnverified && (
              <div style={{ animation:'shake 0.35s ease', marginBottom:18, padding:'12px 16px', borderRadius:12, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.22)', color:'#fca5a5', fontSize:13, display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ marginTop:1, flexShrink:0 }}>⚠</span>{error}
              </div>
            )}

            {isUnverified && (
              <div style={{ marginBottom:18, padding:'14px 16px', borderRadius:12, background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.25)', color:'#fde68a', fontSize:13, display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>✉️</span>
                <span>
                  <strong style={{ display:'block', marginBottom:3, color:'#fbbf24' }}>Email not verified</strong>
                  {error}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <MagneticInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required IconSvg={EmailIcon} />
              <MagneticInput label="Password" type="password" placeholder="Your secure password" value={password} onChange={e=>setPassword(e.target.value)} required IconSvg={LockIcon} />

              <div style={{ paddingTop:10 }}>
                <button type="submit" disabled={loading}
                  style={{ position:'relative', width:'100%', padding:'15px 24px', borderRadius:12, border:'none', cursor: loading?'not-allowed':'pointer', opacity: loading?0.65:1, background:'linear-gradient(135deg,#4338ca 0%,#6d28d9 55%,#4338ca 100%)', color:'white', fontSize:13, fontWeight:900, letterSpacing:'0.06em', textTransform:'uppercase', overflow:'hidden', fontFamily:'inherit', animation:'pulse-glow 2.5s ease-in-out infinite', transition:'transform 0.15s, opacity 0.2s' }}
                  onMouseEnter={e => { if(!loading) e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}
                  onMouseDown={e => { e.currentTarget.style.transform='scale(0.99)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform='translateY(-2px)'; }}
                >
                  <span style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', transform:'translateX(-100%)', animation: loading?'none':'shimmer 2.5s ease infinite', pointerEvents:'none' }} />
                  <span style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    {loading ? (
                      <><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Authenticating…</>
                    ) : (
                      <>Sign In to Stockenza <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Forgot password + resend verification helper links */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, flexWrap:'wrap', gap:8 }}>
              <Link href="/forgot-password"
                style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.25)', textDecoration:'none', letterSpacing:'0.06em', transition:'color 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.color='#818cf8'; }}
                onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.25)'; }}
              >
                Forgot Password?
              </Link>
              <Link href="/resend-verification"
                style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.25)', textDecoration:'none', letterSpacing:'0.06em', transition:'color 0.2s', textAlign:'right' }}
                onMouseEnter={e=>{ e.currentTarget.style.color='#818cf8'; }}
                onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.25)'; }}
              >
                Resend verification email
              </Link>
            </div>
            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:16, margin:'20px 0 16px' }}>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.055))' }} />
              <span style={{ fontFamily:'DM Mono,monospace', color:'rgba(255,255,255,0.15)', fontSize:9, letterSpacing:'0.2em' }}>OR</span>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.055),transparent)' }} />
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={googleLoading || loading}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, width:'100%', padding:'13px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background: googleLoading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.75)', fontSize:13, fontWeight:700, cursor: (googleLoading||loading)?'not-allowed':'pointer', transition:'all 0.22s', fontFamily:'inherit', opacity: (googleLoading||loading)?0.65:1 }}
              onMouseEnter={e => { if(!googleLoading&&!loading){ e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              {googleLoading ? (
                <span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.33 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.67 14.62 48 24 48z"/>
                </svg>
              )}
              {googleLoading ? 'Signing in…' : 'Continue with Google'}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:16, margin:'20px 0' }}>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.055))' }} />
              <span style={{ fontFamily:'DM Mono,monospace', color:'rgba(255,255,255,0.15)', fontSize:9, letterSpacing:'0.2em' }}>OR</span>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.055),transparent)' }} />
            </div>

            <Link href="/register" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:'14px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)', background:'transparent', color:'rgba(255,255,255,0.38)', fontSize:13, fontWeight:700, textDecoration:'none', transition:'all 0.2s', letterSpacing:'0.01em', fontFamily:'inherit' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; e.currentTarget.style.background='rgba(99,102,241,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.75)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.38)'; }}
            >
              No account? <strong style={{ color:'#818cf8', fontWeight:800 }}>Create one free</strong>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>

            <div style={{ marginTop:28, display:'flex', alignItems:'center', justifyContent:'center', gap:0 }}>
              {['256-bit SSL','No spam','Cancel anytime'].map((t, i) => (
                <span key={t} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'DM Mono,monospace', color:'rgba(255,255,255,0.12)', fontSize:9, letterSpacing:'0.1em', padding:'0 16px', borderRight: i<2?'1px solid rgba(255,255,255,0.07)':'' }}>
                  <span style={{ color:'rgba(99,102,241,0.5)', fontSize:10 }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}