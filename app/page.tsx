"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus, Trash2, Printer, Eye, Edit3, Image as ImageIcon,
  BookOpen, Church, Music, Database, Upload, Save, Search, X
} from 'lucide-react';

// --- DATA DUMMY AWAL ---
const initialData = {
  id: null as string | null,
  greetingTextId: null as string | null,

  date: new Date().toISOString().split('T')[0],
  theme: "TUHAN SEDIAKAN YANG KITA PERLU, BUKAN KEINGINAN KITA",
  bibleRef: "Filipi 4 : 19",
  bibleContent: "Allahku akan memenuhi segala keperluanmu menurut kekayaan dan kemuliaan-Nya dalam Kristus Yesus.",
  headerBannerLeft: "",
  headerBannerRight: "",
  imgFooter: "",
  imgHeader: "",
  churchName: "Gereja Pentakosta",
  churchAddress: "Jl. Pedongkelan Baru No. 215,A RT/RW 10/16, Pasar Timbul, Kapuk, Cengkareng, Jakarta Barat",
  churchContact: "0821-4562-9631 (Gembala Sidang : Pdt. Herliani Pakpahan, S.Th)",
  greetingText: "SELAMAT HARI MINGGU, SELAMAT BERIBADAH. TUHAN YESUS MEMBERKATI.",
  announcements: [
    { id: 1, text: "Ibadah Jumat Agung, tgl 3 April 2026 jam 09:30 WIB" },
    { id: 2, text: "Ibadah sekolah minggu, Sabtu, 4 April 2026, Jam 09.00 WIB" },
    { id: 3, text: "Ibadah Raya, Minggu Paskah tgl 5 April 2026, jam 09.30 WIB" },
  ],
  // Diubah menjadi satu daftar lagu sederhana (Auto-pagination akan menanganinya)
  songs: [
    { id: 1, lyrics: "Satukanlah hati kami, tuk memuji dan menyembah. Oh Yesus Tuhan dan Rajaku. Eratkanlah tali kasih diantara kami semua, oh Yesus Tuhan & Rajaku\nReff : Bergandengan tangan dalam satu hati, bergandengan tangan dalam satu iman. Saling mengasihi diantara kami Keluarga kerajaan Allah" },
    { id: 2, lyrics: "Terima kasih Tuhan untuk kasih setiaMu, yang kualami dalam hidupku\nTrima kasih Yesus untuk kebaikanMu Sepanjang hidupku\nReff : Trima kasih Yesusku, buat anugrah yang Kau bri. Sbab hari ini Tuhan adakan syukur bagiMu" }
  ]
};

const initialSongDatabase = [
  { id: 'db1', title: "Satukanlah hati kami", lyrics: "Satukanlah hati kami, tuk memuji dan menyembah. Oh Yesus Tuhan dan Rajaku. Eratkanlah tali kasih diantara kami semua, oh Yesus Tuhan & Rajaku\nReff : Bergandengan tangan dalam satu hati, bergandengan tangan dalam satu iman. Saling mengasihi diantara kami Keluarga kerajaan Allah" },
  { id: 'db2', title: "Terima kasih Tuhan", lyrics: "Terima kasih Tuhan untuk kasih setiaMu, yang kualami dalam hidupku\nTrima kasih Yesus untuk kebaikanMu Sepanjang hidupku\nReff : Trima kasih Yesusku, buat anugrah yang Kau bri. Sbab hari ini Tuhan adakan syukur bagiMu" },
  { id: 'db3', title: "Sungguh besar setiaMu", lyrics: "Sungguh besar setiaMu, nyata di sepanjang hidupku. DarahMu telah layakkan kehidupanku. Tiada kata yang bisa, lukiskan indahnya Kau Tuhan\nBagi-Mu s'gala pujian dan kemuliaan\nReff : Kutinggikan Engkau Tuhan Melebihi segalanya\nLebih dalam kumenyembah Dalam Roh dan Keb'naran selamanya" }
];

// --- CSS INJEKSI UNTUK GARANSI PRINT A4 ---
const printStyles = `
  @media print {
    @page {
      size: A4 landscape !important;
      margin: 0 !important;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    /* Sembunyikan semua elemen layar */
    nav, main, .no-print {
      display: none !important;
    }
    /* Tampilkan hanya area cetak */
    .print-area {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
    }
    .print-container {
      width: 297mm !important;
      height: 210mm !important;
      overflow: hidden !important;
      break-after: page !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
      margin: 0 !important;
    }
    .print-container:last-child {
      break-after: auto !important;
      page-break-after: auto !important;
    }
    ::-webkit-scrollbar {
      display: none;
    }
  }
`;

export default function App() {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('form');
  const [songDb, setSongDb] = useState(initialSongDatabase);

  // State untuk pencarian dropdown form lagu
  const [songSearchTerm, setSongSearchTerm] = useState('');
  const [dbPickerOpen, setDbPickerOpen] = useState(false);

  // State untuk halaman Database Lagu utama
  const [searchTermDbPage, setSearchTermDbPage] = useState('');
  const [editingDbId, setEditingDbId] = useState<string | null>(null);
  const [editDbForm, setEditDbForm] = useState({ title: '', lyrics: '' });
  const [dbCurrentPage, setDbCurrentPage] = useState(1);
  const dbItemsPerPage = 10;

  // Reset pagination saat search berubah
  useEffect(() => {
    setDbCurrentPage(1);
  }, [searchTermDbPage]);


  useEffect(() => {
    async function fetchSupabaseData() {
      setIsLoading(true);
      try {
        // Fetch song library
        const { data: slData } = await supabase.from('song_library').select('*');
        if (slData) {
          setSongDb(slData.map(s => ({ id: s.id, title: s.title, lyrics: s.lyrics })));
        }

        // Fetch latest bulletin
        const { data: bData } = await supabase.from('bulletins').select('*').order('created_at', { ascending: false }).limit(1);
        if (bData && bData.length > 0) {
          const bulletin = bData[0];

          // Fetch announcements
          const { data: aData } = await supabase.from('announcements').select('*').eq('bulletin_id', bulletin.id).order('sort_order', { ascending: true });

          // Fetch songs mapping (we just use the lyrics here for layout)
          const { data: sData } = await supabase.from('songs').select('*').eq('bulletin_id', bulletin.id).order('sort_order', { ascending: true });

          // See if we have a default greeting text mapped to an announcement or use a static one
          let greeting = "SELAMAT HARI MINGGU, SELAMAT BERIBADAH. TUHAN YESUS MEMBERKATI.";

          setData({
            ...initialData,
            id: bulletin.id,
            date: bulletin.service_date,
            theme: bulletin.theme,
            bibleRef: bulletin.bible_ref,
            bibleContent: bulletin.bible_content,
            imgFooter: bulletin.footer_image_url || "",
            headerBannerLeft: bulletin.header_image_url || "",
            headerBannerRight: bulletin.header_banner_url || "",
            imgHeader: bulletin.header_image_url_2 || "",
            greetingText: greeting,
            announcements: aData ? aData.map(a => ({ id: a.id, text: a.content })) : [],
            songs: sData ? sData.map((s, idx) => ({ id: s.id || Date.now() + idx, lyrics: s.lyrics })) : []
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSupabaseData();
  }, []);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      let bulletinId = data.id;

      const bulletinPayload = {
        service_date: data.date,
        theme: data.theme,
        bible_ref: data.bibleRef,
        bible_content: data.bibleContent,
        footer_image_url: data.imgFooter,
        header_image_url: data.headerBannerLeft,
        header_banner_url: data.headerBannerRight,
        header_image_url_2: data.imgHeader
      };

      if (bulletinId) {
        const { error } = await supabase.from('bulletins').update(bulletinPayload).eq('id', bulletinId);
        if (error) throw error;
      } else {
        const { data: newB, error } = await supabase.from('bulletins').insert([bulletinPayload]).select();
        if (error) throw error;
        if (newB && newB.length > 0) bulletinId = newB[0].id;
      }

      if (bulletinId) {
        // Delete old announcements and songs for this bulletin so we can replace them
        await supabase.from('announcements').delete().eq('bulletin_id', bulletinId);
        await supabase.from('songs').delete().eq('bulletin_id', bulletinId);

        // Insert Announcements
        if (data.announcements.length > 0) {
          const annPayload = data.announcements.map((a, i) => ({
            bulletin_id: bulletinId,
            content: a.text,
            sort_order: i
          }));
          await supabase.from('announcements').insert(annPayload);
        }

        // Insert Songs
        if (data.songs.length > 0) {
          const songPayload = data.songs.map((s, i) => ({
            bulletin_id: bulletinId,
            title: "Lagu " + (i + 1), // Assuming we don't have titles in the warta song array
            lyrics: s.lyrics,
            sort_order: i
          }));
          await supabase.from('songs').insert(songPayload);
        }

        setData(prev => ({ ...prev, id: bulletinId }));
        alert("Draft berhasil disimpan ke database!");
      }

    } catch (err) {
      console.error("Save error: ", err);
      alert("Gagal menyimpan data ke database.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!(window as any).XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePrint = () => {
    setTimeout(() => { window.print(); }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (result) {
        setData(prev => ({ ...prev, [field]: result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // --- MANAJEMEN PENGUMUMAN ---
  const addAnnouncement = () => setData({ ...data, announcements: [...data.announcements, { id: Date.now(), text: "" }] });
  const updateAnnouncement = (id: number, text: string) => setData({ ...data, announcements: data.announcements.map(a => a.id === id ? { ...a, text } : a) });
  const removeAnnouncement = (id: number) => setData({ ...data, announcements: data.announcements.filter(a => a.id !== id) });

  // --- MANAJEMEN LAGU WARTA ---
  const addManualSong = () => {
    setData({ ...data, songs: [...data.songs, { id: Date.now(), lyrics: "" }] });
  };

  const addSongFromDb = (dbSongId: string) => {
    const song = songDb.find(s => s.id === dbSongId);
    if (song) {
      setData({ ...data, songs: [...data.songs, { id: Date.now(), lyrics: song.lyrics }] });
      setDbPickerOpen(false);
      setSongSearchTerm('');
    }
  };

  const updateSong = (songId: number, value: string) => {
    setData({ ...data, songs: data.songs.map(s => s.id === songId ? { ...s, lyrics: value } : s) });
  };

  const removeSong = (songId: number) => {
    setData({ ...data, songs: data.songs.filter(s => s.id !== songId) });
  };

  // --- MANAJEMEN DATABASE LAGU (EDIT, HAPUS, IMPORT) ---
  const startEditDbSong = (song: any) => {
    setEditingDbId(song.id);
    setEditDbForm({ title: song.title, lyrics: song.lyrics });
  };


  const saveEditDbSong = async () => {
    if (!editingDbId) return;
    // Update locally
    setSongDb(songDb.map(s => s.id === editingDbId ? { ...s, ...editDbForm } : s));

    // Update to DB
    // Check if it's a temp ID
    if (!editingDbId.toString().startsWith('db_')) {
      await supabase.from('song_library').update({ title: editDbForm.title, lyrics: editDbForm.lyrics }).eq('id', editingDbId);
    }
    setEditingDbId(null);
  };


  const cancelEditDbSong = () => {
    setEditingDbId(null);
  };


  const removeDbSong = async (id: string) => {
    const confirm = window.confirm("Hapus lagu ini dari database?");
    if (!confirm) return;

    setSongDb(songDb.filter(s => s.id !== id));
    if (!id.toString().startsWith('db_')) {
      await supabase.from('song_library').delete().eq('id', id);
    }
  };


  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        let newSongs: Array<{ id: string, title: string, lyrics: string }> = [];

        if (extension === 'txt') {
          const songBlocks = content.split('----');
          songBlocks.forEach(block => {
            const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length >= 2) {
              const title = lines[0];
              const lyrics = lines.slice(1).join('\n');
              newSongs.push({ id: `db_${Date.now()}_${Math.random()}`, title, lyrics });
            }
          });
        } else if (extension === 'xlsx' || extension === 'csv') {
          const xlsxLib = (window as any).XLSX;
          if (!xlsxLib) return alert("Library Excel belum termuat, mohon tunggu beberapa detik lalu coba lagi.");

          const workbook = xlsxLib.read(content, { type: 'binary' });
          let targetSheetName = workbook.SheetNames.find((name: string) => name.toLowerCase() === 'lagu');

          if (!targetSheetName && extension === 'csv' && workbook.SheetNames.length === 1) {
            targetSheetName = workbook.SheetNames[0];
          }

          if (!targetSheetName || !workbook.Sheets[targetSheetName]) {
            return alert("File ditolak: Sheet dengan nama 'lagu' tidak ditemukan dalam dokumen.");
          }

          const sheet = workbook.Sheets[targetSheetName];
          const json = xlsxLib.utils.sheet_to_json(sheet);

          json.forEach((row: any) => {
            const keys = Object.keys(row);
            const judulKey = keys.find(k => k.toLowerCase() === 'judul');
            const lirikKey = keys.find(k => k.toLowerCase() === 'lirik');

            if (judulKey && lirikKey && row[judulKey] && row[lirikKey]) {
              newSongs.push({
                id: `db_${Date.now()}_${Math.random()}`,
                title: row[judulKey].toString().trim(),
                lyrics: row[lirikKey].toString().trim()
              });
            }
          });
        }


        if (newSongs.length > 0) {
          // Push to Supabase immediately
          const supabasePayload = newSongs.map(s => ({ title: s.title, lyrics: s.lyrics }));
          supabase.from('song_library').insert(supabasePayload).select().then(({ data, error }) => {
            if (data) {
              // Update local state with real DB IDs
              setSongDb(prev => [...prev, ...data]);
              alert(data.length + " lagu berhasil diimpor & disimpan ke database!");
            } else {
              setSongDb(prev => [...prev, ...newSongs]); // Fallback to temp IDs if fail
            }
          });
        } else {

          alert("Gagal membaca data. Pastikan format TXT menggunakan ---- atau file Excel/CSV memiliki sheet 'lagu' serta kolom 'judul' & 'lirik'.");
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem saat memproses file.");
        console.error(err);
      }
    };

    if (extension === 'xlsx' || extension === 'csv') {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  // --- ENGINE CHUNKING LIRIK (PEMBAGI KOLOM OTOMATIS) ---
  const getChunkedColumns = () => {
    const MAX_LINES = 42; // Estimasi maksimal baris per kolom A4 (font-size 13px)
    const CHARS_PER_LINE = 45; // Estimasi karakter per baris sebelum dibungkus (wrap)

    const columns: Array<Array<{ index: number, lyrics: string, isContinuation: boolean }>> = [];
    let currentCol: Array<any> = [];
    let currentLineCount = 0;

    data.songs.forEach((song, sIdx) => {
      const lines = (song.lyrics || "").split('\n');
      let currentSongPart = { index: sIdx + 1, lyrics: [] as string[], isContinuation: false };
      let isFirstLine = true;

      lines.forEach((line) => {
        const wrappedLines = Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));

        // Karena CSS punya "space-y-3" yang menambah margin atas tiap item lagu baru,
        // Kita berikan penalti 1 baris supaya perhitungannya akurat di layar & mesin cetak.
        let gapPenalty = 0;
        if (isFirstLine && currentCol.length > 0) {
          gapPenalty = 1;
        }

        // Jika melebihi batas bawah kotak
        if (currentLineCount + wrappedLines + gapPenalty > MAX_LINES) {
          if (currentSongPart.lyrics.length > 0) {
            currentCol.push({ ...currentSongPart, lyrics: currentSongPart.lyrics.join('\n') });
          }
          if (currentCol.length > 0) {
            columns.push(currentCol);
          }
          currentCol = [];
          currentLineCount = 0;
          // Buat part lanjutan untuk lagu yang sama di kolom baru
          currentSongPart = { index: sIdx + 1, lyrics: [] as string[], isContinuation: true };
          gapPenalty = 0; // Kolom baru tidak ada lagu sebelumnya, jadi margin atas 0
        }

        currentSongPart.lyrics.push(line);
        currentLineCount += wrappedLines + gapPenalty;
        isFirstLine = false;
      });

      if (currentSongPart.lyrics.length > 0) {
        currentCol.push({ ...currentSongPart, lyrics: currentSongPart.lyrics.join('\n') });
      }
    });

    if (currentCol.length > 0) columns.push(currentCol);
    if (columns.length === 0) columns.push([]); // minimal 1 array kosong agar kolom 3 terender

    return columns;
  };

  // --- RENDER PRINT TEMPLATE ---
  const renderPrintPages = () => {
    const columns = getChunkedColumns();
    const pages = [];
    const formattedDate = new Date(data.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // HALAMAN 1 (KOLOM 1, KOLOM 2, KOLOM 3)
    pages.push(
      <div key="page-1" className="preview-container print-container bg-white text-black p-6 text-sm flex gap-4 relative w-[297mm] h-[210mm] max-h-[210mm] overflow-hidden mx-auto print:m-0 print:shadow-none box-border">

        {/* KOLOM 1 */}
        <div className="flex-1 flex flex-col border-[3px] border-black p-4 h-full relative overflow-hidden">
          <div className="text-left font-bold text-black mb-3">
            {formattedDate}
          </div>

          {/* Banner kiri & kanan berdampingan */}
          {(data.headerBannerLeft || data.headerBannerRight) ? (
            <div className="mb-4 flex justify-between items-center h-28 gap-2">
              {data.headerBannerLeft ? (
                <img src={data.headerBannerLeft} alt="Banner Kiri" className="h-full max-w-[48%] object-contain" />
              ) : (
                <div className="h-full w-[48%] border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-300 text-xs">[Kiri]</div>
              )}
              {data.headerBannerRight ? (
                <img src={data.headerBannerRight} alt="Banner Kanan" className="h-full max-w-[48%] object-contain" />
              ) : (
                <div className="h-full w-[48%] border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-300 text-xs">[Kanan]</div>
              )}
            </div>
          ) : (
            <div className="mb-4 h-28 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs rounded">
              [Tempat Logo / Banner Kiri &amp; Kanan]
            </div>
          )}

          <div className="text-center mb-5">
            <h2 className="text-xl font-extrabold uppercase text-black tracking-wide leading-tight">{data.theme}</h2>
          </div>

          <div className="mb-auto">
            <p className="font-bold text-lg mb-1 text-black">{data.bibleRef}</p>
            <p className="leading-relaxed text-[15px] text-gray-900">"{data.bibleContent}"</p>
          </div>

          {data.imgFooter && (
            <div className="mt-4 h-64 w-full flex-shrink-0 flex items-center justify-center">
              <img src={data.imgFooter} alt="Footer" className="h-full w-full object-cover border-[3px] border-black" />
            </div>
          )}
        </div>

        {/* KOLOM 2 */}
        <div className="flex-1 flex flex-col h-full gap-2">
          {data.imgHeader ? (
            <div className="w-full flex-shrink-0 border-[3px] border-black flex items-center justify-center" style={{ height: '20rem' }}>
              <img src={data.imgHeader} alt="Header" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="w-full border-[3px] border-black flex items-center justify-center text-gray-400 text-xs" style={{ height: '20rem' }}>
              [Header Happy Sunday]
            </div>
          )}

          <div className="border-[3px] border-black p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            <h3 className="font-bold text-base mb-3 uppercase text-center underline underline-offset-4 tracking-wide">Pengumuman :</h3>
            <ul className="list-decimal pl-5 space-y-2 mb-3">
              {data.announcements.map((ann) => (
                <li key={ann.id} className="leading-snug text-justify text-[15px] text-black">{ann.text}</li>
              ))}
            </ul>
            {data.greetingText && (
              <div className="mt-auto pt-3 text-center font-bold uppercase text-black text-[14px] leading-snug">
                {data.greetingText}
              </div>
            )}
          </div>

          <div className="border-[3px] border-black p-3 text-center flex-shrink-0">
            <p className="font-bold text-lg uppercase text-black">Gereja Pentakosta</p>
            <p className="text-[13px] text-black mt-1 italic leading-tight">{data.churchAddress}</p>
            <p className="text-[13px] text-black mt-1">Phone : {data.churchContact}</p>
          </div>
        </div>

        {/* KOLOM 3 (Lagu ke-1) */}
        <div className="flex-1 flex flex-col border-[3px] border-black p-4 h-full overflow-hidden">
          <h3 className="font-bold text-base mb-4 text-center uppercase tracking-wide underline underline-offset-4">
            PUJI-PUJIAN :
          </h3>
          <div className="space-y-3">
            {columns[0]?.map((song, index) => (
              <div key={index} className="flex text-[13px] text-black leading-tight">
                {/* Jika lanjutan dari lirik sebelumnya, angka tidak ditampilkan namun lebarnya dipertahankan (indentasi konsisten) */}
                {!song.isContinuation ? (
                  <span className="font-bold shrink-0 w-6 mr-1">{song.index}.</span>
                ) : (
                  <span className="shrink-0 w-6"></span>
                )}
                <div className="whitespace-pre-wrap flex-1 text-justify">{song.lyrics}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    // HALAMAN 2, 3 dst (Otomatis mengisi 3 kolom penuh sesuai panjang sisa lagu)
    for (let i = 1; i < columns.length; i += 3) {
      const col1 = columns[i];
      const col2 = columns[i + 1];
      const col3 = columns[i + 2];

      pages.push(
        <div key={`page-${i + 1}`} className="preview-container print-container bg-white text-black p-6 text-sm flex gap-4 relative mt-8 print:mt-0 w-[297mm] h-[210mm] max-h-[210mm] overflow-hidden mx-auto print:shadow-none box-border">
          {[col1, col2, col3].map((col, idx) => (
            <div key={idx} className="flex-1 flex flex-col h-full border-[3px] border-black p-4 overflow-hidden">
              {col && (
                <>
                  <h3 className="font-bold text-base mb-4 text-center uppercase tracking-wide underline underline-offset-4">
                    PUJI-PUJIAN :
                  </h3>
                  <div className="space-y-3">
                    {col.map((song, j) => (
                      <div key={j} className="flex text-[13px] text-black leading-tight">
                        {!song.isContinuation ? (
                          <span className="font-bold shrink-0 w-6 mr-1">{song.index}.</span>
                        ) : (
                          <span className="shrink-0 w-6"></span>
                        )}
                        <div className="whitespace-pre-wrap flex-1 text-justify">{song.lyrics}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <style>{printStyles}</style>

      <nav className="bg-blue-900 text-white p-4 shadow-md flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 no-print sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <BookOpen size={24} />
          <h1 className="text-xl font-bold">Warta Jemaat Pro</h1>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-2">
          <button onClick={() => setViewMode('form')} className={`flex items-center gap-2 px-3 py-2 rounded-md transition text-sm ${viewMode === 'form' ? 'bg-blue-700 font-bold' : 'hover:bg-blue-800'}`}>
            <Edit3 size={16} /> Editor Warta
          </button>
          <button onClick={() => setViewMode('database')} className={`flex items-center gap-2 px-3 py-2 rounded-md transition text-sm ${viewMode === 'database' ? 'bg-blue-700 font-bold' : 'hover:bg-blue-800'}`}>
            <Database size={16} /> Database Lagu
          </button>
          <button onClick={() => setViewMode('preview')} className={`flex items-center gap-2 px-3 py-2 rounded-md transition text-sm ${viewMode === 'preview' ? 'bg-blue-700 font-bold' : 'hover:bg-blue-800'}`}>
            <Eye size={16} /> Preview Cetak
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition font-medium text-sm md:ml-4 shadow-sm w-full md:w-auto justify-center">
            <Printer size={16} /> Cetak / PDF
          </button>
        </div>
      </nav>

      <main className="p-6">

        {viewMode === 'form' && (
          <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible no-print">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Editor Warta & Liturgi</h2>
                <p className="text-gray-500 text-sm mt-1">Isi data identitas dan masukkan urutan lagu. Sistem auto-format akan menyesuaikan pemecahan halamannya.</p>
              </div>
              <button onClick={handleSaveDraft} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap">
                <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-5 space-y-6">
                <div className="bg-white border rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Identitas (Hal 1)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kebaktian</label>
                      <input type="date" name="date" value={data.date} onChange={handleInputChange} className="w-full p-2 border rounded-md text-sm outline-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tema Pelayanan</label>
                      <input type="text" name="theme" value={data.theme} onChange={handleInputChange} className="w-full p-2 border rounded-md text-sm outline-blue-500" placeholder="Contoh: Kasih yang Memulihkan" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referensi</label>
                        <input type="text" name="bibleRef" value={data.bibleRef} onChange={handleInputChange} className="w-full p-2 border rounded-md text-sm outline-blue-500" placeholder="Filipi 4:19" />
                      </div>
                      <div className="w-full sm:w-2/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Isi Ayat</label>
                        <textarea name="bibleContent" value={data.bibleContent} onChange={handleInputChange} rows={2} className="w-full p-2 border rounded-md text-sm outline-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Visual & Media (Upload)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><ImageIcon size={14} className="inline mr-1" /> Banner / Logo Kiri (Kolom 1 Atas)</label>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'headerBannerLeft')} className="w-full p-2 border rounded-md text-sm outline-blue-500" />
                      {data.headerBannerLeft && <img src={data.headerBannerLeft} alt="Banner Kiri" className="mt-2 h-16 object-contain rounded" />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><ImageIcon size={14} className="inline mr-1" /> Banner / Logo Kanan (Kolom 1 Atas)</label>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'headerBannerRight')} className="w-full p-2 border rounded-md text-sm outline-blue-500" />
                      {data.headerBannerRight && <img src={data.headerBannerRight} alt="Banner Kanan" className="mt-2 h-16 object-contain rounded" />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><ImageIcon size={14} className="inline mr-1" /> Gambar Header (Kolom 2)</label>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imgHeader')} className="w-full p-2 border rounded-md text-sm outline-blue-500" />
                      {data.imgHeader && <img src={data.imgHeader} alt="Header" className="mt-2 h-16 object-contain rounded" />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><ImageIcon size={14} className="inline mr-1" /> Gambar Footer (Kolom 1 Bawah)</label>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imgFooter')} className="w-full p-2 border rounded-md text-sm outline-blue-500" />
                      {data.imgFooter && <img src={data.imgFooter} alt="Footer" className="mt-2 h-16 object-contain rounded" />}
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-5 shadow-sm">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Pengumuman & Ucapan</h3>
                    <button onClick={addAnnouncement} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border flex items-center gap-1">
                      <Plus size={12} /> Tambah Pengumuman
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {data.announcements.map((ann, idx) => (
                      <div key={ann.id} className="flex gap-2 items-start">
                        <span className="text-gray-400 font-bold mt-2 text-xs">{idx + 1}.</span>
                        <textarea
                          value={ann.text} onChange={(e) => updateAnnouncement(ann.id, e.target.value)}
                          className="flex-1 p-2 border rounded-md text-sm outline-blue-500" rows={2} placeholder="Isi pengumuman..."
                        />
                        <button onClick={() => removeAnnouncement(ann.id)} className="text-red-500 hover:text-red-700 mt-2 p-1"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-dashed">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ucapan Penutup (Bold, Uppercase)</label>
                    <input
                      type="text"
                      name="greetingText"
                      value={data.greetingText}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md text-sm outline-blue-500 font-bold uppercase"
                      placeholder="SELAMAT HARI MINGGU..."
                    />
                  </div>
                </div>
              </div>

              <div className="xl:col-span-7 space-y-6 relative">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center"><Music size={20} className="mr-2 text-blue-600" /> Daftar Lagu Warta</h3>
                    <p className="text-sm text-gray-500">Teks lagu akan otomatis dibungkus dan dilanjutkan ke kolom berikutnya jika ruang penuh.</p>
                  </div>
                </div>

                <div className="bg-white border rounded-xl shadow-sm overflow-visible p-5">
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-5 border border-blue-200">
                    <strong>Penting:</strong> Cukup kumpulkan semua lagu dalam satu daftar di bawah ini. Aplikasi akan mengurus tata letak ke dalam kolom cetak secara otomatis (Auto-Pagination).
                  </div>

                  <div className="space-y-4">
                    {data.songs.map((song, idx) => (
                      <div key={song.id} className="bg-gray-50 p-3 rounded-md border flex gap-3 relative group">
                        <span className="text-gray-500 font-bold mt-2 w-4 text-right text-xs">{idx + 1}.</span>
                        <textarea
                          value={song.lyrics}
                          onChange={(e) => updateSong(song.id, e.target.value)}
                          className="w-full p-3 border rounded-md text-sm bg-white outline-blue-500 leading-snug"
                          rows={4}
                          placeholder="Masukkan lirik lagu di sini..."
                        />
                        <button onClick={() => removeSong(song.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition absolute top-3 right-3">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* TOMBOL PENCARIAN & TAMBAH MANUAL */}
                  <div className="flex gap-2 mt-6 pt-6 border-t border-dashed relative">
                    <button onClick={addManualSong} className="w-1/3 py-2.5 bg-gray-50 hover:bg-gray-100 border text-gray-700 rounded-md text-sm font-medium flex justify-center items-center gap-2">
                      <Plus size={16} /> Ketik Manual
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Cari & pilih lagu (Otomatis ambil liriknya saja)..."
                        value={songSearchTerm}
                        onFocus={() => setDbPickerOpen(true)}
                        onChange={(e) => {
                          setSongSearchTerm(e.target.value);
                          setDbPickerOpen(true);
                        }}
                        className="w-full py-2.5 px-3 pr-8 bg-blue-50 border border-blue-200 focus:border-blue-500 text-blue-900 rounded-md text-sm outline-none transition font-medium"
                      />
                      <Search size={16} className="absolute right-3 top-3 text-blue-400 pointer-events-none" />

                      {dbPickerOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-y-auto left-0 top-full">
                          <div className="sticky top-0 bg-gray-100 p-3 border-b flex justify-between items-center text-xs font-bold text-gray-700">
                            <span>Hasil Pencarian Database ({songDb.length} lagu total)</span>
                            <button onClick={() => setDbPickerOpen(false)} className="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">Tutup</button>
                          </div>
                          {songDb.filter(s => {
                            const q = songSearchTerm.toLowerCase();
                            return s.title.toLowerCase().includes(q) || s.lyrics.toLowerCase().includes(q);
                          }).map(dbS => (
                            <div
                              key={dbS.id}
                              onClick={() => addSongFromDb(dbS.id)}
                              className="p-3 border-b hover:bg-blue-50 cursor-pointer transition flex flex-col gap-1"
                            >
                              <span className="font-bold text-sm text-gray-800">{dbS.title}</span>
                              <span className="text-xs text-gray-500 line-clamp-2">{dbS.lyrics}</span>
                            </div>
                          ))}
                          {songDb.filter(s => {
                            const q = songSearchTerm.toLowerCase();
                            return s.title.toLowerCase().includes(q) || s.lyrics.toLowerCase().includes(q);
                          }).length === 0 && (
                              <div className="p-6 text-sm text-center text-gray-500 italic">Lagu tidak ditemukan.</div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'database' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Database size={24} /> Database Lagu Jemaat</h2>
                <p className="text-gray-500 text-sm mt-1">Kelola perbendaharaan lagu. Gunakan format CSV, TXT, atau XLSX untuk import massal.</p>
              </div>

              <div className="relative w-full md:w-auto">
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  onChange={handleBulkImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Import File"
                />
                <button className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2 pointer-events-none">
                  <Upload size={16} /> Bulk Import Data
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3 sm:gap-0">
                <div className="relative w-full sm:w-1/2 md:w-1/3">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari judul/lirik di database utama..."
                    value={searchTermDbPage}
                    onChange={(e) => setSearchTermDbPage(e.target.value)}
                    className="w-full pl-9 p-2 border rounded-md text-sm outline-blue-500"
                  />
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-end">
                  Total: <span className="font-bold text-gray-800 ml-1">{songDb.length} Lagu</span>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-sm min-w-[700px]">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3 w-1/4">Judul Lagu</th>
                      <th className="p-3">Data Lirik</th>
                      <th className="p-3 w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(() => {
                      const filteredDb = songDb.filter(s =>
                        s.title.toLowerCase().includes(searchTermDbPage.toLowerCase()) ||
                        s.lyrics.toLowerCase().includes(searchTermDbPage.toLowerCase())
                      );
                      const indexOfLastItem = dbCurrentPage * dbItemsPerPage;
                      const indexOfFirstItem = indexOfLastItem - dbItemsPerPage;
                      const currentItems = filteredDb.slice(indexOfFirstItem, indexOfLastItem);

                      return currentItems.map((song) => (
                        // Beralih ke form edit jika sedang di mode edit
                        editingDbId === song.id ? (
                          <tr key={song.id} className="bg-blue-50">
                            <td className="p-3 align-top">
                              <input
                                type="text"
                                value={editDbForm.title}
                                onChange={(e) => setEditDbForm({ ...editDbForm, title: e.target.value })}
                                className="w-full p-2 border rounded text-sm font-bold outline-blue-500 bg-white"
                              />
                            </td>
                            <td className="p-3 align-top">
                              <textarea
                                value={editDbForm.lyrics}
                                onChange={(e) => setEditDbForm({ ...editDbForm, lyrics: e.target.value })}
                                className="w-full p-2 border rounded text-sm outline-blue-500 bg-white"
                                rows={4}
                              />
                            </td>
                            <td className="p-3 align-top flex justify-center gap-2">
                              <button onClick={saveEditDbSong} title="Simpan" className="text-green-600 hover:text-white hover:bg-green-600 p-2 bg-green-100 rounded transition"><Save size={16} /></button>
                              <button onClick={cancelEditDbSong} title="Batal" className="text-gray-500 hover:text-white hover:bg-gray-500 p-2 bg-gray-200 rounded transition"><X size={16} /></button>
                            </td>
                          </tr>
                        ) : (
                          <tr key={song.id} className="hover:bg-gray-50">
                            <td className="p-3 font-bold text-gray-800 align-top">{song.title}</td>
                            <td className="p-3 text-gray-600 whitespace-pre-wrap leading-snug text-xs align-top">{song.lyrics}</td>
                            <td className="p-3 align-top flex justify-center gap-2">
                              <button onClick={() => startEditDbSong(song)} className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 hover:bg-blue-100 rounded transition"><Edit3 size={16} /></button>
                              <button onClick={() => removeDbSong(song.id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded transition"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        )
                      ));
                    })()}
                    {songDb.filter(s =>
                      s.title.toLowerCase().includes(searchTermDbPage.toLowerCase()) ||
                      s.lyrics.toLowerCase().includes(searchTermDbPage.toLowerCase())
                    ).length === 0 && (
                        <tr><td colSpan={3} className="p-6 text-center text-gray-500">Database kosong atau lagu tidak ditemukan. Silakan import file.</td></tr>
                      )}
                  </tbody>
                </table>

                {/* PAGINATION UI */}
                {(() => {
                  const filteredDb = songDb.filter(s =>
                    s.title.toLowerCase().includes(searchTermDbPage.toLowerCase()) ||
                    s.lyrics.toLowerCase().includes(searchTermDbPage.toLowerCase())
                  );
                  const totalPages = Math.ceil(filteredDb.length / dbItemsPerPage);

                  if (totalPages > 1) {
                    return (
                      <div className="flex justify-between items-center p-4 bg-white border-t">
                        <div className="text-xs text-gray-500">
                          Menampilkan {((dbCurrentPage - 1) * dbItemsPerPage) + 1} - {Math.min(dbCurrentPage * dbItemsPerPage, filteredDb.length)} dari {filteredDb.length} lagu
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setDbCurrentPage(p => Math.max(1, p - 1))}
                            disabled={dbCurrentPage === 1}
                            className={`px-3 py-1 text-sm border rounded ${dbCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600'}`}
                          >
                            Sebelumnya
                          </button>

                          {Array.from({ length: totalPages }).map((_, idx) => {
                            const page = idx + 1;
                            // Simplistic pagination view
                            if (page === 1 || page === totalPages || (page >= dbCurrentPage - 1 && page <= dbCurrentPage + 1)) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setDbCurrentPage(page)}
                                  className={`px-3 py-1 text-sm border rounded ${dbCurrentPage === page ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-gray-700'}`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (page === dbCurrentPage - 2 || page === dbCurrentPage + 2) {
                              return <span key={page} className="px-1 py-1 text-gray-400">...</span>;
                            }
                            return null;
                          })}

                          <button
                            onClick={() => setDbCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={dbCurrentPage === totalPages}
                            className={`px-3 py-1 text-sm border rounded ${dbCurrentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600'}`}
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="overflow-auto pb-12 w-full flex flex-col items-center bg-gray-200 p-8 rounded-xl shadow-inner no-print">
            <div className="mb-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium border border-yellow-200 shadow-sm">
              Sistem Auto-Pagination mendistribusikan lagu menjadi {getChunkedColumns().length > 1 ? Math.ceil(getChunkedColumns().length / 3) : 1} Halaman A4
            </div>
            {renderPrintPages()}
          </div>
        )}
      </main>

      {/* Area khusus cetak — hanya tampil saat print, disembunyikan di layar */}
      <div className="print-area" style={{ display: 'none' }}>
        {renderPrintPages()}
      </div>

    </div>
  );
}