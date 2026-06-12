import { describe, it, expect } from 'vitest';
import { t } from '@/i18n';

describe('t()', () => {
  it('resolve chave existente em PT', () => {
    expect(t('pt', 'nav.services')).toBe('Serviços');
  });
  it('chave ausente retorna a própria chave (sem quebrar render)', () => {
    expect(t('pt', 'nao.existe')).toBe('nao.existe');
  });
});
