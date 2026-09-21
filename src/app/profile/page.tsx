'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Volume2,
  VolumeX,
  AlertTriangle,
} from 'lucide-react';
import {
  getUserPreferences,
  updateUserPreferences,
  purgeAllData,
  getCheckInHistory,
  getActivitySessions,
} from '@/lib/storage';
import { UserPreferences } from '@/types';

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState<boolean>(false);

  useEffect(() => {
    setPrefs(getUserPreferences());
  }, []);

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    const updated = updateUserPreferences(updates);
    setPrefs(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      preferences: prefs,
      checkIns: getCheckInHistory(),
      sessions: getActivitySessions(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exmello_student_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmPurge = () => {
    purgeAllData();
    setShowPurgeModal(false);
    setPurgeSuccess(true);
    setPrefs(getUserPreferences());
    setTimeout(() => setPurgeSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary-container text-white flex items-center justify-center text-2xl shadow-soft">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary font-display">
                {prefs.displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-primary text-[11px] font-semibold">
                โหมดทั่วไป (Guest Mode)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              ไม่มีการสอดแนมข้อมูล • บันทึก 100% ในเบราว์เซอร์ของคุณ
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#E2F5EA] text-[#21674A] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
          </div>
        )}

        {purgeSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#FFEAE8] text-[#A63737] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Trash2 className="w-4 h-4" />
            <span>ลบข้อมูลประวัติทั้งหมดออกจากเบราว์เซอร์นี้เรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Study Preferences Card */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/60 space-y-6">
          <h3 className="text-base font-bold text-primary font-display border-b border-stone-100 pb-3">
            การตั้งค่า Focus และเสียงเตือน
          </h3>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary block">
              ชื่อที่ใช้เรียกคุณ
            </label>
            <input
              type="text"
              value={prefs.displayName}
              onChange={(e) => handleUpdate({ displayName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-surface-container/40 border border-stone-200 text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Default Focus Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary block">
              ระยะเวลาโฟกัสเริ่มต้น
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 25, 50].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleUpdate({ defaultFocusMinutes: mins })}
                  className={`py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    prefs.defaultFocusMinutes === mins
                      ? 'bg-primary-container text-white shadow-sm'
                      : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'
                  }`}
                >
                  {mins} นาที
                </button>
              ))}
            </div>
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              {prefs.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-secondary" />
              ) : (
                <VolumeX className="w-5 h-5 text-stone-400" />
              )}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-text-primary">
                  เสียงกระดิ่งนุ่มนวล
                </p>
                <p className="text-[11px] text-text-secondary">
                  ส่งเสียงระฆังเบา ๆ เมื่อจับเวลาครบกำหนด
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate({ soundEnabled: !prefs.soundEnabled })}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                prefs.soundEnabled ? 'bg-primary-container' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  prefs.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account & Sync */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/60 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-primary font-display">
                สถานะบัญชีผู้ใช้
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                ขณะนี้คุณกำลังใช้งานในโหมดทั่วไป ข้อมูลจะถูกบันทึกเฉพาะในเครื่องนี้ หากต้องการเข้าถึงจากอุปกรณ์อื่น สามารถสร้างบัญชีได้ฟรี
              </p>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors whitespace-nowrap"
            >
              เข้าสู่ระบบ / สมัครสมาชิก
            </Link>
          </div>
        </div>

        {/* Data Privacy & GDPR Card */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/60 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            <h3 className="text-base font-bold font-display">ความเป็นส่วนตัวและการจัดการข้อมูล</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            EXMELLO ปฏิบัติตามหลักการไม่เก็บข้อมูลสุขภาพที่ละเอียดอ่อน คุณมีสิทธิ์ดาวน์โหลดหรือลบข้อมูลทั้งหมดที่บันทึกไว้ในเบราว์เซอร์นี้ได้ตลอดเวลา
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออกข้อมูลของฉัน (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPurgeModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FFEAE8] hover:bg-[#FFD4D0] text-[#A63737] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>ลบข้อมูลทั้งหมด & รีเซ็ต</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-hover border border-stone-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEAE8] text-[#A63737] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-primary font-display">
              ต้องการลบข้อมูลทั้งหมดในเครื่องนี้หรือไม่?
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              การกระทำนี้จะลบประวัติการเช็กอินและเวลาโฟกัสสะสมออกจากเบราว์เซอร์นี้ถาวร และไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container text-xs font-semibold text-text-primary hover:bg-surface-container-high"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                className="flex-1 py-2.5 rounded-full bg-[#A63737] text-white text-xs font-semibold hover:bg-red-800"
              >
                ยืนยันลบข้อมูลทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
