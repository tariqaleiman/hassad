// ═══════════════════════════════════════════════════════
//  حصاد — CHARTS MODULE
// ═══════════════════════════════════════════════════════

let dashCharts = {};

function initDashboardCharts() {
  // Destroy existing charts to prevent memory leaks or overlapping on re-renders
  if (dashCharts.finance) dashCharts.finance.destroy();
  if (dashCharts.expenses) dashCharts.expenses.destroy();
  if (dashCharts.milk) dashCharts.milk.destroy();

  Chart.defaults.font.family = '"Tajawal", "Cairo", sans-serif';
  Chart.defaults.color = '#64748B';

  renderFinanceChart();
  renderExpensesChart();
  renderMilkChart();
}

function renderFinanceChart() {
  const ctx = document.getElementById('chart-finance');
  if (!ctx) return;

  // Group last 6 months of financial transactions
  const months = [];
  const revData = [];
  const costData = [];
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    let mStr = d.toISOString().slice(0, 7); // YYYY-MM
    months.push(mStr);
    
    // Calculate rev and cost for this month
    let mRev = 0, mCost = 0;
    const allTx = typeof getAllTransactions === 'function' ? getAllTransactions() : [];
    allTx.forEach(tx => {
      if (tx.date.startsWith(mStr)) {
        if (tx.type === 'in') mRev += Number(tx.amount || 0);
        else mCost += Number(tx.amount || 0);
      }
    });
    revData.push(mRev);
    costData.push(mCost);
  }

  dashCharts.finance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'الإيرادات',
          data: revData,
          backgroundColor: '#10B981',
          borderRadius: 4
        },
        {
          label: 'المصروفات',
          data: costData,
          backgroundColor: '#EF4444',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}

function renderExpensesChart() {
  const ctx = document.getElementById('chart-expenses');
  if (!ctx) return;

  // Aggregate expenses by category
  const cats = {};
  const allTx = typeof getAllTransactions === 'function' ? getAllTransactions() : [];
  allTx.forEach(tx => {
    if (tx.type === 'out') {
      const cat = tx.cat || 'أخرى';
      cats[cat] = (cats[cat] || 0) + Number(tx.amount || 0);
    }
  });

  const labels = Object.keys(cats);
  const data = Object.values(cats);

  if(data.length === 0) {
    labels.push('لا توجد بيانات');
    data.push(1);
  }

  dashCharts.expenses = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#64748B'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' }
      },
      cutout: '70%'
    }
  });
}

function renderMilkChart() {
  const ctx = document.getElementById('chart-milk');
  if (!ctx) return;

  // Last 14 days of milk production
  const days = [];
  const milkData = [];
  
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    let d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    let dStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
    days.push(dStr.slice(5)); // Just MM-DD for x-axis
    
    // Calculate total milk for this day
    let t = 0;
    (S.milkLogs||[]).forEach(l => {
      if (l.date === dStr) {
        t += Object.values(l.qtys || {}).reduce((s, v) => s + Number(v || 0), 0);
      }
    });
    milkData.push(t);
  }

  dashCharts.milk = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'إنتاج الحليب (كجم)',
        data: milkData,
        borderColor: '#007aff',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#007aff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
