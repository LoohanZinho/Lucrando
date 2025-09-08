
import { useCallback } from 'react';

type NumberMaskOptions = {
  locale?: string;
  style?: 'decimal' | 'currency';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  prefix?: string;
  suffix?: string;
};

const defaultOptions: NumberMaskOptions = {
  locale: 'pt-BR',
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

export function useNumberMask(options: NumberMaskOptions = {}) {
  const config = { ...defaultOptions, ...options };
  
  if (config.style === 'currency') {
      config.minimumFractionDigits = 2;
      config.maximumFractionDigits = 2;
  }

  const parse = useCallback((value: string): number | undefined => {
    if (typeof value !== 'string' || value.trim() === '') return undefined;
    
    let cleanValue = value.replace(/\s/g, '');

    if(config.prefix) cleanValue = cleanValue.replace(config.prefix, '');
    if(config.suffix) cleanValue = cleanValue.replace(config.suffix, '');

    if (config.locale === 'pt-BR') {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      cleanValue = cleanValue.replace(/,/g, '');
    }

    if (config.style === 'currency' && config.locale === 'pt-BR') {
        cleanValue = cleanValue.replace('R$', '');
    }

    const number = parseFloat(cleanValue);
    return isNaN(number) ? undefined : number;
  }, [config.locale, config.style, config.prefix, config.suffix]);

  const format = useCallback((value: number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    
    const formatter = new Intl.NumberFormat(config.locale, {
      style: config.style,
      currency: config.currency,
      minimumFractionDigits: config.minimumFractionDigits,
      maximumFractionDigits: config.maximumFractionDigits,
    });
    
    let formattedValue = formatter.format(value);
    
    if(config.prefix) formattedValue = `${config.prefix}${formattedValue}`;
    if(config.suffix) formattedValue = `${formattedValue}${config.suffix}`;
    
    return formattedValue;
  }, [config]);

  const handleOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (value: number | undefined) => void) => {
    const rawValue = e.target.value;
    const parsedValue = parse(rawValue);
    fieldOnChange(parsedValue);
  }, [parse]);
  
  const getInputProps = (fieldValue: number | undefined, fieldOnChange: (value: number | undefined) => void) => {
    return {
      value: format(fieldValue),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(e, fieldOnChange),
    };
  };

  return { format, parse, getInputProps };
}
