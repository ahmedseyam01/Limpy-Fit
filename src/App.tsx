import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Trainee } from './types/nutrition';
import type { AdminView } from './constants';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
import { findPlanForTrainee } from './utils/plan';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ConfirmDeleteModal } from './components/ui/ConfirmDeleteModal';
import { LoginModal } from './features/auth/LoginModal';
import { TraineesListView } from './features/trainees/TraineesListView';
import { AddTraineeModal } from './features/trainees/AddTraineeModal';
import { PlanBuilderView } from './features/plan-builder/PlanBuilderView';
import { TraineePortalView } from './features/portal/TraineePortalView';

// Rarely-used screens are split into their own chunks.
const PdfExportView = lazy(() => import('./features/pdf/PdfExportView').then(m => ({ default: m.PdfExportView })));
const SettingsView = lazy(() => import('./features/settings/SettingsView').then(m => ({ default: m.SettingsView })));

const ViewFallback = () => (
  <div className="flex justify-center py-16">
    <div className="w-8 h-8 border-2 border-[#9CFF00] border-t-transparent rounded-full animate-spin" />
  </div>
);

type AppData = ReturnType<typeof useAppData>;

export function App() {
  const auth = useAuth();
  const data = useAppData();

  if (auth.role === null) {
    return <LoginModal trainees={data.trainees} onAdminLogin={auth.loginAdmin} onTraineeLogin={auth.loginTrainee} />;
  }

  if (auth.role === 'trainee') {
    return <TraineeApp data={data} traineeId={auth.activeTraineeId} onLogout={auth.logout} />;
  }

  return <AdminApp data={data} onLogout={auth.logout} />;
}

// ---------------------------------------------------------------------------
// Trainee portal
// ---------------------------------------------------------------------------

function TraineeApp({ data, traineeId, onLogout }: { data: AppData; traineeId: string; onLogout: () => void }) {
  const [showPdf, setShowPdf] = useState(false);
  const trainee = data.trainees.find(t => t.id === traineeId);
  const plan = useMemo(() => (trainee ? findPlanForTrainee(data.dietPlans, trainee) : null), [data.dietPlans, trainee]);

  // Never fall back to another trainee's data if this account was removed.
  if (!trainee || !plan) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 max-w-sm text-center space-y-4">
          <p className="text-sm text-gray-300">لم يعد هذا الحساب متاحاً. يرجى التواصل مع الكابتن.</p>
          <button
            onClick={onLogout}
            className="bg-[#9CFF00] text-black font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  if (showPdf) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-4">
        <button
          onClick={() => setShowPdf(false)}
          className="no-print mb-4 bg-[#222] hover:bg-[#333] border border-[#333] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-[#9CFF00]" />
          <span>العودة لبوابة المتدرب</span>
        </button>
        <Suspense fallback={<ViewFallback />}>
          <PdfExportView trainee={trainee} plan={plan} coachProfile={data.coachProfile} onBack={() => setShowPdf(false)} />
        </Suspense>
      </div>
    );
  }

  return (
    <TraineePortalView
      trainee={trainee}
      dietPlan={plan}
      coachProfile={data.coachProfile}
      onLogout={onLogout}
      onUpdateTraineeProgress={data.updateTrainee}
      onViewPdf={() => setShowPdf(true)}
    />
  );
}

// ---------------------------------------------------------------------------
// Coach admin system
// ---------------------------------------------------------------------------

function AdminApp({ data, onLogout }: { data: AppData; onLogout: () => void }) {
  const { trainees, dietPlans, coachProfile } = data;
  const [currentView, setCurrentView] = useState<AdminView>('list');
  const [selectedTraineeId, setSelectedTraineeId] = useState(() => trainees[0]?.id ?? '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [traineeToDelete, setTraineeToDelete] = useState<Trainee | null>(null);

  const selectedTrainee = trainees.find(t => t.id === selectedTraineeId) ?? trainees[0];
  const activePlan = useMemo(
    () => (selectedTrainee ? findPlanForTrainee(dietPlans, selectedTrainee) : null),
    [dietPlans, selectedTrainee]
  );

  const openTrainee = useCallback((traineeId: string, view: AdminView) => {
    setSelectedTraineeId(traineeId);
    setCurrentView(view);
  }, []);

  const openAddModal = useCallback(() => setShowAddModal(true), []);
  const closeDeleteModal = useCallback(() => setTraineeToDelete(null), []);

  const handleAddTrainee = (trainee: Trainee) => {
    data.addTrainee(trainee);
    setShowAddModal(false);
    openTrainee(trainee.id, 'plan');
  };

  const confirmDeleteTrainee = () => {
    if (!traineeToDelete) return;
    data.deleteTrainee(traineeToDelete.id);
    if (selectedTraineeId === traineeToDelete.id) {
      setSelectedTraineeId(trainees.find(t => t.id !== traineeToDelete.id)?.id ?? '');
    }
    setTraineeToDelete(null);
  };

  const backToList = () => setCurrentView('list');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0A0A0A] text-white font-sans antialiased select-none">
      <div className="flex-1">
        <Navbar
          coachProfile={coachProfile}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenAddModal={openAddModal}
          onLogout={onLogout}
        />

        <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'list' && (
            <TraineesListView
              trainees={trainees}
              onOpenTrainee={openTrainee}
              onRequestDelete={setTraineeToDelete}
              onAddTrainee={openAddModal}
            />
          )}

          {currentView === 'plan' && selectedTrainee && activePlan && (
            <PlanBuilderView
              key={selectedTrainee.id}
              trainee={selectedTrainee}
              plan={activePlan}
              onSavePlan={data.savePlan}
              onExportPdf={() => setCurrentView('pdf')}
            />
          )}

          <Suspense fallback={<ViewFallback />}>
            {currentView === 'pdf' && selectedTrainee && activePlan && (
              <PdfExportView trainee={selectedTrainee} plan={activePlan} coachProfile={coachProfile} onBack={backToList} />
            )}

            {currentView === 'settings' && (
              <SettingsView coachProfile={coachProfile} onUpdateProfile={data.updateCoachProfile} />
            )}
          </Suspense>
        </main>

        {traineeToDelete && (
          <ConfirmDeleteModal
            traineeName={traineeToDelete.name}
            onCancel={closeDeleteModal}
            onConfirm={confirmDeleteTrainee}
          />
        )}

        <AddTraineeModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddTrainee={handleAddTrainee} />
      </div>

      <Footer className="mt-6" />
    </div>
  );
}
