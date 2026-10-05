import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  HardDrive,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  Layers,
  Check,
  HelpCircle,
} from 'lucide-react';
import { BannerEntity, BannerSlotNumber } from '../../../types/common/index';
import { bannerService, BannerIntegrityReport, CANONICAL_SLOTS } from '../services/bannerService';
import { AdminButton, AdminConfirmDialog } from '../../../components/admin';

export interface BannerIntegrityCardProps {
  slots?: Record<BannerSlotNumber, BannerEntity | null>;
  slotBanners?: Record<BannerSlotNumber, BannerEntity | null>;
  allBanners?: BannerEntity[];
  onAuditCompleted?: () => void;
  onBannersUpdated?: () => void;
  onFeedback?: (type: 'success' | 'error', text: string) => void;
}

export const BannerIntegrityCard: React.FC<BannerIntegrityCardProps> = ({
  slots,
  slotBanners,
  allBanners: _allBanners,
  onAuditCompleted,
  onBannersUpdated,
  onFeedback,
}) => {
  const effectiveSlots = slots || slotBanners || { 1: null, 2: null, 3: null, 4: null };
  const [report, setReport] = useState<BannerIntegrityReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Scan storage & database
  const handleRunAudit = async () => {
    setIsScanning(true);
    setStatusMessage(null);
    try {
      const res = await bannerService.audit4SlotStorageIntegrity();
      if (res.success && res.data) {
        setReport(res.data);
        const totalOrphans = res.data.orphanBannerFiles.length + res.data.orphanThumbnailFiles.length;
        const totalDocs = res.data.supersededFirestoreDocs.length;
        if (totalOrphans === 0 && totalDocs === 0) {
          setStatusMessage({
            type: 'success',
            text: 'स्टोरेज एवं डेटाबेस पूर्णतः सुसंगत हैं! कोई अप्रचलित फाइल या अनाथ रिकॉर्ड नहीं मिला।',
          });
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'स्टोरेज ऑडिट विफल रहा।',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'ऑडिट के दौरान त्रुटि आई।',
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Purge obsolete assets
  const handlePurgeConfirmed = async () => {
    if (!report) return;
    setIsPurging(true);
    setStatusMessage(null);
    try {
      const storagePathsToPurge = [
        ...report.orphanBannerFiles.map((f) => f.storagePath),
        ...report.orphanThumbnailFiles.map((f) => f.storagePath),
      ];
      const docIdsToPurge = report.supersededFirestoreDocs.map((d) => d.id);

      const res = await bannerService.purgeOrphanBannerAssets(storagePathsToPurge, docIdsToPurge);
      if (res.success && res.data) {
        setStatusMessage({
          type: 'success',
          text: `सफलतापूर्वक ${res.data.deletedStorageCount} अप्रचलित फाइलें एवं ${res.data.deletedDocCount} अनाथ रिकॉर्ड हटाए गए!`,
        });
        // Re-run audit to verify clean state
        await handleRunAudit();
        onAuditCompleted?.();
        onBannersUpdated?.();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'फाइलें हटाने में विफलता।',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'निष्कासन के दौरान त्रुटि हुई।',
      });
    } finally {
      setIsPurging(false);
      setIsConfirmOpen(false);
    }
  };

  const totalOrphanCount = report
    ? report.orphanBannerFiles.length + report.orphanThumbnailFiles.length
    : 0;

  const totalSupersededDocCount = report ? report.supersededFirestoreDocs.length : 0;
  const orphanSizeKb = report ? Math.round(report.orphanTotalSizeBytes / 1024) : 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-stone-50/90 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              4-स्लॉट बैनर अखंडता एवं स्टोरेज क्लीनर
            </h3>
            <p className="text-xs text-stone-500">
              कैनोनिकल स्लॉट्स 1..4 का सत्यापन, अनाथ फाइलों की खोज एवं सुरक्षित सफाई
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRunAudit}
            loading={isScanning}
            icon={<RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />}
          >
            {report ? 'पुनः स्कैन करें' : 'स्टोरेज अखंडता स्कैन करें'}
          </AdminButton>

          {report && (totalOrphanCount > 0 || totalSupersededDocCount > 0) && (
            <AdminButton
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              loading={isPurging}
              icon={<Trash2 className="w-4 h-4" />}
            >
              अप्रचलित फाइलें हटाएं ({totalOrphanCount})
            </AdminButton>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Status Message Toast */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 4-SLOT VERIFICATION GRID (Phase 20) */}
        <div>
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
            कैनोनिकल स्लॉट स्थिति (4-Slot Invariants)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CANONICAL_SLOTS.map((slotNum) => {
              const b = effectiveSlots[slotNum];
              const isValid = b && b.active !== false && !!b.imageUrl;
              const isEmpty = !b;

              return (
                <div
                  key={slotNum}
                  className={`p-3 rounded-xl border transition-all ${
                    isValid
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : isEmpty
                      ? 'bg-stone-50 border-stone-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-stone-900">स्लॉट {slotNum}</span>
                    {isValid ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> वैध
                      </span>
                    ) : isEmpty ? (
                      <span className="text-stone-500 flex items-center gap-1">
                        ! खाली
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1">
                        ! निष्क्रिय
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 truncate">
                    {b ? b.title : 'कोई बैनर नहीं है'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Results Dashboard */}
        {report ? (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-500">कुल स्टोरेज बैनर फाइलें</span>
                <p className="text-lg font-bold text-stone-900">{report.totalStorageBannerFiles}</p>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-500">संरक्षित कैनोनिकल पाथ</span>
                <p className="text-lg font-bold text-emerald-700 font-mono">
                  {report.canonicalStoragePaths.length}
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  totalOrphanCount > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-stone-50 border-stone-200 text-stone-900'
                }`}
              >
                <span className="text-[11px] text-stone-500">अनाथ/अप्रचलित फाइलें</span>
                <p className="text-lg font-bold">{totalOrphanCount}</p>
                {orphanSizeKb > 0 && (
                  <span className="text-[10px] text-stone-500">({orphanSizeKb} KB व्यर्थ)</span>
                )}
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  totalSupersededDocCount > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-stone-50 border-stone-200 text-stone-900'
                }`}
              >
                <span className="text-[11px] text-stone-500">अतिरिक्त डेटाबेस रिकॉर्ड</span>
                <p className="text-lg font-bold">{totalSupersededDocCount}</p>
              </div>
            </div>

            {/* Orphan Files List Table */}
            {totalOrphanCount > 0 && (
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>हटाने योग्य अनाथ फाइलें ({totalOrphanCount})</span>
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">
                    केवल `banners/` एवं `thumbnails/` में स्थित
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 text-xs font-mono">
                  {report.orphanBannerFiles.map((file) => (
                    <div
                      key={file.storagePath}
                      className="px-4 py-2 flex items-center justify-between hover:bg-stone-50 text-stone-700"
                    >
                      <span className="truncate pr-2">{file.storagePath}</span>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {file.size ? `${Math.round(file.size / 1024)} KB` : '—'}
                      </span>
                    </div>
                  ))}
                  {report.orphanThumbnailFiles.map((file) => (
                    <div
                      key={file.storagePath}
                      className="px-4 py-2 flex items-center justify-between hover:bg-stone-50 text-stone-600"
                    >
                      <span className="truncate pr-2">{file.storagePath}</span>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {file.size ? `${Math.round(file.size / 1024)} KB` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-stone-50 rounded-xl border border-dashed border-stone-300 text-center space-y-2">
            <HardDrive className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-xs text-stone-600">
              स्टोरेज और डेटाबेस की गहन अखंडता जांच के लिए ऊपर दिए गए बटन पर क्लिक करें।
            </p>
            <p className="text-[11px] text-stone-400">
              यह ऑडिट केवल `banners/` और `thumbnails/` फोल्डर की जांच करता है। ऑडियो एवं साहित्य सुरक्षित रहते हैं।
            </p>
          </div>
        )}

        {/* Safety Boundary Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-stone-700">स्टोरेज सुरक्षा गारंटी (Storage Safety Guarantee):</strong>
            <p className="mt-0.5">
              यह अखंडता क्लीनर अन्य किसी भी स्टोरेज फोल्डर (जैसे <code>audio/</code>, <code>books/</code>,{' '}
              <code>avatars/</code>, <code>documents/</code>) को कभी भी नहीं छूता। केवल 4 लाइव स्लॉट्स से असंबद्ध
              पुरानी बैनर फाइलों को ही हटाया जाता है।
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={isConfirmOpen}
        title="अप्रचलित बैनर फाइलें हटाएं?"
        message={`क्या आप वास्तव में ${totalOrphanCount} अप्रचलित फाइलें एवं ${totalSupersededDocCount} अतिरिक्त डेटाबेस रिकॉर्ड स्थायी रूप से हटाना चाहते हैं? यह प्रक्रिया अपरिवर्तनीय है। चारों लाइव स्लॉट्स पूर्णतः सुरक्षित रहेंगे।`}
        confirmText="हाँ, सुरक्षित रूप से हटाएं"
        cancelText="रद्द करें"
        isDestructive={true}
        onConfirm={handlePurgeConfirmed}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
