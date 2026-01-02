import { LoginForm } from "@/components/login-form";
import LogoGenesis from "@/assets/Logo-Genesis.png";

export default function LoginPage() {
  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-[#c8a8ad] via-white to-[#c8a8ad] dark:from-slate-900 dark:via-slate-950 dark:to-[#c8a8ad]">
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex items-center justify-center">
            <img src={LogoGenesis} alt="Genesis Clinic" className="h-10" />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}