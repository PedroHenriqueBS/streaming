import { reactive, ref } from 'vue'

export interface AuthFormFields {
  name: string
  email: string
  password: string
  confirmation: string
}

export type AuthFormErrors = Partial<Record<keyof AuthFormFields, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Client-side validation with the same rules and messages as the design. */
export function useAuthForm() {
  const fields = reactive<AuthFormFields>({ name: '', email: '', password: '', confirmation: '' })
  const errors = reactive<AuthFormErrors>({})
  const submitting = ref(false)

  function clearError(field: keyof AuthFormFields): void {
    errors[field] = undefined
  }

  function validate(requiredFields: (keyof AuthFormFields)[]): boolean {
    if (requiredFields.includes('name') && fields.name.trim().length < 2) {
      errors.name = 'Digite seu nome.'
    }
    if (!EMAIL_PATTERN.test(fields.email.trim())) {
      errors.email = 'Digite um e-mail válido.'
    }
    if (fields.password.length < 6) {
      errors.password = 'A senha precisa de pelo menos 6 caracteres.'
    }
    if (requiredFields.includes('confirmation') && fields.confirmation !== fields.password) {
      errors.confirmation = 'As senhas não coincidem.'
    }
    return !errors.name && !errors.email && !errors.password && !errors.confirmation
  }

  return { fields, errors, submitting, validate, clearError }
}
