import { notFound } from "next/navigation";

import { SetPasswordForm } from "./_components/set-password-form";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SetPasswordPage({ params }: Props) {
  const { token } = await params;
  // Token cru tem 64 chars hex (randomBytes(32).toString('hex')).
  // Não buscamos no servidor: a validação real corre no backend ao submeter o form.
  if (!/^[0-9a-f]{64}$/.test(token)) {
    notFound();
  }
  return <SetPasswordForm token={token} />;
}
