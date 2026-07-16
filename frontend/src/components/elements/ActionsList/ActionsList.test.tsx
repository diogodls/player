import { fireEvent, render, screen } from '@testing-library/react';
import ActionsList from './ActionsList';

describe('ActionsList', () => {
  it('renders backend groups without creating subgroups', () => {
    const handleActionClick = vi.fn();
    const groups = [{
      key: 'DEFENSIVE_ORGANIZATION',
      title: 'Organização defensiva',
      order: 1,
      actions: [{
        id: 'action-mbrp',
        key: 'MBRP',
        name: 'Recuperação de bola em marcação baixa',
        impact: 'POSITIVE' as const,
        order: 1,
      }],
    }];

    render(<ActionsList groups={groups} handleActionClick={handleActionClick}/>);

    expect(screen.getByText('Organização defensiva')).toBeInTheDocument();
    expect(screen.queryByText('Marcação baixa')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Recuperação de bola/ }));
    expect(handleActionClick).toHaveBeenCalledWith(groups[0].actions[0], 'Organização defensiva');
  });
});
