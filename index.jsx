# Anonymous 2-person WebRTC Chat (Next.js)

This single-file Next.js page implements a **serverless, anonymous 2-person chat** using WebRTC DataChannels and **manual copy/paste signaling** (no server required). Users can send text and emojis. Perfect to push to a GitHub repo and deploy to Vercel.

---

## How it works (short)
- One user clicks **Create Offer** → the page generates an SDP offer and shows a JSON string to copy.
- The other user pastes that offer into their page ("Paste Remote Offer") and clicks **Create Answer** → they copy the answer JSON and send it back (via chat/DM/Whatsapp).
- The first user pastes the answer into "Paste Remote Answer" and hits **Set Remote Answer**. Connection established.
- Messages and emojis go over the DataChannel.

This avoids needing any signaling server; users exchange the small JSON blobs manually.

---

## Files
Paste the code below into a Next.js project's `app/page.jsx` (Next 13 app router) or `pages/index.jsx` (older). This file contains both UI and logic.

---

```jsx
// app/page.jsx  (or pages/index.jsx)
'use client'
import React, { useRef, useState } from 'react'

export default function Page() {
  const pcRef = useRef(null)
  const dcRef = useRef(null)
  const [localSDP, setLocalSDP] = useState('')
  const [remoteSDP, setRemoteSDP] = useState('')
  const [connected, setConnected] = useState(false)
  const [logs, setLogs] = useState([])
  const [msg, setMsg] = useState('')
  const [chat, setChat] = useState([])

  function log(t, v) {
    setLogs(l => [...l, `${new Date().toLocaleTimeString()} — ${t}: ${v}`])
  }

  const EMOJIS = ['😀','😂','😍','🔥','👍','🙏','🎉','😢','🤝','🤯','💡','🚀','🌧️','🌞','🍕']

  async function createOffer() {
    pcRef.current = new RTCPeerConnection()
    const dc = pcRef.current.createDataChannel('chat')
    dcRef.current = dc
    setupDataChannel(dc)

    pcRef.current.onicecandidate = e => {
      if (!e.candidate) {
        // ICE complete — show SDP
        pcRef.current.localDescription && setLocalSDP(JSON.stringify(pcRef.current.localDescription))
        log('INFO','ICE complete — local description ready')
      }
    }

    const offer = await pcRef.current.createOffer()
    await pcRef.current.setLocalDescription(offer)
    log('INFO','Created offer')
  }

  function setupDataChannel(dc) {
    dc.onopen = () => { setConnected(true); log('DATA','DataChannel open') }
    dc.onclose = () => { setConnected(false); log('DATA','DataChannel closed') }
    dc.onmessage = e => {
      const text = e.data
      setChat(c => [...c, {from: 'them', text}])
      log('RECV', text)
    }
  }

  async function acceptOfferAndCreateAnswer(pasted) {
    try {
      const remote = JSON.parse(pasted)
      pcRef.current = new RTCPeerConnection()
      pcRef.current.ondatachannel = e => {
        dcRef.current = e.channel
        setupDataChannel(e.channel)
      }

      pcRef.current.onicecandidate = e => {
        if (!e.candidate) {
          pcRef.current.remoteDescription && setLocalSDP(JSON.stringify(pcRef.current.localDescription))
          log('INFO','ICE complete — answer ready')
        }
      }

      await pcRef.current.setRemoteDescription(remote)
      const answer = await pcRef.current.createAnswer()
      await pcRef.current.setLocalDescription(answer)
      log('INFO','Created answer')
    } catch (err) {
      log('ERROR','Invalid offer JSON')
    }
  }

  async function setRemoteAnswer(pasted) {
    try {
      const remote = JSON.parse(pasted)
      await pcRef.current.setRemoteDescription(remote)
      log('INFO','Remote answer set — connection should establish soon')
    } catch (err) {
      log('ERROR','Invalid answer JSON or connection missing')
    }
  }

  function sendMessage() {
    if (!dcRef.current || dcRef.current.readyState !== 'open') { log('WARN','DataChannel not open'); return }
    if (!msg) return
    dcRef.current.send(msg)
    setChat(c => [...c, {from: 'me', text: msg}])
    log('SENT', msg)
    setMsg('')
  }

  function sendEmoji(e) {
    if (!dcRef.current || dcRef.current.readyState !== 'open') { log('WARN','DataChannel not open'); return }
    dcRef.current.send(e)
    setChat(c => [...c, {from: 'me', text: e}])
    log('SENT', e)
  }

  return (
    <div style={{maxWidth:900,margin:'20px auto',fontFamily:'Inter,system-ui,Arial'}}>
      <h1 style={{fontSize:22, marginBottom:6}}>Anonymous 2‑person chat — WebRTC (manual signaling)</h1>
      <p style={{opacity:0.8}}>Create offer → copy → other user pastes → they create answer → copy back → paste answer. No server needed.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
        <div style={{padding:12,border:'1px solid #ddd',borderRadius:8}}>
          <h3>Create (caller)</h3>
          <button onClick={createOffer} style={{padding:'8px 12px',marginBottom:8}}>Create Offer</button>
          <div>
            <label>Local SDP (copy and send to other user)</label>
            <textarea readOnly value={localSDP} rows={6} style={{width:'100%'}} />
          </div>
          <div style={{marginTop:8}}>
            <label>Paste remote answer here</label>
            <textarea value={remoteSDP} onChange={e=>setRemoteSDP(e.target.value)} rows={4} style={{width:'100%'}} />
            <button onClick={()=>setRemoteAnswer(remoteSDP)} style={{marginTop:6}}>Set Remote Answer</button>
          </div>
        </div>

        <div style={{padding:12,border:'1px solid #ddd',borderRadius:8}}>
          <h3>Accept (responder)</h3>
          <div>
            <label>Paste remote offer here</label>
            <textarea id="offer" rows={6} style={{width:'100%'}} onChange={()=>{}} />
            <div style={{display:'flex',marginTop:6}}>
              <textarea id="offer2" placeholder='Or paste here and click Create Answer' rows={4} style={{flex:1}} />
            </div>
            <button onClick={()=>{
              const v = document.getElementById('offer2').value
              acceptOfferAndCreateAnswer(v)
            }} style={{marginTop:8}}>Create Answer</button>
          </div>

          <div style={{marginTop:10}}>
            <label>Local SDP (answer) — copy and send back to caller</label>
            <textarea readOnly value={localSDP} rows={6} style={{width:'100%'}} />
          </div>
        </div>
      </div>

      <div style={{marginTop:14,padding:12,border:'1px solid #ddd',borderRadius:8}}>
        <h3>Chat</h3>
        <div style={{minHeight:120, maxHeight:300, overflowY:'auto', padding:8, border:'1px solid #eee', borderRadius:6, background:'#fafafa'}}>
          {chat.map((c,i)=> (
            <div key={i} style={{textAlign: c.from==='me' ? 'right' : 'left', margin:'6px 0'}}>
              <div style={{display:'inline-block',padding:'8px 10px',borderRadius:12, background: c.from==='me' ? '#e6ffe6' : '#fff'}}>{c.text}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder='Type a message' style={{flex:1,padding:8}} onKeyDown={e=>{if(e.key==='Enter') sendMessage()}} />
          <button onClick={sendMessage} style={{padding:'8px 12px'}}>Send</button>
        </div>

        <div style={{marginTop:8}}>
          <div style={{marginBottom:6}}>Emoji quick pick:</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {EMOJIS.map((em, i) => (
              <button key={i} onClick={()=>sendEmoji(em)} style={{padding:8,borderRadius:8,border:'1px solid #ddd'}}> {em} </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{marginTop:12,padding:12,border:'1px dashed #ddd',borderRadius:8}}>
        <h4>Logs</h4>
        <div style={{maxHeight:160,overflowY:'auto',fontSize:13,opacity:0.9}}>
          {logs.map((l,i)=> <div key={i}>{l}</div>)}
        </div>
      </div>

      <div style={{marginTop:12,fontSize:13,opacity:0.9}}>
        <strong>Notes:</strong>
        <ul>
          <li>Manual signaling means you'll share the JSON strings via any messenger.</li>
          <li>Works peer-to-peer; both users need to be able to reach each other (NATs may affect connectivity). For best results, use networks without symmetric NAT. If direct connection fails, consider using a public STUN/TURN server — you can add them to the RTCPeerConnection config.</li>
        </ul>
      </div>
    </div>
  )
}
```

---

## Deployment
1. `npx create-next-app@latest my-chat` → pick app router (or pages). 
2. Replace `app/page.jsx` (or `pages/index.jsx`) content with the file above.
3. `git init`, `git add .`, `git commit -m "anonymous-webrtc-chat"` 
4. Push to GitHub and connect the repo to Vercel (Import Project) — Vercel auto-deploys Next.js apps.

That's it — you'll have a public URL. Share the URL with the second user and exchange offers/answers manually.

---

If you want, I can:
- Add STUN/TURN config and example TURN provider wiring,
- Replace manual signaling with a simple ephemeral signaling endpoint (you'd need a tiny server or a serverless DB), or
- Convert to a static HTML file that uses prompt-based offer/answer fields (if you prefer no Next.js).

Tell me which option and I'll update the code directly in this canvas.
