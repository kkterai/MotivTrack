import { useState } from "react";

const INITIAL_TASKS = [
  { id:1, label:"Take out trash", pts:1, status:"pending", icon:"🗑️", desc:"Remove the full bag, tie it, take it outside, and put a new liner in.", tips:["Tie the bag tight so nothing spills on the way out","Check if other bins need emptying too","New liners are under the kitchen sink"], done:"Bag removed, tied, taken outside, new liner in place.", extraWellDone:"All indoor bins checked, liner fitted neatly, bin wiped down." },
  { id:2, label:"Clean bathroom sink", pts:2, status:"pending", icon:"🚿", desc:"Wipe the basin, faucet, and counter with a damp cloth and cleaner.", tips:["Spray cleaner and let it sit 30 sec before wiping","Use a dry cloth at the end so it shines","Don't forget the faucet handles"], done:"Basin wiped clean, no soap residue, faucet wiped.", extraWellDone:"Counter cleared, mirror spot-cleaned, fresh hand towel put out." },
  { id:3, label:"Complete homework", pts:3, status:"pending", icon:"📚", desc:"Finish all assigned work for every subject, showing your work where needed.", tips:["Start with the hardest subject first","Try 25 min work + 5 min break (Pomodoro)","Write each subject down as you finish it"], done:"All assignments done, name on each page, packed in bag.", extraWellDone:"Work double-checked, assignments organised by subject." },
  { id:4, label:"Make bed", pts:1, status:"pending", icon:"🛏️", desc:"Pull up the sheets and duvet, straighten pillows, make it look tidy.", tips:["Pull the sheet tight before doing the duvet","Fluff pillows by punching them a couple times","It only takes 2 minutes once you get fast!"], done:"Duvet up and flat, pillows in place, no clothes on bed.", extraWellDone:"Sheets tucked in, pillows arranged, clutter cleared around bed." },
  { id:5, label:"Load dishwasher", pts:2, status:"pending", icon:"🍽️", desc:"Load dirty dishes, add a tablet, and run a cycle if full.", tips:["Scrape food into the bin first","Cups go upside down on the top rack","Check the tablet dispenser before adding one"], done:"All dishes loaded, tablet in, cycle started.", extraWellDone:"Sink wiped down, counter cleared, previous clean load put away." },
  { id:6, label:"Feed the dog", pts:1, status:"pending", icon:"🐕", desc:"Give the right amount of food morning and evening, top up water bowl.", tips:["One full scoop per meal — scoop is in the food bag","Check the water bowl every time, not just when empty","Tell a parent if the dog skipped a meal"], done:"Food given both meals, water bowl checked and refilled.", extraWellDone:"Bowls rinsed and refilled (not just topped up)." },
];

const INITIAL_REWARDS = [
  { id:1, label:"Pizza Night", pts:10, icon:"🍕", category:"Food", buyLink:"", needsScheduling:true },
  { id:2, label:"Extra Screen Time", pts:8, icon:"🎮", category:"Free Time", buyLink:"", needsScheduling:false },
  { id:3, label:"Movie Pick", pts:6, icon:"🎬", category:"Activity", buyLink:"", needsScheduling:true },
  { id:4, label:"$5 Cash", pts:12, icon:"💵", category:"Money", buyLink:"", needsScheduling:false },
  { id:5, label:"Hobby Supplies", pts:15, icon:"🎨", category:"Supplies", buyLink:"https://www.amazon.com/s?k=art+supplies+kids", needsScheduling:false },
  { id:6, label:"Sleep-In Pass", pts:5, icon:"😴", category:"Free Time", buyLink:"", needsScheduling:false },
];

const GOAL = 20;
const P = "#20A464", Y = "#F5BA14", G = "#20A464", O = "#EDA306", MU = "#6B7A6B", BD = "#C8EDD8";
const fmtPts = n => Number.isInteger(n) ? String(n) : n.toFixed(1);

function ChildView({ tasks, setTasks, points, setPoints, redeemed, setRedeemed, rewards, bonusAwarded, dateRequests, setDateRequests, dismissedAlerts, setDismissedAlerts, teacherReports, today, todayKey }) {
  const [tab, setTab] = useState("tasks");
  const [expanded, setExpanded] = useState(null);
  const [quality, setQuality] = useState({});
  const [celebrate, setCelebrate] = useState(false);
  const [schedulingReward, setSchedulingReward] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [reschedulingReqId, setReschedulingReqId] = useState(null); // which declined req we're rescheduling

  const doneCt = tasks.filter(t => t.status === "approved").length;
  const pct = Math.min((points / GOAL) * 100, 100);

  function submit(id) {
    const q = quality[id] || "done";
    setTasks(prev => prev.map(t => t.id === id && (t.status === "pending" || t.status === "redo") ? { ...t, status: "awaiting", submittedQuality: q } : t));
    setExpanded(null);
  }

  function redeem(r) {
    if (points < r.pts) return;
    if (r.needsScheduling) {
      // Deduct points and send a scheduling request to parent inbox
      setPoints(p => p - r.pts);
      setDateRequests(prev => [...prev, {
        id: Date.now(),
        reward: r,
        status: "pending",
        submittedAt: new Date().toLocaleTimeString(),
        proposedDate: "",
        proposedTime: "",
        calendarConfirmed: false,
      }]);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
    } else {
      setPoints(p => p - r.pts);
      setRedeemed(p => [...p, { ...r, at: new Date().toLocaleTimeString() }]);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
    }
  }

  function confirmSchedule() {
    if (!scheduledDate) return;
    if (reschedulingReqId) {
      // Replace the old declined request with a fresh pending one
      setDateRequests(prev => prev.map(r => r.id === reschedulingReqId
        ? { ...r, proposedDate: scheduledDate, status: "pending", submittedAt: new Date().toLocaleTimeString(), parentNote: "" }
        : r
      ));
      // Mark the alert as dismissed since Grace has acted on it
      setDismissedAlerts(d => [...d, reschedulingReqId]);
      setReschedulingReqId(null);
    } else {
      setDateRequests(prev => [...prev, {
        id: Date.now(),
        reward: schedulingReward,
        proposedDate: scheduledDate,
        status: "pending",
        submittedAt: new Date().toLocaleTimeString(),
      }]);
    }
    setSchedulingReward(null);
    setScheduledDate("");
  }

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      {celebrate && <div style={{ position:"fixed", top:"38%", left:"50%", transform:"translate(-50%,-50%)", fontSize:40, zIndex:999, pointerEvents:"none" }}>🎉✨🌟🎊</div>}

      {/* Decline notifications */}
      {dateRequests.filter(r => r.status === "declined" && !dismissedAlerts.includes(r.id)).map(req => (
        <div key={req.id} style={{ background:"linear-gradient(135deg,#FEF3D0,#FEF3D0)", borderBottom:"2px solid #FFBBD0", padding:"12px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ fontSize:26, flexShrink:0 }}>📬</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:900, fontSize:14, color:"#CC4400" }}>Date not available</div>
            <div style={{ fontSize:12, fontWeight:600, color:"#0D3D20", marginTop:2 }}>
              <b>{req.reward.label}</b> · {new Date(req.proposedDate + "T12:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })} didn't work
            </div>
            {req.parentNote && (
              <div style={{ fontSize:12, color:"#CC4400", fontStyle:"italic", marginTop:3 }}>"{req.parentNote}"</div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button
                onClick={() => {
                  setReschedulingReqId(req.id);
                  setSchedulingReward(req.reward);
                  setScheduledDate("");
                  setDismissedAlerts(d => [...d, req.id]);
                }}
                style={{ padding:"7px 14px", background:"#CC4400", color:"#fff", border:"none", borderRadius:10, fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}
              >
                📅 Pick a new date
              </button>
              <button
                onClick={() => setDismissedAlerts(d => [...d, req.id])}
                style={{ padding:"7px 10px", background:"rgba(0,0,0,0.07)", color:"#666", border:"none", borderRadius:10, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Scheduling modal */}
      {schedulingReward && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,26,46,0.55)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:22, padding:24, width:"100%", maxWidth:380, display:"flex", flexDirection:"column", gap:14, boxShadow:"0 12px 48px rgba(0,0,0,0.25)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:36 }}>{schedulingReward.icon}</span>
              <div>
                <div style={{ fontWeight:900, fontSize:17, color:"#0D3D20" }}>
                  {reschedulingReqId ? "Pick a new date" : "When should this happen?"}
                </div>
                <div style={{ fontSize:13, color:MU, marginTop:2 }}>{schedulingReward.label}</div>
              </div>
            </div>
            <div style={{ fontSize:13, color:MU, fontWeight:600, background:"#EAFDD8", borderRadius:12, padding:"10px 12px" }}>
              {reschedulingReqId
                ? "Your parent couldn't make that date — pick a new one to send them."
                : "🎉 You've earned this reward! Pick a date with your parent so it gets scheduled."
              }
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:6 }}>📅 Pick a date</div>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={{ border:`2px solid ${scheduledDate?P:BD}`, borderRadius:12, padding:"10px 14px", fontFamily:"inherit", fontSize:14, fontWeight:600, color:"#0D3D20", outline:"none", width:"100%", boxSizing:"border-box" }}
              />
              {scheduledDate && (
                <div style={{ fontSize:13, fontWeight:700, color:G, background:"#EAFDD8", padding:"8px 12px", borderRadius:10, marginTop:8 }}>
                  📅 {new Date(scheduledDate + "T12:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={confirmSchedule}
                disabled={!scheduledDate}
                style={{ flex:1, padding:13, background:scheduledDate?P:"#D6EDE1", color:scheduledDate?"#fff":MU, border:"none", borderRadius:14, fontWeight:900, fontSize:14, cursor:scheduledDate?"pointer":"not-allowed", fontFamily:"inherit" }}
              >
                {scheduledDate ? "📨 Send to Parent for Approval" : "Pick a date first"}
              </button>
              <button
                onClick={() => { setSchedulingReward(null); setScheduledDate(""); setReschedulingReqId(null); }}
                style={{ padding:"13px 16px", background:"#E0F2E9", color:MU, border:"none", borderRadius:14, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {bonusAwarded && <div style={{ background:`linear-gradient(90deg,${Y},#EDA306)`, padding:"10px 16px", textAlign:"center", fontWeight:800, fontSize:13, color:"#0D3D20" }}>⭐ Bonus points awarded for all Extra Well Done!</div>}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 16px", background:"linear-gradient(135deg,#146735,#20A464)", color:"#fff" }}>
        <div style={{ width:50, height:50, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, border:"2px solid rgba(255,255,255,0.35)", flexShrink:0 }}>🦊</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:20 }}>Hey, Grace!</div>
          <div style={{ fontSize:12, opacity:0.8 }}>Keep crushing it today</div>
        </div>
        <div style={{ background:Y, borderRadius:12, padding:"6px 14px", textAlign:"center", color:"#0D3D20" }}>
          <div style={{ fontWeight:900, fontSize:26, lineHeight:1 }}>{fmtPts(points)}</div>
          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase" }}>pts</div>
        </div>
      </div>

      {/* Progress bars */}
      <div style={{ background:"#fff", padding:"14px 16px", borderBottom:`1px solid ${BD}` }}>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, color:MU, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>
            <span>Tasks Done</span><span>{doneCt} / {tasks.length}</span>
          </div>
          <div style={{ height:14, background:"#EAFDD8", borderRadius:999, position:"relative" }}>
            <div style={{ height:"100%", width:tasks.length > 0 ? `${(doneCt/tasks.length)*100}%` : "0%", background:"linear-gradient(90deg,#146735,#20A464)", borderRadius:999, transition:"width 0.5s cubic-bezier(.34,1.56,.64,1)", minWidth: doneCt > 0 ? 14 : 0 }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:"#fff", borderBottom:`1px solid ${BD}` }}>
        {[["tasks","📋 Tasks"],["rewards","🎁 Rewards"],["school","🏫 School"],["history","📜 History"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ flex:1, padding:"11px 4px", border:"none", borderBottom:`3px solid ${tab===v?P:"transparent"}`, background:"none", fontWeight:800, fontSize:11, color:tab===v?P:MU, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:14, display:"flex", flexDirection:"column", gap:10 }}>

        {/* Tasks */}
        {tab === "tasks" && tasks.map(task => {
          const open = expanded === task.id;
          const q = quality[task.id] || "done";
          return (
            <div key={task.id} style={{ background: task.status==="approved"?"#E0F5EA": task.status==="awaiting"?"#FEFAE8": task.status==="redo"?"#FEF3D0":"#fff", borderRadius:18, boxShadow:"0 4px 20px rgba(32,164,100,0.08)", border:`2px solid ${task.status==="approved"?"#20A464":task.status==="awaiting"?Y:task.status==="redo"?"#CC4400":"transparent"}`, overflow:"hidden" }}>
              <div onClick={() => (task.status==="pending"||task.status==="redo") && setExpanded(open?null:task.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px", cursor:(task.status==="pending"||task.status==="redo")?"pointer":"default" }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{task.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0D3D20", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.label}</div>
                  <div style={{ fontSize:11, color:MU, marginTop:2, lineHeight:1.3 }}>{task.desc}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                  <span style={{ fontWeight:900, fontSize:13, color:P }}>+{task.pts}pt{task.pts>1?"s":""}</span>
                  {(task.status==="pending"||task.status==="redo") && <span style={{ fontSize:10, color:MU }}>{open?"▲":"▼"}</span>}
                  {task.status==="awaiting" && <span style={{ fontSize:11, fontWeight:700, background:"#FEFAE8", color:"#147A48", padding:"3px 8px", borderRadius:20 }}>⏳ Review</span>}
                  {task.status==="redo" && <span style={{ fontSize:11, fontWeight:700, background:"#FEF3D0", color:"#CC4400", padding:"3px 8px", borderRadius:20 }}>🔄 Try again</span>}
                  {task.status==="approved" && <span style={{ fontSize:11, fontWeight:700, background:"#C8EDD8", color:"#147A48", padding:"3px 8px", borderRadius:20 }}>{task.approvedQuality==="extra"?"⭐ Extra Well Done!":"✅ Done!"}</span>}
                </div>
              </div>
              {open && (task.status==="pending"||task.status==="redo") && (
                <div style={{ borderTop:`1px solid ${BD}`, padding:14, display:"flex", flexDirection:"column", gap:10, background:"#EAFDD8" }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:6 }}>💡 Tips</div>
                    {task.tips.map((tip,i) => <div key={i} style={{ fontSize:12, fontWeight:600, padding:"6px 10px", background:"#fff", borderRadius:10, borderLeft:`3px solid ${Y}`, color:"#0D3D20", marginBottom:4 }}>{tip}</div>)}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["done","✅","Done"],["extra","⭐","Extra Well Done"]].map(([v,ic,lb]) => (
                      <button key={v} onClick={() => setQuality(p=>({...p,[task.id]:v}))} style={{ flex:1, padding:"9px 6px", border:`2px solid ${q===v?G:BD}`, borderRadius:14, background:q===v?"#E0F5EA":"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontFamily:"inherit" }}>
                        <span style={{ fontSize:18, filter: v==="extra" ? "grayscale(1) sepia(1) hue-rotate(90deg) saturate(2)" : "none" }}>{ic}</span>
                        <span style={{ fontSize:11, fontWeight:800, color:"#0D3D20" }}>{lb}</span>
                        <span style={{ fontWeight:900, fontSize:13, color:P }}>+{v==="extra" ? "0.5" : task.pts} pts</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["done","✅ Done means…"],["extra","extra"]].map(([v,lb]) => (
                      <div key={v} style={{ flex:1, padding:"9px 11px", borderRadius:12, border:`2px solid ${q===v?G:BD}`, background:"#fff", opacity:q===v?1:0.5, transition:"all 0.2s" }}>
                        <div style={{ fontSize:10, fontWeight:800, color:q===v?G:MU, marginBottom:3 }}>
                          {v==="extra"
                            ? <><span style={{ filter:"grayscale(1) sepia(1) hue-rotate(90deg) saturate(2)" }}>⭐</span>{" Extra well done…"}</>
                            : lb
                          }
                        </div>
                        <div style={{ fontSize:11, fontWeight:600, color:"#0D3D20", lineHeight:1.4 }}>{v==="done"?task.done:task.extraWellDone}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => submit(task.id)} style={{ width:"100%", padding:12, background:P, color:"#fff", border:"none", borderRadius:14, fontWeight:900, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                    Mark as {q==="extra"?"⭐ Extra Well Done!":"✅ Done!"}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Rewards */}
        {tab === "rewards" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {rewards.map(r => {
              const can = points >= r.pts;
              return (
                <div key={r.id} style={{ background:"#fff", borderRadius:18, padding:"14px 10px", textAlign:"center", boxShadow:"0 4px 20px rgba(32,164,100,0.08)", border:`2px solid ${can?Y:"transparent"}`, opacity:can?1:0.7, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:30 }}>{r.icon}</span>
                  <div style={{ fontWeight:800, fontSize:13, color:"#0D3D20" }}>{r.label}</div>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:MU, letterSpacing:"0.05em" }}>{r.category}</div>
                  <div style={{ fontWeight:900, fontSize:16, color:P }}>{r.pts} pts</div>
                  {r.needsScheduling && (
                    <div style={{ fontSize:11, fontWeight:700, color:"#20A464", background:"#EAFDD8", padding:"3px 8px", borderRadius:20, textAlign:"center" }}>
                      📅 Needs scheduling
                    </div>
                  )}
                  <button disabled={!can} onClick={() => redeem(r)} style={{ width:"100%", padding:7, background:can?Y:"#D6EDE1", border:"none", borderRadius:10, fontWeight:800, fontSize:11, color:can?"#0D3D20":MU, cursor:can?"pointer":"not-allowed", fontFamily:"inherit" }}>
                    {can?"Redeem":`Need ${r.pts-points} more`}
                  </button>
                  {r.buyLink && <a href={r.buyLink} target="_blank" rel="noopener noreferrer" style={{ display:"block", width:"100%", padding:5, background:"#EAFDD8", color:"#20A464", borderRadius:10, textAlign:"center", fontWeight:800, fontSize:11, textDecoration:"none" }}>🛒 Browse online</a>}
                </div>
              );
            })}
          </div>
        )}

        {/* School tab */}
        {tab === "school" && (
          <>
            {teacherReports.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:MU }}>
                <div style={{ fontSize:44, marginBottom:10 }}>🏫</div>
                <div style={{ fontWeight:700 }}>No school reports yet.</div>
                <div style={{ fontSize:13, marginTop:4 }}>When your teachers submit today's report, it'll show up here.</div>
              </div>
            )}
            {[...teacherReports].reverse().map(report => {
              const SCALE = [
                { val:1, label:"Did not fulfill", color:"#CC4400", bg:"#FEF3D0" },
                { val:2, label:"Fulfilled most", color:"#E67E22", bg:"#FEF0C0" },
                { val:3, label:"Fulfilled all", color:"#20A464", bg:"#D6EDE1" },
                { val:4, label:"Above & beyond ⭐", color:"#20A464", bg:"#E0F5EA" },
              ];
              return (
                <div key={report.id} style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 20px rgba(32,164,100,0.08)", border:`2px solid #D6EDE1` }}>
                  <div style={{ background:"linear-gradient(135deg,#146735,#20A464)", padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>👩‍🏫</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:900, fontSize:14, color:"#fff" }}>{report.teacherName}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>{report.subject} · {new Date(report.date + "T12:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}</div>
                    </div>
                    <div style={{ background:"#F5BA14", borderRadius:12, padding:"4px 10px", textAlign:"center" }}>
                      <div style={{ fontWeight:900, fontSize:16, color:"#0D3D20", lineHeight:1 }}>+{fmtPts(report.totalPts)}</div>
                      <div style={{ fontSize:9, fontWeight:700, color:"#0D3D20", textTransform:"uppercase" }}>pts</div>
                    </div>
                  </div>
                  <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                    {Object.entries(report.ratings).map(([expId, val]) => {
                      const s = SCALE.find(x => x.val === val);
                      const expText = report.expectationTexts?.[expId] || `Expectation ${expId}`;
                      return (
                        <div key={expId} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:"#0D3D20" }}>{expText}</div>
                            {report.comments?.[expId] && <div style={{ fontSize:11, color:MU, fontStyle:"italic", marginTop:2 }}>"{report.comments[expId]}"</div>}
                          </div>
                          <span style={{ flexShrink:0, fontSize:11, fontWeight:800, background:s?.bg, color:s?.color, padding:"3px 8px", borderRadius:20 }}>{val} · {s?.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* History */}
        {tab === "history" && (
          <>
            {dateRequests.filter(r => r.status === "pending").map((req) => (
              <div key={req.id} style={{ background:"#FEFAE8", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 4px 16px rgba(32,164,100,0.07)", border:`2px solid ${Y}` }}>
                <span style={{ fontSize:22 }}>{req.reward.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0D3D20" }}>{req.reward.label}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#147A48", marginTop:2 }}>
                    ⏳ Waiting for parent · {new Date(req.proposedDate + "T12:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}
                  </div>
                </div>
                <span style={{ fontSize:11, fontWeight:800, color:"#147A48", background:"#FDE090", padding:"3px 8px", borderRadius:20 }}>Pending</span>
              </div>
            ))}
            {dateRequests.filter(r => r.status === "declined").map((req) => (
              <div key={req.id} style={{ background:"#FEF3D0", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 4px 16px rgba(32,164,100,0.07)", border:"2px solid #FFBBD0" }}>
                <span style={{ fontSize:22 }}>{req.reward.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0D3D20" }}>{req.reward.label}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#CC4400", marginTop:2 }}>
                    ✗ {new Date(req.proposedDate + "T12:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })} wasn't available
                  </div>
                  {req.parentNote && <div style={{ fontSize:11, color:"#CC4400", fontStyle:"italic", marginTop:2 }}>"{req.parentNote}"</div>}
                </div>
              </div>
            ))}
            {redeemed.length === 0 && dateRequests.length === 0 && (
              <div style={{ textAlign:"center", color:MU, padding:"32px 16px", fontWeight:700 }}>No rewards redeemed yet. Keep earning! 💪</div>
            )}
            {redeemed.map((r,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 4px 16px rgba(32,164,100,0.07)" }}>
                <span style={{ fontSize:22 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:14 }}>{r.label}</div>
                  <div style={{ fontSize:11, color:MU }}>Redeemed at {r.at}</div>
                  {r.scheduledDate && (
                    <div style={{ fontSize:11, fontWeight:700, color:"#20A464", marginTop:3 }}>
                      📅 Scheduled for {new Date(r.scheduledDate + "T12:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
                    </div>
                  )}
                </div>
                <span style={{ fontWeight:900, fontSize:15, color:O }}>-{r.pts} pts</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ParentView({ tasks, setTasks, points, setPoints, rewards, setRewards, bonusAwarded, setBonusAwarded, dateRequests, setDateRequests, redeemed, setRedeemed, teachers, setTeachers, expectations, setExpectations, teacherReports, teachersPendingToday, today, todayKey }) {
  const [tab, setTab] = useState("verify");
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});
  const [newTask, setNewTask] = useState({ label:"", desc:"", pts:1, icon:"📌" });
  const [added, setAdded] = useState(false);
  const [bonusPts, setBonusPts] = useState(3);
  const [bonusFlash, setBonusFlash] = useState(false);
  const [editRewardId, setEditRewardId] = useState(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [newReward, setNewReward] = useState({ label:"", pts:10, icon:"🎁", category:"", buyLink:"", needsScheduling:null });
  const [rewardAdded, setRewardAdded] = useState(false);
  const [declineNote, setDeclineNote] = useState({});
  const [inboxDraft, setInboxDraft] = useState({}); // per-req draft: { date, time, calConfirmed }
  const [newTeacher, setNewTeacher] = useState({ name:"", subject:"", email:"" });
  const [newExpectation, setNewExpectation] = useState("");
  const [reminderSent, setReminderSent] = useState([]);

  const pendingRequests = dateRequests.filter(r => r.status === "pending");

  function getDraft(reqId) {
    return inboxDraft[reqId] || { date:"", time:"", calConfirmed:false };
  }
  function setInboxField(reqId, patch) {
    setInboxDraft(d => ({ ...d, [reqId]: { ...getDraft(reqId), ...patch } }));
  }

  function confirmScheduledReward(reqId) {
    const req = dateRequests.find(r => r.id === reqId);
    const draft = getDraft(reqId);
    if (!draft.date || !draft.time || !draft.calConfirmed) return;
    // Points already deducted at redemption — just log as redeemed with confirmed date/time
    setRedeemed(p => [...p, { ...req.reward, at: req.submittedAt, scheduledDate: draft.date, scheduledTime: draft.time }]);
    setDateRequests(p => p.map(r => r.id === reqId ? { ...r, status: "approved", confirmedDate: draft.date, confirmedTime: draft.time } : r));
    setInboxDraft(d => { const c = {...d}; delete c[reqId]; return c; });
  }

  function approveDate(reqId) {
    // Legacy — kept for non-scheduling approvals
    const req = dateRequests.find(r => r.id === reqId);
    setRedeemed(p => [...p, { ...req.reward, at: req.submittedAt, scheduledDate: req.proposedDate }]);
    setDateRequests(p => p.map(r => r.id === reqId ? { ...r, status: "approved" } : r));
  }

  function declineDate(reqId) {
    setDateRequests(p => p.map(r => r.id === reqId ? { ...r, status: "declined", parentNote: declineNote[reqId] || "" } : r));
    setDeclineNote(n => { const c = {...n}; delete c[reqId]; return c; });
  }

  const awaiting = tasks.filter(t => t.status === "awaiting");
  const approved = tasks.filter(t => t.status === "approved");
  const allExtra = approved.length > 0 && approved.every(t => t.approvedQuality === "extra");

  function approve(id) {
    const t = tasks.find(t => t.id === id);
    setTasks(p => p.map(x => x.id===id ? {...x, status:"approved", approvedQuality:"done"} : x));
    setPoints(p => p + t.pts);
  }

  function approveExtra(id) {
    const t = tasks.find(t => t.id === id);
    setTasks(p => p.map(x => x.id===id ? {...x, status:"approved", approvedQuality:"extra"} : x));
    setPoints(p => p + t.pts + 0.5);
  }
  function reject(id) { setTasks(p => p.map(x => x.id===id ? {...x, status:"redo"} : x)); }
  function awardBonus() { setPoints(p => p + bonusPts); setBonusAwarded(true); setBonusFlash(true); setTimeout(() => setBonusFlash(false), 1200); }
  function addTask() {
    if (!newTask.label.trim()) return;
    setTasks(p => [...p, { id:Date.now(), ...newTask, status:"pending", tips:[], done:newTask.desc, extraWellDone:"" }]);
    setNewTask({ label:"", desc:"", pts:1, icon:"📌" }); setAdded(true); setTimeout(() => setAdded(false), 1500);
  }
  function startEdit(t) { setEditId(t.id); setDraft({ label:t.label, desc:t.desc, pts:t.pts, tips:[...(t.tips||[])], done:t.done||"", extraWellDone:t.extraWellDone||"" }); }
  function saveEdit(id) { setTasks(p => p.map(t => t.id===id ? {...t,...draft} : t)); setEditId(null); }
  function saveLink(id) { setRewards(p => p.map(r => r.id===id ? {...r, buyLink:linkDraft.trim()} : r)); setEditRewardId(null); }
  function addReward() {
    if (!newReward.label.trim()) return;
    setRewards(p => [...p, { id:Date.now(), label:newReward.label, pts:newReward.pts, icon:newReward.icon||"🎁", category:newReward.category||"Other", buyLink:newReward.buyLink, needsScheduling:newReward.needsScheduling, scheduledDate:newReward.scheduledDate }]);
    setNewReward({ label:"", pts:10, icon:"🎁", category:"", buyLink:"", needsScheduling:null });
    setRewardAdded(true); setTimeout(() => setRewardAdded(false), 1500);
  }

  const inp = { border:`2px solid ${BD}`, borderRadius:10, padding:"8px 12px", fontFamily:"inherit", fontSize:13, fontWeight:600, color:"#0D3D20", outline:"none", width:"100%", background:"#fff", boxSizing:"border-box" };
  const textarea = { ...inp, resize:"vertical", minHeight:56, lineHeight:1.4 };

  return (
    <div style={{ width:"100%", maxWidth:440 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 16px", background:"linear-gradient(135deg,#0D3D20,#146735)", color:"#fff" }}>
        <span style={{ fontSize:34 }}>👨‍👧</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:18 }}>Parent Dashboard</div>
          <div style={{ fontSize:12, opacity:0.7 }}>Grace has <b>{fmtPts(points)}</b> pts total</div>
        </div>
        {awaiting.length > 0 && <div style={{ background:O, color:"#fff", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14 }}>{awaiting.length}</div>}
      </div>

      <div style={{ display:"flex", background:"#fff", borderBottom:`1px solid ${BD}`, overflowX:"auto" }}>
        {[["verify",`✅ Verify${awaiting.length?` (${awaiting.length})`:""}`],["inbox",`📬 Inbox${pendingRequests.length?` (${pendingRequests.length})`:""}`],["school","🏫 School"],["manage","✏️ Tasks"],["rewards","🎁 Rewards"],["add","➕ Task"],["addreward","➕ Reward"]].map(([v,l]) => (
          <button key={v} onClick={() => { setTab(v); setEditId(null); }} style={{ flex:1, padding:"11px 4px", border:"none", borderBottom:`3px solid ${tab===v?P:"transparent"}`, background:"none", fontWeight:800, fontSize:11, color:tab===v?P:MU, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:14, display:"flex", flexDirection:"column", gap:10 }}>

        {/* Verify */}
        {tab === "verify" && (
          <>
            {awaiting.length===0 && approved.length===0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:MU }}>
                <div style={{ fontSize:44, marginBottom:10 }}>🎯</div>
                <div style={{ fontWeight:700 }}>No tasks awaiting approval!</div>
                <div style={{ fontSize:13, marginTop:4 }}>Grace is still working on things.</div>
              </div>
            )}
            {awaiting.map(task => (
              <div key={task.id} style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 20px rgba(32,164,100,0.08)", border:`2px solid ${task.submittedQuality==="extra"?G:"#D6EDE1"}` }}>
                {/* Card header */}
                <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${BD}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:20 }}>{task.icon}</span>
                    <span style={{ fontWeight:800, fontSize:15, color:"#0D3D20" }}>{task.label}</span>
                    {task.submittedQuality==="extra" && (
                      <span style={{ marginLeft:"auto", background:G, color:"#fff", fontSize:11, fontWeight:800, padding:"3px 8px", borderRadius:20, flexShrink:0 }}>⭐ Extra Well Done</span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:MU, lineHeight:1.5, background:"#EAFDD8", borderRadius:10, padding:"8px 10px" }}>
                    {task.submittedQuality==="extra" ? task.extraWellDone : task.done}
                  </div>
                  <div style={{ marginTop:8 }}>
                    {task.submittedQuality==="extra"
                      ? <span style={{ fontWeight:900, fontSize:13, color:"#20A464", background:"#EAFDD8", padding:"2px 10px", borderRadius:20 }}>{task.pts} or {task.pts + 0.5} pts</span>
                      : <span style={{ fontWeight:900, fontSize:13, color:P, background:"#EAFDD8", padding:"2px 10px", borderRadius:20 }}>+{task.pts} pts</span>
                    }
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ padding:"10px 16px", display:"flex", flexDirection:"column", gap:8 }}>
                  {task.submittedQuality === "extra" ? (
                    <>
                      <button
                        onClick={() => approveExtra(task.id)}
                        style={{ width:"100%", padding:"10px 12px", background:"#EAFDD8", color:"#147A48", border:"2px solid #20A464", borderRadius:12, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}
                      >
                        ⭐ Approve Extra Well Done  <span style={{ fontWeight:600, opacity:0.7, fontSize:12 }}>· {task.pts + 0.5} pts</span>
                      </button>
                      <button
                        onClick={() => approve(task.id)}
                        style={{ width:"100%", padding:"10px 12px", background:"#C8EDD8", color:"#147A48", border:"2px solid #20A464", borderRadius:12, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}
                      >
                        ✓ Approve as Done  <span style={{ fontWeight:600, opacity:0.7, fontSize:12 }}>· {task.pts} pts</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => approve(task.id)}
                      style={{ width:"100%", padding:"10px 12px", background:"#20A464", color:"#fff", border:"none", borderRadius:12, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
                    >
                      ✓ Approve
                    </button>
                  )}
                  <button
                    onClick={() => reject(task.id)}
                    style={{ width:"100%", padding:"9px 12px", background:"#FEF3D0", color:"#CC4400", border:"none", borderRadius:12, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
                  >
                    ✗ Send Back to Redo
                  </button>
                </div>
              </div>
            ))}
            {approved.length > 0 && (
              <>
                <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.08em" }}>Recently Approved</div>
                {approved.map(t => (
                  <div key={t.id} style={{ display:"flex", justifyContent:"space-between", background:"#EAFDD8", padding:"10px 14px", borderRadius:12, fontWeight:700, fontSize:13, color:"#147A48" }}>
                    <span>{t.approvedQuality==="extra"?"⭐":"✅"} {t.label}</span>
                    <span>+{t.approvedQuality==="extra" ? fmtPts(t.pts + 0.5) : t.pts} pts</span>
                  </div>
                ))}
                {allExtra && (
                  <div style={{ borderRadius:18, background:"linear-gradient(135deg,#FEFAE8,#FFFBF0)", border:`2px solid ${Y}`, padding:16, display:"flex", flexDirection:"column", gap:12, transform:bonusFlash?"scale(1.02)":"scale(1)", transition:"transform 0.2s" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                      <span style={{ fontSize:30 }}>🌟</span>
                      <div>
                        <div style={{ fontWeight:900, fontSize:16, color:"#0D3D20" }}>Everything done Extra Well!</div>
                        <div style={{ fontSize:12, color:MU, marginTop:2 }}>Grace went above and beyond on every task.</div>
                      </div>
                    </div>
                    <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.05em", marginBottom:2 }}>Award bonus points:</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {[1,2,3,5,10].map(p => (
                        <button key={p} onClick={() => setBonusPts(p)} style={{ flex:1, padding:10, border:`2px solid ${bonusPts===p?P:BD}`, borderRadius:12, background:bonusPts===p?P:"none", color:bonusPts===p?"#fff":MU, fontWeight:900, fontSize:17, cursor:"pointer", fontFamily:"inherit" }}>{p}</button>
                      ))}
                    </div>
                    <button disabled={bonusAwarded} onClick={awardBonus} style={{ padding:12, background:bonusAwarded?G:Y, color:bonusAwarded?"#fff":"#0D3D20", border:"none", borderRadius:14, fontWeight:900, fontSize:14, cursor:bonusAwarded?"default":"pointer", fontFamily:"inherit" }}>
                      {bonusAwarded?`✓ ${bonusPts} pts awarded!`:`🌟 Award ${bonusPts} bonus pts`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Inbox — date approval requests from Grace */}
        {tab === "inbox" && (
          <>
            {pendingRequests.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:MU }}>
                <div style={{ fontSize:44, marginBottom:10 }}>📬</div>
                <div style={{ fontWeight:700 }}>All caught up!</div>
                <div style={{ fontSize:13, marginTop:4 }}>No date requests from Grace right now.</div>
              </div>
            )}
            {pendingRequests.map(req => (
              <div key={req.id} style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 20px rgba(32,164,100,0.08)", border:`2px solid ${Y}` }}>
                {/* Notification header */}
                <div style={{ background:`linear-gradient(135deg,#FEFAE8,#FDE090)`, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${Y}` }}>
                  <span style={{ fontSize:26 }}>{req.reward.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:900, fontSize:15, color:"#0D3D20" }}>Grace wants to schedule a reward</div>
                    <div style={{ fontSize:12, color:"#147A48", marginTop:1 }}>{req.reward.label} · {req.reward.pts} pts</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:800, color:"#147A48", background:"rgba(245,186,20,0.3)", padding:"3px 8px", borderRadius:20 }}>New</span>
                </div>

                {/* Proposed date */}
                <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${BD}` }}>
                  <span style={{ fontSize:22 }}>📅</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.05em" }}>Proposed date</div>
                    <div style={{ fontWeight:800, fontSize:15, color:"#0D3D20", marginTop:2 }}>
                      {new Date(req.proposedDate + "T12:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
                    </div>
                    <div style={{ fontSize:11, color:MU, marginTop:1 }}>Requested at {req.submittedAt}</div>
                  </div>
                </div>

                {/* Approve / Decline */}
                <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
                  <button onClick={() => approveDate(req.id)} style={{ width:"100%", padding:12, background:G, color:"#fff", border:"none", borderRadius:14, fontWeight:900, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                    ✓ Approve — {new Date(req.proposedDate + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" })} works!
                  </button>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.05em", marginBottom:5 }}>Or leave a note and decline:</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <input
                        placeholder="e.g. We have plans that day — try the weekend?"
                        value={declineNote[req.id] || ""}
                        onChange={e => setDeclineNote(n => ({...n, [req.id]: e.target.value}))}
                        style={{ flex:1, border:`2px solid ${BD}`, borderRadius:10, padding:"8px 12px", fontFamily:"inherit", fontSize:12, fontWeight:600, color:"#0D3D20", outline:"none", background:"#fff" }}
                      />
                      <button onClick={() => declineDate(req.id)} style={{ padding:"8px 14px", background:"#FEF3D0", color:"#CC4400", border:"none", borderRadius:10, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>✗ Decline</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Recently handled requests */}
            {dateRequests.filter(r => r.status !== "pending").length > 0 && (
              <>
                <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.08em" }}>Recently Handled</div>
                {dateRequests.filter(r => r.status !== "pending").map(req => (
                  <div key={req.id} style={{ display:"flex", alignItems:"center", gap:10, background:req.status==="approved"?"#E0F5EA":"#FEF3D0", padding:"10px 14px", borderRadius:12 }}>
                    <span style={{ fontSize:18 }}>{req.reward.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"#0D3D20" }}>{req.reward.label}</div>
                      <div style={{ fontSize:11, color:req.status==="approved"?"#147A48":"#CC4400", fontWeight:600 }}>
                        {req.status==="approved" ? `✓ Approved · ${new Date(req.proposedDate + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" })}` : `✗ Declined`}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* School */}
        {tab === "school" && (
          <>
            {/* Pending reminder banner */}
            {teachersPendingToday.length > 0 && (
              <div style={{ background:"#FEFAE8", border:`2px solid #F5BA14`, borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>⏳</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#147A48" }}>Awaiting today's report</div>
                  <div style={{ fontSize:12, color:MU, marginTop:2 }}>{teachersPendingToday.map(t=>t.name).join(", ")}</div>
                </div>
                <button onClick={() => { setReminderSent(teachersPendingToday.map(t=>t.id)); setTimeout(()=>setReminderSent([]),3000); }} style={{ padding:"6px 12px", background:"#F5BA14", border:"none", borderRadius:10, fontWeight:800, fontSize:11, cursor:"pointer", fontFamily:"inherit", color:"#0D3D20", flexShrink:0 }}>
                  {reminderSent.length>0 ? "✓ Sent!" : "Send reminder"}
                </button>
              </div>
            )}

            {/* Today's reports */}
            {teacherReports.filter(r=>r.date===todayKey).length > 0 && (
              <>
                <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.08em" }}>Today's Reports</div>
                {teacherReports.filter(r=>r.date===todayKey).map(report => (
                  <div key={report.id} style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 4px 16px rgba(17,138,178,0.08)", border:"2px solid #D6EDE1" }}>
                    <div style={{ background:"linear-gradient(135deg,#146735,#20A464)", padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:18 }}>👩‍🏫</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800, fontSize:14, color:"#fff" }}>{report.teacherName} · {report.subject}</div>
                      </div>
                      <div style={{ background:"#F5BA14", borderRadius:10, padding:"3px 10px", fontWeight:900, fontSize:14, color:"#0D3D20" }}>+{fmtPts(report.totalPts)} pts</div>
                    </div>
                    <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:6 }}>
                      {Object.entries(report.ratings).map(([expId, val]) => {
                        const SCALE = [{val:1,label:"Did not fulfill",color:"#CC4400",bg:"#FEF3D0"},{val:2,label:"Fulfilled most",color:"#E67E22",bg:"#FEF0C0"},{val:3,label:"Fulfilled all",color:"#20A464",bg:"#D6EDE1"},{val:4,label:"Above & beyond ⭐",color:"#20A464",bg:"#E0F5EA"}];
                        const s = SCALE.find(x=>x.val===val);
                        return (
                          <div key={expId} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                            <div style={{ flex:1, fontSize:12, fontWeight:600, color:"#0D3D20" }}>
                              {report.expectationTexts?.[expId]}
                              {report.comments?.[expId] && <div style={{ fontSize:11, color:MU, fontStyle:"italic", marginTop:1 }}>"{report.comments[expId]}"</div>}
                            </div>
                            <span style={{ flexShrink:0, fontSize:11, fontWeight:800, background:s?.bg, color:s?.color, padding:"3px 8px", borderRadius:20 }}>{val} · {s?.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Expectations */}
            <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.08em", marginTop:4 }}>Class Expectations (apply to all teachers)</div>
            {expectations.map(e => (
              <div key={e.id} style={{ background:"#fff", borderRadius:14, padding:"11px 14px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize:16 }}>📋</span>
                <div style={{ flex:1, fontSize:13, fontWeight:700, color:"#0D3D20" }}>{e.text}</div>
                <button onClick={() => setExpectations(p=>p.filter(x=>x.id!==e.id))} style={{ padding:"4px 8px", background:"#FEF3D0", color:"#CC4400", border:"none", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
              </div>
            ))}
            <div style={{ display:"flex", gap:8 }}>
              <input value={newExpectation} onChange={e=>setNewExpectation(e.target.value)} placeholder="Add a new expectation…" style={{ ...inp, flex:1, fontSize:13 }} onKeyDown={e=>{if(e.key==="Enter"&&newExpectation.trim()){setExpectations(p=>[...p,{id:Date.now(),text:newExpectation.trim()}]);setNewExpectation("");}}} />
              <button onClick={()=>{if(newExpectation.trim()){setExpectations(p=>[...p,{id:Date.now(),text:newExpectation.trim()}]);setNewExpectation("");}}} style={{ padding:"8px 14px", background:P, color:"#fff", border:"none", borderRadius:10, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>+ Add</button>
            </div>

            {/* Teachers */}
            <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.08em", marginTop:4 }}>Teachers</div>
            {teachers.map(t => {
              const doneToday = teacherReports.some(r=>r.teacherId===t.id&&r.date===todayKey);
              return (
                <div key={t.id} style={{ background:"#fff", borderRadius:14, padding:"11px 14px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
                  <span style={{ fontSize:20 }}>👩‍🏫</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:13, color:"#0D3D20" }}>{t.name}</div>
                    <div style={{ fontSize:11, color:MU }}>{t.subject} · {t.email}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:800, background:doneToday?"#D6EDE1":"#D6EDE1", color:doneToday?"#20A464":"#20A464", padding:"3px 8px", borderRadius:20 }}>{doneToday?"✓ Done":"Pending"}</span>
                  <button onClick={()=>setTeachers(p=>p.filter(x=>x.id!==t.id))} style={{ padding:"4px 8px", background:"#FEF3D0", color:"#CC4400", border:"none", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                </div>
              );
            })}
            <div style={{ background:"#fff", borderRadius:14, padding:14, display:"flex", flexDirection:"column", gap:8, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#20A464" }}>Add a Teacher</div>
              {[["Name","name","e.g. Ms. Johnson"],["Subject","subject","e.g. Math"],["Email","email","e.g. teacher@school.edu"]].map(([lb,key,ph])=>(
                <div key={key}>
                  <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", color:MU, letterSpacing:"0.05em", marginBottom:3 }}>{lb}</div>
                  <input value={newTeacher[key]} onChange={e=>setNewTeacher(n=>({...n,[key]:e.target.value}))} placeholder={ph} style={{ ...inp, fontSize:13 }} />
                </div>
              ))}
              <button onClick={()=>{if(newTeacher.name.trim()){setTeachers(p=>[...p,{id:Date.now(),...newTeacher}]);setNewTeacher({name:"",subject:"",email:""});}}} style={{ padding:11, background:"#20A464", color:"#fff", border:"none", borderRadius:12, fontWeight:900, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Add Teacher</button>
            </div>
          </>
        )}

        {/* Manage Tasks */}
        {tab === "manage" && tasks.map(task => {
          const editing = editId === task.id;
          return (
            <div key={task.id} style={{ background:"#fff", borderRadius:18, boxShadow:"0 4px 20px rgba(32,164,100,0.08)", border:`2px solid ${editing?P:"transparent"}`, overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px" }}>
                <span style={{ fontSize:22 }}>{task.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0D3D20" }}>{task.label}</div>
                  <div style={{ fontSize:11, color:task.status==="approved"?G:task.status==="awaiting"?"#147A48":MU, marginTop:1 }}>
                    {task.status==="pending"?`${task.pts} pt${task.pts>1?"s":""}`:task.status==="awaiting"?"⏳ Awaiting review":"✅ Completed"}
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {!editing && <button onClick={() => startEdit(task)} style={{ padding:"5px 10px", background:"#EAFDD8", color:P, border:"none", borderRadius:10, fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✏️ Edit</button>}
                  <button onClick={() => { setTasks(p => p.filter(t => t.id!==task.id)); if(editId===task.id) setEditId(null); }} style={{ padding:"5px 8px", background:"#FEF3D0", color:"#CC4400", border:"none", borderRadius:10, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>🗑</button>
                </div>
              </div>
              {editing && (
                <div style={{ borderTop:`1px solid ${BD}`, padding:14, display:"flex", flexDirection:"column", gap:10, background:"#EAFDD8" }}>
                  {[["Task Name","label",false],["Description","desc",true],["✅ 'Done' means…","done",true],["⭐ 'Extra Well Done'…","extraWellDone",true]].map(([lb,key,multi]) => (
                    <div key={key}>
                      <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>{lb}</div>
                      {multi
                        ? <textarea value={draft[key]} onChange={e => setDraft(d=>({...d,[key]:e.target.value}))} style={textarea} />
                        : <input value={draft[key]} onChange={e => setDraft(d=>({...d,[key]:e.target.value}))} style={inp} />
                      }
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>Points</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {[1,2,3,4,5].map(p => <button key={p} onClick={() => setDraft(d=>({...d,pts:p}))} style={{ flex:1, padding:10, border:`2px solid ${draft.pts===p?P:BD}`, borderRadius:12, background:draft.pts===p?P:"none", color:draft.pts===p?"#fff":MU, fontWeight:900, fontSize:17, cursor:"pointer", fontFamily:"inherit" }}>{p}</button>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>💡 Tips</div>
                    {draft.tips.map((tip,i) => (
                      <div key={i} style={{ display:"flex", gap:6, marginBottom:5 }}>
                        <input value={tip} onChange={e => { const tips=[...draft.tips]; tips[i]=e.target.value; setDraft(d=>({...d,tips})); }} style={{ ...inp, flex:1 }} placeholder={`Tip ${i+1}`} />
                        <button onClick={() => setDraft(d=>({...d,tips:d.tips.filter((_,j)=>j!==i)}))} style={{ padding:"5px 8px", background:"#FEF3D0", color:"#CC4400", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => setDraft(d=>({...d,tips:[...d.tips,""]}))} style={{ border:`2px dashed ${BD}`, background:"none", borderRadius:10, padding:"6px 12px", fontWeight:800, fontSize:12, color:P, cursor:"pointer", fontFamily:"inherit" }}>+ Add tip</button>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => saveEdit(task.id)} style={{ flex:1, padding:11, background:P, color:"#fff", border:"none", borderRadius:12, fontWeight:900, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Save Changes</button>
                    <button onClick={() => setEditId(null)} style={{ padding:"11px 14px", background:"#E0F2E9", color:MU, border:"none", borderRadius:12, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Rewards Management */}
        {tab === "rewards" && (
          <>
            <div style={{ background:"#EAFDD8", borderRadius:14, padding:"10px 14px", fontSize:13, fontWeight:700, color:"#20A464", borderLeft:"4px solid #20A464" }}>
              🛒 Add a link so Grace can browse rewards online when they redeem.
            </div>
            {rewards.map(r => {
              const editing = editRewardId === r.id;
              return (
                <div key={r.id} style={{ background:"#fff", borderRadius:18, boxShadow:"0 4px 20px rgba(32,164,100,0.08)", border:`2px solid ${editing?P:"transparent"}`, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px" }}>
                    <span style={{ fontSize:22 }}>{r.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#0D3D20" }}>{r.label}</div>
                      <div style={{ fontSize:11, color:r.buyLink?"#20A464":MU, marginTop:1 }}>{r.buyLink?"🔗 Link added":"No link yet"}</div>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                      <span style={{ fontWeight:900, fontSize:14, color:P }}>{r.pts} pts</span>
                      <button onClick={() => { setEditRewardId(editing?null:r.id); setLinkDraft(r.buyLink||""); }} style={{ padding:"5px 10px", background:"#EAFDD8", color:P, border:"none", borderRadius:10, fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{editing?"Cancel":"✏️ Link"}</button>
                    </div>
                  </div>
                  {editing && (
                    <div style={{ borderTop:`1px solid ${BD}`, padding:14, display:"flex", flexDirection:"column", gap:10, background:"#EAFDD8" }}>
                      <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em" }}>🔗 Shopping Link</div>
                      <div style={{ fontSize:12, color:MU, fontWeight:600 }}>Paste a product link (Amazon, Etsy, etc.)</div>
                      <input value={linkDraft} onChange={e => setLinkDraft(e.target.value)} placeholder="https://..." style={inp} />
                      {linkDraft && <a href={linkDraft} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"#20A464", fontWeight:700 }}>Preview link ↗</a>}
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => saveLink(r.id)} style={{ flex:1, padding:11, background:P, color:"#fff", border:"none", borderRadius:12, fontWeight:900, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Save Link</button>
                        {r.buyLink && <button onClick={() => { setRewards(p=>p.map(x=>x.id===r.id?{...x,buyLink:""}:x)); setEditRewardId(null); }} style={{ padding:"11px 14px", background:"#FEF3D0", color:"#CC4400", border:"none", borderRadius:12, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Remove</button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Add Task */}
        {tab === "add" && (
          <div style={{ background:"#fff", borderRadius:18, padding:20, boxShadow:"0 4px 20px rgba(32,164,100,0.08)", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ fontWeight:900, fontSize:18, color:"#0D3D20" }}>Create a New Task</div>
            {[["Task Name","label","e.g. Vacuum living room"],["Completion Criteria","desc","e.g. All furniture moved, corners done"]].map(([lb,key,ph]) => (
              <div key={key}>
                <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>{lb}</div>
                <input value={newTask[key]} onChange={e => setNewTask(n=>({...n,[key]:e.target.value}))} placeholder={ph} style={inp} />
              </div>
            ))}
            <div>
              <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:6 }}>Icon</div>
              {[
                { label:"Chores", icons:["🗑️","🧹","🧺","🧻","🧴","🚿","🛁","🪣","🧽","🫧","🪥","🛏️","🍽️","🥄","🧇","🪴","🐕","🐈","🪟","🚪"] },
                { label:"School", icons:["📚","📖","✏️","📝","🖊️","📐","📏","🔬","🎒","💻","🖥️","📓","📒","🗂️","📌","🖇️","📎","✂️","🏫","⏰"] },
                { label:"Other", icons:["⚽","🏀","🎸","🎵","🎨","🏋️","🚴","🌱","🍳","💪","🤝","🌟","💡","🛠️","🎯","🏆","❤️","🙏","😊","🌈"] },
              ].map(group => (
                <div key={group.label} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:MU, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>{group.label}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {group.icons.map(ic => (
                      <button key={ic} onClick={() => setNewTask(n=>({...n,icon:ic}))} style={{ width:38, height:38, fontSize:19, border:`2px solid ${newTask.icon===ic?P:BD}`, borderRadius:10, background:newTask.icon===ic?"#D6EDE1":"#fff", cursor:"pointer" }}>{ic}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>Points Value</div>
              <div style={{ display:"flex", gap:6 }}>
                {[1,2,3,4,5].map(p => <button key={p} onClick={() => setNewTask(n=>({...n,pts:p}))} style={{ flex:1, padding:10, border:`2px solid ${newTask.pts===p?P:BD}`, borderRadius:12, background:newTask.pts===p?P:"none", color:newTask.pts===p?"#fff":MU, fontWeight:900, fontSize:17, cursor:"pointer", fontFamily:"inherit" }}>{p}</button>)}
              </div>
            </div>
            <button onClick={addTask} style={{ padding:14, background:added?G:P, color:"#fff", border:"none", borderRadius:14, fontWeight:900, fontSize:15, cursor:"pointer", marginTop:4, fontFamily:"inherit" }}>
              {added?"✓ Task Added!":"Add Task"}
            </button>
          </div>
        )}

        {/* Add Reward */}
        {tab === "addreward" && (
          <div style={{ background:"#fff", borderRadius:18, padding:20, boxShadow:"0 4px 20px rgba(32,164,100,0.08)", display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ fontWeight:900, fontSize:18, color:"#0D3D20" }}>Create a New Reward</div>

            {/* Name */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>Reward Name</div>
              <input value={newReward.label} onChange={e => setNewReward(r=>({...r,label:e.target.value}))} placeholder="e.g. Trip to the movies" style={inp} />
            </div>

            {/* Icon */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:6 }}>Icon</div>
              {[
                { label:"Food & Treats", icons:["🍕","🍦","🍩","🍫","🧁","🍔","🌮","🍜","🥞","🍣","🧃","🥤","🍿","🎂","🍓"] },
                { label:"Fun & Activities", icons:["🎮","🎬","🎳","🏖️","🎢","🎡","🎠","🎪","🎤","🎧","🎸","🎯","🎲","🃏","🧩"] },
                { label:"Shopping & Stuff", icons:["🎨","🧸","📖","👟","👗","🎒","💄","🕹️","🪁","⚽","🏀","🎻","🖍️","📷","🔭"] },
                { label:"Time & Freedom", icons:["😴","📺","💤","🛋️","🌙","☀️","🏕️","🎉","🥳","✈️","🚀","🌈","💫","⭐","🏆"] },
                { label:"Money", icons:["💵","💴","💶","💷","💰","💳","🪙","🏦","💎","🎁"] },
              ].map(group => (
                <div key={group.label} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:MU, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>{group.label}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {group.icons.map(ic => (
                      <button key={ic} onClick={() => setNewReward(r=>({...r,icon:ic}))} style={{ width:38, height:38, fontSize:19, border:`2px solid ${newReward.icon===ic?P:BD}`, borderRadius:10, background:newReward.icon===ic?"#D6EDE1":"#fff", cursor:"pointer" }}>{ic}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Points */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>Points Cost</div>
              <div style={{ display:"flex", gap:6 }}>
                {[5,8,10,12,15].map(p => (
                  <button key={p} onClick={() => setNewReward(r=>({...r,pts:p}))} style={{ flex:1, padding:10, border:`2px solid ${newReward.pts===p?P:BD}`, borderRadius:12, background:newReward.pts===p?P:"none", color:newReward.pts===p?"#fff":MU, fontWeight:900, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{p}</button>
                ))}
              </div>
            </div>

            {/* Buy link */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:P, letterSpacing:"0.06em", marginBottom:4 }}>🛒 Shopping Link (optional)</div>
              <input value={newReward.buyLink} onChange={e => setNewReward(r=>({...r,buyLink:e.target.value}))} placeholder="https://..." style={inp} />
            </div>

            {/* ── Scheduling yes/no ── */}
            <div style={{ background:"#EAFDD8", borderRadius:14, padding:14, display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0D3D20" }}>📅 Does this reward need to be scheduled?</div>
              <div style={{ fontSize:12, color:MU, fontWeight:600, marginTop:-4 }}>e.g. a trip, a meal out, or an activity that needs a date set in advance</div>
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={() => setNewReward(r=>({...r, needsScheduling:true}))}
                  style={{ flex:1, padding:"11px 8px", border:`2px solid ${newReward.needsScheduling===true?G:BD}`, borderRadius:14, background:newReward.needsScheduling===true?"#E0F5EA":"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:14, color:newReward.needsScheduling===true?"#20A464":"#0D3D20", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}
                >
                  <span style={{ fontSize:22 }}>✅</span>
                  <span>Yes, schedule it</span>
                </button>
                <button
                  onClick={() => setNewReward(r=>({...r, needsScheduling:false, scheduledDate:""}))}
                  style={{ flex:1, padding:"11px 8px", border:`2px solid ${newReward.needsScheduling===false?"#CC4400":BD}`, borderRadius:14, background:newReward.needsScheduling===false?"#FEF3D0":"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:14, color:newReward.needsScheduling===false?"#CC4400":"#0D3D20", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}
                >
                  <span style={{ fontSize:22 }}>🚫</span>
                  <span>No, anytime</span>
                </button>
              </div>

              {/* Date picker removed — date is picked when Grace redeems the reward */}
              {newReward.needsScheduling === true && (
                <div style={{ fontSize:12, fontWeight:700, color:G, background:"#EAFDD8", padding:"8px 12px", borderRadius:10 }}>
                  ✓ Grace will be asked to pick a date when they redeem this reward.
                </div>
              )}
            </div>

            <button
              onClick={addReward}
              disabled={newReward.needsScheduling === null || !newReward.label.trim()}
              style={{ padding:14, background:rewardAdded?G:newReward.needsScheduling===null||!newReward.label.trim()?"#D6EDE1":P, color:newReward.needsScheduling===null||!newReward.label.trim()?MU:"#fff", border:"none", borderRadius:14, fontWeight:900, fontSize:15, cursor:newReward.needsScheduling===null||!newReward.label.trim()?"not-allowed":"pointer", fontFamily:"inherit" }}
            >
              {rewardAdded ? "✓ Reward Added!" : newReward.needsScheduling === null ? "Answer the scheduling question to continue" : "Add Reward"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── TEACHER LOGIN ────────────────────────────────────────────────────────────
function TeacherLoginView({ teachers, teacherReports, todayKey, today, onLogin, teachersPendingToday }) {
  const BL = "#20A464", BLT = "#D6EDE1";
  return (
    <div style={{ width:"100%", maxWidth:440 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 16px", background:"linear-gradient(135deg,#146735,#20A464)", color:"#fff" }}>
        <span style={{ fontSize:34 }}>🏫</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:18 }}>Teacher Portal</div>
          <div style={{ fontSize:12, opacity:0.8 }}>{today}</div>
        </div>
      </div>

      {teachersPendingToday.length > 0 && (
        <div style={{ background:"#FEFAE8", borderBottom:`2px solid #F5BA14`, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>⏳</span>
          <div style={{ fontSize:13, fontWeight:700, color:"#147A48" }}>
            {teachersPendingToday.map(t => t.name).join(", ")} {teachersPendingToday.length === 1 ? "hasn't" : "haven't"} submitted today's report yet.
          </div>
        </div>
      )}

      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ fontSize:13, fontWeight:700, color:MU, textAlign:"center", padding:"8px 0" }}>Select your name to begin</div>
        {teachers.map(t => {
          const submitted = teacherReports.some(r => r.teacherId === t.id && r.date === todayKey);
          return (
            <button key={t.id} onClick={() => onLogin(t)} style={{ background:"#fff", border:`2px solid ${submitted ? G : BL}`, borderRadius:18, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px rgba(17,138,178,0.08)", textAlign:"left" }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:submitted?"#E0F5EA":BLT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {submitted ? "✅" : "👩‍🏫"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:15, color:"#0D3D20" }}>{t.name}</div>
                <div style={{ fontSize:12, color:MU, marginTop:1 }}>{t.subject}</div>
              </div>
              <div style={{ fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:20, background:submitted?"#D6EDE1":BLT, color:submitted?"#20A464":BL }}>
                {submitted ? "✓ Done today" : "Fill out →"}
              </div>
            </button>
          );
        })}
        {teachers.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 20px", color:MU }}>
            <div style={{ fontSize:44, marginBottom:10 }}>👩‍🏫</div>
            <div style={{ fontWeight:700 }}>No teachers set up yet.</div>
            <div style={{ fontSize:13, marginTop:4 }}>A parent can add teachers in the Parent view.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TEACHER FORM ─────────────────────────────────────────────────────────────
function TeacherFormView({ teacher, expectations, teacherReports, setTeacherReports, setPoints, todayKey, today, onLogout }) {
  const BL = "#20A464";
  const alreadySubmitted = teacherReports.find(r => r.teacherId === teacher.id && r.date === todayKey);
  const [ratings, setRatings] = useState(() => {
    if (alreadySubmitted) return alreadySubmitted.ratings;
    return Object.fromEntries(expectations.map(e => [e.id, null]));
  });
  const [comments, setComments] = useState(() => {
    if (alreadySubmitted) return alreadySubmitted.comments;
    return Object.fromEntries(expectations.map(e => [e.id, ""]));
  });
  const [submitted, setSubmitted] = useState(!!alreadySubmitted);

  const SCALE = [
    { val:1, label:"Did not fulfill", short:"1", color:"#CC4400", bg:"#FEF3D0" },
    { val:2, label:"Fulfilled most (75%)", short:"2", color:"#E67E22", bg:"#FEF0C0" },
    { val:3, label:"Fulfilled all (100%)", short:"3", color:"#20A464", bg:"#D6EDE1" },
    { val:4, label:"Above & beyond ⭐", short:"4", color:"#20A464", bg:"#E0F5EA" },
  ];

  const allRated = expectations.every(e => ratings[e.id] !== null);

  // Points awarded per rating: 1→0, 2→0.5, 3→1, 4→1.5 per expectation
  const PTS_MAP = { 1:0, 2:0.5, 3:1, 4:1.5 };

  function handleSubmit() {
    if (!allRated) return;
    const totalPts = expectations.reduce((sum, e) => sum + (PTS_MAP[ratings[e.id]] || 0), 0);
    const expectationTexts = Object.fromEntries(expectations.map(e => [e.id, e.text]));
    const report = { id:Date.now(), teacherId:teacher.id, teacherName:teacher.name, subject:teacher.subject, date:todayKey, ratings:{ ...ratings }, comments:{ ...comments }, totalPts, expectationTexts };
    setTeacherReports(p => [...p.filter(r => !(r.teacherId===teacher.id && r.date===todayKey)), report]);
    setPoints(p => p + totalPts);
    setSubmitted(true);
  }

  if (submitted) {
    const report = teacherReports.find(r => r.teacherId===teacher.id && r.date===todayKey) || { ratings, comments, totalPts: expectations.reduce((s,e)=>s+(PTS_MAP[ratings[e.id]]||0),0) };
    return (
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 16px", background:"linear-gradient(135deg,#146735,#20A464)", color:"#fff" }}>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:10, padding:"6px 12px", color:"#fff", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:900, fontSize:16 }}>{teacher.name}</div>
            <div style={{ fontSize:12, opacity:0.8 }}>{teacher.subject} · {today}</div>
          </div>
        </div>
        <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:"linear-gradient(135deg,#EAFDD8,#E0F5EA)", border:`2px solid ${G}`, borderRadius:18, padding:20, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
            <div style={{ fontWeight:900, fontSize:18, color:"#20A464" }}>Report submitted!</div>
            <div style={{ fontSize:13, color:MU, marginTop:4 }}>+{report.totalPts} pts awarded to Grace</div>
          </div>
          {expectations.map(e => {
            const r = SCALE.find(s => s.val === ratings[e.id]);
            return (
              <div key={e.id} style={{ background:"#fff", borderRadius:14, padding:"12px 14px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0D3D20", marginBottom:6 }}>{e.text}</div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:r?.bg, color:r?.color, padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:800 }}>
                  <span>{r?.short}</span><span>{r?.label}</span>
                </div>
                {comments[e.id] && <div style={{ fontSize:12, color:MU, marginTop:6, fontStyle:"italic" }}>"{comments[e.id]}"</div>}
              </div>
            );
          })}
          <button onClick={onLogout} style={{ padding:13, background:BL, color:"#fff", border:"none", borderRadius:14, fontWeight:900, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Done — Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width:"100%", maxWidth:440 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 16px", background:"linear-gradient(135deg,#146735,#20A464)", color:"#fff" }}>
        <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:10, padding:"6px 12px", color:"#fff", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:16 }}>{teacher.name} · {teacher.subject}</div>
          <div style={{ fontSize:12, opacity:0.8 }}>{today}</div>
        </div>
      </div>

      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ background:"#EAFDD8", borderRadius:14, padding:"10px 14px", fontSize:13, fontWeight:700, color:BL, borderLeft:`4px solid ${BL}` }}>
          Rate Grace on each expectation for today's class.
        </div>

        {expectations.map(e => (
          <div key={e.id} style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 16px rgba(17,138,178,0.08)", border:`2px solid ${ratings[e.id] ? SCALE.find(s=>s.val===ratings[e.id])?.color : BD}` }}>
            <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${BD}` }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0D3D20" }}>{e.text}</div>
            </div>
            <div style={{ padding:"10px 12px", display:"flex", gap:6 }}>
              {SCALE.map(s => (
                <button key={s.val} onClick={() => setRatings(r=>({...r,[e.id]:s.val}))} style={{ flex:1, padding:"10px 4px", border:`2px solid ${ratings[e.id]===s.val?s.color:BD}`, borderRadius:12, background:ratings[e.id]===s.val?s.bg:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, fontFamily:"inherit" }}>
                  <span style={{ fontWeight:900, fontSize:18, color:ratings[e.id]===s.val?s.color:MU }}>{s.short}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:ratings[e.id]===s.val?s.color:MU, textAlign:"center", lineHeight:1.2 }}>{s.label}</span>
                </button>
              ))}
            </div>
            <div style={{ padding:"0 12px 12px" }}>
              <input
                value={comments[e.id]}
                onChange={e2 => setComments(c=>({...c,[e.id]:e2.target.value}))}
                placeholder="Optional comment…"
                style={{ border:`2px solid ${BD}`, borderRadius:10, padding:"7px 11px", fontFamily:"inherit", fontSize:12, fontWeight:600, color:"#0D3D20", outline:"none", width:"100%", boxSizing:"border-box", background:"#EAFDD8" }}
              />
            </div>
          </div>
        ))}

        <button onClick={handleSubmit} disabled={!allRated} style={{ padding:14, background:allRated?BL:"#D6EDE1", color:allRated?"#fff":MU, border:"none", borderRadius:14, fontWeight:900, fontSize:15, cursor:allRated?"pointer":"not-allowed", fontFamily:"inherit" }}>
          {allRated ? "Submit Report" : `Rate all ${expectations.length} expectations to continue`}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("child");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [points, setPoints] = useState(7);
  const [redeemed, setRedeemed] = useState([]);
  const [rewards, setRewards] = useState(INITIAL_REWARDS);
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [dateRequests, setDateRequests] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  // Teacher system state
  const [teachers, setTeachers] = useState([
    { id:1, name:"Ms. Johnson", subject:"Math", email:"johnson@school.edu" },
    { id:2, name:"Mr. Patel", subject:"English", email:"patel@school.edu" },
  ]);
  const [expectations, setExpectations] = useState([
    { id:1, text:"Stays on task during independent work" },
    { id:2, text:"Participates respectfully in class discussions" },
    { id:3, text:"Completes and submits class assignments" },
  ]);
  const [teacherReports, setTeacherReports] = useState([]); // submitted daily reports
  const [activeTeacher, setActiveTeacher] = useState(null); // logged-in teacher

  const pendingDateRequests = dateRequests.filter(r => r.status === "pending");
  const unreadDeclines = dateRequests.filter(r => r.status === "declined" && !dismissedAlerts.includes(r.id));
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
  const todayKey = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const teachersPendingToday = teachers.filter(t => !teacherReports.some(r => r.teacherId === t.id && r.date === todayKey));

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", minHeight:"100vh", background:"linear-gradient(180deg,#EAFDD8 0%,#f8fef4 100%)", display:"flex", flexDirection:"column", alignItems:"center", paddingBottom:60 }}>
      <div style={{ width:"100%", maxWidth:440, display:"flex", background:"#fff", borderBottom:`2px solid ${BD}`, position:"sticky", top:0, zIndex:10, flexWrap:"nowrap" }}>
        {[["child","🦊 Grace"],["parent","👨‍👧 Parent"],["teacher","🏫 Teacher"]].map(([v,l]) => (
          <button key={v} onClick={() => { setView(v); if(v!=="teacher") setActiveTeacher(null); }} style={{ flex:1, padding:"12px 4px", border:"none", borderBottom:`3px solid ${view===v?P:"transparent"}`, background:"none", fontWeight:800, fontSize:12, color:view===v?P:MU, cursor:"pointer", fontFamily:"inherit", position:"relative", whiteSpace:"nowrap" }}>
            {l}
            {v==="parent" && pendingDateRequests.length > 0 && (
              <span style={{ position:"absolute", top:6, right:6, background:O, color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{pendingDateRequests.length}</span>
            )}
            {v==="child" && unreadDeclines.length > 0 && (
              <span style={{ position:"absolute", top:6, right:6, background:"#CC4400", color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{unreadDeclines.length}</span>
            )}
            {v==="teacher" && teachersPendingToday.length > 0 && (
              <span style={{ position:"absolute", top:6, right:6, background:"#20A464", color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{teachersPendingToday.length}</span>
            )}
          </button>
        ))}
      </div>
      {view==="child" && <ChildView tasks={tasks} setTasks={setTasks} points={points} setPoints={setPoints} redeemed={redeemed} setRedeemed={setRedeemed} rewards={rewards} bonusAwarded={bonusAwarded} dateRequests={dateRequests} setDateRequests={setDateRequests} dismissedAlerts={dismissedAlerts} setDismissedAlerts={setDismissedAlerts} teacherReports={teacherReports} today={today} todayKey={todayKey} />}
      {view==="parent" && <ParentView tasks={tasks} setTasks={setTasks} points={points} setPoints={setPoints} rewards={rewards} setRewards={setRewards} bonusAwarded={bonusAwarded} setBonusAwarded={setBonusAwarded} dateRequests={dateRequests} setDateRequests={setDateRequests} setPoints2={setPoints} redeemed={redeemed} setRedeemed={setRedeemed} teachers={teachers} setTeachers={setTeachers} expectations={expectations} setExpectations={setExpectations} teacherReports={teacherReports} teachersPendingToday={teachersPendingToday} today={today} todayKey={todayKey} />}
      {view==="teacher" && (
        activeTeacher
          ? <TeacherFormView teacher={activeTeacher} expectations={expectations} teacherReports={teacherReports} setTeacherReports={setTeacherReports} setPoints={setPoints} todayKey={todayKey} today={today} onLogout={() => setActiveTeacher(null)} />
          : <TeacherLoginView teachers={teachers} teacherReports={teacherReports} todayKey={todayKey} today={today} onLogin={setActiveTeacher} teachersPendingToday={teachersPendingToday} />
      )}
    </div>
  );
}
