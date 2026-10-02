/**
 * ============================================================================
 * Santmat Satsang Prachar - Stuti-Vinati Management (Admin)
 * ============================================================================
 * FIXED TWO-SLOT CMS. The product exposes exactly two canonical slots:
 *
 *   1. प्रातःकालीन स्तुति  (morning,  stuti_vinati/stuti-morning)
 *   2. संध्याकालीन स्तुति  (evening,  stuti_vinati/stuti-evening)
 *
 * There is NO dynamic stuti list, NO arbitrary item creation and NO deletion.
 * Each slot opens the shared StutiSlotEditor which manages a single canonical
 * Firestore document. Historical legacy records never surface here.
 */
import React, { useState } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { StutiItem, StutiSlot } from '../../../types/common/index';
import { AdminPageHeader } from '../../../components/admin';
import { StutiSlotSelector } from '../components/StutiSlotSelector';
import { StutiSlotEditor } from '../components/StutiSlotEditor';
import { buildDefaultSlotStuti, resolveSlotStuti } from '../config/stutiSlots';

export const AdminStutiManager: React.FC = () => {
  const { stutis } = useApp();
  const [selectedSlot, setSelectedSlot] = useState<StutiSlot>('morning');

  const morningStuti: StutiItem = resolveSlotStuti(stutis, 'morning') ?? buildDefaultSlotStuti('morning');
  const eveningStuti: StutiItem = resolveSlotStuti(stutis, 'evening') ?? buildDefaultSlotStuti('evening');
  const activeStuti = selectedSlot === 'morning' ? morningStuti : eveningStuti;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      <AdminPageHeader
        title="स्तुति-विनती प्रबंधन (Stuti-Vinati CMS)"
        subtitle="यहाँ से आप प्रातःकालीन स्तुति एवं संध्याकालीन स्तुति — केवल ये दोनों निर्धारित स्लॉट — के बोल, ऑडियो फ़ाइल, गुरु वाणी उद्धरण एवं मोबाइल ऐप के 1:1 आर्टवर्क नियंत्रित कर सकते हैं।"
        badgeText="EXACTLY 2 FIXED SLOTS"
        badgeVariant="warning"
        breadcrumbs={[
          { label: 'डैशबोर्ड', href: '/admin' },
          { label: 'स्तुति-विनती' },
        ]}
      />

      {/* Fixed Slot Selector */}
      <StutiSlotSelector selected={selectedSlot} onSelect={setSelectedSlot} />

      {/* Slot Editor (remounts on slot change) */}
      <StutiSlotEditor key={selectedSlot} slot={selectedSlot} stuti={activeStuti} />
    </div>
  );
};