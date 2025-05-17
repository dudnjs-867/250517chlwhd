const drugData = {
  '타이레놀': { symptoms: ['두통', '열', '근육통'], score: 85 },
  '애드빌': { symptoms: ['근육통', '두통', '열'], score: 80 },
  '판콜': { symptoms: ['기침', '콧물', '열'], score: 78 },
  '파스': { symptoms: ['근육통'], score: 60 },
  '지르텍': { symptoms: ['알레르기', '콧물'], score: 75 },
  '베나드릴': { symptoms: ['알레르기', '불면증'], score: 70 },
  '겔포스': { symptoms: ['소화불량', '복통'], score: 65 },
  '스멕타': { symptoms: ['설사', '복통'], score: 67 },
  '임팩타민': { symptoms: ['피로', '두통'], score: 50 },
  '멜라토닌': { symptoms: ['불면증'], score: 90 }
};

const interactionWarnings = {
  '타이레놀+애드빌': {
    reason: '간과 신장에 이중 부담을 줄 수 있습니다.',
    link: 'https://www.healthline.com/health/tylenol-vs-advil'
  },
  '지르텍+베나드릴': {
    reason: '둘 다 졸음을 유발하여 사고 위험이 있습니다.',
    link: 'https://www.drugs.com/interactions-check.php?drug_list=2296-0,865-0'
  },
  '멜라토닌+베나드릴': {
    reason: '과도한 졸음과 집중력 저하 우려가 있습니다.',
    link: 'https://www.sleepfoundation.org/melatonin/melatonin-and-benadryl'
  },
  '판콜+지르텍': {
    reason: '졸음, 어지럼증 증가 가능성이 있습니다.',
    link: 'https://www.drugs.com/interaction-check.php?drug_list=2296-0,2727-0'
  }
};

function getCheckedValues(containerId) {
  const checkboxes = document.querySelectorAll(`#${containerId} input:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

function recommend() {
  const selectedSymptoms = getCheckedValues('symptoms');
  const selectedMeds = getCheckedValues('currentMeds');

  const matches = [];
  for (const [drug, data] of Object.entries(drugData)) {
    const matchCount = data.symptoms.filter(symptom => selectedSymptoms.includes(symptom)).length;
    if (matchCount > 0) {
      matches.push({ name: drug, score: data.score });
    }
  }

  const recommendationDiv = document.getElementById('recommendation');
  const warningsDiv = document.getElementById('warnings');
  const resultSection = document.getElementById('result');
  resultSection.style.display = 'block';

  if (matches.length === 0) {
    recommendationDiv.innerHTML = '증상에 맞는 약물을 찾을 수 없습니다.';
  } else {
    recommendationDiv.innerHTML = '추천 약물: ' + matches.map(m => `${m.name} (${m.score}점)`).join(', ');
  }

  // 그래프
  const ctx = document.getElementById('scoreChart').getContext('2d');
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: matches.map(m => m.name),
      datasets: [{
        label: '추천 점수',
        data: matches.map(m => m.score),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });

  // 상호작용
  warningsDiv.innerHTML = '';
  for (let i = 0; i < selectedMeds.length; i++) {
    for (let j = i + 1; j < selectedMeds.length; j++) {
      const pair1 = `${selectedMeds[i]}+${selectedMeds[j]}`;
      const pair2 = `${selectedMeds[j]}+${selectedMeds[i]}`;
      const warning = interactionWarnings[pair1] || interactionWarnings[pair2];
      if (warning) {
        warningsDiv.innerHTML += `
          <div style="color: red; margin-top:10px;">
            ⚠️ <b>${pair1.replace('+', ' + ')}</b>: ${warning.reason}
            <br><a href="${warning.link}" target="_blank">🔗 관련 기사 보기</a>
          </div>
        `;
      }
    }
  }
}
