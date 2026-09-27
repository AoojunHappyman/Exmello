"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DEFAULT_PREFERENCES,
  getUserPreferences,
  updateUserPreferences,
  purgeAllData,
  getCheckInHistory,
  getActivitySessions,
} from "@/lib/storage";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { UserPreferences } from "@/types";
import {
  AuthSession,
  clearAuthSession,
  deleteAccount,
  getAuthSession,
  getCheckins,
  getFocusSessions,
  onAuthChange,
  readableApiError,
} from "@/lib/api";

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState("");
  const [account, setAccount] = useState<AuthSession | null>(null);
  const [accountError, setAccountError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPrefs(getUserPreferences());
    setAccount(getAuthSession());
    return onAuthChange(() => setAccount(getAuthSession()));
  }, []);

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    const updated = updateUserPreferences(updates);
    setPrefs(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportData = async () => {
    setAccountError("");
    let checkIns;
    let sessions;
    try {
      [checkIns, sessions] = account
        ? await Promise.all([getCheckins(100), getFocusSessions(100)])
        : [getCheckInHistory(), getActivitySessions()];
    } catch (error) {
      setAccountError(readableApiError(error));
      return;
    }
    const data = {
      exportedAt: new Date().toISOString(),
      preferences: prefs,
      checkIns,
      sessions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exmello_student_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmPurge = async () => {
    setPending(true);
    setAccountError("");
    try {
      if (account) {
        await deleteAccount();
        clearAuthSession();
      }
    } catch (error) {
      setAccountError(readableApiError(error));
      setPending(false);
      setShowPurgeModal(false);
      return;
    }
    purgeAllData();
    setShowPurgeModal(false);
    setPurgeSuccess(
      account
        ? "ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้ว"
        : "ลบประวัติและการตั้งค่าในเบราว์เซอร์นี้เรียบร้อยแล้ว",
    );
    setPrefs(getUserPreferences());
    setTimeout(() => setPurgeSuccess(""), 3000);
    setPending(false);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary-container text-white flex items-center justify-center text-2xl shadow-soft">
            <User className="w-8 h-8" />
          </div>
          <div className="min-w-0 break-words">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary font-display">
                {account?.user.full_name || prefs.displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-primary text-xs font-semibold">
                {account ? "บัญชีผู้ใช้" : "โหมดทั่วไป (Guest Mode)"}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-0.5">
              {account
                ? account.user.email
                : "บันทึกข้อมูลไว้ในเบราว์เซอร์ของคุณ"}
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-2xl bg-[#E2F5EA] text-[#21674A] text-xs font-semibold flex items-center gap-2 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
          </div>
        )}
        {accountError && (
          <p role="alert" className="text-sm text-red-700">
            {accountError}
          </p>
        )}

        {purgeSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-2xl bg-[#FFEAE8] text-[#A63737] text-xs font-semibold flex items-center gap-2 animate-in fade-in"
          >
            <Trash2 className="w-4 h-4" />
            <span>{purgeSuccess}</span>
          </div>
        )}

        {/* Study Preferences Card */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/60 space-y-6">
          <h3 className="text-base font-bold text-primary font-display border-b border-stone-100 pb-3">
            การตั้งค่า Focus และเสียงเตือน
          </h3>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="display-name"
              className="text-sm font-semibold text-text-primary block"
            >
              ชื่อที่ใช้เรียกคุณ
            </label>
            <input
              type="text"
              id="display-name"
              maxLength={100}
              value={prefs.displayName}
              onChange={(e) => handleUpdate({ displayName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-surface-container/40 border border-stone-200 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Default Focus Duration */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-text-primary">
              ระยะเวลาโฟกัสเริ่มต้น
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[15, 25, 50].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  aria-pressed={prefs.defaultFocusMinutes === mins}
                  onClick={() => handleUpdate({ defaultFocusMinutes: mins })}
                  className={`py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    prefs.defaultFocusMinutes === mins
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container text-text-secondary hover:bg-surface-container-high"
                  }`}
                >
                  {prefs.defaultFocusMinutes === mins && (
                    <CheckCircle2 className="inline mr-1" size={14} />
                  )}
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
                <p className="text-sm font-semibold text-text-primary">
                  เสียงกระดิ่งนุ่มนวล
                </p>
                <p className="text-sm text-text-secondary">
                  ส่งเสียงระฆังเบา ๆ เมื่อจับเวลาครบกำหนด
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="เสียงแจ้งเตือน"
              aria-checked={prefs.soundEnabled}
              onClick={() =>
                handleUpdate({ soundEnabled: !prefs.soundEnabled })
              }
              className={`w-12 h-11 shrink-0 rounded-full transition-colors relative p-0.5 ${
                prefs.soundEnabled ? "bg-primary-container" : "bg-stone-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  prefs.soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account & Sync */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/60 space-y-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-primary font-display">
                สถานะบัญชีผู้ใช้
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">
                {account
                  ? "เช็กอินและเวลาโฟกัสของบัญชีบันทึกบนเซิร์ฟเวอร์ การตั้งค่าอุปกรณ์ยังบันทึกในเบราว์เซอร์นี้"
                  : "ขณะนี้คุณกำลังใช้งานในโหมดทั่วไป ข้อมูลจะถูกบันทึกเฉพาะในเครื่องนี้ หากต้องการเข้าถึงจากอุปกรณ์อื่น สามารถสร้างบัญชีได้ฟรี"}
              </p>
            </div>
            {account ? (
              <button
                type="button"
                onClick={() => clearAuthSession()}
                className="px-4 py-2 rounded-full bg-surface-container text-xs font-semibold text-primary whitespace-nowrap"
              >
                ออกจากระบบ
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors whitespace-nowrap"
              >
                เข้าสู่ระบบ / สมัครสมาชิก
              </Link>
            )}
          </div>
        </div>

        {/* Data Privacy & GDPR Card */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/60 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            <h3 className="text-base font-bold font-display">
              ความเป็นส่วนตัวและการจัดการข้อมูล
            </h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {account
              ? "คุณสามารถดาวน์โหลดเช็กอินและเวลาโฟกัสล่าสุดอย่างละ 100 รายการของบัญชี หรือลบบัญชีพร้อมข้อมูลบนเซิร์ฟเวอร์ได้"
              : "คุณสามารถดาวน์โหลดหรือลบข้อมูลที่บันทึกไว้ในเบราว์เซอร์นี้ได้ตลอดเวลา"}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>
                {account
                  ? "ส่งออกข้อมูลล่าสุด (JSON)"
                  : "ส่งออกข้อมูลของฉัน (JSON)"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowPurgeModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FFEAE8] hover:bg-[#FFD4D0] text-[#A63737] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {account
                  ? "ลบบัญชีและข้อมูลทั้งหมด"
                  : "ลบข้อมูลทั้งหมด & รีเซ็ต"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={showPurgeModal}
        busy={pending}
        onClose={() => setShowPurgeModal(false)}
        title={
          account ? "ลบบัญชีและข้อมูลทั้งหมด?" : "ลบข้อมูลในเบราว์เซอร์นี้?"
        }
      >
        <p className="text-sm text-text-secondary">
          {account
            ? "บัญชี ประวัติเช็กอิน และเวลาโฟกัสบนเซิร์ฟเวอร์ รวมถึงข้อมูลในเบราว์เซอร์นี้จะถูกลบถาวร และไม่สามารถกู้คืนได้"
            : "ประวัติและการตั้งค่าในเบราว์เซอร์นี้จะถูกลบถาวร และไม่สามารถกู้คืนได้"}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => setShowPurgeModal(false)}
          >
            เก็บข้อมูลไว้
          </Button>
          <Button
            variant="danger"
            loading={pending}
            onClick={handleConfirmPurge}
          >
            ยืนยันลบถาวร
          </Button>
        </div>
      </Modal>
    </div>
  );
}
