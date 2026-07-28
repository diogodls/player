import { render, screen } from '@testing-library/react';
import { ActionsProvider } from '../../../contexts/ActionsContext/ActionsContext';
import { useApi } from '../../../hooks/useApi';
import IndividualAnalysis from './IndividualAnalysis';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('../../../hooks/useApi', () => ({ useApi: vi.fn() }));
vi.mock('../../../hooks/useSessionExitGuard', () => ({
  useSessionExitGuard: () => ({
    requestExit: vi.fn(),
    isExitModalOpen: false,
    closeExitModal: vi.fn(),
    handleExitWithoutSaving: vi.fn(),
    handleSaveAndExit: vi.fn(),
  }),
}));
vi.mock('../../../components/elements/VideoAnalysis/VideoAnalysis', () => ({ default: () => <div/> }));
vi.mock('../../../components/elements/ActionLog/ActionLog', () => ({ default: () => <div/> }));
vi.mock('../../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector', () => ({ default: () => <div/> }));
vi.mock('../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader', () => ({ default: () => <div/> }));

const mockedUseApi = vi.mocked(useApi);

describe('IndividualAnalysis catalog states', () => {
  beforeEach(() => mockedUseApi.mockReset());

  it('renders a safe loading state while the catalog is loading', () => {
    mockedUseApi.mockReturnValue(apiState({ isLoading: true }));
    renderPage();
    expect(screen.getByText('Carregando análise individual...')).toBeInTheDocument();
  });

  it('renders a safe error state when the catalog request fails', () => {
    mockedUseApi
      .mockReturnValueOnce(apiState({ data: session() }))
      .mockReturnValueOnce(apiState({ data: { data: [], total: 0, page: 1, limit: 100, totalPages: 1 } }))
      .mockReturnValueOnce(apiState({ isError: new Error('catalog failed') }));

    renderPage();
    expect(screen.getByText('Não foi possível carregar a análise individual.')).toBeInTheDocument();
  });
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sessions/session-1/analysis/individual']}>
      <ActionsProvider>
        <Routes>
          <Route
            path="/sessions/:id/analysis/individual"
            element={<IndividualAnalysis/>}
          />
        </Routes>
      </ActionsProvider>
    </MemoryRouter>,
  );
}

function apiState(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    isError: undefined,
    mutate: vi.fn(),
    ...overrides,
  };
}

function session() {
  return { id: 'session-1', type: 'Treino' as const, date: '2026-07-15', local: 'Casa' };
}
