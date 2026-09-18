import { Sheet, RowData } from '../types/sheet';
import { MASTER_SHEET_DATA } from '../data/masterSheetData';

const SPREADSHEET_ID = '1ykpLnIE8305uphJMvXOdPuwb8T_mkQsnw8GOmByLFko';
const GID = '1900197277';

function parseYearMonth(str: string): number {
  if (!str) return 0;
  const yearMatch = str.match(/(\d+)\s*Tahun/i);
  const monthMatch = str.match(/(\d+)\s*Bulan/i);
  const years = yearMatch ? parseInt(yearMatch[1], 10) : 0;
  const months = monthMatch ? parseInt(monthMatch[1], 10) : 0;
  return Number((years + months / 12).toFixed(1));
}

function parseCSV(text: string): string[][] {
  const arr: string[][] = [];
  let quote = false;
  let row: string[] = [''];
  let c = 0;
  for (let i = 0; i < text.length; i++) {
    const cc = text[i], nc = text[i + 1];
    if (cc === '"' && quote && nc === '"') { row[c] += '"'; i++; continue; }
    if (cc === '"') { quote = !quote; continue; }
    if (cc === ',' && !quote) { row.push(''); c++; continue; }
    if ((cc === '\r' || cc === '\n') && !quote) {
      if (cc === '\r' && nc === '\n') i++;
      arr.push(row);
      row = [''];
      c = 0;
      continue;
    }
    row[c] += cc;
  }
  if (row.length > 1 || row[0] !== '') arr.push(row);
  return arr;
}

export async function syncGoogleSheetData(): Promise<{ success: boolean; sheet?: Sheet; rowCount?: number; error?: string }> {
  // 1. Try server-side API first if running in fullstack environment
  try {
    const apiRes = await fetch('/api/sync-google-sheet', { cache: 'no-cache' });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.sheet) {
        return data;
      }
    }
  } catch (e) {
    // Expected on static hosting like Hostinger public_html
    console.log('Server API tidak tersedia, beralih ke sinkronisasi client-side...');
  }

  // 2. Client-side fallback: fetch CSV directly from Google Sheets
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;
    const response = await fetch(csvUrl, { mode: 'cors' });
    
    if (!response.ok) {
      throw new Error(`Google Sheets HTTP ${response.status}`);
    }

    const text = await response.text();
    const arr = parseCSV(text);
    const dataRows = arr.slice(2).filter(r => r[2] && r[2].trim() !== '');

    if (dataRows.length === 0) {
      throw new Error('Data sheet kosong');
    }

    const columns = [
      { id: 'no', name: 'No', type: 'number' as const, width: 65, visible: true, aggregation: 'count' as const },
      { id: 'nama_gelar', name: 'Nama Lengkap & Gelar', type: 'text' as const, width: 230, visible: true, aggregation: 'none' as const },
      { id: 'nip', name: 'NIP / ID Pegawai', type: 'text' as const, width: 175, visible: true, aggregation: 'none' as const },
      { id: 'tempat_tugas', name: 'Tempat / Unit Tugas', type: 'category' as const, width: 230, visible: true, aggregation: 'none' as const },
      { id: 'jabatan', name: 'Jabatan', type: 'text' as const, width: 200, visible: true, aggregation: 'none' as const },
      { id: 'status_kepegawaian', name: 'Status Pegawai', type: 'badge' as const, width: 140, visible: true, aggregation: 'none' as const },
      { id: 'jenis_tenaga', name: 'Jenis Tenaga', type: 'badge' as const, width: 150, visible: true, aggregation: 'none' as const },
      { id: 'gol', name: 'Golongan', type: 'text' as const, width: 130, visible: true, aggregation: 'none' as const },
      { id: 'jenis_kelamin', name: 'Gender', type: 'category' as const, width: 120, visible: true, aggregation: 'none' as const },
      { id: 'pendidikan', name: 'Pendidikan', type: 'category' as const, width: 130, visible: true, aggregation: 'none' as const },
      { id: 'masa_kerja', name: 'Masa Kerja', type: 'text' as const, width: 140, visible: true, aggregation: 'none' as const },
      { id: 'masa_kerja_tahun', name: 'Masa Kerja (Thn)', type: 'number' as const, width: 130, visible: true, aggregation: 'avg' as const },
      { id: 'usia', name: 'Usia', type: 'text' as const, width: 130, visible: true, aggregation: 'none' as const },
      { id: 'usia_tahun', name: 'Usia (Thn)', type: 'number' as const, width: 110, visible: true, aggregation: 'avg' as const },
      { id: 'kelompok_usia', name: 'Kelompok Usia', type: 'category' as const, width: 140, visible: true, aggregation: 'none' as const },
      { id: 'tanggal_pensiun', name: 'Tgl Pensiun', type: 'text' as const, width: 120, visible: true, aggregation: 'none' as const },
      { id: 'sisa_pensiun', name: 'Sisa Pensiun', type: 'text' as const, width: 140, visible: true, aggregation: 'none' as const },
      { id: 'sisa_pensiun_tahun', name: 'Sisa Pensiun (Thn)', type: 'number' as const, width: 130, visible: true, aggregation: 'avg' as const },
      { id: 'jam_kerja', name: 'Jam Kerja', type: 'category' as const, width: 170, visible: true, aggregation: 'none' as const },
      { id: 'kerja_tim', name: 'Kerja Tim / Shift', type: 'badge' as const, width: 130, visible: true, aggregation: 'none' as const },
      { id: 'status_str', name: 'Status STR', type: 'badge' as const, width: 130, visible: true, aggregation: 'none' as const },
      { id: 'status_sip', name: 'Status SIP', type: 'badge' as const, width: 130, visible: true, aggregation: 'none' as const },
      { id: 'provinsi', name: 'Provinsi', type: 'category' as const, width: 140, visible: true, aggregation: 'none' as const },
      { id: 'kab_kota', name: 'Kab/Kota Tinggal', type: 'category' as const, width: 160, visible: true, aggregation: 'none' as const },
      { id: 'alamat', name: 'Alamat Tinggal', type: 'text' as const, width: 250, visible: true, aggregation: 'none' as const }
    ];

    const rows: RowData[] = dataRows.map((cols, idx) => {
      const mkTahun = parseYearMonth(cols[23] || '');
      const usiaTahun = parseYearMonth(cols[24] || '');
      const spTahun = parseYearMonth(cols[26] || '');

      let kelompokUsia = '50 Tahun ke atas';
      if (usiaTahun > 0 && usiaTahun < 30) kelompokUsia = '20 - 29 Tahun';
      else if (usiaTahun >= 30 && usiaTahun < 40) kelompokUsia = '30 - 39 Tahun';
      else if (usiaTahun >= 40 && usiaTahun < 50) kelompokUsia = '40 - 49 Tahun';

      return {
        _id: `staff_gs_${idx + 1}`,
        no: idx + 1,
        nama: cols[2] || '',
        nama_gelar: cols[2] || '',
        nip: cols[3] || '',
        nrk: cols[4] || '',
        tempat_tugas: cols[5] || 'Puskesmas Kepulauan Seribu Selatan',
        jabatan: cols[6] || '',
        status_kepegawaian: cols[11] || 'NON PNS',
        jenis_tenaga: cols[12] || 'Tenaga Penunjang',
        gol: cols[13] || '',
        jenis_kelamin: cols[18] || '',
        pendidikan: cols[21] || '',
        nama_sekolah: cols[22] || '',
        masa_kerja: cols[23] || '',
        masa_kerja_tahun: mkTahun,
        usia: cols[24] || '',
        usia_tahun: usiaTahun,
        kelompok_usia: kelompokUsia,
        tanggal_pensiun: cols[25] || '',
        sisa_pensiun: cols[26] || '',
        sisa_pensiun_tahun: spTahun,
        jam_kerja: cols[27] || '',
        kerja_tim: cols[28] || 'Reguler',
        status_bekerja: cols[30] || 'AKTIF',
        status_str: cols[32] || 'TIDAK PERLU STR',
        no_str: cols[33] || '',
        status_sip: cols[34] || 'TIDAK PERLU SIP',
        no_sip: cols[35] || '',
        provinsi: cols[36] || 'DKI JAKARTA',
        kab_kota: cols[37] || 'KAB. ADM. KEPULAUAN SERIBU',
        kecamatan: cols[38] || 'KEPULAUAN SERIBU SELATAN',
        kelurahan: cols[39] || '',
        alamat: cols[40] || ''
      };
    });

    const sheet: Sheet = {
      id: 'sheet-master-puskesmas',
      name: 'Data Master SDMK Puskesmas',
      description: `Data Master Terpadu Kepegawaian & SDMK Puskesmas Kecamatan & Pustu Kepulauan Seribu Selatan (${rows.length} Staf).`,
      icon: 'FileSpreadsheet',
      updatedAt: new Date().toISOString(),
      columns,
      rows,
      primaryMetricId: 'usia_tahun',
      primaryDateId: 'tanggal_pensiun',
      primaryCategoryId: 'tempat_tugas'
    };

    return { success: true, sheet, rowCount: rows.length };
  } catch (err: any) {
    // 3. Ultimate fallback: use master data
    console.warn('Direct fetch Google Sheets terhalang CORS, menggunakan data master lokal:', err);
    return {
      success: true,
      sheet: MASTER_SHEET_DATA,
      rowCount: MASTER_SHEET_DATA.rows.length
    };
  }
}
