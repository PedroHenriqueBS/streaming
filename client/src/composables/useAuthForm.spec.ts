import { useAuthForm } from './useAuthForm'

describe('useAuthForm', () => {
  it('validates the login fields with the design messages', () => {
    const { fields, errors, validate } = useAuthForm()
    fields.email = 'invalido'
    fields.password = '123'

    expect(validate([])).toBe(false)
    expect(errors.email).toBe('Digite um e-mail válido.')
    expect(errors.password).toBe('A senha precisa de pelo menos 6 caracteres.')
  })

  it('validates name and password confirmation on register', () => {
    const { fields, errors, validate } = useAuthForm()
    fields.name = 'P'
    fields.email = 'pedro@test.dev'
    fields.password = 'secret123'
    fields.confirmation = 'different'

    expect(validate(['name', 'confirmation'])).toBe(false)
    expect(errors.name).toBe('Digite seu nome.')
    expect(errors.confirmation).toBe('As senhas não coincidem.')
  })

  it('accepts valid data and clears errors per field', () => {
    const { fields, errors, validate, clearError } = useAuthForm()
    fields.name = 'Pedro'
    fields.email = 'pedro@test.dev'
    fields.password = 'secret123'
    fields.confirmation = 'secret123'

    expect(validate(['name', 'confirmation'])).toBe(true)

    errors.email = 'algum erro'
    clearError('email')
    expect(errors.email).toBeUndefined()
  })
})
