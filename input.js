/* ---------- data ---------- */

const RULES = [
  {has:["Chest pain","Shortness of breath"], diag:"Cardiac or respiratory problem — urgent evaluation", meds:"Oxygen & cardiac evaluation", emergency:true, conf:96},
  {has:["Severe bleeding","Unconsciousness"], diag:"Major trauma or hemorrhage", meds:"Bleeding control & emergency care", emergency:true, conf:98},
  {has:["High fever","Severe abdominal pain"], diag:"Possible infection or appendicitis", meds:"Antipyretics; urgent assessment", emergency:false, conf:78},
  {has:["Seizure","Confusion"], diag:"Neurological event — urgent workup", meds:"Neurologic stabilization", emergency:true, conf:92},
  {has:["Cough","Sore throat","Runny nose"], diag:"Likely viral upper respiratory infection", meds:"Supportive care (fluids, rest)", emergency:false, conf:64},
  {has:["Rash","Allergic reaction"], diag:"Allergic reaction", meds:"Antihistamines; consider epinephrine if severe", emergency:false, conf:70},
  {has:["Fracture","Sprain"], diag:"Musculoskeletal injury", meds:"Immobilize, pain control; ortho follow-up", emergency:false, conf:60}
];

/* ---------- UI elements ---------- */
const symptomListEl = document.getElementById('symptomList');
const symptomSearch = document.getElementById('symptomSearch');
const chipArea = document.getElementById('chipArea');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const diagnosisEl = document.getElementById('diagnosis');
const medsEl = document.getElementById('meds');
const confidenceEl = document.getElementById('confidence');
const emergencyBanner = document.getElementById('emergencyBanner');
const emergencyYesNo = document.getElementById('emergencyYesNo');
const lastUpdated = document.getElementById('lastUpdated');

let available = [...SYMPTOMS];
let chosen = [];

/* render dropdown list */
function renderList(filter=""){
  symptomListEl.innerHTML = "";
  const f = filter.trim().toLowerCase();
  const filtered = available.filter(s => s.toLowerCase().includes(f)).slice(0,60);
  if(filtered.length === 0){
    symptomListEl.hidden = true;
    return;
  }
  filtered.forEach((s)=>{
    const lab = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = s;
    cb.addEventListener('change', () => {
      if(cb.checked) addSymptom(s); else removeSymptom(s);
    });
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(s));
    symptomListEl.appendChild(lab);
  });
  symptomListEl.hidden = false;
}

/* chips */
function renderChips(){
  chipArea.innerHTML = "";
  chosen.forEach(s=>{
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = s;
    const but = document.createElement('button'); but.setAttribute('aria-label','remove '+s); but.textContent='✕';
    but.onclick = ()=>removeSymptom(s);
    span.appendChild(but);
    chipArea.appendChild(span);
  });
}

/* add/remove */
function addSymptom(s){
  if(!chosen.includes(s)){
    chosen.push(s);
    renderChips();
    renderList(symptomSearch.value);
  }
}
function removeSymptom(s){
  chosen = chosen.filter(x => x !== s);
  renderChips();
  renderList(symptomSearch.value);
}

/* events */
symptomSearch.addEventListener('input', (e)=> renderList(e.target.value));
symptomSearch.addEventListener('focus', ()=> renderList(symptomSearch.value));
document.addEventListener('click', (e)=>{
  if(!e.target.closest('.dropdown') && !e.target.closest('#symptomInput')) symptomListEl.hidden = true;
});
symptomSearch.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    const val = symptomSearch.value.trim();
    if(val){
      const match = SYMPTOMS.find(s => s.toLowerCase() === val.toLowerCase());
      addSymptom(match || val);
      symptomSearch.value='';
      renderList('');
    }
  }
});

/* analysis logic */
function analyze(){
  const age = Number(document.getElementById('age').value || 0);
  const sex = document.getElementById('sex').value;
  const weight = Number(document.getElementById('weight').value || 0);
  const height = Number(document.getElementById('height').value || 0);

  if(chosen.length === 0){
    diagnosisEl.textContent = "No symptoms selected — nothing to analyze.";
    medsEl.textContent = "—";
    confidenceEl.textContent = "—";
    emergencyBanner.hidden = true;
    emergencyYesNo.textContent = "No";
    lastUpdated.textContent = new Date().toLocaleTimeString();
    return;
  }

  let matched = null;
  for(const r of RULES){
    if(r.has.some(h => chosen.some(c => c.toLowerCase().includes(h.toLowerCase())))){
      matched = r; break;
    }
  }

  if(matched){
    diagnosisEl.textContent = matched.diag;
    medsEl.textContent = matched.meds;
    confidenceEl.textContent = matched.conf + "%";
    emergencyYesNo.textContent = matched.emergency ? "Yes" : "No";
    if(matched.emergency){
      emergencyBanner.hidden = false;
      const sub = emergencyBanner.querySelector('.danger-sub');
      if(sub) sub.textContent = "Get to the ER now — don't be a hero (quack!).";
    } else {
      emergencyBanner.hidden = true;
    }
  } else {
    diagnosisEl.textContent = "Non-urgent or undifferentiated symptoms — recommend primary care / telehealth.";
    medsEl.textContent = "Supportive care; follow-up if symptoms worsen.";
    confidenceEl.textContent = "40%";
    emergencyYesNo.textContent = "No";
    emergencyBanner.hidden = true;
  }

  lastUpdated.textContent = new Date().toLocaleTimeString();
}

/* buttons */
analyzeBtn.addEventListener('click', analyze);
resetBtn.addEventListener('click', ()=>{
  chosen = []; renderChips(); symptomSearch.value=''; document.getElementById('age').value=''; document.getElementById('sex').value=''; document.getElementById('weight').value=''; document.getElementById('height').value='';
  diagnosisEl.textContent = "No analysis yet — press Enter."; medsEl.textContent = "—"; confidenceEl.textContent = "—"; emergencyBanner.hidden = true; emergencyYesNo.textContent = "—"; lastUpdated.textContent = "—";
});

/* initial */
renderList();
