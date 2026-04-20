type ClerkError = {
  code?: string;
  message?: string;
  longMessage?: string;
  meta?: { paramName?: string };
};

const messages: Record<string, string> = {
  form_identifier_not_found: "Não encontramos uma conta com este e-mail.",
  form_password_incorrect: "Senha incorreta. Tente novamente.",
  form_password_pwned: "Esta senha apareceu em vazamentos de dados. Escolha outra.",
  form_password_length_too_short: "A senha é muito curta.",
  form_password_not_strong_enough: "A senha não é forte o suficiente.",
  form_password_validation_failed: "A senha não atende aos requisitos.",
  form_identifier_exists: "Já existe uma conta com este e-mail.",
  form_param_format_invalid: "Formato inválido. Verifique os dados informados.",
  form_param_nil: "Preencha todos os campos obrigatórios.",
  form_code_incorrect: "Código de verificação inválido.",
  verification_failed: "Falha na verificação. Tente novamente.",
  verification_expired: "O código expirou. Solicite um novo.",
  too_many_requests: "Muitas tentativas. Aguarde um momento e tente novamente.",
  session_exists: "Você já está autenticado.",
  network_error: "Erro de rede. Verifique sua conexão.",
  captcha_invalid: "Falha no captcha. Recarregue a página.",
  form_param_format_invalid__email_address: "Informe um e-mail válido.",
};

export function translateClerkError(err: unknown, fallback = "Ocorreu um erro. Tente novamente."): string {
  if (!err || typeof err !== "object" || !("errors" in err)) return fallback;
  const errors = (err as { errors?: ClerkError[] }).errors;
  const first = errors?.[0];
  if (!first) return fallback;

  const keyedByParam = first.code && first.meta?.paramName
    ? `${first.code}__${first.meta.paramName}`
    : undefined;

  if (keyedByParam && messages[keyedByParam]) return messages[keyedByParam];
  if (first.code && messages[first.code]) return messages[first.code];
  return first.longMessage || first.message || fallback;
}
