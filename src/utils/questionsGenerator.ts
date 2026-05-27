import fs from "fs";
import path from "path";

export interface QuestionBankItem {
  grade: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function generateQuestionsBankIfNeeded() {
  const filePath = path.join(process.cwd(), "server_questions_bank.json");

  // Only generate if the file does not exist or has fewer than 1000 items
  if (fs.existsSync(filePath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (Array.isArray(existingData) && existingData.length >= 1000) {
        console.log(`[Question Bank] Found ${existingData.length} questions already generated. Skipping generation.`);
        return;
      }
    } catch (_) {
      console.log("[Question Bank] File exists but is corrupt. Regenerating...");
    }
  }

  console.log("[Question Bank] Generating exactly 1080 realistic Vietnamese school curriculum questions...");

  const bank: QuestionBankItem[] = [];

  // Helper arrays
  const subjects = ["Toán", "Lý", "Hoá", "Anh", "Sinh", "Khoa"];
  const optionsLetters = ["A", "B", "C", "D"];

  // Helper to shuffle choices but keep track of correct answer
  function formatOptions(correctText: string, wrongTexts: string[]): { options: string[], correctAnswer: string } {
    const list = [correctText, ...wrongTexts];
    // Simple pseudo-random shuffle to vary placement
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    const correctIdx = shuffled.indexOf(correctText);
    const letter = optionsLetters[correctIdx];
    const finalOptions = shuffled.map((txt, idx) => `${optionsLetters[idx]}. ${txt}`);
    return { options: finalOptions, correctAnswer: letter };
  }

  // Generate 180 Toán (Mathematics) questions
  for (let i = 0; i < 180; i++) {
    const gradeVal = (i % 7) + 6; // grades 6 - 12
    const grade = String(gradeVal);
    let question = "";
    let correctText = "";
    let wrongs: string[] = [];
    let explanation = "";

    const randType = i % 5;
    if (randType === 0) {
      // Linear equation: a * x + b = c
      const x = ((i + 5) % 12) + 2; // expected answer
      const a = ((i + 2) % 6) + 2;
      const b = (i * 3) % 20 - 10;
      const c = a * x + b;
      const sign = b >= 0 ? "+" : "-";
      const bAbs = Math.abs(b);
      question = `Tìm giá trị của x biết phương trình bậc nhất: ${a}x ${sign} ${bAbs} = ${c}`;
      correctText = `x = ${x}`;
      wrongs = [`x = ${x + 2}`, `x = ${x - 1}`, `x = ${x + 3}`];
      explanation = `Giải phương trình: ${a}x = ${c} - (${b >= 0 ? '+' : ''}${b}) => ${a}x = ${c - b} => x = ${x}.`;
    } else if (randType === 1) {
      // Areas of shapes
      const length = ((i * 4) % 15) + 6;
      const width = ((i * 2) % 5) + 2;
      const area = length * width;
      question = `Một mảnh vườn hình chữ nhật có chiều dài là ${length}m và chiều rộng là ${width}m. Tính diện tích mảnh vườn này.`;
      correctText = `${area} m²`;
      wrongs = [`${area + 15} m²`, `${area - 10} m²`, `${(length + width) * 2} m²`];
      explanation = `Diện tích hình chữ nhật được tính theo công thức S = dài x rộng. Do đó S = ${length} x ${width} = ${area} m².`;
    } else if (randType === 2) {
      // Quadratic: x^2 - (x1+x2)x + x1*x2 = 0
      const x1 = (i % 5) + 1;
      const x2 = ((i + 2) % 6) + 3;
      const b = -(x1 + x2);
      const c = x1 * x2;
      const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
      question = `Tìm tập nghiệm S của phương trình bậc hai: x² ${bSign}x ${cSign} = 0`;
      correctText = `S = {${Math.min(x1, x2)}; ${Math.max(x1, x2)}}`;
      wrongs = [
        `S = {${Math.min(x1, x2) - 1}; ${Math.max(x1, x2) + 1}}`,
        `S = {${x1 + 3}; ${x2 + 2}}`,
        `Phương trình vô nghiệm`
      ];
      explanation = `Sử dụng định lý Vi-ét đảo hoặc phân tích nhân tử: x² ${bSign}x ${cSign} = (x - ${x1})(x - ${x2}) = 0. Do đó nghiệm là x = ${x1} và x = ${x2}.`;
    } else if (randType === 3) {
      // Circle Area / Perimeter
      const r = ((i + 3) % 8) + 2; // radius
      const area = Math.round(3.14 * r * r * 100) / 100;
      question = `Tính diện tích hình tròn có bán kính r = ${r} cm (lấy pi xấp xỉ bằng 3.14).`;
      correctText = `${area} cm²`;
      wrongs = [`${Math.round(2 * 3.14 * r * 100) / 100} cm²`, `${area + 12} cm²`, `${Math.round(area * 1.5)} cm²`];
      explanation = `Diện tích hình tròn là S = pi * r² = 3.14 * ${r}² = 3.14 * ${r * r} = ${area} cm².`;
    } else {
      // Arithmetic sequences
      const u1 = (i % 10) + 1;
      const d = ((i + 1) % 5) + 2;
      const n = 5;
      const un = u1 + (n - 1) * d;
      question = `Cho cấp số cộng (un) có số hạng đầu u1 = ${u1} và công sai d = ${d}. Tìm giá trị số hạng thứ 5 (u5).`;
      correctText = `u5 = ${un}`;
      wrongs = [`u5 = ${un + d}`, `u5 = ${un - d}`, `u5 = ${u1 * Math.pow(d, 4)}`];
      explanation = `Công thức số hạng tổng quát của cấp số cộng: un = u1 + (n - 1)*d. Với n = 5 thì u5 = ${u1} + 4 * ${d} = ${un}.`;
    }

    const { options, correctAnswer } = formatOptions(correctText, wrongs);
    bank.push({ grade, subject: "Toán", question, options, correctAnswer, explanation });
  }

  // Generate 180 Lý (Physics) questions
  for (let i = 0; i < 180; i++) {
    const gradeVal = (i % 7) + 6;
    const grade = String(gradeVal);
    let question = "";
    let correctText = "";
    let wrongs: string[] = [];
    let explanation = "";

    const randType = i % 5;
    if (randType === 0) {
      // Ohm's Law: I = U / R
      const R = ((i * 3) % 25) + 5; // Ohms
      const I = ((i + 1) % 3) + 1; // Amps
      const U = R * I;
      question = `Một bóng đèn sợi đốt có điện trở R = ${R} Ω được mắc vào nguồn điện có hiệu điện thế U = ${U} V. Tìm cường độ dòng điện I chạy qua đèn.`;
      correctText = `${I} A`;
      wrongs = [`${I + 1.5} A`, `${I - 0.5} A`, `${Math.round((U + R) * 10) / 10} A`];
      explanation = `Theo định luật Ôm: I = U / R. Áp dụng số liệu: I = ${U} / ${R} = ${I} Ampe.`;
    } else if (randType === 1) {
      // Force Newton 2: F = m * a
      const m = ((i % 8) + 1) * 2; // kg
      const a = ((i + 2) % 5) + 1; // m/s^2
      const F = m * a;
      question = `Một vật có khối lượng m = ${m} kg chịu tác dụng của một lực không đổi gây ra gia tốc a = ${a} m/s². Độ lớn của lực F tác dụng là bao nhiêu?`;
      correctText = `${F} N`;
      wrongs = [`${F + 5} N`, `${F - 2} N`, `${m / a} N`];
      explanation = `Định luật II Newton phát biểu: F = m * a. Ở đây F = ${m} kg * ${a} m/s² = ${F} Newton.`;
    } else if (randType === 2) {
      // Kinetic Energy: Wd = 0.5 * m * v^2
      const m = ((i * 2) % 6) + 2; // kg
      const v = ((i + 1) % 4) + 2; // m/s
      const Wd = 0.5 * m * v * v;
      question = `Tính động năng của một vật nhỏ có khối lượng m = ${m} kg di chuyển với vận tốc v = ${v} m/s.`;
      correctText = `${Wd} J`;
      wrongs = [`${m * v} J`, `${Wd * 2} J`, `${Wd - 4} J`];
      explanation = `Động năng của hệ vật là: Wđ = 0.5 * m * v² = 0.5 * ${m} * ${v * v} = ${Wd} Joules.`;
    } else if (randType === 3) {
      // Frequency and wave speed: v = lambda * f
      const f = ((i * 50) % 350) + 100; // Hz
      const lambda = ((i % 4) + 1) * 0.5; // m
      const v = f * lambda;
      question = `Một sóng cơ học có tần số f = ${f} Hz lan truyền trong không khí với bước sóng lambda = ${lambda} m. Tính tốc độ truyền sóng v.`;
      correctText = `${v} m/s`;
      wrongs = [`${v + 100} m/s`, `${v - 50} m/s`, `${f / lambda} m/s`];
      explanation = `Tốc độ truyền sóng liên hệ bước sóng và tần số là: v = lambda * f = ${lambda} m * ${f} Hz = ${v} m/s.`;
    } else {
      // Pressure: p = d * h or p = F/S
      const F = ((i * 10) % 80) + 20;
      const S = ((i % 5) + 1) * 0.1;
      const p = Math.round(F / S);
      question = `Một vật có trọng lượng ${F} N đặt lên mặt bàn với diện tích tiếp xúc là ${S} m². Tính áp suất p áp đặt lên mặt bàn.`;
      correctText = `${p} N/m²`;
      wrongs = [`${p * 2} N/m²`, `${p - 50} N/m²`, `${Math.round(F * S)} N/m²`];
      explanation = `Áp suất tác dụng vuông góc lên bề mặt được tính là p = F / S = ${F} / ${S} = ${p} N/m² (hoặc Pa).`;
    }

    const { options, correctAnswer } = formatOptions(correctText, wrongs);
    bank.push({ grade, subject: "Lý", question, options, correctAnswer, explanation });
  }

  // Generate 180 Hoá (Chemistry) questions
  for (let i = 0; i < 180; i++) {
    const gradeVal = (i % 7) + 6;
    const grade = String(gradeVal);
    let question = "";
    let correctText = "";
    let wrongs: string[] = [];
    let explanation = "";

    const randType = i % 5;
    if (randType === 0) {
      // Atoms and masses
      const compounds = [
        { name: "Khí Cacbonic (CO₂)", mass: 44, formula: "C=12, O=16" },
        { name: "Nước (H₂O)", mass: 18, formula: "H=1, O=16" },
        { name: "Axit Sunfuric (H₂SO₄)", mass: 98, formula: "H=1, S=32, O=16" },
        { name: "Muối ăn (NaCl)", mass: 58.5, formula: "Na=23, Cl=35.5" },
        { name: "Khí Oxy (O₂)", mass: 32, formula: "O=16" }
      ];
      const comp = compounds[i % compounds.length];
      question = `Tính khối lượng mol phân tử (M) của hợp chất hóa học sau: ${comp.name}. Cho biết nguyên tử khối: ${comp.formula}.`;
      correctText = `${comp.mass} g/mol`;
      wrongs = [`${comp.mass + 14} g/mol`, `${comp.mass - 8} g/mol`, `${comp.mass * 2} g/mol`];
      explanation = `Khối lượng mol phân tử bằng tổng nguyên tử khối của các nguyên tố cấu thành. Áp dụng cho hợp chất ta thu được giá trị là ${comp.mass} g/mol.`;
    } else if (randType === 1) {
      // Solution concentrations: C% = (m_ct / m_dd) * 100
      const m_ct = ((i * 2) % 15) + 5; // grams of solute
      const m_water = 90; // grams of water
      const m_dd = m_ct + m_water;
      const pct = Math.round((m_ct / m_dd) * 1000) / 10;
      question = `Hòa tan hoàn toàn ${m_ct} gam NaCl muối ăn vào ${m_water} gam nước cất nguyên chất. Tính nồng độ phần trăm (C%) thu được của dung dịch này.`;
      correctText = `${pct}%`;
      wrongs = [`${Math.round(pct * 1.2)}%`, `${Math.round(pct * 0.8)}%`, `${Math.round((m_ct / m_water) * 100)}%`];
      explanation = `Khối lượng dung dịch m_dd = m_ct + m_dung_moi = ${m_ct} + ${m_water} = ${m_dd}g. Nồng độ C% = (m_ct / m_dd)*100 = (${m_ct} / ${m_dd})*100 = ${pct}%.`;
    } else if (randType === 2) {
      // Litmus behaviors
      const solutions = [
        { name: "Axit Clohiđric (HCl)", type: "axit", color: "đỏ (hồng)" },
        { name: "Natri Hiđroxit (NaOH)", type: "bazơ", color: "xanh" },
        { name: "Natri Clorua (NaCl)", type: "trung tính", color: "không đổi màu (giữ màu tím ban đầu)" }
      ];
      const sol = solutions[i % solutions.length];
      question = `Khi nhúng quỳ tím vào dung dịch ${sol.name}, quỳ tím sẽ chuyển sang màu nào?`;
      correctText = `Màu ${sol.color}`;
      wrongs = [`Màu vàng nhạt`, `Màu trắng xóa`, `Màu đen`];
      explanation = `Dung dịch ${sol.name} có tính chất ${sol.type}. Do đó quỳ tím thử nghiệm chuyển sang màu ${sol.color}.`;
    } else if (randType === 3) {
      // Chemical formulas
      const items = [
        { name: "Sắt (III) oxit", formula: "Fe2O3", isCorrect: true },
        { name: "Natri cacbonat", formula: "Na2CO3", isCorrect: true },
        { name: "Khí amoniac", formula: "NH3", isCorrect: true },
        { name: "Đồng (II) sunfat", formula: "CuSO4", isCorrect: true }
      ];
      const item = items[i % items.length];
      question = `Công thức hóa học chính thức của hợp chất "${item.name}" là gì?`;
      correctText = item.formula;
      wrongs = [item.formula.replace("3", "2").replace("2", ""), item.formula + "(OH)2", "HCl"];
      explanation = `Dựa vào hóa trị của nguyên tố sắt (hoặc các nhóm nguyên tử), công thức chính xác đại diện cho hợp chất ${item.name} là ${item.formula}.`;
    } else {
      // Stoichiometry: moles from mass
      const atoms = [
        { name: "Sắt (Fe)", M: 56 },
        { name: "Nhôm (Al)", M: 27 },
        { name: "Sắt (Fe)", M: 56 },
        { name: "Đồng (Cu)", M: 64 },
        { name: "Kẽm (Zn)", M: 65 }
      ];
      const atom = atoms[i % atoms.length];
      const moles = ((i % 3) + 1) * 0.5;
      const mass = moles * atom.M;
      question = `Tính số mol nguyên tử của ${mass} gam kim loại ${atom.name}. Cho biết nguyên tử khối của ${atom.name} là M = ${atom.M} g/mol.`;
      correctText = `${moles} mol`;
      wrongs = [`${moles * 2} mol`, `${moles + 1} mol`, `${moles - 0.2} mol`];
      explanation = `Áp dụng công thức chuyển hóa lượng chất: n = m / M. Ở đây số mol n = ${mass} / ${atom.M} = ${moles} mol.`;
    }

    const { options, correctAnswer } = formatOptions(correctText, wrongs);
    bank.push({ grade, subject: "Hoá", question, options, correctAnswer, explanation });
  }

  // Generate 180 Anh (English) questions
  for (let i = 0; i < 180; i++) {
    const gradeVal = (i % 7) + 6;
    const grade = String(gradeVal);
    let question = "";
    let correctText = "";
    let wrongs: string[] = [];
    let explanation = "";

    const randType = i % 5;
    if (randType === 0) {
      // Synonyms
      const vocabs = [
        { word: "happy", synonym: "joyful", wrongs: ["sad", "angry", "tired"] },
        { word: "beautiful", synonym: "pretty", wrongs: ["ugly", "painful", "heavy"] },
        { word: "huge", synonym: "enormous", wrongs: ["tiny", "delicious", "difficult"] },
        { word: "intelligent", synonym: "smart", wrongs: ["weak", "slow", "funny"] },
        { word: "quick", synonym: "rapid", wrongs: ["careful", "boring", "quiet"] }
      ];
      const selected = vocabs[i % vocabs.length];
      question = `Which word is a valid synonym (đồng nghĩa) of the word "${selected.word.toUpperCase()}"?`;
      correctText = selected.synonym;
      wrongs = selected.wrongs;
      explanation = `The word "${selected.word}" means feeling or showing pleasure. Its closest synonym among choices is "${selected.synonym}".`;
    } else if (randType === 1) {
      // Prepositions
      const sentences = [
        { phrase: "interested ______ listening", prep: "in", options: ["on", "at", "by"] },
        { phrase: "good ______ speaking English", prep: "at", options: ["for", "in", "with"] },
        { phrase: "worried ______ the exam next week", prep: "about", options: ["of", "to", "for"] },
        { phrase: "depends ______ your hard work", prep: "on", options: ["in", "at", "to"] }
      ];
      const item = sentences[i % sentences.length];
      question = `Choose the correct preposition to fill in the blank: "She is ${item.phrase}."`;
      correctText = item.prep;
      wrongs = item.options;
      explanation = `In English grammar, this particular adjective or verb is paired structure-wise with the preposition "${item.prep}".`;
    } else if (randType === 2) {
      // Verbs in simple tense
      const structures = [
        { verb: "work", thirdPerson: "works", subject: "My sister", frequency: "every day" },
        { verb: "play", thirdPerson: "plays", subject: "He usually", frequency: "football on Sunday" },
        { verb: "study", thirdPerson: "studies", subject: "The student", frequency: "in the library" }
      ];
      const structure = structures[i % structures.length];
      question = `Fill in the blank with the correct form of the verb: "${structure.subject} _______ (to ${structure.verb}) ${structure.frequency}."`;
      correctText = structure.thirdPerson;
      wrongs = [structure.verb, structure.verb + "ing", "had " + structure.verb];
      explanation = `The subject represents third-person singular (she/he/it). Therefore, the verb in Present Simple tense gets the '-s' or '-es' suffix: "${structure.thirdPerson}".`;
    } else if (randType === 3) {
      // Conditional sentences
      question = `Complete the conditional sentence structure: "If I _______ rich, I would travel around the world."`;
      correctText = "were";
      wrongs = ["am", "will be", "would be"];
      explanation = `This is a second conditional sentence (type 2) expressing imaginary situations in the present/future. In formal English, we use "were" for all subjects in the 'if' clause.`;
    } else {
      // Active passive
      question = `Change this sentence into Passive Voice: "The chef cooked a delicious meal."`;
      correctText = "A delicious meal was cooked by the chef.";
      wrongs = [
        "A delicious meal cooked the chef.",
        "A delicious meal has been cooked by the chef.",
        "The delicious meal is cooked by the chef."
      ];
      explanation = `The active sentence is in Past Simple. The passive structure is: Object (A delicious meal) + was/were + V3 (cooked) + by Subject (by the chef).`;
    }

    const { options, correctAnswer } = formatOptions(correctText, wrongs);
    bank.push({ grade, subject: "Anh", question, options, correctAnswer, explanation });
  }

  // Generate 180 Sinh (Biology) questions
  for (let i = 0; i < 180; i++) {
    const gradeVal = (i % 7) + 6;
    const grade = String(gradeVal);
    let question = "";
    let correctText = "";
    let wrongs: string[] = [];
    let explanation = "";

    const randType = i % 5;
    if (randType === 0) {
      // Organs and services
      const organs = [
        { name: "Thận", responsibility: "Lọc các chất độc hại trong máu và sản sinh nước tiểu" },
        { name: "Tim", responsibility: "Co bóp tuần hoàn đẩy đưa máu đi khắp cơ thể" },
        { name: "Gan", responsibility: "Thải độc tố, tổng hợp mật và dự trữ các đại dưỡng chất" },
        { name: "Phổi", responsibility: "Hấp thụ không khí lấy oxi (O2) và thải cacbonic (CO2)" }
      ];
      const o = organs[i % organs.length];
      question = `Trong cơ thể người khỏe mạnh, cơ quan nào chịu trách nhiệm chính về việc: "${o.responsibility}"?`;
      correctText = o.name;
      wrongs = organs.filter(x => x.name !== o.name).map(x => x.name).slice(0, 3);
      if (wrongs.length < 3) wrongs.push("Dạ dày");
      explanation = `Mỗi cơ quan đảm nhận chức năng cơ bản riêng. Cơ quan thực hiện nhiệm vụ ${o.responsibility} là ${o.name}.`;
    } else if (randType === 1) {
      // DNA rule of Chargaff (A=T, G=X)
      const aPct = ((i * 3) % 15) + 15; // 15% to 29%
      const gPct = 50 - aPct;
      question = `Theo nguyên tắc bổ sung Chargaff trong cấu trúc phân tử ADN mạch kép, nếu tỷ lệ nucleotit loại Adenin (A) chiếm ${aPct}% tổng số nucleotit, thì tỷ lệ của loại Guanin (G) là bao nhiêu phần trăm?`;
      correctText = `${gPct}%`;
      wrongs = [`${aPct}%`, `${100 - aPct}%`, `${100 - 2 * aPct}%`];
      explanation = `Ta có ADN mạch kép luôn tuân theo công thức %A + %G = 50%. Vậy nếu %A = ${aPct}% thì %G = 50% - ${aPct}% = ${gPct}%.`;
    } else if (randType === 2) {
      // Cells
      const organelles = [
        { name: "Nhân tế bào", desc: "Chứa thông tin di truyền kiểm soát mọi hoạt động sống" },
        { name: "Ti thể", desc: "Được coi là trạm năng lượng của tế bào, chuyển hóa ATP" },
        { name: "Lục lạp", desc: "Chứa diệp lục làm nhiệm vụ quang hợp sản xuất đường" }
      ];
      const org = organelles[i % organelles.length];
      question = `Bộ phận nào cấu trúc trong tế bào sinh sống được biết đến với nhiệm vụ: "${org.desc}"?`;
      correctText = org.name;
      wrongs = organelles.filter(x => x.name !== org.name).map(x => x.name);
      if (wrongs.length < 3) wrongs.push("Màng sinh chất", "Ribôxôm");
      wrongs = wrongs.slice(0, 3);
      explanation = `Cấu trúc chịu trách nhiệm "${org.desc}" chính là ${org.name}.`;
    } else if (randType === 3) {
      // Photosynthesis formula
      question = `Sản phẩm đầu ra (chất tạo thành) của quá trình quang hợp ở thực vật xanh gồm những chất nào?`;
      correctText = "Đường Glucozơ và khí Ôxy (O₂)";
      wrongs = [
        "Khí Cacbonic (CO₂) và Nước (H₂O)",
        "Dung dịch Axit và muối khoáng",
        "Khí Nitơ và năng lượng nhiệt"
      ];
      explanation = `Quang hợp sử dụng nước và khí cacbonic dưới tác động ánh sáng mặt trời để sinh sản hữu cơ: Glucozơ và giải phóng khí Ôxy ra ngoài không khí.`;
    } else {
      // Blood cells
      question = `Thành phần tế bào nào trong máu giữ nhiệm vụ vận chuyển khí Ôxy từ phổi đi nuôi các mô tế bào của cơ thể?`;
      correctText = "Hồng cầu";
      wrongs = ["Bạch cầu", "Tiểu cầu", "Huyết tương"];
      explanation = `Hồng cầu chứa huyết sắc tố hemoglobin liên kết lỏng lẻo với O2, có trách nhiệm trung chuyển khí thở đi khắp cơ thể. Bạch cầu bảo vệ, tiểu cầu đông máu.`;
    }

    const { options, correctAnswer } = formatOptions(correctText, wrongs);
    bank.push({ grade, subject: "Sinh", question, options, correctAnswer, explanation });
  }

  // Generate 180 Khoa (Science) questions
  for (let i = 0; i < 180; i++) {
    const gradeVal = (i % 7) + 6;
    const grade = String(gradeVal);
    let question = "";
    let correctText = "";
    let wrongs: string[] = [];
    let explanation = "";

    const randType = i % 5;
    if (randType === 0) {
      // Planets in system
      const planets = [
        { name: "Sao Thủy (Mercury)", property: "Hành tinh nằm gần Mặt Trời nhất" },
        { name: "Sao Mộc (Jupiter)", property: "Hành tinh có kích thước khổng lồ lớn nhất" },
        { name: "Sao Hỏa (Mars)", property: "Hành tinh Đỏ nhiều oxit sắt cát bụi" },
        { name: "Sao Kim (Venus)", property: "Hành tinh sáng nhất và nóng nhất do hiệu ứng nhà kính cực độ" }
      ];
      const p = planets[i % planets.length];
      question = `Hành tinh nào trong Hệ Mặt Trời sở hữu đặc điểm nổi bật này: "${p.property}"?`;
      correctText = p.name;
      wrongs = planets.filter(x => x.name !== p.name).map(x => x.name).slice(0, 3);
      if (wrongs.length < 3) wrongs.push("Trái Đất");
      explanation = `Hệ Mặt Trời bao gồm 8 hành tinh chính thức. Vật thể mang đặc điểm "${p.property}" là ${p.name}.`;
    } else if (randType === 1) {
      // State changes of matter
      const changes = [
        { term: "Sự nóng chảy", transition: "Chuyển từ trạng thái rắn sang trạng thái lỏng" },
        { term: "Sự ngưng tụ", transition: "Chuyển từ trạng thái khí (hơi) sang trạng thái lỏng" },
        { term: "Sự bay hơi", transition: "Chuyển từ trạng thái lỏng sang trạng thái khí (hơi)" },
        { term: "Sự đông đặc", transition: "Chuyển từ trạng thái lỏng sang trạng thái rắn" }
      ];
      const c = changes[i % changes.length];
      question = `Hiện tượng vật lý nào mô tả: "${c.transition}"?`;
      correctText = c.term;
      wrongs = changes.filter(x => x.term !== c.term).map(x => x.term).slice(0, 3);
      explanation = `Hiện tượng thay đổi thể trạng thái vật chất "${c.transition}" được khoa học gọi tên là ${c.term}.`;
    } else if (randType === 2) {
      // Renewable energies
      question = `Nguồn năng lượng nào sau đây là nguồn năng lượng tái tạo (vô hạn, thân thiện với môi trường)?`;
      correctText = "Năng lượng gió và năng lượng Mặt Trời";
      wrongs = ["Than đá khoáng sản", "Dầu mỏ dầu hỏa khí tự nhiên", "Khí gas hóa chất tổng hợp"];
      explanation = `Gió, nước, mặt trời luân chuyển vô tận cấu tạo dòng chảy thiên nhiên nên là năng lượng tái tạo. Than đá, dầu mỏ mất triệu năm để hình thành và có hạn.`;
    } else if (randType === 3) {
      // Atmosphere gas percent
      question = `Khí nào sau đây chiếm thành phần tỷ lệ lớn nhất (khoảng 78% thể tích) trong tầng khí quyển Trái Đất của chúng ta?`;
      correctText = "Khí Nitơ (N2)";
      wrongs = ["Khí Ôxy (O2)", "Khí Cacbonic (CO2)", "Hơi nước và Argon (Ar)"];
      explanation = `Khí quyển Trái Đất có thành phần gồm: ~78% khí Nitơ (N2), ~21% khí Ôxy (O2), và 1% các khí hiếm khác lẫn bụi ẩm.`;
    } else {
      // Stars and light speed
      const lSpeed = 300000;
      question = `Tốc độ truyền đi của ánh sáng trong môi trường chân không lý tưởng xấp xỉ khoảng bao nhiêu kí lô mét một giây (km/s)?`;
      correctText = "~ 300,000 km/s";
      wrongs = ["~ 1,500 km/s", "~ 340 m/s (tốc độ âm thanh)", "~ 3,000,000 km/s"];
      explanation = `Tốc độ ánh sáng trong chân không là c = 299,792,458 m/s, xấp xỉ tương đương 300,000 km/s, là tốc độ giới hạn của vũ trụ.`;
    }

    const { options, correctAnswer } = formatOptions(correctText, wrongs);
    bank.push({ grade, subject: "Khoa", question, options, correctAnswer, explanation });
  }

  // Write file to workspace root
  try {
    fs.writeFileSync(filePath, JSON.stringify(bank, null, 2), "utf-8");
    console.log(`[Question Bank] Successfully generated exactly ${bank.length} questions writing to ${filePath}!`);
  } catch (err) {
    console.error("[Question Bank] Failed to complete generation writing:", err);
  }
}
