'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../../lib/api';

/* ── Floating orb background (different from login — orbiting geometry) ── */
function GeometryCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const rings = Array.from({ length: 4 }, (_, i) => ({
      r: 80 + i * 70, speed: 0.003 + i * 0.002, offset: i * Math.PI * 0.5,
      nodes: Array.from({ length: 5 + i * 3 }, (_, j) => ({ angle: (j / (5 + i * 3)) * Math.PI * 2 }))
    }));

    const tick = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width * 0.5, cy = canvas.height * 0.42;

      // Rings
      rings.forEach((ring, ri) => {
        const alpha = 0.06 - ri * 0.01;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r * (canvas.width / 600), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ring.nodes.forEach(node => {
          const a = node.angle + t * ring.speed + ring.offset;
          const nx = cx + Math.cos(a) * ring.r * (canvas.width / 600);
          const ny = cy + Math.sin(a) * ring.r * (canvas.width / 600);
          ctx.beginPath(); ctx.arc(nx, ny, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139,92,246,0.55)`; ctx.fill();
        });
      });

      // Subtle aurora pulse
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.5);
      grad.addColorStop(0, `rgba(99,102,241,${0.06 + Math.sin(t) * 0.025})`);
      grad.addColorStop(0.5, `rgba(139,92,246,${0.03 + Math.cos(t*0.7)*0.015})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function MagneticInput({ label, type='text', value, onChange, placeholder, required, IconSvg, hint }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div style={{ position:'relative' }}>
      <label style={{ position:'absolute', left:16, zIndex:10, pointerEvents:'none', fontFamily:'DM Mono,monospace', fontWeight:500, letterSpacing: lifted?'0.12em':'0.02em', textTransform:'uppercase', transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)', ...(lifted ? { top:10, fontSize:9, color:'#818cf8' } : { top:'50%', transform:'translateY(-50%)', fontSize:11, color:'rgba(255,255,255,0.2)' }) }}>
        {label}
      </label>
      <input type={type} value={value} onChange={onChange} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        required={required} placeholder={lifted ? placeholder : ''}
        style={{ width:'100%', paddingTop:28, paddingBottom:12, paddingLeft:16, paddingRight: IconSvg?44:16, fontSize:14, fontWeight:600, color:'white', background: focused?'rgba(99,102,241,0.07)':'rgba(255,255,255,0.04)', border: focused?'1px solid rgba(99,102,241,0.46)':'1px solid rgba(255,255,255,0.07)', borderRadius:12, outline:'none', boxShadow: focused?'0 0 0 3px rgba(99,102,241,0.1)':'none', transition:'all 0.25s', fontFamily:'inherit', boxSizing:'border-box' }} />
      {IconSvg && <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color: focused?'#818cf8':'rgba(255,255,255,0.15)', transition:'color 0.25s' }}><IconSvg /></div>}
      <div style={{ position:'absolute', bottom:0, left:'50%', transform:`translateX(-50%) scaleX(${focused?1:0})`, width:'90%', height:1.5, borderRadius:999, background:'linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)', transformOrigin:'center', transition:'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
      {hint && lifted && <p style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.18)', marginTop:5, letterSpacing:'0.06em' }}>{hint}</p>}
    </div>
  );
}

const PersonIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon  = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LockIcon   = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

const PERKS = [
  { icon:'📊', text:'Real-time profit & loss tracking' },
  { icon:'📦', text:'Inventory management with alerts' },
  { icon:'🧾', text:'One-click order & sales recording' },
  { icon:'⚡', text:'Live dashboard, zero setup' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [step, setStep]           = useState(0); // 0=idle, 1=success

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem('stockenza_token')) {
      router.replace('/dashboard');
      return;
    }
    setTimeout(() => setMounted(true), 60);
  }, [router]);


  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await api.post('/auth/register', { name, email, password });
      setStep(1); // show "check your email" banner — do NOT redirect
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true); setError('');
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

  const panelReady = { opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(28px)', transition: 'opacity 0.65s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.65s cubic-bezier(0.16,1,0.3,1) 0.1s' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        @keyframes perkIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes logoIn{from{opacity:0;transform:scale(0.75) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(0)}}
        @keyframes headIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes successPop{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 28px rgba(99,102,241,0.42)}50%{box-shadow:0 0 52px rgba(99,102,241,0.68),0 0 75px rgba(139,92,246,0.28)}}
        @keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex', overflow:'hidden', background:'#05050d', fontFamily:'Syne, sans-serif' }}>

        {/* LEFT PANEL — Perks & Visual */}
        <div className="hidden lg:flex" style={{ width:'46%', position:'relative', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 40%,#0c0a26 0%,#07071a 50%,#040410 100%)' }} />
          <GeometryCanvas />
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse at center,transparent 30%,rgba(4,4,14,0.8) 100%)' }} />
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.02, backgroundImage:'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />

          <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', height:'100%', padding:'44px 48px' }}>
            {/* Logo */}
            <div style={{ animation:'logoIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:14, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 28px rgba(99,102,241,0.7),inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <span style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em', color:'white' }}>
                Stock<span style={{ color:'#818cf8' }}>enza</span>
              </span>
            </div>

            <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ animation:'headIn 0.5s 0.2s both', marginBottom:10 }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:8 }}>FREE FOREVER · NO CREDIT CARD</div>
              </div>
              <h2 style={{ animation:'headIn 0.6s 0.28s both', fontSize:'clamp(1.8rem,3vw,2.5rem)', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.03em', color:'white', margin:'0 0 12px' }}>
                Start knowing your<br />
                <span style={{ background:'linear-gradient(118deg,#a5b4fc,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>numbers today.</span>
              </h2>
              <p style={{ animation:'headIn 0.6s 0.36s both', color:'rgba(255,255,255,0.28)', fontSize:14, lineHeight:1.72, marginBottom:36, maxWidth:300 }}>
                Everything a growing business needs to track performance — set up in under 3 minutes.
              </p>

              {/* Perk list */}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {PERKS.map((p, i) => (
                  <div key={p.text} style={{ display:'flex', alignItems:'center', gap:14, animation:`perkIn 0.55s cubic-bezier(0.16,1,0.3,1) ${0.45 + i*0.1}s both` }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{p.icon}</div>
                    <span style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.65)', letterSpacing:'-0.01em' }}>{p.text}</span>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div style={{ marginTop:36, animation:'headIn 0.5s 0.9s both', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ display:'flex' }}>
                  {['#6366f1','#8b5cf6','#ec4899','#f59e0b'].map((c,i) => (
                    <div key={i} style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${c},${c}cc)`, border:'2px solid #05050d', marginLeft: i>0?-8:0, zIndex:4-i, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, color:'white' }}>{['A','M','K','R'][i]}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.55)', lineHeight:1.2 }}>Joined by 500+ businesses</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.08em' }}>⭐⭐⭐⭐⭐ 4.9 / 5.0</div>
                </div>
              </div>
            </div>

            <p style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.1)', letterSpacing:'0.18em' }}>
              STOCKENZA © 2025 — GDPR COMPLIANT
            </p>
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 24px', position:'relative', background:'linear-gradient(155deg,#080810 0%,#09090e 100%)' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 65% 55% at 50% 50%,rgba(99,102,241,0.05),transparent)' }} />
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.016, backgroundImage:'radial-gradient(circle,rgba(255,255,255,1) 1px,transparent 0)', backgroundSize:'26px 26px' }} />

          <div style={{ position:'relative', width:'100%', maxWidth:400, ...panelReady }}>
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ marginBottom:36, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(99,102,241,0.5)' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <span style={{ fontSize:18, fontWeight:900, color:'white' }}>Stock<span style={{ color:'#818cf8' }}>enza</span></span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:'2rem', fontWeight:900, color:'white', letterSpacing:'-0.035em', lineHeight:1.1, margin:'0 0 8px' }}>
                Create your account
              </h2>
              <p style={{ fontFamily:'DM Mono,monospace', color:'rgba(255,255,255,0.22)', fontSize:11, letterSpacing:'0.02em', margin:0 }}>
                Free forever. No card required.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ animation:'shake 0.35s ease', marginBottom:16, padding:'12px 16px', borderRadius:12, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.22)', color:'#fca5a5', fontSize:13, display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ marginTop:1, flexShrink:0 }}>⚠</span>{error}
              </div>
            )}

            {/* Success */}
            {step === 1 && (
              <div style={{ marginBottom:16, padding:'16px', borderRadius:12, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)', color:'#6ee7b7', fontSize:13, display:'flex', alignItems:'flex-start', gap:12, animation:'successPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                <span style={{ fontSize:20, flexShrink:0 }}>✉️</span>
                <span>
                  <strong style={{ display:'block', marginBottom:3 }}>Registration successful!</strong>
                  Please check your email to verify your account before logging in.
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:11 }}>
              <MagneticInput label="Full Name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required IconSvg={PersonIcon} />
              <MagneticInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required IconSvg={EmailIcon} />
              <MagneticInput label="Password" type="password" placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required IconSvg={LockIcon} hint="MIN 6 CHARACTERS" />

              <div style={{ paddingTop:10 }}>
                <button type="submit" disabled={loading || step===1}
                  style={{ position:'relative', width:'100%', padding:'15px 24px', borderRadius:12, border:'none', cursor: (loading||step===1)?'not-allowed':'pointer', opacity: (loading||step===1)?0.65:1, background:'linear-gradient(135deg,#4338ca 0%,#6d28d9 55%,#4338ca 100%)', color:'white', fontSize:13, fontWeight:900, letterSpacing:'0.06em', textTransform:'uppercase', overflow:'hidden', fontFamily:'inherit', animation:'pulse-glow 2.5s ease-in-out infinite', transition:'transform 0.15s, opacity 0.2s', boxSizing:'border-box' }}
                  onMouseEnter={e => { if(!loading && step===0) e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='none'; }}
                >
                  <span style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', transform:'translateX(-100%)', animation:'shimmer 2.5s ease infinite', pointerEvents:'none' }} />
                  <span style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    {loading ? (
                      <><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Creating account…</>
                    ) : step === 1 ? (
                      <>✓ Check Your Email</>
                    ) : (
                      <>Get Started Free <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Google Sign-Up */}
            <div style={{ display:'flex', alignItems:'center', gap:16, margin:'18px 0 14px' }}>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.055))' }} />
              <span style={{ fontFamily:'DM Mono,monospace', color:'rgba(255,255,255,0.15)', fontSize:9, letterSpacing:'0.2em' }}>OR</span>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.055),transparent)' }} />
            </div>

            <button
              type="button"
              onClick={() => handleGoogleSignup()}
              disabled={googleLoading || loading || step === 1}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, width:'100%', padding:'13px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background: googleLoading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.75)', fontSize:13, fontWeight:700, cursor: (googleLoading||loading||step===1)?'not-allowed':'pointer', transition:'all 0.22s', fontFamily:'inherit', opacity: (googleLoading||loading||step===1)?0.65:1, boxSizing:'border-box' }}
              onMouseEnter={e => { if(!googleLoading&&!loading&&step===0){ e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
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

            {/* Terms */}
            <p style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.15)', textAlign:'center', marginTop:14, letterSpacing:'0.06em', lineHeight:1.6 }}>
              BY CONTINUING YOU AGREE TO OUR{' '}
              <span style={{ color:'rgba(129,140,248,0.6)', textDecoration:'underline', cursor:'pointer' }}>TERMS</span>
              {' & '}
              <span style={{ color:'rgba(129,140,248,0.6)', textDecoration:'underline', cursor:'pointer' }}>PRIVACY POLICY</span>
            </p>

            <div style={{ display:'flex', alignItems:'center', gap:16, margin:'22px 0' }}>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.055))' }} />
              <span style={{ fontFamily:'DM Mono,monospace', color:'rgba(255,255,255,0.15)', fontSize:9, letterSpacing:'0.2em' }}>ALREADY HAVE AN ACCOUNT?</span>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.055),transparent)' }} />
            </div>

            <Link href="/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:'14px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)', background:'transparent', color:'rgba(255,255,255,0.38)', fontSize:13, fontWeight:700, textDecoration:'none', transition:'all 0.2s', fontFamily:'inherit', boxSizing:'border-box' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; e.currentTarget.style.background='rgba(99,102,241,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.75)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.38)'; }}
            >
              Sign in instead <strong style={{ color:'#818cf8' }}>→</strong>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}