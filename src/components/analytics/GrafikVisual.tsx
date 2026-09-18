import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Users, 
  Stethoscope, 
  Award, 
  Clock, 
  GraduationCap, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  Download, 
  Filter, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Sheet } from '../../types/sheet';

interface GrafikVisualProps {
  sheet: Sheet;
}

const PALETTE = {
  emerald: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  blue: ['#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd'],
  status: {
    PNS: '#0284c7',
    PPPK: '#059669',
    'NON PNS': '#f59e0b',
    PJLP: '#8b5cf6',
    CPNS: '#ec4899',
    Lainnya: '#94a3b8'
  },
  gender: {
    'Laki - Laki': '#0284c7',
    'Perempuan': '#ec4899'
  }
};

export const GrafikVisual: React.FC<GrafikVisualProps> = ({ sheet }) => {
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterTenaga, setFilterTenaga] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filtered rows
  const activeRows = useMemo(() => {
    return sheet.rows.filter(r => {
      if (filterUnit !== 'ALL' && r.tempat_tugas !== filterUnit) return false;
      if (filterTenaga !== 'ALL' && r.jenis_tenaga !== filterTenaga) return false;
      if (filterStatus !== 'ALL' && r.status_kepegawaian !== filterStatus) return false;
      return true;
    });
  }, [sheet.rows, filterUnit, filterTenaga, filterStatus]);

  // Executive KPIs
  const kpis = useMemo(() => {
    const total = activeRows.length;
    let nakes = 0;
    let penunjang = 0;
    let asn = 0;
    let nonAsn = 0;
    let sumUsia = 0;
    let countUsia = 0;
    let sumMasa = 0;
    let countMasa = 0;
    let shift24 = 0;

    activeRows.forEach(r => {
      if (r.jenis_tenaga === 'Tenaga Kesehatan') nakes++;
      else penunjang++;

      const st = r.status_kepegawaian || '';
      if (st.includes('PNS') || st.includes('PPPK')) asn++;
      else nonAsn++;

      if (typeof r.usia_tahun === 'number' && r.usia_tahun > 0) {
        sumUsia += r.usia_tahun;
        countUsia++;
      }

      if (typeof r.masa_kerja_tahun === 'number' && r.masa_kerja_tahun >= 0) {
        sumMasa += r.masa_kerja_tahun;
        countMasa++;
      }

      if ((r.jam_kerja || '').includes('24')) shift24++;
    });

    return {
      total,
      nakes,
      penunjang,
      nakesPct: total ? ((nakes / total) * 100).toFixed(1) : '0',
      asn,
      nonAsn,
      asnPct: total ? ((asn / total) * 100).toFixed(1) : '0',
      avgUsia: countUsia ? (sumUsia / countUsia).toFixed(1) : '0',
      avgMasa: countMasa ? (sumMasa / countMasa).toFixed(1) : '0',
      shift24
    };
  }, [activeRows]);

  // 1. Status Kepegawaian Pie Data
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeRows.forEach(r => {
      const s = r.status_kepegawaian || 'Lainnya';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: PALETTE.status[name as keyof typeof PALETTE.status] || '#94a3b8'
    })).sort((a, b) => b.value - a.value);
  }, [activeRows]);

  // 2. Jenis Tenaga Pie Data
  const jenisTenagaPieData = useMemo(() => {
    return [
      { name: 'Tenaga Kesehatan', value: kpis.nakes, color: '#059669' },
      { name: 'Tenaga Penunjang', value: kpis.penunjang, color: '#64748b' }
    ];
  }, [kpis]);

  // 3. Kelompok Usia & Gender Data
  const usiaGenderData = useMemo(() => {
    const groups: Record<string, { group: string; pria: number; wanita: number }> = {
      '< 30 Thn': { group: '< 30 Thn', pria: 0, wanita: 0 },
      '30 - 39 Thn': { group: '30 - 39 Thn', pria: 0, wanita: 0 },
      '40 - 49 Thn': { group: '40 - 49 Thn', pria: 0, wanita: 0 },
      '50+ Thn': { group: '50+ Thn', pria: 0, wanita: 0 }
    };

    activeRows.forEach(r => {
      const u = typeof r.usia_tahun === 'number' ? r.usia_tahun : 0;
      const g = (r.jenis_kelamin || '').toLowerCase().includes('laki') ? 'pria' : 'wanita';

      let key = '30 - 39 Thn';
      if (u > 0 && u < 30) key = '< 30 Thn';
      else if (u >= 30 && u < 40) key = '30 - 39 Thn';
      else if (u >= 40 && u < 50) key = '40 - 49 Thn';
      else if (u >= 50) key = '50+ Thn';

      if (groups[key]) groups[key][g]++;
    });

    return Object.values(groups);
  }, [activeRows]);

  // 4. Tempat Tugas Distribution
  const unitData = useMemo(() => {
    const counts: Record<string, { name: string; shortName: string; nakes: number; penunjang: number; total: number }> = {};
    activeRows.forEach(r => {
      const u = r.tempat_tugas || 'Lainnya';
      if (!counts[u]) {
        let short = u;
        if (u.includes('Pari')) short = 'Pustu Pari';
        else if (u.includes('Lancang')) short = 'Pustu Lancang';
        else if (u.includes('Untung Jawa')) short = 'Pustu Untung Jawa';
        else if (u.includes('Seribu')) short = 'Puskesmas Induk';
        counts[u] = { name: u, shortName: short, nakes: 0, penunjang: 0, total: 0 };
      }
      if (r.jenis_tenaga === 'Tenaga Kesehatan') counts[u].nakes++;
      else counts[u].penunjang++;
      counts[u].total++;
    });
    return Object.values(counts).sort((a, b) => b.total - a.total);
  }, [activeRows]);

  // 5. Jenjang Pendidikan
  const pendidikanData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeRows.forEach(r => {
      const p = r.pendidikan || 'Lainnya';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [activeRows]);

  // 6. Top 8 Jabatan
  const topJabatanData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeRows.forEach(r => {
      const j = r.jabatan || 'Lainnya';
      counts[j] = (counts[j] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [activeRows]);

  // Export Dashboard Summary to CSV
  const handleExportSummary = () => {
    let csv = 'RINGKASAN GRAFIK ANALITIK SDMK PUSKESMAS KEPULAUAN SERIBU SELATAN\n\n';
    csv += `Total Pegawai Terpilih,${kpis.total}\n`;
    csv += `Tenaga Kesehatan,${kpis.nakes} (${kpis.nakesPct}%)\n`;
    csv += `Tenaga Penunjang,${kpis.penunjang}\n`;
    csv += `Status ASN (PNS/PPPK),${kpis.asn} (${kpis.asnPct}%)\n`;
    csv += `Non-ASN / PJLP,${kpis.nonAsn}\n`;
    csv += `Rata-rata Usia,${kpis.avgUsia} Tahun\n`;
    csv += `Rata-rata Masa Kerja,${kpis.avgMasa} Tahun\n`;
    csv += `Staf Layanan 24 Jam,${kpis.shift24}\n\n`;

    csv += 'KOMPOSISI STATUS KEPEGAWAIAN\n';
    statusPieData.forEach(d => {
      csv += `"${d.name}",${d.value}\n`;
    });

    csv += '\nDISTRIBUSI UNIT TUGAS\n';
    unitData.forEach(d => {
      csv += `"${d.name}",Nakes: ${d.nakes},Penunjang: ${d.penunjang},Total: ${d.total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ringkasan_Grafik_SDMK_Puskesmas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control & Filter Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dashboard Grafik Ringkasan Data Sheet
              </h2>
              <p className="text-xs text-slate-500">
                Visualisasi komprehensif demografi, status kepegawaian, dan formasi SDMK
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="ALL">Semua Unit Tugas</option>
              <option value="Puskesmas Kepulauan Seribu Selatan">Puskesmas Kec. Seribu Selatan</option>
              <option value="Puskesmas Pembantu Pulau Pari">Pustu Pulau Pari</option>
              <option value="Puskesmas Pembantu Pulau Lancang">Pustu Pulau Lancang</option>
              <option value="Puskesmas Pembantu Pulau Untung Jawa">Pustu Pulau Untung Jawa</option>
            </select>

            <select
              value={filterTenaga}
              onChange={(e) => setFilterTenaga(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="ALL">Semua Jenis Tenaga</option>
              <option value="Tenaga Kesehatan">Tenaga Kesehatan</option>
              <option value="Tenaga Penunjang">Tenaga Penunjang</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="PNS">PNS</option>
              <option value="PPPK">PPPK</option>
              <option value="NON PNS">NON PNS</option>
              <option value="PJLP">PJLP</option>
            </select>

            <button
              onClick={handleExportSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors ml-auto md:ml-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Ringkasan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Total SDMK</div>
          <div className="text-xl font-bold text-slate-900">{kpis.total} Orang</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pegawai aktif terdata</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Tenaga Kesehatan</div>
          <div className="text-xl font-bold text-emerald-700">{kpis.nakes}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{kpis.nakesPct}% total pegawai</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Tenaga Penunjang</div>
          <div className="text-xl font-bold text-slate-700">{kpis.penunjang}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Administrasi & Teknis</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Aparatur Sipil (ASN)</div>
          <div className="text-xl font-bold text-blue-700">{kpis.asn}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{kpis.asnPct}% PNS + PPPK</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Rata-rata Usia</div>
          <div className="text-xl font-bold text-indigo-700">{kpis.avgUsia} Thn</div>
          <div className="text-[10px] text-indigo-600 mt-0.5">Masa kerja {kpis.avgMasa} thn</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Layanan 24 Jam</div>
          <div className="text-xl font-bold text-amber-700">{kpis.shift24} Orang</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Shift UGD & Bersalin</div>
        </div>
      </div>

      {/* Row 1 Charts: Status Kepegawaian & Proporsi Nakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Kepegawaian Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Komposisi Status Kepegawaian
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribusi PNS, PPPK, NON-PNS, dan Tenaga Alih Daya (PJLP)
            </p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} Orang (${((Number(val || 0) / kpis.total) * 100).toFixed(1)}%)`, 'Jumlah']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jenis Tenaga Proportion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Proporsi Jenis Tenaga SDMK
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Perbandingan tenaga medis/kesehatan dengan tenaga pendukung teknis
            </p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jenisTenagaPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {jenisTenagaPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} Orang (${((Number(val || 0) / kpis.total) * 100).toFixed(1)}%)`, 'Jumlah']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Kelompok Usia & Sebaran Fasilitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kelompok Usia & Gender */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Piramida Kelompok Usia & Gender
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Struktur usia produktif pegawai berdasarkan jenis kelamin
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usiaGenderData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  formatter={(val: any, name: any) => [`${val} Orang`, name === 'pria' ? 'Laki-Laki' : 'Perempuan']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend 
                  formatter={(value) => value === 'pria' ? 'Laki-Laki' : 'Perempuan'}
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="pria" name="pria" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wanita" name="wanita" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sebaran Unit Tugas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Sebaran Pegawai per Unit Tugas
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Alokasi tenaga kesehatan dan penunjang di tiap fasilitas
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  formatter={(val: any) => [`${val} Orang`, 'Jumlah']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="nakes" name="Tenaga Kesehatan" stackId="a" fill="#059669" />
                <Bar dataKey="penunjang" name="Tenaga Penunjang" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 Charts: Tingkat Pendidikan & Top Formasi Jabatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendidikan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Tingkat Pendidikan Pegawai
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Kualifikasi akademik formal staf Puskesmas
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendidikanData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  formatter={(val: any) => [`${val} Orang`, 'Jumlah']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Jabatan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Top Formasi Jabatan Terbanyak
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Jabatan fungsional dan pelaksana dengan populasi tertinggi
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topJabatanData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} Orang`, 'Jumlah']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
