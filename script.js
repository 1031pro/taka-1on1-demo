(() => {
  "use strict";

  const questions = [
    "部下が話し終わる前に、自分の説明や経験談を始めることがある。",
    "報告する日を決めていても、その前に何度も進み具合を確認することがある。",
    "部下が新しい案を出すと、まず先に「失敗のリスク」を話すことがある。",
    "部下が話している間、相づちや声での反応が薄いことがある。",
    "部下が仕事の大変さを話したとき、「自分の方がもっと大変だった」と比べて返すことがある。",
    "部下が大切な相談をしている途中で、急に別の用件の話に変えることがある。",
    "部下に自分の成果を話すとき、少し盛ることがある。",
    "部下の相談に答えるとき、自分の説明や経験談が長く続くことがある。",
    "部下に任せた仕事でも、具体的な手順や順番まで自分から指示することがある。",
    "部下の報告を聞くと、できたことより先に、ミスや不足している点を指摘することがある。",
    "部下が自分の考えを話したあと、短い返事だけで会話を終えることがある。",
    "部下が知らないことを質問してきたとき、「そんなことも知らないの？」という趣旨の言葉を返すことがある。",
    "部下が話したいことを確かめず、自分が決めた流れで1on1を進めることがある。",
    "自分では十分に確認していないことでも、部下に聞かれると、知っているかのように説明することがある。",
    "部下が考えながら黙っていると、間を空けずに自分から話し始めることがある。",
    "部下に任せた仕事でも、気になる点があると、その都度口を出すことがある。",
    "部下の提案を聞くと、詳しく検討する前に「難しい」「無理だ」と否定することがある。",
    "部下が不安や悩みを話したとき、その気持ちには触れず、すぐ事実や対策の話に進むことがある。",
    "部下と意見が違うとき、自分の意見に従わせようとすることがある。",
    "部下が真剣に悩みを話しているのに、冗談や別の話題を振ることがある。",
    "部下に人脈を話すとき、実際よりも親しい関係であるかのように伝えることがある。",
  ];

  const answerChoices = [
    { value: 0, label: "一度もなかった", note: "場面はあったが、その行動はしなかった" },
    { value: 1, label: "まれにあった", note: "" },
    { value: 2, label: "ときどきあった", note: "" },
    { value: 3, label: "よくあった", note: "" },
    { value: 4, label: "ほぼ毎回あった", note: "" },
    { value: "not-applicable", label: "該当する場面がなかった", note: "点数には含めません", missing: true },
    { value: "unknown", label: "思い出せない・判断できない", note: "点数には含めません", missing: true },
  ];

  const types = [
    { id: "talk", name: "しゃべりすぎ", questions: [1, 8, 15] },
    { id: "mount", name: "マウント", questions: [5, 12, 19] },
    { id: "negative", name: "ネガティブ", questions: [3, 10, 17] },
    { id: "pace", name: "マイペース", questions: [6, 13, 20] },
    { id: "interference", name: "過干渉", questions: [2, 9, 16] },
    { id: "showoff", name: "カッコつけ", questions: [7, 14, 21] },
    { id: "dry", name: "ドライ", questions: [4, 11, 18] },
  ];

  const reports = {
    talk: {
      strength: "伝える力や経験を共有する力は、適切に使えば相手を助ける資源になります。",
      dialogue: [["上司", "最近、困っていることは？"], ["部下", "進め方に迷っていて……"], ["上司", "私も昔ね、同じことがあって……（長い説明）"]],
      voice: "「まだ状況を話し終えていないのに……」",
      signs: "部下が話し終える前に説明が始まる／考えるための沈黙が、上司の言葉で埋まる",
      reason: "助けたい気持ちから経験を語っても、話す順番と量が偏ると、部下自身の考えが言葉になる機会を減らしてしまいます。",
      actions: ["部下の話が終わるまで待つ", "「ほかにもありますか？」と一度確認する", "間が空いたら3秒待ち、考える時間を残す"],
      next: "最初の助言の前に「もう少し聞かせて」と一度尋ねる。",
      changes: [["部下が途中で話すのをやめる", "部下が事情を最後まで説明できる"], ["上司の経験談が会話の中心になる", "必要なときに上司の経験を参考にできる"]],
    },
    mount: {
      strength: "豊富な経験や判断力を、相手を上回るためではなく成長を支えるために生かせます。",
      dialogue: [["上司", "今回の案件、どうだった？"], ["部下", "初めての規模で大変でした"], ["上司", "その程度なら、私の若い頃はもっと大変だったよ"]],
      voice: "「比べられたかったわけじゃないんだけど……」",
      signs: "相談が上司との経験比較に変わる／意見が違うとき、上司の考えに合わせるよう求められる",
      reason: "経験や実績を示すこと自体は悪くありません。ただ、相手との優劣を強調すると、部下は自分の考えを話すより、上司の正解を探すことがあります。",
      actions: ["自分との比較をしない", "「どんな工夫をしたの？」と部下の経験を尋ねる", "助言をする前に「参考として話してもいい？」と確認する"],
      next: "自分の実績を語る前に、部下の工夫を一つ聞く。",
      changes: [["部下が上司の意見に合わせようとする", "部下が自分なりの工夫を語る"], ["上司の実績紹介に話が移る", "上司の経験を必要なときに活用できる"]],
    },
    negative: {
      strength: "問題やリスクに気づける視点は、挑戦を安全に進める強みになり得ます。",
      dialogue: [["上司", "何か新しい案はある？"], ["部下", "来月から小さく試したくて……"], ["上司", "でも、それは失敗するんじゃない？"]],
      voice: "「まだ案の良いところも説明していないのに……」",
      signs: "まず失敗のリスクを話す／できた点よりミスを指摘する／検討前に「無理」と結論づける",
      reason: "リスクを見つけることは仕事に必要です。しかし、提案の中身を検討する前に否定が続くと、部下はアイデアを出す意欲を失いやすくなります。",
      actions: ["最初に「良いと思う点」を一つ伝える", "「どんな条件なら小さく試せる？」と聞く", "リスクと対策を一緒に整理する"],
      next: "問題点を挙げる前に、提案の良い点を一つ尋ねる。",
      changes: [["「でも」「難しい」で会話が止まる", "可能性とリスクの両方を検討できる"], ["部下が新しい案を出しにくい", "小さく試す方法を一緒に考えられる"]],
    },
    pace: {
      strength: "独自の視点や行動の速さは、相手への確認が加わると生かしやすくなります。",
      dialogue: [["上司", "最近、仕事で困っていることは？"], ["部下", "進め方に少し不安があって……"], ["上司", "あ、そういえば来月の会議資料は？"]],
      voice: "「まだ不安について話していないのに……」",
      signs: "部下の大切な相談が別の用件に変わる／話したい内容より上司の段取りが優先される／悩みの途中で冗談や別の話題が出る",
      reason: "上司が大事だと思う話題と、部下が今話したい話題は同じとは限りません。話題やタイミングのズレが、本音を話しづらい空気につながることがあります。",
      actions: ["部下が話したいテーマを先に確かめる", "話題を変える前に「今の話はここまでで大丈夫？」と聞く", "悩みを聞くときは、冗談や別の話題を挟む前に相談の続きがあるか確かめる"],
      next: "話題を変える前に、部下に一度確認する。",
      changes: [["部下の相談が途中で終わる", "部下の不安や背景を確認できる"], ["上司の用件や進行が優先される", "納得して次の話題に進める"]],
    },
    interference: {
      strength: "小さな変化に気づく注意深さは、任せ方を工夫すると支援につながります。",
      dialogue: [["上司", "資料の進み具合は？"], ["部下", "昨日お伝えした通り、予定通りです"], ["上司", "本当に？ じゃあ明日も報告して"]],
      voice: "「任されたはずなのに、信用されていないのかな」",
      signs: "決めた報告日より前にも進み具合を聞く／任せた仕事へ、その都度細かく口を出す",
      reason: "失敗を防ぎたい気持ちがあっても、確認や介入が多すぎると、部下が自分で判断する余地を狭めることがあります。",
      actions: ["確認の時期と目的を先に決める", "部下が決められる範囲を明確にする", "「困ったらどこを相談したい？」と聞く"],
      next: "「どこまで任せるか」と確認頻度を先に合意する。",
      changes: [["確認と口出しが増える", "任せる範囲がはっきりする"], ["部下が自分の進め方を維持しにくくなる", "必要なときに相談しやすくなる"]],
    },
    showoff: {
      strength: "自分の経験を伝える力は、正確で誠実な共有に変えることで信頼に結びつきます。",
      dialogue: [["上司", "この分野なら何でも聞いて"], ["部下", "以前、その技術を使ったことは？"], ["上司", "もちろん、何度もあるよ（実際は未経験）"]],
      voice: "「確認してくれた方が、安心して相談できるのに……」",
      signs: "自分の成果を話す際に、実際の貢献を少し盛って語る／未確認のことも確かな知識のように伝える",
      reason: "有能に見られたい気持ちから説明が大きくなると、後で事実との食い違いが生じ、信頼を損なうことがあります。自己評価と行動がずれる場合もあるため、結果は決めつけずに扱います。",
      actions: ["事実・経験・推測を分けて話す", "わからないことは「確認します」と伝える", "自分の実績より部下の課題に焦点を戻す"],
      next: "経験した事実と、聞いた情報を分けて説明する。",
      changes: [["事実かどうか確認しづらい", "事実に基づいて相談できる"], ["部下が上司の説明を疑い始める", "わからないことも安心して確認できる"]],
    },
    dry: {
      strength: "落ち着いて事実を捉える力は、関心が伝わる応答を加えると生かしやすくなります。",
      dialogue: [["上司", "最近どう？"], ["部下", "納期が不安で……"], ["上司", "了解。進捗表は明日までにお願い"]],
      voice: "「仕事の話だけで終わっちゃったな……」",
      signs: "相づちや声の反応が薄い／短い返事で会話を終える／気持ちを確認せず対策へ進む",
      reason: "関心がないとは限りませんが、その関心が反応や質問に表れないと、部下が「これ以上話さなくていいのかな」と受け止めることがあります。",
      actions: ["最初に相手の言葉を一度受け止める", "「不安に感じているんですね」と言葉で受け止める", "「もう少し聞かせて」と一問加える"],
      next: "事実確認の前に、相手の気持ちを一言受け止める。",
      changes: [["事実確認だけで終わる", "気持ちも含めて共有できる"], ["部下が相談を控えることがある", "必要な事実確認にも進みやすい"]],
    },
  };

  const accessForm = document.querySelector("#access-form");
  const accessPassword = document.querySelector("#access-password");
  const accessError = document.querySelector("#access-error");
  const passwordHash = "0d563256b074dbd95ca18f4903b5ca0968ceeb8c0aa543f1a3b86895424bc84f";
  const answers = Array(questions.length).fill(null);
  let currentQuestion = 0;

  const hashText = async (text) => {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const grantAccess = () => {
    document.body.classList.remove("access-locked");
    document.body.classList.add("access-granted");
    document.querySelector("#start-button")?.focus();
  };

  accessForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    accessError.textContent = "";
    if (await hashText(accessPassword.value) === passwordHash) {
      grantAccess();
      return;
    }
    accessPassword.value = "";
    accessPassword.focus();
    accessError.textContent = "パスワードが違います。もう一度入力してください。";
  });
  requestAnimationFrame(() => accessPassword.focus());

  const screens = {
    intro: document.querySelector("#intro-screen"),
    question: document.querySelector("#question-screen"),
    result: document.querySelector("#result-screen"),
  };

  const showScreen = (name) => {
    document.body.dataset.screen = name;
    Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
    screens[name].classList.add("is-active");
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const renderQuestion = () => {
    const number = currentQuestion + 1;
    document.querySelector("#progress-current").textContent = number;
    document.querySelector("#question-number").textContent = `Q${String(number).padStart(2, "0")}`;
    document.querySelector("#question-heading").textContent = questions[currentQuestion];
    document.querySelector("#next-label").textContent = number === questions.length ? "診断結果を見る" : "次の質問へ";
    document.querySelector("#back-button").disabled = currentQuestion === 0;
    document.querySelector("#question-error").textContent = "";

    const progress = document.querySelector(".progress-track");
    progress.setAttribute("aria-valuenow", String(number));
    document.querySelector("#progress-fill").style.width = `${(number / questions.length) * 100}%`;

    const fieldset = document.querySelector("#answer-options");
    fieldset.querySelectorAll(".answer-option").forEach((node) => node.remove());
    answerChoices.forEach((choice, index) => {
      const label = document.createElement("label");
      label.className = `answer-option${choice.missing ? " is-missing" : ""}`;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = String(choice.value);
      input.checked = answers[currentQuestion] === choice.value;
      input.id = `answer-${index}`;
      const copy = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = choice.label;
      copy.appendChild(strong);
      if (choice.note) {
        const small = document.createElement("small");
        small.textContent = choice.note;
        copy.appendChild(small);
      }
      label.append(input, copy);
      fieldset.appendChild(label);
    });
  };

  const selectedAnswer = () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) return null;
    const numeric = Number(selected.value);
    return Number.isNaN(numeric) ? selected.value : numeric;
  };

  const calculateScores = () => types.map((type) => {
    const values = type.questions.map((question) => answers[question - 1]).filter((answer) => typeof answer === "number");
    if (values.length === 3) return { ...type, score: values.reduce((sum, value) => sum + value, 0), status: "valid", validCount: 3 };
    if (values.length === 2) return { ...type, score: Math.round((values.reduce((sum, value) => sum + value, 0) / 2) * 30) / 10, status: "reference", validCount: 2 };
    return { ...type, score: null, status: "hold", validCount: values.length };
  });

  const renderRanking = (scores) => {
    const rankingList = document.querySelector("#ranking-list");
    rankingList.textContent = "";
    const valid = scores.filter((item) => item.status === "valid").sort((a, b) => b.score - a.score || types.findIndex((type) => type.id === a.id) - types.findIndex((type) => type.id === b.id));
    const shown = valid.slice(0, 3);
    shown.forEach((item) => {
      const rank = 1 + valid.filter((other) => other.score > item.score).length;
      const row = document.createElement("div");
      row.className = `rank-row${rank === 1 ? " is-top" : ""}`;
      row.innerHTML = `<span class="rank-number">${rank === 1 && valid.filter((other) => other.score === item.score).length > 1 ? "同率1位" : `${rank}位`}</span><span class="rank-name"></span><span class="rank-bar"><span></span></span><span class="rank-score">${item.score}/12</span>`;
      row.querySelector(".rank-name").textContent = item.name;
      rankingList.appendChild(row);
      requestAnimationFrame(() => requestAnimationFrame(() => { row.querySelector(".rank-bar span").style.width = `${(item.score / 12) * 100}%`; }));
    });

    if (shown.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "判定できる傾向がありませんでした。";
      rankingList.appendChild(empty);
    }

    if (valid.length > 3 && valid[2].score === valid[3].score) {
      const extra = valid.filter((item, index) => index > 2 && item.score === valid[2].score).length;
      const note = document.createElement("p");
      note.className = "reference-scores";
      note.textContent = `3位と同率の傾向がほかに${extra}タイプあります。`;
      rankingList.appendChild(note);
    }

    const references = scores.filter((item) => item.status !== "valid");
    const box = document.querySelector("#reference-scores");
    if (references.length) {
      box.hidden = false;
      box.textContent = references.map((item) => item.status === "reference" ? `${item.name}：${item.score}/12（2問のみの参考値・順位対象外）` : `${item.name}：判定保留`).join("　／　");
    } else {
      box.hidden = true;
      box.textContent = "";
    }
    return valid;
  };

  const renderFocusReport = (type) => {
    const report = reports[type.id];
    document.querySelector("#focus-panel").hidden = false;
    document.querySelector("#exception-panel").hidden = true;
    document.querySelector("#focus-title").textContent = `${type.name}傾向`;
    document.querySelector("#strength-copy").textContent = report.strength;

    const dialogue = document.querySelector("#dialogue");
    dialogue.textContent = "";
    report.dialogue.forEach(([speaker, line]) => {
      const row = document.createElement("p");
      const name = document.createElement("span");
      const copy = document.createElement("strong");
      name.textContent = speaker;
      copy.textContent = line;
      row.append(name, copy);
      dialogue.appendChild(row);
    });
    document.querySelector("#inner-voice").textContent = `部下の心の声（例） ${report.voice}`;
    document.querySelector("#signs").textContent = `こんなことはありませんか？ ${report.signs}`;
    document.querySelector("#reason-copy").textContent = report.reason;
    const actions = document.querySelector("#action-list");
    actions.textContent = "";
    report.actions.forEach((action) => {
      const item = document.createElement("li");
      item.textContent = action;
      actions.appendChild(item);
    });
    document.querySelector("#next-action").textContent = report.next;
    const changeTable = document.querySelector("#change-table");
    changeTable.textContent = "";
    report.changes.forEach(([before, after]) => {
      const row = document.createElement("div");
      row.className = "change-row";
      const beforeNode = document.createElement("span");
      const arrow = document.createElement("span");
      const afterNode = document.createElement("span");
      beforeNode.textContent = before;
      arrow.textContent = "→";
      afterNode.textContent = after;
      row.append(beforeNode, arrow, afterNode);
      changeTable.appendChild(row);
    });
  };

  const renderException = (title, copy) => {
    document.querySelector("#focus-panel").hidden = true;
    document.querySelector("#exception-panel").hidden = false;
    document.querySelector("#exception-title").textContent = title;
    document.querySelector("#exception-copy").textContent = copy;
  };

  const renderResult = () => {
    const scores = calculateScores();
    const valid = renderRanking(scores);
    const allSevenValid = valid.length === 7;
    const allZero = allSevenValid && valid.every((item) => item.score === 0);
    const allSame = allSevenValid && valid.every((item) => item.score === valid[0].score);
    const leaders = valid.length ? valid.filter((item) => item.score === valid[0].score) : [];

    if (valid.length < 3) {
      document.querySelector("#ranking-title").textContent = "判定できた傾向";
      renderException("回答不足｜判定保留", "いくつかの質問で「該当する場面がない」「判断できない」が選択されたため、全体の比較が難しくなっています。回答できた傾向だけを参考として表示します。必要に応じて、別の機会に改めてお試しください。");
    } else if (allZero) {
      document.querySelector("#ranking-title").textContent = "あなたに出やすい傾向 TOP3";
      renderException("目立つ傾向なし", "今回の自己回答では、7つの行動傾向に該当する回答はありませんでした。これは1on1に課題がないと証明するものではありません。部下の反応や相談のしやすさを、これからも確かめていきましょう。");
    } else if (allSame) {
      document.querySelector("#ranking-title").textContent = "あなたに出やすい傾向 TOP3";
      renderException("複数傾向が同程度", "複数の傾向が同じ程度で表れています。現在の回答だけで一つの注目タイプを決めることは避け、各質問のうち心当たりのある場面から一つ選んでください。");
    } else if (leaders.length > 1) {
      document.querySelector("#ranking-title").textContent = "あなたに出やすい傾向 TOP3";
      renderException("同率1位｜複合傾向", `あなたの回答では「${leaders.map((item) => item.name).join("」「")}」が同じ得点でした。どれか一つに決めつけず、それぞれの行動を振り返ってみましょう。まずは思い当たる行動を一つ選び、次の1on1で試せる変化を考えてください。`);
    } else {
      document.querySelector("#ranking-title").textContent = "あなたに出やすい傾向 TOP3";
      renderFocusReport(valid[0]);
    }
    showScreen("result");
  };

  document.querySelector("#start-button").addEventListener("click", () => {
    answers.fill(null);
    currentQuestion = 0;
    renderQuestion();
    showScreen("question");
  });

  document.querySelector("#question-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const answer = selectedAnswer();
    if (answer === null) {
      document.querySelector("#question-error").textContent = "回答を1つ選んでください。";
      return;
    }
    answers[currentQuestion] = answer;
    if (currentQuestion < questions.length - 1) {
      currentQuestion += 1;
      renderQuestion();
      document.querySelector("#question-heading").focus({ preventScroll: true });
      return;
    }
    renderResult();
  });

  document.querySelector("#back-button").addEventListener("click", () => {
    if (currentQuestion === 0) return;
    const answer = selectedAnswer();
    if (answer !== null) answers[currentQuestion] = answer;
    currentQuestion -= 1;
    renderQuestion();
  });

  document.querySelector("#retry-button").addEventListener("click", () => {
    answers.fill(null);
    currentQuestion = 0;
    renderQuestion();
    showScreen("question");
  });
  document.querySelector("#print-button").addEventListener("click", () => window.print());
  document.querySelector("#brand-home").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("intro");
  });
})();
