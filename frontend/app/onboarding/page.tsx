import Logo from '@/components/Logo';
import CreateTeamForm from '@/components/CreateTeamForm';
import InvitationList from '@/components/InvitationList';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-8 py-4">
      <Logo />
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hello, User!</h1>
        <CreateTeamForm />
        <InvitationList />
      </main>
    </div>
  );
}
