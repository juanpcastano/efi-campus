import { useState, useMemo, useCallback } from 'react'
import {
  AsYouType,
  getExampleNumber,
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js'
import examples from 'libphonenumber-js/mobile/examples'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'

export interface Country {
  code: CountryCode
  label: string
  prefix: string
}

const countryNames = new Intl.DisplayNames(['es'], { type: 'region' })

export const COUNTRIES: Country[] = getCountries()
  .map((code) => ({
    code,
    label: countryNames.of(code) ?? code,
    prefix: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'))

export function getMaxLength(countryCode: CountryCode): number {
  const example = getExampleNumber(countryCode, examples)
  return example?.formatNational().length ?? 15
}

export function getPlaceholder(countryCode: CountryCode): string {
  const example = getExampleNumber(countryCode, examples)
  return example?.formatNational() ?? ''
}

export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: CountryCode,
): string {
  return new AsYouType(countryCode).input(phoneNumber)
}

export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: CountryCode,
): boolean {
  if (!phoneNumber) return false
  const country = COUNTRIES.find((c) => c.code === countryCode)
  if (!country) return false
  const fullNumber = `${country.prefix}${phoneNumber.replace(/\s/g, '')}`
  return isValidPhoneNumber(fullNumber)
}

export function usePhonePrefix(initialCountryCode: CountryCode = 'CO') {
  const [countryCode, setCountryCode] =
    useState<CountryCode>(initialCountryCode)
  const [phoneNumber, setPhoneNumber] = useState('')

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode)!,
    [countryCode],
  )

  const handleCountryChange = useCallback((value: string) => {
    const country = COUNTRIES.find((c) => c.code === value)
    if (country) {
      setCountryCode(country.code)
      setPhoneNumber('')
    }
  }, [])

  const handlePhoneChange = useCallback(
    (value: string) => {
      const formatted = new AsYouType(countryCode).input(value)
      setPhoneNumber(formatted)
    },
    [countryCode],
  )

  const getFullPhoneNumber = useCallback(() => {
    return `${selectedCountry.prefix}${phoneNumber.replace(/\s/g, '')}`
  }, [selectedCountry.prefix, phoneNumber])

  return {
    countryCode,
    phoneNumber,
    selectedCountry,
    handleCountryChange,
    handlePhoneChange,
    getFullPhoneNumber,
  }
}
